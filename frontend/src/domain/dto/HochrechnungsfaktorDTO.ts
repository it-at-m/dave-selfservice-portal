import BaseEntity from "@/types/common/BaseEntity";

export default interface HochrechnungsfaktorDTO extends BaseEntity {
  matrix: string;
  kfz: number;
  sv: number;
  gv: number;
  defaultFaktor: boolean;
}
