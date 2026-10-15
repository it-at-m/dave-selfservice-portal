import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useValidationStore } from "@/store/ValidationStore";
import UploadedFileStatus from "@/types/enum/UploadedFileStatus";

describe("ValidationStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("initially: no validations -> isSavingOfUploadedFilesPossible is true", () => {
    const store = useValidationStore();
    // ohne init sollte die computed property true sein
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);
  });

  it("initUploadedFilesForKnotenarme sets entries to MISSING, when no filenames present", () => {
    const store = useValidationStore();
    const knotenarme = [{ nummer: 1 }, { nummer: 2 }];

    store.initUploadedFilesForKnotenarme(knotenarme as Array<KnotenarmDTO>);

    // nach init sind alle Einträge MISSING => computed true
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);

    // setze beide auf VALID => computed wird nach erstem Upload false, nach zweitem wieder true
    store.setUploadedFileStatus(knotenarme[0] as any, UploadedFileStatus.VALID);
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);
    store.setUploadedFileStatus(knotenarme[1] as any, UploadedFileStatus.VALID);
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);
  });

  it("initUploadedFilesForKnotenarme sets entries according to presence of filenames", () => {
    const store = useValidationStore();
    const knotenarme = [
      { nummer: 1, filename: "Knotenarm1.csv" },
      { nummer: 2 },
    ];

    store.initUploadedFilesForKnotenarme(knotenarme as Array<KnotenarmDTO>);

    // Nur der erste Knotenarm hat Status VALID => computed ist false
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // Setze auch den 2ten Knotenarm auf VALID => computed wird wahr
    store.setUploadedFileStatus(knotenarme[1] as any, UploadedFileStatus.VALID);
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);
  });

  it("setValidationStatusForKnotenarm can add/update entries", () => {
    const store = useValidationStore();
    const newKnotenarm = { nummer: 99 };

    // ohne vorheriges init: set fügt Eintrag hinzu
    store.setUploadedFileStatus(
      newKnotenarm as KnotenarmDTO,
      UploadedFileStatus.VALID
    );
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);

    // wenn ein hinzugefügter Eintrag INVALID ist, result false
    const another = { nummer: 100 };
    store.setUploadedFileStatus(
      another as KnotenarmDTO,
      UploadedFileStatus.INVALID
    );
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // setze auf VALID -> true
    store.setUploadedFileStatus(
      another as KnotenarmDTO,
      UploadedFileStatus.VALID
    );
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);
  });

  it("isSavingOfUploadedFilesPossible requires all entries MISSING or all VALID", () => {
    const store = useValidationStore();
    const knotenarme = [{ nummer: 1 }, { nummer: 2 }, { nummer: 3 }];

    store.initUploadedFilesForKnotenarme(knotenarme as Array<KnotenarmDTO>);

    // alle MISSING -> true
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);

    // setze zwei VALID, eines immer noch MISSING -> false
    store.setUploadedFileStatus(
      knotenarme[0] as KnotenarmDTO,
      UploadedFileStatus.VALID
    );
    store.setUploadedFileStatus(
      knotenarme[1] as KnotenarmDTO,
      UploadedFileStatus.VALID
    );
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // setze letztes VALID -> true
    store.setUploadedFileStatus(
      knotenarme[2] as KnotenarmDTO,
      UploadedFileStatus.VALID
    );
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);
  });

  it("isSavingOfUploadedFilesPossible requires pendingUploadedFileReads to be 0", () => {
    const store = useValidationStore();
    const knotenarme = [{ nummer: 1 }, { nummer: 2 }, { nummer: 3 }];

    store.initUploadedFilesForKnotenarme(knotenarme as Array<KnotenarmDTO>);
    store.initPendingUploadedFileReads();

    // alle Knotenarme haben Status MISSING -> true
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);

    // lese zwei Dateien
    store.startUploadedFileRead();
    store.startUploadedFileRead();
    store.finishUploadedFileRead();
    store.finishUploadedFileRead();

    // setze zwei VALID, eine MISSING -> false
    store.setUploadedFileStatus(
      knotenarme[0] as KnotenarmDTO,
      UploadedFileStatus.VALID
    );
    store.setUploadedFileStatus(
      knotenarme[1] as KnotenarmDTO,
      UploadedFileStatus.VALID
    );
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // lese dritte Datei
    store.startUploadedFileRead();

    // setze letzte Datei VALID; Lesen noch nicht abgeschlossen (unrealistisch, nur für Test) -> false
    store.setUploadedFileStatus(
      knotenarme[2] as KnotenarmDTO,
      UploadedFileStatus.VALID
    );
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // Lesen abschließen -> true
    store.finishUploadedFileRead();
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);
  });
});
