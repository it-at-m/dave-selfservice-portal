<template>
  <v-sheet
    width="100%"
    class="d-flex flex-column"
  >
    <v-tabs
      v-model="activeTab"
      fixed-tabs
      background-color="grey darken-1"
      dark
      icons-and-text
      slider-color="grey lighten-1"
      slider-size="8"
    >
      <!-- Kopfzeile -->
      <v-tab>
        Allgemeine Info
        <v-icon>mdi-information-outline</v-icon>
      </v-tab>
      <v-tab>
        Knoten & Lage
        <v-icon>mdi-routes</v-icon>
      </v-tab>
      <v-tab>
        Fahrzeuge
        <v-icon>mdi-car-multiple</v-icon>
      </v-tab>
    </v-tabs>
    <v-tabs-items
      v-model="activeTab"
      class="d-flex flex-column align-stretch"
    >
      <!-- Inhalte -->
      <v-tab-item ref="allgemeineInfo">
        <allgemeine-info-form
          :height="SHEETHEIGHT"
          @isValid="setAllgemeineFormValid"
        />
      </v-tab-item>
      <v-tab-item ref="knotenUndLage">
        <knoten-lage-form :height="SHEETHEIGHT" />
      </v-tab-item>
      <v-tab-item ref="fahrzeuge">
        <fahrzeuge-form :height="SHEETHEIGHT" />
      </v-tab-item>
    </v-tabs-items>

    <v-card-actions>
      <v-spacer />
      <v-btn
        color="secondary"
        :disabled="!isAllgemeinFormValid"
        @click="save()"
      >
        Speichern
      </v-btn>
      <v-btn
        color="grey lighten-1"
        @click="cancel()"
      >
        Abbrechen
      </v-btn>
    </v-card-actions>
  </v-sheet>
</template>

<script setup lang="ts">
import { cloneDeep } from "lodash";
import { ref } from "vue";

import { ApiError } from "@/api/error";
import ZaehlungService from "@/api/service/ZaehlungService";
import AllgemeineInfoForm from "@/components/zaehlung/form/AllgemeineInfoForm.vue";
import FahrzeugeForm from "@/components/zaehlung/form/FahrzeugeForm.vue";
import KnotenLageForm from "@/components/zaehlung/form/KnotenLageForm.vue";
import FahrbeziehungDTO from "@/domain/dto/FahrbeziehungDTO";
import SavedDTO from "@/domain/dto/SavedDTO";
import ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import { useEventbusStore } from "@/store/EventbusStore";
import { useSnackbarStore } from "@/store/SnackbarStore";
import { useZaehlungStore } from "@/store/ZaehlungStore";
import {
  intervallnummern,
  StartUhrzeitEndeUhrzeit,
} from "@/types/enum/Intervallnummern";
import KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";
import ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

const emits = defineEmits<{
  (e: "saved", v: SavedDTO): void;
  (e: "cancel"): void;
}>();

const SHEETHEIGHT = "580px";

const SEPARATOR = ";";

const activeTab = ref<number>(0);

const isAllgemeinFormValid = ref<boolean>(false);

const loader = ref<boolean>(false);

const snackbarStore = useSnackbarStore();

const eventbusStore = useEventbusStore();

const zaehlungStore = useZaehlungStore();

function save(): void {
  loader.value = true;
  const copy: ZaehlungDTO = cloneDeep(zaehlungStore.getZaehlung);
  if (!copy.fahrbeziehungen) {
    copy.fahrbeziehungen = [];
  }
  prepareForSaveZaehlung(copy);

  ZaehlungService.saveZaehlung(copy)
    .then((savedDTO: SavedDTO) => {
      savedDTO.response = "Die Zählung wurde aktualisiert.";
      emits("saved", savedDTO);
    })
    .catch((error: ApiError) => {
      snackbarStore.showApiError(error);
    })
    .finally(() => {
      activeTab.value = 0;
      loader.value = false;
      eventbusStore.setResetFormEvent(true);
    });
}

/**
 * Bereitet die tiefen Kopie auf das speichern vor.
 * D.h. es werden die CSV-Files in Zeitintervall-Objekte umgewandelt
 * und den Fahrbeziehungen zu geordnet.
 * @param zaehlung zum speichern
 * @private
 */
function prepareForSaveZaehlung(zaehlung: ZaehlungDTO) {
  const zeitintervalleProFahrbeziehung: Map<
    string,
    Array<ZeitintervallDTO>
  > = new Map<string, Array<ZeitintervallDTO>>();
  zaehlung.knotenarme.forEach((arm: KnotenarmDTO) => {
    if (arm.filename && arm.filedata && arm.filedata.length > 0) {
      transformCsvDataToFahrbeziehung(arm).forEach((value, key) => {
        zeitintervalleProFahrbeziehung.set(key, value);
      });
    }
  });

  zaehlung.fahrbeziehungen.forEach((fz: FahrbeziehungDTO) => {
    const key: string = getKeyOfFahrbeziehung(fz, zaehlung.kreisverkehr);
    if (zeitintervalleProFahrbeziehung.has(key)) {
      fz.zeitintervalle = zeitintervalleProFahrbeziehung.get(key)!;
    }
    fz.isKreuzung = !zaehlung.kreisverkehr;
  });
}

function cancel(): void {
  activeTab.value = 0;
  eventbusStore.setResetFormEvent(true);
  emits("cancel");
}

function setAllgemeineFormValid(isPartValid: boolean) {
  isAllgemeinFormValid.value = isPartValid;
}

function getStartEndeOfIntervallnummer(
  nummer: string
): StartUhrzeitEndeUhrzeit {
  return intervallnummern.get(nummer)!;
}

/**
 * Wandelt die am Knotenarm hinterlegten Daten aus der CSV in ein Array vom Typ ZeitintervallDTO um.
 * @param arm Knotenarm mit den Daten der csv
 */
function transformCsvDataToFahrbeziehung(
  arm: KnotenarmDTO
): Map<string, Array<ZeitintervallDTO>> {
  const fahrbeziehungen: Map<string, Array<ZeitintervallDTO>> = new Map<
    string,
    Array<ZeitintervallDTO>
  >();
  const zeitinervalleProNach: Map<string, Array<ZeitintervallDTO>> = new Map<
    string,
    Array<ZeitintervallDTO>
  >();
  // Ersten 3 Zeilen entfernen
  arm.filedata.shift(); // Metda-Header
  let knotenarmVon: string = arm.filedata.shift()!.split(SEPARATOR)[3];
  arm.filedata.shift(); // Zaehlung-Header

  // Alle weiteren Zeilen enthalten Zähldaten
  arm.filedata.forEach((line: string) => {
    if (line.trim().length === 0) {
      // skip Leerzeilen
    } else {
      const values: Array<string> = line.split(SEPARATOR);
      const startEndeOfIntervallnummer: StartUhrzeitEndeUhrzeit =
        getStartEndeOfIntervallnummer(values[0]);
      // Bei Kreisverkehren steht hier e(infahrend), v(orbeifahrend) oder a(usfahrend) drinnen
      const knotenarmNach: string = values[1];

      // Wenn Nach noch nicht exisitert, dann leeres Array hinzufügen
      if (!zeitinervalleProNach.has(knotenarmNach)) {
        zeitinervalleProNach.set(knotenarmNach, []);
      }

      const intervall: ZeitintervallDTO = {} as ZeitintervallDTO;
      intervall.startUhrzeit = startEndeOfIntervallnummer.startUhrzeit;
      intervall.endeUhrzeit = startEndeOfIntervallnummer.endeUhrzeit;

      if (values[2].trim().length > 0) {
        intervall.pkw = parseInt(values[2]);
      }
      if (values[3].trim().length > 0) {
        intervall.lkw = parseInt(values[3]);
      }
      if (values[4].trim().length > 0) {
        intervall.lastzuege = parseInt(values[4]);
      }
      if (values[5].trim().length > 0) {
        intervall.busse = parseInt(values[5]);
      }
      if (values[6].trim().length > 0) {
        intervall.kraftraeder = parseInt(values[6]);
      }
      if (values[7].trim().length > 0) {
        intervall.fahrradfahrer = parseInt(values[7]);
      }
      if (values[8].trim().length > 0) {
        intervall.fussgaenger = parseInt(values[8]);
      }
      zeitinervalleProNach.get(knotenarmNach)!.push(intervall);
    }
  });

  zeitinervalleProNach.forEach((value, key) => {
    fahrbeziehungen.set(knotenarmVon + key, value);
  });
  return fahrbeziehungen;
}

function getKeyOfFahrbeziehung(
  fz: FahrbeziehungDTO,
  isKreisverkehr: boolean
): string {
  let key = `${fz.knotenarm}`;
  if (isKreisverkehr) {
    if (fz.hinein) {
      key += "e";
    } else if (fz.vorbei) {
      key += "v";
    } else if (fz.heraus) {
      key += "a";
    }
  } else {
    key = `${fz.von}${fz.nach}`;
  }
  return key;
}
</script>
