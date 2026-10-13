import type VerkehrsbeziehungDTO from "@/domain/dto/VerkehrsbeziehungDTO";
import type GeoPoint from "@/domain/GeoPoint";
import type BaseEntity from "@/types/common/BaseEntity";
import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";
import type LaengsverkehrDTO from "@/types/zaehlung/LaengsverkehrDTO";
import type QuerungsverkehrDTO from "@/types/zaehlung/QuerungsverkehrDTO";

import Quelle from "@/types/enum/Quelle";
import Status from "@/types/enum/Status";
import Wetter from "@/types/enum/Wetter";
import Zaehlart from "@/types/enum/Zaehlart";
import Zaehldauer from "@/types/enum/Zaehldauer";

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
  verkehrsbeziehungen: VerkehrsbeziehungDTO[];
  querungsverkehr: QuerungsverkehrDTO[];
  laengsverkehr: LaengsverkehrDTO[];
  // Zaehlstelle
  zaehlstelleNummer: string;
  zaehlstelleStadtbezirk: string;
  zaehlstellePunkt: GeoPoint;
  zaehlstelleKommentar: string;
  unreadMessagesDienstleister: boolean;
}
