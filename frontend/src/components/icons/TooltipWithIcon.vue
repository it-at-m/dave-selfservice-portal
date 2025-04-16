<template>
    <v-tooltip bottom>
        <template #activator="{ on, attrs }">
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
<script setup lang="ts">
interface Props {
    small?: boolean;
    color?: string;
    icon?: string;
    tooltip?: string;
}

withDefaults(defineProps<Props>(), {
    small: false,
    color: "black",
    icon: "",
    tooltip: "",
});
</script>
