<template>
  <div>
    <span class="caption" v-if="showCaption">{{ caption }}</span><br/>
    <span class="text text-info">{{ text }}</span><br/><br/>
  </div>
</template>

<style scoped>
.text-info {
  font-size: 18px;
  color: black;
}
</style>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component
export default class LhmTextField extends Vue {

  @Prop({default: ""}) private readonly caption!: string;
  @Prop({default: ""}) private readonly text!: string;

  get showCaption(): boolean {
    return this.caption !== "";
  }

}
</script>
