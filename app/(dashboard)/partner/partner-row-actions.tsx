"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { deletePartner, updatePartner } from "@/lib/actions/partners";
import { PartnerForm } from "./partner-form";

export function PartnerRowActions({
  partner,
}: {
  partner: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    phone: string | null;
    address: string | null;
    website: string | null;
    status: string;
  };
}) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" asChild aria-label="Dettaglio">
        <Link href={`/partner/${partner.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>

      <FormDialog
        title="Modifica partner"
        submitLabel="Salva"
        action={updatePartner}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Modifica">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <PartnerForm
          mode="edit"
          defaults={{
            ...partner,
            status: partner.status as "active" | "inactive",
          }}
        />
      </FormDialog>

      <DeleteDialog
        id={partner.id}
        action={deletePartner}
        title="Eliminare questo partner?"
        description="Verranno eliminate anche le offerte collegate."
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
