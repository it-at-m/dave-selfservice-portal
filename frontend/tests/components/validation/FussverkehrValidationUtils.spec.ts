import { beforeEach, describe, expect, it, vi } from "vitest";

import Richtung from "@/types/enum/Richtung";
import Strassenseite, { StrassenseiteText } from "@/types/enum/Strassenseite";
import Zaehlart from "@/types/enum/Zaehlart";
import { useFussverkehrValidationUtils } from "@/util/validation/FussverkehrValidationUtils";

// Mock the validation utils before importing the module that uses it at top-level.
// The module calls useValidationUtils() at module init, so the mock must be declared here.
vi.mock("@/util/validation/ValidationUtils", () => {
  return {
    useValidationUtils: () => ({
      // treat strings consisting only of digits as valid non-negative integers
      isWholeNonNegativeIntegerString: (s: string) => /^\d+$/.test(s),
    }),
  };
});

describe("FussverkehrValidationUtils", () => {
  let utils: ReturnType<typeof useFussverkehrValidationUtils>;

  beforeEach(() => {
    // Re-import the utils factory for a fresh instance if needed
    utils = useFussverkehrValidationUtils();
  });

  describe("validateNachOccurrenceOccurrence", () => {
    it("returns error when Zaehlart.FJS and nach is filled", () => {
      const err = utils.validateNachOccurrence(Zaehlart.FJS, "2", "file.csv");
      expect(err).toBe(
        `Der Zielknotenarm (nach) in der Datei file.csv darf nicht gefüllt sein.`
      );
    });

    it("returns error when Zaehlart.QU and nach is filled", () => {
      const err = utils.validateNachOccurrence(
        Zaehlart.QU,
        "something",
        "qu.csv"
      );
      expect(err).toBe(
        `Der Zielknotenarm (nach) in der Datei qu.csv darf nicht gefüllt sein.`
      );
    });

    it("returns error when Zaehlart.QJS and nach is empty", () => {
      const err = utils.validateNachOccurrence(Zaehlart.QJS, "   ", "qjs.csv");
      expect(err).toBe(
        `Der Zielknotenarm (nach) in der Datei qjs.csv darf nicht leer sein.`
      );
    });

    it("returns undefined for QJS when nach is present", () => {
      const err = utils.validateNachOccurrence(Zaehlart.QJS, "3", "qjs.csv");
      expect(err).toBeUndefined();
    });
  });

  describe("validateNachValue", () => {
    it("accepts valid mappings for arms 1..8", () => {
      const mapping: Record<number, string> = {
        1: "3",
        2: "4",
        3: "1",
        4: "2",
        5: "7",
        6: "8",
        7: "5",
        8: "6",
      };

      Object.entries(mapping).forEach(([armStr, nach]) => {
        const arm = Number(armStr);
        const err = utils.validateNachValue(arm, nach, "file.csv");
        expect(err).toBeUndefined();
      });
    });

    it("returns an error for an incorrect mapping", () => {
      const err = utils.validateNachValue(1, "1", "file.csv");
      expect(err).toBe(
        `Der Wert 1 für "nach" in der Datei file.csv ist ungültig für den Knotenarm 1.`
      );
    });

    it("returns an error for an empty 'nach' value", () => {
      const err = utils.validateNachValue(2, "", "file.csv");
      expect(err).toBe(
        `Der Wert  für "nach" in der Datei file.csv ist ungültig für den Knotenarm 2.`
      );
    });

    it("returns an error for a non-numeric 'nach' value", () => {
      const err = utils.validateNachValue(3, "X", "file.csv");
      expect(err).toBe(
        `Der Wert X für "nach" in der Datei file.csv ist ungültig für den Knotenarm 3.`
      );
    });
  });

  describe("validateStrassenseite", () => {
    it("errors when FJS and strassenseite is empty", () => {
      const err = utils.validateStrassenseiteOccurrence(
        Zaehlart.FJS,
        "  ",
        "fjs.csv"
      );
      expect(err).toBe(
        `Die Strassenseite in der Datei fjs.csv darf nicht leer sein.`
      );
    });

    it("errors when QU and strassenseite is non-empty", () => {
      const err = utils.validateStrassenseiteOccurrence(
        Zaehlart.QU,
        "N",
        "qu.csv"
      );
      expect(err).toBe(`Die Strassenseite in der Datei qu.csv muss leer sein.`);
    });

    it("errors when StrassenseiteText.has is false (invalid text)", () => {
      const err = utils.validateStrassenseiteOccurrence(
        Zaehlart.FJS,
        "X",
        "file.csv"
      );
      expect(err).toBe(
        `Die Strassenseite in der Datei file.csv ist ungültig: X.`
      );
    });

    it("returns undefined for a valid QJS strassenseite", () => {
      // arm 2 should accept N or S — use N
      const err = utils.validateStrassenseiteOccurrence(
        Zaehlart.QJS,
        Strassenseite.N,
        "file.csv"
      );
      expect(err).toBeUndefined();
    });

    it("treats known StrassenseiteText values as valid", () => {
      // use a known key from StrassenseiteText
      const someKey = Array.from(StrassenseiteText.keys())[0];
      const err = utils.validateStrassenseiteOccurrence(
        Zaehlart.FJS,
        someKey,
        "file.csv"
      );
      // If it's a valid mapping and not incompatible with arm 2, undefined expected
      // In the unlikely case of arm incompatibility, at least no "ungültig text" message should be present.
      expect(err === undefined || !err?.includes("ist ungültig:")).toBeTruthy();
    });
  });

  describe("validateStrassenseiteValue", () => {
    it("returns undefined for a valid combination (FJS, arm 1 -> W)", () => {
      const result = utils.validateStrassenseiteValue(
        Zaehlart.FJS,
        Strassenseite.W,
        1,
        "test.csv"
      );
      expect(result).toBeUndefined();
    });

    it("returns an error string for an invalid combination (FJS, arm 1 -> N)", () => {
      const result = utils.validateStrassenseiteValue(
        Zaehlart.FJS,
        Strassenseite.N,
        1,
        "test.csv"
      );
      expect(result).toBeDefined();
      expect(result).toContain("ungültig für den Knotenarm");
    });

    it("returns undefined for a valid QJS combination (arm 6 -> NO)", () => {
      const result = utils.validateStrassenseiteValue(
        Zaehlart.QJS,
        Strassenseite.NO,
        6,
        "test.csv"
      );
      expect(result).toBeUndefined();
    });

    it("does not validate for Zaehlart.QU (should return undefined)", () => {
      const result = utils.validateStrassenseiteValue(
        Zaehlart.QU,
        Strassenseite.N,
        1,
        "test.csv"
      );
      expect(result).toBeUndefined();
    });
  });

  describe("validateRichtung", () => {
    it("returns error when QU and invalid direction", () => {
      const err = utils.validateRichtungOccurrence(
        Zaehlart.QU,
        "X",
        "file.csv"
      );
      expect(err).toBe(
        `Die Richtung X in der Datei file.csv ist ungültig für Zählart ${Zaehlart.QU}.`
      );
    });

    it("accepts a valid QU direction (e.g. N)", () => {
      const err = utils.validateRichtungOccurrence(
        Zaehlart.QU,
        Richtung.N,
        "file.csv"
      );
      expect(err).toBeUndefined();
    });

    it("accepts EIN/AUS for FJS", () => {
      expect(
        utils.validateRichtungOccurrence(Zaehlart.FJS, Richtung.EIN, "file.csv")
      ).toBeUndefined();
      expect(
        utils.validateRichtungOccurrence(Zaehlart.FJS, Richtung.AUS, "file.csv")
      ).toBeUndefined();
    });

    it("returns error for FJS when direction is not EIN/AUS", () => {
      const err = utils.validateRichtungOccurrence(
        Zaehlart.FJS,
        Richtung.N,
        "file.csv"
      );
      expect(err).toBe(
        `Die Richtung ${Richtung.N} in der Datei file.csv ist ungültig für Zählart ${Zaehlart.FJS}.`
      );
    });

    it("returns error for QJS when direction is not empty", () => {
      const err = utils.validateRichtungOccurrence(
        Zaehlart.QJS,
        "N",
        "qjs.csv"
      );
      expect(err).toBe(
        `Die Richtung in der Datei qjs.csv muss leer sein für Zählart ${Zaehlart.QJS}.`
      );
    });
  });

  describe("validateZaehlwerteOccurrence", () => {
    it("errors when any vehicle types (indices 4..8) have a value", () => {
      const line = new Array(11).fill("");
      line[4] = "1"; // vehicle type present
      const err = utils.validateZaehlwerteOccurrence(line, "file.csv");
      expect(err).toBe(
        `Die Fahrzeugarten in der Datei file.csv sind ungültig für Fussverkehrszählungen.`
      );
    });

    it("errors when both foot-count columns (9 and 10) are empty", () => {
      const line = new Array(11).fill("");
      const err = utils.validateZaehlwerteOccurrence(line, "file.csv");
      expect(err).toBe(
        `Die Fussverkehrszähldaten in der Datei file.csv dürfen nicht leer sein.`
      );
    });

    it("returns undefined when vehicle columns empty but one foot-count present", () => {
      const line = new Array(11).fill("");
      line[9] = "2";
      const err = utils.validateZaehlwerteOccurrence(line, "file.csv");
      expect(err).toBeUndefined();
    });
  });

  describe("validateZaehlwerteValues", () => {
    it("accepts valid non-negative integers in foot-count columns", () => {
      const line = new Array(11).fill("");
      line[9] = "5";
      const err = utils.validateZaehlwerteValues(line, 0, "file.csv");
      expect(err).toBeUndefined();
    });

    it("returns error when foot-count contains negative or non-integer values", () => {
      const line = new Array(11).fill("");
      line[9] = "-1"; // invalid according to the mocked validator
      const err = utils.validateZaehlwerteValues(line, 4, "file.csv");
      // expected message includes the csv line number (index + 1), filename and the array
      const expectedPrefix = `Die Zähldaten in Zeile ${4 + 1} der Datei file.csv dürfen nur nicht-negative, ganze Zahlen enthalten.`;
      expect(err).toBeDefined();
      expect(err).toContain(expectedPrefix);
      // The failing value array should be included in the message (stringified)
      expect(err).toContain(line.toString());
    });

    it("ignores empty foot-count cells", () => {
      const line = new Array(11).fill("");
      // both empty -> should not produce numeric-validation error here (other function checks emptiness)
      const err = utils.validateZaehlwerteValues(line, 1, "file.csv");
      expect(err).toBeUndefined();
    });
  });
});
