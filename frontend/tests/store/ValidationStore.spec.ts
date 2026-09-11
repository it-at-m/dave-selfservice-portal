import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useValidationStore } from "@/store/ValidationStore";

describe("ValidationStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("initially: no validations -> isSavingOfUploadedFilesPossible is false", () => {
    const store = useValidationStore();
    // ohne init sollte die computed property false sein (leere Map)
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);
  });

  it("initUploadedFilesForKnotenarme sets entries to false, when no filenames present", () => {
    const store = useValidationStore();
    const knotenarme = [{ nummer: 1 }, { nummer: 2 }];

    store.initUploadedFilesForKnotenarme(knotenarme as Array<KnotenarmDTO>);

    // nach init sind alle Einträge false => computed false
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // setze beide auf true => computed wird wahr
    store.setValidationStatusForKnotenarm(knotenarme[0] as any, true);
    expect(store.isSavingOfUploadedFilesPossible).toBe(false); // noch einer false
    store.setValidationStatusForKnotenarm(knotenarme[1] as any, true);
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);
  });

  it("initUploadedFilesForKnotenarme sets entries according to presence of filenames", () => {
    const store = useValidationStore();
    const knotenarme = [
      { nummer: 1, filename: "Knotenarm1.csv" },
      { nummer: 2 },
    ];

    store.initUploadedFilesForKnotenarme(knotenarme as Array<KnotenarmDTO>);

    // Nur der erste Knotenarm hat einen positiven Eintrag => computed ist false
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // Setze auch den 2ten Knotenarm auf true => computed wird wahr
    store.setValidationStatusForKnotenarm(knotenarme[1] as any, true);
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);
  });

  it("setValidationStatusForKnotenarm can add/update entries", () => {
    const store = useValidationStore();
    const newKnotenarm = { nummer: 99 };

    // ohne vorheriges init: set fügt Eintrag hinzu
    store.setValidationStatusForKnotenarm(newKnotenarm as KnotenarmDTO, true);
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);

    // wenn ein hinzugefügter Eintrag false ist, result false
    const another = { nummer: 100 };
    store.setValidationStatusForKnotenarm(another as KnotenarmDTO, false);
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // setze wieder true -> true (nur wenn alle true und nicht leer)
    store.setValidationStatusForKnotenarm(another as KnotenarmDTO, true);
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);
  });

  it("isSavingOfUploadedFilesPossible requires all entries true and not empty", () => {
    const store = useValidationStore();
    const knotenarme = [{ nummer: 1 }, { nummer: 2 }, { nummer: 3 }];

    store.initUploadedFilesForKnotenarme(knotenarme as Array<KnotenarmDTO>);

    // alle false -> false
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // setze zwei true, eines false -> false
    store.setValidationStatusForKnotenarm(knotenarme[0] as KnotenarmDTO, true);
    store.setValidationStatusForKnotenarm(knotenarme[1] as KnotenarmDTO, true);
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // setze letztes true -> true
    store.setValidationStatusForKnotenarm(knotenarme[2] as KnotenarmDTO, true);
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);
  });

  it("isSavingOfUploadedFilesPossible requires pendingUploadedFileReads to be 0", () => {
    const store = useValidationStore();
    const knotenarme = [{ nummer: 1 }, { nummer: 2 }, { nummer: 3 }];

    store.initUploadedFilesForKnotenarme(knotenarme as Array<KnotenarmDTO>);
    store.initPendingUploadedFileReads();

    // knotenarme alle false -> false
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // lese zwei Dateien
    store.startUploadedFileRead();
    store.startUploadedFileRead();
    store.finishUploadedFileRead();
    store.finishUploadedFileRead();

    // setze zwei true, eines false -> false
    store.setValidationStatusForKnotenarm(knotenarme[0] as KnotenarmDTO, true);
    store.setValidationStatusForKnotenarm(knotenarme[1] as KnotenarmDTO, true);
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // lese dritte Datei
    store.startUploadedFileRead();

    // setze letzte Datei true; Lesen noch nicht abgeschlossen (unrealistisch, nur für Test) -> false
    store.setValidationStatusForKnotenarm(knotenarme[2] as KnotenarmDTO, true);
    expect(store.isSavingOfUploadedFilesPossible).toBe(false);

    // Lesen abschließen -> true
    store.finishUploadedFileRead();
    expect(store.isSavingOfUploadedFilesPossible).toBe(true);
  });
});
