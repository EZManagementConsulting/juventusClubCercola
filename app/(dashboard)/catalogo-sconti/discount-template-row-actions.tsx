"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  deleteDiscountTemplate,
  updateDiscountTemplate,
} from "@/lib/actions/discount-templates";
import { DiscountTemplateForm } from "./discount-template-form";
import type { DiscountType } from "@/lib/database.types";

export function DiscountTemplateRowActions({
  template,
}: {
  template: {
    id: string;
    title: string;
    description: string | null;
    type: DiscountType;
    value: number | null;
    status: string;
  };
}) {
  return (
    <div className="flex justify-end gap-1">
      <FormDialog
        title="Modifica tipologia"
        submitLabel="Salva"
        action={updateDiscountTemplate}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Modifica">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <DiscountTemplateForm
          mode="edit"
          defaults={{
            ...template,
            status: template.status as "active" | "inactive",
          }}
        />
      </FormDialog>

      <DeleteDialog
        id={template.id}
        action={deleteDiscountTemplate}
        title="Eliminare questa tipologia?"
        description="Non è possibile se è collegata a offerte partner attive."
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
