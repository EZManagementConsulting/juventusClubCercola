"use client";

import { Field } from "@/components/form/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SocioDefaults = {
  id?: string;
  user_id?: string;
  name?: string | null;
  surname?: string | null;
  phone?: string | null;
  codice_socio?: string;
  card_number?: string | null;
  membership_start?: string | null;
  membership_expiry?: string | null;
  status?: "active" | "inactive";
};

export function SocioForm({
  mode,
  defaults,
}: {
  mode: "create" | "edit";
  defaults?: SocioDefaults;
}) {
  return (
    <>
      {mode === "edit" && defaults?.id ? (
        <>
          <input type="hidden" name="id" value={defaults.id} />
          <input type="hidden" name="user_id" value={defaults.user_id} />
        </>
      ) : null}

      {mode === "create" ? (
        <>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" required />
          </Field>
          <Field label="Password" htmlFor="password" hint="Almeno 8 caratteri.">
            <Input id="password" name="password" type="password" required />
          </Field>
        </>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome" htmlFor="name">
          <Input id="name" name="name" defaultValue={defaults?.name ?? ""} required />
        </Field>
        <Field label="Cognome" htmlFor="surname">
          <Input
            id="surname"
            name="surname"
            defaultValue={defaults?.surname ?? ""}
            required
          />
        </Field>
      </div>

      <Field label="Telefono" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={defaults?.phone ?? ""} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Codice socio"
          htmlFor="codice_socio"
          hint={mode === "create" ? "Lascia vuoto per generarlo." : undefined}
        >
          <Input
            id="codice_socio"
            name="codice_socio"
            defaultValue={defaults?.codice_socio ?? ""}
            required={mode === "edit"}
          />
        </Field>
        <Field label="Numero tessera" htmlFor="card_number">
          <Input
            id="card_number"
            name="card_number"
            defaultValue={defaults?.card_number ?? ""}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Inizio tessera" htmlFor="membership_start">
          <Input
            id="membership_start"
            name="membership_start"
            type="date"
            defaultValue={defaults?.membership_start ?? ""}
          />
        </Field>
        <Field label="Scadenza tessera" htmlFor="membership_expiry">
          <Input
            id="membership_expiry"
            name="membership_expiry"
            type="date"
            defaultValue={defaults?.membership_expiry ?? ""}
          />
        </Field>
      </div>

      {mode === "edit" ? (
        <Field label="Stato">
          <Select name="status" defaultValue={defaults?.status ?? "active"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Attivo</SelectItem>
              <SelectItem value="inactive">Disattivato</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      ) : null}
    </>
  );
}
