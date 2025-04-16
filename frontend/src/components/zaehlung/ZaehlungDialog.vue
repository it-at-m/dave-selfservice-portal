<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="70%"
    min-width="600px"
    height="600px"
  >
    <v-card
      width="100%"
      flat
    >
      <v-card-title>
        <v-icon left>mdi-calendar-edit</v-icon>
        {{ dialogtitle }}
      </v-card-title>

      <v-card-text>
        <zaehlung-form
          @cancel="cancelCreate"
          @saved="saved"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";

import ZaehlungForm from "@/components/zaehlung/form/ZaehlungForm.vue";
import SavedDTO from "@/domain/dto/SavedDTO";
import { useEventbusStore } from "@/store/EventbusStore";
import { useZaehlungStore } from "@/store/ZaehlungStore";
import Status from "@/types/enum/Status";
import ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

interface Props {
  showDialog: boolean;
}

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "saved", v: SavedDTO): void;
  (e: "cancel"): void;
}>();

const eventbusStore = useEventbusStore();

const zaehlungStore = useZaehlungStore();

const showDialog = computed<boolean>(() => props.showDialog);

const dialogtitle = computed<string>(() => {
  const zaehlung: ZaehlungDTO = zaehlungStore.getZaehlung;
  let dialogtitleText = "anzeigen";
  if (zaehlung.status === Status.CORRECTION) {
    dialogtitleText = "korrigieren";
  } else if (zaehlung.status === Status.COUNTING) {
    dialogtitleText = "bearbeiten";
  }
  return `${zaehlung.zaehlstelleNummer} - Zählung ${dialogtitleText}`;
});

watch(showDialog, () => {
  // value === true, if open
  // value === false, if close
  eventbusStore.setResetFormEvent(!props.showDialog);
});

function cancelCreate(): void {
  emits("cancel");
}

function saved(savedDTO: SavedDTO): void {
  emits("saved", savedDTO);
}
</script>
