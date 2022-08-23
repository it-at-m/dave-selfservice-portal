import '@mdi/font/css/materialdesignicons.css'
import Vue from 'vue';
import Vuetify, {colors} from 'vuetify/lib';

// Zaehldauer
import Zaehldauer2x4h from "@/components/icons/ZaehldauerIcons/Zaehldauer2x4h.vue"
import Zaehldauer24h from "@/components/icons/ZaehldauerIcons/Zaehldauer24h.vue"
import Zaehldauer16h from "@/components/icons/ZaehldauerIcons/Zaehldauer16h.vue"
import Zaehldauer13h from "@/components/icons/ZaehldauerIcons/Zaehldauer13h.vue"
import ZaehldauerSoZ from "@/components/icons/ZaehldauerIcons/ZaehldauerSoZ.vue"

// Zaehlart
import ArtN from "@/components/icons/ArtIcons/ArtN.vue"
import ArtH from "@/components/icons/ArtIcons/ArtH.vue"
import ArtQ from "@/components/icons/ArtIcons/ArtQ.vue"
import ArtQB from "@/components/icons/ArtIcons/ArtQB.vue"
import ArtQH from "@/components/icons/ArtIcons/ArtQH.vue"
import ArtQI from "@/components/icons/ArtIcons/ArtQI.vue"
import ArtQR from "@/components/icons/ArtIcons/ArtQR.vue"
import ArtQS from "@/components/icons/ArtIcons/ArtQS.vue"
import ArtQSt from "@/components/icons/ArtIcons/ArtQSt.vue"
import ArtQT from "@/components/icons/ArtIcons/ArtQT.vue"
import ArtR from "@/components/icons/ArtIcons/ArtR.vue"
import ArtT from "@/components/icons/ArtIcons/ArtT.vue"
import ArtTK from "@/components/icons/ArtIcons/ArtTK.vue"

Vue.use(Vuetify);

const theme = {
  themes: {
    light: {
      primary: colors.yellow.darken1,
      secondary: colors.orange.darken2,
      accent: colors.blue.darken4,
      success: colors.green.lighten2,
      error: colors.red.lighten2,
    },
  }
};

export default new Vuetify({
  theme: theme,
  icons: {
    values: {
      // Zaehlart
      artN: {
        component: ArtN
      },
      artH: {
        component: ArtH
      },
      artQ: {
        component: ArtQ
      },
      artQB: {
        component: ArtQB
      },
      artQH: {
        component: ArtQH
      },
      artQI: {
        component: ArtQI
      },
      artQR: {
        component: ArtQR
      },
      artQS: {
        component: ArtQS
      },
      artQSt: {
        component: ArtQSt
      },
      artQT: {
        component: ArtQT
      },
      artR: {
        component: ArtR
      },
      artT: {
        component: ArtT
      },
      artTK: {
        component: ArtTK
      },
      // Zaehldauer
      zaehldauer2x4h: {
        component: Zaehldauer2x4h
      },
      zaehldauer24h: {
        component: Zaehldauer24h
      },
      zaehldauer16h: {
        component: Zaehldauer16h
      },
      zaehldauer13h: {
        component: Zaehldauer13h
      },
      zaehldauerSoZ: {
        component: ZaehldauerSoZ
      }
    }
  }
});