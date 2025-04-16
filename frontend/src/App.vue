<template>
    <v-app>
        <TheSnackbar />

        <!--  clipped-right: Gibt an, auf welcher Seite der Navigation-Drawer eingeblendet werden soll und dort soll die Toolbar bleiben  -->
        <v-app-bar
            class="black--text"
            app
            clipped-right
            color="primary"
            dark
        >
            <router-link to="/">
                <v-toolbar-title class="black--text">
                    <span class="font-weight-medium">DAVe</span>
                    <span class="font-weight-thin"> | Selfserviceportal</span>
                </v-toolbar-title>
            </router-link>
            <v-spacer></v-spacer>
            <v-spacer></v-spacer>
            <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                    <v-btn
                        v-bind="attrs"
                        class="ml-2"
                        icon
                        color="black"
                        v-on="on"
                        @click="navigateToHandbuch"
                    >
                        <v-icon>mdi-clippy</v-icon>
                    </v-btn>
                </template>
                <span> Anwenderhandbuch </span>
            </v-tooltip>
            <span> {{ loggedInUser }} </span>
        </v-app-bar>
        <v-main>
            <v-fade-transition mode="out-in">
                <!--    Damit Seite auch bei ID Aenderung reloadet wird muss der :key angegeben werden -->
                <router-view :key="$route.fullPath"></router-view>
            </v-fade-transition>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import TheSnackbar from "@/components/common/TheSnackbar.vue";
import SsoUserInfoService from "@/api/service/SsoUserInfoService";
import VersionInfoService from "@/api/service/VersionInfoService";
import SsoUserInfoResponse from "@/domain/SsoUserInfoResponse";
import VersionInfoResponse from "@/domain/VersionInfoResponse";
import { useUserStore } from "@/store/UserStore";
import { ref } from "vue";

const URL_HANDBUCH_LINK = "";

const loggedInUser = ref<string>("no-security");

const backendVersion = ref<string>("");

const frontendVersion = ref<string>("");

const userStore = useUserStore();

created();

// Lifecycle hook
function created() {
    SsoUserInfoService.getUserInfo().then(
        (ssoUserInfoResponse: SsoUserInfoResponse) => {
            userStore.setSsoUserInfoResponse(ssoUserInfoResponse);
            loggedInUser.value = userStore.getName;
        }
    );
    getFrontendVersion().then((version: string) => {
        frontendVersion.value = version;
    });

    getBackendVersion().then((version: string) => {
        backendVersion.value = version;
    });
}

async function getFrontendVersion(): Promise<string> {
    return await VersionInfoService.getFrontendInfo()
        .then((frontendInfoResponse: VersionInfoResponse) => {
            return frontendInfoResponse.application.version;
        })
        .catch(() => {
            return "error";
        });
}

async function getBackendVersion(): Promise<string> {
    return await VersionInfoService.getBackendInfo()
        .then((backendInfoResponse: VersionInfoResponse) => {
            return backendInfoResponse.application.version;
        })
        .catch(() => {
            return "error";
        });
}

function navigateToHandbuch() {
    window.open(URL_HANDBUCH_LINK);
}
</script>
