<template>
    <div>
        <span
            v-if="showCaption"
            class="text-caption"
            >{{ caption }}</span
        >
        <br />
        <span class="text text-info">{{ text }}</span>
        <br />
        <br />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
    caption?: string;
    text?: string;
}

const props = withDefaults(defineProps<Props>(), {
    caption: "",
    text: "",
});

const showCaption = computed<boolean>(() => props.caption !== "");
</script>

<style scoped>
.text-info {
    font-size: 18px;
    color: black;
}
</style>
