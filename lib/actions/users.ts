"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureRole } from "@/lib/actions/guard";
import { syncUserRoles } from "@/lib/actions/user-roles";
import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/actions/types";
import { createUserSchema, updateUserSchema } from "@/lib/validations";

export async function createUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const guard = await ensureRole(["superadmin"]);
  if (!guard.ok) return errorState("Non autorizzato.");

  const parsed = createUserSchema.safeParse({
    ...Object.fromEntries(formData),
    role_ids: formData.getAll("role_ids"),
  });
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const { data: selectedRoles } = await admin
    .from("roles")
    .select("id, name")
    .in("id", parsed.data.role_ids);

  if ((selectedRoles ?? []).length !== parsed.data.role_ids.length) {
    return errorState("Uno o piu ruoli non trovati.");
  }

  const roleNames = selectedRoles!.map((r) => r.name);
  const primaryRoleName = roleNames[0]!;

  const { data: created, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: { role: primaryRoleName, roles: roleNames },
    user_metadata: {
      name: parsed.data.name,
      surname: parsed.data.surname,
      phone: parsed.data.phone,
    },
  });

  if (error || !created.user) {
    return errorState(`Errore nella creazione: ${error?.message ?? "sconosciuto"}`);
  }

  const sync = await syncUserRoles(admin, created.user.id, roleNames, primaryRoleName);
  if (sync.error) {
    await admin.auth.admin.deleteUser(created.user.id);
    return errorState(`Errore ruoli: ${sync.error}`);
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

  const parsed = updateUserSchema.safeParse({
    ...Object.fromEntries(formData),
    role_ids: formData.getAll("role_ids"),
  });
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  if (!parsed.data.role_ids.includes(parsed.data.primary_role_id)) {
    return errorState("Il ruolo primario deve essere tra i ruoli selezionati.");
  }

  const admin = createAdminClient();
  const { data: selectedRoles } = await admin
    .from("roles")
    .select("id, name")
    .in("id", parsed.data.role_ids);

  const primaryRole = selectedRoles?.find((r) => r.id === parsed.data.primary_role_id);
  if (!primaryRole || (selectedRoles ?? []).length !== parsed.data.role_ids.length) {
    return errorState("Ruoli non validi.");
  }

  const roleNames = selectedRoles!.map((r) => r.name);

  const sync = await syncUserRoles(
    admin,
    parsed.data.id,
    roleNames,
    primaryRole.name,
  );
  if (sync.error) return errorState(`Errore ruoli: ${sync.error}`);

  const { error } = await admin
    .from("users")
    .update({
      name: parsed.data.name,
      surname: parsed.data.surname,
      phone: parsed.data.phone,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);

  if (error) return errorState(`Errore aggiornamento: ${error.message}`);

  revalidatePath("/utenti");
  revalidatePath("/operatori-partner");
  revalidatePath("/tesserati");
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
