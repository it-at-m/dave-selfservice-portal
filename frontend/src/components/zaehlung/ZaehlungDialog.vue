<template>
  <v-dialog
    v-model="showDialog"
    persistent
    :fullscreen="mobile"
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
        <zaehlung-form v-model="zaehlung" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          text="Speichern"
          variant="elevated"
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
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { computed, watch } from "vue";
import { useDisplay } from "vuetify";

import { ApiError } from "@/api/error";
import ZaehlungService from "@/api/service/ZaehlungService";
import ZaehlungForm from "@/components/zaehlung/form/ZaehlungForm.vue";
import { useEventbusStore } from "@/store/EventbusStore";
import { useSnackbarStore } from "@/store/SnackbarStore";
import Status from "@/types/enum/Status";
import { useCsvToZeitintervallTransformationUtils } from "@/util/CsvToZeitintervallTransformationUtils";

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

const { mobile } = useDisplay();
const eventbusStore = useEventbusStore();
const snackbarStore = useSnackbarStore();
const csvToZeitintervallTransformationUtils =
  useCsvToZeitintervallTransformationUtils();

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

function save(): void {
  csvToZeitintervallTransformationUtils.transformCsvToZeitintervalleAndAddToZaehlung(
    zaehlung.value
  );

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

function cancel(): void {
  eventbusStore.setResetFormEvent();
  emits("close-dialog");
}
</script>
