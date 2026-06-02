export type DiscountUsageRuleType = "weekdays" | "time_range" | "exclude_dates";

export type DiscountUsageRuleRow = {
  id: string;
  discount_id: string;
  rule_type: DiscountUsageRuleType;
  config: WeekdaysRuleConfig | TimeRangeRuleConfig | ExcludeDatesRuleConfig;
  active: boolean;
};

export type WeekdaysRuleConfig = {
  days: number[];
};

export type TimeRangeRuleConfig = {
  start: string;
  end: string;
};

export type ExcludeDatesRuleConfig = {
  dates: string[];
};

/** ISO: 1 = lunedì … 7 = domenica */
export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Gio" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sab" },
  { value: 7, label: "Dom" },
] as const;

export function parseWeekdaysConfig(config: unknown): WeekdaysRuleConfig {
  if (!config || typeof config !== "object" || !("days" in config)) {
    return { days: [] };
  }
  const days = (config as { days: unknown }).days;
  if (!Array.isArray(days)) return { days: [] };
  return {
    days: days
      .map((d) => Number(d))
      .filter((d) => Number.isInteger(d) && d >= 1 && d <= 7),
  };
}

export function parseTimeRangeConfig(config: unknown): TimeRangeRuleConfig {
  if (!config || typeof config !== "object") {
    return { start: "09:00", end: "18:00" };
  }
  const row = config as { start?: unknown; end?: unknown };
  const start = typeof row.start === "string" ? row.start : "09:00";
  const end = typeof row.end === "string" ? row.end : "18:00";
  return { start, end };
}

export function parseExcludeDatesConfig(config: unknown): ExcludeDatesRuleConfig {
  if (!config || typeof config !== "object" || !("dates" in config)) {
    return { dates: [] };
  }
  const dates = (config as { dates: unknown }).dates;
  if (!Array.isArray(dates)) return { dates: [] };
  return {
    dates: dates
      .map((d) => (typeof d === "string" ? d.trim() : ""))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)),
  };
}

export function formatIsoDateIt(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ruleTypeLabel(ruleType: DiscountUsageRuleType): string {
  switch (ruleType) {
    case "weekdays":
      return "Giorni";
    case "time_range":
      return "Orario";
    case "exclude_dates":
      return "Date escluse";
    default:
      return "Regola";
  }
}

export function describeUsageRule(rule: DiscountUsageRuleRow): string {
  if (rule.rule_type === "weekdays") {
    const cfg = parseWeekdaysConfig(rule.config);
    const labels = WEEKDAY_OPTIONS.filter((d) => cfg.days.includes(d.value)).map(
      (d) => d.label,
    );
    return labels.length > 0 ? `Giorni: ${labels.join(", ")}` : "Giorni non configurati";
  }
  if (rule.rule_type === "exclude_dates") {
    const cfg = parseExcludeDatesConfig(rule.config);
    if (cfg.dates.length === 0) return "Nessuna data esclusa";
    return `Date escluse: ${cfg.dates.map(formatIsoDateIt).join(", ")}`;
  }
  const cfg = parseTimeRangeConfig(rule.config);
  return `Orario: ${cfg.start}–${cfg.end}`;
}
