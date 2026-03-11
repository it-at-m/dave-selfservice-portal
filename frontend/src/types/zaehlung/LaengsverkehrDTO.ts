import type Bewegungsrichtung from "@/types/enum/Bewegungsrichtung";
import type Himmelsrichtung from "@/types/enum/Himmelsrichtung";
import type BewegungsbeziehungDTO from "@/types/zaehlung/BewegungsbeziehungDTO";

export default interface LaengsverkehrDTO extends BewegungsbeziehungDTO {
  knotenarm: number;

  richtung: Bewegungsrichtung;

  strassenseite: Himmelsrichtung;
}
