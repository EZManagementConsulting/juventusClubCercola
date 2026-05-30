import "server-only";
import { getClaims, roleFromClaims } from "@/lib/auth";
import type { AppRole } from "@/lib/constants";

// Verifica il ruolo del chiamante lato server (difesa in profondita oltre la RLS).
export async function ensureRole(allowed: AppRole[]): Promise<
  { ok: true; role: AppRole } | { ok: false }
> {
  const claims = await getClaims();
  const role = roleFromClaims(claims);
  if (!role || !allowed.includes(role)) {
    return { ok: false };
  }
  return { ok: true, role };
}
