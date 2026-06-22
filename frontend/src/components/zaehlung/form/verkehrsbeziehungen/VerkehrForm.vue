<template>
  <knotenverkehr-form
    v-if="
      zaehlung.zaehlart === Zaehlart.FJS || zaehlung.zaehlart === Zaehlart.QU
    "
    v-model:zaehlung="zaehlung"
    :height="height"
    :width="width"
  />
  <querschnitt-je-strassenseite-form
    v-else-if="zaehlung.zaehlart === Zaehlart.QJS"
    v-model:zaehlung="zaehlung"
    :height="height"
    :width="width"
  />
  <zaehlung-geometrie
      v-else
      id="geo"
      v-model="zaehlung.knotenarme"
      :height="height"
      :width="width"
      active-color="#1565C0"
      passive-color="#EEEEEE"
  />
</template>

<script setup lang="ts">
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import KnotenverkehrForm from "@/components/zaehlung/form/verkehrsbeziehungen/KnotenverkehrForm.vue";
import QuerschnittJeStrassenseiteForm from "@/components/zaehlung/form/verkehrsbeziehungen/QuerschnittJeStrassenseiteForm.vue";
import Zaehlart from "@/types/enum/Zaehlart";
import ZaehlungGeometrie from "@/components/zaehlung/form/verkehrsbeziehungen/ZaehlungGeometrie.vue";

interface Props {
  height: string;
  width: string;
}
defineProps<Props>();

const zaehlung = defineModel<ZaehlungDTO>("zaehlung", {
  required: true,
});
</script>
