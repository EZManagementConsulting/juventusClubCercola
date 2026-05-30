"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureRole } from "@/lib/actions/guard";
import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/actions/types";
import { createSocioSchema, updateSocioSchema } from "@/lib/validations";

function generateCodiceSocio() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `SC-${n}`;
}

export async function createSocio(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = createSocioSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: { role: "socio" },
    user_metadata: {
      name: parsed.data.name,
      surname: parsed.data.surname,
      phone: parsed.data.phone,
    },
  });

  if (authError || !created.user) {
    return errorState(`Errore nella creazione: ${authError?.message ?? "sconosciuto"}`);
  }

  const { error: profileError } = await admin.from("socio_profiles").insert({
    user_id: created.user.id,
    codice_socio: parsed.data.codice_socio ?? generateCodiceSocio(),
    card_number: parsed.data.card_number,
    membership_start: parsed.data.membership_start,
    membership_expiry: parsed.data.membership_expiry,
  });

  if (profileError) {
    // Rollback dell'utente auth se il profilo non viene creato.
    await admin.auth.admin.deleteUser(created.user.id);
    return errorState(`Errore profilo socio: ${profileError.message}`);
  }

  revalidatePath("/soci");
  return successState("Socio creato con successo.");
}

export async function updateSocio(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = updateSocioSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();

  const { error: userError } = await admin
    .from("users")
    .update({
      name: parsed.data.name,
      surname: parsed.data.surname,
      phone: parsed.data.phone,
    })
    .eq("id", parsed.data.user_id);
  if (userError) return errorState(`Errore: ${userError.message}`);

  const { error: profileError } = await admin
    .from("socio_profiles")
    .update({
      codice_socio: parsed.data.codice_socio,
      card_number: parsed.data.card_number,
      membership_start: parsed.data.membership_start,
      membership_expiry: parsed.data.membership_expiry,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);
  if (profileError) return errorState(`Errore: ${profileError.message}`);

  revalidatePath("/soci");
  return successState("Socio aggiornato.");
}

export async function toggleSocioStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const id = String(formData.get("id") ?? "");
  const current = String(formData.get("status") ?? "");
  if (!id) return errorState("ID mancante.");

  const next = current === "active" ? "inactive" : "active";
  const admin = createAdminClient();
  const { error } = await admin
    .from("socio_profiles")
    .update({ status: next })
    .eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/soci");
  return successState(next === "active" ? "Socio attivato." : "Socio disattivato.");
}

export async function regenerateQrToken(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return errorState("ID mancante.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("socio_profiles")
    .update({ qr_token: crypto.randomUUID() })
    .eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/soci");
  return successState("QR token rigenerato.");
}

export async function deleteSocio(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const userId = String(formData.get("id") ?? "");
  if (!userId) return errorState("ID mancante.");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/soci");
  return successState("Socio eliminato.");
}
