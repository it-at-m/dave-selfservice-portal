import Vue, { VNode } from "vue";
import Vuetify from "./plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import moment from "moment";
import "./directives/infinitescroll";
import "./plugins/leafletmaps";
import i18n from "./i18n";
import "./registerServiceWorker";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import { createPinia, PiniaVuePlugin } from "pinia";

Vue.config.productionTip = false;

Vue.use(PiniaVuePlugin);
const pinia = createPinia();

moment.locale(window.navigator.language);

new Vue({
    router,
    pinia,
    vuetify: Vuetify,
    i18n,
    render: (h): VNode => h(App),
}).$mount("#app");
