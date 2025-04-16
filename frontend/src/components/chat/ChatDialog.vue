<template>
  <v-dialog
    v-model="showDialogModel"
    persistent
    max-width="50%"
    height="600px"
  >
    <v-card
      width="100%"
      variant="flat"
      rounded
      class="bg-grey-lighten-4"
    >
      <v-card-title class="bg-primary">
        <v-row
          no-gutters
          dense
        >
          <span class="text-white">{{ dialogtitle }}</span>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            class="text-white"
            @click="closeDialog"
          />
        </v-row>
      </v-card-title>

      <v-card-text class="overflow-y-auto">
        <v-container class="fill-height">
          <v-row
            class="fill-height pb-14"
            align="end"
          >
            <v-col>
              <div
                v-for="(item, index) in items"
                :key="index"
                :class="[
                  'd-flex flex-row align-center my-2',
                  item.participantId === MOBILITAETSREFERAT_ID
                    ? 'justify-end'
                    : null,
                ]"
              >
                <v-list-item
                  v-if="item.participantId === MOBILITAETSREFERAT_ID"
                  rounded
                  variant="elevated"
                  density="compact"
                  class="mr-2"
                  width="30%"
                >
                  <template #title>
                    <span style="font-size: medium; font-weight: bold">{{
                      getTitle(item)
                    }}</span>
                  </template>
                  <template #subtitle>
                    <span class="text-black">{{ item.content }}</span>
                  </template>
                  <template #default>
                    <v-row
                      dense
                      no-gutters
                      justify="end"
                      class="mt-2"
                    >
                      <span
                        class="text-grey"
                        style="font-size: smaller"
                      >
                        {{ getMessageTime(item) }}
                      </span>
                    </v-row>
                  </template>
                </v-list-item>
                <v-avatar
                  :image="
                    item.participantId === MOBILITAETSREFERAT_ID
                      ? kindlUrl
                      : accountTieUrl
                  "
                  size="36"
                />
                <v-list-item
                  v-if="item.participantId === DIENSTLEISTER_ID"
                  rounded
                  variant="elevated"
                  class="ml-2"
                  width="30%"
                >
                  <template #title>
                    <span style="font-size: medium; font-weight: bold">{{
                      getTitle(item)
                    }}</span>
                  </template>
                  <template #subtitle>
                    <span class="text-black">{{ item.content }}</span>
                  </template>
                  <template #default>
                    <v-row
                      dense
                      no-gutters
                      justify="end"
                      class="mt-2"
                    >
                      <span
                        class="text-grey"
                        style="font-size: smaller"
                      >
                        {{ getMessageTime(item) }}
                      </span>
                    </v-row>
                  </template>
                </v-list-item>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions style="background-color: white">
        <v-text-field
          v-model="message"
          placeholder="Nachricht..."
          variant="plain"
          class="mx-2"
          @keyup.enter="sendMessage"
        >
          <template #append-inner>
            <v-btn
              icon="mdi-send"
              variant="text"
              color="secondary"
              @click="sendMessage"
            />
          </template>
        </v-text-field>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type ChatMessageDTO from "@/types/chat/ChatMessageDTO";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { computed, ref, watch } from "vue";

import ChatMessageService from "@/api/service/ChatMessageService";
import accountTieUrl from "@/assets/account-tie.png";
import kindlUrl from "@/assets/kindl.jpg";
import { useChatStore } from "@/store/ChatStore";
import { useSnackbarStore } from "@/store/SnackbarStore";
import { useDateUtils } from "@/util/DateUtils";

interface Props {
  showDialog: boolean;
}
const props = defineProps<Props>();

const zaehlung = defineModel<ZaehlungDTO>({
  required: true,
});

const emits = defineEmits<{
  (e: "closeDialog"): void;
}>();

const DIENSTLEISTER_ID = 1;
const MOBILITAETSREFERAT_ID = 2;

const items = ref<Array<ChatMessageDTO>>([]);
const message = ref("");
const snackbarStore = useSnackbarStore();
const chatStore = useChatStore();
const dateUtils = useDateUtils();

watch(
  () => props.showDialog,
  () => {
    loadMessages();
  }
);

const showDialogModel = computed(() => {
  return props.showDialog;
});

const dialogtitle = computed(() => {
  return `${zaehlung.value.projektName} - ${dateUtils.getShortVersionOfDate(zaehlung.value.datum)}`;
});

function getTitle(item: ChatMessageDTO) {
  return item.participantId === DIENSTLEISTER_ID
    ? "Dienstleister"
    : "Mobilitätsreferat";
}
function getMessageTime(item: ChatMessageDTO) {
  return dateUtils.getShortVersionOfDateWithTime(item.timestamp);
}

function loadMessages() {
  if (props.showDialog) {
    items.value = [];
    ChatMessageService.getAllByZaehlungId(zaehlung.value.id)
      .then((messageDTOs) => {
        items.value = messageDTOs;
      })
      .catch((error) => snackbarStore.showApiError(error));

    ChatMessageService.updateUnreadMessages(
      zaehlung.value.id,
      MOBILITAETSREFERAT_ID
    )
      .then(() => {
        chatStore.resetNotificationsEventSwitch();
      })
      .catch((error) => snackbarStore.showApiError(error));
  } else {
    items.value = [];
  }
}

function sendMessage() {
  const messageDTO: ChatMessageDTO = {} as ChatMessageDTO;
  //Timestamp wird erst im Backend gesetzt (Zeitverzug ist unbedeutend)
  messageDTO.content = message.value;
  messageDTO.zaehlungId = zaehlung.value.id;
  messageDTO.participantId = MOBILITAETSREFERAT_ID;
  messageDTO.type = "text";
  messageDTO.uploaded = true;
  messageDTO.viewed = false;

  ChatMessageService.save(messageDTO)
    .then((response) => {
      response.uploaded = true;
      items.value.push(response);
      message.value = "";
    })
    .catch((error) => snackbarStore.showApiError(error));
}

function closeDialog(): void {
  emits("closeDialog");
}
</script>
