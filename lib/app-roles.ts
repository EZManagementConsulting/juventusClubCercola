/** Ruoli applicativi JWT (italiano). Alias legacy: socio → tesserato, membro → operatore_partner. */
export type AppRole =
  | "superadmin"
  | "admin"
  | "tesserato"
  | "operatore_partner";

export const APP_ROLES: AppRole[] = [
  "superadmin",
  "admin",
  "tesserato",
  "operatore_partner",
];

export const LEGACY_ROLE_ALIASES: Record<string, AppRole> = {
  socio: "tesserato",
  membro: "operatore_partner",
};

export function normalizeAppRole(value: string): AppRole | null {
  const canonical = LEGACY_ROLE_ALIASES[value] ?? value;
  return APP_ROLES.includes(canonical as AppRole) ? (canonical as AppRole) : null;
}

export function normalizeAppRoles(values: string[]): AppRole[] {
  const seen = new Set<AppRole>();
  const out: AppRole[] = [];
  for (const value of values) {
    const role = normalizeAppRole(value);
    if (role && !seen.has(role)) {
      seen.add(role);
      out.push(role);
    }
  }
  return out;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  tesserato: "Tesserato",
  operatore_partner: "Operatore partner",
};
