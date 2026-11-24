<template>
  <knotenverkehr-form
    v-if="
      zaehlung.zaehlart === Zaehlart.FJS || zaehlung.zaehlart === Zaehlart.QU
    "
    v-model:zaehlung="zaehlung"
    :height="height"
    :width="width"
    :clickable="false"
  />
  <querschnitt-je-strassenseite-form
    v-else-if="zaehlung.zaehlart === Zaehlart.QJS"
    v-model:zaehlung="zaehlung"
    :height="height"
    :width="width"
    :is-knoten-lage-form-valid="true"
    :clickable="false"
    :show-streetnames="false"
  />
  <zaehlung-geometrie
    v-else
    id="geo"
    :model-value="zaehlung.knotenarme ?? []"
    :height="height"
    :width="width"
    active-color="#1565C0"
    passive-color="#EEEEEE"
  />
</template>

<script setup lang="ts">
import type { ExternalZaehlungDTO } from "@/api/client";

import KnotenverkehrForm from "@/components/zaehlung/form/verkehrsbeziehungen/KnotenverkehrForm.vue";
import QuerschnittJeStrassenseiteForm from "@/components/zaehlung/form/verkehrsbeziehungen/QuerschnittJeStrassenseiteForm.vue";
import ZaehlungGeometrie from "@/components/zaehlung/form/verkehrsbeziehungen/ZaehlungGeometrie.vue";
import Zaehlart from "@/types/enum/Zaehlart";

interface Props {
  height: string;
  width: string;
}
defineProps<Props>();

const zaehlung = defineModel<ExternalZaehlungDTO>("zaehlung", {
  required: true,
});
</script>
