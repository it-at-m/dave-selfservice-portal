<template>
    <v-sheet
        width="100%"
        :height="height"
        :max-height="height"
        class="overflow-y-auto"
    >
        <v-card-text>
            <h1>Hier kommen die Kontaktinfos rein</h1>
        </v-card-text>
    </v-sheet>
</template>

<script setup lang="ts">
interface Props {
    height?: string;
}

defineProps<Props>();
</script>
