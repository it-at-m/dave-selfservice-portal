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

<script setup lang="ts">
import Fahrzeug from "@/domain/enums/Fahrzeug";
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import { useZaehlungStore } from "@/store/ZaehlungStore";
import { useEventbusStore } from "@/store/EventbusStore";
import { computed, onMounted, ref, watch } from "vue";

interface Props {
    height?: string;
}

defineProps<Props>();

const zaehlungStore = useZaehlungStore();

const eventbusStore = useEventbusStore();

const pkw = ref<boolean>(false);
const lkw = ref<boolean>(false);
const lz = ref<boolean>(false);
const bus = ref<boolean>(false);
const krad = ref<boolean>(false);
const rad = ref<boolean>(false);
const fuss = ref<boolean>(false);

const resetFormEvent = computed<boolean>(() => {
    return eventbusStore.getResetFormEvent;
});

onMounted(() => {
    resetForm();
});

watch(
    resetFormEvent,
    () => {
        resetForm();
    },
    { immediate: true }
);

function resetForm() {
    const zaehlung: ZaehlungDTO = zaehlungStore.getZaehlung;
    pkw.value = zaehlung.kategorien.includes(Fahrzeug.PKW);
    lkw.value = zaehlung.kategorien.includes(Fahrzeug.LKW);
    lz.value = zaehlung.kategorien.includes(Fahrzeug.LZ);
    bus.value = zaehlung.kategorien.includes(Fahrzeug.BUS);
    krad.value = zaehlung.kategorien.includes(Fahrzeug.KRAD);
    rad.value = zaehlung.kategorien.includes(Fahrzeug.RAD);
    fuss.value = zaehlung.kategorien.includes(Fahrzeug.FUSS);
}
</script>
