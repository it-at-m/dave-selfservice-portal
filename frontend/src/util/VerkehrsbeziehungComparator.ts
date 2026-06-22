import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";
import type LaengsverkehrDTO from "@/types/zaehlung/LaengsverkehrDTO";
import type QuerungsverkehrDTO from "@/types/zaehlung/QuerungsverkehrDTO";

export default class VerkehrsbeziehungComparator {
  /**
   * Sortiert eine Liste von Knotenarmen nach der Nummer
   *
   * @param a
   * @param b
   */
  public static sortByActiveVonAndNach(
    a: VerkehrsbeziehungDTO,
    b: VerkehrsbeziehungDTO
  ): number {
    // beide sind aktiv, dann nach von und dann nach nach
    if (a.active && b.active) {
      if (a.von === b.von) {
        if (a.nach > b.nach) {
          return 1;
        }
        if (a.nach < b.nach) {
          return -1;
        }
        return 0;
      }
      if (a.von > b.von) {
        return 1;
      }
      if (a.von < b.von) {
        return -1;
      }
      return 0;
    }

    if (a.active && !b.active) {
      return -1;
    }

    if (!a.active && b.active) {
      return 1;
    }

    if (!a.active && !b.active) {
      if (a.von === b.von) {
        if (a.nach > b.nach) {
          return 1;
        }
        if (a.nach < b.nach) {
          return -1;
        }
        return 0;
      }
      if (a.von > b.von) {
        return 1;
      }
      if (a.von < b.von) {
        return -1;
      }
      return 0;
    }
    return 0;
  }

  /**
   * Sortiert eine Liste von Querungs- und LaengsverkehrDTO mit ihren Knotenarmen nach der Nummer
   *
   * @param a
   * @param b
   */
  public static sortLaengsUndQuerungByNumber(
      a: LaengsverkehrDTO|QuerungsverkehrDTO,
      b: LaengsverkehrDTO|QuerungsverkehrDTO
  ): number {
    return a.knotenarm - b.knotenarm;
  }

}
