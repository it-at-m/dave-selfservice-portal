import { LatLng } from "leaflet";

import Quelle from "@/types/enum/Quelle";
import Status from "@/types/enum/Status";
import Wetter from "@/types/enum/Wetter";
import ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

export default class DefaultObjectCreator {
  private static readonly MUNICH_CENTER_LATITUDE: number = 48.137227;
  private static readonly MUNICH_CENTER_LONGITUDE: number = 11.575517;

  public static createCenterOfMunichLatLng(): LatLng {
    return new LatLng(
      this.MUNICH_CENTER_LATITUDE,
      this.MUNICH_CENTER_LONGITUDE
    );
  }

  public static createDefaultZaehlungDTO(): ZaehlungDTO {
    const zaehlung: ZaehlungDTO = {} as ZaehlungDTO;
    zaehlung.knotenarme = [];
    zaehlung.kategorien = [];
    zaehlung.quelle = Quelle.MANUALLY;
    zaehlung.wetter = Wetter.NO_INFORMATION;
    zaehlung.status = Status.CREATED;
    zaehlung.kreisverkehr = false;
    zaehlung.sonderzaehlung = false;
    return zaehlung;
  }
}
