import type { ExternalZaehlungDTO } from "@/api/client";
import type ConfigurationDTO from "@/types/configuration/ConfigurationDTO";
import type MapConfigurationDTO from "@/types/configuration/MapConfigurationDTO";
import type TenantConfigurationDTO from "@/types/configuration/TenantConfigurationDTO";
import type ZaehlstelleConfigurationDTO from "@/types/configuration/ZaehlstelleConfigurationDTO";

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

  public static createDefaultZaehlungDTO(): ExternalZaehlungDTO {
    return {
      knotenarme: [],
      kategorien: [],
      verkehrsbeziehungen: [],
      laengsverkehr: [],
      querungsverkehr: [],
      quelle: Quelle.MANUALLY,
      wetter: Wetter.NO_INFORMATION,
      status: Status.CREATED,
      kreisverkehr: false,
      sonderzaehlung: false,
      zaehlIntervall: 15,
      unreadMessagesDienstleister: false,
    };
  }

  public static createDefaultConfigurationDTO(): ConfigurationDTO {
    return {
      zaehlstelle: this.createDefaultZaehlstelleConfigurationDTO(),
      tenant: this.createDefaultTenantConfigurationDTO(),
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
      baseLayers: [],
      overlayLayers: [],
    };
  }

  public static createDefaultTenantConfigurationDTO(): TenantConfigurationDTO {
    return {
      datenportalHeader: "",
      mapConfiguration: this.createDefaultMapConfigurationDTO(),
    };
  }
}
