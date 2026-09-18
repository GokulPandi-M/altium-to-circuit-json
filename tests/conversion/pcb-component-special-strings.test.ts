import { expect, test } from "bun:test"
import { parseAltiumPcbDoc } from "altiumts"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"

const BOARD_RECORD =
  "|RECORD=Board|KIND0=0|VX0=0mil|VY0=0mil|KIND1=0|VX1=500mil|VY1=0mil|KIND2=0|VX2=500mil|VY2=500mil|KIND3=0|VX3=0mil|VY3=500mil"

function convertSilkscreenText(records: string[]): string[] {
  const document = parseAltiumPcbDoc([BOARD_RECORD, ...records].join("\n"))

  return convertAltiumPcbDocToCircuitJson(document)
    .filter((element) => element.type === "pcb_silkscreen_text")
    .map((element) => element.text)
}

test("resolves component designator and comment special strings", () => {
  expect(
    convertSilkscreenText([
      "|RECORD=Component|X=100mil|Y=100mil|SOURCEDESIGNATOR=R12|SOURCECOMMENT=10k",
      "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=100mil|HEIGHT=20mil|TEXT=.Designator",
      "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=150mil|HEIGHT=20mil|TEXT=.Comment",
    ]),
  ).toEqual(["R12", "10k"])
})

test("resolves quoted special strings embedded in text", () => {
  expect(
    convertSilkscreenText([
      "|RECORD=Component|X=100mil|Y=100mil|SOURCEDESIGNATOR=U3|SOURCECOMMENT=STM32F4",
      "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=100mil|HEIGHT=20mil|TEXT=Ref: '.Designator'",
      "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=150mil|HEIGHT=20mil|TEXT=Part: '.Comment'",
    ]),
  ).toEqual(["Ref: U3", "Part: STM32F4"])
})

test("preserves placeholders without a component value or owner", () => {
  expect(
    convertSilkscreenText([
      "|RECORD=Component|X=100mil|Y=100mil",
      "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=100mil|HEIGHT=20mil|TEXT=.Designator",
      "|RECORD=Text|LAYER=TOPOVERLAY|X=100mil|Y=150mil|HEIGHT=20mil|TEXT=.Comment",
      "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=200mil|HEIGHT=20mil|TEXT=.Unknown",
    ]),
  ).toEqual([".Designator", ".Comment", ".Unknown"])
})

test("does not treat decimal-like text as a component special string", () => {
  expect(
    convertSilkscreenText([
      "|RECORD=Component|X=100mil|Y=100mil|SOURCEDESIGNATOR=R1|SOURCECOMMENT=1uF",
      "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=100mil|HEIGHT=20mil|TEXT=.1uF",
      "|RECORD=Text|COMPONENT=0|LAYER=TOPOVERLAY|X=100mil|Y=150mil|HEIGHT=20mil|TEXT=.062",
    ]),
  ).toEqual([".1uF", ".062"])
})
