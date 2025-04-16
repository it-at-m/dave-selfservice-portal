<template>
    <v-container
        fluid
        class="pa-0"
    >
        <v-row dense>
            <v-col
                v-for="card in zaehlungCards"
                :key="card.zaehlung.id"
                :cols="card.flex"
            >
                <zaehlung-card
                    :zaehlung="card.zaehlung"
                    @openZaehlungDialog="openZaehlungDialog"
                    @openChatDialog="openChatDialog"
                    @saved="reloadDataAndCloseDialog"
                />
            </v-col>
            <v-banner
                v-if="hasNoZaehlung"
                single-line
                width="100%"
            >
                <v-icon
                    slot="icon"
                    color="error"
                    size="36"
                >
                    mdi-alert-decagram-outline
                </v-icon>
                Es liegen aktuell keine Zählungen zur Bearbeitung vor.
            </v-banner>
        </v-row>

        <zaehlung-dialog
            :show-dialog="showZaehlungDialog"
            @saved="reloadDataAndCloseDialog"
            @cancel="cancelZaehlungDialog"
        />
    </v-container>
</template>

<script setup lang="ts">
import ZaehlungService from "@/api/service/ZaehlungService";
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import ZaehlungCardObject from "@/domain/ZaehlungCardObject";
import ZaehlungCardObjectComparator from "@/util/ZaehlungCardObjectComparator";
import { Levels } from "@/api/error";
import SavedDTO from "@/domain/dto/SavedDTO";
import { isEmpty } from "lodash";
import { useSnackbarStore } from "@/store/SnackbarStore";
import { computed, onMounted, ref } from "vue";

const zaehlungCards = ref<Array<ZaehlungCardObject>>([]);

const showZaehlungDialog = ref<boolean>(false);

const showChatDialog = ref<boolean>(false);

const snackbarStore = useSnackbarStore();

onMounted(() => {
    window.scrollTo(0, 0);
    loadZaehlungen();
});

const hasNoZaehlung = computed<boolean>(() => isEmpty(zaehlungCards.value));

function loadZaehlungen(): void {
    zaehlungCards.value = [];
    ZaehlungService.getAllRelevantZaehlungen()
        .then((zaehlungen: Array<ZaehlungDTO>) => {
            zaehlungen.forEach((zaehlung: ZaehlungDTO) => {
                zaehlungCards.value.push({ flex: 3, zaehlung: zaehlung });
            });
            zaehlungCards.value.sort(
                ZaehlungCardObjectComparator.sortByDatumDesc
            );
        })
        .catch((error) => snackbarStore.showApiError(error));
}

function reloadDataAndCloseDialog(savedDTO: SavedDTO): void {
    loadZaehlungen();
    showZaehlungDialog.value = false;
    snackbarStore.showToast(Levels.INFO, savedDTO.response);
}

function cancelZaehlungDialog(): void {
    showZaehlungDialog.value = false;
}

function openZaehlungDialog(): void {
    showZaehlungDialog.value = true;
}

function openChatDialog(): void {
    showChatDialog.value = true;
}

function closeChatDialog(): void {
    showChatDialog.value = false;
}
</script>
