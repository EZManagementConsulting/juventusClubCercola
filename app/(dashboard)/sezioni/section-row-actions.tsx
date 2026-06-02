"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { updateSection, deleteSection } from "@/lib/actions/sections";
import { SectionForm } from "./section-form";

type SectionRow = {
  id: string;
  name: string;
  code: string;
  status: "active" | "inactive";
};

export function SectionRowActions({ section }: { section: SectionRow }) {
  return (
    <div className="flex justify-end gap-1">
      <FormDialog
        title="Modifica sezione"
        submitLabel="Salva"
        action={updateSection}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Modifica">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <SectionForm mode="edit" defaults={section} />
      </FormDialog>

      <DeleteDialog
        id={section.id}
        action={deleteSection}
        title="Eliminare questa sezione?"
        description="Consentito solo se non ci sono tessere associate."
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
