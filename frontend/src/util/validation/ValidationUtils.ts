import type ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import type Zaehldauer from "@/types/enum/Zaehldauer";

import { join } from "lodash";

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
      const startEndeUhrzeit = `Intervallnummer ${interval.intervallnummer} von ${interval.startUhrzeit} bis ${interval.endeUhrzeit}`;
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
  ) {}

  return {
    checkForIdenticalZeitintervalleAccordingStartUhrzeitAndEndeUhrzeit,
    checkForCorrectNumberOfIntervalsAccordingZaehldauer,
  };
}
