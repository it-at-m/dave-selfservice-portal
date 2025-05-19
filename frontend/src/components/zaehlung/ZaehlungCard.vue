<template>
  <v-card
    class="mx-auto my-12"
    max-width="374"
  >
    <zaehlung-card-map
      :lat-lng-zaehlstelle="coordsZaehlstelle"
      :lat-lng-zaehlung="coordsZaehlung"
      :show-luftbild="true"
    />

    <v-btn
      v-tooltip:bottom="statusDesign.tooltip"
      :color="statusDesign.color"
      icon
      :size="56"
      elevation="6"
      location="top start"
      position="absolute"
      class="ml-2 mt-2"
      style="z-index: 400; cursor: default"
    >
      <v-icon
        :size="42"
        :icon="statusDesign.iconPath"
      />
    </v-btn>

    <v-progress-linear
      v-if="loading"
      color="deep-purple"
      height="10"
      indeterminate
    />

    <div
      :style="{ cursor: 'pointer' }"
      @click="openZaehlungDialog"
    >
      <v-row>
        <v-col
          cols="12"
          md="8"
        >
          <v-card-title>{{ zaehlung.projektName }}</v-card-title>
          <v-card-subtitle>
            <span>Zählstellennummer: {{ zaehlung.zaehlstelleNummer }}</span>
            <br />
            <span>{{ datum }}</span>
          </v-card-subtitle>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-card-title>
            <zaehlung-geometrie
              v-model="zaehlung.knotenarme"
              height="60"
              width="60"
              active-color="#1565C0"
              passive-color="#EEEEEE"
            />
          </v-card-title>
        </v-col>
      </v-row>

      <v-card-text>
        <v-row
          align="center"
          class="mx-0 mt-2"
          no-gutters
        >
          <v-spacer />
          <v-col
            cols="12"
            md="1"
          >
            <zaehlart-icon
              :zaehlart="zaehlung.zaehlart"
              :color="ICON_COLOR"
            ></zaehlart-icon>
          </v-col>
          <v-spacer />
          <v-col
            cols="12"
            md="1"
          >
            <wetter-icon
              :wetter="zaehlung.wetter"
              :color="ICON_COLOR"
            ></wetter-icon>
          </v-col>
          <v-spacer />
          <v-col
            cols="12"
            md="1"
          >
            <zaehldauer-icon
              :zaehldauer="zaehlung.zaehldauer"
              :color="ICON_COLOR"
            ></zaehldauer-icon>
          </v-col>
          <v-spacer />
          <v-col
            cols="12"
            md="1"
          >
            <quelle-icon
              :quelle="zaehlung.quelle"
              :color="ICON_COLOR"
            ></quelle-icon>
          </v-col>
          <v-spacer />
        </v-row>

        <v-row
          align="center"
          class="mx-0 mt-2"
          no-gutters
        >
          <v-col md="12">
            <v-data-table
              density="compact"
              :headers="streetsHeader as Array<any>"
              :items="streets"
              item-key="nummer"
              :items-per-page="-1"
              hide-default-footer
              fixed-header
            />
          </v-col>
        </v-row>
      </v-card-text>
    </div>

    <v-card-actions>
      <v-btn
        v-if="showButtonAbschliessen"
        class="ml-2 mr-2"
        color="secondary"
        variant="elevated"
        text="Abschließen"
        @click="zaehlungAbschliessen"
      />
      <v-btn
        v-if="showButtonKorrektur"
        class="ml-2 mr-2"
        color="secondary"
        variant="elevated"
        text="Korrigieren"
        @click="zaehlungKorrigieren"
      />
      <v-spacer />

      <v-btn
        v-tooltip:bottom="'Chat'"
        class="ml-2 mr-2"
        icon
        color="secondary"
        @click="openChatDialog"
      >
        <v-badge
          v-if="zaehlung.unreadMessagesDienstleister"
          dot
          color="red"
        >
          <v-icon>mdi-tooltip-account</v-icon>
        </v-badge>
        <v-icon v-else>mdi-tooltip-account</v-icon>
      </v-btn>

      <v-menu location="right bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-dots-vertical"
            color="black"
          />
        </template>
        <v-list density="compact">
          <v-list-item density="compact">
            <v-btn
              v-tooltip:end="'CSV-Muster herunterladen'"
              class="ml-2 mr-2"
              icon="mdi-download"
              variant="text"
              color="secondary"
              @click="downloadDummyCsv"
            />
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type UpdateStatusDTO from "@/domain/dto/UpdateStatusDTO";
import type GeoPoint from "@/domain/GeoPoint";
import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { LatLng } from "leaflet";
import { cloneDeep, isEmpty, isNil } from "lodash";
import { computed, ref } from "vue";

import { ApiError } from "@/api/error";
import ZaehlungService from "@/api/service/ZaehlungService";
import IconOptions from "@/components/icons/IconOptions";
import QuelleIcon from "@/components/icons/QuelleIcon.vue";
import WetterIcon from "@/components/icons/WetterIcon.vue";
import ZaehlartIcon from "@/components/icons/ZaehlartIcon.vue";
import ZaehldauerIcon from "@/components/icons/ZaehldauerIcon.vue";
import ZaehlungCardMap from "@/components/map/ZaehlungCardMap.vue";
import ZaehlungGeometrie from "@/components/zaehlung/ZaehlungGeometrie.vue";
import { useSnackbarStore } from "@/store/SnackbarStore";
import Status, { statusIcon } from "@/types/enum/Status";
import Zaehlart from "@/types/enum/Zaehlart";
import { useDateUtils } from "@/util/DateUtils";
import KnotenarmComparator from "@/util/KnotenarmComparator";

const zaehlung = defineModel<ZaehlungDTO>({
  required: true,
});

const emits = defineEmits<{
  (e: "saved"): void;
  (e: "cancel"): void;
  (e: "openZaehlungDialog", zaehlung: ZaehlungDTO): void;
  (e: "openChatDialog", zaehlung: ZaehlungDTO): void;
}>();

const ICON_COLOR = "black";

const loading = ref<boolean>(false);

const snackbarStore = useSnackbarStore();
const dateUtils = useDateUtils();

const coordsZaehlstelle = computed<LatLng>(() => {
  return createLatLngFromString(
    zaehlung.value.zaehlstellePunkt.lat,
    zaehlung.value.zaehlstellePunkt.lon
  );
});

const coordsZaehlung = computed(() => {
  const geoPoint: GeoPoint = zaehlung.value.punkt;
  return createLatLngFromString(geoPoint.lat, geoPoint.lon);
});

const datum = computed(() => {
  return dateUtils.getShortVersionOfDate(zaehlung.value.datum);
});

const streets = computed(() => {
  return cloneDeep(zaehlung.value.knotenarme).sort(
    KnotenarmComparator.sortByNumber
  );
});

const streetsHeader = [
  {
    title: "Nummer",
    align: "center",
    sortable: false,
    value: "nummer",
    lastFixed: true,
  },
  {
    title: "Straßenname",
    align: "center",
    sortable: false,
    value: "strassenname",
  },
];

const statusDesign = computed(() => {
  let design: IconOptions | undefined = statusIcon.get(zaehlung.value.status);
  if (!design) {
    design = {} as IconOptions;
    design.color = "deep-orange-lighten-4";
    design.iconPath = "mdi-calendar-question";
    design.tooltip = "Status unbekannt";
  }
  return design;
});

const showButtonKorrektur = computed<boolean>(() => {
  return hasUploadedFile.value && zaehlung.value.status === Status.CORRECTION;
});

const showButtonAbschliessen = computed<boolean>(() => {
  // Wenn alle Knotenarme einen Filename beinhalten, darf man diesen Button sehen
  return hasUploadedFile.value && zaehlung.value.status === Status.COUNTING;
});

const hasUploadedFile = computed<boolean>(() => {
  return isEmpty(
    zaehlung.value.knotenarme.filter((arm: KnotenarmDTO) => {
      return (
        !isNil(arm) && (isNil(arm.filename) || isEmpty(arm.filename.trim()))
      );
    })
  );
});

// Erzeugt aus den String Koordinaten ein Objekt von Typ LatLng
function createLatLngFromString(lat: string, lng: string): LatLng {
  return new LatLng(parseFloat(lat), parseFloat(lng));
}

function zaehlungAbschliessen(): void {
  loading.value = true;
  // Wenn alle Knotenarme einen Filename beinhalten, darf man diesen Button drücken
  if (hasUploadedFile.value) {
    const updateZaehlung: UpdateStatusDTO = {} as UpdateStatusDTO;
    updateZaehlung.zaehlungId = zaehlung.value.id;
    updateZaehlung.status = Status.ACCOMPLISHED;
    ZaehlungService.updateStatus(updateZaehlung)
      .then(() => {
        snackbarStore.showSuccess(
          `Die Zählung vom ${datum.value} wurde an den Auftraggeber übermittelt.`
        );
        emits("saved");
      })
      .catch((error: ApiError) => {
        snackbarStore.showApiError(error);
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

function zaehlungKorrigieren(): void {
  loading.value = true;
  if (hasUploadedFile.value) {
    const updateZaehlung: UpdateStatusDTO = {} as UpdateStatusDTO;
    updateZaehlung.zaehlungId = zaehlung.value.id;
    updateZaehlung.status = Status.ACCOMPLISHED;
    ZaehlungService.updateStatus(updateZaehlung)
      .then(() => {
        snackbarStore.showSuccess(
          `Die korrigierte Zählung vom ${datum.value} wurde an den Auftraggeber übermittelt.`
        );
        emits("saved");
      })
      .catch((error: ApiError) => {
        snackbarStore.showApiError(error);
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

function openZaehlungDialog() {
  emits("openZaehlungDialog", zaehlung.value);
}

function downloadDummyCsv(): void {
  // Beispiel: 62301Q_20210423_Knotenarm2.csv
  const zaehlstelleNummer: string = zaehlung.value.zaehlstelleNummer;
  const zaehlart: string =
    zaehlung.value.zaehlart === Zaehlart.N ? "" : zaehlung.value.zaehlart;
  const filename = `${zaehlstelleNummer}${zaehlart}_${zaehlung.value.datum.replace(
    "-",
    ""
  )}_Knotenarm_X.csv`;

  const metaHeader = "Zählstellennummer;Zählart;Datum;Knotenarmnummer;;;;;\n";
  const metaData = `${zaehlstelleNummer};${zaehlart};${zaehlung.value.datum};<von-Knotenarmnr>;;;;;\n`;
  const zaehlungHeader = "Intervallnummer;nach;Pkw;Lkw;Lz;Bus;Krad;Rad;Fuss\n";

  const csvContent =
    "data:text/csv;charset=utf-8," + metaHeader + metaData + zaehlungHeader;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link); // Required for FF

  link.click();
}

function openChatDialog() {
  zaehlung.value.unreadMessagesDienstleister = false;
  emits("openChatDialog", zaehlung.value);
}
</script>
