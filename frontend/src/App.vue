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

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
// Komponenten
import TheSnackbar from "@/components/common/TheSnackbar.vue";

// API
import SsoUserInfoService from "@/api/service/SsoUserInfoService";
import VersionInfoService from "@/api/service/VersionInfoService";

/* eslint-disable no-unused-vars */
import SsoUserInfoResponse from "@/domain/SsoUserInfoResponse";
import VersionInfoResponse from "@/domain/VersionInfoResponse";
/* eslint-enable no-unused-vars */

@Component({
    components: { TheSnackbar },
})
export default class App extends Vue {
    private static readonly URL_HANDBUCH_LINK: string = "";

    private loggedInUser = "no-security";

    // Versionen
    private backendVersion = "";

    private frontendVersion = "";

    // Lifecycle hook
    created() {
        SsoUserInfoService.getUserInfo()
            .then((ssoUserInfoResponse: SsoUserInfoResponse) => {
                this.$store.dispatch(
                    "user/setSsoUserInfoResponse",
                    ssoUserInfoResponse
                );
                this.loggedInUser = this.$store.getters["user/getName"];
            })
            .catch(() => {
                return false;
            });
        this.getFrontendVersion().then((version: string) => {
            console.info("Frontend Version: ", version);
            this.frontendVersion = version;
        });

        this.getBackendVersion().then((version: string) => {
            console.info("Backend Version: ", version);
            this.backendVersion = version;
        });
    }

    private async getFrontendVersion(): Promise<string> {
        return await VersionInfoService.getFrontendInfo()
            .then((frontendInfoResponse: VersionInfoResponse) => {
                return frontendInfoResponse.application.version;
            })
            .catch(() => {
                return "error";
            });
    }

    private async getBackendVersion(): Promise<string> {
        return await VersionInfoService.getBackendInfo()
            .then((backendInfoResponse: VersionInfoResponse) => {
                return backendInfoResponse.application.version;
            })
            .catch(() => {
                return "error";
            });
    }

    private navigateToHandbuch() {
        window.open(App.URL_HANDBUCH_LINK);
    }
}
</script>
