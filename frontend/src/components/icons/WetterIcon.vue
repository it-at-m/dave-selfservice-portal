<template>
  <base-icon
      :small="small"
      :color="color"
      :icon="icon.iconPath"
      :tooltip="icon.tooltip"
  ></base-icon>
</template>
<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import BaseIcon from "@/components/icons/TooltipWithIcon.vue"
import IconOptions from "@/components/icons/IconOptions";
import Wetter from "@/domain/enums/Wetter";

@Component({
  components: {
    BaseIcon
  }
})
export default class WetterIcon extends Vue {

  @Prop({default: false}) small?: boolean
  @Prop({default: "black"}) color?: string
  @Prop() wetter!: string

  /**
   * Lädt das richtige MDI Icon aus der Liste.
   */
  get icon() {
    if (!WetterIcon.wetterIcons().has(this.wetter)) {
      return new IconOptions("mdi-cloud-question", "Keine Information zum Wetter")
    }
    return WetterIcon.wetterIcons().get(this.wetter)
  }

  /**
   * Alle Wetter Icons zu den Schlüsseln.
   */
  static wetterIcons(): Map<string, IconOptions> {
    return new Map([
      [Wetter.SUNNY, new IconOptions("mdi-weather-sunny", "Sonnig")],
      [Wetter.SUNNY_COLD, new IconOptions("mdi-weather-hazy", "Sonnig, kalt")],
      [Wetter.CLOUDY, new IconOptions("mdi-weather-partly-cloudy", "Bewölkt")],
      [Wetter.RAINY, new IconOptions("mdi-weather-rainy", "Regnerisch (Schauer)")],
      [Wetter.CONTINUOUS_RAINY, new IconOptions("mdi-weather-pouring", "Regnerisch (dauerhaft)")],
      [Wetter.FOGGY, new IconOptions("mdi-weather-fog", "Neblig")],
      [Wetter.SNOWY, new IconOptions("mdi-weather-snowy-heavy", "Schneefall")]
    ])
  }

}
</script>