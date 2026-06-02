import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeAppRole, normalizeAppRoles, WEB_ROLES, type AppRole } from "@/lib/constants";

export type CurrentUser = {
  id: string;
  email: string | null;
  name: string | null;
  surname: string | null;
  role: AppRole | null;
  roles: AppRole[];
};

type Claims = Record<string, unknown> & {
  sub?: string;
  email?: string;
  app_metadata?: { role?: AppRole; roles?: AppRole[] };
};

// Legge i claim dal JWT (validato lato server con getClaims()).
export async function getClaims(): Promise<Claims | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return (data?.claims as Claims | undefined) ?? null;
}

export function rolesFromClaims(claims: Claims | null): AppRole[] {
  const roles = claims?.app_metadata?.roles;
  if (Array.isArray(roles)) {
    return normalizeAppRoles(
      (roles as unknown[]).filter((r): r is string => typeof r === "string"),
    );
  }
  const single = claims?.app_metadata?.role;
  if (typeof single === "string") {
    const role = normalizeAppRole(single);
    return role ? [role] : [];
  }
  return [];
}

export function roleFromClaims(claims: Claims | null): AppRole | null {
  return rolesFromClaims(claims)[0] ?? claims?.app_metadata?.role ?? null;
}

export function hasAnyRole(claims: Claims | null, allowed: AppRole[]): boolean {
  const roles = rolesFromClaims(claims);
  return roles.some((role) => allowed.includes(role));
}

// Restituisce i claim o reindirizza al login se non autenticato.
export async function requireAuth(): Promise<Claims> {
  const claims = await getClaims();
  if (!claims) redirect("/login");
  return claims;
}

// Garantisce l'accesso al pannello web (solo superadmin/admin).
export async function requireWebAccess(): Promise<{ claims: Claims; role: AppRole }> {
  const claims = await requireAuth();
  const roles = rolesFromClaims(claims);
  const webRole = roles.find((r) => WEB_ROLES.includes(r));
  if (!webRole) {
    redirect("/login?error=forbidden");
  }
  return { claims, role: webRole };
}

// Garantisce che il ruolo corrente sia tra quelli consentiti per la pagina.
export async function requireRole(allowed: AppRole[]): Promise<AppRole> {
  const { claims, role } = await requireWebAccess();
  if (!hasAnyRole(claims, allowed)) {
    redirect("/dashboard");
  }
  return role;
}

/** Solo superadmin: gestione sconti MVP legacy (`/sconti`). Gli admin vanno su Partner. */
export async function requireLegacyScontiAccess(): Promise<void> {
  await requireRole(["superadmin", "admin"]);
  const claims = await getClaims();
  if (!hasAnyRole(claims, ["superadmin"])) {
    redirect("/partner");
  }
}

export function canAccessLegacySconti(roles: AppRole[]): boolean {
  return roles.includes("superadmin");
}

// Profilo completo dell'utente corrente (per header, ecc.).
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const claims = await getClaims();
  if (!claims?.sub) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, email, name, surname")
    .eq("id", claims.sub)
    .maybeSingle();

  const roles = rolesFromClaims(claims);

  return {
    id: claims.sub,
    email: data?.email ?? claims.email ?? null,
    name: data?.name ?? null,
    surname: data?.surname ?? null,
    role: roleFromClaims(claims),
    roles,
  };
}
