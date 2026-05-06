<template>
  <v-app>
    <the-snackbar />

    <!--  clipped-right: Gibt an, auf welcher Seite der Navigation-Drawer eingeblendet werden soll und dort soll die Toolbar bleiben  -->
    <v-app-bar
      color="primary"
      height="50"
      class="px-4"
    >
      <v-row align="center">
        <v-col
          cols="3"
          class="d-flex align-center justify-start"
        >
          <router-link
            to="/"
            style="text-decoration: none"
          >
            <v-toolbar-title class="text-black font-weight-medium">
              <span class="font-weight-medium">DAVe</span>
              <span class="font-weight-thin"> | Selfserviceportal</span>
            </v-toolbar-title>
          </router-link>
        </v-col>
      </v-row>
      <v-spacer />
      <v-col
        cols="3"
        class="d-flex align-center justify-end"
      >
        <v-btn
          v-tooltip:bottom="'Anwenderhandbuch'"
          class="mr-3"
          density="compact"
          icon="mdi-clippy"
          @click="navigateToHandbuch"
        />
        <span> {{ loggedInUser }} </span>
      </v-col>
    </v-app-bar>

    <router-view
      v-slot="{ Component }"
      :key="route.fullPath"
    >
      <v-fade-transition mode="out-in">
        <component :is="Component" />
      </v-fade-transition>
    </router-view>
  </v-app>
</template>

<script setup lang="ts">
import type MapConfigDTO from "@/types/karte/MapConfigDTO";

import { ref } from "vue";
import { useRoute } from "vue-router";

import MapConfigService from "@/api/service/MapConfigService";
import SsoUserInfoService from "@/api/service/SsoUserInfoService";
import VersionInfoService from "@/api/service/VersionInfoService";
import TheSnackbar from "@/components/common/TheSnackbar.vue";
import SsoUserInfoResponse from "@/domain/SsoUserInfoResponse";
import VersionInfoResponse from "@/domain/VersionInfoResponse";
import { useMapConfigStore } from "@/store/MapConfigStore";
import { useSnackbarStore } from "@/store/SnackbarStore";
import { useUserStore } from "@/store/UserStore";

const URL_HANDBUCH_LINK = "";

const loggedInUser = ref<string>("no-security");

const backendVersion = ref<string>("");

const frontendVersion = ref<string>("");

const userStore = useUserStore();
const route = useRoute();
const snackbarStore = useSnackbarStore();
const mapConfigStore = useMapConfigStore();

created();

// Lifecycle hook
function created() {
  SsoUserInfoService.getUserInfo()
    .then((ssoUserInfoResponse: SsoUserInfoResponse) => {
      userStore.setSsoUserInfoResponse(ssoUserInfoResponse);
      loggedInUser.value = userStore.getName;
    })
    .catch((error) => {
      snackbarStore.showApiError(error);
      return false;
    });
  VersionInfoService.getFrontendInfo()
    .then((frontendInfoResponse: VersionInfoResponse) => {
      frontendVersion.value = frontendInfoResponse.application.version;
    })
    .catch(() => {
      frontendVersion.value = "error";
    });
  VersionInfoService.getBackendInfo()
    .then((backendInfoResponse: VersionInfoResponse) => {
      backendVersion.value = backendInfoResponse.application.version;
    })
    .catch(() => {
      backendVersion.value = "error";
    });
  MapConfigService.getMapConfig().then((res: MapConfigDTO) => {
    mapConfigStore.setMapConfig(res);
  });
}

function navigateToHandbuch() {
  window.open(URL_HANDBUCH_LINK);
}
</script>
<style>
/* Alle Hinweise werden nun rot eingefärbt */
.v-messages {
  color: #e57373 !important;
}

.dave-default {
  --app-bar-height: 50px;
  width: 100%;
  height: 100%;
  /* Um auf der Y-Achse direkt unter der App Bar zu liegen */
  padding-top: var(--app-bar-height);
  position: fixed;
}
</style>
