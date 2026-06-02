"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureRole } from "@/lib/actions/guard";
import { generateSectionCardNumber } from "@/lib/actions/card-number";
import { parseCheckbox, syncUserRoles } from "@/lib/actions/user-roles";
import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/actions/types";
import { createMemberSchema, updateMemberSchema } from "@/lib/validations";

function generateCodiceSocio() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `SC-${n}`;
}

function parseMemberForm(formData: FormData) {
  const raw = Object.fromEntries(formData);
  return {
    ...raw,
    also_tesserato: parseCheckbox(formData.get("also_tesserato")),
  };
}

export async function createOperatorePartner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = createMemberSchema.safeParse(parseMemberForm(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const roleNames = parsed.data.also_tesserato
    ? ["operatore_partner", "tesserato"]
    : ["operatore_partner"];
  const admin = createAdminClient();

  const card = await generateSectionCardNumber(admin, parsed.data.section_id);
  if (card.error || !card.cardNumber) {
    return errorState(card.error ?? "Errore generazione tessera.");
  }

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: { role: "operatore_partner", roles: roleNames },
    user_metadata: {
      name: parsed.data.name,
      surname: parsed.data.surname,
      phone: parsed.data.phone,
    },
  });

  if (authError || !created.user) {
    return errorState(`Errore nella creazione: ${authError?.message ?? "sconosciuto"}`);
  }

  const userId = created.user.id;

  const { error: profileError } = await admin.from("club_member_profiles").insert({
    user_id: userId,
    section_id: parsed.data.section_id,
    codice_socio: parsed.data.codice_socio ?? generateCodiceSocio(),
    card_number: card.cardNumber,
    membership_start: parsed.data.membership_start,
    membership_expiry: parsed.data.membership_expiry,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return errorState(`Errore profilo tessera: ${profileError.message}`);
  }

  const sync = await syncUserRoles(admin, userId, roleNames, "operatore_partner");
  if (sync.error) {
    await admin.auth.admin.deleteUser(userId);
    return errorState(`Errore ruoli: ${sync.error}`);
  }

  revalidatePath("/operatori-partner");
  revalidatePath("/sezioni");
  if (parsed.data.also_tesserato) revalidatePath("/tesserati");
  return successState(`Operatore partner creato. Tessera: ${card.cardNumber}`);
}

export async function updateOperatorePartner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = updateMemberSchema.safeParse(parseMemberForm(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const roleNames = parsed.data.also_tesserato
    ? ["operatore_partner", "tesserato"]
    : ["operatore_partner"];

  const { error: userError } = await admin
    .from("users")
    .update({
      name: parsed.data.name,
      surname: parsed.data.surname,
      phone: parsed.data.phone,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);
  if (userError) return errorState(`Errore: ${userError.message}`);

  const profilePayload = {
    codice_socio: parsed.data.codice_socio ?? generateCodiceSocio(),
    status: parsed.data.status,
  };

  if (parsed.data.profile_id) {
    const { error: profileError } = await admin
      .from("club_member_profiles")
      .update(profilePayload)
      .eq("id", parsed.data.profile_id);
    if (profileError) return errorState(`Errore tessera: ${profileError.message}`);
  } else {
    const card = await generateSectionCardNumber(admin, parsed.data.section_id);
    if (card.error || !card.cardNumber) {
      return errorState(card.error ?? "Errore generazione tessera.");
    }

    const { error: profileError } = await admin.from("club_member_profiles").insert({
      user_id: parsed.data.id,
      section_id: parsed.data.section_id,
      card_number: card.cardNumber,
      ...profilePayload,
    });
    if (profileError) return errorState(`Errore tessera: ${profileError.message}`);
  }

  const sync = await syncUserRoles(admin, parsed.data.id, roleNames, "operatore_partner");
  if (sync.error) return errorState(`Errore ruoli: ${sync.error}`);

  revalidatePath("/operatori-partner");
  revalidatePath("/tesserati");
  revalidatePath("/sezioni");
  return successState("Operatore partner aggiornato.");
}

export async function deleteOperatorePartner(
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

  revalidatePath("/operatori-partner");
  revalidatePath("/tesserati");
  revalidatePath("/sezioni");
  return successState("Operatore partner eliminato.");
}
