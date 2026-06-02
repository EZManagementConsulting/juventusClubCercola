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
  getDefaultSeasonStartYear,
  getSeasonDateRange,
  getSeasonLabel,
  getSeasonYearOptions,
} from "@/lib/membership-season";

export function RenewMembershipForm({
  profileId,
  cardNumber,
  currentExpiry,
}: {
  profileId: string;
  cardNumber: string | null;
  currentExpiry: string | null;
}) {
  const defaultYear = getDefaultSeasonStartYear();
  const options = getSeasonYearOptions(defaultYear);
  const preview = getSeasonDateRange(defaultYear);

  return (
    <>
      <input type="hidden" name="profile_id" value={profileId} />

      <p className="text-sm text-muted-foreground">
        Tessera <span className="font-mono text-foreground">{cardNumber ?? "—"}</span>
        {currentExpiry ? (
          <>
            {" "}
            — scadenza attuale:{" "}
            <span className="text-foreground">{currentExpiry}</span>
          </>
        ) : null}
      </p>

      <Field
        label="Stagione"
        htmlFor="season_start_year"
        hint={`Imposta validità dal ${preview.membership_start} al ${preview.membership_expiry} (stagione ${getSeasonLabel(defaultYear)}).`}
      >
        <Select name="season_start_year" defaultValue={String(defaultYear)}>
          <SelectTrigger id="season_start_year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Quota">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="fee_paid"
            defaultChecked
            className="h-4 w-4 rounded border-border"
          />
          <span>Quota stagione versata</span>
        </label>
      </Field>

      <Field label="Note (opzionale)" htmlFor="note">
        <Input id="note" name="note" placeholder="Es. bonifico, ricevuta…" />
      </Field>
    </>
  );
}
