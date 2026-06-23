import { describe, expect, test } from "vitest";

import Fahrzeug from "@/types/enum/Fahrzeug";
import Zaehlart from "@/types/enum/Zaehlart";
import {
  Zaehldauer,
  zaehldauerIntervallnummern,
  zaehldauerText,
} from "@/types/enum/Zaehldauer";
import { useValidationUtils } from "@/util/validation/ValidationUtils";

const {
  isWholeNonNegativeIntegerString,
  containsOnlyWholeNonNegativeIntegerStrings,
  hasCsvDataLineCorrectNumberOfColumns,
  isIntervallnummerSetInCsvDataLine,
  hasAtLeastFourLinesOfData,
  hasMetadatenHeader,
  hasCorrectMetadatenHeader,
  hasMetadata,
  hasCorrectMetadata,
  hasZaehldatenHeader,
  hasCorrectZaehldatenHeader,
  EXPECTED_META_HEADER,
  EXPECTED_ZAEHLDATEN_HEADER,
  COLUMN_COUNT,
  checkForIdenticalIntervallnummerJeBewegungsbeziehung,
  checkForCorrectNumberOfIntervalsAccordingZaehldauer,
  checkForAlignmentOfIntervallsAccordingZaehldauer,
  getBewegungsinformationFromCsvLine,
  validateZaehlwerteOccurrence,
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
      2
    );
    expect(result).toBeUndefined();
  });

  test("returns undefined for valid whole non-negative integer strings (trimming applied)", () => {
    const splittedLine = [" 0", "42 ", "  7  "];
    const result = containsOnlyWholeNonNegativeIntegerStrings(
      splittedLine,
      0,
      2
    );
    expect(result).toBeUndefined();
  });

  test("returns an error message when a checked cell contains a non-integer or negative value", () => {
    const splittedLine = ["1", "-1", ""]; // '-1' is invalid
    const result = containsOnlyWholeNonNegativeIntegerStrings(
      splittedLine,
      0,
      2
    );
    expect(result).toBeTypeOf("string");
    expect(result).toContain(
      "dürfen nur nicht-negative, ganze Zahlen enthalten"
    );
  });

  test("returns an error for decimal values with whitespace (e.g. ' 3.14 ')", () => {
    const splittedLine = ["", " 3.14 ", ""];
    const result = containsOnlyWholeNonNegativeIntegerStrings(
      splittedLine,
      0,
      2
    );
    expect(result).toBeTypeOf("string");
    expect(result).toContain(
      "dürfen nur nicht-negative, ganze Zahlen enthalten"
    );
  });
});

describe("ValidationUtils -> isIntervallnummerSetInCsvDataLine", () => {
  test("returns empty when intervall number is valid whole non-negative integer", () => {
    const line = ["1", "a", "b"];
    expect(isIntervallnummerSetInCsvDataLine(line)).toBe("");
  });

  test("returns error when intervall number missing or empty", () => {
    expect(isIntervallnummerSetInCsvDataLine(["", "a"])).toBe(
      "Es ist keine Intervallnummer vorhanden."
    );
    expect(isIntervallnummerSetInCsvDataLine(["   ", "a"])).toBe(
      "Es ist keine Intervallnummer vorhanden."
    );
  });

  test("returns error for non-integer or negative or decimal values", () => {
    expect(isIntervallnummerSetInCsvDataLine(["1.0"])).toBe(
      "Es ist keine Intervallnummer vorhanden."
    );
    expect(isIntervallnummerSetInCsvDataLine(["-1"])).toBe(
      "Es ist keine Intervallnummer vorhanden."
    );
    expect(isIntervallnummerSetInCsvDataLine(["abc"])).toBe(
      "Es ist keine Intervallnummer vorhanden."
    );
  });
});

describe("ValidationUtils -> hasCsvDataLineCorrectNumberOfColumns", () => {
  test("returns empty when correct number of columns", () => {
    const correct = new Array(COLUMN_COUNT).fill("");
    expect(hasCsvDataLineCorrectNumberOfColumns(correct)).toBe("");
  });

  test("returns error message when too few columns", () => {
    const tooFew = new Array(Math.max(0, COLUMN_COUNT - 2)).fill("");
    const expected = `Je Zeile müssen ${COLUMN_COUNT} Spalten in der CSV-Datei enthalten sein.`;
    expect(hasCsvDataLineCorrectNumberOfColumns(tooFew)).toBe(expected);
  });

  test("returns error message when too many columns", () => {
    const tooMany = new Array(COLUMN_COUNT + 1).fill("");
    const expected = `Je Zeile müssen ${COLUMN_COUNT} Spalten in der CSV-Datei enthalten sein.`;
    expect(hasCsvDataLineCorrectNumberOfColumns(tooMany)).toBe(expected);
  });

  test("returns empty when correct number of columns with values", () => {
    const values = Array.from({ length: COLUMN_COUNT }, (_, i) => `${i}`);
    expect(hasCsvDataLineCorrectNumberOfColumns(values)).toBe("");
  });
});

describe("ValidationUtils -> hasAtLeastFourLinesOfData", () => {
  test("returns no error when csvData has 4 lines", () => {
    const shortCsv: Array<string> = ["a", "b", "c", "d"];
    const result = useValidationUtils().hasAtLeastFourLinesOfData(shortCsv);
    expect(result).toBe("");
  });

  test("returns error when csvData is undefined or null", () => {
    const result = (hasAtLeastFourLinesOfData as any)(undefined);
    expect(result).toBeTypeOf("string");
    expect(result).toContain("enthält keine Zähldaten");
  });

  test("returns error when csvData has less than 4 lines", () => {
    const shortCsv: Array<string> = ["a", "b", "c"];
    const result = useValidationUtils().hasAtLeastFourLinesOfData(shortCsv);
    expect(result).toBeTypeOf("string");
    expect(result).toContain("enthält keine Zähldaten");
  });

  test("returns empty when csvData has 4 or more lines", () => {
    const okCsv: Array<string> = ["h1", "h2", "h3", "line4"];
    const result = useValidationUtils().hasAtLeastFourLinesOfData(okCsv);
    expect(result).toBe("");
  });
});

describe("ValidationUtils -> hasMetadatenHeader", () => {
  test("returns error when meta header missing (empty array)", () => {
    const result = hasMetadatenHeader([]);
    expect(result).toBeTypeOf("string");
    expect(result).toContain("Header der Metadaten fehlen");
  });

  test("returns empty when meta header present", () => {
    const csv = ["meta", "a", "b", "c"];
    const result = hasMetadatenHeader(csv);
    expect(result).toBe("");
  });
});

describe("ValidationUtils -> hasCorrectMetadatenHeader", () => {
  test("returns error when header incorrect", () => {
    const csv = ["WRONG;HEADER;VALUE", "a", "b", "c"];
    const result = hasCorrectMetadatenHeader(csv);
    expect(result).toBeTypeOf("string");
    expect(result).toContain("Erwartet:");
    expect(result).toContain(EXPECTED_META_HEADER);
  });

  test("returns empty when header is correct", () => {
    const csv = [EXPECTED_META_HEADER, "a", "b", "c"];
    const result = hasCorrectMetadatenHeader(csv);
    expect(result).toBe("");
  });
});

describe("ValidationUtils -> hasZaehldatenHeader", () => {
  test("returns error when zaehldaten header missing (empty array)", () => {
    const result = hasZaehldatenHeader([]);
    expect(result).toBeTypeOf("string");
    expect(result).toContain("Header der Zähldaten fehlen");
  });

  test("returns error when zaehldaten header missing (too short)", () => {
    const result = hasZaehldatenHeader(["h1", "h2"]);
    expect(result).toBeTypeOf("string");
    expect(result).toContain("Header der Zähldaten fehlen");
  });

  test("returns empty when zaehldaten header present", () => {
    const csv = ["h0", "h1", "ZAeHLDATEN;HEADER;HERE", "h3"];
    const result = hasZaehldatenHeader(csv);
    expect(result).toBe("");
  });
});

describe("ValidationUtils -> hasCorrectZaehldatenHeader", () => {
  test("returns error when zaehldaten header incorrect", () => {
    const csv = ["h0", "h1", "WRONG;HEADER", "h3"];
    const result = hasCorrectZaehldatenHeader(csv);
    expect(result).toBeTypeOf("string");
    expect(result).toContain("Erwartet:");
    expect(result).toContain(EXPECTED_ZAEHLDATEN_HEADER);
  });

  test("returns empty when zaehldaten header correct", () => {
    const csv = ["h0", "h1", EXPECTED_ZAEHLDATEN_HEADER, "h3"];
    const result = hasCorrectZaehldatenHeader(csv);
    expect(result).toBe("");
  });
});

describe("ValidationUtils -> validateZaehlwerteOccurrence", () => {
  const vehicleIndexMap: Record<string, number> = {
    [Fahrzeug.PKW]: 4,
    [Fahrzeug.LKW]: 5,
    [Fahrzeug.LZ]: 6,
    [Fahrzeug.BUS]: 7,
    [Fahrzeug.KRAD]: 8,
    [Fahrzeug.RAD]: 9,
    [Fahrzeug.FUSS]: 10,
  };

  Object.entries(vehicleIndexMap).forEach(([veh, idx]) => {
    test(`returns empty when requested ${veh} present and others empty`, () => {
      const requested = [veh];
      const line = new Array(11).fill("");
      line[idx] = "1";
      const result = validateZaehlwerteOccurrence(requested, line);
      expect(result).toBe("");
    });

    test(`returns error when requested ${veh} missing`, () => {
      const requested = [veh];
      const line = new Array(11).fill("");
      const result = validateZaehlwerteOccurrence(requested, line);
      expect(result).toBeTypeOf("string");
      expect(result).toContain(veh);
      expect(result).toContain("darf nicht leer");
    });

    test(`returns error when ${veh} not requested but present`, () => {
      const requested: Array<string> = [];
      const line = new Array(11).fill("");
      line[idx] = "2";
      const result = validateZaehlwerteOccurrence(requested, line);
      expect(result).toBeTypeOf("string");
      expect(result).toContain(veh);
      expect(result).toContain("muss leer sein");
    });
  });

  test("returns error when one of multiple requested categories is missing", () => {
    const requested = [Fahrzeug.PKW, Fahrzeug.LKW];
    const line = new Array(11).fill("");
    line[4] = "1"; // PKW present
    // LKW missing
    const result = validateZaehlwerteOccurrence(requested, line);
    expect(result).toBeTypeOf("string");
    expect(result).toContain("LKW");
  });
});

describe("ValidationUtils -> hasMetadata", () => {
  test("returns error when metadata missing (empty)", () => {
    const resultShort = hasMetadata([]);
    expect(resultShort).toBeTypeOf("string");
    expect(resultShort).toContain("Metadaten fehlen");
  });

  test("returns error when metadata missing (too short)", () => {
    const resultShort = hasMetadata(["h1"]);
    expect(resultShort).toBeTypeOf("string");
    expect(resultShort).toContain("Metadaten fehlen");
  });

  test("returns empty when metadata present", () => {
    const csv = ["h1", "metaLine", "h3", "h4"];
    const result = hasMetadata(csv);
    expect(result).toBe("");
  });
});

describe("ValidationUtils -> hasCorrectMetadata", () => {
  test("returns empty when metadata matches expected values", () => {
    const knotenarmNr = 5;
    const zaehlung = {
      zaehlstelleNummer: "ZS123",
      zaehlart: Zaehlart.QJS,
      datum: "2023-01-01",
    };
    const metaZaehlart =
      zaehlung.zaehlart === Zaehlart.N ? "" : zaehlung.zaehlart;
    const expectedMetaDataArray = [
      zaehlung.zaehlstelleNummer,
      metaZaehlart,
      zaehlung.datum,
      knotenarmNr,
    ];
    while (expectedMetaDataArray.length < COLUMN_COUNT) {
      expectedMetaDataArray.push("");
    }
    const expectedMetaData = expectedMetaDataArray.join(";");

    const csv = ["h0", expectedMetaData, "h2", "h3"];
    const result = hasCorrectMetadata(csv, knotenarmNr, zaehlung as any);
    expect(result).toBe("");
  });

  test("returns error when metadata does not match expected values", () => {
    const knotenarmNr = 2;
    const zaehlung = {
      zaehlstelleNummer: "ZS999",
      zaehlart: Zaehlart.N,
      datum: "2022-12-31",
    };
    const metaZaehlart =
      zaehlung.zaehlart === Zaehlart.N ? "" : zaehlung.zaehlart;
    const expectedMetaDataArray = [
      zaehlung.zaehlstelleNummer,
      metaZaehlart,
      zaehlung.datum,
      knotenarmNr,
    ];
    while (expectedMetaDataArray.length < COLUMN_COUNT) {
      expectedMetaDataArray.push("");
    }
    const expectedMetaData = expectedMetaDataArray.join(";");

    const csv = ["h0", "WRONG;META;LINE", "h2", "h3"];
    const result = hasCorrectMetadata(csv, knotenarmNr, zaehlung as any);
    expect(result).toBeTypeOf("string");
    expect(result).toContain("Erwartet:");
    expect(result).toContain(expectedMetaData);
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
    expect(checkForIdenticalIntervallnummerJeBewegungsbeziehung(csvLines)).toBe(
      ""
    );
  });

  test("detects duplicates within same bewegungsinformation and returns sorted unique intervallnumbers", () => {
    const csvLines = [
      makeLine(5, "A", "1", "X"),
      makeLine(5, "A", "1", "X"),
      makeLine(6, "A", "1", "X"),
      makeLine(6, "A", "1", "X"),
      makeLine(7, "B", "2", "Y"),
    ];
    expect(checkForIdenticalIntervallnummerJeBewegungsbeziehung(csvLines)).toBe(
      "In der CSV-Datei befinden sich mehrfach vorhandenen Zeitintervalle mit folgenden Intervallnummern: 5, 6"
    );
  });

  test("returns empty string for empty input", () => {
    expect(checkForIdenticalIntervallnummerJeBewegungsbeziehung([])).toBe("");
  });

  test("detects duplicates when movement columns are empty (treated as same bewegungsinformation)", () => {
    const csvLines = [makeLine(10, "", "", ""), makeLine(10, "", "", "")];
    expect(checkForIdenticalIntervallnummerJeBewegungsbeziehung(csvLines)).toBe(
      "In der CSV-Datei befinden sich mehrfach vorhandenen Zeitintervalle mit folgenden Intervallnummern: 10"
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
        csvLines,
        Zaehldauer.DAUER_24_STUNDEN
      )
    ).toBe("");
  });

  test("detects intervalls outside 24h bounds and returns them sorted and comma separated", () => {
    const csvLines = [makeLine(0), makeLine(97), makeLine(50)];
    expect(
      checkForAlignmentOfIntervallsAccordingZaehldauer(
        csvLines,
        Zaehldauer.DAUER_24_STUNDEN
      )
    ).toBe(
      "In der CSV-Datei existieren folgende Intervallnummern die sich ausserhalb des Zählzeitraums definiert durch die Zähldauer Ganztageszählung befinden: 0, 97"
    );
  });

  test("returns empty for SONSTIGE regardless of intervall numbers", () => {
    const csvLines = [makeLine(0), makeLine(1000)];
    expect(
      checkForAlignmentOfIntervallsAccordingZaehldauer(
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

  test("returns empty when number of intervalls per bewegungsinformation matches expected for 2x4h (two bewegungsinformationen)", () => {
    const ranges = zaehldauerIntervallnummern.get(
      Zaehldauer.DAUER_2_X_4_STUNDEN
    )!;
    const csvLines: Array<string> = [];
    // build all intervall numbers for the zaehldauer for two different bewegungsinformationen (A and B)
    ranges.forEach((r) => {
      for (let i = r.startIntervallnummer; i <= r.endeIntervallnummer; i++) {
        // bewegungsinformation A
        csvLines.push(makeLine(i, "A", "1", "X"));
        // bewegungsinformation B
        csvLines.push(makeLine(i, "B", "2", "Y"));
      }
    });

    expect(
      checkForCorrectNumberOfIntervalsAccordingZaehldauer(
        csvLines,
        Zaehldauer.DAUER_2_X_4_STUNDEN
      )
    ).toBe("");
  });

  test("returns descriptive message when count does not match expected for 2x4h (one bewegungsinformation wrong)", () => {
    const ranges = zaehldauerIntervallnummern.get(
      Zaehldauer.DAUER_2_X_4_STUNDEN
    )!;
    const csvLines: Array<string> = [];
    // Build two bewegungsinformationen: A (correct), B (one missing intervall)
    // bewegungsinformation A
    ranges.forEach((r) => {
      for (let i = r.startIntervallnummer; i <= r.endeIntervallnummer; i++) {
        csvLines.push(makeLine(i, "A", "1", "X"));
      }
    });
    // bewegungsinformation B
    ranges.forEach((r) => {
      for (let i = r.startIntervallnummer; i <= r.endeIntervallnummer; i++) {
        csvLines.push(makeLine(i, "B", "2", "Y"));
      }
    });
    // remove one line from B to make it incorrect
    csvLines.pop();

    const expectedTotal = ranges.reduce(
      (acc, cur) => acc + cur.numberOfIntervals,
      0
    );
    // actual count for the offending bewegungsinformation (B) is expectedTotal - 1
    const actualCount = expectedTotal - 1;
    const expectedMessage = `Die Menge von ${actualCount} Intervallnummern in der CSV-Datei entspricht nicht der erwarteten Anzahl von ${expectedTotal} Intervallen der Zähldauer ${zaehldauerText.get(Zaehldauer.DAUER_2_X_4_STUNDEN)}.`;

    expect(
      checkForCorrectNumberOfIntervalsAccordingZaehldauer(
        csvLines,
        Zaehldauer.DAUER_2_X_4_STUNDEN
      )
    ).toBe(expectedMessage);
  });

  test("does not perform check for SONSTIGE and returns empty even if counts differ", () => {
    const csvLines = [makeLine(1), makeLine(2), makeLine(3)];
    expect(
      checkForCorrectNumberOfIntervalsAccordingZaehldauer(
        csvLines,
        Zaehldauer.SONSTIGE
      )
    ).toBe("");
  });
});
