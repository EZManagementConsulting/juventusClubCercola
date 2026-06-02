"use client";

import { CalendarSync, Pencil, Power, QrCode, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { ActionButton } from "@/components/action-button";
import type { SectionOption } from "@/components/form/section-select-field";
import {
  updateTesserato,
  deleteTesserato,
  toggleTesseratoStatus,
  regenerateQrToken,
  renewClubMembership,
} from "@/lib/actions/tesserati";
import { SocioForm } from "./socio-form";
import { RenewMembershipForm } from "./renew-membership-form";

type SocioRow = {
  id: string;
  user_id: string;
  section_id: string;
  name: string | null;
  surname: string | null;
  phone: string | null;
  codice_socio: string;
  card_number: string | null;
  membership_start: string | null;
  membership_expiry: string | null;
  status: "active" | "inactive";
  also_operatore_partner?: boolean;
};

export function SocioRowActions({
  socio,
  sections,
}: {
  socio: SocioRow;
  sections: SectionOption[];
}) {
  return (
    <div className="flex justify-end gap-1">
      <ActionButton
        action={regenerateQrToken}
        hidden={{ id: socio.id }}
        ariaLabel="Rigenera QR token"
      >
        <QrCode className="h-4 w-4" />
      </ActionButton>

      <ActionButton
        action={toggleTesseratoStatus}
        hidden={{ id: socio.id, status: socio.status }}
        ariaLabel={socio.status === "active" ? "Disattiva" : "Attiva"}
      >
        <Power className="h-4 w-4" />
      </ActionButton>

      <FormDialog
        title="Rinnova tessera"
        description="Registra il rinnovo stagionale e aggiorna le date di validità."
        submitLabel="Conferma rinnovo"
        action={renewClubMembership}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Rinnova tessera">
            <CalendarSync className="h-4 w-4" />
          </Button>
        }
      >
        <RenewMembershipForm
          profileId={socio.id}
          cardNumber={socio.card_number}
          currentExpiry={socio.membership_expiry}
        />
      </FormDialog>

      <FormDialog
        title="Modifica tesserato"
        submitLabel="Salva modifiche"
        action={updateTesserato}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Modifica">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <SocioForm mode="edit" sections={sections} defaults={socio} />
      </FormDialog>

      <DeleteDialog
        id={socio.user_id}
        action={deleteTesserato}
        title="Eliminare questo tesserato?"
        description="Verranno rimossi l'account, il profilo tessera e gli sconti associati."
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
