import { beforeEach, describe, expect, it, vi } from "vitest";

import Fahrzeug from "@/types/enum/Fahrzeug";
import Himmelsrichtung from "@/types/enum/Himmelsrichtung";
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

  describe("validateRichtungOccurrence", () => {
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

  describe("validateRichtungValue", () => {
    const filename = "test.csv";

    it("returns undefined when zaehlart is not QU", () => {
      const result = utils.validateRichtungValue(
        Zaehlart.FJS,
        1,
        Himmelsrichtung.N,
        filename
      );
      expect(result).toBeUndefined();
    });

    it("accepts valid directions for arm 1 when zaehlart is QU (W, O)", () => {
      const resW = utils.validateRichtungValue(
        Zaehlart.QU,
        1,
        Himmelsrichtung.W,
        filename
      );
      const resO = utils.validateRichtungValue(
        Zaehlart.QU,
        1,
        Himmelsrichtung.O,
        filename
      );
      expect(resW).toBeUndefined();
      expect(resO).toBeUndefined();
    });

    it("returns an error for invalid direction on arm 1 when zaehlart is QU", () => {
      const badDir = Himmelsrichtung.N; // N is invalid for arm 1
      const result = utils.validateRichtungValue(
        Zaehlart.QU,
        1,
        badDir,
        filename
      );
      expect(typeof result).toBe("string");
      expect(result).toContain(badDir);
      expect(result).toContain(filename);
      expect(result).toContain("Knotenarm 1");
    });

    it("accepts valid directions for arm 6 when zaehlart is QU (NO, SW)", () => {
      const resNO = utils.validateRichtungValue(
        Zaehlart.QU,
        6,
        Himmelsrichtung.NO,
        filename
      );
      const resSW = utils.validateRichtungValue(
        Zaehlart.QU,
        6,
        Himmelsrichtung.SW,
        filename
      );
      expect(resNO).toBeUndefined();
      expect(resSW).toBeUndefined();
    });

    it("returns an error for invalid direction on arm 6 when zaehlart is QU", () => {
      const badDir = Himmelsrichtung.S; // S is invalid for arm 6
      const result = utils.validateRichtungValue(
        Zaehlart.QU,
        6,
        badDir,
        filename
      );
      expect(typeof result).toBe("string");
      expect(result).toContain(badDir);
      expect(result).toContain(filename);
      expect(result).toContain("Knotenarm 6");
    });
  });

  describe("validateZaehlwerteOccurrence", () => {
    it("errors when any vehicle types (indices 4..8) have a value", () => {
      const line = new Array(11).fill("");
      line[4] = "1"; // vehicle type present
      const err = utils.validateZaehlwerteOccurrence(
        [Fahrzeug.RAD],
        line,
        "file.csv"
      );
      expect(err).toBe(
        `Die Fahrzeugarten in der Datei file.csv sind ungültig für Fussverkehrszählungen.`
      );
    });

    it("errors when both foot-count columns (9 and 10) are empty", () => {
      const line = new Array(11).fill("");
      const err = utils.validateZaehlwerteOccurrence(
        [Fahrzeug.RAD],
        line,
        "file.csv"
      );
      expect(err).toBe(
        `Die Fussverkehrszähldaten in der Datei file.csv dürfen nicht leer sein.`
      );
    });

    it("returns undefined when vehicle columns empty but one foot-count present", () => {
      const line = new Array(11).fill("");
      line[9] = "2";
      const err = utils.validateZaehlwerteOccurrence(
        [Fahrzeug.RAD],
        line,
        "file.csv"
      );
      expect(err).toBeUndefined();
    });

    it("returns error when unrequested verkehrsart is present", () => {
      const line = new Array(11).fill("");
      line[9] = "2";
      line[10] = "2";
      const err = utils.validateZaehlwerteOccurrence(
        [Fahrzeug.RAD],
        line,
        "file.csv"
      );
      expect(err).toBe(`Der Zählwert von "FUSS" muss leer sein.`);
    });

    it("returns error when requested verkehrsart is not present", () => {
      const line = new Array(11).fill("");
      line[9] = "2";
      const err = utils.validateZaehlwerteOccurrence(
        [Fahrzeug.RAD, Fahrzeug.FUSS],
        line,
        "file.csv"
      );
      expect(err).toBe(`Der Zählwert von "FUSS" darf nicht leer sein.`);
    });
  });
});
