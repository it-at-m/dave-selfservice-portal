<template>
    <v-dialog
        v-model="showDialog"
        persistent
        max-width="70%"
        min-width="600px"
        height="600px"
    >
        <v-card
            width="100%"
            flat
        >
            <v-card-title>
                <v-icon left>mdi-calendar-edit</v-icon>
                {{ dialogtitle }}
            </v-card-title>

            <v-card-text>
                <zaehlung-form
                    @cancel="cancelCreate"
                    @saved="saved"
                />
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
/* eslint-disable no-unused-vars */
import ZaehlungForm from "@/components/zaehlung/form/ZaehlungForm.vue";
import SavedDTO from "@/domain/dto/SavedDTO";
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import Status from "@/domain/enums/Status";
/* eslint-enable no-unused-vars */
@Component({
    components: { ZaehlungForm },
})
export default class ZaehlungDialog extends Vue {
    /**
     * Steuerflag für den Dialog
     */
    @Prop() private showDialog!: boolean;

    @Watch("showDialog")
    openOrCloseDialog() {
        // value === true, if open
        // value === false, if close
        this.$store.dispatch("setResetformevent", !this.showDialog);
    }

    private cancelCreate(): void {
        this.$emit("cancel");
    }

    private saved(savedDTO: SavedDTO): void {
        this.$emit("saved", savedDTO);
    }

    get dialogtitle(): string {
        const zaehlung: ZaehlungDTO = this.zaehlungStore;
        let dialogtitleText = "anzeigen";
        if (zaehlung.status === Status.CORRECTION) {
            dialogtitleText = "korrigieren";
        } else if (zaehlung.status === Status.COUNTING) {
            dialogtitleText = "bearbeiten";
        }
        return `${zaehlung.zaehlstelleNummer} - Zählung ${dialogtitleText}`;
    }

    get zaehlungStore(): ZaehlungDTO {
        return this.$store.getters.getZaehlung;
    }
}
</script>