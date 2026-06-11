import type Strassenseite from "@/types/enum/Strassenseite";

export function useValidationUtils() {
  // Die Validierungsmethoden

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

  return {
    // hier einfügen
    isArmnummerAndStrassenseiteInvalid,
    isWholeNonNegativeIntegerString,
  };
}
