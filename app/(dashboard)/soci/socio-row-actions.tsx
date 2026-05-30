"use client";

import { Pencil, Power, QrCode, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { ActionButton } from "@/components/action-button";
import {
  updateSocio,
  deleteSocio,
  toggleSocioStatus,
  regenerateQrToken,
} from "@/lib/actions/soci";
import { SocioForm } from "./socio-form";

type SocioRow = {
  id: string;
  user_id: string;
  name: string | null;
  surname: string | null;
  phone: string | null;
  codice_socio: string;
  card_number: string | null;
  membership_start: string | null;
  membership_expiry: string | null;
  status: "active" | "inactive";
};

export function SocioRowActions({ socio }: { socio: SocioRow }) {
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
        action={toggleSocioStatus}
        hidden={{ id: socio.id, status: socio.status }}
        ariaLabel={socio.status === "active" ? "Disattiva" : "Attiva"}
      >
        <Power className="h-4 w-4" />
      </ActionButton>

      <FormDialog
        title="Modifica socio"
        submitLabel="Salva modifiche"
        action={updateSocio}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Modifica">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      >
        <SocioForm mode="edit" defaults={socio} />
      </FormDialog>

      <DeleteDialog
        id={socio.user_id}
        action={deleteSocio}
        title="Eliminare questo socio?"
        description="Verranno rimossi l'account, il profilo socio e gli sconti associati."
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
