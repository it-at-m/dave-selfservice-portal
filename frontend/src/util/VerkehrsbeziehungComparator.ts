import type {
  ExternalLaengsverkehrDTO,
  ExternalQuerungsverkehrDTO,
  ExternalVerkehrsbeziehungDTO,
} from "@/api/client";

export default class VerkehrsbeziehungComparator {
  /**
   * Sortiert eine Liste von Knotenarmen nach der Nummer
   *
   * @param a
   * @param b
   */
  public static sortByVonAndNach(
    a: ExternalVerkehrsbeziehungDTO,
    b: ExternalVerkehrsbeziehungDTO
  ): number {
    return (a.von ?? 0) - (b.von ?? 0) || (a.nach ?? 0) - (b.nach ?? 0);
  }

  /**
   * Sortiert eine Liste von ExternalQuerungsverkehrDTO und ExternalLaengsverkehrDTO nach der Knotenarmnummer
   *
   * @param a
   * @param b
   */
  public static sortLaengsUndQuerungByNumber(
    a: ExternalLaengsverkehrDTO | ExternalQuerungsverkehrDTO,
    b: ExternalLaengsverkehrDTO | ExternalQuerungsverkehrDTO
  ): number {
    return (a.knotenarm ?? 0) - (b.knotenarm ?? 0);
  }
}
