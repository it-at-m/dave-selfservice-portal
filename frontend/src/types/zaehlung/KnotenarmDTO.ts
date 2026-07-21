import type BaseEntity from "@/types/common/BaseEntity";

export default interface KnotenarmDTO extends BaseEntity {
  nummer: number;

  strassenname: string;

  filename: string;

  /**
   * Jedes Arrayelement entspricht einer Zeile in der CSV-Datei.
   */
  filedata: Array<string>;
}
