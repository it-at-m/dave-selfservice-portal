import type { ExternalLaengsverkehrDTO } from "@/api/client";

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import {
  Bewegungsrichtung,
  ExternalZaehlungDTOFromJSON,
  Himmelsrichtung,
  Zaehldauer,
} from "@/api/client";
import { useKnotenarmFileStore } from "@/store/KnotenarmFileStore";
import Quelle from "@/types/enum/Quelle";
import Status from "@/types/enum/Status";
import Wetter from "@/types/enum/Wetter";
import Zaehlart from "@/types/enum/Zaehlart";
import { useCsvToZeitintervallTransformationUtils } from "@/util/CsvToZeitintervallTransformationUtils";

describe("prepareForSaveZaehlungFjs", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("sollte FJS-Verkehr aus CSV-Datei mit Strassenseite und Richtung parsen", () => {
    const csvToZeitintervallTransformationUtils =
      useCsvToZeitintervallTransformationUtils();
    useKnotenarmFileStore().setFiledata(1, [
      "Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;;;",
      "164704;FJS;2026-03-10;1;;;;;;;",
      "Intervallnummer;nach;Strassenseite;Richtung;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss",
      "1;;O;EIN;;;;;;1;1",
      "2;;O;EIN;;;;;;2;2",
      "1;;O;AUS;;;;;;3;4",
      "2;;O;AUS;;;;;;5;6",
      "1;;W;AUS;;;;;;1;1",
      "2;;W;AUS;;;;;;1;1",
      "1;;W;EIN;;;;;;5;6",
      "2;;W;EIN;;;;;;7;8",
    ]);
    const zaehlung = ExternalZaehlungDTOFromJSON({
      id: "2-test",
      entityVersion: 0,
      createdTime: "0",
      datum: "2026-03-10",
      zaehlart: Zaehlart.FJS,
      punkt: { lat: 0, lon: 0 },
      projektNummer: "P456",
      projektName: "Another Project",
      kreuzungsname: "Another Intersection",
      sonderzaehlung: false,
      kreisverkehr: false,
      kategorien: [],
      zaehlsituation: "Situation FJS",
      zaehlsituationErweitert: "Extended Situation FJS",
      zaehlIntervall: 15,
      zaehldauer: Zaehldauer.Dauer24Stunden,
      wetter: Wetter.NO_INFORMATION,
      status: Status.COUNTING,
      quelle: Quelle.MANUALLY,
      kommentar: "Comment FJS",
      knotenarme: [
        {
          id: "20",
          entityVersion: 0,
          createdTime: "0",
          nummer: 1,
          strassenname: "Street C",
          filename: "file_fjs.csv",
        },
      ],
      verkehrsbeziehungen: [],
      querungsverkehr: [],
      laengsverkehr: [
        {
          id: "20",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 1,
          strassenseite: Himmelsrichtung.O,
          richtung: Bewegungsrichtung.Ein,
          zeitintervalle: [],
        },
        {
          id: "21",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 1,
          strassenseite: Himmelsrichtung.O,
          richtung: Bewegungsrichtung.Aus,
          zeitintervalle: [],
        },
        {
          id: "22",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 1,
          strassenseite: Himmelsrichtung.W,
          richtung: Bewegungsrichtung.Ein,
          zeitintervalle: [],
        },
        {
          id: "23",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 1,
          strassenseite: Himmelsrichtung.W,
          richtung: Bewegungsrichtung.Aus,
          zeitintervalle: [],
        },
        {
          id: "24",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 2,
          strassenseite: Himmelsrichtung.N,
          richtung: Bewegungsrichtung.Ein,
          zeitintervalle: [],
        },
        {
          id: "25",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 2,
          strassenseite: Himmelsrichtung.N,
          richtung: Bewegungsrichtung.Aus,
          zeitintervalle: [],
        },
        {
          id: "26",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 2,
          strassenseite: Himmelsrichtung.S,
          richtung: Bewegungsrichtung.Ein,
          zeitintervalle: [],
        },
        {
          id: "27",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 2,
          strassenseite: Himmelsrichtung.S,
          richtung: Bewegungsrichtung.Aus,
          zeitintervalle: [],
        },
      ],
      zaehlstelleNummer: "Z456",
      zaehlstelleStadtbezirk: "District B",
      zaehlstellePunkt: { lat: 0, lon: 0 },
      zaehlstelleKommentar: "Comment FJS",
      unreadMessagesDienstleister: false,
    });

    csvToZeitintervallTransformationUtils.transformCsvDataInKnotenarmeToZeitintervalleAndAddToZaehlung(
      zaehlung
    );

    // Prüfen: 2 Laengsverkehrsrichtungen (O/EIN, W/AUS) wurden mit Daten gefüllt
    expect(zaehlung.laengsverkehr?.length).toBe(8); // alle 8 wurden initialisiert

    // O/EIN
    const oEin = zaehlung.laengsverkehr?.find(
      (v) =>
        v.strassenseite === Himmelsrichtung.O &&
        v.richtung === Bewegungsrichtung.Ein
    ) as ExternalLaengsverkehrDTO;
    expect(oEin).toBeDefined();
    expect(oEin?.zeitintervalle?.length).toBe(2);
    expect(oEin?.zeitintervalle?.[0]).toEqual({
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
    expect(oEin?.zeitintervalle?.[1]).toEqual({
      startUhrzeit: "00:15",
      endeUhrzeit: "00:30",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 2,
      fussgaenger: 2,
    });

    // O/AUS
    const oAus = zaehlung.laengsverkehr?.find(
      (v) =>
        v.strassenseite === Himmelsrichtung.O &&
        v.richtung === Bewegungsrichtung.Aus
    ) as ExternalLaengsverkehrDTO;
    expect(oAus).toBeDefined();
    expect(oAus?.zeitintervalle?.length).toBe(2);
    expect(oAus?.zeitintervalle?.[0]).toEqual({
      startUhrzeit: "00:00",
      endeUhrzeit: "00:15",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 3,
      fussgaenger: 4,
    });
    expect(oAus?.zeitintervalle?.[1]).toEqual({
      startUhrzeit: "00:15",
      endeUhrzeit: "00:30",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 5,
      fussgaenger: 6,
    });

    // W/AUS
    const wAus = zaehlung.laengsverkehr?.find(
      (v) =>
        v.strassenseite === Himmelsrichtung.W &&
        v.richtung === Bewegungsrichtung.Aus
    ) as ExternalLaengsverkehrDTO;
    expect(wAus).toBeDefined();
    expect(wAus?.zeitintervalle?.length).toBe(2);
    expect(wAus?.zeitintervalle?.[0]).toEqual({
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
    expect(wAus?.zeitintervalle?.[1]).toEqual({
      startUhrzeit: "00:15",
      endeUhrzeit: "00:30",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 1,
      fussgaenger: 1,
    });

    // W/EIN
    const wEin = zaehlung.laengsverkehr?.find(
      (v) =>
        v.strassenseite === Himmelsrichtung.W &&
        v.richtung === Bewegungsrichtung.Ein
    ) as ExternalLaengsverkehrDTO;
    expect(wEin).toBeDefined();
    expect(wEin?.zeitintervalle?.length).toBe(2);
    expect(wEin?.zeitintervalle?.[0]).toEqual({
      startUhrzeit: "00:00",
      endeUhrzeit: "00:15",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 5,
      fussgaenger: 6,
    });
    expect(wEin?.zeitintervalle?.[1]).toEqual({
      startUhrzeit: "00:15",
      endeUhrzeit: "00:30",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 7,
      fussgaenger: 8,
    });
  });
});
