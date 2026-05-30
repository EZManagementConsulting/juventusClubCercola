"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureRole } from "@/lib/actions/guard";
import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/actions/types";
import { createUserSchema, updateUserSchema } from "@/lib/validations";

async function roleNameById(
  admin: ReturnType<typeof createAdminClient>,
  roleId: string,
): Promise<string | null> {
  const { data } = await admin
    .from("roles")
    .select("name")
    .eq("id", roleId)
    .maybeSingle();
  return data?.name ?? null;
}

export async function createUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const guard = await ensureRole(["superadmin"]);
  if (!guard.ok) return errorState("Non autorizzato.");

  const parsed = createUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const roleName = await roleNameById(admin, parsed.data.role_id);
  if (!roleName) return errorState("Ruolo non trovato.");

  const { error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: { role: roleName },
    user_metadata: {
      name: parsed.data.name,
      surname: parsed.data.surname,
      phone: parsed.data.phone,
    },
  });

  if (error) {
    return errorState(`Errore nella creazione: ${error.message}`);
  }

  revalidatePath("/utenti");
  return successState("Utente creato con successo.");
}

export async function updateUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const guard = await ensureRole(["superadmin"]);
  if (!guard.ok) return errorState("Non autorizzato.");

  const parsed = updateUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const roleName = await roleNameById(admin, parsed.data.role_id);
  if (!roleName) return errorState("Ruolo non trovato.");

  // Aggiorna il ruolo anche in app_metadata (usato dal JWT/RLS).
  const { error: authError } = await admin.auth.admin.updateUserById(
    parsed.data.id,
    { app_metadata: { role: roleName } },
  );
  if (authError) {
    return errorState(`Errore aggiornamento ruolo: ${authError.message}`);
  }

  const { error } = await admin
    .from("users")
    .update({
      name: parsed.data.name,
      surname: parsed.data.surname,
      phone: parsed.data.phone,
      role_id: parsed.data.role_id,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);

  if (error) return errorState(`Errore aggiornamento: ${error.message}`);

  revalidatePath("/utenti");
  return successState("Utente aggiornato.");
}

export async function deleteUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const guard = await ensureRole(["superadmin"]);
  if (!guard.ok) return errorState("Non autorizzato.");

  const id = String(formData.get("id") ?? "");
  if (!id) return errorState("ID mancante.");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return errorState(`Errore eliminazione: ${error.message}`);

  revalidatePath("/utenti");
  return successState("Utente eliminato.");
}
