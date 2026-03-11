import type HochrechnungsfaktorDTO from "@/domain/dto/HochrechnungsfaktorDTO";
import type BewegungsbeziehungDTO from "@/types/zaehlung/BewegungsbeziehungDTO";

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

  active: boolean;
}
