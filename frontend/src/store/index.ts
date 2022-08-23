import Vue from 'vue';
import Vuex from 'vuex';
import user from './modules/user';
import snackbar from './modules/snackbar';
import eventbus from "@/store/modules/eventbus";
import search from "@/store/modules/search";
import zaehlung from "@/store/modules/zaehlung";

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    user,
    snackbar,
    eventbus,
    search,
    zaehlung,
  },
  strict: debug
});