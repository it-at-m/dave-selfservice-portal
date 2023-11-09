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
                {{ dialogtitle }}
            </v-card-title>

            <v-card-text class="text-body-1">
                {{ dialogtext }}
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

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class SaveLeaveDialog extends Vue {
    /**
     * Steuerflag für den Dialog
     */
    @Prop() value!: boolean;

    dialogtitle = "Ungespeicherte Änderungen";
    dialogtext =
        "Es sind ungespeicherte Änderungen vorhanden. Wollen Sie die Seite wirklich verlassen?";

    no(): void {
        this.$emit("no");
    }

    yes(): void {
        this.$emit("yes");
    }
}
</script>