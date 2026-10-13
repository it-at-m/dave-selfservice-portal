import type HochrechnungsfaktorDTO from "@/domain/dto/HochrechnungsfaktorDTO";
import type BewegungsbeziehungDTO from "@/types/zaehlung/BewegungsbeziehungDTO";

import Himmelsrichtung from "@/types/enum/Himmelsrichtung";

export default interface VerkehrsbeziehungDTO extends BewegungsbeziehungDTO {
  // Kreuzung
  von: number;
  nach: number;

  // Kreisverkehr
  knotenarm: number;
  hinein: boolean;
  heraus: boolean;
  vorbei: boolean;

  hochrechnungsfaktor: HochrechnungsfaktorDTO;

  isKreuzung: boolean;

  strassenseite: Himmelsrichtung;

  active: boolean;
}
