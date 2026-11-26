import type { ExternalKnotenarmDTO } from "@/api/client";

export default class KnotenarmComparator {
  /**
   * Sortiert eine Liste von Knotenarmen nach der Nummer
   *
   * @param a
   * @param b
   */
  public static sortByNumber(
    a: ExternalKnotenarmDTO,
    b: ExternalKnotenarmDTO
  ): number {
    if (a.nummer < b.nummer) {
      return -1;
    }
    if (a.nummer > b.nummer) {
      return 1;
    }
    return 0;
  }
}
