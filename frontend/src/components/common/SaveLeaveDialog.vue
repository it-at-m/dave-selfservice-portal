<template>
    <v-dialog
        v-model="value"
        persistent
        max-width="900px"
    >
        <v-card
            width="900px"
            flat
        >
            <v-card-title>
                <v-icon left>mdi-alert-outline</v-icon>
                {{ dialogTitle }}
            </v-card-title>

            <v-card-text class="text-body-1">
                {{ dialogText }}
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="secondary"
                    @click="yes"
                    >Ja
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                    color="grey lighten-1"
                    @click="no"
                    >Nein
                </v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
    /**
     * Steuerflag für den Dialog
     */
    value?: string;
}

defineProps<Props>();

const emits = defineEmits<{
    (e: "no"): void;
    (e: "yes"): void;
}>();

const dialogTitle = ref<string>("Ungespeicherte Änderungen");

const dialogText = ref<string>(
    "Es sind ungespeicherte Änderungen vorhanden. Wollen Sie die Seite wirklich verlassen?"
);

function no(): void {
    emits("no");
}

function yes(): void {
    emits("yes");
}
</script>
