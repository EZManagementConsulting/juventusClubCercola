"use client";

import { Field } from "@/components/form/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PartnerDefaults = {
  id?: string;
  name?: string;
  description?: string | null;
  category?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  status?: "active" | "inactive";
};

const CATEGORIES = [
  { value: "ristorazione", label: "Ristorazione" },
  { value: "sport", label: "Sport" },
  { value: "abbigliamento", label: "Abbigliamento" },
  { value: "benessere", label: "Benessere" },
  { value: "altro", label: "Altro" },
] as const;

export function PartnerForm({
  mode,
  defaults,
}: {
  mode: "create" | "edit";
  defaults?: PartnerDefaults;
}) {
  return (
    <>
      {mode === "edit" && defaults?.id ? (
        <input type="hidden" name="id" value={defaults.id} />
      ) : null}

      <Field label="Nome attività" htmlFor="name">
        <Input id="name" name="name" defaultValue={defaults?.name ?? ""} required />
      </Field>

      <Field label="Descrizione" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={defaults?.description ?? ""}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Categoria">
          <Select name="category" defaultValue={defaults?.category ?? "none"}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Nessuna —</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
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
              <SelectItem value="inactive">Inattivo</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Telefono" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={defaults?.phone ?? ""} />
      </Field>
      <Field label="Indirizzo" htmlFor="address">
        <Input id="address" name="address" defaultValue={defaults?.address ?? ""} />
      </Field>
      <Field label="Sito web" htmlFor="website">
        <Input id="website" name="website" type="url" defaultValue={defaults?.website ?? ""} />
      </Field>
    </>
  );
}
