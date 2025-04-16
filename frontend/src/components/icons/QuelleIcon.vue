<template>
    <base-icon
        :small="small"
        :color="color"
        :icon="icon.iconPath"
        :tooltip="icon.tooltip"
    ></base-icon>
</template>
<script setup lang="ts">
import BaseIcon from "@/components/icons/TooltipWithIcon.vue";
import Quelle from "@/domain/enums/Quelle";
import IconOptions from "@/components/icons/IconOptions";
import { computed } from "vue";

interface Props {
    small?: boolean;
    color?: string;
    quelle?: string;
}

const props = withDefaults(defineProps<Props>(), {
    small: false,
    color: "black",
    quelle: "",
});

/**
 * Lädt das richtige MDI Icon aus der Liste.
 */
const icon = computed<IconOptions>(() => {
    let result = quelleIcons().get(props.quelle);
    if (result === undefined) {
        result = new IconOptions(
            "mdi-help-box",
            "Keine Information zur Quelle"
        );
    }
    return result;
});

/**
 * Alle Quelle Icons zu den Schlüsseln.
 */
function quelleIcons(): Map<string, IconOptions> {
    return new Map([
        [
            Quelle.MANUALLY,
            new IconOptions("mdi-clipboard-account", "Manuelle Zählung"),
        ],
        [Quelle.DETECTOR, new IconOptions("mdi-robot", "Detektorzählung")],
        [Quelle.RADAR, new IconOptions("mdi-radar", "Radarzählung")],
        [Quelle.VIDEO, new IconOptions("mdi-video", "Videozählung")],
    ]);
}
</script>
