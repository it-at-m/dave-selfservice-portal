import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import TheSnackbar from "@/components/common/TheSnackbar.vue";
import { useSnackbarStore } from "@/store/SnackbarStore";

describe("TheSnackbar.vue", () => {
  let vuetify: ReturnType<typeof createVuetify>;

  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    vuetify = createVuetify({
      components,
      directives,
    });
  });

  it("renders without errors", () => {
    const wrapper = mount(TheSnackbar, {
      global: {
        plugins: [createPinia(), vuetify],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  describe("formattedSnackbarTextPart2 – safe split", () => {
    it("returns an empty array when snackbarTextPart2 is undefined", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);

      const wrapper = mount(TheSnackbar, {
        global: {
          plugins: [pinia, vuetify],
        },
      });

      const snackbarStore = useSnackbarStore();
      // showError with only one part → textPart2 stays undefined
      snackbarStore.showError("Nur ein Teil");
      await vi.runAllTimersAsync();
      await wrapper.vm.$nextTick();

      // The v-for renders nothing when the array is empty; "undefined" must never appear
      expect(wrapper.html()).not.toContain("undefined");
    });

    it("renders a single line when snackbarTextPart2 has no newlines", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);

      const wrapper = mount(TheSnackbar, {
        global: {
          plugins: [pinia, vuetify],
        },
      });

      const snackbarStore = useSnackbarStore();
      snackbarStore.showError("Titel", "Einzeilige Fehlermeldung");
      await vi.runAllTimersAsync();
      await wrapper.vm.$nextTick();

      expect(wrapper.html()).toContain("Einzeilige Fehlermeldung");
    });

    it("renders multiple lines when snackbarTextPart2 contains newlines", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);

      const wrapper = mount(TheSnackbar, {
        global: {
          plugins: [pinia, vuetify],
        },
      });

      const snackbarStore = useSnackbarStore();
      snackbarStore.showError(
        "Mehrere Dateien enthalten die gleiche Knotenarmnummer:",
        "\n - datei1.csv: Knotenarmnummer 1\n\n - datei2.csv: Knotenarmnummer 1\n"
      );
      await vi.runAllTimersAsync();
      await wrapper.vm.$nextTick();

      expect(wrapper.html()).toContain("datei1.csv: Knotenarmnummer 1");
      expect(wrapper.html()).toContain("datei2.csv: Knotenarmnummer 1");
    });

    it("renders the title part in snackbarTextPart1", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);

      const wrapper = mount(TheSnackbar, {
        global: {
          plugins: [pinia, vuetify],
        },
      });

      const snackbarStore = useSnackbarStore();
      snackbarStore.showError("Fehlertitel", "Fehlerdetails");
      await vi.runAllTimersAsync();
      await wrapper.vm.$nextTick();

      expect(wrapper.html()).toContain("Fehlertitel");
      expect(wrapper.html()).toContain("Fehlerdetails");
    });
  });
});
