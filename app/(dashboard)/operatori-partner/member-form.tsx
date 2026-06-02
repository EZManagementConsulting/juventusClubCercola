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
import {
  SectionSelectField,
  type SectionOption,
} from "@/components/form/section-select-field";

type MemberDefaults = {
  id?: string;
  profile_id?: string;
  section_id?: string;
  name?: string | null;
  surname?: string | null;
  phone?: string | null;
  codice_socio?: string | null;
  card_number?: string | null;
  membership_start?: string | null;
  membership_expiry?: string | null;
  status?: "active" | "inactive";
  also_tesserato?: boolean;
};

export function MemberForm({
  mode,
  sections,
  defaults,
}: {
  mode: "create" | "edit";
  sections: SectionOption[];
  defaults?: MemberDefaults;
}) {
  return (
    <>
      {mode === "edit" && defaults?.id ? (
        <>
          <input type="hidden" name="id" value={defaults.id} />
          {defaults.profile_id ? (
            <input type="hidden" name="profile_id" value={defaults.profile_id} />
          ) : null}
          {defaults.section_id ? (
            <input type="hidden" name="section_id" value={defaults.section_id} />
          ) : null}
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

      {mode === "create" ? (
        <SectionSelectField sections={sections} defaultValue={defaults?.section_id} />
      ) : (
        <>
          <SectionSelectField
            sections={sections}
            defaultValue={defaults?.section_id}
            disabled
          />
          <Field label="Numero tessera">
            <Input value={defaults?.card_number ?? "—"} readOnly disabled className="font-mono" />
          </Field>
        </>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Codice identificativo"
          htmlFor="codice_socio"
          hint={mode === "create" ? "Lascia vuoto per generarlo." : undefined}
        >
          <Input
            id="codice_socio"
            name="codice_socio"
            defaultValue={defaults?.codice_socio ?? ""}
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

      <Field label="Ruolo aggiuntivo">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="also_tesserato"
            defaultChecked={defaults?.also_tesserato ?? false}
            className="h-4 w-4 rounded border-border"
          />
          <span>Anche tesserato (beneficiario sconti e tessera)</span>
        </label>
      </Field>

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
