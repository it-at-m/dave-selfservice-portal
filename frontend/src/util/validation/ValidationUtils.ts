import type ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import type { StartIntervallnummerEndeIntervallnummer } from "@/types/common/StartIntervallnummerEndeIntervallnummer";

import { difference, join, sum, toArray } from "lodash";

import {
  Zaehldauer,
  zaehldauerIntervallnummern,
} from "@/types/enum/Zaehldauer";

export function useValidationUtils() {
  /**
   *
   * @param intervalle
   */
  function checkForIdenticalZeitintervalleAccordingStartUhrzeitAndEndeUhrzeit(
    intervalle: Array<ZeitintervallDTO>
  ): string {
    const intervalleByStartEndeUhrzeit = new Map<
      string,
      Array<ZeitintervallDTO>
    >();

    intervalle.forEach((interval: ZeitintervallDTO) => {
      const startEndeUhrzeit = startEndeUhrzeitString(interval);
      if (intervalleByStartEndeUhrzeit.has(startEndeUhrzeit)) {
        intervalleByStartEndeUhrzeit.get(startEndeUhrzeit)?.push(interval);
      } else {
        intervalleByStartEndeUhrzeit.set(startEndeUhrzeit, [interval]);
      }
    });

    const startEndeUhrzeitWithMutlipleIntervals = Array.from(
      intervalleByStartEndeUhrzeit.entries()
    )
      .filter(
        (intervallsOfStartEndeUhrzeit) =>
          intervallsOfStartEndeUhrzeit[1].length > 1
      )
      .map((intervallsOfStartEndeUhrzeit) => intervallsOfStartEndeUhrzeit[0]);

    if (startEndeUhrzeitWithMutlipleIntervals.length > 0) {
      return `In CSV-Datei doppelt vorhandenen Zeitintervalle: ${join(startEndeUhrzeitWithMutlipleIntervals, ", ")}`;
    }
    return "";
  }

  function checkForCorrectNumberOfIntervalsAccordingZaehldauer(
    intervalle: Array<ZeitintervallDTO>,
    zaehldauer: Zaehldauer
  ): string {
    const startIntervallnummerEndeIntervallnummer =
      zaehldauerIntervallnummern.get(zaehldauer);

    const numberOfIntervallsAccordingZaehldauer = sum(
      toArray(startIntervallnummerEndeIntervallnummer).map(
        (startIntervallnummerEndeIntervallnummer) =>
          startIntervallnummerEndeIntervallnummer.numberOfIntervals
      )
    );

    const intervalleWithin = toArray(
      startIntervallnummerEndeIntervallnummer
    ).flatMap((startIntervallnummerEndeIntervallnummer) =>
      intervalle.filter((intervall) =>
        isZeitintervallWithinStartIntervallnummerEndeIntervallnummer(
          intervall,
          startIntervallnummerEndeIntervallnummer
        )
      )
    );

    const intervalleNotWithin = difference(intervalle, intervalleWithin).map(
      (interval) => startEndeUhrzeitString(interval)
    );

    if (zaehldauer != Zaehldauer.SONSTIGE) {
      if (intervalleNotWithin.length > 0) {
        return `Zeitintervalle in CSV-Datei welche sich ausserhalb des Zählzeitraums definiert durch die Zähldauer befinden: ${join(intervalleNotWithin, ", ")}`;
      }
      if (numberOfIntervallsAccordingZaehldauer != intervalleWithin.length) {
        return "Die Anzahl der Zeitintervalle in der CSV-Datei entsprechen nicht der erwarteten Intervalle der Zähldauer.";
      }
    }
    return "";
  }

  function isZeitintervallWithinStartIntervallnummerEndeIntervallnummer(
    interval: ZeitintervallDTO,
    startIntervallnummerEndeIntervallnummer: StartIntervallnummerEndeIntervallnummer
  ): boolean {
    return (
      startIntervallnummerEndeIntervallnummer.startIntervallnummer >=
        interval.intervallnummer &&
      startIntervallnummerEndeIntervallnummer.endeIntervallnummer <=
        interval.intervallnummer
    );
  }

  function startEndeUhrzeitString(interval: ZeitintervallDTO) {
    return `Intervallnummer ${interval.intervallnummer} von ${interval.startUhrzeit} bis ${interval.endeUhrzeit}`;
  }

  return {
    checkForIdenticalZeitintervalleAccordingStartUhrzeitAndEndeUhrzeit,
    checkForCorrectNumberOfIntervalsAccordingZaehldauer,
  };
}
