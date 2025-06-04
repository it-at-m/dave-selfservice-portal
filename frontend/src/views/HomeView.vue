<template>
  <v-main class="dave-default">
    <v-sheet
      class="overflow-y-auto overflow-x-hidden"
      :height="contentHeight"
      width="100%"
    >
      <v-row dense>
        <v-col
          v-for="card in zaehlungCards"
          :key="card.zaehlung.id"
          :cols="colums"
        >
          <zaehlung-card
            v-model="card.zaehlung"
            class="mx-auto my-12"
            max-width="374"
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
        v-model="zaehlung"
        :show-dialog="showZaehlungDialog"
        @saved="reloadDataAndCloseDialog"
        @close-dialog="closeZaehlungDialog"
      />

      <chat-dialog
        v-model="zaehlung"
        :show-dialog="showChatDialog"
        @close-dialog="closeChatDialog"
      />
    </v-sheet>
  </v-main>
</template>

<script setup lang="ts">
import type ZaehlungCardObject from "@/domain/ZaehlungCardObject";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { cloneDeep, isEmpty } from "lodash";
import { computed, onMounted, ref } from "vue";
import { useDisplay } from "vuetify";

import ZaehlungService from "@/api/service/ZaehlungService";
import ChatDialog from "@/components/chat/ChatDialog.vue";
import ZaehlungCard from "@/components/zaehlung/ZaehlungCard.vue";
import ZaehlungDialog from "@/components/zaehlung/ZaehlungDialog.vue";
import { useSnackbarStore } from "@/store/SnackbarStore";
import { useDaveUtils } from "@/util/DaveUtils";
import DefaultObjectCreator from "@/util/DefaultObjectCreator";
import ZaehlungCardObjectComparator from "@/util/ZaehlungCardObjectComparator";

const zaehlungCards = ref<Array<ZaehlungCardObject>>([]);

const showZaehlungDialog = ref<boolean>(false);

const showChatDialog = ref<boolean>(false);

const zaehlung = ref<ZaehlungDTO>(
  DefaultObjectCreator.createDefaultZaehlungDTO()
);

const daveUtils = useDaveUtils();
const snackbarStore = useSnackbarStore();
const { smAndDown, mdAndDown, lgAndDown } = useDisplay();

onMounted(() => {
  window.scrollTo(0, 0);
  loadZaehlungen();
});

const hasNoZaehlung = computed<boolean>(() => isEmpty(zaehlungCards.value));

const contentHeight = computed(() => {
  const height = 100 - daveUtils.appBarHeight.value;
  return `${height}vh`;
});

const colums = computed(() => {
  let cols = 3;
  if (smAndDown.value) {
    cols = 12;
  } else if (mdAndDown.value) {
    cols = 6;
  } else if (lgAndDown.value) {
    cols = 4;
  }
  return cols;
});

function loadZaehlungen(): void {
  zaehlungCards.value = [];
  ZaehlungService.getAllRelevantZaehlungen()
    .then((zaehlungen: Array<ZaehlungDTO>) => {
      zaehlungen.forEach((zaehlung: ZaehlungDTO) => {
        zaehlungCards.value.push({ zaehlung: zaehlung });
      });
      zaehlungCards.value.sort(ZaehlungCardObjectComparator.sortByDatumDesc);
    })
    .catch((error) => snackbarStore.showApiError(error));
}

function reloadDataAndCloseDialog(): void {
  loadZaehlungen();
  showZaehlungDialog.value = false;
}

function closeZaehlungDialog() {
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
