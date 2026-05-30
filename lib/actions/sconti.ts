"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClaims } from "@/lib/auth";
import { ensureRole } from "@/lib/actions/guard";
import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/actions/types";
import {
  discountSchema,
  updateDiscountSchema,
  assignDiscountSchema,
} from "@/lib/validations";

export async function createDiscount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = discountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const claims = await getClaims();
  const supabase = await createClient();
  const { error } = await supabase.from("discounts").insert({
    ...parsed.data,
    created_by: claims?.sub ?? null,
  });
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/sconti");
  return successState("Sconto creato.");
}

export async function updateDiscount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = updateDiscountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const { id, ...values } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("discounts").update(values).eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/sconti");
  return successState("Sconto aggiornato.");
}

export async function deleteDiscount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return errorState("ID mancante.");

  const supabase = await createClient();
  const { error } = await supabase.from("discounts").delete().eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/sconti");
  return successState("Sconto eliminato.");
}

export async function assignDiscount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = assignDiscountSchema.safeParse({
    discount_id: formData.get("discount_id"),
    socio_ids: formData.getAll("socio_ids"),
  });
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const claims = await getClaims();
  const supabase = await createClient();

  const { error } = await supabase.from("socio_discounts").upsert(
    parsed.data.socio_ids.map((socio_id) => ({
      socio_id,
      discount_id: parsed.data.discount_id,
      assigned_by: claims?.sub ?? null,
      status: "active" as const,
    })),
    { onConflict: "socio_id,discount_id", ignoreDuplicates: true },
  );
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/sconti");
  revalidatePath(`/sconti/${parsed.data.discount_id}`);
  return successState("Sconto assegnato ai soci selezionati.");
}

export async function removeAssignment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return errorState("ID mancante.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("socio_discounts")
    .delete()
    .eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/sconti");
  return successState("Assegnazione rimossa.");
}
