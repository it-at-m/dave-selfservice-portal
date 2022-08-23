import {LatLng} from "leaflet";
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import Wetter from "@/domain/enums/Wetter";
import Quelle from "@/domain/enums/Quelle";
import Status from "@/domain/enums/Status";

export default class DefaultObjectCreator {

  private static readonly MUNICH_CENTER_LATITUDE: number = 48.137227;
  private static readonly MUNICH_CENTER_LONGITUDE: number = 11.575517;

  public static createCenterOfMunichLatLng(): LatLng {
    return new LatLng(this.MUNICH_CENTER_LATITUDE, this.MUNICH_CENTER_LONGITUDE);
  }

  public static createDefaultZaehlungDTO(): ZaehlungDTO {
    let zaehlung: ZaehlungDTO = {} as ZaehlungDTO;
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