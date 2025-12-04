<template>
  <div>
    <span
      v-if="showCaption"
      class="text-caption"
      >{{ caption }}</span
    ><br />
    <span class="lhm-text-field">{{ text }}</span>
    <br /><br v-if="addExtraBr" />
  </div>
</template>

<script setup lang="ts">
import { isEmpty } from "lodash";
import { computed } from "vue";

interface Props {
  addExtraBr?: boolean;
  text?: string;
  caption: string;
}

const props = withDefaults(defineProps<Props>(), {
  addExtraBr: false,
  text: "",
});

const showCaption = computed(() => !isEmpty(props.caption));
</script>

<style scoped>
.lhm-text-field {
  font-size: 18px;
  color: black;
}
</style>
