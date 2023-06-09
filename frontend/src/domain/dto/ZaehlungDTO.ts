import BaseEntity from "@/domain/BaseEntity";
import GeoPoint from "@/domain/GeoPoint";
import Wetter from "@/domain/enums/Wetter";
import Zaehldauer from "@/domain/enums/Zaehldauer";
import Quelle from "@/domain/enums/Quelle";
import KnotenarmDTO from "@/domain/dto/KnotenarmDTO";
import FahrbeziehungDTO from "@/domain/dto/FahrbeziehungDTO";
import Status from "@/domain/enums/Status";
import Zaehlart from "@/domain/enums/Zaehlart";

export default interface ZaehlungDTO extends BaseEntity {
    datum: string;
    zaehlart: Zaehlart;
    punkt: GeoPoint;
    projektNummer: string;
    projektName: string;
    kreuzungsname: string;
    sonderzaehlung: boolean;
    kreisverkehr: boolean;
    kategorien: string[];
    zaehlsituation: string;
    zaehlsituationErweitert: string;
    zaehlIntervall: number;
    wetter: Wetter;
    status: Status;
    quelle: Quelle;
    zaehldauer: Zaehldauer;
    kommentar: string;
    knotenarme: KnotenarmDTO[];
    fahrbeziehungen: FahrbeziehungDTO[];
    // Zaehlstelle
    zaehlstelleNummer: string;
    zaehlstelleStadtbezirk: string;
    zaehlstellePunkt: GeoPoint;
    zaehlstelleKommentar: string;
    unreadMessagesDienstleister: boolean;
}
