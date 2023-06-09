import BaseEntity from "@/domain/BaseEntity";

export default interface HochrechnungsfaktorDTO extends BaseEntity {
    matrix: string;
    kfz: number;
    sv: number;
    gv: number;
    defaultFaktor: boolean;
}
