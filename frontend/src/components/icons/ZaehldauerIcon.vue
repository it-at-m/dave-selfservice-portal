<template>
    <base-icon
        :small="small"
        :color="color"
        :icon="icon.iconPath"
        :tooltip="icon.tooltip"
    />
</template>
<script setup lang="ts">
import BaseIcon from "@/components/icons/TooltipWithIcon.vue";
import IconOptions from "@/components/icons/IconOptions";
import Zaehldauer from "@/domain/enums/Zaehldauer";
import { computed } from "vue";

interface Props {
    small?: boolean;
    color?: string;
    zaehldauer?: string;
}

const props = withDefaults(defineProps<Props>(), {
    small: false,
    color: "black",
    zaehldauer: "",
});

/**
 * Lädt das richtige MDI Icon aus der Liste.
 */
const icon = computed<IconOptions>(() => {
    let result = zaehldauerIcons().get(props.zaehldauer);
    if (result === undefined) {
        result = new IconOptions(
            "mdi-help-box",
            "Keine Information zur Zähldauer"
        );
    }
    return result;
});

/**
 * Alle Zähldauer Icons zu den Schlüsseln.
 */
function zaehldauerIcons(): Map<string, IconOptions> {
    return new Map([
        [
            Zaehldauer.DAUER_2_X_4_STUNDEN,
            new IconOptions("$zaehldauer2x4h", "2x4h Zählung"),
        ],
        [
            Zaehldauer.DAUER_24_STUNDEN,
            new IconOptions("$zaehldauer24h", "24h Zählung"),
        ],
        [
            Zaehldauer.DAUER_16_STUNDEN,
            new IconOptions("$zaehldauer16h", "16h Zählung"),
        ],
        [
            Zaehldauer.DAUER_13_STUNDEN,
            new IconOptions("$zaehldauer13h", "13h Zählung"),
        ],
        [
            Zaehldauer.SONSTIGE,
            new IconOptions("$zaehldauerSoZ", "Sonstige Zählung"),
        ],
    ]);
}
</script>
