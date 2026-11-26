import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import {
  ExternalZaehlungDTOFromJSON,
  Himmelsrichtung,
  Zaehlart,
  Zaehldauer,
} from "@/api/client";
import { useKnotenarmFileStore } from "@/store/KnotenarmFileStore";
import Quelle from "@/types/enum/Quelle";
import Status from "@/types/enum/Status";
import Wetter from "@/types/enum/Wetter";
import { useCsvToZeitintervallTransformationUtils } from "@/util/CsvToZeitintervallTransformationUtils";

describe("prepareForSaveZaehlungQu", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("sollte Querungsverkehr aus CSV-Datei mit mehreren Knotenarmen parsen", () => {
    const csvToZeitintervallTransformationUtils =
      useCsvToZeitintervallTransformationUtils();
    const fileStore = useKnotenarmFileStore();
    fileStore.setFiledata(1, [
      "Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;;;",
      "164702;Qu;2026-03-10;1;;;;;;;",
      "Intervallnummer;nach;Strassenseite;Richtung;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss",
      "1;;;W;7;6;5;4;3;2;1",
      "2;;;W;3;3;3;3;3;3;3",
      "3;;;W;5;5;5;5;5;5;5",
      "1;;;O;2;2;2;2;2;2;2",
      "2;;;O;4;4;4;4;4;4;4",
      "3;;;O;6;6;6;6;6;6;6",
    ]);
    fileStore.setFiledata(2, [
      "Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;;;",
      "164703;Qu;2026-03-10;2;;;;;;;",
      "Intervallnummer;nach;Strassenseite;Richtung;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss",
      "1;;;N;1;1;1;1;1;1;1",
      "2;;;N;2;2;2;2;2;2;2",
      "1;;;S;3;3;3;3;3;3;3",
      "2;;;S;4;4;4;4;4;4;4",
    ]);
    const zaehlung = ExternalZaehlungDTOFromJSON({
      id: "1-test",
      entityVersion: 0,
      createdTime: "0",
      datum: "2026-03-10",
      zaehlart: Zaehlart.Qu,
      punkt: { lat: 0, lon: 0 },
      projektNummer: "P123",
      projektName: "Project Name",
      kreuzungsname: "Intersection Name",
      sonderzaehlung: false,
      kreisverkehr: false,
      kategorien: [],
      zaehlsituation: "Situation",
      zaehlsituationErweitert: "Extended Situation",
      zaehlIntervall: 15,
      zaehldauer: Zaehldauer.Dauer24Stunden,
      wetter: Wetter.NO_INFORMATION,
      status: Status.COUNTING,
      quelle: Quelle.MANUALLY,
      kommentar: "Comment",
      knotenarme: [
        {
          id: "0",
          entityVersion: 0,
          createdTime: "0",
          nummer: 1,
          strassenname: "Street A",
          filename: "file1.csv",
        },
        {
          id: "1",
          entityVersion: 0,
          createdTime: "0",
          nummer: 2,
          strassenname: "Street B",
          filename: "file2.csv",
        },
      ],
      verkehrsbeziehungen: [],
      querungsverkehr: [
        {
          id: "10",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 1,
          richtung: Himmelsrichtung.W,
          zeitintervalle: [],
        },
        {
          id: "11",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 1,
          richtung: Himmelsrichtung.O,
          zeitintervalle: [],
        },
        {
          id: "12",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 2,
          richtung: Himmelsrichtung.N,
          zeitintervalle: [],
        },
        {
          id: "13",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 2,
          richtung: Himmelsrichtung.S,
          zeitintervalle: [],
        },
      ],
      laengsverkehr: [],
      zaehlstelleNummer: "Z123",
      zaehlstelleStadtbezirk: "District A",
      zaehlstellePunkt: { lat: 0, lon: 0 },
      zaehlstelleKommentar: "Comment",
      unreadMessagesDienstleister: false,
    });

    csvToZeitintervallTransformationUtils.transformCsvDataInKnotenarmeToZeitintervalleAndAddToZaehlung(
      zaehlung
    );

    // Prüfen: 4 Richtungen insgesamt (W, O, N, S)
    expect(zaehlung.querungsverkehr?.length).toBe(4);

    // Knotenarm 1: W
    const wVerkehr = zaehlung.querungsverkehr?.find((q) => q.richtung === "W");
    expect(wVerkehr).toBeDefined();
    expect(wVerkehr?.zeitintervalle?.length).toBe(3);
    expect(wVerkehr?.zeitintervalle?.[0]).toEqual({
      startUhrzeit: "00:00",
      endeUhrzeit: "00:15",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 2,
      fussgaenger: 1,
    });
    expect(wVerkehr?.zeitintervalle?.[2]).toEqual({
      startUhrzeit: "00:30",
      endeUhrzeit: "00:45",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 5,
      fussgaenger: 5,
    });

    // Knotenarm 1: O
    const oVerkehr = zaehlung.querungsverkehr?.find((q) => q.richtung === "O");
    expect(oVerkehr).toBeDefined();
    expect(oVerkehr?.zeitintervalle?.length).toBe(3);
    expect(oVerkehr?.zeitintervalle?.[0]).toEqual({
      startUhrzeit: "00:00",
      endeUhrzeit: "00:15",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 2,
      fussgaenger: 2,
    });

    // Knotenarm 2: N
    const nVerkehr = zaehlung.querungsverkehr?.find((q) => q.richtung === "N");
    expect(nVerkehr).toBeDefined();
    expect(nVerkehr?.zeitintervalle?.length).toBe(2);
    expect(nVerkehr?.zeitintervalle?.[0]).toEqual({
      startUhrzeit: "00:00",
      endeUhrzeit: "00:15",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 1,
      fussgaenger: 1,
    });

    // Knotenarm 2: S
    const sVerkehr = zaehlung.querungsverkehr?.find((q) => q.richtung === "S");
    expect(sVerkehr).toBeDefined();
    expect(sVerkehr?.zeitintervalle?.length).toBe(2);
    expect(sVerkehr?.zeitintervalle?.[1]).toEqual({
      startUhrzeit: "00:15",
      endeUhrzeit: "00:30",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 4,
      fussgaenger: 4,
    });
  });
});
