import { z } from "zod";
import { parseBusinessHours, type BusinessHoursConfig } from "@/lib/business-hours";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

// ---------- Utenti / Admin ----------
export const createUserSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  name: optionalString,
  surname: optionalString,
  phone: optionalString,
  role_ids: z.array(z.string().uuid()).min(1, "Seleziona almeno un ruolo"),
});

export const updateUserSchema = z.object({
  id: z.string().uuid(),
  name: optionalString,
  surname: optionalString,
  phone: optionalString,
  role_ids: z.array(z.string().uuid()).min(1, "Seleziona almeno un ruolo"),
  primary_role_id: z.string().uuid("Ruolo primario non valido"),
  status: z.enum(["active", "inactive"]),
});

// ---------- Sezioni club ----------
export const sectionSchema = z.object({
  name: z.string().trim().min(1, "Il nome e obbligatorio"),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Minimo 2 caratteri")
    .max(10, "Massimo 10 caratteri")
    .regex(/^[A-Z0-9]+$/, "Solo lettere maiuscole e numeri"),
});

export const updateSectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Il nome e obbligatorio"),
  status: z.enum(["active", "inactive"]),
});

// ---------- Soci ----------
export const createSocioSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  name: z.string().trim().min(1, "Il nome e obbligatorio"),
  surname: z.string().trim().min(1, "Il cognome e obbligatorio"),
  phone: optionalString,
  section_id: z.string().uuid("Seleziona una sezione"),
  codice_socio: optionalString,
  membership_start: optionalDate,
  membership_expiry: optionalDate,
  also_operatore_partner: z.boolean().optional().default(false),
});

export const updateSocioSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  section_id: z.string().uuid(),
  name: z.string().trim().min(1, "Il nome e obbligatorio"),
  surname: z.string().trim().min(1, "Il cognome e obbligatorio"),
  phone: optionalString,
  codice_socio: z.string().trim().min(1, "Il codice socio e obbligatorio"),
  status: z.enum(["active", "inactive"]),
  also_operatore_partner: z.boolean().optional().default(false),
});

export const renewClubMembershipSchema = z.object({
  profile_id: z.string().uuid("Profilo non valido"),
  season_start_year: z.coerce
    .number()
    .int()
    .min(2000, "Anno stagione non valido")
    .max(2100, "Anno stagione non valido"),
  fee_paid: z.boolean().optional().default(true),
  note: optionalString,
});

// ---------- Membri ----------
export const createMemberSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  name: z.string().trim().min(1, "Il nome e obbligatorio"),
  surname: z.string().trim().min(1, "Il cognome e obbligatorio"),
  phone: optionalString,
  section_id: z.string().uuid("Seleziona una sezione"),
  codice_socio: optionalString,
  membership_start: optionalDate,
  membership_expiry: optionalDate,
  also_tesserato: z.boolean().optional().default(false),
});

export const updateMemberSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid().optional(),
  section_id: z.string().uuid(),
  name: z.string().trim().min(1, "Il nome e obbligatorio"),
  surname: z.string().trim().min(1, "Il cognome e obbligatorio"),
  phone: optionalString,
  codice_socio: optionalString,
  membership_start: optionalDate,
  membership_expiry: optionalDate,
  status: z.enum(["active", "inactive"]),
  also_tesserato: z.boolean().optional().default(false),
});

// ---------- Sconti ----------
const optionalCoordinate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? Number(v) : null))
  .refine((v) => v === null || !Number.isNaN(v), "Coordinate non valide");

function parseBusinessHoursField(raw: unknown): BusinessHoursConfig | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const config = parseBusinessHours(JSON.parse(raw));
    return config.slots.length > 0 ? config : null;
  } catch {
    return null;
  }
}

const discountBusinessFields = {
  phone: optionalString,
  address: optionalString,
  website: optionalString,
  latitude: optionalCoordinate.refine(
    (v) => v === null || (v >= -90 && v <= 90),
    "Latitudine deve essere tra -90 e 90",
  ),
  longitude: optionalCoordinate.refine(
    (v) => v === null || (v >= -180 && v <= 180),
    "Longitudine deve essere tra -180 e 180",
  ),
  business_hours_json: z
    .string()
    .optional()
    .transform((v) => parseBusinessHoursField(v)),
};

const discountFieldsSchema = z
  .object({
    title: z.string().trim().min(1, "Il titolo e obbligatorio"),
    description: optionalString,
    type: z.enum(["percentage", "fixed_amount", "custom"]),
    value: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? Number(v) : null))
      .refine((v) => v === null || !Number.isNaN(v), "Valore non valido"),
    start_date: optionalDate,
    expiry_date: optionalDate,
    usage_limit: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? Number.parseInt(v, 10) : null))
      .refine((v) => v === null || (!Number.isNaN(v) && v >= 0), "Limite non valido"),
    status: z.enum(["active", "inactive", "expired", "cancelled"]),
    ...discountBusinessFields,
  })
  .refine(
    (data) => {
      const hasLat = data.latitude != null;
      const hasLng = data.longitude != null;
      return hasLat === hasLng;
    },
    {
      message: "Inserisci sia latitudine sia longitudine, oppure lascia entrambe vuote",
      path: ["latitude"],
    },
  );

function mapDiscountFormOutput(data: z.infer<typeof discountFieldsSchema>) {
  const { business_hours_json, ...rest } = data;
  return { ...rest, business_hours: business_hours_json };
}

export const discountSchema = discountFieldsSchema.transform(mapDiscountFormOutput);

export const updateDiscountSchema = discountFieldsSchema
  .extend({ id: z.string().uuid() })
  .transform((data) => ({
    ...mapDiscountFormOutput(data),
    id: data.id,
  }));

/** Converte FormData del form sconto in oggetto per Zod. */
export function discountFormDataToObject(formData: FormData): Record<string, string> {
  const entries = Object.fromEntries(formData) as Record<string, string>;
  const businessHoursJson = formData.get("business_hours_json");
  if (typeof businessHoursJson === "string") {
    entries.business_hours_json = businessHoursJson;
  }
  return entries;
}

// ---------- Assegnazione sconto ----------
export const assignDiscountSchema = z.object({
  discount_id: z.string().uuid("Sconto non valido"),
  socio_ids: z.array(z.string().uuid()).min(1, "Seleziona almeno un tesserato"),
});

export const weekdaysUsageRuleSchema = z.object({
  discount_id: z.string().uuid("Sconto non valido"),
  days: z
    .array(z.coerce.number().int().min(1).max(7))
    .min(1, "Seleziona almeno un giorno"),
});

const timeHmRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const timeRangeUsageRuleSchema = z.object({
  discount_id: z.string().uuid("Sconto non valido"),
  start: z.string().regex(timeHmRegex, "Orario inizio non valido (HH:MM)"),
  end: z.string().regex(timeHmRegex, "Orario fine non valido (HH:MM)"),
});

export const excludeDateUsageRuleSchema = z.object({
  discount_id: z.string().uuid("Sconto non valido"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida (AAAA-MM-GG)"),
});

// ---------- Ruoli / Permessi ----------
export const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Il nome e obbligatorio")
    .regex(/^[a-z_]+$/, "Usa solo lettere minuscole e underscore"),
  label: z.string().trim().min(1, "L'etichetta e obbligatoria"),
});

export const permissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Il nome e obbligatorio")
    .regex(/^[a-z_]+$/, "Usa solo lettere minuscole e underscore"),
  label: z.string().trim().min(1, "L'etichetta e obbligatoria"),
});

// ---------- Catalogo sconti (template) ----------
export const discountTemplateSchema = z
  .object({
    title: z.string().trim().min(1, "Il titolo e obbligatorio"),
    description: optionalString,
    type: z.enum(["percentage", "fixed_amount", "custom"]),
    value: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? Number(v) : null))
      .refine((v) => v === null || !Number.isNaN(v), "Valore non valido"),
    status: z.enum(["active", "inactive"]).default("active"),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "custom" && (data.value === null || data.value <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Inserisci un valore valido per questo tipo di sconto",
        path: ["value"],
      });
    }
  });

export const updateDiscountTemplateSchema = discountTemplateSchema.and(
  z.object({ id: z.string().uuid() }),
);

// ---------- Partner ----------
const partnerCategory = z
  .string()
  .optional()
  .transform((v) => (v && v !== "none" ? v : null))
  .pipe(
    z
      .enum(["ristorazione", "sport", "abbigliamento", "benessere", "altro"])
      .nullable(),
  );

export const partnerSchema = z.object({
  name: z.string().trim().min(1, "Il nome e obbligatorio"),
  description: optionalString,
  category: partnerCategory,
  phone: optionalString,
  address: optionalString,
  website: optionalString,
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updatePartnerSchema = partnerSchema.and(z.object({ id: z.string().uuid() }));
