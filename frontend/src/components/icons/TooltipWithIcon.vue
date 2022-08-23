<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <v-icon
          v-if="!small"
          class="mr-1"
          :color="color"
          v-bind="attrs"
          v-on="on"
      >{{ icon }}
      </v-icon>
      <v-icon
          v-if="small"
          class="mr-1"
          :color="color"
          small
          v-bind="attrs"
          v-on="on"
      >{{ icon }}
      </v-icon>
    </template>
    <span>{{ tooltip }}</span>
  </v-tooltip>
</template>
<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component
export default class TooltipWithIcon extends Vue {

  @Prop({default: false}) small?: boolean
  @Prop({default: "black"}) color?: string
  @Prop() icon?: string
  @Prop() tooltip?: string
}
</script>