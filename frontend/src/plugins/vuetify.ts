import "@mdi/font/css/materialdesignicons.css";

import { createVuetify } from "vuetify";
import colors from "vuetify/util/colors";

import "@fontsource/roboto";
import "vuetify/styles";

import { mdi, aliases as mdiAliases } from "vuetify/iconsets/mdi";
import { de } from "vuetify/locale";

// Zaehlart
import artH from "@/components/icons/ArtIcons/ArtH.vue";
import artN from "@/components/icons/ArtIcons/ArtN.vue";
import artQ from "@/components/icons/ArtIcons/ArtQ.vue";
import artQB from "@/components/icons/ArtIcons/ArtQB.vue";
import artQH from "@/components/icons/ArtIcons/ArtQH.vue";
import artQI from "@/components/icons/ArtIcons/ArtQI.vue";
import artQR from "@/components/icons/ArtIcons/ArtQR.vue";
import artQS from "@/components/icons/ArtIcons/ArtQS.vue";
import artQSt from "@/components/icons/ArtIcons/ArtQSt.vue";
import artQT from "@/components/icons/ArtIcons/ArtQT.vue";
import artR from "@/components/icons/ArtIcons/ArtR.vue";
import artT from "@/components/icons/ArtIcons/ArtT.vue";
import artTK from "@/components/icons/ArtIcons/ArtTK.vue";
// Zaehldauer
import zaehldauer2x4h from "@/components/icons/ZaehldauerIcons/Zaehldauer2x4hIcon.vue";
import zaehldauer13h from "@/components/icons/ZaehldauerIcons/Zaehldauer13hIcon.vue";
import zaehldauer16h from "@/components/icons/ZaehldauerIcons/Zaehldauer16hIcon.vue";
import zaehldauer24h from "@/components/icons/ZaehldauerIcons/Zaehldauer24hIcon.vue";
import zaehldauerSoZ from "@/components/icons/ZaehldauerIcons/ZaehldauerSoZIcon.vue";

const theme = {
  themes: {
    light: {
      colors: {
        primary: colors.yellow.darken1,
        secondary: colors.orange.darken2,
        accent: colors.blue.darken4,
        success: colors.green.lighten2,
        error: colors.red.lighten2,
      },
    },
  },
};

export default createVuetify({
  theme: theme,
  icons: {
    defaultSet: "mdi",
    sets: {
      mdi,
    },
    aliases: {
      ...mdiAliases,
      // Zaehldauer
      zaehldauer2x4h,
      zaehldauer24h,
      zaehldauer16h,
      zaehldauer13h,
      zaehldauerSoZ,
      // Zaehlart
      artN,
      artH,
      artQ,
      artQB,
      artQH,
      artQI,
      artQR,
      artQS,
      artQSt,
      artQT,
      artR,
      artT,
      artTK,
    },
  },
  locale: {
    locale: "de",
    messages: { de },
  },
  defaults: {
    VSelect: {
      itemColor: "primary",
    },
    VBtn: {
      class: "text-none",
      variant: "elevated",
      density: "compact",
    },
    VTextarea: {
      density: "compact",
      variant: "outlined",
    },
    VTextField: {
      density: "compact",
      variant: "outlined",
    },
    VAutocomplete: {
      density: "compact",
      variant: "outlined",
    },
    VCheckbox: {
      density: "compact",
    },
  },
});
