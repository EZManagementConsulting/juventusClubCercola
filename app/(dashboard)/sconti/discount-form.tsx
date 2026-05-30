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
import type {
  DiscountStatus,
  DiscountType,
} from "@/lib/database.types";

type DiscountDefaults = {
  id?: string;
  title?: string;
  description?: string | null;
  type?: DiscountType;
  value?: number | null;
  start_date?: string | null;
  expiry_date?: string | null;
  usage_limit?: number | null;
  status?: DiscountStatus;
};

export function DiscountForm({
  mode,
  defaults,
}: {
  mode: "create" | "edit";
  defaults?: DiscountDefaults;
}) {
  return (
    <>
      {mode === "edit" && defaults?.id ? (
        <input type="hidden" name="id" value={defaults.id} />
      ) : null}

      <Field label="Titolo" htmlFor="title">
        <Input id="title" name="title" defaultValue={defaults?.title ?? ""} required />
      </Field>

      <Field label="Descrizione" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ""}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tipologia">
          <Select name="type" defaultValue={defaults?.type ?? "percentage"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentuale (%)</SelectItem>
              <SelectItem value="fixed_amount">Importo fisso (€)</SelectItem>
              <SelectItem value="custom">Personalizzato</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field
          label="Valore"
          htmlFor="value"
          hint="Es. 10 per 10% o 5 per 5€."
        >
          <Input
            id="value"
            name="value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaults?.value ?? ""}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Inizio validita" htmlFor="start_date">
          <Input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={defaults?.start_date ?? ""}
          />
        </Field>
        <Field label="Scadenza" htmlFor="expiry_date">
          <Input
            id="expiry_date"
            name="expiry_date"
            type="date"
            defaultValue={defaults?.expiry_date ?? ""}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Limite di utilizzo"
          htmlFor="usage_limit"
          hint="Lascia vuoto per illimitato."
        >
          <Input
            id="usage_limit"
            name="usage_limit"
            type="number"
            min="0"
            defaultValue={defaults?.usage_limit ?? ""}
          />
        </Field>
        <Field label="Stato">
          <Select name="status" defaultValue={defaults?.status ?? "active"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Attivo</SelectItem>
              <SelectItem value="inactive">Inattivo</SelectItem>
              <SelectItem value="expired">Scaduto</SelectItem>
              <SelectItem value="cancelled">Annullato</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </>
  );
}
