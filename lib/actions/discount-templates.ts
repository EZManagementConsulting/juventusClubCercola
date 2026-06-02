"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureRole } from "@/lib/actions/guard";
import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/actions/types";
import {
  discountTemplateSchema,
  updateDiscountTemplateSchema,
} from "@/lib/validations";

export async function createDiscountTemplate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = discountTemplateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("discount_templates").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    type: parsed.data.type,
    value: parsed.data.value,
    status: parsed.data.status,
  });

  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/catalogo-sconti");
  revalidatePath("/partner");
  return successState("Tipologia sconto creata.");
}

export async function updateDiscountTemplate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = updateDiscountTemplateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("discount_templates")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      value: parsed.data.value,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);

  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/catalogo-sconti");
  return successState("Tipologia aggiornata.");
}

export async function deleteDiscountTemplate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return errorState("ID mancante.");

  const admin = createAdminClient();
  const { count } = await admin
    .from("partner_offers")
    .select("*", { count: "exact", head: true })
    .eq("discount_template_id", id);

  if ((count ?? 0) > 0) {
    return errorState("Impossibile eliminare: usata da una o più offerte partner.");
  }

  const { error } = await admin.from("discount_templates").delete().eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/catalogo-sconti");
  return successState("Tipologia eliminata.");
}
