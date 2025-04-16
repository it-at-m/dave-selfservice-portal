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
import Zaehlart from "@/domain/enums/Zaehlart";
import { computed } from "vue";

interface Props {
    small?: boolean;
    color?: string;
    zaehlart?: string;
}

const props = withDefaults(defineProps<Props>(), {
    small: false,
    color: "black",
    zaehlart: "",
});

/**
 * Lädt das richtige MDI Icon aus der Liste.
 */
const icon = computed<IconOptions>(() => {
    let result = zaehlartIcons().get(props.zaehlart);
    if (result === undefined) {
        result = new IconOptions(
            "mdi-help-box",
            "Keine Information zur Zählart"
        );
    }
    return result;
});

/**
 * Alle Zählarten Icons zu den Schlüsseln
 */
function zaehlartIcons(): Map<string, IconOptions> {
    return new Map([
        [Zaehlart.N, new IconOptions("$artN", "Standardzählung")],
        [
            Zaehlart.H,
            new IconOptions("$artH", "Hauptverkehrsrichtung/Oberfläche/Hoch"),
        ],
        [Zaehlart.Q, new IconOptions("$artQ", "Querschnitt")],
        [Zaehlart.QB, new IconOptions("$artQB", "Bahnschnitt")],
        [
            Zaehlart.QH,
            new IconOptions(
                "$artQH",
                "Querschnitt/Hauptverkehrsrichtung/Oberfläche/Hoch"
            ),
        ],
        [Zaehlart.QI, new IconOptions("$artQI", "Isarschnitt")],
        [Zaehlart.QR, new IconOptions("$artQR", "Querschnitt Radverkehr")],
        [Zaehlart.QS, new IconOptions("$artQSt", "Stadtgrenzzählung")],
        [Zaehlart.Q_, new IconOptions("$artQS", "Querschnitt/Sonderzählung")],
        [
            Zaehlart.QT,
            new IconOptions("$artQT", "Querschnitt Tunnel/Unterführung/Tief"),
        ],
        [Zaehlart.R, new IconOptions("$artR", "Radverkehrszählung")],
        [Zaehlart.T, new IconOptions("$artT", "Tunnel/Unterführung/Tief")],
        [Zaehlart.TK, new IconOptions("$artTK", "Teilknoten")],
    ]);
}
</script>
