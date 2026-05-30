import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WEB_ROLES, type AppRole } from "@/lib/constants";

export type CurrentUser = {
  id: string;
  email: string | null;
  name: string | null;
  surname: string | null;
  role: AppRole | null;
};

type Claims = Record<string, unknown> & {
  sub?: string;
  email?: string;
  app_metadata?: { role?: AppRole };
};

// Legge i claim dal JWT (validato lato server con getClaims()).
export async function getClaims(): Promise<Claims | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return (data?.claims as Claims | undefined) ?? null;
}

export function roleFromClaims(claims: Claims | null): AppRole | null {
  return claims?.app_metadata?.role ?? null;
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
  const role = roleFromClaims(claims);
  if (!role || !WEB_ROLES.includes(role)) {
    redirect("/login?error=forbidden");
  }
  return { claims, role: role as AppRole };
}

// Garantisce che il ruolo corrente sia tra quelli consentiti per la pagina.
export async function requireRole(allowed: AppRole[]): Promise<AppRole> {
  const { role } = await requireWebAccess();
  if (!allowed.includes(role)) {
    redirect("/dashboard");
  }
  return role;
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

  return {
    id: claims.sub,
    email: data?.email ?? claims.email ?? null,
    name: data?.name ?? null,
    surname: data?.surname ?? null,
    role: roleFromClaims(claims),
  };
}
