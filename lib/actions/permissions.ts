"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureRole } from "@/lib/actions/guard";
import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/actions/types";
import { permissionSchema } from "@/lib/validations";

export async function createPermission(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin"])).ok) return errorState("Non autorizzato.");

  const parsed = permissionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("permissions").insert(parsed.data);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/permessi");
  return successState("Permesso creato.");
}

export async function updatePermission(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin"])).ok) return errorState("Non autorizzato.");

  const id = String(formData.get("id") ?? "");
  const parsed = permissionSchema.safeParse(Object.fromEntries(formData));
  if (!id) return errorState("ID mancante.");
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("permissions")
    .update(parsed.data)
    .eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/permessi");
  return successState("Permesso aggiornato.");
}

export async function deletePermission(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin"])).ok) return errorState("Non autorizzato.");

  const id = String(formData.get("id") ?? "");
  if (!id) return errorState("ID mancante.");

  const supabase = await createClient();
  const { error } = await supabase.from("permissions").delete().eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/permessi");
  return successState("Permesso eliminato.");
}
