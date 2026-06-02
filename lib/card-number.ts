/** Prefisso fisso del numero tessera Juventus Club Cercola. */
export const CARD_NUMBER_PREFIX = "JCC";

/** Formato: JCC-{prefisso sezione}-{000001} es. JCC-CR-000001 */
export function formatSectionCardNumber(sectionCode: string, sequence: number): string {
  return `${CARD_NUMBER_PREFIX}-${sectionCode}-${String(sequence).padStart(6, "0")}`;
}
