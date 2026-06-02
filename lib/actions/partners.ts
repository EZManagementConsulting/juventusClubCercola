"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureRole } from "@/lib/actions/guard";
import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/actions/types";
import { partnerSchema, updatePartnerSchema } from "@/lib/validations";

export async function createPartner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = partnerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("partners").insert({
    name: parsed.data.name,
    description: parsed.data.description,
    category: parsed.data.category,
    phone: parsed.data.phone,
    address: parsed.data.address,
    website: parsed.data.website,
    status: parsed.data.status,
  });

  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/partner");
  return successState("Partner creato.");
}

export async function updatePartner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = updatePartnerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("partners")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category,
      phone: parsed.data.phone,
      address: parsed.data.address,
      website: parsed.data.website,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);

  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/partner");
  revalidatePath(`/partner/${parsed.data.id}`);
  return successState("Partner aggiornato.");
}

export async function deletePartner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return errorState("ID mancante.");

  const admin = createAdminClient();
  const { error } = await admin.from("partners").delete().eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/partner");
  return successState("Partner eliminato.");
}
