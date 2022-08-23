import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";

export default interface ZaehlungCardObject {
  zaehlung: ZaehlungDTO;
  // Wird für die Breite der Spalten benötig im Grid
  flex: number;
}