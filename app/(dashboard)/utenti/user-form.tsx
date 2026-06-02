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
import { ROLE_LABELS, type AppRole } from "@/lib/constants";

export type RoleOption = { id: string; name: string; label: string };

type UserDefaults = {
  id?: string;
  name?: string | null;
  surname?: string | null;
  phone?: string | null;
  role_id?: string | null;
  role_ids?: string[];
  status?: "active" | "inactive";
};

export function UserForm({
  mode,
  roles,
  defaults,
}: {
  mode: "create" | "edit";
  roles: RoleOption[];
  defaults?: UserDefaults;
}) {
  const selectedRoleIds =
    defaults?.role_ids ??
    (defaults?.role_id ? [defaults.role_id] : []);

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
          <Field
            label="Password"
            htmlFor="password"
            hint="Almeno 8 caratteri."
          >
            <Input id="password" name="password" type="password" required />
          </Field>
        </>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome" htmlFor="name">
          <Input id="name" name="name" defaultValue={defaults?.name ?? ""} />
        </Field>
        <Field label="Cognome" htmlFor="surname">
          <Input
            id="surname"
            name="surname"
            defaultValue={defaults?.surname ?? ""}
          />
        </Field>
      </div>

      <Field label="Telefono" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={defaults?.phone ?? ""} />
      </Field>

      <Field label="Ruoli" hint="Seleziona uno o piu ruoli applicativi.">
        <div className="space-y-2 rounded-md border border-border p-3">
          {roles.map((role) => (
            <label key={role.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="role_ids"
                value={role.id}
                defaultChecked={selectedRoleIds.includes(role.id)}
                className="h-4 w-4 rounded border-border"
              />
              <span>{ROLE_LABELS[role.name as AppRole] ?? role.label}</span>
            </label>
          ))}
        </div>
      </Field>

      {mode === "edit" ? (
        <>
          <Field label="Ruolo primario" hint="Usato per display e retrocompatibilita JWT.">
            <Select
              name="primary_role_id"
              defaultValue={defaults?.role_id ?? selectedRoleIds[0]}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona ruolo primario" />
              </SelectTrigger>
              <SelectContent>
                {roles
                  .filter((role) => selectedRoleIds.includes(role.id))
                  .map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {ROLE_LABELS[role.name as AppRole] ?? role.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>

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
        </>
      ) : null}
    </>
  );
}
