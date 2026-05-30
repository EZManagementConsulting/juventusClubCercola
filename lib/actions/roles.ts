"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureRole } from "@/lib/actions/guard";
import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/actions/types";
import { roleSchema } from "@/lib/validations";

export async function createRole(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin"])).ok) return errorState("Non autorizzato.");

  const parsed = roleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("roles").insert(parsed.data);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/ruoli");
  return successState("Ruolo creato.");
}

export async function updateRole(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin"])).ok) return errorState("Non autorizzato.");

  const id = String(formData.get("id") ?? "");
  const parsed = roleSchema.safeParse(Object.fromEntries(formData));
  if (!id) return errorState("ID mancante.");
  if (!parsed.success) {
    return errorState(parsed.error.issues[0]?.message ?? "Dati non validi");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("roles").update(parsed.data).eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/ruoli");
  return successState("Ruolo aggiornato.");
}

export async function deleteRole(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin"])).ok) return errorState("Non autorizzato.");

  const id = String(formData.get("id") ?? "");
  if (!id) return errorState("ID mancante.");

  const supabase = await createClient();
  const { error } = await supabase.from("roles").delete().eq("id", id);
  if (error) return errorState(`Errore: ${error.message}`);

  revalidatePath("/ruoli");
  return successState("Ruolo eliminato.");
}

export async function setRolePermissions(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await ensureRole(["superadmin"])).ok) return errorState("Non autorizzato.");

  const roleId = String(formData.get("role_id") ?? "");
  if (!roleId) return errorState("Ruolo mancante.");
  const permissionIds = formData.getAll("permission_ids").map(String);

  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId);
  if (deleteError) return errorState(`Errore: ${deleteError.message}`);

  if (permissionIds.length > 0) {
    const { error: insertError } = await supabase
      .from("role_permissions")
      .insert(
        permissionIds.map((permission_id) => ({
          role_id: roleId,
          permission_id,
        })),
      );
    if (insertError) return errorState(`Errore: ${insertError.message}`);
  }

  revalidatePath("/ruoli");
  return successState("Permessi del ruolo aggiornati.");
}
