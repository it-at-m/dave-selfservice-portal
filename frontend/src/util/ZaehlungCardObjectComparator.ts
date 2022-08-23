import ZaehlungCardObject from "@/domain/ZaehlungCardObject";
import Zaehlart from "@/domain/enums/Zaehlart";


export default class ZaehlungCardObjectComparator {

  /**
   * Sortiert eine Liste von ZaehlungCardObject nach dem Datum DESC
   * Neu -> Alt
   *
   * @param a
   * @param b
   */
  public static sortByDatumDesc(a: ZaehlungCardObject, b: ZaehlungCardObject): number {
    if (a.zaehlung.datum > b.zaehlung.datum) {
      return -1
    }
    if (a.zaehlung.datum < b.zaehlung.datum) {
      return 1
    }
    // Gibt es zwei neuste Zählungen mit dem selben Datum und eine davon ist
    // eine "klassische" Zählung, dann wird die als erstes ausgewählt.
    if (a.zaehlung.datum === b.zaehlung.datum) {
      if (a.zaehlung.zaehlart !== Zaehlart.N) {
        return 1
      }
      if (a.zaehlung.zaehlart === Zaehlart.N) {
        return -1
      }
    }
    return 0
  }

  /**
   * Sortiert eine Liste von ZaehlungCardObject nach dem Datum ASC
   * Alt -> Neu
   *
   * @param a
   * @param b
   */
  public static sortByDatumAsc(a: ZaehlungCardObject, b: ZaehlungCardObject): number {
    if (a.zaehlung.datum > b.zaehlung.datum) {
      return 1
    }
    if (a.zaehlung.datum < b.zaehlung.datum) {
      return -1
    }
    // Gibt es zwei neuste Zählungen mit dem selben Datum und eine davon ist
    // eine "klassische" Zählung, dann wird die als erstes ausgewählt.
    if (a.zaehlung.datum === b.zaehlung.datum) {
      if (a.zaehlung.zaehlart !== Zaehlart.N) {
        return -1
      }
      if (a.zaehlung.zaehlart === Zaehlart.N) {
        return 1
      }
    }
    return 0
  }
}