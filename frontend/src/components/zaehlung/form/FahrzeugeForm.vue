<template>
    <v-sheet
        width="100%"
        :height="height"
        :max-height="height"
        class="overflow-y-auto"
    >
        <v-card-text>
            <v-row dense>
                <v-col>
                    <v-checkbox
                        v-model="pkw"
                        label="Personenkraftwagen (Pkw)"
                        color="grey darken-1"
                        hide-details
                        readonly
                        dense
                    ></v-checkbox>
                    <v-checkbox
                        v-model="lkw"
                        label="Lastkraftwagen (Lkw)"
                        color="grey darken-1"
                        hide-details
                        readonly
                        dense
                    ></v-checkbox>
                    <v-checkbox
                        v-model="lz"
                        label="Lastzüge (Lz)"
                        color="grey darken-1"
                        hide-details
                        readonly
                        dense
                    ></v-checkbox>
                    <v-checkbox
                        v-model="bus"
                        label="Bus"
                        color="grey darken-1"
                        hide-details
                        readonly
                        dense
                    ></v-checkbox>
                </v-col>
                <v-col>
                    <v-checkbox
                        v-model="krad"
                        label="Krafträder (Krad)"
                        color="grey darken-1"
                        hide-details
                        readonly
                        dense
                    ></v-checkbox>
                    <v-checkbox
                        v-model="rad"
                        label="Radfahrer"
                        color="grey darken-1"
                        hide-details
                        readonly
                        dense
                    ></v-checkbox>
                    <v-checkbox
                        v-model="fuss"
                        label="Fußgänger"
                        color="grey darken-1"
                        hide-details
                        readonly
                        dense
                    ></v-checkbox>
                </v-col>
            </v-row>
        </v-card-text>
    </v-sheet>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
/* eslint-disable no-unused-vars */
import Fahrzeug from "@/domain/enums/Fahrzeug";
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
/* eslint-enable no-unused-vars */

@Component
export default class FahrzeugFahrbeziehungForm extends Vue {
    @Prop()
    private readonly height!: string;

    // Variablen für die Checkboxen
    private pkw = false;
    private lkw = false;
    private lz = false;
    private bus = false;
    private krad = false;
    private rad = false;
    private fuss = false;

    mounted() {
        this.resetForm();
    }

    get zaehlungStore(): ZaehlungDTO {
        return this.$store.getters.getZaehlung;
    }

    get resetFormEvent(): boolean {
        return this.$store.getters.getResetformevent;
    }

    @Watch("resetFormEvent")
    private resetForm() {
        let zaehlung: ZaehlungDTO = this.zaehlungStore;
        this.pkw = zaehlung.kategorien.includes(Fahrzeug.PKW);
        this.lkw = zaehlung.kategorien.includes(Fahrzeug.LKW);
        this.lz = zaehlung.kategorien.includes(Fahrzeug.LZ);
        this.bus = zaehlung.kategorien.includes(Fahrzeug.BUS);
        this.krad = zaehlung.kategorien.includes(Fahrzeug.KRAD);
        this.rad = zaehlung.kategorien.includes(Fahrzeug.RAD);
        this.fuss = zaehlung.kategorien.includes(Fahrzeug.FUSS);
    }
}
</script>