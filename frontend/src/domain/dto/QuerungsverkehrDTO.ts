import type BewegungsbeziehungDTO from "@/types/zaehlung/BewegungsbeziehungDTO";
import himmelsrichtung from "@/types/enum/Himmelsrichtung";

export default interface QuerungsverkehrDTO extends BewegungsbeziehungDTO {

    knotenarm: number;
    richtung: himmelsrichtung;
}