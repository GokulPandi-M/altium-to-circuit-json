import type { AltiumPcbDocument, AltiumTextRecord } from "altiumts"

interface ResolveAltiumComponentSpecialStringsOptions {
  document: AltiumPcbDocument
  record: AltiumTextRecord
  sourceText: string
}

const COMPONENT_SPECIAL_STRING_PATTERN = /'?\.(Designator|Comment)'?/giu

export function resolveAltiumComponentSpecialStrings({
  document,
  record,
  sourceText,
}: ResolveAltiumComponentSpecialStringsOptions): string {
  const component = document.getComponentForRecord(record)
  if (!component) return sourceText

  return sourceText.replace(
    COMPONENT_SPECIAL_STRING_PATTERN,
    (matchedText, specialStringName: string) => {
      const replacement =
        specialStringName.toUpperCase() === "DESIGNATOR"
          ? component.designator
          : component.comment
      return replacement || matchedText
    },
  )
}
