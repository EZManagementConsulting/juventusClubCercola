"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { updateUser, deleteUser } from "@/lib/actions/users";
import { UserForm, type RoleOption } from "./user-form";

type UserRow = {
  id: string;
  name: string | null;
  surname: string | null;
  phone: string | null;
  role_id: string | null;
  role_ids?: string[];
  status: "active" | "inactive";
};

export function UserRowActions({
  user,
  roles,
}: {
  user: UserRow;
  roles: RoleOption[];
}) {
  return (
    <div className="flex justify-end gap-1">
      <FormDialog
        title="Modifica utente"
        submitLabel="Salva modifiche"
        action={updateUser}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Modifica">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <UserForm mode="edit" roles={roles} defaults={user} />
      </FormDialog>

      <DeleteDialog
        id={user.id}
        action={deleteUser}
        title="Eliminare questo utente?"
        description="L'utente e il relativo accesso verranno rimossi definitivamente."
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
