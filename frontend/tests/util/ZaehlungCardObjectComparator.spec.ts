import type { ExternalZaehlungDTO } from "@/api/client";

import { describe, expect, it } from "vitest";

import Zaehlart from "@/types/enum/Zaehlart";
import DefaultObjectCreator from "@/util/DefaultObjectCreator";
import ZaehlungCardObjectComparator from "@/util/ZaehlungCardObjectComparator";

function card(datum: Date, zaehlart: string) {
  const zaehlung: ExternalZaehlungDTO = {
    ...DefaultObjectCreator.createDefaultZaehlungDTO(),
    datum,
    zaehlart,
  };
  return { zaehlung };
}

describe("ZaehlungCardObjectComparator", () => {
  it("sorts generated dates descending and prefers standard counts on the same calendar day", () => {
    const older = card(new Date(2026, 2, 9), Zaehlart.N);
    const standard = card(new Date(2026, 2, 10), Zaehlart.N);
    const other = card(new Date(2026, 2, 10), Zaehlart.QJS);

    expect(
      [older, other, standard].sort(
        ZaehlungCardObjectComparator.sortByDatumDesc
      )
    ).toEqual([standard, other, older]);
  });

  it("treats separate Date objects with identical dates and counting types as equal", () => {
    expect(
      ZaehlungCardObjectComparator.sortByDatumDesc(
        card(new Date(2026, 2, 10), Zaehlart.N),
        card(new Date(2026, 2, 10), Zaehlart.N)
      )
    ).toBe(0);
  });
});
