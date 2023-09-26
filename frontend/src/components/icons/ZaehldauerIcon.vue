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
import Zaehldauer from "@/domain/enums/Zaehldauer";

@Component({
    components: {
        BaseIcon,
    },
})
export default class ZaehldauerIcon extends Vue {
    @Prop({ default: false }) small?: boolean;
    @Prop({ default: "black" }) color?: string;
    @Prop() zaehldauer!: string;

    /**
     * Lädt das richtige Zähldauer Icon aus der Liste.
     */
    get icon() {
        if (!ZaehldauerIcon.zaehldauerIcons().has(this.zaehldauer)) {
            return new IconOptions(
                "mdi-help-box",
                "Keine Information zur Zähldauer"
            );
        }
        return ZaehldauerIcon.zaehldauerIcons().get(this.zaehldauer);
    }

    /**
     * Alle Zähldauer Icons zu den Schlüsseln.
     */
    static zaehldauerIcons(): Map<string, IconOptions> {
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
}
</script>