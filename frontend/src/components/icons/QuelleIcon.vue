<template>
  <tooltip-with-icon
    :size="size"
    :color="color"
    :icon="icon.iconPath"
    :tooltip="icon.tooltip"
  />
</template>
<script setup lang="ts">
import { computed } from "vue";

import { Quelle } from "@/api/client";
import IconTooltip from "@/components/icons/IconTooltip";
import TooltipWithIcon from "@/components/icons/TooltipWithIcon.vue";

interface Props {
  size?: string;
  color?: string;
  quelle: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: "black",
  size: "default",
});

/**
 * Alle Quelle Icons zu den Schlüsseln.
 */
const quelleIcons: Map<string, IconTooltip> = new Map([
  [
    Quelle.Manually,
    new IconTooltip("mdi-clipboard-account", "Manuelle Zählung"),
  ],
  [Quelle.Detector, new IconTooltip("mdi-robot", "Detektorzählung")],
  [Quelle.Radar, new IconTooltip("mdi-radar", "Radarzählung")],
  [Quelle.Video, new IconTooltip("mdi-video", "Videozählung")],
]);

/**
 * Lädt das richtige MDI Icon aus der Liste.
 */
const icon = computed<IconTooltip>(() => {
  let result = quelleIcons.get(props.quelle);
  if (result === undefined) {
    result = new IconTooltip("mdi-help-box", "Keine Information zur Quelle");
  }
  return result;
});
</script>
