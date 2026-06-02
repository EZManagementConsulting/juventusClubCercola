import "server-only";
import { getClaims, hasAnyRole, roleFromClaims } from "@/lib/auth";
import type { AppRole } from "@/lib/constants";

// Verifica il ruolo del chiamante lato server (difesa in profondita oltre la RLS).
export async function ensureRole(allowed: AppRole[]): Promise<
  { ok: true; role: AppRole } | { ok: false }
> {
  const claims = await getClaims();
  if (!hasAnyRole(claims, allowed)) {
    return { ok: false };
  }
  const role = roleFromClaims(claims);
  if (!role) {
    return { ok: false };
  }
  return { ok: true, role };
}
