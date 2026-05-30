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

type MemberDefaults = {
  id?: string;
  name?: string | null;
  surname?: string | null;
  phone?: string | null;
  status?: "active" | "inactive";
};

export function MemberForm({
  mode,
  defaults,
}: {
  mode: "create" | "edit";
  defaults?: MemberDefaults;
}) {
  return (
    <>
      {mode === "edit" && defaults?.id ? (
        <input type="hidden" name="id" value={defaults.id} />
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
