"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { assignDiscount } from "@/lib/actions/sconti";

type SocioOption = { id: string; label: string; codice: string };

export function AssignDialog({
  discountId,
  soci,
}: {
  discountId: string;
  soci: SocioOption[];
}) {
  return (
    <FormDialog
      title="Assegna sconto ai soci"
      description="Seleziona i soci a cui assegnare questo sconto."
      submitLabel="Assegna"
      action={assignDiscount}
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Assegna soci
        </Button>
      }
    >
      <input type="hidden" name="discount_id" value={discountId} />
      {soci.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Tutti i soci attivi hanno gia questo sconto.
        </p>
      ) : (
        <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border p-3">
          {soci.map((socio) => (
            <label key={socio.id} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="socio_ids"
                value={socio.id}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span>{socio.label}</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {socio.codice}
              </span>
            </label>
          ))}
        </div>
      )}
    </FormDialog>
  );
}
