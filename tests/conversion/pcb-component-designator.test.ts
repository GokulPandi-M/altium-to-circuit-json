import { expect, test } from "bun:test"
import { parseAltiumPcbDoc } from "altiumts"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"

const BOARD_RECORD =
  "|RECORD=Board|KIND0=0|VX0=0mil|VY0=0mil|KIND1=0|VX1=500mil|VY1=0mil|KIND2=0|VX2=500mil|VY2=500mil|KIND3=0|VX3=0mil|VY3=500mil"

function convertDesignator(
  componentRecord: string,
  textRecord: string,
): string {
  const document = parseAltiumPcbDoc(
    [BOARD_RECORD, componentRecord, textRecord].join("\n"),
  )
  const silkscreenText = convertAltiumPcbDocToCircuitJson(document).find(
    (element) => element.type === "pcb_silkscreen_text",
  )

  if (!silkscreenText) throw new Error("Expected PCB silkscreen text")
  return silkscreenText.text
}

test("resolves a component designator", () => {
  expect(
    convertDesignator(
      "|RECORD=Component|X=100mil|Y=100mil|SOURCEDESIGNATOR=R12",
      "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=100mil|HEIGHT=20mil|TEXT=.Designator",
    ),
  ).toBe("R12")
})

test("preserves a designator without a component value", () => {
  expect(
    convertDesignator(
      "|RECORD=Component|X=100mil|Y=100mil",
      "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=100mil|HEIGHT=20mil|TEXT=.Designator",
    ),
  ).toBe(".Designator")
})
