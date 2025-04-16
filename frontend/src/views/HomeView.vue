<template>
  <v-container
    fluid
    class="pa-0"
  >
    <v-row dense>
      <v-col
        v-for="card in zaehlungCards"
        :key="card.zaehlung.id"
        :cols="card.flex"
      >
        <zaehlung-card
          v-model="card.zaehlung"
          @open-zaehlung-dialog="openZaehlungDialog"
          @open-chat-dialog="openChatDialog"
          @saved="reloadDataAndCloseDialog"
        />
      </v-col>
      <v-banner
        v-if="hasNoZaehlung"
        lines="one"
        width="100%"
        text="Es liegen aktuell keine Zählungen zur Bearbeitung vor."
      >
        <template #prepend>
          <v-icon
            icon="mdi-alert-decagram-outline"
            size="36"
            color="error"
          />
        </template>
      </v-banner>
    </v-row>

    <zaehlung-dialog
      :show-dialog="showZaehlungDialog"
      @saved="reloadDataAndCloseDialog"
      @cancel="cancelZaehlungDialog"
    />

    <chat-dialog
      v-model="zaehlung"
      :show-dialog="showChatDialog"
      @close-dialog="closeChatDialog"
    />
  </v-container>
</template>

<script setup lang="ts">
import type SavedDTO from "@/domain/dto/SavedDTO";
import type ZaehlungCardObject from "@/domain/ZaehlungCardObject";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { cloneDeep, isEmpty } from "lodash";
import { computed, onMounted, ref } from "vue";

import ZaehlungService from "@/api/service/ZaehlungService";
import ChatDialog from "@/components/chat/ChatDialog.vue";
import { useSnackbarStore } from "@/store/SnackbarStore";
import DefaultObjectCreator from "@/util/DefaultObjectCreator";
import ZaehlungCardObjectComparator from "@/util/ZaehlungCardObjectComparator";

const zaehlungCards = ref<Array<ZaehlungCardObject>>([]);

const showZaehlungDialog = ref<boolean>(false);

const showChatDialog = ref<boolean>(false);

const zaehlung = ref<ZaehlungDTO>(
  DefaultObjectCreator.createDefaultZaehlungDTO()
);

const snackbarStore = useSnackbarStore();

onMounted(() => {
  window.scrollTo(0, 0);
  loadZaehlungen();
});

const hasNoZaehlung = computed<boolean>(() => isEmpty(zaehlungCards.value));

function loadZaehlungen(): void {
  zaehlungCards.value = [];
  ZaehlungService.getAllRelevantZaehlungen()
    .then((zaehlungen: Array<ZaehlungDTO>) => {
      zaehlungen.forEach((zaehlung: ZaehlungDTO) => {
        zaehlungCards.value.push({ flex: 3, zaehlung: zaehlung });
      });
      zaehlungCards.value.sort(ZaehlungCardObjectComparator.sortByDatumDesc);
    })
    .catch((error) => snackbarStore.showApiError(error));
}

function reloadDataAndCloseDialog(savedDTO: SavedDTO): void {
  loadZaehlungen();
  showZaehlungDialog.value = false;
  snackbarStore.showInfo(savedDTO.response);
}

function cancelZaehlungDialog() {
  showZaehlungDialog.value = false;
}

function openZaehlungDialog(zaehlungToEdit: ZaehlungDTO) {
  zaehlung.value = cloneDeep(zaehlungToEdit);
  showZaehlungDialog.value = true;
}

function openChatDialog(zaehlungToChat: ZaehlungDTO) {
  zaehlung.value = cloneDeep(zaehlungToChat);
  showChatDialog.value = true;
}

function closeChatDialog() {
  showChatDialog.value = false;
}
</script>
