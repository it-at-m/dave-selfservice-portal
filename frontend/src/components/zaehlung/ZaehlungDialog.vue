<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="70%"
    height="800px"
  >
    <v-card
      width="100%"
      variant="flat"
    >
      <v-card-title>
        <v-icon
          end
          icon="mdi-calendar-edit"
        />
        {{ dialogtitle }}
      </v-card-title>

      <v-card-text class="py-0">
        <zaehlung-form
          v-model="zaehlung"
          @is-valid="setAllgemeineFormValid"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          text="Speichern"
          variant="elevated"
          :disabled="!isValid"
          @click="save()"
        />
        <v-btn
          color="grey-lighten-1"
          variant="elevated"
          text="Abbrechen"
          @click="cancel()"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type FahrbeziehungDTO from "@/domain/dto/FahrbeziehungDTO";
import type ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import type { StartUhrzeitEndeUhrzeit } from "@/types/enum/Intervallnummern";
import type KnotenarmDTO from "@/types/zaehlung/KnotenarmDTO";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { computed, ref, watch } from "vue";

import { ApiError } from "@/api/error";
import ZaehlungService from "@/api/service/ZaehlungService";
import ZaehlungForm from "@/components/zaehlung/form/ZaehlungForm.vue";
import { useEventbusStore } from "@/store/EventbusStore";
import { useSnackbarStore } from "@/store/SnackbarStore";
import { intervallnummern } from "@/types/enum/Intervallnummern";
import Status from "@/types/enum/Status";

interface Props {
  showDialog: boolean;
}

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "saved"): void;
  (e: "close-dialog"): void;
}>();

const zaehlung = defineModel<ZaehlungDTO>({
  required: true,
});

const SEPARATOR = ";";

const isValid = ref(false);

const eventbusStore = useEventbusStore();
const snackbarStore = useSnackbarStore();

watch(
  () => props.showDialog,
  () => {
    eventbusStore.setResetFormEvent();
  }
);

const showDialog = computed<boolean>(() => props.showDialog);

const dialogtitle = computed<string>(() => {
  let dialogtitleText = "anzeigen";
  if (zaehlung.value.status === Status.CORRECTION) {
    dialogtitleText = "korrigieren";
  } else if (zaehlung.value.status === Status.COUNTING) {
    dialogtitleText = "bearbeiten";
  }
  return `${zaehlung.value.zaehlstelleNummer} - Zählung ${dialogtitleText}`;
});

function setAllgemeineFormValid(isPartValid: boolean) {
  isValid.value = isPartValid;
}

function save(): void {
  prepareForSaveZaehlung();

  ZaehlungService.saveZaehlung(zaehlung.value)
    .then(() => {
      snackbarStore.showSuccess("Die Zählung wurde aktualisiert.");
      emits("saved");
    })
    .catch((error: ApiError) => {
      snackbarStore.showApiError(error);
    })
    .finally(() => {
      eventbusStore.setResetFormEvent();
    });
}

/**
 * Bereitet die tiefen Kopie auf das speichern vor.
 * D.h. es werden die CSV-Files in Zeitintervall-Objekte umgewandelt
 * und den Fahrbeziehungen zu geordnet.
 * @param zaehlung zum speichern
 * @private
 */
function prepareForSaveZaehlung() {
  const zeitintervalleProFahrbeziehung: Map<
    string,
    Array<ZeitintervallDTO>
  > = new Map<string, Array<ZeitintervallDTO>>();
  zaehlung.value.knotenarme.forEach((arm: KnotenarmDTO) => {
    if (arm.filename && arm.filedata && arm.filedata.length > 0) {
      transformCsvDataToFahrbeziehung(arm).forEach((value, key) => {
        zeitintervalleProFahrbeziehung.set(key, value);
      });
    }
  });

  zaehlung.value.fahrbeziehungen.forEach((fz: FahrbeziehungDTO) => {
    const key: string = getKeyOfFahrbeziehung(fz, zaehlung.value.kreisverkehr);
    if (zeitintervalleProFahrbeziehung.has(key)) {
      fz.zeitintervalle = zeitintervalleProFahrbeziehung.get(key)!;
    }
    fz.isKreuzung = !zaehlung.value.kreisverkehr;
  });
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
  const knotenarmVon: string = arm.filedata.shift()!.split(SEPARATOR)[3];
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

function getStartEndeOfIntervallnummer(
  nummer: string
): StartUhrzeitEndeUhrzeit {
  return intervallnummern.get(nummer)!;
}

function cancel(): void {
  eventbusStore.setResetFormEvent();
  emits("close-dialog");
}
</script>
