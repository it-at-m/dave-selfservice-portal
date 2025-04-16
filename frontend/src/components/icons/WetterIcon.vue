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
import Wetter from "@/domain/enums/Wetter";
import { computed } from "vue";

interface Props {
    small?: boolean;
    color?: string;
    wetter?: string;
}

const props = withDefaults(defineProps<Props>(), {
    small: false,
    color: "black",
    wetter: "",
});

/**
 * Lädt das richtige MDI Icon aus der Liste.
 */
const icon = computed<IconOptions>(() => {
    let result = wetterIcons().get(props.wetter);
    if (result === undefined) {
        result = new IconOptions(
            "mdi-cloud-question",
            "Keine Information zum Wetter"
        );
    }
    return result;
});

/**
 * Alle Wetter Icons zu den Schlüsseln.
 */
function wetterIcons(): Map<string, IconOptions> {
    return new Map([
        [Wetter.SUNNY, new IconOptions("mdi-weather-sunny", "Sonnig")],
        [
            Wetter.SUNNY_COLD,
            new IconOptions("mdi-weather-hazy", "Sonnig, kalt"),
        ],
        [
            Wetter.CLOUDY,
            new IconOptions("mdi-weather-partly-cloudy", "Bewölkt"),
        ],
        [
            Wetter.RAINY,
            new IconOptions("mdi-weather-rainy", "Regnerisch (Schauer)"),
        ],
        [
            Wetter.CONTINUOUS_RAINY,
            new IconOptions("mdi-weather-pouring", "Regnerisch (dauerhaft)"),
        ],
        [Wetter.FOGGY, new IconOptions("mdi-weather-fog", "Neblig")],
        [
            Wetter.SNOWY,
            new IconOptions("mdi-weather-snowy-heavy", "Schneefall"),
        ],
    ]);
}
</script>
