import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";

import {
  difference,
  isEmpty,
  isNil,
  parseInt,
  toArray,
  toString,
} from "lodash";

import { useValidationUtils } from "@/util/validation/ValidationUtils";

const validationUtils = useValidationUtils();

export function useKfzVerkehrValidationUtils() {
  /**
   * Prüft, ob die Spalte "nach" gefüllt ist.
   *
   * @param nach csv-Spalte für nach.
   * @return Fehlermeldung
   */
  function validateNachOccurrence(nach: string) {
    if (!nach.trim()) {
      return `Der Zielknotenarm (nach) darf nicht leer sein.`;
    }
  }

  /**
   * Prüft, ob die Spalte "nach" richtig gefüllt ist.
   *
   * @param nach csv-Spalte für nach.
   * @return Fehlermeldung
   */
  function validateNachValueForKreisverkehr(nach: string) {
    // e = einfahrend, a = abfahrend und v = vorbeifahrend
    if (nach !== "e" && nach !== "v" && nach !== "a") {
      return `Die 'nach'-Spalte darf nur 'e', 'v' oder 'a' enthalten.`;
    }
  }

  /**
   * Prüft, ob in der CSV-Datei für den Knotenarm die Intervalle entsprechend der angeforderten Richtungsinformation vorhanden sind.
   *
   * @param armNummer des Knotenarms
   * @param csvDataWithoutHeader zum prüfen.
   * @param verkehrsbeziehungen für die angeforderten Richtungsinformationen.
   */
  function validateRequiredNachIntervallsAreExistent(
    armNummer: number,
    csvDataWithoutHeader: Array<string>,
    verkehrsbeziehungen: Array<VerkehrsbeziehungDTO>
  ): string {
    const nachOfEachLine = csvDataWithoutHeader
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => csvLine.split(validationUtils.SEPARATOR))
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => parseInt(csvLine[1]));
    const allInCsvExistingNach = Array.from(new Set(nachOfEachLine));

    const allNecessaryNachKnotenarme = toArray(verkehrsbeziehungen)
      .filter((verkehrsbeziehung) => verkehrsbeziehung.von === armNummer)
      .map((verkehrsbeziehung) => verkehrsbeziehung.nach);

    const inCsvMissingNach = difference(
      allNecessaryNachKnotenarme,
      allInCsvExistingNach
    );

    if (!isEmpty(inCsvMissingNach)) {
      return `Für folgende Zielknotenarme (nach) sind in der CSV-Datei keine Einträge vorhanden: ${inCsvMissingNach}`;
    }
    return "";
  }

  /**
   * Prüft, ob in der CSV-Datei für den Knotenarm die Intervalle entsprechend der angeforderten Richtungsinformation vorhanden sind.
   *
   * @param armNummer des Knotenarms
   * @param csvDataWithoutHeader zum prüfen.
   * @param verkehrsbeziehungen für die angeforderten Richtungsinformationen.
   */
  function validateRequiredNachIntervallsAreExistentForKreisverkehr(
    armNummer: number,
    csvDataWithoutHeader: Array<string>,
    verkehrsbeziehungen: Array<VerkehrsbeziehungDTO>
  ): string {
    const nachOfEachLine = csvDataWithoutHeader
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => csvLine.split(validationUtils.SEPARATOR))
      .filter((csvLine) => !isEmpty(csvLine))
      .map((csvLine) => csvLine[1]);
    const allInCsvExistingNach = Array.from(new Set(nachOfEachLine));

    const allNecessaryNachKnotenarme = toArray(verkehrsbeziehungen)
      .filter((verkehrsbeziehung) => verkehrsbeziehung.von === armNummer)
      .map((verkehrsbeziehung) => {
        if (verkehrsbeziehung.hinein) {
          return "e";
        }
        if (verkehrsbeziehung.heraus) {
          return "a";
        }
        if (verkehrsbeziehung.vorbei) {
          return "v";
        } else {
          return "";
        }
      });

    const inCsvMissingNach = difference(
      allNecessaryNachKnotenarme,
      allInCsvExistingNach
    );

    if (!isEmpty(inCsvMissingNach)) {
      return `Für folgende Zielknotenarme (nach) sind in der CSV-Datei keine Einträge vorhanden: ${inCsvMissingNach}`;
    }
    return "";
  }

  /**
   * Prüft auf passende Verkehrsbeziehungen.
   *
   * @param verkehrsbeziehungen Verkehrsbeziehungen der Zählung.
   * @param armNummer Betrachteter Knotenarm
   * @param nachArmNumber csv-Spalte für nach.
   * @return Fehlermeldung
   */
  function validateVerkehrsbeziehungForKreisverkehr(
    verkehrsbeziehungen: VerkehrsbeziehungDTO[],
    armNummer: number,
    nachArmNumber: string
  ) {
    const verkehrsbeziehung = verkehrsbeziehungen.find((verkehrsbeziehung) => {
      return (
        verkehrsbeziehung.knotenarm === armNummer &&
        ((nachArmNumber === "e" && verkehrsbeziehung.hinein) ||
          (nachArmNumber === "v" && verkehrsbeziehung.vorbei) ||
          (nachArmNumber === "a" && verkehrsbeziehung.heraus))
      );
    });
    if (isNil(verkehrsbeziehung)) {
      return `Für die Zähldaten ist keine Verkehrsbeziehung existent oder aktiv.`;
    }
  }

  /**
   * Prüft, ob die Spalte "nach" je nach Verkehrsbeziehungen richtig gefüllt ist.
   *
   * @param verkehrsbeziehungen Verkehrsbeziehungen der Zählung.
   * @param armNummer Betrachteter Knotenarm
   * @param nachArmNumber csv-Spalte für nach.
   * @return Fehlermeldung
   */
  function validateNachValueForKreuzung(
    verkehrsbeziehungen: VerkehrsbeziehungDTO[],
    armNummer: number,
    nachArmNumber: string
  ) {
    const nachArmNumberInt: number = parseInt(toString(nachArmNumber.trim()));

    const verkehrsbeziehung = verkehrsbeziehungen.find((verkehrsbeziehung) => {
      return (
        armNummer === verkehrsbeziehung.von &&
        nachArmNumberInt === verkehrsbeziehung.nach
      );
    });
    if (isNil(verkehrsbeziehung)) {
      return `Für die Zähldaten ist keine Verkehrsbeziehung existent oder aktiv.`;
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
      return `Der Wert ${nach} für "nach" ist ungültig für den Knotenarm ${armNummer}.`;
    }
  }

  /**
   * Prüft, ob die Spalte "strassenseite" je nach Zählart richtig gefüllt ist.
   *
   * @param strassenseite csv-Spalte für Strassenseite.
   * @return Fehlermeldung
   */
  function validateStrassenseiteRichtungOccurrence(strassenseite: string) {
    if (strassenseite.trim()) {
      return `Die Strassenseite muss leer sein.`;
    }
  }

  /**
   * Prüft die konkreten Werte der Zählwerte auf Validität.
   *
   * @param splittedLine Array für Zählwerte.
   * @return Fehlermeldung
   */
  function validateZaehlwerteValues(splittedLine: Array<string>) {
    return validationUtils.containsOnlyWholeNonNegativeIntegerStrings(
      splittedLine,
      4,
      8
    );
  }

  return {
    validateVerkehrsbeziehungForKreisverkehr,
    validateNachValueForKreisverkehr,
    validateNachValueForKreuzung,
    validateRequiredNachIntervallsAreExistent,
    validateRequiredNachIntervallsAreExistentForKreisverkehr,
    validateNachOccurrence,
    validateNachValue,
    validateStrassenseiteRichtungOccurrence,
    validateZaehlwerteValues,
  };
}
