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
import Quelle from "@/domain/enums/Quelle";
import IconOptions from "@/components/icons/IconOptions";

@Component({
  components: {
    BaseIcon
  }
})
export default class QuelleIcon extends Vue {
  @Prop({default: false}) small?: boolean
  @Prop({default: "black"}) color?: string
  @Prop() quelle!: string

  /**
   * Lädt das richtige MDI Icon aus der Liste.
   */
  get icon() {
    if (!QuelleIcon.quelleIcons().has(this.quelle)) {
      return new IconOptions("mdi-help-box", "Keine Information zur Quelle")
    }
    return QuelleIcon.quelleIcons().get(this.quelle)
  }

  /**
   * Alle Quelle Icons zu den Schlüsseln.
   */
  static quelleIcons(): Map<string, IconOptions> {
    return new Map([
      [Quelle.MANUALLY, new IconOptions("mdi-clipboard-account", "Manuelle Zählung")],
      [Quelle.DETECTOR, new IconOptions("mdi-robot", "Detektorzählung")],
      [Quelle.RADAR, new IconOptions("mdi-radar", "Radarzählung")],
      [Quelle.VIDEO, new IconOptions("mdi-video", "Videozählung")]
    ])
  }
}
</script>