import type {
  DiscountStatus,
  DiscountType,
  SocioDiscountStatus,
} from "@/lib/database.types";

export type { AppRole } from "@/lib/app-roles";
export { APP_ROLES, LEGACY_ROLE_ALIASES, ROLE_LABELS, normalizeAppRole, normalizeAppRoles } from "@/lib/app-roles";
import type { AppRole } from "@/lib/app-roles";

// Ruoli che possono accedere al pannello web amministrativo.
export const WEB_ROLES: AppRole[] = ["superadmin", "admin"];

// Voci di navigazione della dashboard, filtrate per ruolo.
export type NavItem = {
  href: string;
  label: string;
  icon: string; // nome icona lucide-react
  roles: AppRole[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Panoramica", icon: "LayoutDashboard", roles: ["superadmin", "admin"] },
  { href: "/utenti", label: "Utenti", icon: "Users", roles: ["superadmin"] },
  { href: "/ruoli", label: "Ruoli", icon: "ShieldCheck", roles: ["superadmin"] },
  { href: "/permessi", label: "Permessi", icon: "KeyRound", roles: ["superadmin"] },
  { href: "/tesserati", label: "Tesserati", icon: "IdCard", roles: ["superadmin", "admin"] },
  {
    href: "/operatori-partner",
    label: "Operatori partner",
    icon: "UserCog",
    roles: ["superadmin", "admin"],
  },
  { href: "/sezioni", label: "Sezioni", icon: "MapPin", roles: ["superadmin", "admin"] },
  { href: "/catalogo-sconti", label: "Catalogo sconti", icon: "Layers", roles: ["superadmin", "admin"] },
  { href: "/partner", label: "Partner", icon: "Store", roles: ["superadmin", "admin"] },
  {
    href: "/sconti",
    label: "Sconti MVP (legacy)",
    icon: "Tag",
    roles: ["superadmin"],
  },
  { href: "/storico", label: "Storico sconti", icon: "History", roles: ["superadmin", "admin"] },
  { href: "/statistiche", label: "Statistiche", icon: "BarChart3", roles: ["superadmin", "admin"] },
  { href: "/impostazioni", label: "Impostazioni", icon: "Settings", roles: ["superadmin"] },
];

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  percentage: "Percentuale",
  fixed_amount: "Importo fisso",
  custom: "Personalizzato",
};

export const DISCOUNT_STATUS_LABELS: Record<DiscountStatus, string> = {
  active: "Attivo",
  inactive: "Inattivo",
  expired: "Scaduto",
  cancelled: "Annullato",
};

export const SOCIO_DISCOUNT_STATUS_LABELS: Record<SocioDiscountStatus, string> = {
  active: "Attivo",
  used: "Usato",
  expired: "Scaduto",
  cancelled: "Annullato",
};

export const USER_STATUS_LABELS: Record<"active" | "inactive", string> = {
  active: "Attivo",
  inactive: "Disattivato",
};

export const TEMPLATE_STATUS_LABELS: Record<"active" | "inactive", string> = {
  active: "Attivo",
  inactive: "Inattivo",
};

export const PARTNER_STATUS_LABELS: Record<"active" | "inactive", string> = {
  active: "Attivo",
  inactive: "Inattivo",
};

export const PARTNER_CATEGORY_LABELS: Record<string, string> = {
  ristorazione: "Ristorazione",
  sport: "Sport",
  abbigliamento: "Abbigliamento",
  benessere: "Benessere",
  altro: "Altro",
};
