import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { ConfigurationDTOFromJSON } from "@/api/client";
import { useConfigurationStore } from "@/store/ConfigurationStore";

describe("ConfigurationStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("provides the default configuration", () => {
    const store = useConfigurationStore();

    expect(store.getZaehlstelleConfiguration).toEqual({
      automaticNumberAssignment: true,
      linkDocumentationCsvFileForUploadZaehlung: "",
    });
    expect(store.getTenantConfiguration.mapConfiguration).toEqual({
      lat: "48.137227",
      lng: "11.575517",
      zoom: 12,
      baseLayers: [],
      overlayLayers: [],
    });
  });

  it("stores generated configuration including nested layers and an optional link", () => {
    const store = useConfigurationStore();
    const layer = {
      baseUrl: "https://example.com/wms",
      layerName: "map",
      layerNameToDisplay: "Karte",
      attribution: "Beispiel",
    };
    const configuration = ConfigurationDTOFromJSON({
      zaehlstelle: { automaticNumberAssignment: false },
      tenant: {
        datenportalHeader: "Datenportal",
        mapConfiguration: {
          lat: "48.1",
          lng: "11.5",
          zoom: 10,
          baseLayers: [layer],
          overlayLayers: [layer],
        },
      },
    });

    store.setConfiguration(configuration);

    expect(store.getZaehlstelleConfiguration).toEqual({
      automaticNumberAssignment: false,
      linkDocumentationCsvFileForUploadZaehlung: undefined,
    });
    expect(store.getTenantConfiguration).toEqual(configuration.tenant);
    expect(store.getTenantConfiguration.mapConfiguration.baseLayers).toEqual([
      layer,
    ]);
    expect(store.getTenantConfiguration.mapConfiguration.overlayLayers).toEqual(
      [layer]
    );
  });
});
