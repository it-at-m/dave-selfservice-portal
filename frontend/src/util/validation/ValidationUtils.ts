import type ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import type { StartIntervallnummerEndeIntervallnummer } from "@/types/common/StartIntervallnummerEndeIntervallnummer";
import type Strassenseite from "@/types/enum/Strassenseite";

import { difference, join, sum, toArray } from "lodash";

import {
  Zaehldauer,
  zaehldauerIntervallnummern,
} from "@/types/enum/Zaehldauer";

export function useValidationUtils() {
  /**
   * Prüfung der Validität von Strassenseite und Armnummer.
   *
   * @param strassenseite zu prüfende Strassenseite
   * @param armNummer Nummer des aktuellen Knotenarms
   * @param validArmNummern valide Armnummern
   * @param validStrassenseiten valide Strassenseiten
   */
  function isArmnummerAndStrassenseiteInvalid(
    strassenseite: string,
    armNummer: number,
    validArmNummern: Array<number>,
    validStrassenseiten: Array<Strassenseite>
  ) {
    return (
      validArmNummern.includes(armNummer) &&
      !validStrassenseiten.includes(strassenseite as Strassenseite)
    );
  }

  /**
   * Prüft, ob ein Wert eine ganze nicht-negative Zahl darstellt (nur Ziffern, z.B. "0","1","42").
   * Leere Strings sollen von Aufrufer*innen als "erlaubt" behandelt werden (d.h. Aufrufer überspringt leer).
   *
   * @param rawValue Eingabewert (wird getrimmt)
   * @return true, wenn rawValue aus mindestens einer Ziffer besteht und nur Ziffern enthält (0 ist erlaubt)
   */
  function isWholeNonNegativeIntegerString(rawValue: string): boolean {
    if (!rawValue) {
      return false;
    }
    const value = rawValue.trim();
    // Nur Ziffern zulassen: keine Dezimalstellen, kein Komma, keine Buchstaben, kein Vorzeichen
    return /^\d+$/.test(value);
  }

  /**
   * Prüft ob in den gegebenen Zeitintervalle mehrere Zeitintervalle
   * mit der selben Startuhrzeit sowie der selben Endeuhrzeit existieren.
   *
   * @param intervalle zum prüfen.
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

  /**
   * Prüft ob die gegebenen Zeitintervalle der Anzahl an erwarteten Zeitintervalle entsprechen.
   * Die Anzahl der Zeitintervalle muss der Zähldauer entsprechend und es dürfen keine Zeitintervalle
   * existieren, welche ausserhalb des Zählzeitraums der Zähldauer existieren.
   *
   * @param intervalle zum prüfen.
   * @param zaehldauer zur Prüfung der Anzahl.
   */
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
      interval.intervallnummer >=
        startIntervallnummerEndeIntervallnummer.startIntervallnummer &&
      interval.intervallnummer <=
        startIntervallnummerEndeIntervallnummer.endeIntervallnummer
    );
  }

  function startEndeUhrzeitString(interval: ZeitintervallDTO) {
    return `Intervallnummer ${interval.intervallnummer} von ${interval.startUhrzeit} bis ${interval.endeUhrzeit}`;
  }

  return {
    checkForIdenticalZeitintervalleAccordingStartUhrzeitAndEndeUhrzeit,
    checkForCorrectNumberOfIntervalsAccordingZaehldauer,
    isArmnummerAndStrassenseiteInvalid,
    isWholeNonNegativeIntegerString,
  };
}
