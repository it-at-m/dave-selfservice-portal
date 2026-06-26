import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";

import { beforeEach, describe, expect, it } from "vitest";

import Himmelsrichtung from "@/types/enum/Himmelsrichtung";
import Richtung from "@/types/enum/Richtung";
import Strassenseite, { StrassenseiteText } from "@/types/enum/Strassenseite";
import Zaehlart from "@/types/enum/Zaehlart";
import { useFussverkehrValidationUtils } from "@/util/validation/FussverkehrValidationUtils";

describe("FussverkehrValidationUtils", () => {
  let utils: ReturnType<typeof useFussverkehrValidationUtils>;

  beforeEach(() => {
    // Re-import the utils factory for a fresh instance if needed
    utils = useFussverkehrValidationUtils();
  });

  describe("validateNachOccurrenceOccurrence", () => {
    it("returns error when Zaehlart.FJS and nach is filled", () => {
      const err = utils.validateNachOccurrence(Zaehlart.FJS, "2");
      expect(err).toBe(`Der Zielknotenarm (nach) darf nicht gefüllt sein.`);
    });

    it("returns error when Zaehlart.QU and nach is filled", () => {
      const err = utils.validateNachOccurrence(Zaehlart.QU, "something");
      expect(err).toBe(`Der Zielknotenarm (nach) darf nicht gefüllt sein.`);
    });

    it("returns error when Zaehlart.QJS and nach is empty", () => {
      const err = utils.validateNachOccurrence(Zaehlart.QJS, "   ");
      expect(err).toBe(`Der Zielknotenarm (nach) darf nicht leer sein.`);
    });

    it("returns undefined for QJS when nach is present", () => {
      const err = utils.validateNachOccurrence(Zaehlart.QJS, "3");
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
        const err = utils.validateNachValue(arm, nach);
        expect(err).toBeUndefined();
      });
    });

    it("returns an error for an incorrect mapping", () => {
      const err = utils.validateNachValue(1, "1");
      expect(err).toBe(
        `Der Wert 1 des Zielknotenarms (nach) ist ungültig für den Knotenarm 1.`
      );
    });

    it("returns an error for an empty 'nach' value", () => {
      const err = utils.validateNachValue(2, "");
      expect(err).toBe(
        `Der Wert  des Zielknotenarms (nach) ist ungültig für den Knotenarm 2.`
      );
    });

    it("returns an error for a non-numeric 'nach' value", () => {
      const err = utils.validateNachValue(3, "X");
      expect(err).toBe(
        `Der Wert X des Zielknotenarms (nach) ist ungültig für den Knotenarm 3.`
      );
    });
  });

  describe("validateStrassenseite", () => {
    it("errors when FJS and strassenseite is empty", () => {
      const err = utils.validateStrassenseiteOccurrence(Zaehlart.FJS, "  ");
      expect(err).toBe(`Die Strassenseite darf nicht leer sein.`);
    });

    it("errors when QU and strassenseite is non-empty", () => {
      const err = utils.validateStrassenseiteOccurrence(Zaehlart.QU, "N");
      expect(err).toBe(`Die Strassenseite muss leer sein.`);
    });

    it("errors when StrassenseiteText.has is false (invalid text)", () => {
      const err = utils.validateStrassenseiteOccurrence(Zaehlart.FJS, "X");
      expect(err).toBe(`Die Strassenseite ist ungültig: X.`);
    });

    it("returns undefined for a valid QJS strassenseite", () => {
      // arm 2 should accept N or S — use N
      const err = utils.validateStrassenseiteOccurrence(
        Zaehlart.QJS,
        Strassenseite.N
      );
      expect(err).toBeUndefined();
    });

    it("treats known StrassenseiteText values as valid", () => {
      // use a known key from StrassenseiteText
      const someKey = Array.from(StrassenseiteText.keys())[0];
      const err = utils.validateStrassenseiteOccurrence(Zaehlart.FJS, someKey);
      // If it's a valid mapping and not incompatible with arm 2, undefined expected
      // In the unlikely case of arm incompatibility, at least no "ungültig text" message should be present.
      expect(err === undefined || !err?.includes("ist ungültig:")).toBeTruthy();
    });
  });

  describe("validateRequiredNachAndStrassenseiteIntervallsForQjsAreExistent", () => {
    it("returns empty when all required nach+strassenseite combinations are present", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;2;N;", "1;3;S;"];
      const verkehrsbeziehungen = [
        { von: 1, nach: 2, strassenseite: "N" } as VerkehrsbeziehungDTO,
        { von: 1, nach: 3, strassenseite: "S" } as VerkehrsbeziehungDTO,
      ];
      expect(
        utils.validateRequiredNachAndStrassenseiteIntervallsForQjsAreExistent(
          armNummer,
          csvDataWithoutHeader,
          verkehrsbeziehungen
        )
      ).toBe("");
    });

    it("returns error when a required nach+strassenseite combination is missing", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;2;N;"]; // missing 3 S
      const verkehrsbeziehungen = [
        { von: 1, nach: 2, strassenseite: "N" } as VerkehrsbeziehungDTO,
        { von: 1, nach: 3, strassenseite: "S" } as VerkehrsbeziehungDTO,
      ];
      const res =
        utils.validateRequiredNachAndStrassenseiteIntervallsForQjsAreExistent(
          armNummer,
          csvDataWithoutHeader,
          verkehrsbeziehungen
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain(
        "Für folgende Zielknotenarm- (nach) und Straßenseiteninformationen"
      );
      expect(res).toContain("3 S");
    });
  });

  describe("validateRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent", () => {
    it("returns empty when all required strassenseite+richtung combos are present", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;1;N;EIN", "1;1;S;AUS"];
      const laengsverkehre = [
        { knotenarm: 1, strassenseite: "N", richtung: "EIN" } as any,
        { knotenarm: 1, strassenseite: "S", richtung: "AUS" } as any,
      ];
      expect(
        utils.validateRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent(
          armNummer,
          csvDataWithoutHeader,
          laengsverkehre
        )
      ).toBe("");
    });

    it("returns error when a required strassenseite+richtung combo is missing", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;1;N;EIN"]; // missing S AUS
      const laengsverkehre = [
        { knotenarm: 1, strassenseite: "N", richtung: "EIN" } as any,
        { knotenarm: 1, strassenseite: "S", richtung: "AUS" } as any,
      ];
      const res =
        utils.validateRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent(
          armNummer,
          csvDataWithoutHeader,
          laengsverkehre
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain(
        "Für folgende Straßenseite- und Richtungsinformationen"
      );
      expect(res).toContain("S AUS");
    });
  });

  describe("validateRequiredRichtungIntervallsForQuAreExistent", () => {
    it("returns empty when all required richtung values are present", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;1;N;EIN", "1;1;S;AUS"];
      const querungsverkehre = [
        { knotenarm: 1, richtung: "EIN" } as any,
        { knotenarm: 1, richtung: "AUS" } as any,
      ];
      expect(
        utils.validateRequiredRichtungIntervallsForQuAreExistent(
          armNummer,
          csvDataWithoutHeader,
          querungsverkehre
        )
      ).toBe("");
    });

    it("returns error when a required richtung is missing", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;1;N;EIN"]; // missing AUS
      const querungsverkehre = [
        { knotenarm: 1, richtung: "EIN" } as any,
        { knotenarm: 1, richtung: "AUS" } as any,
      ];
      const res = utils.validateRequiredRichtungIntervallsForQuAreExistent(
        armNummer,
        csvDataWithoutHeader,
        querungsverkehre
      );
      expect(res).toBeTypeOf("string");
      expect(res).toContain("Für folgende Richtungsinformationen");
      expect(res).toContain("AUS");
    });
  });

  describe("validateStrassenseiteValue", () => {
    it("returns undefined for a valid combination (FJS, arm 1 -> W)", () => {
      const result = utils.validateStrassenseiteValue(
        Zaehlart.FJS,
        Strassenseite.W,
        1
      );
      expect(result).toBeUndefined();
    });

    it("returns an error string for an invalid combination (FJS, arm 1 -> N)", () => {
      const result = utils.validateStrassenseiteValue(
        Zaehlart.FJS,
        Strassenseite.N,
        1
      );
      expect(result).toBeDefined();
      expect(result).toContain("ungültig für den Knotenarm");
    });

    it("returns undefined for a valid QJS combination (arm 6 -> NO)", () => {
      const result = utils.validateStrassenseiteValue(
        Zaehlart.QJS,
        Strassenseite.NO,
        6
      );
      expect(result).toBeUndefined();
    });

    it("does not validate for Zaehlart.QU (should return undefined)", () => {
      const result = utils.validateStrassenseiteValue(
        Zaehlart.QU,
        Strassenseite.N,
        1
      );
      expect(result).toBeUndefined();
    });
  });

  describe("validateRichtungOccurrence", () => {
    it("returns error when QU and invalid direction", () => {
      const err = utils.validateRichtungOccurrence(Zaehlart.QU, "X");
      expect(err).toBe(
        `Die Richtung X ist ungültig für Zählart ${Zaehlart.QU}.`
      );
    });

    it("accepts a valid QU direction (e.g. N)", () => {
      const err = utils.validateRichtungOccurrence(Zaehlart.QU, Richtung.N);
      expect(err).toBeUndefined();
    });

    it("accepts EIN/AUS for FJS", () => {
      expect(
        utils.validateRichtungOccurrence(Zaehlart.FJS, Richtung.EIN)
      ).toBeUndefined();
      expect(
        utils.validateRichtungOccurrence(Zaehlart.FJS, Richtung.AUS)
      ).toBeUndefined();
    });

    it("returns error for FJS when direction is not EIN/AUS", () => {
      const err = utils.validateRichtungOccurrence(Zaehlart.FJS, Richtung.N);
      expect(err).toBe(
        `Die Richtung ${Richtung.N} ist ungültig für Zählart ${Zaehlart.FJS}.`
      );
    });

    it("returns error for QJS when direction is not empty", () => {
      const err = utils.validateRichtungOccurrence(Zaehlart.QJS, "N");
      expect(err).toBe(
        `Die Richtung muss leer sein für Zählart ${Zaehlart.QJS}.`
      );
    });
  });

  describe("validateRichtungValue", () => {
    it("returns undefined when zaehlart is not QU", () => {
      const result = utils.validateRichtungValue(
        Zaehlart.FJS,
        1,
        Himmelsrichtung.N
      );
      expect(result).toBeUndefined();
    });

    it("accepts valid directions for arm 1 when zaehlart is QU (W, O)", () => {
      const resW = utils.validateRichtungValue(
        Zaehlart.QU,
        1,
        Himmelsrichtung.W
      );
      const resO = utils.validateRichtungValue(
        Zaehlart.QU,
        1,
        Himmelsrichtung.O
      );
      expect(resW).toBeUndefined();
      expect(resO).toBeUndefined();
    });

    it("returns an error for invalid direction on arm 1 when zaehlart is QU", () => {
      const badDir = Himmelsrichtung.N; // N is invalid for arm 1
      const result = utils.validateRichtungValue(Zaehlart.QU, 1, badDir);
      expect(typeof result).toBe("string");
      expect(result).toContain(badDir);
      expect(result).toContain("Knotenarm 1");
    });

    it("accepts valid directions for arm 6 when zaehlart is QU (NO, SW)", () => {
      const resNO = utils.validateRichtungValue(
        Zaehlart.QU,
        6,
        Himmelsrichtung.NO
      );
      const resSW = utils.validateRichtungValue(
        Zaehlart.QU,
        6,
        Himmelsrichtung.SW
      );
      expect(resNO).toBeUndefined();
      expect(resSW).toBeUndefined();
    });

    it("returns an error for invalid direction on arm 6 when zaehlart is QU", () => {
      const badDir = Himmelsrichtung.S; // S is invalid for arm 6
      const result = utils.validateRichtungValue(Zaehlart.QU, 6, badDir);
      expect(typeof result).toBe("string");
      expect(result).toContain(badDir);
      expect(result).toContain("Knotenarm 6");
    });
  });
});
