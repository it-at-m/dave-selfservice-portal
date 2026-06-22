import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { isEmpty, isNil, join, sum, toArray, trim, uniq } from "lodash";

import Zaehlart from "@/types/enum/Zaehlart";
import {
  Zaehldauer,
  zaehldauerIntervallnummern,
  zaehldauerText,
} from "@/types/enum/Zaehldauer";

export function useValidationUtils() {
  const SEPARATOR = ";";

  const EXPECTED_META_HEADER =
    "Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;;;";

  const EXPECTED_ZAEHLDATEN_HEADER =
    "Intervallnummer;nach;Strassenseite;Richtung;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss";

  const COLUMN_COUNT = EXPECTED_ZAEHLDATEN_HEADER.split(SEPARATOR).length;

  /**
   * Prüft, ob die Anzahl der übergebenen Zählwerte auch der Anzahl an erwarteten Zählwerte je Zeile entsprechen.
   *
   * @param filename Name der csv-Datei.
   * @param splittedLine Array für Zählwerte.
   */
  function hasCsvDataLineCorrectNumberOfColumns(
    filename: string,
    splittedLine: Array<string>
  ): string {
    if (toArray(splittedLine).length !== COLUMN_COUNT) {
      return `Je Zeile müssen ${COLUMN_COUNT} Spalten in der Datei ${filename} enthalten sein.`;
    }
    return "";
  }

  /**
   * Prüft, ob die hochgeladene CSV-Datei Zähldaten enthält.
   * Eine Datei gilt als gültig, wenn sie mindestens vier Zeilen hat:
   * - Zeile 1: Metadaten-Header
   * - Zeile 2: Metadaten
   * - Zeile 3: Zähldaten-Header
   * - Ab Zeile 4: mindestens eine Datenzeile
   *
   * @param filename Name der csv-Datei (für Fehlermeldungen).
   * @param csvData Dateiinhalt als Array von Zeilen.
   * @return Fehlermeldung, wenn keine Zähldaten vorhanden sind, sonst leerer String.
   */
  function hasAtLeastFourLinesOfData(
    filename: string,
    csvData: Array<string>
  ): string {
    if (!csvData || csvData.length < 4) {
      return `Die hochgeladene Datei ${filename} enthält keine Zähldaten.`;
    }
    return "";
  }

  /**
   * Prüft, ob die CSV-Datei einen Metadatenheader besitzt.
   *
   * @param filename Name der csv-Datei (für Fehlermeldungen).
   * @param csvData Dateiinhalt als Array von Zeilen.
   */
  function hasMetadatenHeader(
    filename: string,
    csvData: Array<string>
  ): string {
    const metaHeader: string = csvData[0];
    if (isNil(metaHeader)) {
      return `Die Header der Metadaten fehlen in der hochgeladenen Datei ${filename}.`;
    }
    return "";
  }

  /**
   * Prüft, ob der Metadatenheader in der CSV-Datei den korrekten Inhalt hat.
   *
   * @param filename Name der csv-Datei (für Fehlermeldungen).
   * @param csvData Dateiinhalt als Array von Zeilen.
   */
  function hasCorrectMetadatenHeader(
    filename: string,
    csvData: Array<string>
  ): string {
    const metaHeader: string = csvData[0];
    if (metaHeader!.trim() !== EXPECTED_META_HEADER) {
      return `Die Header der Metadaten in der hochgeladenen Datei ${filename} sind nicht korrekt.\nErwartet: ${EXPECTED_META_HEADER}`;
    }
    return "";
  }

  /**
   * Prüft, ob die CSV-Datei Metadateninformationen besitzt.
   *
   * @param filename Name der csv-Datei (für Fehlermeldungen).
   * @param csvData Dateiinhalt als Array von Zeilen.
   */
  function hasMetadata(filename: string, csvData: Array<string>): string {
    const metaData: string = csvData[1];
    if (isNil(metaData)) {
      return `Die Metadaten fehlen in der hochgeladenen Datei ${filename}.`;
    }
    return "";
  }

  /**
   * Prüft, ob die Metadaten in der CSV-Datei den korrekten Inhalt haben.
   *
   * @param filename Name der csv-Datei (für Fehlermeldungen).
   * @param csvData Dateiinhalt als Array von Zeilen.
   * @param knotenarmNr zur Gegenprüfung der Metadaten.
   * @param zaehlung zur Gegenprüfung der Metadaten.
   */
  function hasCorrectMetadata(
    filename: string,
    csvData: Array<string>,
    knotenarmNr: number,
    zaehlung: ZaehlungDTO
  ): string {
    //Erstellen der erwarteten Metadaten
    const metaZaehlart =
      zaehlung.zaehlart === Zaehlart.N ? "" : zaehlung.zaehlart;
    const expectedMetaDataArray = [
      zaehlung.zaehlstelleNummer,
      metaZaehlart,
      zaehlung.datum,
      knotenarmNr,
    ];
    // Fülle das Array mit leeren Feldern, bis die Länge den erwarteten Spalten entspricht
    while (expectedMetaDataArray.length < COLUMN_COUNT) {
      expectedMetaDataArray.push("");
    }
    const expectedMetaData = expectedMetaDataArray.join(";");

    // Erstellen der erwarteten Metadaten
    const metaData: string = csvData[1];
    if (metaData!.trim() !== expectedMetaData) {
      return `Die Metadaten in der hochgeladenen Datei ${filename} sind nicht korrekt.\nErwartet: ${expectedMetaData}`;
    }
    return "";
  }

  /**
   * Prüft, ob die CSV-Datei eine Zähldatenheader besitzt.
   *
   * @param filename Name der csv-Datei (für Fehlermeldungen).
   * @param csvData Dateiinhalt als Array von Zeilen.
   */
  function hasZaehldatenHeader(
    filename: string,
    csvData: Array<string>
  ): string {
    const zaehldatenHeader: string = csvData[2];
    if (isNil(zaehldatenHeader)) {
      return `Die Header der Zähldaten fehlen in der hochgeladenen Datei ${filename}.`;
    }
    return "";
  }

  /**
   * Prüft, ob der Zähldatenheader in der CSV-Datei den korrekten Inhalt hat.
   *
   * @param filename Name der csv-Datei (für Fehlermeldungen).
   * @param csvData Dateiinhalt als Array von Zeilen.
   */
  function hasCorrectZaehldatenHeader(
    filename: string,
    csvData: Array<string>
  ): string {
    const zaehldatenHeader: string = csvData[2];
    if (zaehldatenHeader!.trim() !== EXPECTED_ZAEHLDATEN_HEADER) {
      return `Die Header der Zähldaten in der hochgeladenen Datei ${filename} sind nicht korrekt.\nErwartet: ${EXPECTED_ZAEHLDATEN_HEADER}`;
    }
    return "";
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
   * Prüft eine Range von Werten aus einem Array auf ganze, nicht-negative Zahlen.
   *
   * @param splittedLine Array für Zählwerte.
   * @param indexFrom Auszuwertender Anfangsindex der splittedLine
   * @param indexTo Auszuwertender Endindex der splittedLine
   * @return Fehlermeldung
   */
  function containsOnlyWholeNonNegativeIntegerStrings(
    splittedLine: Array<string>,
    indexFrom: number,
    indexTo: number
  ) {
    for (let i = indexFrom; i <= indexTo; i++) {
      // Zaehldaten dürfen nur nicht negative Zahlen enthalten oder müssen leer sein.
      if (splittedLine[i].trim().length > 0) {
        if (!isWholeNonNegativeIntegerString(splittedLine[i].trim())) {
          return `Die Zähldaten dürfen nur nicht-negative, ganze Zahlen enthalten.`;
        }
      }
    }
  }

  /**
   * Prüft ob in den gegebenen Zähldateninformationen der CSV-Datei je
   * Bewegungsinformation mehrere Einträge mit der selben Intervallnummer existieren.
   *
   * @param filename Name der validierten csv-Datei
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
      const lineDataPerColumn = csvLine.split(SEPARATOR);
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
   * @param filename Name der validierten csv-Datei
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
        const lineDataPerColumn = csvLine.split(SEPARATOR);
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
          numberOfIntervalsAccordingZaehldauer !==
          csvLinesOfBewegungsinformation.length
        ) {
          return `Die Menge von ${csvLinesOfBewegungsinformation.length} Intervallnummern in der CSV-Datei ${filename} entspricht nicht der Anzahl der erwarteten Anzahl von ${numberOfIntervalsAccordingZaehldauer} Intervallen der Zähldauer ${zaehldauerText.get(zaehldauer)}.`;
        }
      }
    }
    return "";
  }

  /**
   * Prüft, ob die Intervallnummern der Zähldauer entsprechend.
   * Es dürfen keine Intervallnummern existieren, welche sich ausserhalb des Zählzeitraums der Zähldauer befinden.
   *
   * @param filename Name der validierten csv-Datei
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
        const intervallnummer = parseInt(csvLine.split(SEPARATOR)[0]);

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
        return `In der CSV-Datei ${filename} befinden sich Intervallnummern die sich ausserhalb des Zählzeitraums definiert durch die Zähldauer ${zaehldauerText.get(zaehldauer)} befinden: ${commaSeperatedIntervallnummern}`;
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
    return join(bewegungsinformation, SEPARATOR);
  }

  function removeEmptyLinesFromCsvDate(csvData: Array<string>): Array<string> {
    return toArray(csvData).filter((csvLine) => !isEmpty(trim(csvLine)));
  }

  return {
    SEPARATOR,
    EXPECTED_META_HEADER,
    EXPECTED_ZAEHLDATEN_HEADER,
    COLUMN_COUNT,
    hasCsvDataLineCorrectNumberOfColumns,
    hasAtLeastFourLinesOfData,
    hasMetadatenHeader,
    hasCorrectMetadatenHeader,
    hasMetadata,
    hasCorrectMetadata,
    hasZaehldatenHeader,
    hasCorrectZaehldatenHeader,
    isWholeNonNegativeIntegerString,
    containsOnlyWholeNonNegativeIntegerStrings,
    checkForIdenticalIntervallnummerJeBewegungsbeziehung,
    checkForCorrectNumberOfIntervalsAccordingZaehldauer,
    checkForAlignmentOfIntervallsAccordingZaehldauer,
    getBewegungsinformationFromCsvLine,
  };
}
