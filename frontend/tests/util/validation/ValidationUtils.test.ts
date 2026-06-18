import * as fs from "fs";
import * as path from "path";

import { describe, expect, test } from "vitest";

import { useValidationUtils } from "../../../src/util/validation/ValidationUtils";

const {
  isWholeNonNegativeIntegerString,
  getBewegungsinformationFromCsvLine,
  checkForIdenticalIntervallnummerJeBewegungsbeziehung,
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
  test("CSV mit vier Bewegungsbeziehungen und keine doppelten Intervallnummern", () => {
    const csvPath = path.join(
      __dirname,
      "../../testdata",
      "checkForIdenticalIntervallnummerJeBewegungsbeziehung_FjS_Knotenarm_1_24h_korrekt.csv"
    );
    const csvLinesWithoutHeader = loadCsvLinesFromLine4(csvPath);

    expect(
      checkForIdenticalIntervallnummerJeBewegungsbeziehung(
        "dateiname.csv",
        csvLinesWithoutHeader
      )
    ).toBe("");
  });

  test("CSV mit vier Bewegungsbeziehungen und doppelten Intervallnummern", () => {
    const csvPath = path.join(
      __dirname,
      "../../testdata",
      "checkForIdenticalIntervallnummerJeBewegungsbeziehung_FjS_Knotenarm_1_24h_mehrfach_vorhandene_Intervallnummer_je_Bewegungsbeziehung.csv"
    );
    const csvLinesWithoutHeader = loadCsvLinesFromLine4(csvPath);

    expect(
      checkForIdenticalIntervallnummerJeBewegungsbeziehung(
        "dateiname.csv",
        csvLinesWithoutHeader
      )
    ).toBe(
      "In der CSV-Datei dateiname.csv befinden sich mehrfach vorhandenen Zeitintervalle mit folgenden Intervallnummern: 5, 6"
    );
  });
});

// Unittestrumpf: lädt die CSV-Datei frontend/tests/util/validation/FjS_Knotenarm_1_24h.csv
// und stellt ab Zeile 4 (1-basierter Index) die Zeilen als Array<string> bereit
function loadCsvLinesFromLine4(csvFilePath: string): Array<string> {
  const absolutePath = path.resolve(csvFilePath);
  const content = fs.readFileSync(absolutePath, { encoding: "utf8" });
  const allLines = content.split(/\r?\n/);
  // ab Zeile 4 (1-basierter Index) -> slice(3)
  const linesFrom4 = allLines.slice(3);
  return linesFrom4;
}
