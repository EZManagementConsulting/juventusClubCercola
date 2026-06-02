/** ISO weekday: 1 = lunedì … 7 = domenica */
export const WEEKDAY_SHORT_IT: Record<number, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mer",
  4: "Gio",
  5: "Ven",
  6: "Sab",
  7: "Dom",
};

export type BusinessHoursSlot = {
  days: number[];
  open: string;
  close: string;
};

export type BusinessHoursConfig = {
  slots: BusinessHoursSlot[];
};

export function parseBusinessHours(config: unknown): BusinessHoursConfig {
  if (!config || typeof config !== "object" || !("slots" in config)) {
    return { slots: [] };
  }
  const rawSlots = (config as { slots: unknown }).slots;
  if (!Array.isArray(rawSlots)) return { slots: [] };

  const slots: BusinessHoursSlot[] = [];
  for (const item of rawSlots) {
    if (!item || typeof item !== "object") continue;
    const row = item as { days?: unknown; open?: unknown; close?: unknown };
    const days = Array.isArray(row.days)
      ? row.days
          .map((d) => Number(d))
          .filter((d) => Number.isInteger(d) && d >= 1 && d <= 7)
      : [];
    const open = typeof row.open === "string" ? row.open : "";
    const close = typeof row.close === "string" ? row.close : "";
    if (days.length === 0 || !open || !close) continue;
    slots.push({ days: [...new Set(days)].sort((a, b) => a - b), open, close });
  }
  return { slots };
}

function formatDayRange(days: number[]): string {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  if (sorted.length === 0) return "";
  if (sorted.length === 1) return WEEKDAY_SHORT_IT[sorted[0]] ?? "";

  let isContiguous = true;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) {
      isContiguous = false;
      break;
    }
  }
  if (isContiguous) {
    return `${WEEKDAY_SHORT_IT[sorted[0]]}–${WEEKDAY_SHORT_IT[sorted[sorted.length - 1]]}`;
  }
  return sorted.map((d) => WEEKDAY_SHORT_IT[d]).join(", ");
}

/** Es. "Lun–Sab: 12:00–15:00, 19:00–23:00" */
export function formatBusinessHoursIt(config: unknown): string | null {
  const { slots } = parseBusinessHours(config);
  if (slots.length === 0) return null;

  const parts = slots.map((slot) => {
    const daysLabel = formatDayRange(slot.days);
    return `${daysLabel}: ${slot.open}–${slot.close}`;
  });
  return parts.join("; ");
}

/** Serializza slots per hidden input / JSON nel form. */
export function serializeBusinessHours(slots: BusinessHoursSlot[]): string {
  return JSON.stringify({ slots });
}
