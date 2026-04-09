import type Himmelsrichtung from "@/types/enum/Himmelsrichtung";
import type BewegungsbeziehungDTO from "@/types/zaehlung/BewegungsbeziehungDTO";

export default interface QuerungsverkehrDTO extends BewegungsbeziehungDTO {
  knotenarm: number;
  richtung: Himmelsrichtung;
}
