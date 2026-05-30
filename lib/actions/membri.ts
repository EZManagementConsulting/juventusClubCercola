"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureRole } from "@/lib/actions/guard";
import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/actions/types";
import { createMemberSchema, updateMemberSchema } from "@/lib/validations";

export async function createMember(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = createMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: { role: "membro" },
    user_metadata: {
      name: parsed.data.name,
      surname: parsed.data.surname,
      phone: parsed.data.phone,
    },
  });
  if (error) return errorState(`Errore nella creazione: ${error.message}`);

  revalidatePath("/membri");
  return successState("Membro creato con successo.");
}

export async function updateMember(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = updateMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({
      name: parsed.data.name,
      surname: parsed.data.surname,
      phone: parsed.data.phone,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/membri");
  return successState("Membro aggiornato.");
}

export async function deleteMember(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return errorState("ID mancante.");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/membri");
  return successState("Membro eliminato.");
}
