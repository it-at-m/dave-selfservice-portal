import { createRouter, createWebHashHistory } from "vue-router";

import HomeView from "@/views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  { path: "/:catchAll(.*)*", redirect: "/" }, // CatchAll route
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  /* eslint-disable  @typescript-eslint/no-unused-vars */
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, left: 0 };
  },
  routes,
});

export default router;
