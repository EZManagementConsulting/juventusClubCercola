"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { updatePermission, deletePermission } from "@/lib/actions/permissions";
import { PermissionForm } from "./permission-form";

export function PermissionRowActions({
  permission,
}: {
  permission: { id: string; name: string; label: string };
}) {
  return (
    <div className="flex justify-end gap-1">
      <FormDialog
        title="Modifica permesso"
        submitLabel="Salva"
        action={updatePermission}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Modifica">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <PermissionForm mode="edit" defaults={permission} />
      </FormDialog>

      <DeleteDialog
        id={permission.id}
        action={deletePermission}
        title="Eliminare questo permesso?"
        description="Il permesso verra rimosso da tutti i ruoli."
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
