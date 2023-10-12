<template>
    <v-sheet
        width="100%"
        :height="height"
        :max-height="height"
        class="overflow-y-auto"
    >
        <v-card-text>
            <v-form
                ref="form"
                v-model="validZaehlung"
            >
                <v-row dense>
                    <v-col
                        cols="12"
                        md="4"
                    >
                        <lhm-text-field
                            caption="Projektnummer"
                            :text="zaehlung.projektNummer"
                        />
                    </v-col>
                    <v-col
                        cols="12"
                        md="4"
                    >
                        <lhm-text-field
                            caption="Projektname"
                            :text="zaehlung.projektName"
                        />
                    </v-col>
                    <v-col
                        cols="12"
                        md="4"
                    >
                        <lhm-text-field
                            caption="Sonderzählung"
                            :text="getSonderzaehlungText"
                        />
                    </v-col>
                </v-row>
                <v-row dense>
                    <v-col
                        cols="12"
                        md="4"
                    >
                        <v-menu
                            v-if="isZaehlungInstructed"
                            ref="menu"
                            v-model="menu"
                            :close-on-content-click="false"
                            :close-on-click="false"
                            transition="scale-transition"
                            offset-y
                            max-width="290px"
                            min-width="auto"
                        >
                            <template #activator="{ on, attrs }">
                                <v-text-field
                                    v-model="computedDateFormatted"
                                    label="Datum"
                                    prepend-inner-icon="mdi-calendar"
                                    readonly
                                    outlined
                                    dense
                                    v-bind="attrs"
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                v-model="date"
                                no-title
                                :min="getActualDate"
                                locale="de"
                                :first-day-of-week="1"
                            >
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    color="primary"
                                    @click="saveDate"
                                >
                                    OK
                                </v-btn>
                                <v-btn
                                    text
                                    color="primary"
                                    @click="closeMenu"
                                >
                                    Abbrechen
                                </v-btn>
                            </v-date-picker>
                        </v-menu>
                        <lhm-text-field
                            v-else
                            caption="Zählung am"
                            :text="formattedDateAsText"
                        />
                    </v-col>
                    <v-col
                        cols="12"
                        md="4"
                    >
                        <lhm-text-field
                            caption="Zähldauer"
                            :text="getZaehldauer"
                        />
                    </v-col>
                    <v-col
                        cols="12"
                        md="4"
                    >
                        <lhm-text-field
                            caption="Zählintervall"
                            :text="getZaehlintervall"
                        />
                    </v-col>
                    <v-spacer />
                </v-row>
                <v-row dense>
                    <v-col
                        cols="12"
                        md="4"
                    >
                        <v-autocomplete
                            v-if="isZaehlungInstructed"
                            v-model="zaehlung.zaehlart"
                            outlined
                            :items="getZaehlarten"
                            dense
                            label="Zählart"
                            required
                            @blur="updateStore"
                        ></v-autocomplete>
                        <lhm-text-field
                            v-else
                            caption="Zählart"
                            :text="getZaehlart"
                        />
                    </v-col>
                    <v-col
                        cols="12"
                        md="4"
                    >
                        <lhm-text-field
                            caption="Quelle"
                            :text="getQuelle"
                        />
                    </v-col>
                    <v-col
                        cols="12"
                        md="4"
                    >
                        <v-autocomplete
                            v-model="zaehlung.wetter"
                            outlined
                            :items="getWetter"
                            dense
                            label="Wetter"
                            :disabled="isZaehlungReadonly"
                            @blur="updateStore"
                        ></v-autocomplete>
                    </v-col>
                </v-row>
                <v-row dense>
                    <v-col
                        cols="12"
                        md="12"
                    >
                        <v-textarea
                            v-model="zaehlung.kommentar"
                            label="Kommentar"
                            outlined
                            dense
                            rows="2"
                            row-height="10"
                            counter="255"
                            maxlength="255"
                            disabled
                            @blur="updateStore"
                        ></v-textarea>
                    </v-col>
                </v-row>
                <v-row dense>
                    <v-col
                        cols="12"
                        md="12"
                    >
                        <v-textarea
                            v-model="zaehlung.zaehlsituation"
                            label="Zählsituation"
                            outlined
                            dense
                            rows="2"
                            row-height="10"
                            counter="255"
                            maxlength="255"
                            :disabled="isZaehlungReadonly"
                            @blur="updateStore"
                        ></v-textarea>
                    </v-col>
                </v-row>
                <v-row dense>
                    <v-col
                        cols="12"
                        md="12"
                    >
                        <v-textarea
                            v-model="zaehlung.zaehlsituationErweitert"
                            label="erweiterte Zählsituation"
                            outlined
                            dense
                            rows="2"
                            row-height="10"
                            counter="255"
                            maxlength="255"
                            :disabled="isZaehlungReadonly"
                            @blur="updateStore"
                        ></v-textarea>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
    </v-sheet>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue, Watch } from "vue-property-decorator";
/* eslint-disable no-unused-vars */
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import { zaehlartenDropDown, zaehlartText } from "@/domain/enums/Zaehlart";
import { zaehldauerText } from "@/domain/enums/Zaehldauer";
import { quelleText } from "@/domain/enums/Quelle";
import _ from "lodash";
import LhmTextField from "@/components/common/LhmTextField.vue";
import KeyVal from "@/domain/KeyVal";
import { wetterDropDown } from "@/domain/enums/Wetter";
import Status from "@/domain/enums/Status";
/* eslint-enable no-unused-vars */
@Component({
    components: { LhmTextField },
})
export default class AllgemeineInfoForm extends Vue {
    @Prop()
    readonly height!: string;

    // Without Time
    date: string = new Date().toISOString().substr(0, 10);
    menu = false;
    validZaehlung = false;

    zaehlung: ZaehlungDTO = {} as ZaehlungDTO;

    @Ref("menu") private vMenu: any;

    mounted() {
        this.validZaehlung = false;
        this.updateWorkingCopy();
    }

    get zaehlungStore(): ZaehlungDTO {
        return this.$store.getters.getZaehlung;
    }

    @Watch("zaehlungStore")
    updateWorkingCopy(): void {
        this.zaehlung = _.cloneDeep(this.zaehlungStore);
        this.resetDatum();
    }

    @Watch("validZaehlung")
    sendIsValid(): void {
        this.$emit("isValid", this.validZaehlung);
    }

    updateStore(): void {
        this.$store.dispatch("setZaehlung", _.cloneDeep(this.zaehlung));
    }

    get getSonderzaehlungText(): string {
        return this.zaehlung.sonderzaehlung ? "Ja" : "Nein";
    }

    get getZaehldauer(): string | undefined {
        return zaehldauerText.get(this.zaehlung.zaehldauer);
    }

    get getQuelle(): string | undefined {
        return quelleText.get(this.zaehlung.quelle);
    }

    get getZaehlintervall(): string {
        return `${this.zaehlung.zaehlIntervall} min`;
    }

    get getWetter(): Array<KeyVal> {
        return wetterDropDown;
    }

    get getZaehlarten(): Array<KeyVal> {
        return zaehlartenDropDown;
    }

    get isZaehlungReadonly(): boolean {
        return !this.$store.getters.isZaehlungEditable;
    }

    get computedDateFormatted(): string | null {
        return this.formatDate(this.date);
    }

    private formatDateForBackend(): string {
        let time = new Date().toLocaleTimeString(navigator.language, {
            hour: "2-digit",
            minute: "2-digit",
        });
        return new Date(this.date + "T" + time).toISOString();
    }

    private formatDate(date: string): string | null {
        if (!date) {
            return null;
        }
        const [year, month, day] = date.split("-");
        return `${day}.${month}.${year}`;
    }

    saveDate(): void {
        this.vMenu.save(this.date);
        this.zaehlung.datum = this.formatDateForBackend();
        this.updateStore();
    }

    closeMenu(): void {
        this.menu = false;
        this.resetDatum();
    }

    private resetDatum(): void {
        this.date = this.zaehlung.datum.substr(0, 10);
    }

    get isZaehlungInstructed(): boolean {
        return this.zaehlung.status === Status.INSTRUCTED;
    }

    get formattedDateAsText(): string {
        if (!this.zaehlung.datum) {
            return '';
        }
        const [year, month, day] = this.zaehlung.datum.split("-");
        return `${day}.${month}.${year}`;
    }

    get getZaehlart(): string | undefined {
        return zaehlartText.get(this.zaehlung.zaehlart);
    }

    get getActualDate(): string {
        return new Date().toISOString().substr(0, 10);
    }
}
</script>