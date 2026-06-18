import { isEmpty } from "lodash";

import Richtung from "@/types/enum/Richtung";
import Strassenseite, { StrassenseiteText } from "@/types/enum/Strassenseite";
import Zaehlart from "@/types/enum/Zaehlart";
import { useValidationUtils } from "@/util/validation/ValidationUtils";

const validationUtils = useValidationUtils();

export function useFussverkehrValidationUtils() {
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
   * Prüft, ob die Spalte "strassenseite" je nach Zählart und Knotenarmnummer richtig gefüllt ist.
   *
   * @param zaehlart Zählart.
   * @param strassenseite csv-Spalte für Strassenseite.
   * @param armNummer Nummer des Knotenarms
   * @param filename Name der csv-Datei.
   * @return Fehlermeldung
   */
  function validateStrassenseite(
    zaehlart: Zaehlart,
    strassenseite: string,
    armNummer: number,
    filename: string
  ) {
    // Prüfung der Strassenseite
    if (
      [Zaehlart.FJS, Zaehlart.QJS].includes(zaehlart) &&
      isEmpty(strassenseite)
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
      if (
        validationUtils.isArmnummerAndStrassenseiteInvalid(
          strassenseite,
          armNummer,
          [1, 3],
          [Strassenseite.W, Strassenseite.O]
        ) ||
        validationUtils.isArmnummerAndStrassenseiteInvalid(
          strassenseite,
          armNummer,
          [2, 4],
          [Strassenseite.N, Strassenseite.S]
        ) ||
        validationUtils.isArmnummerAndStrassenseiteInvalid(
          strassenseite,
          armNummer,
          [5, 7],
          [Strassenseite.NW, Strassenseite.SO]
        ) ||
        validationUtils.isArmnummerAndStrassenseiteInvalid(
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
  function validateRichtung(
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
   * Prüft, ob die Zählwerte für Fussverkehr und andere Verkehrsarten richtig gefüllt ist.
   *
   * @param splittedLine Array für Zählwerte.
   * @param filename Name der csv-Datei.
   * @return Fehlermeldung
   */
  function validateZaehlwerteOccurrence(
    splittedLine: Array<string>,
    filename: string
  ) {
    // Hat mindestens ein Element im Array[KFZ bis Krad] einen Wert.
    if (splittedLine.slice(4, 9).some(Boolean)) {
      return `Die Fahrzeugarten in der Datei ${filename} sind ungültig für Fussverkehrszählungen.`;
    }

    if (isEmpty(splittedLine[9]) && isEmpty(splittedLine[10])) {
      return `Die Fussverkehrszähldaten in der Datei ${filename} dürfen nicht leer sein.`;
    }
  }

  return {
    validateNach: validateNachOccurrence,
    validateStrassenseite,
    validateRichtung,
    validateZaehlwerteOccurrence,
  };
}
