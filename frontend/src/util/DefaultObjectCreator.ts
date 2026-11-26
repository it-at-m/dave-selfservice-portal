import type {
  ConfigurationDTO,
  ExternalZaehlungDTO,
  MapConfigurationDTO,
  TenantConfigurationDTO,
  ZaehlstelleConfigurationDTO,
} from "@/api/client";

import { LatLng } from "leaflet";

import { Quelle, Status, Wetter } from "@/api/client";

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
      quelle: Quelle.Manually,
      wetter: Wetter.NoInformation,
      status: Status.Created,
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
