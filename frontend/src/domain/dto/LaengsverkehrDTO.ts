
import type BewegungsbeziehungDTO from "@/types/zaehlung/BewegungsbeziehungDTO";
import Himmelsrichtung from "@/types/enum/Himmelsrichtung";
import type Bewegungsrichtung from "@/types/enum/Bewegungsrichtung";

export default interface LaengsverkehrDTO extends BewegungsbeziehungDTO {

    knotenarm: number;
    richtung: Bewegungsrichtung;
    strassenseite: Himmelsrichtung;
}