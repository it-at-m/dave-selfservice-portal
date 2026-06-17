import type LaengsverkehrDTO from "@/domain/dto/LaengsverkehrDTO";
import type QuerungsverkehrDTO from "@/domain/dto/QuerungsverkehrDTO";

export default class LaengsverkehrQuerungsverkehrComparator {
  /**
   * Sortiert eine Liste von Knotenarmen nach der Nummer
   *
   * @param a
   * @param b
   */
  public static asc(
    a: LaengsverkehrDTO|QuerungsverkehrDTO,
    b: LaengsverkehrDTO|QuerungsverkehrDTO
  ): number {
    return a.knotenarm - b.knotenarm;
  }
}
