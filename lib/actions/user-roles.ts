import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export async function roleIdsByNames(
  admin: AdminClient,
  names: string[],
): Promise<Map<string, string>> {
  const { data } = await admin.from("roles").select("id, name").in("name", names);
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    map.set(row.name, row.id);
  }
  return map;
}

/** Sincronizza user_roles, role_id primario e app_metadata nel JWT. */
export async function syncUserRoles(
  admin: AdminClient,
  userId: string,
  roleNames: string[],
  primaryRoleName: string,
): Promise<{ error: string | null }> {
  const uniqueNames = [...new Set(roleNames)];
  if (uniqueNames.length === 0) {
    return { error: "Almeno un ruolo e obbligatorio." };
  }
  if (!uniqueNames.includes(primaryRoleName)) {
    return { error: "Il ruolo primario deve essere tra i ruoli assegnati." };
  }

  const roleMap = await roleIdsByNames(admin, uniqueNames);
  if (roleMap.size !== uniqueNames.length) {
    return { error: "Uno o piu ruoli non trovati." };
  }

  const primaryRoleId = roleMap.get(primaryRoleName);
  if (!primaryRoleId) {
    return { error: "Ruolo primario non trovato." };
  }

  const { error: deleteError } = await admin
    .from("user_roles")
    .delete()
    .eq("user_id", userId);
  if (deleteError) return { error: deleteError.message };

  const { error: insertError } = await admin.from("user_roles").insert(
    uniqueNames.map((name) => ({
      user_id: userId,
      role_id: roleMap.get(name)!,
    })),
  );
  if (insertError) return { error: insertError.message };

  const { error: userError } = await admin
    .from("users")
    .update({ role_id: primaryRoleId })
    .eq("id", userId);
  if (userError) return { error: userError.message };

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: primaryRoleName, roles: uniqueNames },
  });
  if (authError) return { error: authError.message };

  return { error: null };
}

export function parseCheckbox(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true" || value === "1";
}
