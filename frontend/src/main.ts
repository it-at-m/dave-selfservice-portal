import Vue, { VNode } from "vue";
import Vuetify from "./plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import moment from "moment";
import store from "./store";

Vue.config.productionTip = false;

moment.locale(window.navigator.language);

new Vue({
    router,
    store: store,
    vuetify: Vuetify,
    render: (h): VNode => h(App),
}).$mount("#app");
