"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  parseBusinessHours,
  serializeBusinessHours,
  type BusinessHoursSlot,
} from "@/lib/business-hours";
import { WEEKDAY_OPTIONS } from "@/lib/discount-usage-rules";

type BusinessHoursFieldsProps = {
  defaultValue?: unknown;
};

function emptySlot(): BusinessHoursSlot {
  return { days: [1, 2, 3, 4, 5], open: "09:00", close: "18:00" };
}

export function BusinessHoursFields({ defaultValue }: BusinessHoursFieldsProps) {
  const [slots, setSlots] = useState<BusinessHoursSlot[]>(() => {
    const parsed = parseBusinessHours(defaultValue);
    return parsed.slots.length > 0 ? parsed.slots : [];
  });
  const [jsonValue, setJsonValue] = useState(() =>
    serializeBusinessHours(parseBusinessHours(defaultValue).slots),
  );

  const syncJson = useCallback((nextSlots: BusinessHoursSlot[]) => {
    setJsonValue(serializeBusinessHours(nextSlots));
  }, []);

  useEffect(() => {
    syncJson(slots);
  }, [slots, syncJson]);

  const updateSlot = (index: number, patch: Partial<BusinessHoursSlot>) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)),
    );
  };

  const toggleDay = (index: number, day: number) => {
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i !== index) return slot;
        const days = slot.days.includes(day)
          ? slot.days.filter((d) => d !== day)
          : [...slot.days, day].sort((a, b) => a - b);
        return { ...slot, days };
      }),
    );
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name="business_hours_json" value={jsonValue} readOnly />
      <p className="text-sm text-muted-foreground">
        Facoltativo. Aggiungi una o più fasce orarie per i giorni di apertura.
      </p>
      {slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessuna fascia oraria impostata.</p>
      ) : (
        slots.map((slot, index) => (
          <div
            key={index}
            className="space-y-3 rounded-md border border-border p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fascia {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Rimuovi fascia"
                onClick={() => setSlots((prev) => prev.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_OPTIONS.map((day) => (
                <label
                  key={day.value}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={slot.days.includes(day.value)}
                    onChange={() => toggleDay(index, day.value)}
                    className="h-3.5 w-3.5"
                  />
                  {day.label}
                </label>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Apertura</span>
                <input
                  type="time"
                  value={slot.open}
                  onChange={(e) => updateSlot(index, { open: e.target.value })}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Chiusura</span>
                <input
                  type="time"
                  value={slot.close}
                  onChange={(e) => updateSlot(index, { close: e.target.value })}
                  required
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </label>
            </div>
          </div>
        ))
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setSlots((prev) => [...prev, emptySlot()])}
      >
        <Plus className="mr-2 h-4 w-4" />
        Aggiungi fascia oraria
      </Button>
    </div>
  );
}
