<template>
    <v-container
        fluid
        class="pa-0"
    >
        <v-row dense>
            <v-col
                v-for="card in getZaehlungenForCards"
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
        ></zaehlung-dialog>

        <chat-dialog
            :show-dialog="showChatDialog"
            @closeDialog="closeChatDialog"
        ></chat-dialog>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ZaehlungService from "@/api/service/ZaehlungService";

/* eslint-disable no-unused-vars */
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import ZaehlungCardObject from "@/domain/ZaehlungCardObject";
import ZaehlungCardObjectComparator from "@/util/ZaehlungCardObjectComparator";
import ZaehlungDialog from "@/components/zaehlung/ZaehlungDialog.vue";
import ZaehlungCard from "@/components/zaehlung/ZaehlungCard.vue";
import { Levels } from "@/api/error";
import SavedDTO from "@/domain/dto/SavedDTO";
import ChatDialog from "@/components/chat/ChatDialog.vue";

/* eslint-enable no-unused-vars */
@Component({
    components: {
        ZaehlungCard,
        ZaehlungDialog,
        ChatDialog,
    },
})
export default class App extends Vue {
    private zaehlungCards: Array<ZaehlungCardObject> = [];
    showZaehlungDialog = false;
    showChatDialog = false;

    mounted() {
        window.scrollTo(0, 0);
        this.loadZaehlungen();
    }

    private loadZaehlungen(): void {
        this.zaehlungCards = [];
        ZaehlungService.getAllRelevantZaehlungen()
            .then((zaehlungen: Array<ZaehlungDTO>) => {
                zaehlungen.forEach((zaehlung: ZaehlungDTO) => {
                    this.zaehlungCards.push({ flex: 3, zaehlung: zaehlung });
                });
                this.zaehlungCards.sort(
                    ZaehlungCardObjectComparator.sortByDatumDesc
                );
            })
            .catch((error) =>
                this.$store.dispatch("snackbar/showError", error)
            );
    }

    get getZaehlungenForCards(): Array<ZaehlungCardObject> {
        return this.zaehlungCards;
    }

    get hasNoZaehlung(): boolean {
        return this.zaehlungCards.length === 0;
    }

    reloadDataAndCloseDialog(savedDTO: SavedDTO) {
        this.loadZaehlungen();
        this.showZaehlungDialog = false;
        this.$store.dispatch("snackbar/showToast", {
            level: Levels.INFO,
            snackbarTextPart1: savedDTO.response,
        });
    }

    cancelZaehlungDialog() {
        this.showZaehlungDialog = false;
    }

    openZaehlungDialog() {
        this.showZaehlungDialog = true;
    }

    openChatDialog() {
        this.showChatDialog = true;
    }

    closeChatDialog() {
        this.showChatDialog = false;
    }
}
</script>