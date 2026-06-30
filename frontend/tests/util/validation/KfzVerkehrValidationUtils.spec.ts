import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";

import { describe, expect, it } from "vitest";

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

  describe("validateRequiredNachIntervallsAreExistent", () => {
    it("returns empty when all necessary nach are present in csv data", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["10;2", "11;3", "12;2"];
      const verkehrsbeziehungen = [
        { von: 1, nach: 2 } as VerkehrsbeziehungDTO,
        { von: 1, nach: 3 } as VerkehrsbeziehungDTO,
      ];
      expect(
        utils.validateRequiredNachIntervallsAreExistent(
          armNummer,
          csvDataWithoutHeader,
          verkehrsbeziehungen
        )
      ).toBe("");
    });

    it("returns error listing missing nach values", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["10;2"]; // missing 3
      const verkehrsbeziehungen = [
        { von: 1, nach: 2 } as VerkehrsbeziehungDTO,
        { von: 1, nach: 3 } as VerkehrsbeziehungDTO,
      ];
      const result = utils.validateRequiredNachIntervallsAreExistent(
        armNummer,
        csvDataWithoutHeader,
        verkehrsbeziehungen
      );
      expect(result).toBeTypeOf("string");
      expect(result).toContain("Für folgende Zielknotenarme");
      expect(result).toContain("3");
    });
  });

  describe("validateRequiredNachIntervallsAreExistentForKreisverkehr", () => {
    it("returns empty when all necessary nach codes are present in csv data", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["10;e", "11;v", "12;e"];
      const verkehrsbeziehungen = [
        {
          knotenarm: 1,
          hinein: true,
          vorbei: false,
          heraus: false,
        } as VerkehrsbeziehungDTO,
        {
          knotenarm: 1,
          hinein: false,
          vorbei: true,
          heraus: false,
        } as VerkehrsbeziehungDTO,
      ];
      expect(
        utils.validateRequiredNachIntervallsAreExistentForKreisverkehr(
          armNummer,
          csvDataWithoutHeader,
          verkehrsbeziehungen
        )
      ).toBe("");
    });

    it("returns error listing missing nach codes", () => {
      const armNummer = 1;
      const csvDataWithoutHeader = ["10;e"]; // missing 'v'
      const verkehrsbeziehungen = [
        {
          knotenarm: 1,
          hinein: true,
          vorbei: false,
          heraus: false,
        } as VerkehrsbeziehungDTO,
        {
          knotenarm: 1,
          hinein: false,
          vorbei: true,
          heraus: false,
        } as VerkehrsbeziehungDTO,
      ];
      const result =
        utils.validateRequiredNachIntervallsAreExistentForKreisverkehr(
          armNummer,
          csvDataWithoutHeader,
          verkehrsbeziehungen
        );
      expect(result).toBeTypeOf("string");
      expect(result).toContain("Für folgende Zielknotenarme (nach)");
      expect(result).toContain("v");
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
});
