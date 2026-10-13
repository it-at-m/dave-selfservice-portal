import type HochrechnungsfaktorDTO from "@/domain/dto/HochrechnungsfaktorDTO";
import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";
import type ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { describe, expect, it } from "vitest";

import Himmelsrichtung from "@/types/enum/Himmelsrichtung";
import Quelle from "@/types/enum/Quelle";
import Status from "@/types/enum/Status";
import Wetter from "@/types/enum/Wetter";
import Zaehlart from "@/types/enum/Zaehlart";
import Zaehldauer from "@/types/enum/Zaehldauer";
import { useCsvToZeitintervallTransformationUtils } from "@/util/CsvToZeitintervallTransformationUtils";

const csvToZeitintervallTransformationUtils =
  useCsvToZeitintervallTransformationUtils();

describe("prepareForSaveZaehlungQjs", () => {
  it("should properly transform CSV data into time intervals", () => {
    const hfexample: HochrechnungsfaktorDTO = {
      id: "1",
      entityVersion: 0,
      createdTime: "0",
      matrix: "string",
      kfz: 1,
      sv: 1,
      gv: 1,
      defaultFaktor: true,
    };
    const zaehlung: ZaehlungDTO = {
      id: "1",
      entityVersion: 0,
      createdTime: "0",
      datum: "2026-03-10",
      zaehlart: Zaehlart.QJS,
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
            "1;2;N;;;;;;;6;0",
            "2;2;N;;;;;;;1;0",
            "3;2;N;;;;;;;2;0",
            "1;2;S;;;;;;;3;0",
            "2;2;S;;;;;;;4;0",
            "3;2;S;;;;;;;5;0",
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
            "1;1;N;;;;;;;2;1",
            "2;1;N;;;;;;;1;2",
            "3;1;N;;;;;;;2;3",
            "1;1;S;;;;;;;3;4",
            "2;1;S;;;;;;;4;5",
            "3;1;S;;;;;;;5;6",
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
          hochrechnungsfaktor: hfexample,
          isKreuzung: false,
          strassenseite: Himmelsrichtung.S,
          active: true,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
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
          hochrechnungsfaktor: hfexample,
          isKreuzung: false,
          strassenseite: Himmelsrichtung.N,
          active: true,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
        {
          id: "3",
          entityVersion: 0,
          createdTime: "0",
          von: 2,
          nach: 1,
          knotenarm: 2,
          hinein: true,
          heraus: false,
          vorbei: true,
          hochrechnungsfaktor: hfexample,
          isKreuzung: true,
          strassenseite: Himmelsrichtung.S,
          active: true,
          zeitintervalle: {} as ZeitintervallDTO[],
        },
        {
          id: "3",
          entityVersion: 0,
          createdTime: "0",
          von: 2,
          nach: 1,
          knotenarm: 2,
          hinein: true,
          heraus: false,
          vorbei: true,
          hochrechnungsfaktor: hfexample,
          isKreuzung: true,
          strassenseite: Himmelsrichtung.N,
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

    csvToZeitintervallTransformationUtils.transformCsvDataInKnotenarmeToZeitintervalleAndAddToZaehlung(
      zaehlung
    );

    expect(zaehlung.verkehrsbeziehungen).toBeDefined();
    expect(zaehlung.verkehrsbeziehungen.length).toBe(4);

    // von 1 → 2, N
    const von1nach2n = zaehlung.verkehrsbeziehungen.find(
      (v) =>
        v.strassenseite === Himmelsrichtung.N && v.von === 1 && v.nach === 2
    ) as VerkehrsbeziehungDTO;
    expect(von1nach2n).toBeDefined();
    expect(von1nach2n?.zeitintervalle.length).toBe(3);
    expect(von1nach2n?.zeitintervalle[0]).toEqual({
      startUhrzeit: "00:00",
      endeUhrzeit: "00:15",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 6,
      fussgaenger: 0,
    });
    expect(von1nach2n?.zeitintervalle[1]).toEqual({
      startUhrzeit: "00:15",
      endeUhrzeit: "00:30",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 1,
      fussgaenger: 0,
    });
    expect(von1nach2n?.zeitintervalle[2]).toEqual({
      startUhrzeit: "00:30",
      endeUhrzeit: "00:45",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 2,
      fussgaenger: 0,
    });

    // von 1 → 2, S
    const von1nach2s = zaehlung.verkehrsbeziehungen.find(
      (v) =>
        v.strassenseite === Himmelsrichtung.S && v.von === 1 && v.nach === 2
    ) as VerkehrsbeziehungDTO;
    expect(von1nach2s).toBeDefined();
    expect(von1nach2s?.zeitintervalle.length).toBe(3);
    expect(von1nach2s?.zeitintervalle[0]).toEqual({
      startUhrzeit: "00:00",
      endeUhrzeit: "00:15",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 3,
      fussgaenger: 0,
    });
    expect(von1nach2s?.zeitintervalle[1]).toEqual({
      startUhrzeit: "00:15",
      endeUhrzeit: "00:30",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 4,
      fussgaenger: 0,
    });
    expect(von1nach2s?.zeitintervalle[2]).toEqual({
      startUhrzeit: "00:30",
      endeUhrzeit: "00:45",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 5,
      fussgaenger: 0,
    });

    // von 2 → 1, N
    const von2nach1n = zaehlung.verkehrsbeziehungen.find(
      (v) =>
        v.strassenseite === Himmelsrichtung.N && v.von === 2 && v.nach === 1
    ) as VerkehrsbeziehungDTO;
    expect(von2nach1n).toBeDefined();
    expect(von2nach1n?.zeitintervalle.length).toBe(3);
    expect(von2nach1n?.zeitintervalle[0]).toEqual({
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
    expect(von2nach1n?.zeitintervalle[1]).toEqual({
      startUhrzeit: "00:15",
      endeUhrzeit: "00:30",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 1,
      fussgaenger: 2,
    });
    expect(von2nach1n?.zeitintervalle[2]).toEqual({
      startUhrzeit: "00:30",
      endeUhrzeit: "00:45",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 2,
      fussgaenger: 3,
    });

    // von 2 → 1, S
    const von2nach1s = zaehlung.verkehrsbeziehungen.find(
      (v) =>
        v.strassenseite === Himmelsrichtung.S && v.von === 2 && v.nach === 1
    ) as VerkehrsbeziehungDTO;
    expect(von2nach1s).toBeDefined();
    expect(von2nach1s?.zeitintervalle.length).toBe(3);
    expect(von2nach1s?.zeitintervalle[0]).toEqual({
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
    expect(von2nach1s?.zeitintervalle[1]).toEqual({
      startUhrzeit: "00:15",
      endeUhrzeit: "00:30",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 4,
      fussgaenger: 5,
    });
    expect(von2nach1s?.zeitintervalle[2]).toEqual({
      startUhrzeit: "00:30",
      endeUhrzeit: "00:45",
      pkw: undefined,
      lkw: undefined,
      lastzuege: undefined,
      busse: undefined,
      kraftraeder: undefined,
      fahrradfahrer: 5,
      fussgaenger: 6,
    });
  });
});
