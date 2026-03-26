import type ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { mount, VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { createVuetify } from "vuetify";

import ZaehlungDialog from "@/components/zaehlung/ZaehlungDialog.vue";
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

describe("prepareForSaveZaehlung", () => {
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

  it("should properly transform CSV data into time intervals", () => {
    const instance = wrapper.vm as unknown as {
      prepareForSaveZaehlung: (zaehlung: ZaehlungDTO) => void;
    };
    const zaehlung: ZaehlungDTO = {
      id: "1",
      entityVersion: 0,
      createdTime: "0",
      datum: "2026-03-10",
      zaehlart: Zaehlart.FJS,
      punkt: { lat: "0", lon: "0" },
      projektNummer: "P123",
      projektName: "Project Name",
      kreuzungsname: "Intersection Name",
      sonderzaehlung: false,
      kreisverkehr: false,
      kategorien: [],
      zaehlsituation: "Situation",
      zaehlsituationErweitert: "Extended Situation",
      zaehlIntervall: 15,
      zaehldauer: Zaehldauer.DAUER_24_STUNDEN,
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
          filedata: [
            "Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;;;",
            "164701;;2026-03-10;1;;;;;;;",
            "Intervallnummer;nach;Strassenseite;Richtung;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss",
            "1;2;;;1;2;3;4;5;6;0",
            "2;2;;;1;1;1;1;1;1;0",
            "3;2;;;2;2;2;2;2;2;0",
            "4;2;;;3;3;3;3;3;3;0",
            "5;2;;;4;4;4;4;4;4;0",
            "6;2;;;5;5;5;5;5;5;0",
          ],
        },
        {
          id: "1",
          entityVersion: 0,
          createdTime: "0",
          nummer: 2,
          strassenname: "Street B",
          filename: "file2.csv",
          filedata: [
            "Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;;;",
            "164702;;2026-03-10;2;;;;;;;",
            "Intervallnummer;nach;Strassenseite;Richtung;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss",
            "1;1;;;7;6;5;4;3;2;1",
            "2;1;;;2;2;2;2;2;2;2",
            "3;1;;;3;3;3;3;3;3;3",
            "4;1;;;4;4;4;4;4;4;4",
            "5;1;;;5;5;5;5;5;5;5",
            "6;1;;;6;6;6;6;6;6;6",
          ],
        },
      ],
      verkehrsbeziehungen: [
        {
          id: "1",
          entityVersion: 0,
          createdTime: "0",
          von: 1,
          nach: 2,
          knotenarm: 1,
          hinein: false,
          heraus: true,
          vorbei: false,
          hochrechnungsfaktor: {
            id: "1",
            entityVersion: 0,
            createdTime: "0",
            matrix: "string",
            kfz: 1,
            sv: 1,
            gv: 1,
            defaultFaktor: true,
          },
          isKreuzung: false,
          strassenseite: {} as Himmelsrichtung,
          active: true,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
        {
          id: "2",
          entityVersion: 0,
          createdTime: "0",
          von: 2,
          nach: 1,
          knotenarm: 2,
          hinein: true,
          heraus: false,
          vorbei: true,
          hochrechnungsfaktor: {
            id: "1",
            entityVersion: 0,
            createdTime: "0",
            matrix: "string",
            kfz: 1,
            sv: 1,
            gv: 1,
            defaultFaktor: true,
          },
          isKreuzung: true,
          strassenseite: {} as Himmelsrichtung,
          active: true,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
      ],
      querungsverkehr: [],
      laengsverkehr: [],
      zaehlstelleNummer: "Z123",
      zaehlstelleStadtbezirk: "District A",
      zaehlstellePunkt: { lat: "0", lon: "0" },
      zaehlstelleKommentar: "Comment",
      unreadMessagesDienstleister: false,
    };

    instance.prepareForSaveZaehlung(zaehlung);

    expect(zaehlung.verkehrsbeziehungen).toBeDefined();
    expect(zaehlung.verkehrsbeziehungen.length).toBe(2);

    const expectedTimeIntervals1: ZeitintervallDTO[] = [
      {
        startUhrzeit: "00:00",
        endeUhrzeit: "00:15",
        pkw: 1,
        lkw: 2,
        lastzuege: 3,
        busse: 4,
        kraftraeder: 5,
        fahrradfahrer: 6,
        fussgaenger: 0,
      },
      {
        startUhrzeit: "00:15",
        endeUhrzeit: "00:30",
        pkw: 1,
        lkw: 1,
        lastzuege: 1,
        busse: 1,
        kraftraeder: 1,
        fahrradfahrer: 1,
        fussgaenger: 0,
      },
      {
        startUhrzeit: "00:30",
        endeUhrzeit: "00:45",
        pkw: 2,
        lkw: 2,
        lastzuege: 2,
        busse: 2,
        kraftraeder: 2,
        fahrradfahrer: 2,
        fussgaenger: 0,
      },
      {
        startUhrzeit: "00:45",
        endeUhrzeit: "01:00",
        pkw: 3,
        lkw: 3,
        lastzuege: 3,
        busse: 3,
        kraftraeder: 3,
        fahrradfahrer: 3,
        fussgaenger: 0,
      },
      {
        startUhrzeit: "01:00",
        endeUhrzeit: "01:15",
        pkw: 4,
        lkw: 4,
        lastzuege: 4,
        busse: 4,
        kraftraeder: 4,
        fahrradfahrer: 4,
        fussgaenger: 0,
      },
      {
        startUhrzeit: "01:15",
        endeUhrzeit: "01:30",
        pkw: 5,
        lkw: 5,
        lastzuege: 5,
        busse: 5,
        kraftraeder: 5,
        fahrradfahrer: 5,
        fussgaenger: 0,
      },
    ];

    const expectedTimeIntervals2: ZeitintervallDTO[] = [
      {
        startUhrzeit: "00:00",
        endeUhrzeit: "00:15",
        pkw: 7,
        lkw: 6,
        lastzuege: 5,
        busse: 4,
        kraftraeder: 3,
        fahrradfahrer: 2,
        fussgaenger: 1,
      },
      {
        startUhrzeit: "00:15",
        endeUhrzeit: "00:30",
        pkw: 2,
        lkw: 2,
        lastzuege: 2,
        busse: 2,
        kraftraeder: 2,
        fahrradfahrer: 2,
        fussgaenger: 2,
      },
      {
        startUhrzeit: "00:30",
        endeUhrzeit: "00:45",
        pkw: 3,
        lkw: 3,
        lastzuege: 3,
        busse: 3,
        kraftraeder: 3,
        fahrradfahrer: 3,
        fussgaenger: 3,
      },
      {
        startUhrzeit: "00:45",
        endeUhrzeit: "01:00",
        pkw: 4,
        lkw: 4,
        lastzuege: 4,
        busse: 4,
        kraftraeder: 4,
        fahrradfahrer: 4,
        fussgaenger: 4,
      },
      {
        startUhrzeit: "01:00",
        endeUhrzeit: "01:15",
        pkw: 5,
        lkw: 5,
        lastzuege: 5,
        busse: 5,
        kraftraeder: 5,
        fahrradfahrer: 5,
        fussgaenger: 5,
      },
      {
        startUhrzeit: "01:15",
        endeUhrzeit: "01:30",
        pkw: 6,
        lkw: 6,
        lastzuege: 6,
        busse: 6,
        kraftraeder: 6,
        fahrradfahrer: 6,
        fussgaenger: 6,
      },
    ];
    expect(zaehlung.verkehrsbeziehungen[0].zeitintervalle).toEqual(
      expectedTimeIntervals1
    );
    expect(zaehlung.verkehrsbeziehungen[1].zeitintervalle).toEqual(
      expectedTimeIntervals2
    );
  });
});
