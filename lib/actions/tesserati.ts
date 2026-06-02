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
import { createClient } from "@/lib/supabase/server";
import { getSeasonLabel } from "@/lib/membership-season";
import {
  createSocioSchema,
  renewClubMembershipSchema,
  updateSocioSchema,
} from "@/lib/validations";

function generateCodiceSocio() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `SC-${n}`;
}

function parseTesseratoForm(formData: FormData) {
  const raw = Object.fromEntries(formData);
  return {
    ...raw,
    also_operatore_partner: parseCheckbox(formData.get("also_operatore_partner")),
  };
}

export async function createTesserato(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = createSocioSchema.safeParse(parseTesseratoForm(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const roleNames = parsed.data.also_operatore_partner
    ? ["tesserato", "operatore_partner"]
    : ["tesserato"];
  const admin = createAdminClient();

  const card = await generateSectionCardNumber(admin, parsed.data.section_id);
  if (card.error || !card.cardNumber) {
    return errorState(card.error ?? "Errore generazione tessera.");
  }

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: { role: "tesserato", roles: roleNames },
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
    return errorState(`Errore profilo tesserato: ${profileError.message}`);
  }

  const sync = await syncUserRoles(admin, userId, roleNames, "tesserato");
  if (sync.error) {
    await admin.auth.admin.deleteUser(userId);
    return errorState(`Errore ruoli: ${sync.error}`);
  }

  revalidatePath("/tesserati");
  revalidatePath("/sezioni");
  if (parsed.data.also_operatore_partner) revalidatePath("/operatori-partner");
  return successState(`Tesserato creato. Tessera: ${card.cardNumber}`);
}

export async function updateTesserato(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = updateSocioSchema.safeParse(parseTesseratoForm(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const roleNames = parsed.data.also_operatore_partner
    ? ["tesserato", "operatore_partner"]
    : ["tesserato"];

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
    .from("club_member_profiles")
    .update({
      codice_socio: parsed.data.codice_socio,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);
  if (profileError) return errorState(`Errore: ${profileError.message}`);

  const sync = await syncUserRoles(admin, parsed.data.user_id, roleNames, "tesserato");
  if (sync.error) return errorState(`Errore ruoli: ${sync.error}`);

  revalidatePath("/tesserati");
  revalidatePath("/operatori-partner");
  return successState("Tesserato aggiornato.");
}

export async function renewClubMembership(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const raw = Object.fromEntries(formData);
  const parsed = renewClubMembershipSchema.safeParse({
    ...raw,
    fee_paid: parseCheckbox(formData.get("fee_paid")),
  });
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("renew_club_membership", {
    p_profile_id: parsed.data.profile_id,
    p_season_start_year: parsed.data.season_start_year,
    p_fee_paid: parsed.data.fee_paid,
    p_note: parsed.data.note ?? undefined,
  });

  if (error) {
    if (error.message.includes("not_authorized")) {
      return errorState("Non autorizzato a rinnovare la tessera.");
    }
    if (error.message.includes("profile_not_found")) {
      return errorState("Profilo tesserato non trovato.");
    }
    return errorState(`Errore rinnovo: ${error.message}`);
  }

  const payload = data as {
    season_label?: string;
    membership_expiry?: string;
  } | null;
  const season = payload?.season_label ?? getSeasonLabel(parsed.data.season_start_year);
  const expiry = payload?.membership_expiry ?? "";

  revalidatePath("/tesserati");
  revalidatePath("/operatori-partner");
  return successState(
    expiry
      ? `Tessera rinnovata per la stagione ${season} (scadenza ${expiry}).`
      : `Tessera rinnovata per la stagione ${season}.`,
  );
}

export async function toggleTesseratoStatus(
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
    .from("club_member_profiles")
    .update({ status: next })
    .eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/tesserati");
  return successState(next === "active" ? "Tesserato attivato." : "Tesserato disattivato.");
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
    .from("club_member_profiles")
    .update({ qr_token: crypto.randomUUID() })
    .eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/tesserati");
  revalidatePath("/operatori-partner");
  return successState("QR token rigenerato.");
}

export async function deleteTesserato(
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

  revalidatePath("/tesserati");
  revalidatePath("/operatori-partner");
  revalidatePath("/sezioni");
  return successState("Tesserato eliminato.");
}
