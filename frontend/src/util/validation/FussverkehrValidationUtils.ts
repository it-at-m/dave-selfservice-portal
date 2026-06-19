import { isEmpty } from "lodash";

import Fahrzeug from "@/types/enum/Fahrzeug";
import Himmelsrichtung from "@/types/enum/Himmelsrichtung";
import Richtung from "@/types/enum/Richtung";
import Strassenseite, { StrassenseiteText } from "@/types/enum/Strassenseite";
import Zaehlart from "@/types/enum/Zaehlart";
import { useValidationUtils } from "@/util/validation/ValidationUtils";

const validationUtils = useValidationUtils();

export function useFussverkehrValidationUtils() {
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
   * Prüft, ob die Spalte "nach" je nach Zählart richtig gefüllt ist.
   *
   * @param zaehlart Zählart.
   * @param nach csv-Spalte für nach.
   * @param filename Name der csv-Datei.
   * @return Fehlermeldung
   */
  function validateNachOccurrence(
    zaehlart: Zaehlart,
    nach: string,
    filename: string
  ) {
    if ([Zaehlart.FJS, Zaehlart.QU].includes(zaehlart) && nach.trim()) {
      return `Der Zielknotenarm (nach) in der Datei ${filename} darf nicht gefüllt sein.`;
    }
    if (zaehlart === Zaehlart.QJS && !nach.trim()) {
      return `Der Zielknotenarm (nach) in der Datei ${filename} darf nicht leer sein.`;
    }
  }

  /**
   * Prüft, ob die Spalte "nach" je nach Knotenarmnummer richtig gefüllt ist.
   *
   * @param armNummer Nummer des Knotenarms.
   * @param nach csv-Spalte für nach.
   * @param filename Name der csv-Datei.
   * @return Fehlermeldung
   */
  function validateNachValue(
    armNummer: number,
    nach: string,
    filename: string
  ) {
    if (
      (armNummer === 1 && nach !== "3") ||
      (armNummer === 2 && nach !== "4") ||
      (armNummer === 3 && nach !== "1") ||
      (armNummer === 4 && nach !== "2") ||
      (armNummer === 5 && nach !== "7") ||
      (armNummer === 6 && nach !== "8") ||
      (armNummer === 7 && nach !== "5") ||
      (armNummer === 8 && nach !== "6")
    ) {
      return `Der Wert ${nach} für "nach" in der Datei ${filename} ist ungültig für den Knotenarm ${armNummer}.`;
    }
  }

  /**
   * Prüft, ob die Spalte "strassenseite" je nach Zählart richtig gefüllt ist.
   *
   * @param zaehlart Zählart.
   * @param strassenseite csv-Spalte für Strassenseite.
   * @param filename Name der csv-Datei.
   * @return Fehlermeldung
   */
  function validateStrassenseiteOccurrence(
    zaehlart: Zaehlart,
    strassenseite: string,
    filename: string
  ) {
    if (
      [Zaehlart.FJS, Zaehlart.QJS].includes(zaehlart) &&
      !strassenseite?.trim()
    ) {
      return `Die Strassenseite in der Datei ${filename} darf nicht leer sein.`;
    }
    if (zaehlart === Zaehlart.QU && strassenseite.trim()) {
      return `Die Strassenseite in der Datei ${filename} muss leer sein.`;
    }
    if (zaehlart === Zaehlart.FJS || zaehlart === Zaehlart.QJS) {
      if (!StrassenseiteText.has(strassenseite.trim())) {
        return `Die Strassenseite in der Datei ${filename} ist ungültig: ${strassenseite}.`;
      }
    }
  }

  /**
   * Prüft, ob die Spalte "strassenseite" je nach Zählart und Knotenarmnummer richtig gefüllt ist.
   *
   * @param zaehlart Zählart.
   * @param strassenseite csv-Spalte für Strassenseite.
   * @param armNummer Nummer des Knotenarms
   * @param filename Name der csv-Datei.
   * @return Fehlermeldung
   */
  function validateStrassenseiteValue(
    zaehlart: Zaehlart,
    strassenseite: string,
    armNummer: number,
    filename: string
  ) {
    if (zaehlart === Zaehlart.FJS || zaehlart === Zaehlart.QJS) {
      if (
        isArmnummerAndStrassenseiteInvalid(
          strassenseite,
          armNummer,
          [1, 3],
          [Strassenseite.W, Strassenseite.O]
        ) ||
        isArmnummerAndStrassenseiteInvalid(
          strassenseite,
          armNummer,
          [2, 4],
          [Strassenseite.N, Strassenseite.S]
        ) ||
        isArmnummerAndStrassenseiteInvalid(
          strassenseite,
          armNummer,
          [5, 7],
          [Strassenseite.NW, Strassenseite.SO]
        ) ||
        isArmnummerAndStrassenseiteInvalid(
          strassenseite,
          armNummer,
          [6, 8],
          [Strassenseite.NO, Strassenseite.SW]
        )
      ) {
        return `Die Strassenseite ${strassenseite} in der Datei ${filename} ist ungültig für den Knotenarm.`;
      }
    }
  }

  /**
   * Prüft, ob die Spalte "richtung" je nach Zählart richtig gefüllt ist.
   *
   * @param zaehlart Zählart.
   * @param richtung csv-Spalte für Richtung.
   * @param filename Name der csv-Datei.
   * @return Fehlermeldung
   */
  function validateRichtungOccurrence(
    zaehlart: Zaehlart,
    richtung: string,
    filename: string
  ) {
    // Prüfung der Richtung
    if (zaehlart === Zaehlart.QU) {
      if (
        ![
          Richtung.N,
          Richtung.O,
          Richtung.S,
          Richtung.W,
          Richtung.NO,
          Richtung.SO,
          Richtung.NW,
          Richtung.SW,
        ].includes(richtung.trim() as Richtung)
      ) {
        return `Die Richtung ${richtung} in der Datei ${filename} ist ungültig für Zählart ${Zaehlart.QU}.`;
      }
    } else if (zaehlart === Zaehlart.FJS) {
      if (![Richtung.EIN, Richtung.AUS].includes(richtung.trim() as Richtung)) {
        return `Die Richtung ${richtung} in der Datei ${filename} ist ungültig für Zählart ${Zaehlart.FJS}.`;
      }
    } else {
      // Zaehlart.QJS
      if (richtung.trim()) {
        return `Die Richtung in der Datei ${filename} muss leer sein für Zählart ${zaehlart}.`;
      }
    }
  }

  /**
   * Prüft, ob die Spalte "richtung" je nach Knotenarmnummer richtig gefüllt ist.
   *
   * @param zaehlart Aktuelle Zählart.
   * @param armNummer Nummer des Knotenarms.
   * @param richtung csv-Spalte für die Richtung.
   * @param filename Name der csv-Datei.
   * @return Fehlermeldung
   */
  function validateRichtungValue(
    zaehlart: Zaehlart,
    armNummer: number,
    richtung: string,
    filename: string
  ) {
    if (zaehlart !== Zaehlart.QU) {
      return;
    }
    if (
      (armNummer === 1 &&
        richtung !== Himmelsrichtung.W.valueOf() &&
        richtung !== Himmelsrichtung.O.valueOf()) ||
      (armNummer === 2 &&
        richtung !== Himmelsrichtung.N.valueOf() &&
        richtung !== Himmelsrichtung.S.valueOf()) ||
      (armNummer === 3 &&
        richtung !== Himmelsrichtung.W.valueOf() &&
        richtung !== Himmelsrichtung.O.valueOf()) ||
      (armNummer === 4 &&
        richtung !== Himmelsrichtung.N.valueOf() &&
        richtung !== Himmelsrichtung.S.valueOf()) ||
      (armNummer === 5 &&
        richtung !== Himmelsrichtung.NW.valueOf() &&
        richtung !== Himmelsrichtung.SO.valueOf()) ||
      (armNummer === 6 &&
        richtung !== Himmelsrichtung.NO.valueOf() &&
        richtung !== Himmelsrichtung.SW.valueOf()) ||
      (armNummer === 7 &&
        richtung !== Himmelsrichtung.NW.valueOf() &&
        richtung !== Himmelsrichtung.SO.valueOf()) ||
      (armNummer === 8 &&
        richtung !== Himmelsrichtung.NO.valueOf() &&
        richtung !== Himmelsrichtung.SW.valueOf())
    ) {
      return `Die Richtung ${richtung} in der Datei ${filename} ist ungültig für den Knotenarm ${armNummer}.`;
    }
  }

  /**
   * Prüft, ob die Zählwerte für Fussverkehr und andere Verkehrsarten richtig gefüllt ist.
   *
   * @param requestedKategorien Angeforderte Verkehrsarten.
   * @param splittedLine Array für Zählwerte.
   * @param filename Name der csv-Datei.
   * @return Fehlermeldung
   */
  function validateZaehlwerteOccurrence(
    requestedKategorien: Array<string>,
    splittedLine: Array<string>,
    filename: string
  ) {
    // Kein Element im Array[KFZ bis Krad] darf einen Wert haben.
    if (splittedLine.slice(4, 9).some(Boolean)) {
      return `Die Fahrzeugarten in der Datei ${filename} sind ungültig für Fussverkehrszählungen.`;
    }

    if (isEmpty(splittedLine[9]) && isEmpty(splittedLine[10])) {
      return `Die Fussverkehrszähldaten in der Datei ${filename} dürfen nicht leer sein.`;
    }

    if (requestedKategorien.includes(Fahrzeug.RAD.valueOf())) {
      if (isEmpty(splittedLine[9])) {
        return `Der Zählwert von "RAD" darf nicht leer sein.`;
      }
    } else {
      if (!isEmpty(splittedLine[9])) {
        return `Der Zählwert von "RAD" muss leer sein.`;
      }
    }
    if (requestedKategorien.includes(Fahrzeug.FUSS.valueOf())) {
      if (isEmpty(splittedLine[10])) {
        return `Der Zählwert von "FUSS" darf nicht leer sein.`;
      }
    } else {
      if (!isEmpty(splittedLine[10])) {
        return `Der Zählwert von "FUSS" muss leer sein.`;
      }
    }
  }

  /**
   * Prüft die konkreten Werte der Zählwerte auf Validität.
   *
   * @param splittedLine Array für Zählwerte.
   * @param csvLineIndex Zeilenindex der csv-Datei.
   * @param filename Name der csv-Datei.
   * @return Fehlermeldung
   */
  function validateZaehlwerteValues(
    splittedLine: Array<string>,
    csvLineIndex: number,
    filename: string
  ) {
    const csvLineNumber: number = csvLineIndex + 1;
    for (let i = 9; i <= 10; i++) {
      // Zaehldaten dürfen nur nicht negative Zahlen enthalten oder müssen leer sein.
      if (splittedLine[i].trim().length > 0) {
        if (
          !validationUtils.isWholeNonNegativeIntegerString(
            splittedLine[i].trim()
          )
        ) {
          return `Die Zähldaten in Zeile ${csvLineNumber} der Datei ${filename} dürfen nur nicht-negative, ganze Zahlen enthalten.\nWar: ${splittedLine}`;
        }
      }
    }
  }

  return {
    validateNachOccurrence,
    validateNachValue,
    validateStrassenseiteOccurrence,
    validateStrassenseiteValue,
    validateRichtungOccurrence,
    validateRichtungValue,
    validateZaehlwerteOccurrence,
    validateZaehlwerteValues,
  };
}
