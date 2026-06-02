"use client";

import { Field } from "@/components/form/field";
import { BusinessHoursFields } from "@/components/form/business-hours-fields";
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
  Json,
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
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  business_hours?: Json | null;
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

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-sm font-medium">Attività / contatti</p>
        <div className="space-y-4">
          <Field label="Telefono" htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={defaults?.phone ?? ""}
              placeholder="+39 081 000 0000"
            />
          </Field>
          <Field label="Indirizzo" htmlFor="address">
            <Input
              id="address"
              name="address"
              defaultValue={defaults?.address ?? ""}
              placeholder="Via Roma 14, Cercola (NA)"
            />
          </Field>
          <Field label="Sito web" htmlFor="website" hint="URL o dominio (es. www.esempio.it)">
            <Input
              id="website"
              name="website"
              defaultValue={defaults?.website ?? ""}
              placeholder="www.esempio.it"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Latitudine" htmlFor="latitude">
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                defaultValue={defaults?.latitude ?? ""}
                placeholder="40.8631"
              />
            </Field>
            <Field label="Longitudine" htmlFor="longitude">
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                defaultValue={defaults?.longitude ?? ""}
                placeholder="14.3583"
              />
            </Field>
          </div>
          <Field label="Orari di apertura">
            <BusinessHoursFields defaultValue={defaults?.business_hours} />
          </Field>
        </div>
      </div>
    </>
  );
}
