import type { AltiumPcbDocument, AltiumTextRecord } from "altiumts"

const DESIGNATOR_SPECIAL_STRING = ".Designator"

export function resolveAltiumDesignator(
  document: AltiumPcbDocument,
  record: AltiumTextRecord,
  text: string,
): string {
  if (text !== DESIGNATOR_SPECIAL_STRING) return text

  return document.getComponentForRecord(record)?.designator ?? text
}
