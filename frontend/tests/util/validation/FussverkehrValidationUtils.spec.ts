import type {
  ExternalLaengsverkehrDTO,
  ExternalQuerungsverkehrDTO,
  ExternalVerkehrsbeziehungDTO,
} from "@/api/client";

import { beforeEach, describe, expect, it } from "vitest";

import { Bewegungsrichtung, Himmelsrichtung, Zaehlart } from "@/api/client";
import { himmelsrichtungText } from "@/types/enum/HimmelsrichtungText";
import { useFussverkehrValidationUtils } from "@/util/validation/FussverkehrValidationUtils";

describe("FussverkehrValidationUtils", () => {
  let utils: ReturnType<typeof useFussverkehrValidationUtils>;

  beforeEach(() => {
    // Re-import the utils factory for a fresh instance if needed
    utils = useFussverkehrValidationUtils();
  });

  describe("validateNachOccurrenceOccurrence", () => {
    it("returns error when Zaehlart.Fjs and nach is filled", () => {
      const err = utils.validateNachOccurrence(Zaehlart.Fjs, "2");
      expect(err).toBe(`Der Zielknotenarm (nach) darf nicht gefüllt sein.`);
    });

    it("returns error when Zaehlart.Qu and nach is filled", () => {
      const err = utils.validateNachOccurrence(Zaehlart.Qu, "something");
      expect(err).toBe(`Der Zielknotenarm (nach) darf nicht gefüllt sein.`);
    });

    it("returns error when Zaehlart.Qjs and nach is empty", () => {
      const err = utils.validateNachOccurrence(Zaehlart.Qjs, "   ");
      expect(err).toBe(`Der Zielknotenarm (nach) darf nicht leer sein.`);
    });

    it("returns undefined for QJS when nach is present", () => {
      const err = utils.validateNachOccurrence(Zaehlart.Qjs, "3");
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
      const err = utils.validateStrassenseiteOccurrence(Zaehlart.Fjs, "  ");
      expect(err).toBe(`Die Strassenseite darf nicht leer sein.`);
    });

    it("errors when QU and strassenseite is non-empty", () => {
      const err = utils.validateStrassenseiteOccurrence(Zaehlart.Qu, "N");
      expect(err).toBe(`Die Strassenseite muss leer sein.`);
    });

    it("errors when StrassenseiteText.has is false (invalid text)", () => {
      const err = utils.validateStrassenseiteOccurrence(Zaehlart.Fjs, "X");
      expect(err).toBe(`Die Strassenseite ist ungültig: X.`);
    });

    it("returns undefined for a valid QJS strassenseite", () => {
      // arm 2 should accept N or S — use N
      const err = utils.validateStrassenseiteOccurrence(
        Zaehlart.Qjs,
        Himmelsrichtung.N
      );
      expect(err).toBeUndefined();
    });

    it("treats known StrassenseiteText values as valid", () => {
      // use a known key from StrassenseiteText
      const someKey = Array.from(himmelsrichtungText.keys())[0];
      const err = utils.validateStrassenseiteOccurrence(Zaehlart.Fjs, someKey);
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
        { von: 1, nach: 2, strassenseite: "N" } as ExternalVerkehrsbeziehungDTO,
        { von: 1, nach: 3, strassenseite: "S" } as ExternalVerkehrsbeziehungDTO,
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
        { von: 1, nach: 2, strassenseite: "N" } as ExternalVerkehrsbeziehungDTO,
        { von: 1, nach: 3, strassenseite: "S" } as ExternalVerkehrsbeziehungDTO,
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

  describe("validateNonRequiredNachAndStrassenseiteIntervallsForQjsAreExistent", () => {
    it("returns empty when csv contains only requested nach+strassenseite combinations", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;2;N;", "1;3;S;"];
      const verkehrsbeziehungen = [
        { von: 1, nach: 2, strassenseite: "N" } as ExternalVerkehrsbeziehungDTO,
        { von: 1, nach: 3, strassenseite: "S" } as ExternalVerkehrsbeziehungDTO,
      ];
      expect(
        utils.validateNonRequiredNachAndStrassenseiteIntervallsForQjsAreExistent(
          armNummer,
          csvDataWithoutHeader,
          verkehrsbeziehungen
        )
      ).toBe("");
    });

    it("returns error when csv contains nach+strassenseite not requested", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;2;N;", "1;99;X;"];
      const verkehrsbeziehungen = [
        { von: 1, nach: 2, strassenseite: "N" } as ExternalVerkehrsbeziehungDTO,
        { von: 1, nach: 3, strassenseite: "S" } as ExternalVerkehrsbeziehungDTO,
      ];
      const res =
        utils.validateNonRequiredNachAndStrassenseiteIntervallsForQjsAreExistent(
          armNummer,
          csvDataWithoutHeader,
          verkehrsbeziehungen
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain(
        "In der CSV-Datei befinden sind nicht beauftragte Einträge für folgende Zielknotenarm- (nach) und Straßenseiteninformationen"
      );
      expect(res).toContain("99 X");
    });
  });

  describe("validateRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent", () => {
    it("returns empty when all required strassenseite+richtung combos are present", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;;N;EIN", "1;;S;AUS"];
      const laengsverkehre = [
        {
          knotenarm: 1,
          strassenseite: "N",
          richtung: "EIN",
        } as ExternalLaengsverkehrDTO,
        {
          knotenarm: 1,
          strassenseite: "S",
          richtung: "AUS",
        } as ExternalLaengsverkehrDTO,
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
      const csvDataWithoutHeader = ["0;;N;EIN"]; // missing S AUS
      const laengsverkehre = [
        {
          knotenarm: 1,
          strassenseite: "N",
          richtung: "EIN",
        } as ExternalLaengsverkehrDTO,
        {
          knotenarm: 1,
          strassenseite: "S",
          richtung: "AUS",
        } as ExternalLaengsverkehrDTO,
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

  describe("validateNonRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent", () => {
    it("returns empty when csv contains only requested strassenseite+richtung combinations", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;;N;EIN", "1;;S;AUS"];
      const laengsverkehre = [
        {
          knotenarm: 1,
          strassenseite: "N",
          richtung: "EIN",
        } as ExternalLaengsverkehrDTO,
        {
          knotenarm: 1,
          strassenseite: "S",
          richtung: "AUS",
        } as ExternalLaengsverkehrDTO,
      ];
      expect(
        utils.validateNonRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent(
          armNummer,
          csvDataWithoutHeader,
          laengsverkehre
        )
      ).toBe("");
    });

    it("returns error when csv contains strassenseite+richtung not requested", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;;N;EIN", "1;;Z;EIN"];
      const laengsverkehre = [
        {
          knotenarm: 1,
          strassenseite: "N",
          richtung: "EIN",
        } as ExternalLaengsverkehrDTO,
        {
          knotenarm: 1,
          strassenseite: "S",
          richtung: "AUS",
        } as ExternalLaengsverkehrDTO,
      ];
      const res =
        utils.validateNonRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent(
          armNummer,
          csvDataWithoutHeader,
          laengsverkehre
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain(
        "In der CSV-Datei befinden sind nicht beauftragte Einträge für folgende Straßenseite- und Richtungsinformationen"
      );
      expect(res).toContain("Z EIN");
    });
  });

  describe("validateRequiredRichtungIntervallsForQuAreExistent", () => {
    it("returns empty when all required richtung values are present", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;;;W", "1;;;O"];
      const querungsverkehre = [
        { knotenarm: 1, richtung: "O" } as ExternalQuerungsverkehrDTO,
        { knotenarm: 1, richtung: "W" } as ExternalQuerungsverkehrDTO,
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
      const csvDataWithoutHeader = ["0;;;O"]; // missing AUS
      const querungsverkehre = [
        { knotenarm: 1, richtung: "O" } as ExternalQuerungsverkehrDTO,
        { knotenarm: 1, richtung: "W" } as ExternalQuerungsverkehrDTO,
      ];
      const res = utils.validateRequiredRichtungIntervallsForQuAreExistent(
        armNummer,
        csvDataWithoutHeader,
        querungsverkehre
      );
      expect(res).toBeTypeOf("string");
      expect(res).toContain("Für folgende Richtungsinformationen");
      expect(res).toContain("W");
    });
  });

  describe("validateNonRequiredRichtungIntervallsForQuAreExistent", () => {
    it("returns empty when csv contains only requested richtung values", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;;;W", "1;;;O"];
      const querungsverkehre = [
        { knotenarm: 1, richtung: "O" } as ExternalQuerungsverkehrDTO,
        { knotenarm: 1, richtung: "W" } as ExternalQuerungsverkehrDTO,
      ];
      expect(
        utils.validateNonRequiredRichtungIntervallsForQuAreExistent(
          armNummer,
          csvDataWithoutHeader,
          querungsverkehre
        )
      ).toBe("");
    });

    it("returns error when csv contains richtung values not requested", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["0;;;W", "1;;;X"];
      const querungsverkehre = [
        { knotenarm: 1, richtung: "O" } as ExternalQuerungsverkehrDTO,
        { knotenarm: 1, richtung: "W" } as ExternalQuerungsverkehrDTO,
      ];
      const res = utils.validateNonRequiredRichtungIntervallsForQuAreExistent(
        armNummer,
        csvDataWithoutHeader,
        querungsverkehre
      );
      expect(res).toBeTypeOf("string");
      expect(res).toContain(
        "In der CSV-Datei befinden sind nicht beauftragte Einträge für folgende Richtungsinformationen"
      );
      expect(res).toContain("X");
    });
  });

  describe("validateStrassenseiteValue", () => {
    it("returns undefined for a valid combination (FJS, arm 1 -> W)", () => {
      const result = utils.validateStrassenseiteValue(
        Zaehlart.Fjs,
        Himmelsrichtung.W,
        1
      );
      expect(result).toBeUndefined();
    });

    it("returns an error string for an invalid combination (FJS, arm 1 -> N)", () => {
      const result = utils.validateStrassenseiteValue(
        Zaehlart.Fjs,
        Himmelsrichtung.N,
        1
      );
      expect(result).toBeDefined();
      expect(result).toContain("ungültig für den Knotenarm");
    });

    it("returns undefined for a valid QJS combination (arm 6 -> NO)", () => {
      const result = utils.validateStrassenseiteValue(
        Zaehlart.Qjs,
        Himmelsrichtung.No,
        6
      );
      expect(result).toBeUndefined();
    });

    it("does not validate for Zaehlart.Qu (should return undefined)", () => {
      const result = utils.validateStrassenseiteValue(
        Zaehlart.Qu,
        Himmelsrichtung.N,
        1
      );
      expect(result).toBeUndefined();
    });
  });

  describe("validateRichtungOccurrence", () => {
    it("returns error when QU and invalid direction", () => {
      const err = utils.validateRichtungOccurrence(Zaehlart.Qu, "X");
      expect(err).toBe(
        `Die Richtung X ist ungültig für Zählart ${Zaehlart.Qu}.`
      );
    });

    it("accepts a valid QU direction (e.g. N)", () => {
      const err = utils.validateRichtungOccurrence(
        Zaehlart.Qu,
        Himmelsrichtung.N
      );
      expect(err).toBeUndefined();
    });

    it("accepts EIN/AUS for FJS", () => {
      expect(
        utils.validateRichtungOccurrence(Zaehlart.Fjs, Bewegungsrichtung.Ein)
      ).toBeUndefined();
      expect(
        utils.validateRichtungOccurrence(Zaehlart.Fjs, Bewegungsrichtung.Aus)
      ).toBeUndefined();
    });

    it("returns error for FJS when direction is not EIN/AUS", () => {
      const err = utils.validateRichtungOccurrence(
        Zaehlart.Fjs,
        Himmelsrichtung.N
      );
      expect(err).toBe(
        `Die Richtung ${Himmelsrichtung.N} ist ungültig für Zählart ${Zaehlart.Fjs}.`
      );
    });

    it("returns error for QJS when direction is not empty", () => {
      const err = utils.validateRichtungOccurrence(Zaehlart.Qjs, "N");
      expect(err).toBe(
        `Die Richtung muss leer sein für Zählart ${Zaehlart.Qjs}.`
      );
    });
  });

  describe("validateRichtungValue", () => {
    it("returns undefined when zaehlart is not QU", () => {
      const result = utils.validateRichtungValue(
        Zaehlart.Fjs,
        1,
        Himmelsrichtung.N
      );
      expect(result).toBeUndefined();
    });

    it("accepts valid directions for arm 1 when zaehlart is QU (W, O)", () => {
      const resW = utils.validateRichtungValue(
        Zaehlart.Qu,
        1,
        Himmelsrichtung.W
      );
      const resO = utils.validateRichtungValue(
        Zaehlart.Qu,
        1,
        Himmelsrichtung.O
      );
      expect(resW).toBeUndefined();
      expect(resO).toBeUndefined();
    });

    it("returns an error for invalid direction on arm 1 when zaehlart is QU", () => {
      const badDir = Himmelsrichtung.N; // N is invalid for arm 1
      const result = utils.validateRichtungValue(Zaehlart.Qu, 1, badDir);
      expect(typeof result).toBe("string");
      expect(result).toContain(badDir);
      expect(result).toContain("Knotenarm 1");
    });

    it("accepts valid directions for arm 6 when zaehlart is QU (NO, SW)", () => {
      const resNO = utils.validateRichtungValue(
        Zaehlart.Qu,
        6,
        Himmelsrichtung.No
      );
      const resSW = utils.validateRichtungValue(
        Zaehlart.Qu,
        6,
        Himmelsrichtung.Sw
      );
      expect(resNO).toBeUndefined();
      expect(resSW).toBeUndefined();
    });

    it("returns an error for invalid direction on arm 6 when zaehlart is QU", () => {
      const badDir = Himmelsrichtung.S; // S is invalid for arm 6
      const result = utils.validateRichtungValue(Zaehlart.Qu, 6, badDir);
      expect(typeof result).toBe("string");
      expect(result).toContain(badDir);
      expect(result).toContain("Knotenarm 6");
    });
  });
});
