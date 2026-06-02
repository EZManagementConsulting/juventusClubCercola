import { describe, expect, it } from "vitest";
import {
  describeUsageRule,
  formatIsoDateIt,
  parseExcludeDatesConfig,
  parseTimeRangeConfig,
  parseWeekdaysConfig,
  ruleTypeLabel,
  type DiscountUsageRuleRow,
} from "./discount-usage-rules";

describe("parseWeekdaysConfig", () => {
  it("normalizza giorni ISO 1-7", () => {
    expect(parseWeekdaysConfig({ days: [1, 7, 99, "2"] })).toEqual({ days: [1, 7, 2] });
  });

  it("restituisce array vuoto se config assente", () => {
    expect(parseWeekdaysConfig(null)).toEqual({ days: [] });
  });
});

describe("parseExcludeDatesConfig", () => {
  it("accetta solo date ISO AAAA-MM-GG", () => {
    expect(
      parseExcludeDatesConfig({ dates: ["2026-06-01", "01/06/2026", "invalid"] }),
    ).toEqual({ dates: ["2026-06-01"] });
  });
});

describe("parseTimeRangeConfig", () => {
  it("usa default se mancante", () => {
    expect(parseTimeRangeConfig({})).toEqual({ start: "09:00", end: "18:00" });
  });
});

describe("describeUsageRule", () => {
  it("descrive giorni consentiti", () => {
    const rule: DiscountUsageRuleRow = {
      id: "1",
      discount_id: "d",
      rule_type: "weekdays",
      config: { days: [1, 2, 3, 4, 5] },
      active: true,
    };
    expect(describeUsageRule(rule)).toBe("Giorni: Lun, Mar, Mer, Gio, Ven");
  });

  it("descrive date escluse in formato italiano", () => {
    const rule: DiscountUsageRuleRow = {
      id: "2",
      discount_id: "d",
      rule_type: "exclude_dates",
      config: { dates: ["2026-12-25"] },
      active: true,
    };
    expect(describeUsageRule(rule)).toContain("25/12/2026");
  });

  it("descrive fascia oraria", () => {
    const rule: DiscountUsageRuleRow = {
      id: "3",
      discount_id: "d",
      rule_type: "time_range",
      config: { start: "09:00", end: "22:00" },
      active: true,
    };
    expect(describeUsageRule(rule)).toBe("Orario: 09:00–22:00");
  });
});

describe("ruleTypeLabel", () => {
  it("etichetta exclude_dates", () => {
    expect(ruleTypeLabel("exclude_dates")).toBe("Date escluse");
  });
});

describe("formatIsoDateIt", () => {
  it("formatta data ISO", () => {
    expect(formatIsoDateIt("2026-06-01")).toMatch(/01\/06\/2026/);
  });
});
