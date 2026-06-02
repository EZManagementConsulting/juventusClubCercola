"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureRole } from "@/lib/actions/guard";
import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/actions/types";
import { sectionSchema, updateSectionSchema } from "@/lib/validations";

export async function createSection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = sectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("club_sections").insert({
    name: parsed.data.name,
    code: parsed.data.code,
  });

  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/sezioni");
  revalidatePath("/operatori-partner");
  revalidatePath("/tesserati");
  return successState("Sezione creata.");
}

export async function updateSection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin", "admin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const parsed = updateSectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("club_sections")
    .update({
      name: parsed.data.name,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);

  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/sezioni");
  return successState("Sezione aggiornata.");
}

export async function deleteSection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin"])).ok) {
    return errorState("Non autorizzato.");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return errorState("ID mancante.");

  const admin = createAdminClient();

  const { count } = await admin
    .from("club_member_profiles")
    .select("id", { count: "exact", head: true })
    .eq("section_id", id);

  if ((count ?? 0) > 0) {
    return errorState("Impossibile eliminare: ci sono tessere associate a questa sezione.");
  }

  const { error } = await admin.from("club_sections").delete().eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/sezioni");
  return successState("Sezione eliminata.");
}
