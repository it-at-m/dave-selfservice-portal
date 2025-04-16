import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

export default interface ZaehlungCardObject {
  zaehlung: ZaehlungDTO;
  // Wird für die Breite der Spalten benötig im Grid
  flex: number;
}
