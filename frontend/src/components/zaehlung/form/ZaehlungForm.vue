<template>
  <v-sheet
    width="100%"
    class="d-flex flex-column"
  >
    <v-tabs
      v-model="activeTab"
      fixed-tabs
      bg-color="grey-darken-1"
      slider-color="grey-lighten-1"
      stacked
      density="compact"
      color="white"
      class="text-grey-lighten-1"
    >
      <!-- Kopfzeile -->
      <v-tab :value="TAB_INFO">
        <v-icon icon="mdi-information-outline" />
        Allgemeine Info
      </v-tab>
      <v-tab :value="TAB_KNOTEN">
        <v-icon icon="mdi-routes" />
        Knoten & Lage
      </v-tab>
      <v-tab :value="TAB_FAHRZEUGE">
        <v-icon icon="mdi-car-multiple" />
        Verkehrsarten
      </v-tab>
    </v-tabs>
    <v-tabs-window
      v-model="activeTab"
      class="d-flex flex-column align-stretch"
    >
      <!-- Inhalte -->
      <v-tabs-window-item :value="TAB_INFO">
        <allgemeine-info-form
          v-model="zaehlung"
          :height="contentHeight"
        />
      </v-tabs-window-item>
      <v-tabs-window-item :value="TAB_KNOTEN">
        <knoten-lage-form
          v-model="zaehlung"
          :height="contentHeight"
        />
      </v-tabs-window-item>
      <v-tabs-window-item :value="TAB_FAHRZEUGE">
        <fahrzeuge-form
          v-model="zaehlung"
          :height="contentHeight"
        />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-sheet>
</template>

<script setup lang="ts">
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { computed, ref, watch } from "vue";
import { useDisplay } from "vuetify";

import AllgemeineInfoForm from "@/components/zaehlung/form/AllgemeineInfoForm.vue";
import FahrzeugeForm from "@/components/zaehlung/form/FahrzeugeForm.vue";
import KnotenLageForm from "@/components/zaehlung/form/KnotenLageForm.vue";
import { useEventbusStore } from "@/store/EventbusStore";
import { useDaveUtils } from "@/util/DaveUtils";

const zaehlung = defineModel<ZaehlungDTO>({
  required: true,
});

const { mobile, height } = useDisplay();
const daveUtils = useDaveUtils();
const eventbus = useEventbusStore();

const activeTab = ref(0);

const TAB_INFO = 0;
const TAB_KNOTEN = 1;
const TAB_FAHRZEUGE = 2;

watch(
  () => eventbus.getResetFormEvent,
  () => {
    activeTab.value = TAB_INFO;
  }
);

const contentHeight = computed(() => {
  const calculated =
    daveUtils.pxToVh(mobile.value ? height.value : 800) -
    daveUtils.cardtitleHeight.value -
    daveUtils.tabHeight.value -
    daveUtils.cardactionHeight.value;
  return `${calculated}vh`;
});
</script>
