"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { assignDiscountOperator } from "@/lib/actions/sconti";

type UserOption = { id: string; label: string; email: string };

export function OperatorAssignDialog({
  discountId,
  users,
}: {
  discountId: string;
  users: UserOption[];
}) {
  return (
    <FormDialog
      title="Collega operatore attività"
      description="Seleziona l'account che potrà scannerizzare i QR per questa attività partner."
      submitLabel="Collega"
      action={assignDiscountOperator}
      trigger={
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" /> Operatore
        </Button>
      }
    >
      <input type="hidden" name="discount_id" value={discountId} />
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Tutti gli utenti attivi sono già collegati a questa attività.
        </p>
      ) : (
        <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border p-3">
          {users.map((user) => (
            <label key={user.id} className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="user_id"
                value={user.id}
                required
                className="h-4 w-4 border-input accent-primary"
              />
              <span>{user.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{user.email}</span>
            </label>
          ))}
        </div>
      )}
    </FormDialog>
  );
}
