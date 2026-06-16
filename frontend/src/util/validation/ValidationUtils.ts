import type ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import type { StartIntervallnummerEndeIntervallnummer } from "@/types/common/StartIntervallnummerEndeIntervallnummer";
import type Strassenseite from "@/types/enum/Strassenseite";

import { difference, isEmpty, join, sum, toArray } from "lodash";

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
  ): boolean {
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
   * Prüft ob in den gegebenen Zähldateninformationen der CSV-Datei
   * Einträge mit der selben Intervallnummer existieren.
   *
   * @param csvDataWithoutHeader zum prüfen.
   */
  function checkForIdenticalIntervallnummer(
    csvDataWithoutHeader: Array<string>
  ): string {
    const csvLinesByIntervallnummer = new Map<string, Array<string>>();

    csvDataWithoutHeader.forEach((csvLine: string) => {
      const intervalnummer = csvLine.split(";")[0];
      if (csvLinesByIntervallnummer.has(intervalnummer)) {
        csvLinesByIntervallnummer.get(intervalnummer)?.push(csvLine);
      } else {
        csvLinesByIntervallnummer.set(intervalnummer, [csvLine]);
      }
    });

    const intervallnummerWithMultipleLines = Array.from(
      csvLinesByIntervallnummer.entries()
    )
      .filter(
        (csvLindesOfIntervallnummer) => csvLindesOfIntervallnummer[1].length > 1
      )
      .map((csvLindesOfIntervallnummer) => csvLindesOfIntervallnummer[0]);

    if (intervallnummerWithMultipleLines.length > 0) {
      return `In CSV-Datei mehrfach vorhandenen Zeitintervalle: ${join(intervallnummerWithMultipleLines, ", ")}`;
    }
    return "";
  }

  /**
   * Prüft ob die gegebenen Zeitintervalle der Anzahl an erwarteten Zeitintervalle entsprechen.
   * Die Anzahl der Zeitintervalle muss der Zähldauer entsprechend und es dürfen keine Zeitintervalle
   * existieren, welche ausserhalb des Zählzeitraums der Zähldauer existieren.
   *
   * @param csvDataWithoutHeader zum prüfen.
   * @param zaehldauer zur Prüfung der Anzahl.
   */
  function checkForCorrectNumberOfIntervalsAccordingZaehldauer(
    csvDataWithoutHeader: Array<string>,
    zaehldauer: Zaehldauer
  ): string {
    const startIntervallnummerEndeIntervallnummer = toArray(
      zaehldauerIntervallnummern.get(zaehldauer)
    );

    const numberOfIntervalsAccordingZaehldauer = sum(
      startIntervallnummerEndeIntervallnummer.map(
        (startIntervallnummerEndeIntervallnummer) =>
          startIntervallnummerEndeIntervallnummer.numberOfIntervals
      )
    );

    const csvLinesWithin = startIntervallnummerEndeIntervallnummer.flatMap(
      (startIntervallnummerEndeIntervallnummer) =>
        csvDataWithoutHeader.filter((csvLine) =>
          isZeitintervallWithinStartIntervallnummerEndeIntervallnummer(
            csvLine,
            startIntervallnummerEndeIntervallnummer
          )
        )
    );

    const intervalsNotWithin = difference(
      csvDataWithoutHeader,
      csvLinesWithin
    ).map((csvLine: string) => parseInt(csvLine.split(";")[0]));

    if (zaehldauer != Zaehldauer.SONSTIGE) {
      if (intervalsNotWithin.length > 0) {
        return `Die Intervallnummern in der CSV-Datei welche sich ausserhalb des Zählzeitraums definiert durch die Zähldauer befinden: ${join(intervalsNotWithin, ", ")}`;
      }
      if (numberOfIntervalsAccordingZaehldauer != csvLinesWithin.length) {
        return "Die Menge der Intervallnummern in der CSV-Datei entsprechen nicht den erwarteten Intervallnummern der Zähldauer.";
      }
    }
    return "";
  }

  function isZeitintervallWithinStartIntervallnummerEndeIntervallnummer(
    csvLine: string,
    startIntervallnummerEndeIntervallnummer: StartIntervallnummerEndeIntervallnummer
  ): boolean {
    const intervallnummer = parseInt(csvLine.split(";")[0]);
    return (
      intervallnummer >=
        startIntervallnummerEndeIntervallnummer.startIntervallnummer &&
      intervallnummer <=
        startIntervallnummerEndeIntervallnummer.endeIntervallnummer
    );
  }

  return {
    isArmnummerAndStrassenseiteInvalid,
    isWholeNonNegativeIntegerString,
    checkForIdenticalIntervallnummer,
    checkForCorrectNumberOfIntervalsAccordingZaehldauer,
  };
}
