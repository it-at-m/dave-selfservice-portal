import BaseEntity from "@/domain/BaseEntity";
import HochrechnungsfaktorDTO from "@/domain/dto/HochrechnungsfaktorDTO";
import ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";

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