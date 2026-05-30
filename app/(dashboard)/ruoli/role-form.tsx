"use client";

import { Field } from "@/components/form/field";
import { Input } from "@/components/ui/input";

type RoleDefaults = { id?: string; name?: string; label?: string };

export function RoleForm({
  mode,
  defaults,
}: {
  mode: "create" | "edit";
  defaults?: RoleDefaults;
}) {
  return (
    <>
      {mode === "edit" && defaults?.id ? (
        <input type="hidden" name="id" value={defaults.id} />
      ) : null}
      <Field
        label="Nome tecnico"
        htmlFor="name"
        hint="Solo lettere minuscole e underscore (es. socio_premium)."
      >
        <Input id="name" name="name" defaultValue={defaults?.name ?? ""} required />
      </Field>
      <Field label="Etichetta" htmlFor="label">
        <Input
          id="label"
          name="label"
          defaultValue={defaults?.label ?? ""}
          required
        />
      </Field>
    </>
  );
}
