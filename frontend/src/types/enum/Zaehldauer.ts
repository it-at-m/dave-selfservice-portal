import type KeyVal from "@/types/common/KeyVal";
import type { StartIntervallnummerEndeIntervallnummer } from "@/types/common/StartIntervallnummerEndeIntervallnummer";
import type { StartUhrzeitEndeUhrzeit } from "@/types/common/StartUhrzeitEndeUhrzeit";

export enum Zaehldauer {
  /**
   * Kurzzeiterhebung (6 bis 10 Uhr; 15 bis 19 Uhr)
   */
  DAUER_2_X_4_STUNDEN = "DAUER_2_X_4_STUNDEN",

  /**
   * 24 Stunden
   */
  DAUER_24_STUNDEN = "DAUER_24_STUNDEN",

  /**
   * 16 Stunden
   */
  DAUER_16_STUNDEN = "DAUER_16_STUNDEN",

  /**
   * Kurzzeiterhebung (6 bis 19Uhr)
   */
  DAUER_13_STUNDEN = "DAUER_13_STUNDEN",

  /**
   * Sonstige
   */
  SONSTIGE = "SONSTIGE",
}

export default Zaehldauer;

export const zaehldauerText = new Map<string, string>([
  [
    Zaehldauer.DAUER_2_X_4_STUNDEN,
    "Kurzzeiterhebung (6 bis 10 Uhr; 15 bis 19 Uhr)",
  ],
  [Zaehldauer.DAUER_13_STUNDEN, "13 Stunden Zählung (6 bis 19 Uhr)"],
  [Zaehldauer.DAUER_16_STUNDEN, "16 Stunden Zählung (6 bis 22 Uhr)"],
  [Zaehldauer.DAUER_24_STUNDEN, "Ganztageszählung"],
  [Zaehldauer.SONSTIGE, "Sonderzähldauer"],
]);

export const zaehldauerDropDown = new Array<KeyVal>(
  {
    value: Zaehldauer.DAUER_2_X_4_STUNDEN,
    title: zaehldauerText.get(Zaehldauer.DAUER_2_X_4_STUNDEN)!,
  },
  {
    value: Zaehldauer.DAUER_13_STUNDEN,
    title: zaehldauerText.get(Zaehldauer.DAUER_13_STUNDEN)!,
  },
  {
    value: Zaehldauer.DAUER_16_STUNDEN,
    title: zaehldauerText.get(Zaehldauer.DAUER_16_STUNDEN)!,
  },
  {
    value: Zaehldauer.DAUER_24_STUNDEN,
    title: zaehldauerText.get(Zaehldauer.DAUER_24_STUNDEN)!,
  },
  {
    value: Zaehldauer.SONSTIGE,
    title: zaehldauerText.get(Zaehldauer.SONSTIGE)!,
  }
);

export const zaehldauerIntervallnummern = new Map<
  Zaehldauer,
  Array<StartIntervallnummerEndeIntervallnummer>
>([
  [
    Zaehldauer.DAUER_2_X_4_STUNDEN,
    [
      {
        startIntervallnummer: 25,
        endeIntervallnummer: 40,
        numberOfIntervals: 16,
      },
      {
        startIntervallnummer: 61,
        endeIntervallnummer: 76,
        numberOfIntervals: 16,
      },
    ],
  ],
  [
    Zaehldauer.DAUER_13_STUNDEN,
    [
      {
        startIntervallnummer: 25,
        endeIntervallnummer: 76,
        numberOfIntervals: 52,
      },
    ],
  ],
  [
    Zaehldauer.DAUER_16_STUNDEN,
    [
      {
        startIntervallnummer: 25,
        endeIntervallnummer: 88,
        numberOfIntervals: 64,
      },
    ],
  ],
  [
    Zaehldauer.DAUER_24_STUNDEN,
    [
      {
        startIntervallnummer: 1,
        endeIntervallnummer: 96,
        numberOfIntervals: 96,
      },
    ],
  ],
  [Zaehldauer.SONSTIGE, []],
]);
