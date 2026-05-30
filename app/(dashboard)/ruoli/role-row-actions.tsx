"use client";

import { KeyRound, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { updateRole, deleteRole, setRolePermissions } from "@/lib/actions/roles";
import { RoleForm } from "./role-form";

type PermissionOption = { id: string; name: string; label: string };

export function RoleRowActions({
  role,
  permissions,
  assignedPermissionIds,
}: {
  role: { id: string; name: string; label: string };
  permissions: PermissionOption[];
  assignedPermissionIds: string[];
}) {
  const assigned = new Set(assignedPermissionIds);

  return (
    <div className="flex justify-end gap-1">
      <FormDialog
        title={`Permessi: ${role.label}`}
        description="Seleziona i permessi associati a questo ruolo."
        submitLabel="Salva permessi"
        action={setRolePermissions}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Gestisci permessi">
            <KeyRound className="h-4 w-4" />
          </Button>
        }
      >
        <input type="hidden" name="role_id" value={role.id} />
        <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border p-3">
          {permissions.map((permission) => (
            <label
              key={permission.id}
              className="flex items-center gap-3 text-sm"
            >
              <input
                type="checkbox"
                name="permission_ids"
                value={permission.id}
                defaultChecked={assigned.has(permission.id)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span>{permission.label}</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {permission.name}
              </span>
            </label>
          ))}
        </div>
      </FormDialog>

      <FormDialog
        title="Modifica ruolo"
        submitLabel="Salva"
        action={updateRole}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Modifica">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <RoleForm mode="edit" defaults={role} />
      </FormDialog>

      <DeleteDialog
        id={role.id}
        action={deleteRole}
        title="Eliminare questo ruolo?"
        description="Gli utenti con questo ruolo resteranno senza ruolo assegnato."
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            aria-label="Elimina"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
}
