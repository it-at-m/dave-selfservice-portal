import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";
import type LaengsverkehrDTO from "@/types/zaehlung/LaengsverkehrDTO";
import type QuerungsverkehrDTO from "@/types/zaehlung/QuerungsverkehrDTO";

import { difference, isEmpty, toArray } from "lodash";

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
   * @return Fehlermeldung
   */
  function validateNachOccurrence(zaehlart: Zaehlart, nach: string) {
    if ([Zaehlart.FJS, Zaehlart.QU].includes(zaehlart) && nach.trim()) {
      return `Der Zielknotenarm (nach) darf nicht gefüllt sein.`;
    }
    if (zaehlart === Zaehlart.QJS && !nach.trim()) {
      return `Der Zielknotenarm (nach) darf nicht leer sein.`;
    }
  }

  /**
   * Prüft, ob die Spalte "nach" je nach Knotenarmnummer richtig gefüllt ist.
   *
   * @param armNummer Nummer des Knotenarms.
   * @param nach csv-Spalte für nach.
   * @return Fehlermeldung
   */
  function validateNachValue(armNummer: number, nach: string) {
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
      return `Der Wert ${nach} des Zielknotenarms (nach) ist ungültig für den Knotenarm ${armNummer}.`;
    }
  }

  /**
   * Prüft, ob die Spalte "strassenseite" je nach Zählart richtig gefüllt ist.
   *
   * @param zaehlart Zählart.
   * @param strassenseite csv-Spalte für Strassenseite.
   * @return Fehlermeldung
   */
  function validateStrassenseiteOccurrence(
    zaehlart: Zaehlart,
    strassenseite: string
  ) {
    if (
      [Zaehlart.FJS, Zaehlart.QJS].includes(zaehlart) &&
      !strassenseite?.trim()
    ) {
      return `Die Strassenseite darf nicht leer sein.`;
    }
    if (zaehlart === Zaehlart.QU && strassenseite.trim()) {
      return `Die Strassenseite muss leer sein.`;
    }
    if (zaehlart === Zaehlart.FJS || zaehlart === Zaehlart.QJS) {
      if (!StrassenseiteText.has(strassenseite.trim())) {
        return `Die Strassenseite ist ungültig: ${strassenseite}.`;
      }
    }
  }

  /**
   * Prüft, ob in der CSV-Datei zu wenig Intervalle entsprechend der angeforderten Richtungsinformation vorhanden sind.
   *
   * @param armNummer des Knotenarms
   * @param csvDataWithoutHeader zum prüfen.
   * @param verkehrsbeziehungen für die angeforderten Richtungsinformationen.
   */
  function validateRequiredNachAndStrassenseiteIntervallsForQjsAreExistent(
    armNummer: number,
    csvDataWithoutHeader: Array<string>,
    verkehrsbeziehungen: Array<VerkehrsbeziehungDTO>
  ) {
    const nachAndStrassenseiteOfEachLine = csvDataWithoutHeader
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => csvLine.split(validationUtils.SEPARATOR))
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => `${csvLine[1]} ${csvLine[2]}`);
    const allInCsvExistingNachAndStrassenseite = Array.from(
      new Set(nachAndStrassenseiteOfEachLine)
    );

    const allNecessaryNachAndStrassenseiteKnotenarme = toArray(
      verkehrsbeziehungen
    )
      .filter((verkehrsbeziehung) => verkehrsbeziehung.von === armNummer)
      .map(
        (verkehrsbeziehung) =>
          `${verkehrsbeziehung.nach} ${verkehrsbeziehung.strassenseite}`
      );

    const inCsvMissingNachAndStrassenseite = difference(
      allNecessaryNachAndStrassenseiteKnotenarme,
      allInCsvExistingNachAndStrassenseite
    );

    if (!isEmpty(inCsvMissingNachAndStrassenseite)) {
      return `Für folgende Zielknotenarm- (nach) und Straßenseiteninformationen sind in der CSV-Datei keine Einträge vorhanden: ${inCsvMissingNachAndStrassenseite}`;
    }
    return "";
  }

  /**
   * Prüft, ob in der CSV-Datei Intervalle entsprechend der angeforderten Richtungsinformation nicht beauftragte Intervalle vorhanden sind.
   *
   * @param armNummer des Knotenarms
   * @param csvDataWithoutHeader zum prüfen.
   * @param verkehrsbeziehungen für die angeforderten Richtungsinformationen.
   */
  function validateNonRequiredNachAndStrassenseiteIntervallsForQjsAreExistent(
    armNummer: number,
    csvDataWithoutHeader: Array<string>,
    verkehrsbeziehungen: Array<VerkehrsbeziehungDTO>
  ) {
    const nachAndStrassenseiteOfEachLine = csvDataWithoutHeader
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => csvLine.split(validationUtils.SEPARATOR))
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => `${csvLine[1]} ${csvLine[2]}`);
    const allInCsvExistingNachAndStrassenseite = Array.from(
      new Set(nachAndStrassenseiteOfEachLine)
    );

    const allNecessaryNachAndStrassenseiteKnotenarme = toArray(
      verkehrsbeziehungen
    )
      .filter((verkehrsbeziehung) => verkehrsbeziehung.von === armNummer)
      .map(
        (verkehrsbeziehung) =>
          `${verkehrsbeziehung.nach} ${verkehrsbeziehung.strassenseite}`
      );

    const inCsvTooMuchNachAndStrassenseite = difference(
      allInCsvExistingNachAndStrassenseite,
      allNecessaryNachAndStrassenseiteKnotenarme
    );

    if (!isEmpty(inCsvTooMuchNachAndStrassenseite)) {
      return `In der CSV-Datei befinden sind nicht beauftragte Einträge für folgende Zielknotenarm- (nach) und Straßenseiteninformationen: ${inCsvTooMuchNachAndStrassenseite}`;
    }
    return "";
  }

  /**
   * Prüft, ob in der CSV-Datei zu wenig Intervalle entsprechend der angeforderten Richtungsinformation vorhanden sind.
   *
   * @param armNummer des Knotenarms
   * @param csvDataWithoutHeader zum prüfen.
   * @param laengsverkehre für die angeforderten Richtungsinformationen.
   */
  function validateRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent(
    armNummer: number,
    csvDataWithoutHeader: Array<string>,
    laengsverkehre: Array<LaengsverkehrDTO>
  ) {
    const strassenseiteAndRichtungOfEachLine = csvDataWithoutHeader
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => csvLine.split(validationUtils.SEPARATOR))
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => `${csvLine[2]} ${csvLine[3]}`);
    const allInCsvExistingStrassenseiteAndRichtung = Array.from(
      new Set(strassenseiteAndRichtungOfEachLine)
    );

    const allNecessaryStrassenseiteAndRichtung = toArray(laengsverkehre)
      .filter((laengsverkehr) => laengsverkehr.knotenarm === armNummer)
      .map(
        (laengsverkehr) =>
          `${laengsverkehr.strassenseite} ${laengsverkehr.richtung}`
      );

    const inCsvMissingStrassenseiteAndRichtung = difference(
      allNecessaryStrassenseiteAndRichtung,
      allInCsvExistingStrassenseiteAndRichtung
    );

    if (!isEmpty(inCsvMissingStrassenseiteAndRichtung)) {
      return `Für folgende Straßenseite- und Richtungsinformationen sind in der CSV-Datei keine Einträge vorhanden: ${inCsvMissingStrassenseiteAndRichtung}`;
    }
    return "";
  }

  /**
   * Prüft, ob in der CSV-Datei Intervalle entsprechend der angeforderten Richtungsinformation nicht beauftragte Intervalle vorhanden sind.
   *
   * @param armNummer des Knotenarms
   * @param csvDataWithoutHeader zum prüfen.
   * @param laengsverkehre für die angeforderten Richtungsinformationen.
   */
  function validateNonRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent(
    armNummer: number,
    csvDataWithoutHeader: Array<string>,
    laengsverkehre: Array<LaengsverkehrDTO>
  ) {
    const strassenseiteAndRichtungOfEachLine = csvDataWithoutHeader
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => csvLine.split(validationUtils.SEPARATOR))
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => `${csvLine[2]} ${csvLine[3]}`);
    const allInCsvExistingStrassenseiteAndRichtung = Array.from(
      new Set(strassenseiteAndRichtungOfEachLine)
    );

    const allNecessaryStrassenseiteAndRichtung = toArray(laengsverkehre)
      .filter((laengsverkehr) => laengsverkehr.knotenarm === armNummer)
      .map(
        (laengsverkehr) =>
          `${laengsverkehr.strassenseite} ${laengsverkehr.richtung}`
      );

    const inCsvTooMuchStrassenseiteAndRichtung = difference(
      allInCsvExistingStrassenseiteAndRichtung,
      allNecessaryStrassenseiteAndRichtung
    );

    if (!isEmpty(inCsvTooMuchStrassenseiteAndRichtung)) {
      return `In der CSV-Datei befinden sind nicht beauftragte Einträge für folgende Straßenseite- und Richtungsinformationen: ${inCsvTooMuchStrassenseiteAndRichtung}`;
    }
    return "";
  }

  /**
   * Prüft, ob in der CSV-Datei zu wenig Intervalle entsprechend der angeforderten Richtungsinformation vorhanden sind.
   *
   * @param armNummer des Knotenarms
   * @param csvDataWithoutHeader zum prüfen.
   * @param querungsverkehre für die angeforderten Richtungsinformationen.
   */
  function validateRequiredRichtungIntervallsForQuAreExistent(
    armNummer: number,
    csvDataWithoutHeader: Array<string>,
    querungsverkehre: Array<QuerungsverkehrDTO>
  ) {
    const richtungOfEachLine = csvDataWithoutHeader
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => csvLine.split(validationUtils.SEPARATOR))
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => `${csvLine[3]}`);
    const allInCsvExistingRichtung = Array.from(new Set(richtungOfEachLine));

    const allNecessaryRichtung = toArray(querungsverkehre)
      .filter((querungsverkehr) => querungsverkehr.knotenarm === armNummer)
      .map((querungsverkehr) => `${querungsverkehr.richtung}`);

    const inCsvMissingRichtung = difference(
      allNecessaryRichtung,
      allInCsvExistingRichtung
    );

    if (!isEmpty(inCsvMissingRichtung)) {
      return `Für folgende Richtungsinformationen sind in der CSV-Datei keine Einträge vorhanden: ${inCsvMissingRichtung}`;
    }
    return "";
  }

  /**
   * Prüft, ob in der CSV-Datei Intervalle entsprechend der angeforderten Richtungsinformation nicht beauftragte Intervalle vorhanden sind.
   *
   * @param armNummer des Knotenarms
   * @param csvDataWithoutHeader zum prüfen.
   * @param querungsverkehre für die angeforderten Richtungsinformationen.
   */
  function validateNonRequiredRichtungIntervallsForQuAreExistent(
    armNummer: number,
    csvDataWithoutHeader: Array<string>,
    querungsverkehre: Array<QuerungsverkehrDTO>
  ) {
    const richtungOfEachLine = csvDataWithoutHeader
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => csvLine.split(validationUtils.SEPARATOR))
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => `${csvLine[3]}`);
    const allInCsvExistingRichtung = Array.from(new Set(richtungOfEachLine));

    const allNecessaryRichtung = toArray(querungsverkehre)
      .filter((querungsverkehr) => querungsverkehr.knotenarm === armNummer)
      .map((querungsverkehr) => `${querungsverkehr.richtung}`);

    const inCsvTooMuchRichtung = difference(
      allInCsvExistingRichtung,
      allNecessaryRichtung
    );

    if (!isEmpty(inCsvTooMuchRichtung)) {
      return `In der CSV-Datei befinden sind nicht beauftragte Einträge für folgende Richtungsinformationen: ${inCsvTooMuchRichtung}`;
    }
    return "";
  }

  /**
   * Prüft, ob die Spalte "strassenseite" je nach Zählart und Knotenarmnummer richtig gefüllt ist.
   *
   * @param zaehlart Zählart.
   * @param strassenseite csv-Spalte für Strassenseite.
   * @param armNummer Nummer des Knotenarms
   * @return Fehlermeldung
   */
  function validateStrassenseiteValue(
    zaehlart: Zaehlart,
    strassenseite: string,
    armNummer: number
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
        return `Die Strassenseite ${strassenseite} ist ungültig für den Knotenarm.`;
      }
    }
  }

  /**
   * Prüft, ob die Spalte "richtung" je nach Zählart richtig gefüllt ist.
   *
   * @param zaehlart Zählart.
   * @param richtung csv-Spalte für Richtung.
   * @return Fehlermeldung
   */
  function validateRichtungOccurrence(zaehlart: Zaehlart, richtung: string) {
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
        return `Die Richtung ${richtung} ist ungültig für Zählart ${Zaehlart.QU}.`;
      }
    } else if (zaehlart === Zaehlart.FJS) {
      if (![Richtung.EIN, Richtung.AUS].includes(richtung.trim() as Richtung)) {
        return `Die Richtung ${richtung} ist ungültig für Zählart ${Zaehlart.FJS}.`;
      }
    } else {
      // Zaehlart.QJS
      if (richtung.trim()) {
        return `Die Richtung muss leer sein für Zählart ${zaehlart}.`;
      }
    }
  }

  /**
   * Prüft, ob die Spalte "richtung" je nach Knotenarmnummer richtig gefüllt ist.
   *
   * @param zaehlart Aktuelle Zählart.
   * @param armNummer Nummer des Knotenarms.
   * @param richtung csv-Spalte für die Richtung.
   * @return Fehlermeldung
   */
  function validateRichtungValue(
    zaehlart: Zaehlart,
    armNummer: number,
    richtung: string
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
      return `Die Richtung ${richtung} ist ungültig für den Knotenarm ${armNummer}.`;
    }
  }

  return {
    validateNachOccurrence,
    validateNachValue,
    validateStrassenseiteOccurrence,
    validateRequiredNachAndStrassenseiteIntervallsForQjsAreExistent,
    validateNonRequiredNachAndStrassenseiteIntervallsForQjsAreExistent,
    validateRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent,
    validateNonRequiredStrassenseiteAndRichtungIntervallsForFjsAreExistent,
    validateRequiredRichtungIntervallsForQuAreExistent,
    validateNonRequiredRichtungIntervallsForQuAreExistent,
    validateStrassenseiteValue,
    validateRichtungOccurrence,
    validateRichtungValue,
  };
}
