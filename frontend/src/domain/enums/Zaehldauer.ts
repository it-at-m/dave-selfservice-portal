import KeyVal from "@/domain/KeyVal";

export enum Zaehldauer {
  /**
   * Kurzzeiterhebung (6 bis 10 Uhr; 15 bis 19 Uhr)
   */
  DAUER_2_X_4_STUNDEN = "DAUER_2_X_4_STUNDEN",

  /**
   * 24 Stunden
   */
  DAUER_24_STUNDEN = "DAUER_24_STUNDEN",

  /**
   * 16 Stunden
   */
  DAUER_16_STUNDEN = "DAUER_16_STUNDEN",

  /**
   * Kurzzeiterhebung (6 bis 19Uhr)
   */
  DAUER_13_STUNDEN = "DAUER_13_STUNDEN",

  /**
   * Sonstige
   */
  SONSTIGE = "SONSTIGE",
}

export default Zaehldauer;

export const zaehldauerText = new Map<string, string>([
  [Zaehldauer.DAUER_2_X_4_STUNDEN, "Kurzzeiterhebung (6 bis 10 Uhr; 15 bis 19 Uhr)"],
  [Zaehldauer.DAUER_13_STUNDEN, "13 Stunden Zählung (6 bis 19 Uhr)"],
  [Zaehldauer.DAUER_16_STUNDEN, "16 Stunden Zählung (6 bis 22 Uhr)"],
  [Zaehldauer.DAUER_24_STUNDEN, "Ganztageszählung"],
  [Zaehldauer.SONSTIGE, "Sonderzähldauer"],
]);

export const zaehldauerDropDown = new Array<KeyVal>(
    {value: Zaehldauer.DAUER_2_X_4_STUNDEN, text: zaehldauerText.get(Zaehldauer.DAUER_2_X_4_STUNDEN)!},
    {value: Zaehldauer.DAUER_13_STUNDEN, text: zaehldauerText.get(Zaehldauer.DAUER_13_STUNDEN)!},
    {value: Zaehldauer.DAUER_16_STUNDEN, text: zaehldauerText.get(Zaehldauer.DAUER_16_STUNDEN)!},
    {value: Zaehldauer.DAUER_24_STUNDEN, text: zaehldauerText.get(Zaehldauer.DAUER_24_STUNDEN)!},
    {value: Zaehldauer.SONSTIGE, text: zaehldauerText.get(Zaehldauer.SONSTIGE)!},
);

