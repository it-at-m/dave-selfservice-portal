import type { StartIntervallnummerEndeIntervallnummer } from "@/types/common/StartIntervallnummerEndeIntervallnummer";

import { Zaehldauer } from "@/api/client";

export const zaehldauerText = new Map<string, string>([
  [
    Zaehldauer.Dauer2X4Stunden,
    "Kurzzeiterhebung (6 bis 10 Uhr; 15 bis 19 Uhr)",
  ],
  [Zaehldauer.Dauer13Stunden, "13 Stunden Zählung (6 bis 19 Uhr)"],
  [Zaehldauer.Dauer16Stunden, "16 Stunden Zählung (6 bis 22 Uhr)"],
  [Zaehldauer.Dauer24Stunden, "Ganztageszählung"],
  [Zaehldauer.Sonstige, "Sonderzähldauer"],
]);

export const zaehldauerIntervallnummern = new Map<
  string,
  Array<StartIntervallnummerEndeIntervallnummer>
>([
  [
    Zaehldauer.Dauer2X4Stunden,
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
    Zaehldauer.Dauer13Stunden,
    [
      {
        startIntervallnummer: 25,
        endeIntervallnummer: 76,
        numberOfIntervals: 52,
      },
    ],
  ],
  [
    Zaehldauer.Dauer16Stunden,
    [
      {
        startIntervallnummer: 25,
        endeIntervallnummer: 88,
        numberOfIntervals: 64,
      },
    ],
  ],
  [
    Zaehldauer.Dauer24Stunden,
    [
      {
        startIntervallnummer: 1,
        endeIntervallnummer: 96,
        numberOfIntervals: 96,
      },
    ],
  ],
  [Zaehldauer.Sonstige, []],
]);
