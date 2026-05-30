"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { updateMember, deleteMember } from "@/lib/actions/membri";
import { MemberForm } from "./member-form";

type MemberRow = {
  id: string;
  name: string | null;
  surname: string | null;
  phone: string | null;
  status: "active" | "inactive";
};

export function MemberRowActions({ member }: { member: MemberRow }) {
  return (
    <div className="flex justify-end gap-1">
      <FormDialog
        title="Modifica membro"
        submitLabel="Salva modifiche"
        action={updateMember}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Modifica">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <MemberForm mode="edit" defaults={member} />
      </FormDialog>

      <DeleteDialog
        id={member.id}
        action={deleteMember}
        title="Eliminare questo membro?"
        description="L'account del membro verra rimosso definitivamente."
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
