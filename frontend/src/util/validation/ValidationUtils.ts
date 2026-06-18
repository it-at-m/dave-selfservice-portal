import { isEmpty, join, sum, toArray, trim, uniq } from "lodash";

import {
  Zaehldauer,
  zaehldauerIntervallnummern,
} from "@/types/enum/Zaehldauer";

export function useValidationUtils() {
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
   * Prüft ob in den gegebenen Zähldateninformationen der CSV-Datei je
   * Bewegungsinformation mehrere Einträge mit der selben Intervallnummer existieren.
   *
   * @param csvDataWithoutHeader zum prüfen.
   */
  function checkForIdenticalIntervallnummerJeBewegungsbeziehung(
    filename: string,
    csvDataWithoutHeader: Array<string>
  ): string {
    const csvLinesByIntervallnummerByBewegungsinformation = new Map<
      string,
      Map<string, Array<string>>
    >();
    const csvDataWithoutEmptyLines =
      removeEmptyLinesFromCsvDate(csvDataWithoutHeader);

    csvDataWithoutEmptyLines.forEach((csvLine: string) => {
      const lineDataPerColumn = csvLine.split(";");
      // Die Bewegungsinformation beinhaltet die Spalten "nach;Strassenseite;Richtung"
      const bewegungsinformation =
        getBewegungsinformationFromCsvLine(lineDataPerColumn);
      const intervallnummer = lineDataPerColumn[0];

      if (
        csvLinesByIntervallnummerByBewegungsinformation.has(
          bewegungsinformation
        )
      ) {
        const csvLinesByIntervallnummer =
          csvLinesByIntervallnummerByBewegungsinformation.get(
            bewegungsinformation
          );
        if (csvLinesByIntervallnummer?.has(intervallnummer)) {
          csvLinesByIntervallnummer.get(intervallnummer)?.push(csvLine);
        } else {
          csvLinesByIntervallnummer?.set(intervallnummer, [csvLine]);
        }
      } else {
        const csvLinesByIntervallnummer = new Map<string, Array<string>>();
        csvLinesByIntervallnummer.set(intervallnummer, [csvLine]);
        csvLinesByIntervallnummerByBewegungsinformation.set(
          bewegungsinformation,
          csvLinesByIntervallnummer
        );
      }
    });

    let intervallnummerWithMultipleLines = Array.from(
      Array.from(
        csvLinesByIntervallnummerByBewegungsinformation.values()
      ).flatMap((csvLinesByIntervallnummer) => {
        const entries = Array.from(csvLinesByIntervallnummer.entries());
        return entries;
      })
    )
      .filter(
        (csvLinesOfIntervallnummer) => csvLinesOfIntervallnummer[1].length > 1
      )
      .map((csvLindesOfIntervallnummer) => csvLindesOfIntervallnummer[0]);

    if (intervallnummerWithMultipleLines.length > 0) {
      intervallnummerWithMultipleLines = uniq(
        intervallnummerWithMultipleLines
      ).sort();
      return `In der CSV-Datei ${filename} befinden sich mehrfach vorhandenen Zeitintervalle mit folgenden Intervallnummern: ${join(intervallnummerWithMultipleLines, ", ")}`;
    }
    return "";
  }

  /**
   * Prüft, ob die gegebenen Intervallnummern der Anzahl an erwarteten Intervallnummern entsprechen.
   *
   * @param csvDataWithoutHeader zum prüfen.
   * @param zaehldauer zur Prüfung der Anzahl.
   */
  function checkForCorrectNumberOfIntervalsAccordingZaehldauer(
    filename: string,
    csvDataWithoutHeader: Array<string>,
    zaehldauer: Zaehldauer
  ): string {
    if (zaehldauer != Zaehldauer.SONSTIGE) {
      const startIntervallnummerEndeIntervallnummer = toArray(
        zaehldauerIntervallnummern.get(zaehldauer)
      );

      const csvDataWithoutEmptyLines =
        removeEmptyLinesFromCsvDate(csvDataWithoutHeader);

      const csvLinesByBewegungsinformation = new Map<string, Array<string>>();
      csvDataWithoutEmptyLines.forEach((csvLine: string) => {
        const lineDataPerColumn = csvLine.split(";");
        // Die Bewegungsinformation beinhaltet die Spalten "nach;Strassenseite;Richtung"
        const bewegungsinformation =
          getBewegungsinformationFromCsvLine(lineDataPerColumn);
        if (csvLinesByBewegungsinformation.has(bewegungsinformation)) {
          csvLinesByBewegungsinformation
            .get(bewegungsinformation)
            ?.push(csvLine);
        } else {
          csvLinesByBewegungsinformation.set(bewegungsinformation, [csvLine]);
        }
      });

      const numberOfIntervalsAccordingZaehldauer = sum(
        startIntervallnummerEndeIntervallnummer.map(
          (startIntervallnummerEndeIntervallnummer) =>
            startIntervallnummerEndeIntervallnummer.numberOfIntervals
        )
      );

      for (const csvLinesOfBewegungsinformation of Array.from(
        csvLinesByBewegungsinformation.values()
      )) {
        if (
          numberOfIntervalsAccordingZaehldauer !=
          csvLinesOfBewegungsinformation.length
        ) {
          return `Die Menge der Intervallnummern in der CSV-Datei ${filename} entspricht nicht der Anzahl der erwarteten Intervallnummern der Zähldauer.`;
        }
      }
    }
    return "";
  }

  /**
   * Prüft, ob die Intervallnummern der Zähldauer entsprechend.
   * Es dürfen keine Intervallnummern existieren, welche sich ausserhalb des Zählzeitraums der Zähldauer befinden.
   *
   * @param csvDataWithoutHeader zum prüfen.
   * @param zaehldauer zur Prüfung auf Zähldauer.
   */
  function checkForAlignmentOfIntervallsAccordingZaehldauer(
    filename: string,
    csvDataWithoutHeader: Array<string>,
    zaehldauer: Zaehldauer
  ): string {
    if (zaehldauer != Zaehldauer.SONSTIGE) {
      const startIntervallnummerEndeIntervallnummer = toArray(
        zaehldauerIntervallnummern.get(zaehldauer)
      );

      const csvDataWithoutEmptyLines =
        removeEmptyLinesFromCsvDate(csvDataWithoutHeader);

      const intervallnummernNotWithin = new Set<number>();

      csvDataWithoutEmptyLines.forEach((csvLine: string) => {
        const intervallnummer = parseInt(csvLine.split(";")[0]);

        // Prüfung ob sich die Intervallnummer ausserhalb der Intervallnummernbereiche der Zähldauer befindet.
        const csvLineNotWithin = startIntervallnummerEndeIntervallnummer.every(
          (startEndeIntervallNummer) =>
            intervallnummer < startEndeIntervallNummer.startIntervallnummer ||
            intervallnummer > startEndeIntervallNummer.endeIntervallnummer
        );

        if (csvLineNotWithin) {
          intervallnummernNotWithin.add(intervallnummer);
        }
      });

      if (intervallnummernNotWithin.size > 0) {
        const commaSeperatedIntervallnummern = join(
          Array.from(intervallnummernNotWithin.values()).sort(),
          ", "
        );
        return `In der CSV-Datei ${filename} befinden sich Intervallnummern die sich ausserhalb des Zählzeitraums definiert durch die Zähldauer befinden: ${commaSeperatedIntervallnummern}`;
      }
    }
    return "";
  }

  /**
   * Die Methode gibt die Bewegungsinformation einer Zeile der CSV-Datei aus.
   * Der Rückgabewert beinhaltet die Daten der Spalten "nach;Strassenseite;Richtung".
   * @param csvLine
   */
  function getBewegungsinformationFromCsvLine(csvLine: Array<string>): string {
    const bewegungsinformation = toArray(csvLine).slice(1, 4);
    return join(bewegungsinformation, ";");
  }

  function removeEmptyLinesFromCsvDate(csvData: Array<string>): Array<string> {
    return toArray(csvData).filter((csvLine) => !isEmpty(trim(csvLine)));
  }

  return {
    isWholeNonNegativeIntegerString,
    checkForIdenticalIntervallnummerJeBewegungsbeziehung,
    checkForCorrectNumberOfIntervalsAccordingZaehldauer,
    checkForAlignmentOfIntervallsAccordingZaehldauer,
    getBewegungsinformationFromCsvLine,
  };
}
