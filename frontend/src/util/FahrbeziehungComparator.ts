import FahrbeziehungDTO from "@/domain/dto/FahrbeziehungDTO";


export default class FahrbeziehungComparator {

  /**
   * Sortiert eine Liste von Knotenarmen nach der Nummer
   *
   * @param a
   * @param b
   */
  public static sortByActiveVonAndNach(a: FahrbeziehungDTO, b: FahrbeziehungDTO): number {
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
}