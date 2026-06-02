/** Anno di inizio stagione sportiva (1 luglio – 30 giugno), es. 2025 per 2025/26. */
export function getDefaultSeasonStartYear(now = new Date()): number {
  const year = now.getFullYear();
  return now.getMonth() >= 6 ? year : year - 1;
}

export function getSeasonLabel(startYear: number): string {
  return `${startYear}/${String(startYear + 1).slice(-2)}`;
}

export function getSeasonDateRange(startYear: number): {
  membership_start: string;
  membership_expiry: string;
} {
  return {
    membership_start: `${startYear}-07-01`,
    membership_expiry: `${startYear + 1}-06-30`,
  };
}

/** Opzioni stagione per select admin (anno corrente ±1). */
export function getSeasonYearOptions(
  centerYear = getDefaultSeasonStartYear(),
): Array<{ value: number; label: string }> {
  return [-1, 0, 1].map((offset) => {
    const year = centerYear + offset;
    return { value: year, label: getSeasonLabel(year) };
  });
}
