import type {
  ExternalKnotenarmDTO,
  ExternalLaengsverkehrDTO,
  ExternalQuerungsverkehrDTO,
  ExternalVerkehrsbeziehungDTO,
} from "@/api/client";

import { shallowMount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Bewegungsrichtung, Himmelsrichtung, Zaehlart } from "@/api/client";
import KnotenLageForm from "@/components/zaehlung/form/KnotenLageForm.vue";
import { useKnotenarmFileStore } from "@/store/KnotenarmFileStore";
import { useValidationStore } from "@/store/ValidationStore";
import UploadedFileStatus from "@/types/enum/UploadedFileStatus";
import DefaultObjectCreator from "@/util/DefaultObjectCreator";

function createKnotenarmDTOWithNumber(number: number): ExternalKnotenarmDTO {
  return {
    nummer: number,
    strassenname: "",
    filename: "",
  };
}

describe("KnotenLageForm.vue - isKnotenarmRelevantForFileUpload", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("stores uploaded CSV lines separately from the knotenarm DTO", async () => {
    const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
    zaehlung.knotenarme = [createKnotenarmDTOWithNumber(1)];
    zaehlung.verkehrsbeziehungen = [
      { von: 1, nach: 2 },
    ] as Array<ExternalVerkehrsbeziehungDTO>;
    const wrapper = shallowMount(KnotenLageForm, {
      props: { height: "400px", modelValue: zaehlung },
    });
    const csv = [
      "Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;;;",
      "164701;;2026-03-10;1;;;;;;;",
      "Intervallnummer;nach;Strassenseite;Richtung;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss",
      "1;2;;;1;2;3;4;5;6;0",
    ];
    const vm = wrapper.vm as unknown as {
      files: Array<File>;
      readAndValidateUploadedCsvFiles: () => void;
    };
    vm.files = [new File([csv.join("\r\n")], "upload.csv")];
    vm.readAndValidateUploadedCsvFiles();

    await vi.waitFor(() => {
      expect(useKnotenarmFileStore().getFiledata(1)).toEqual(csv);
    });
    expect(zaehlung.knotenarme[0].filename).toBe("upload.csv");
    expect(zaehlung.knotenarme[0]).not.toHaveProperty("filedata");
    wrapper.unmount();
  });

  it("deletes CSV data and synchronizes filename and validation status", () => {
    const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
    const arm = createKnotenarmDTOWithNumber(1);
    arm.filename = "upload.csv";
    zaehlung.knotenarme = [arm];
    zaehlung.verkehrsbeziehungen = [
      { von: 1 },
    ] as Array<ExternalVerkehrsbeziehungDTO>;
    const fileStore = useKnotenarmFileStore();
    fileStore.setFiledata(1, ["CSV-Inhalt"]);
    fileStore.setFiledata(2, ["Andere CSV"]);
    const validationStore = useValidationStore();
    validationStore.initUploadedFileStatus([arm]);
    const wrapper = shallowMount(KnotenLageForm, {
      props: { height: "400px", modelValue: zaehlung },
    });

    const vm = wrapper.vm as unknown as {
      deleteFile: (nummer: number) => void;
    };
    vm.deleteFile(1);

    expect(fileStore.getFiledata(1)).toEqual([]);
    expect(fileStore.getFiledata(2)).toEqual(["Andere CSV"]);
    expect(arm.filename).toBe("");
    expect(validationStore.uploadedFilesChanged).toBe(true);
    expect(validationStore.isSavingPossible).toBe(true);
    validationStore.setUploadedFileStatus(arm, UploadedFileStatus.INVALID);
    expect(validationStore.isSavingPossible).toBe(false);
    wrapper.unmount();
  });

  it("ignores pending CSV reads after the editing session has been reset", () => {
    const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
    zaehlung.knotenarme = [createKnotenarmDTOWithNumber(1)];
    zaehlung.verkehrsbeziehungen = [
      { von: 1 },
    ] as Array<ExternalVerkehrsbeziehungDTO>;
    const wrapper = shallowMount(KnotenLageForm, {
      props: { height: "400px", modelValue: zaehlung },
    });
    const readSpy = vi
      .spyOn(FileReader.prototype, "readAsText")
      .mockImplementation(() => {});
    try {
      const vm = wrapper.vm as unknown as {
        files: Array<File>;
        readAndValidateUploadedCsvFiles: () => void;
      };
      vm.files = [new File(["CSV-Inhalt"], "upload.csv")];
      vm.readAndValidateUploadedCsvFiles();
      const fileStore = useKnotenarmFileStore();
      fileStore.reset();
      useValidationStore().initPendingUploadedFileReads();
      fileStore.setFiledata(1, ["Neue Bearbeitung"]);

      const reader = readSpy.mock.instances[0] as unknown as FileReader;
      reader.dispatchEvent(new Event("load"));

      expect(fileStore.getFiledata(1)).toEqual(["Neue Bearbeitung"]);
      expect(zaehlung.knotenarme[0].filename).toBe("");
      expect(useValidationStore().uploadedFilesChanged).toBe(false);
    } finally {
      readSpy.mockRestore();
      wrapper.unmount();
    }
  });

  it("returns true when the knotenarmnummer belongs to a relevant knotenarm", async () => {
    const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
    zaehlung.knotenarme = [
      createKnotenarmDTOWithNumber(1),
      createKnotenarmDTOWithNumber(3),
    ];
    zaehlung.verkehrsbeziehungen = [
      { von: 1 },
      { von: 3 },
    ] as Array<ExternalVerkehrsbeziehungDTO>;
    const wrapper = shallowMount(KnotenLageForm, {
      props: {
        height: "400px",
        modelValue: zaehlung,
      },
    });

    const vm: any = wrapper.vm;
    expect(vm.isKnotenarmRelevantForFileUpload(1)).toBe(true);
    expect(vm.isKnotenarmRelevantForFileUpload(3)).toBe(true);
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
    expect(vm.isKnotenarmRelevantForFileUpload(2)).toBe(false);
    expect(vm.isKnotenarmRelevantForFileUpload(3)).toBe(false);
  });

  describe("validateIntervallsWithRequiredRichtungsinformationAreExistent", () => {
    it("returns empty for QJS when all required nach+strassenseite combos exist", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.Qjs;
      zaehlung.verkehrsbeziehungen = [
        { von: 1, nach: 2, strassenseite: Himmelsrichtung.N },
        { von: 1, nach: 3, strassenseite: Himmelsrichtung.S },
      ] as Array<ExternalVerkehrsbeziehungDTO>;
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
      zaehlung.zaehlart = Zaehlart.Qjs;
      zaehlung.verkehrsbeziehungen = [
        { von: 1, nach: 2, strassenseite: Himmelsrichtung.N },
        { von: 1, nach: 3, strassenseite: Himmelsrichtung.S },
      ] as Array<ExternalVerkehrsbeziehungDTO>;
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
      zaehlung.zaehlart = Zaehlart.Fjs;
      zaehlung.laengsverkehr = [
        {
          knotenarm: 1,
          strassenseite: Himmelsrichtung.N,
          richtung: Bewegungsrichtung.Ein,
        },
        {
          knotenarm: 1,
          strassenseite: Himmelsrichtung.S,
          richtung: Bewegungsrichtung.Aus,
        },
      ] as Array<ExternalLaengsverkehrDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [
        `1;1;${Himmelsrichtung.N};${Bewegungsrichtung.Ein}`,
        `2;1;${Himmelsrichtung.S};${Bewegungsrichtung.Aus}`,
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
      zaehlung.zaehlart = Zaehlart.Fjs;
      zaehlung.laengsverkehr = [
        {
          knotenarm: 1,
          strassenseite: Himmelsrichtung.N,
          richtung: Bewegungsrichtung.Ein,
        },
        {
          knotenarm: 1,
          strassenseite: Himmelsrichtung.S,
          richtung: Bewegungsrichtung.Aus,
        },
      ] as Array<ExternalLaengsverkehrDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [
        `1;1;${Himmelsrichtung.N};${Bewegungsrichtung.Ein}`,
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
      expect(res).toContain(`${Himmelsrichtung.S} ${Bewegungsrichtung.Aus}`);
    });

    it("returns empty for QU when all required richtung values are present", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.Qu;
      zaehlung.querungsverkehr = [
        { knotenarm: 1, richtung: Himmelsrichtung.O },
        { knotenarm: 1, richtung: Himmelsrichtung.W },
      ] as Array<ExternalQuerungsverkehrDTO>;
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
      zaehlung.zaehlart = Zaehlart.Qu;
      zaehlung.querungsverkehr = [
        { knotenarm: 1, richtung: Himmelsrichtung.N },
        { knotenarm: 1, richtung: Himmelsrichtung.O },
      ] as Array<ExternalQuerungsverkehrDTO>;
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

    it("returns error for QJS when csv contains non-requested nach+strassenseite combos", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.Qjs;
      zaehlung.verkehrsbeziehungen = [
        { von: 1, nach: 2, strassenseite: Himmelsrichtung.N },
      ] as Array<ExternalVerkehrsbeziehungDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [`1;2;${Himmelsrichtung.N};`, `2;99;X;`];
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain(
        "In der CSV-Datei befinden sind nicht beauftragte Einträge"
      );
      expect(res).toContain("99 X");
    });

    it("returns error for FJS when csv contains strassenseite+richtung not requested", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.Fjs;
      zaehlung.laengsverkehr = [
        {
          knotenarm: 1,
          strassenseite: Himmelsrichtung.N,
          richtung: Bewegungsrichtung.Ein,
        },
      ] as Array<ExternalLaengsverkehrDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [
        `1;;${Himmelsrichtung.N};${Bewegungsrichtung.Ein}`,
        `2;;Z;EIN`,
      ];
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain(
        "In der CSV-Datei befinden sind nicht beauftragte Einträge für folgende Straßenseite- und Richtungsinformationen"
      );
      expect(res).toContain("Z EIN");
    });

    it("returns error for QU when csv contains richtung values not requested", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.Qu;
      zaehlung.querungsverkehr = [
        { knotenarm: 1, richtung: Himmelsrichtung.W },
      ] as Array<ExternalQuerungsverkehrDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = ["1;;;W", "1;;;X"];
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain(
        "In der CSV-Datei befinden sind nicht beauftragte Einträge für folgende Richtungsinformationen"
      );
      expect(res).toContain("X");
    });

    it("returns error for KFZ when csv contains not requested nach", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.N;
      zaehlung.kreisverkehr = false;
      zaehlung.verkehrsbeziehungen = [
        { von: 1, nach: 2 },
      ] as Array<ExternalVerkehrsbeziehungDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [`1;2; ;`, `2;99; ;`];
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain(
        "In der CSV-Datei befinden sind nicht beauftragte Einträge für folgende Zielknotenarme"
      );
      expect(res).toContain("99");
    });

    it("returns error for KFZ kreisverkehr when csv contains not requested nach codes", () => {
      const zaehlung = DefaultObjectCreator.createDefaultZaehlungDTO();
      zaehlung.zaehlart = Zaehlart.N;
      zaehlung.kreisverkehr = true;
      zaehlung.verkehrsbeziehungen = [
        {
          knotenarm: 1,
          hinein: true,
          vorbei: false,
          heraus: false,
        },
      ] as Array<ExternalVerkehrsbeziehungDTO>;
      const wrapper = shallowMount(KnotenLageForm, {
        props: { height: "400px", modelValue: zaehlung },
      });
      const vm: any = wrapper.vm;
      const csvDataWithoutHeader = [`1;e; ;`, `2;x; ;`];
      const res =
        vm.validateIntervallsWithRequiredRichtungsinformationAreExistent(
          1,
          csvDataWithoutHeader,
          zaehlung
        );
      expect(res).toBeTypeOf("string");
      expect(res).toContain(
        "In der CSV-Datei befinden sind nicht beauftragte Einträge für folgende Zielknotenarme"
      );
      expect(res).toContain("x");
    });
  });
});
