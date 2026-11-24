import type ZaehlungCardObject from "@/domain/ZaehlungCardObject";

import Zaehlart from "@/types/enum/Zaehlart";

export default class ZaehlungCardObjectComparator {
  /**
   * Sortiert eine Liste von ZaehlungCardObject nach dem Datum DESC
   * Neu -> Alt
   *
   * @param a
   * @param b
   */
  public static sortByDatumDesc(
    a: ZaehlungCardObject,
    b: ZaehlungCardObject
  ): number {
    const datumA = a.zaehlung.datum?.getTime() ?? 0;
    const datumB = b.zaehlung.datum?.getTime() ?? 0;
    if (datumA > datumB) {
      return -1;
    }
    if (datumA < datumB) {
      return 1;
    }
    // Gibt es zwei neuste Zählungen mit dem selben Datum und eine davon ist
    // eine "klassische" Zählung, dann wird die als erstes ausgewählt.
    if (datumA === datumB) {
      return (
        Number(b.zaehlung.zaehlart === Zaehlart.N) -
        Number(a.zaehlung.zaehlart === Zaehlart.N)
      );
    }
    return 0;
  }
}
