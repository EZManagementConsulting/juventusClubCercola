"use client";

import { Field } from "@/components/form/field";
import { Input } from "@/components/ui/input";

type PermissionDefaults = { id?: string; name?: string; label?: string };

export function PermissionForm({
  mode,
  defaults,
}: {
  mode: "create" | "edit";
  defaults?: PermissionDefaults;
}) {
  return (
    <>
      {mode === "edit" && defaults?.id ? (
        <input type="hidden" name="id" value={defaults.id} />
      ) : null}
      <Field
        label="Nome tecnico"
        htmlFor="name"
        hint="Solo lettere minuscole e underscore (es. manage_events)."
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
