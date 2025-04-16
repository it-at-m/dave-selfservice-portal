<template>
    <v-snackbar
        id="snackbar"
        v-model="show"
        :color="color"
        :timeout="timeout"
        left
        bottom
        vertical
    >
        <div style="font-size: medium">
            {{ snackbarTextPart1 }}
        </div>
        <div style="font-size: small; white-space: pre-line">
            {{ snackbarTextPart2 }}
        </div>
        <v-btn
            v-if="color === 'error'"
            color="primary"
            text
            @click="show = false"
        >
            Schließen
        </v-btn>
    </v-snackbar>
</template>

<script setup lang="ts">
import { Levels } from "@/api/error";
import { useSnackbarStore } from "@/store/SnackbarStore";
import { isNil } from "lodash";
import { computed, ref, watch } from "vue";

const show = ref<boolean>(false);

const timeout = ref<number>(6000);

const snackbarTextPart1 = ref<string>("");

const snackbarTextPart2 = ref<string>("");

const color = ref<string>("info");

const snackbarStore = useSnackbarStore();

const isSnackbarTriggered = computed<boolean>(() => snackbarStore.trigger);

watch(
    isSnackbarTriggered,
    () => {
        show.value = false;
        setTimeout(() => {
            snackbarTextPart1.value = isNil(snackbarStore.getTextPart1)
                ? ""
                : snackbarStore.getTextPart1;
            snackbarTextPart2.value = isNil(snackbarStore.getTextPart2)
                ? ""
                : snackbarStore.getTextPart2;
            color.value = snackbarStore.getLevel;
            switch (color.value) {
                case Levels.ERROR: {
                    timeout.value = 0;
                    break;
                }
                case Levels.WARNING: {
                    timeout.value = 8000;
                    break;
                }
                case Levels.SUCCESS: {
                    timeout.value = 4000;
                    break;
                }
                default: {
                    timeout.value = 6000;
                    break;
                }
            }
            show.value = true;
        }, 100);
    },
    { immediate: true }
);
</script>
