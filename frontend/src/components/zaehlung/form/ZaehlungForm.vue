<template>
    <v-sheet
        width="100%"
        class="d-flex flex-column"
    >
        <v-tabs
            v-model="activeTab"
            fixed-tabs
            background-color="grey darken-1"
            dark
            icons-and-text
            slider-color="grey lighten-1"
            slider-size="8"
        >
            <!-- Kopfzeile -->
            <v-tab>
                Allgemeine Info
                <v-icon>mdi-information-outline</v-icon>
            </v-tab>
            <v-tab>
                Knoten & Lage
                <v-icon>mdi-routes</v-icon>
            </v-tab>
            <v-tab>
                Fahrzeuge
                <v-icon>mdi-car-multiple</v-icon>
            </v-tab>
        </v-tabs>
        <v-tabs-items
            v-model="activeTab"
            class="d-flex flex-column align-stretch"
        >
            <!-- Inhalte -->
            <v-tab-item ref="allgemeineInfo">
                <allgemeine-info-form
                    :height="SHEETHEIGHT"
                    @isValid="setAllgemeineFormValid"
                />
            </v-tab-item>
            <v-tab-item ref="knotenUndLage">
                <knoten-richtung-form :height="SHEETHEIGHT" />
            </v-tab-item>
            <v-tab-item ref="fahrzeuge">
                <fahrzeuge-form :height="SHEETHEIGHT" />
            </v-tab-item>
        </v-tabs-items>

        <v-card-actions>
            <v-spacer />
            <v-btn
                color="secondary"
                :disabled="!isZaehlungValid"
                @click="save()"
            >
                Speichern
            </v-btn>
            <v-btn
                color="grey lighten-1"
                @click="cancel()"
            >
                Abbrechen
            </v-btn>
        </v-card-actions>

        <loader :value="loader"></loader>
    </v-sheet>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
/* eslint-disable no-unused-vars */
import { ApiError } from "@/api/error";
import SavedDTO from "@/domain/dto/SavedDTO";
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import KnotenarmDTO from "@/domain/dto/KnotenarmDTO";
import _ from "lodash";
import ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import {
    intervallnummern,
    StartUhrzeitEndeUhrzeit,
} from "@/domain/enums/Intervallnummern";
import FahrbeziehungDTO from "@/domain/dto/FahrbeziehungDTO";
/* eslint-enable no-unused-vars */
// Components
import AllgemeineInfoForm from "@/components/zaehlung/form/AllgemeineInfoForm.vue";
import KontaktForm from "@/components/zaehlung/form/KontaktForm.vue";
import KnotenRichtungForm from "@/components/zaehlung/form/KnotenLageForm.vue";
import FahrzeugeForm from "@/components/zaehlung/form/FahrzeugeForm.vue";

// Api
import ZaehlungService from "@/api/service/ZaehlungService";
import Loader from "@/components/common/Loader.vue";

@Component({
    components: {
        Loader,
        FahrzeugeForm,
        KnotenRichtungForm,
        KontaktForm,
        AllgemeineInfoForm,
    },
})
export default class ZaehlungForm extends Vue {
    readonly SHEETHEIGHT: string = "580px";

    private readonly SEPARATOR: string = ";";

    activeTab = 0;
    private isAllgemeinFormValid = false;

    loader = false;

    get isZaehlungValid(): boolean {
        return this.isAllgemeinFormValid;
    }

    save(): void {
        this.loader = true;
        const copy: ZaehlungDTO = _.cloneDeep(this.$store.getters.getZaehlung);
        if (!copy.fahrbeziehungen) {
            copy.fahrbeziehungen = [];
        }
        this.prepareForSaveZaehlung(copy);

        ZaehlungService.saveZaehlung(copy)
            .then((savedDTO: SavedDTO) => {
                savedDTO.response = "Die Zählung wurde aktualisiert.";
                this.$emit("saved", savedDTO);
            })
            .catch((error: ApiError) => {
                this.$store.dispatch("snackbar/showError", error);
            })
            .finally(() => {
                this.activeTab = 0;
                this.loader = false;
                this.$store.dispatch("setResetformevent", true);
            });
    }

    /**
     * Bereitet die tiefen Kopie auf das speichern vor.
     * D.h. es werden die CSV-Files in Zeitintervall-Objekte umgewandelt
     * und den Fahrbeziehungen zu geordnet.
     * @param zaehlung zum speichern
     * @private
     */
    private prepareForSaveZaehlung(zaehlung: ZaehlungDTO) {
        const zeitintervalleProFahrbeziehung: Map<
            string,
            Array<ZeitintervallDTO>
        > = new Map<string, Array<ZeitintervallDTO>>();
        zaehlung.knotenarme.forEach((arm: KnotenarmDTO) => {
            if (arm.filename && arm.filedata && arm.filedata.length > 0) {
                this.transformCsvDataToFahrbeziehung(arm).forEach(
                    (value, key) => {
                        zeitintervalleProFahrbeziehung.set(key, value);
                    }
                );
            }
        });

        zaehlung.fahrbeziehungen.forEach((fz: FahrbeziehungDTO) => {
            const key: string = this.getKeyOfFahrbeziehung(
                fz,
                zaehlung.kreisverkehr
            );
            if (zeitintervalleProFahrbeziehung.has(key)) {
                fz.zeitintervalle = zeitintervalleProFahrbeziehung.get(key)!;
            }
            fz.isKreuzung = !zaehlung.kreisverkehr;
        });
    }

    cancel(): void {
        this.activeTab = 0;
        this.$store.dispatch("setResetformevent", true);
        this.$emit("cancel");
    }

    setAllgemeineFormValid(isPartValid: boolean) {
        this.isAllgemeinFormValid = isPartValid;
    }

    private getStartEndeOfIntervallnummer(
        nummer: string
    ): StartUhrzeitEndeUhrzeit {
        return intervallnummern.get(nummer)!;
    }

    /**
     * Wandelt die am Knotenarm hinterlegten Daten aus der CSV in ein Array vom Typ ZeitintervallDTO um.
     * @param arm Knotenarm mit den Daten der csv
     */
    private transformCsvDataToFahrbeziehung(
        arm: KnotenarmDTO
    ): Map<string, Array<ZeitintervallDTO>> {
        const fahrbeziehungen: Map<string, Array<ZeitintervallDTO>> = new Map<
            string,
            Array<ZeitintervallDTO>
        >();
        const zeitinervalleproNach: Map<
            string,
            Array<ZeitintervallDTO>
        > = new Map<string, Array<ZeitintervallDTO>>();
        // Ersten 3 Zeilen entfernen
        arm.filedata.shift(); // Metda-Header
        let knotenarmVon: string = arm.filedata
            .shift()!
            .split(this.SEPARATOR)[3];
        arm.filedata.shift(); // Zaehlung-Header

        // Alle weiteren Zeilen enthalten Zähldaten
        arm.filedata.forEach((line: string) => {
            if (line.trim().length === 0) {
                // skip Leerzeilen
            } else {
                const values: Array<string> = line.split(this.SEPARATOR);
                const startEndeOfIntervallnummer: StartUhrzeitEndeUhrzeit =
                    this.getStartEndeOfIntervallnummer(values[0]);
                // Bei Kreisverkehren steht hier e(infahrend), v(orbeifahrend) oder a(usfahrend) drinnen
                const knotenarmNach: string = values[1];

                // Wenn Nach noch nicht exisitert, dann leeres Array hinzufügen
                if (!zeitinervalleproNach.has(knotenarmNach)) {
                    zeitinervalleproNach.set(knotenarmNach, []);
                }

                const intervall: ZeitintervallDTO = {} as ZeitintervallDTO;
                intervall.startUhrzeit =
                    startEndeOfIntervallnummer.startUhrzeit;
                intervall.endeUhrzeit = startEndeOfIntervallnummer.endeUhrzeit;

                if (values[2].trim().length > 0) {
                    intervall.pkw = parseInt(values[2]);
                }
                if (values[3].trim().length > 0) {
                    intervall.lkw = parseInt(values[3]);
                }
                if (values[4].trim().length > 0) {
                    intervall.lastzuege = parseInt(values[4]);
                }
                if (values[5].trim().length > 0) {
                    intervall.busse = parseInt(values[5]);
                }
                if (values[6].trim().length > 0) {
                    intervall.kraftraeder = parseInt(values[6]);
                }
                if (values[7].trim().length > 0) {
                    intervall.fahrradfahrer = parseInt(values[7]);
                }
                if (values[8].trim().length > 0) {
                    intervall.fussgaenger = parseInt(values[8]);
                }
                zeitinervalleproNach.get(knotenarmNach)!.push(intervall);
            }
        });

        zeitinervalleproNach.forEach((value, key) => {
            fahrbeziehungen.set(knotenarmVon + key, value);
        });
        return fahrbeziehungen;
    }

    /**
     * Liefert den Schlüssel zum Speichern der Zeitintervalle an die jeweilige Fahrbeziehung zurück
     * @param fz Fahrbeziehung
     * @param isKreisverkehr andere Behandlung wenn true
     * @private
     */
    private getKeyOfFahrbeziehung(
        fz: FahrbeziehungDTO,
        isKreisverkehr: boolean
    ): string {
        let key = `${fz.knotenarm}`;
        if (isKreisverkehr) {
            if (fz.hinein) {
                key += "e";
            } else if (fz.vorbei) {
                key += "v";
            } else if (fz.heraus) {
                key += "a";
            }
        } else {
            key = `${fz.von}${fz.nach}`;
        }
        return key;
    }
}
</script>