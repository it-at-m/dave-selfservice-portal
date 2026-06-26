import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";
import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";
import type LaengsverkehrDTO from "@/types/zaehlung/LaengsverkehrDTO";
import type QuerungsverkehrDTO from "@/types/zaehlung/QuerungsverkehrDTO";

import { shallowMount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeAll, describe, expect, it } from "vitest";

import KnotenLageForm from "@/components/zaehlung/form/KnotenLageForm.vue";
import Bewegungsrichtung from "@/types/enum/Bewegungsrichtung";
import Himmelsrichtung from "@/types/enum/Himmelsrichtung";
import Zaehlart from "@/types/enum/Zaehlart";
import DefaultObjectCreator from "@/util/DefaultObjectCreator";

function createKnotenarmDTOWithNumber(number: number): KnotenarmDTO {
  return {
    nummer: number,
    strassenname: "",
    filename: "",
    filedata: [],
    id: "",
    entityVersion: 0,
    createdTime: "",
  };
}

describe("KnotenLageForm.vue - isKnotenarmnummerInZaehlung", () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  it("returns true when the knotenarmnummer exists in zaehlung.knotenarme", async () => {
    const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
    zaehlung.knotenarme = [
      createKnotenarmDTOWithNumber(1),
      createKnotenarmDTOWithNumber(3),
    ];
    const wrapper = shallowMount(KnotenLageForm, {
      props: {
        height: "400px",
        modelValue: zaehlung,
      },
    });

    const vm: any = wrapper.vm;
    expect(vm.isKnotenarmnummerInZaehlung(1)).toBe(true);
    expect(vm.isKnotenarmnummerInZaehlung(3)).toBe(true);
  });

  it("returns false when the knotenarmnummer does not exist in zaehlung.knotenarme", async () => {
    const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
    zaehlung.knotenarme = [createKnotenarmDTOWithNumber(1)];
    const wrapper = shallowMount(KnotenLageForm, {
      props: {
        height: "400px",
        modelValue: zaehlung,
      },
    });

    const vm: any = wrapper.vm;
    expect(vm.isKnotenarmnummerInZaehlung(2)).toBe(false);
    expect(vm.isKnotenarmnummerInZaehlung(3)).toBe(false);
  });

  describe("validateIntervallsWithRequiredRichtungsinformationAreExistent", () => {
    it("returns empty for QJS when all required nach+strassenseite combos exist", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.QJS;
      zaehlung.verkehrsbeziehungen = [
        { von: 1, nach: 2, strassenseite: Himmelsrichtung.N },
        { von: 1, nach: 3, strassenseite: Himmelsrichtung.S },
      ] as Array<VerkehrsbeziehungDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [
        `1;2;${Himmelsrichtung.N};`,
        `2;3;${Himmelsrichtung.S};`,
      ];
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBe("");
    });

    it("returns error for QJS when a required combo is missing", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.QJS;
      zaehlung.verkehrsbeziehungen = [
        { von: 1, nach: 2, strassenseite: Himmelsrichtung.N },
        { von: 1, nach: 3, strassenseite: Himmelsrichtung.S },
      ] as Array<VerkehrsbeziehungDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [`1;2;${Himmelsrichtung.N};`];
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain(
        "Für folgende Zielknotenarm- (nach) und Straßenseiteninformationen"
      );
      expect(res).toContain(`${Himmelsrichtung.S}`);
    });

    it("returns empty for FJS when all required strassenseite+richtung combos exist", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.FJS;
      zaehlung.laengsverkehr = [
        {
          knotenarm: 1,
          strassenseite: Himmelsrichtung.N,
          richtung: Bewegungsrichtung.EIN,
        },
        {
          knotenarm: 1,
          strassenseite: Himmelsrichtung.S,
          richtung: Bewegungsrichtung.AUS,
        },
      ] as Array<LaengsverkehrDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [
        `1;1;${Himmelsrichtung.N};${Bewegungsrichtung.EIN}`,
        `2;1;${Himmelsrichtung.S};${Bewegungsrichtung.AUS}`,
      ];
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBe("");
    });

    it("returns error for FJS when a required strassenseite+richtung combo is missing", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.FJS;
      zaehlung.laengsverkehr = [
        {
          knotenarm: 1,
          strassenseite: Himmelsrichtung.N,
          richtung: Bewegungsrichtung.EIN,
        },
        {
          knotenarm: 1,
          strassenseite: Himmelsrichtung.S,
          richtung: Bewegungsrichtung.AUS,
        },
      ] as Array<LaengsverkehrDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [
        `1;1;${Himmelsrichtung.N};${Bewegungsrichtung.EIN}`,
      ];
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain(
        "Für folgende Straßenseite- und Richtungsinformationen"
      );
      expect(res).toContain(`${Himmelsrichtung.S} ${Bewegungsrichtung.AUS}`);
    });

    it("returns empty for QU when all required richtung values are present", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.QU;
      zaehlung.querungsverkehr = [
        { knotenarm: 1, richtung: Himmelsrichtung.O },
        { knotenarm: 1, richtung: Himmelsrichtung.W },
      ] as Array<QuerungsverkehrDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [
        `1;;;${Himmelsrichtung.W}`,
        `1;;;${Himmelsrichtung.O}`,
      ];
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBe("");
    });

    it("returns error for QU when a required richtung is missing", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.QU;
      zaehlung.querungsverkehr = [
        { knotenarm: 1, richtung: Himmelsrichtung.N },
        { knotenarm: 1, richtung: Himmelsrichtung.O },
      ] as Array<QuerungsverkehrDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [`1;;;${Himmelsrichtung.N}`];
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain("Für folgende Richtungsinformationen");
      expect(res).toContain(`${Himmelsrichtung.O}`);
    });

    it("returns empty for KFZ when required nach intervalls are present", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.N;
      zaehlung.kreisverkehr = false;
      zaehlung.verkehrsbeziehungen = [
        { von: 1, nach: 2 } as any,
        { von: 1, nach: 3 } as any,
      ];
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [`1;2; ;`, `2;3; ;`];
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBe("");
    });

    it("returns error for KFZ when a required nach is missing", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.N;
      zaehlung.kreisverkehr = false;
      zaehlung.verkehrsbeziehungen = [
        { von: 1, nach: 2 } as any,
        { von: 1, nach: 3 } as any,
      ];
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [`1;2; ;`]; // missing 3
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain("Für folgende Zielknotenarme");
      expect(res).toContain("3");
    });
  });
});
