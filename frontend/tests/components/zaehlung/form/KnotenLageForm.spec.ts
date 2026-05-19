import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";

import { shallowMount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeAll, describe, expect, it } from "vitest";

import KnotenLageForm from "@/components/zaehlung/form/KnotenLageForm.vue";
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
});
