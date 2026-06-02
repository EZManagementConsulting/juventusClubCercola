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

type SectionDefaults = {
  id?: string;
  name?: string;
  code?: string;
  status?: "active" | "inactive";
};

export function SectionForm({
  mode,
  defaults,
}: {
  mode: "create" | "edit";
  defaults?: SectionDefaults;
}) {
  return (
    <>
      {mode === "edit" && defaults?.id ? (
        <input type="hidden" name="id" value={defaults.id} />
      ) : null}

      <Field label="Nome sezione" htmlFor="name">
        <Input id="name" name="name" defaultValue={defaults?.name ?? ""} required />
      </Field>

      {mode === "create" ? (
        <Field
          label="Prefisso tessera"
          htmlFor="code"
          hint="2-10 caratteri maiuscoli (es. CR, NA01). Genera tessere tipo JCC-CR-000001."
        >
          <Input
            id="code"
            name="code"
            defaultValue={defaults?.code ?? ""}
            required
            className="uppercase"
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
            }}
          />
        </Field>
      ) : (
        <Field label="Prefisso tessera">
          <Input value={defaults?.code ?? ""} readOnly disabled className="font-mono" />
        </Field>
      )}

      {mode === "edit" ? (
        <Field label="Stato">
          <Select name="status" defaultValue={defaults?.status ?? "active"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Attiva</SelectItem>
              <SelectItem value="inactive">Disattivata</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      ) : null}
    </>
  );
}
