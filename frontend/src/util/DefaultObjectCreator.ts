import type ConfigurationDTO from "@/types/configuration/ConfigurationDTO";
import type MapConfigurationDTO from "@/types/configuration/MapConfigurationDTO";
import type ZaehlstelleConfigurationDTO from "@/types/configuration/ZaehlstelleConfigurationDTO";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { LatLng } from "leaflet";

import Quelle from "@/types/enum/Quelle";
import Status from "@/types/enum/Status";
import Wetter from "@/types/enum/Wetter";

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

  public static createDefaultConfigurationDTO(): ConfigurationDTO {
    return {
      map: this.createDefaultMapConfigurationDTO(),
      zaehlstelle: this.createDefaultZaehlstelleConfigurationDTO(),
    };
  }

  public static createDefaultZaehlstelleConfigurationDTO(): ZaehlstelleConfigurationDTO {
    return {
      automaticNumberAssignment: true,
      linkDocumentationCsvFileForUploadZaehlung: "",
    };
  }

  public static createDefaultMapConfigurationDTO(): MapConfigurationDTO {
    return {
      // München Zentrum
      lat: "48.137227",
      lng: "11.575517",
      zoom: 12,
    };
  }
}
