<template>
    <v-overlay
        absolute
        :value="value"
    >
        <v-progress-circular
            :size="120"
            :width="10"
            value="30"
            color="grey lighten-3"
            indeterminate
        >
        </v-progress-circular>
    </v-overlay>
</template>

<script setup lang="ts">
interface Props {
    value?: boolean;
}

withDefaults(defineProps<Props>(), {
    value: false,
});
</script>
