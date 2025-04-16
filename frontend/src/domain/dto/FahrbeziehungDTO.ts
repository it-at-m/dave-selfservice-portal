import HochrechnungsfaktorDTO from "@/domain/dto/HochrechnungsfaktorDTO";
import ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import BaseEntity from "@/types/common/BaseEntity";

export default interface FahrbeziehungDTO extends BaseEntity {
  // Kreuzung
  von: number;
  nach: number;

  // Kreisverkehr
  knotenarm: number;
  hinein: boolean;
  heraus: boolean;
  vorbei: boolean;

  hochrechnungsfaktor: HochrechnungsfaktorDTO;

  zeitintervalle: Array<ZeitintervallDTO>;

  isKreuzung: boolean;

  active: boolean;
}
