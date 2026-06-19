import * as fs from "fs";
import * as path from "path";

import { describe, expect, test } from "vitest";

import {
  Zaehldauer,
  zaehldauerIntervallnummern,
  zaehldauerText,
} from "../../../src/types/enum/Zaehldauer";
import { useValidationUtils } from "../../../src/util/validation/ValidationUtils";

const {
  isWholeNonNegativeIntegerString,
  getBewegungsinformationFromCsvLine,
  checkForIdenticalIntervallnummerJeBewegungsbeziehung,
  checkForCorrectNumberOfIntervalsAccordingZaehldauer,
  checkForAlignmentOfIntervallsAccordingZaehldauer,
} = useValidationUtils();

describe("ValidationUtils - isWholeNonNegativeIntegerString", () => {
  test("returns false for empty string", () => {
    expect(isWholeNonNegativeIntegerString("")).toBe(false);
  });

  test("returns false for string with only spaces", () => {
    expect(isWholeNonNegativeIntegerString("   ")).toBe(false);
  });

  test("accepts single zero", () => {
    expect(isWholeNonNegativeIntegerString("0")).toBe(true);
  });

  test("accepts positive integer strings", () => {
    expect(isWholeNonNegativeIntegerString("42")).toBe(true);
    expect(isWholeNonNegativeIntegerString("007")).toBe(true);
  });

  test("accepts numbers with surrounding whitespace (trimmed)", () => {
    expect(isWholeNonNegativeIntegerString("  5  ")).toBe(true);
  });

  test("rejects negative numbers", () => {
    expect(isWholeNonNegativeIntegerString("-1")).toBe(false);
    expect(isWholeNonNegativeIntegerString("+1")).toBe(false);
  });

  test("rejects decimals and commas", () => {
    expect(isWholeNonNegativeIntegerString("1.0")).toBe(false);
    expect(isWholeNonNegativeIntegerString("1,0")).toBe(false);
  });

  test("rejects alphabetic strings", () => {
    expect(isWholeNonNegativeIntegerString("abc")).toBe(false);
    expect(isWholeNonNegativeIntegerString("12a3")).toBe(false);
  });
});

describe("containsOnlyWholeNonNegativeIntegerStrings", () => {
  test("returns undefined when all checked cells are empty", () => {
    const splittedLine = ["", "   ", ""];
    const result = containsOnlyWholeNonNegativeIntegerStrings(
      splittedLine,
      0,
      2,
      0,
      "test.csv"
    );
    expect(result).toBeUndefined();
  });

  test("returns undefined for valid whole non-negative integer strings (trimming applied)", () => {
    const splittedLine = [" 0", "42 ", "  7  "];
    const result = containsOnlyWholeNonNegativeIntegerStrings(
      splittedLine,
      0,
      2,
      0,
      "test.csv"
    );
    expect(result).toBeUndefined();
  });

  test("returns an error message when a checked cell contains a non-integer or negative value", () => {
    const splittedLine = ["1", "-1", ""]; // '-1' is invalid
    const result = containsOnlyWholeNonNegativeIntegerStrings(
      splittedLine,
      0,
      2,
      1, // csvLineIndex -> message should reference Zeile 2
      "test.csv"
    );
    expect(result).toBeTypeOf("string");
    expect(result).toContain(
      "dürfen nur nicht-negative, ganze Zahlen enthalten"
    );
    expect(result).toContain("test.csv");
    expect(result).toContain("Zeile 2");
  });

  test("returns an error for decimal values with whitespace (e.g. ' 3.14 ')", () => {
    const splittedLine = ["", " 3.14 ", ""];
    const result = containsOnlyWholeNonNegativeIntegerStrings(
      splittedLine,
      0,
      2,
      2,
      "decimals.csv"
    );
    expect(result).toBeTypeOf("string");
    expect(result).toContain(
      "dürfen nur nicht-negative, ganze Zahlen enthalten"
    );
    expect(result).toContain("decimals.csv");
    // csvLineIndex = 2 -> Zeile 3
    expect(result).toContain("Zeile 3");
  });
});

describe("ValidationUtils - getBewegungsinformationFromCsvLine", () => {
  test("extracts the three movement columns and joins with semicolon", () => {
    const csvColumnsAllValuesSet = [
      "10",
      "nachValue",
      "StrassenseiteValue",
      "RichtungValue",
      "extra",
    ];
    expect(getBewegungsinformationFromCsvLine(csvColumnsAllValuesSet)).toBe(
      "nachValue;StrassenseiteValue;RichtungValue"
    );

    const csvColumnsNachValueNotSet = [
      "10",
      "",
      "StrassenseiteValue",
      "RichtungValue",
      "extra",
    ];
    expect(getBewegungsinformationFromCsvLine(csvColumnsNachValueNotSet)).toBe(
      ";StrassenseiteValue;RichtungValue"
    );
  });

  test("works when some movement columns are missing or empty", () => {
    const csvColumnsShort = ["1", "onlyNach"];
    expect(getBewegungsinformationFromCsvLine(csvColumnsShort)).toBe(
      "onlyNach"
    );

    const csvColumnsEmpty = ["2", "", "", ""];
    expect(getBewegungsinformationFromCsvLine(csvColumnsEmpty)).toBe(";;");
  });
});

describe("ValidationUtils -> checkForIdenticalIntervallnummerJeBewegungsbeziehung", () => {
  function makeLine(
    intervall: number | string,
    nach = "nach",
    side = "side",
    richt = "dir"
  ) {
    return `${intervall};${nach};${side};${richt};extra`;
  }

  test("returns empty when same intervall numbers are used but different bewegungsinformation", () => {
    const csvLines = [makeLine(5, "A", "1", "X"), makeLine(5, "B", "2", "Y")];
    expect(
      checkForIdenticalIntervallnummerJeBewegungsbeziehung("file.csv", csvLines)
    ).toBe("");
  });

  test("detects duplicates within same bewegungsinformation and returns sorted unique intervallnumbers", () => {
    const csvLines = [
      makeLine(5, "A", "1", "X"),
      makeLine(5, "A", "1", "X"),
      makeLine(6, "A", "1", "X"),
      makeLine(6, "A", "1", "X"),
      makeLine(7, "B", "2", "Y"),
    ];
    expect(
      checkForIdenticalIntervallnummerJeBewegungsbeziehung("file.csv", csvLines)
    ).toBe(
      "In der CSV-Datei file.csv befinden sich mehrfach vorhandenen Zeitintervalle mit folgenden Intervallnummern: 5, 6"
    );
  });

  test("returns empty string for empty input", () => {
    expect(
      checkForIdenticalIntervallnummerJeBewegungsbeziehung("file.csv", [])
    ).toBe("");
  });

  test("detects duplicates when movement columns are empty (treated as same bewegungsinformation)", () => {
    const csvLines = [makeLine(10, "", "", ""), makeLine(10, "", "", "")];
    expect(
      checkForIdenticalIntervallnummerJeBewegungsbeziehung("file.csv", csvLines)
    ).toBe(
      "In der CSV-Datei file.csv befinden sich mehrfach vorhandenen Zeitintervalle mit folgenden Intervallnummern: 10"
    );
  });
});

describe("ValidationUtils -> checkForAlignmentOfIntervallsAccordingZaehldauer", () => {
  function makeLine(
    intervall: number,
    nach = "nach",
    side = "side",
    richt = "dir"
  ) {
    return `${intervall};${nach};${side};${richt};extra`;
  }

  test("returns empty string when all intervalls are within 24h bounds", () => {
    const csvLines = [makeLine(1), makeLine(96)];
    expect(
      checkForAlignmentOfIntervallsAccordingZaehldauer(
        "file.csv",
        csvLines,
        Zaehldauer.DAUER_24_STUNDEN
      )
    ).toBe("");
  });

  test("detects intervalls outside 24h bounds and returns them sorted and comma separated", () => {
    const csvLines = [makeLine(0), makeLine(97), makeLine(50)];
    expect(
      checkForAlignmentOfIntervallsAccordingZaehldauer(
        "f.csv",
        csvLines,
        Zaehldauer.DAUER_24_STUNDEN
      )
    ).toBe(
      "In der CSV-Datei f.csv befinden sich Intervallnummern die sich ausserhalb des Zählzeitraums definiert durch die Zähldauer befinden: 0, 97"
    );
  });

  test("returns empty for SONSTIGE regardless of intervall numbers", () => {
    const csvLines = [makeLine(0), makeLine(1000)];
    expect(
      checkForAlignmentOfIntervallsAccordingZaehldauer(
        "file.csv",
        csvLines,
        Zaehldauer.SONSTIGE
      )
    ).toBe("");
  });
});

describe("ValidationUtils -> checkForCorrectNumberOfIntervalsAccordingZaehldauer", () => {
  function makeLine(
    intervall: number,
    nach = "nach",
    side = "side",
    richt = "dir"
  ) {
    return `${intervall};${nach};${side};${richt};extra`;
  }

  test("returns empty when number of intervalls per bewegungsinformation matches expected for 2x4h", () => {
    const ranges = zaehldauerIntervallnummern.get(
      Zaehldauer.DAUER_2_X_4_STUNDEN
    )!;
    const csvLines: Array<string> = [];
    // build all intervall numbers for the zaehldauer
    ranges.forEach((r) => {
      for (let i = r.startIntervallnummer; i <= r.endeIntervallnummer; i++) {
        csvLines.push(makeLine(i));
      }
    });

    expect(
      checkForCorrectNumberOfIntervalsAccordingZaehldauer(
        "file.csv",
        csvLines,
        Zaehldauer.DAUER_2_X_4_STUNDEN
      )
    ).toBe("");
  });

  test("returns descriptive message when count does not match expected for 2x4h", () => {
    const ranges = zaehldauerIntervallnummern.get(
      Zaehldauer.DAUER_2_X_4_STUNDEN
    )!;
    const csvLines: Array<string> = [];
    // omit the last intervall to create a mismatch
    ranges.forEach((r) => {
      for (let i = r.startIntervallnummer; i <= r.endeIntervallnummer; i++) {
        csvLines.push(makeLine(i));
      }
    });
    // remove one line to be incorrect
    csvLines.pop();

    const expectedTotal = ranges.reduce(
      (acc, cur) => acc + cur.numberOfIntervals,
      0
    );
    const actualCount = csvLines.length;
    const expectedMessage = `Die Menge von ${actualCount} Intervallnummern in der CSV-Datei file.csv entspricht nicht der Anzahl der erwarteten Anzahl von ${expectedTotal} Intervallen der Zähldauer ${zaehldauerText.get(Zaehldauer.DAUER_2_X_4_STUNDEN)}.`;

    expect(
      checkForCorrectNumberOfIntervalsAccordingZaehldauer(
        "file.csv",
        csvLines,
        Zaehldauer.DAUER_2_X_4_STUNDEN
      )
    ).toBe(expectedMessage);
  });

  test("does not perform check for SONSTIGE and returns empty even if counts differ", () => {
    const csvLines = [makeLine(1), makeLine(2), makeLine(3)];
    expect(
      checkForCorrectNumberOfIntervalsAccordingZaehldauer(
        "file.csv",
        csvLines,
        Zaehldauer.SONSTIGE
      )
    ).toBe("");
  });
});
