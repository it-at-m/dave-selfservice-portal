import type ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import type LaengsverkehrDTO from "@/types/zaehlung/LaengsverkehrDTO";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { mount, VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { createVuetify } from "vuetify";

import ZaehlungDialog from "@/components/zaehlung/ZaehlungDialog.vue";
import Bewegungsrichtung from "@/types/enum/Bewegungsrichtung";
import Himmelsrichtung from "@/types/enum/Himmelsrichtung";
import Quelle from "@/types/enum/Quelle";
import Status from "@/types/enum/Status";
import Wetter from "@/types/enum/Wetter";
import Zaehlart from "@/types/enum/Zaehlart";
import Zaehldauer from "@/types/enum/Zaehldauer";
import DefaultObjectCreator from "@/util/DefaultObjectCreator";

const vuetify = createVuetify();

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("prepareForSaveZaehlungFjs", () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    wrapper = mount(ZaehlungDialog, {
      global: {
        plugins: [vuetify, pinia],
      },
      props: {
        modelValue: DefaultObjectCreator.createDefaultZaehlungDTO(),
        showDialog: true,
      },
    });
  });

  it("sollte FJS-Verkehr aus CSV-Datei mit Strassenseite und Richtung parsen", () => {
    const instance = wrapper.vm as unknown as {
      prepareForSaveZaehlungFjs: (zaehlung: ZaehlungDTO) => void;
    };
    const zaehlung: ZaehlungDTO = {
      id: "2-test",
      entityVersion: 0,
      createdTime: "0",
      datum: "2026-03-10",
      zaehlart: Zaehlart.FJS,
      punkt: { lat: "0", lon: "0" },
      projektNummer: "P456",
      projektName: "Another Project",
      kreuzungsname: "Another Intersection",
      sonderzaehlung: false,
      kreisverkehr: false,
      kategorien: [],
      zaehlsituation: "Situation FJS",
      zaehlsituationErweitert: "Extended Situation FJS",
      zaehlIntervall: 15,
      zaehldauer: Zaehldauer.DAUER_24_STUNDEN,
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
          filedata: [
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
          ],
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
          richtung: Bewegungsrichtung.EIN,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
        {
          id: "21",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 1,
          strassenseite: Himmelsrichtung.O,
          richtung: Bewegungsrichtung.AUS,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
        {
          id: "22",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 1,
          strassenseite: Himmelsrichtung.W,
          richtung: Bewegungsrichtung.EIN,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
        {
          id: "23",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 1,
          strassenseite: Himmelsrichtung.W,
          richtung: Bewegungsrichtung.AUS,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
        {
          id: "24",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 2,
          strassenseite: Himmelsrichtung.N,
          richtung: Bewegungsrichtung.EIN,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
        {
          id: "25",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 2,
          strassenseite: Himmelsrichtung.N,
          richtung: Bewegungsrichtung.AUS,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
        {
          id: "26",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 2,
          strassenseite: Himmelsrichtung.S,
          richtung: Bewegungsrichtung.EIN,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
        {
          id: "27",
          entityVersion: 0,
          createdTime: "0",
          knotenarm: 2,
          strassenseite: Himmelsrichtung.S,
          richtung: Bewegungsrichtung.AUS,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
      ],
      zaehlstelleNummer: "Z456",
      zaehlstelleStadtbezirk: "District B",
      zaehlstellePunkt: { lat: "0", lon: "0" },
      zaehlstelleKommentar: "Comment FJS",
      unreadMessagesDienstleister: false,
    };

    instance.prepareForSaveZaehlungFjs(zaehlung);

    // Prüfen: 2 Laengsverkehrsrichtungen (O/EIN, W/AUS) wurden mit Daten gefüllt
    expect(zaehlung.laengsverkehr.length).toBe(8); // alle 8 wurden initialisiert

    // O/EIN
    const oEin = zaehlung.laengsverkehr.find(
      (v) =>
        v.strassenseite === Himmelsrichtung.O &&
        v.richtung === Bewegungsrichtung.EIN
    ) as LaengsverkehrDTO;
    expect(oEin).toBeDefined();
    expect(oEin?.zeitintervalle.length).toBe(2);
    expect(oEin?.zeitintervalle[0]).toEqual({
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
    expect(oEin?.zeitintervalle[1]).toEqual({
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
    const oAus = zaehlung.laengsverkehr.find(
      (v) =>
        v.strassenseite === Himmelsrichtung.O &&
        v.richtung === Bewegungsrichtung.AUS
    ) as LaengsverkehrDTO;
    expect(oAus).toBeDefined();
    expect(oAus?.zeitintervalle.length).toBe(2);
    expect(oAus?.zeitintervalle[0]).toEqual({
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
    expect(oAus?.zeitintervalle[1]).toEqual({
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
    const wAus = zaehlung.laengsverkehr.find(
      (v) =>
        v.strassenseite === Himmelsrichtung.W &&
        v.richtung === Bewegungsrichtung.AUS
    ) as LaengsverkehrDTO;
    expect(wAus).toBeDefined();
    expect(wAus?.zeitintervalle.length).toBe(2);
    expect(wAus?.zeitintervalle[0]).toEqual({
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
    expect(wAus?.zeitintervalle[1]).toEqual({
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
    const wEin = zaehlung.laengsverkehr.find(
      (v) =>
        v.strassenseite === Himmelsrichtung.W &&
        v.richtung === Bewegungsrichtung.EIN
    ) as LaengsverkehrDTO;
    expect(wEin).toBeDefined();
    expect(wEin?.zeitintervalle.length).toBe(2);
    expect(wEin?.zeitintervalle[0]).toEqual({
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
    expect(wEin?.zeitintervalle[1]).toEqual({
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
