<template>
    <base-icon
        :small="small"
        :color="color"
        :icon="icon.iconPath"
        :tooltip="icon.tooltip"
    ></base-icon>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import BaseIcon from "@/components/icons/TooltipWithIcon.vue";
import IconOptions from "@/components/icons/IconOptions";
import Zaehlart from "@/domain/enums/Zaehlart";

@Component({
    components: {
        BaseIcon,
    },
})
export default class ZaehlartIcon extends Vue {
    @Prop({ default: false }) small?: boolean;
    @Prop({ default: "black" }) color?: string;
    @Prop() zaehlart!: string;

    /**
     * Lädt das richtige MDI Icon aus der Liste.
     */
    get icon() {
        if (!ZaehlartIcon.zaehlartIcons().has(this.zaehlart)) {
            return new IconOptions(
                "mdi-help-box",
                "Keine Information zur Zählart"
            );
        }
        return ZaehlartIcon.zaehlartIcons().get(this.zaehlart);
    }

    /**
     * Alle Zählarten Icons zu den Schlüsseln
     */
    static zaehlartIcons(): Map<string, IconOptions> {
        return new Map([
            [Zaehlart.N, new IconOptions("$artN", "Standardzählung")],
            [
                Zaehlart.H,
                new IconOptions(
                    "$artH",
                    "Hauptverkehrsrichtung/Oberfläche/Hoch"
                ),
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
            [
                Zaehlart.Q_,
                new IconOptions("$artQS", "Querschnitt/Sonderzählung"),
            ],
            [
                Zaehlart.QT,
                new IconOptions(
                    "$artQT",
                    "Querschnitt Tunnel/Unterführung/Tief"
                ),
            ],
            [Zaehlart.R, new IconOptions("$artR", "Radverkehrszählung")],
            [Zaehlart.T, new IconOptions("$artT", "Tunnel/Unterführung/Tief")],
            [Zaehlart.TK, new IconOptions("$artTK", "Teilknoten")],
        ]);
    }
}
</script>