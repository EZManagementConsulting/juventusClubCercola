"use client";

import { Clock, CalendarDays, CalendarOff, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import {
  addExcludeDateUsageRule,
  addTimeRangeUsageRule,
  addWeekdaysUsageRule,
  removeUsageRule,
} from "@/lib/actions/discount-usage-rules";
import {
  describeUsageRule,
  parseExcludeDatesConfig,
  parseTimeRangeConfig,
  parseWeekdaysConfig,
  ruleTypeLabel,
  WEEKDAY_OPTIONS,
  type DiscountUsageRuleRow,
} from "@/lib/discount-usage-rules";

type UsageRulesPanelProps = {
  discountId: string;
  rules: DiscountUsageRuleRow[];
};

export function UsageRulesPanel({ discountId, rules }: UsageRulesPanelProps) {
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">Regole di utilizzo</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Opzionali. Se non imposti regole, lo sconto segue solo date e limiti globali.
            Fuso orario: Europe/Rome.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FormDialog
            title="Giorni consentiti"
            description="Lo sconto sarà valido solo nei giorni selezionati (es. lun–ven)."
            submitLabel="Aggiungi regola"
            action={addWeekdaysUsageRule}
            trigger={
              <Button type="button" variant="outline" size="sm">
                <CalendarDays className="mr-2 h-4 w-4" />
                Giorni
              </Button>
            }
          >
            <input type="hidden" name="discount_id" value={discountId} />
            <div className="flex flex-wrap gap-3">
              {WEEKDAY_OPTIONS.map((day) => (
                <label
                  key={day.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <input type="checkbox" name="days" value={day.value} className="h-4 w-4" />
                  {day.label}
                </label>
              ))}
            </div>
          </FormDialog>

          <FormDialog
            title="Fascia oraria"
            description="Lo sconto sarà valido solo tra gli orari indicati."
            submitLabel="Aggiungi regola"
            action={addTimeRangeUsageRule}
            trigger={
              <Button type="button" variant="outline" size="sm">
                <Clock className="mr-2 h-4 w-4" />
                Orario
              </Button>
            }
          >
            <input type="hidden" name="discount_id" value={discountId} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Dalle</span>
                <input
                  type="time"
                  name="start"
                  defaultValue="09:00"
                  required
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Alle</span>
                <input
                  type="time"
                  name="end"
                  defaultValue="22:00"
                  required
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </label>
            </div>
          </FormDialog>

          <FormDialog
            title="Escludi una data"
            description="In questa data lo sconto non sarà utilizzabile (es. chiusura festiva)."
            submitLabel="Aggiungi esclusione"
            action={addExcludeDateUsageRule}
            trigger={
              <Button type="button" variant="outline" size="sm">
                <CalendarOff className="mr-2 h-4 w-4" />
                Escludi data
              </Button>
            }
          >
            <input type="hidden" name="discount_id" value={discountId} />
            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Data (AAAA-MM-GG)</span>
              <input
                type="date"
                name="date"
                required
                className="w-full rounded-md border bg-background px-3 py-2"
              />
            </label>
          </FormDialog>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nessuna regola: utilizzo consentito in qualsiasi giorno e orario (entro validità
            sconto).
          </p>
        ) : (
          <ul className="space-y-2">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-center justify-between rounded-md border px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium">{ruleTypeLabel(rule.rule_type)}</span>
                  <p className="text-muted-foreground">{describeUsageRule(rule)}</p>
                  {rule.rule_type === "weekdays" ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Config: {parseWeekdaysConfig(rule.config).days.join(", ")}
                    </p>
                  ) : rule.rule_type === "time_range" ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {parseTimeRangeConfig(rule.config).start} →{" "}
                      {parseTimeRangeConfig(rule.config).end}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {parseExcludeDatesConfig(rule.config).dates.join(", ")}
                    </p>
                  )}
                </div>
                <ActionButton
                  action={removeUsageRule}
                  hidden={{ id: rule.id, discount_id: discountId }}
                  ariaLabel="Rimuovi regola"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </ActionButton>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
