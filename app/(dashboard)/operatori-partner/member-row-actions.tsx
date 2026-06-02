"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import type { SectionOption } from "@/components/form/section-select-field";
import {
  updateOperatorePartner,
  deleteOperatorePartner,
} from "@/lib/actions/operatori-partner";
import { MemberForm } from "./member-form";

type MemberRow = {
  id: string;
  name: string | null;
  surname: string | null;
  phone: string | null;
  status: "active" | "inactive";
  profile_id: string | null;
  section_id: string | null;
  codice_socio: string | null;
  card_number: string | null;
  membership_start: string | null;
  membership_expiry: string | null;
  profile_status: "active" | "inactive" | null;
  also_tesserato: boolean;
};

export function MemberRowActions({
  member,
  sections,
}: {
  member: MemberRow;
  sections: SectionOption[];
}) {
  return (
    <div className="flex justify-end gap-1">
      <FormDialog
        title="Modifica operatore"
        submitLabel="Salva modifiche"
        action={updateOperatorePartner}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Modifica">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <MemberForm
          mode="edit"
          sections={sections}
          defaults={{
            id: member.id,
            profile_id: member.profile_id ?? undefined,
            section_id: member.section_id ?? undefined,
            name: member.name,
            surname: member.surname,
            phone: member.phone,
            codice_socio: member.codice_socio,
            card_number: member.card_number,
            membership_start: member.membership_start,
            membership_expiry: member.membership_expiry,
            status: member.profile_status ?? member.status,
            also_tesserato: member.also_tesserato,
          }}
        />
      </FormDialog>

      <DeleteDialog
        id={member.id}
        action={deleteOperatorePartner}
        title="Eliminare questo operatore?"
        description="L'account verrà rimosso definitivamente."
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
