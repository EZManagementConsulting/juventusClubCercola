import { z } from "zod";

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
  role_id: z.string().uuid("Ruolo non valido"),
});

export const updateUserSchema = z.object({
  id: z.string().uuid(),
  name: optionalString,
  surname: optionalString,
  phone: optionalString,
  role_id: z.string().uuid("Ruolo non valido"),
  status: z.enum(["active", "inactive"]),
});

// ---------- Soci ----------
export const createSocioSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  name: z.string().trim().min(1, "Il nome e obbligatorio"),
  surname: z.string().trim().min(1, "Il cognome e obbligatorio"),
  phone: optionalString,
  codice_socio: optionalString,
  card_number: optionalString,
  membership_start: optionalDate,
  membership_expiry: optionalDate,
});

export const updateSocioSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().trim().min(1, "Il nome e obbligatorio"),
  surname: z.string().trim().min(1, "Il cognome e obbligatorio"),
  phone: optionalString,
  codice_socio: z.string().trim().min(1, "Il codice socio e obbligatorio"),
  card_number: optionalString,
  membership_start: optionalDate,
  membership_expiry: optionalDate,
  status: z.enum(["active", "inactive"]),
});

// ---------- Membri ----------
export const createMemberSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  name: z.string().trim().min(1, "Il nome e obbligatorio"),
  surname: z.string().trim().min(1, "Il cognome e obbligatorio"),
  phone: optionalString,
});

export const updateMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Il nome e obbligatorio"),
  surname: z.string().trim().min(1, "Il cognome e obbligatorio"),
  phone: optionalString,
  status: z.enum(["active", "inactive"]),
});

// ---------- Sconti ----------
export const discountSchema = z.object({
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
});

export const updateDiscountSchema = discountSchema.extend({
  id: z.string().uuid(),
});

// ---------- Assegnazione sconto ----------
export const assignDiscountSchema = z.object({
  discount_id: z.string().uuid("Sconto non valido"),
  socio_ids: z.array(z.string().uuid()).min(1, "Seleziona almeno un socio"),
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
