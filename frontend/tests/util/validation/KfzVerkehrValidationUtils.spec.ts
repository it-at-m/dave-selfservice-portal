import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";

import { describe, expect, it } from "vitest";

import Fahrzeug from "@/types/enum/Fahrzeug";
import { useKfzVerkehrValidationUtils } from "@/util/validation/KfzVerkehrValidationUtils";

describe("useKfzVerkehrValidationUtils", () => {
  const utils = useKfzVerkehrValidationUtils();

  describe("validateNachOccurrence", () => {
    it("returns an error when nach is empty or whitespace", () => {
      expect(utils.validateNachOccurrence("   ")).toBe(
        "Der Zielknotenarm (nach) darf nicht leer sein."
      );
    });

    it("returns undefined when nach is non-empty", () => {
      expect(utils.validateNachOccurrence("3")).toBeUndefined();
    });
  });

  describe("validateNachValueForKreisverkehr", () => {
    it("returns undefined for valid values 'e','v','a'", () => {
      expect(utils.validateNachValueForKreisverkehr("e")).toBeUndefined();
      expect(utils.validateNachValueForKreisverkehr("v")).toBeUndefined();
      expect(utils.validateNachValueForKreisverkehr("a")).toBeUndefined();
    });

    it("returns an error for invalid value", () => {
      expect(utils.validateNachValueForKreisverkehr("x")).toBe(
        "Die 'nach'-Spalte darf nur 'e', 'v' oder 'a' enthalten."
      );
    });
  });

  describe("validateVerkehrsbeziehungForKreisverkehr", () => {
    it("returns undefined when a matching verkehrsbeziehung exists for 'e'", () => {
      const verkehrsbeziehungen = [
        {
          knotenarm: 1,
          hinein: true,
          vorbei: false,
          heraus: false,
        } as VerkehrsbeziehungDTO,
      ];
      expect(
        utils.validateVerkehrsbeziehungForKreisverkehr(
          verkehrsbeziehungen,
          1,
          "e"
        )
      ).toBeUndefined();
    });

    it("returns undefined when a matching verkehrsbeziehung exists for 'v'", () => {
      const verkehrsbeziehungen = [
        {
          knotenarm: 2,
          hinein: false,
          vorbei: true,
          heraus: false,
        } as VerkehrsbeziehungDTO,
      ];
      expect(
        utils.validateVerkehrsbeziehungForKreisverkehr(
          verkehrsbeziehungen,
          2,
          "v"
        )
      ).toBeUndefined();
    });

    it("returns an error when no matching verkehrsbeziehung exists", () => {
      const verkehrsbeziehungen: Array<VerkehrsbeziehungDTO> = [];
      expect(
        utils.validateVerkehrsbeziehungForKreisverkehr(
          verkehrsbeziehungen,
          1,
          "e"
        )
      ).toBe(
        "Für die Zähldaten ist keine Verkehrsbeziehung existent oder aktiv."
      );
    });
  });

  describe("validateNachValueForKreuzung", () => {
    it("returns undefined when a matching verkehrsbeziehung exists (trim and parse)", () => {
      const verkehrsbeziehungen = [{ von: 1, nach: 2 } as VerkehrsbeziehungDTO];
      expect(
        utils.validateNachValueForKreuzung(verkehrsbeziehungen, 1, " 2 ")
      ).toBeUndefined();
    });

    it("returns an error when no matching verkehrsbeziehung exists", () => {
      const verkehrsbeziehungen = [{ von: 1, nach: 3 } as VerkehrsbeziehungDTO];
      expect(
        utils.validateNachValueForKreuzung(verkehrsbeziehungen, 1, "2")
      ).toBe(
        "Für die Zähldaten ist keine Verkehrsbeziehung existent oder aktiv."
      );
    });
  });

  describe("validateNachValue", () => {
    it("returns undefined for valid mapping", () => {
      // arm 1 -> nach 3
      expect(utils.validateNachValue(1, "3")).toBeUndefined();
      // arm 4 -> nach 2
      expect(utils.validateNachValue(4, "2")).toBeUndefined();
      // arm 7 -> nach 5
      expect(utils.validateNachValue(7, "5")).toBeUndefined();
    });

    it("returns an error for invalid mapping", () => {
      expect(utils.validateNachValue(1, "2")).toBe(
        'Der Wert 2 für "nach" ist ungültig für den Knotenarm 1.'
      );
    });
  });

  describe("validateStrassenseiteRichtungOccurrence", () => {
    it("returns undefined when strassenseite is empty", () => {
      expect(
        utils.validateStrassenseiteRichtungOccurrence("   ")
      ).toBeUndefined();
    });

    it("returns an error when strassenseite is non-empty", () => {
      expect(utils.validateStrassenseiteRichtungOccurrence("left")).toBe(
        "Die Strassenseite muss leer sein."
      );
    });
  });

  describe("validateZaehlwerteOccurrence", () => {
    it("returns error if any element at index >=9 is non-empty (general rule)", () => {
      // index 9 (RAD) is non-empty -> general error triggered
      const splittedLine = Array(12).fill("");
      splittedLine[4] = "1";
      splittedLine[5] = "2";
      splittedLine[6] = "3";
      splittedLine[7] = "4";
      splittedLine[8] = "5";
      splittedLine[9] = "1"; // this will trigger the top-slice(9).some(Boolean) check
      expect(utils.validateZaehlwerteOccurrence([], splittedLine)).toBe(
        "Die Zählwerte sind ungültig für die Zählart."
      );
    });

    it("returns error when all KFZ columns (4..8) are empty", () => {
      const splittedLine = Array(12).fill("");
      // ensure indices >=9 are empty so the first rule does not trigger
      expect(utils.validateZaehlwerteOccurrence([], splittedLine)).toBe(
        "Die KFZ-Zähldaten dürfen nicht leer sein."
      );
    });

    it("returns error when RAD is requested but splittedLine[9] is empty", () => {
      const splittedLine = Array(12).fill("");
      // fill KFZ columns so they are not empty
      splittedLine[4] = "1";
      splittedLine[5] = "0";
      splittedLine[6] = "0";
      splittedLine[7] = "0";
      splittedLine[8] = "0";
      // ensure index 9 is empty so the specific RAD-message is checked
      const requestedKategorien = [Fahrzeug.RAD.valueOf()];
      expect(
        utils.validateZaehlwerteOccurrence(requestedKategorien, splittedLine)
      ).toBe('Der Zählwert von "RAD" darf nicht leer sein.');
    });

    it("demonstrates that non-empty RAD/FUSS at index 9/10 triggers the general error", () => {
      const splittedLine = Array(12).fill("");
      // fill KFZ columns so they are not empty
      splittedLine[4] = "1";
      splittedLine[5] = "1";
      splittedLine[6] = "1";
      splittedLine[7] = "1";
      splittedLine[8] = "1";
      // if RAD not requested but index9 non-empty, the top-slice check triggers general error
      splittedLine[9] = "2";
      expect(utils.validateZaehlwerteOccurrence([], splittedLine)).toBe(
        "Die Zählwerte sind ungültig für die Zählart."
      );
    });
  });
});
