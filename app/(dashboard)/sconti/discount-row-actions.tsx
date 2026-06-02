"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { updateDiscount, deleteDiscount } from "@/lib/actions/sconti";
import type {
  DiscountStatus,
  DiscountType,
} from "@/lib/database.types";
import { DiscountForm } from "./discount-form";

type DiscountRow = {
  id: string;
  title: string;
  description: string | null;
  type: DiscountType;
  value: number | null;
  start_date: string | null;
  expiry_date: string | null;
  usage_limit: number | null;
  status: DiscountStatus;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  business_hours?: import("@/lib/database.types").Json | null;
};

export function DiscountRowActions({ discount }: { discount: DiscountRow }) {
  return (
    <div className="flex justify-end gap-1">
      <FormDialog
        title="Modifica sconto"
        submitLabel="Salva modifiche"
        action={updateDiscount}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Modifica">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <DiscountForm mode="edit" defaults={discount} />
      </FormDialog>

      <DeleteDialog
        id={discount.id}
        action={deleteDiscount}
        title="Eliminare questo sconto?"
        description="Verranno rimosse anche le assegnazioni ai soci."
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
