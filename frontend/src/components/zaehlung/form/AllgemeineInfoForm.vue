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

<script setup lang="ts">
import { Component, Prop, Ref, Vue, Watch } from "vue-property-decorator";
/* eslint-disable no-unused-vars */
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import { zaehlartenDropDown, zaehlartText } from "@/domain/enums/Zaehlart";
import { zaehldauerText } from "@/domain/enums/Zaehldauer";
import { quelleText } from "@/domain/enums/Quelle";
import _, { cloneDeep } from "lodash";
import LhmTextField from "@/components/common/LhmTextField.vue";
import KeyVal from "@/domain/KeyVal";
import { wetterDropDown } from "@/domain/enums/Wetter";
import Status from "@/domain/enums/Status";
import { useZaehlungStore } from "@/store/ZaehlungStore";
import { computed, onMounted, ref, watch } from "vue";

interface Props {
    height?: string;
}

defineProps<Props>();

const emits = defineEmits<{
    (e: "isValid", v: boolean): void;
}>();

onMounted(() => {
    validZaehlung.value = false;
    updateWorkingCopy();
});

const date = ref<string>(new Date().toISOString().substr(0, 10));
const menu = ref<boolean>(false);
const validZaehlung = ref<boolean>(false);

const zaehlungStore = useZaehlungStore();

const zaehlung = computed<ZaehlungDTO>(() => {
    return zaehlungStore.getZaehlung;
});

const getSonderzaehlungText = computed<string>(() => {
    return zaehlung.value.sonderzaehlung ? "Ja" : "Nein";
});

const getZaehldauer = computed<string | undefined>(() => {
    return zaehldauerText.get(zaehlung.value.zaehldauer);
});

const getQuelle = computed<string | undefined>(() => {
    return quelleText.get(zaehlung.value.quelle);
});

const getZaehlintervall = computed<string>(() => {
    return `${zaehlung.value.zaehlIntervall} min`;
});

const getWetter = computed<Array<KeyVal>>(() => {
    return wetterDropDown;
});

const getZaehlarten = computed<Array<KeyVal>>(() => {
    return zaehlartenDropDown;
});

const isZaehlungReadonly = computed<boolean>(() => {
    return !zaehlungStore.isZaehlungEditable;
});

const dateFormatted = computed<string | null>(() => {
    return formatDate(date.value);
});

const isZaehlungInstructed = computed<boolean>(() => {
    return zaehlung.value.status === Status.INSTRUCTED;
});

const formattedDateAsText = computed<string>(() => {
    if (!zaehlung.value.datum) {
        return "";
    }
    const [year, month, day] = zaehlung.value.datum.split("-");
    return `${day}.${month}.${year}`;
});

const getZaehlart = computed<string | undefined>(() => {
    return zaehlartText.get(zaehlung.value.zaehlart);
});

watch(
    zaehlung,
    () => {
        updateWorkingCopy();
    },
    { immediate: true }
);

watch(
    validZaehlung,
    () => {
        emits("isValid", validZaehlung.value);
    },
    { immediate: true }
);

function updateWorkingCopy(): void {
    updateZaehlungStoreWithZaehlung();
    resetDatum();
}

function resetDatum(): void {
    date.value = zaehlung.value.datum.substr(0, 10);
}

function updateZaehlungStoreWithZaehlung(): void {
    zaehlungStore.setZaehlung(cloneDeep(zaehlung.value));
}

function formatDate(date: string): string | null {
    if (!date) {
        return null;
    }
    const [year, month, day] = date.split("-");
    return `${day}.${month}.${year}`;
}

function formatDateForBackend(): string {
    let time = new Date().toLocaleTimeString(navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
    });
    return new Date(date.value + "T" + time).toISOString();
}

function getActualDate(): string {
    return new Date().toISOString().substr(0, 10);
}

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

    private zaehlungStore = useZaehlungStore();

    @Ref("menu") private vMenu: any;

    //done
    mounted() {
        this.validZaehlung = false;
        this.updateWorkingCopy();
    }

    // done
    get getZaehlung(): ZaehlungDTO {
        return this.zaehlungStore.getZaehlung;
    }

    // done
    @Watch("zaehlungStore")
    updateWorkingCopy(): void {
        this.zaehlung = _.cloneDeep(this.getZaehlung);
        this.resetDatum();
    }

    // done
    @Watch("validZaehlung")
    sendIsValid(): void {
        this.$emit("isValid", this.validZaehlung);
    }

    // done
    updateStore(): void {
        this.zaehlungStore.setZaehlung(_.cloneDeep(this.zaehlung));
    }

    // done
    get getSonderzaehlungText(): string {
        return this.zaehlung.sonderzaehlung ? "Ja" : "Nein";
    }

    // done
    get getZaehldauer(): string | undefined {
        return zaehldauerText.get(this.zaehlung.zaehldauer);
    }

    // done
    get getQuelle(): string | undefined {
        return quelleText.get(this.zaehlung.quelle);
    }

    // done
    get getZaehlintervall(): string {
        return `${this.zaehlung.zaehlIntervall} min`;
    }

    // done
    get getWetter(): Array<KeyVal> {
        return wetterDropDown;
    }

    // done
    get getZaehlarten(): Array<KeyVal> {
        return zaehlartenDropDown;
    }

    // done
    get isZaehlungReadonly(): boolean {
        return !this.zaehlungStore.isZaehlungEditable;
    }

    // done
    get computedDateFormatted(): string | null {
        return this.formatDate(this.date);
    }

    // done
    private formatDateForBackend(): string {
        let time = new Date().toLocaleTimeString(navigator.language, {
            hour: "2-digit",
            minute: "2-digit",
        });
        return new Date(this.date + "T" + time).toISOString();
    }

    // done
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

    // done
    private resetDatum(): void {
        this.date = this.zaehlung.datum.substr(0, 10);
    }

    // done
    get isZaehlungInstructed(): boolean {
        return this.zaehlung.status === Status.INSTRUCTED;
    }

    // done
    get formattedDateAsText(): string {
        if (!this.zaehlung.datum) {
            return "";
        }
        const [year, month, day] = this.zaehlung.datum.split("-");
        return `${day}.${month}.${year}`;
    }

    // done
    get getZaehlart(): string | undefined {
        return zaehlartText.get(this.zaehlung.zaehlart);
    }

    // done
    get getActualDate(): string {
        return new Date().toISOString().substr(0, 10);
    }
}
</script>