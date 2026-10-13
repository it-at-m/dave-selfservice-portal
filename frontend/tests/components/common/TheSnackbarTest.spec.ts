import { shallowMount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import TheSnackbar from "@/components/common/TheSnackbar.vue";

const pinia = createPinia();

describe("TheSnackbar.vue", () => {
  let vuetify: ReturnType<typeof createVuetify>;

  beforeAll(() => {
    createPinia();
    createVuetify();
  });

  beforeEach(() => {
    vuetify = createVuetify({
      components,
      directives,
    });
  });

  it("renders props.message when passed", () => {
    const message = "Hello_World";
    const wrapper = shallowMount(TheSnackbar, {
      global: {
        plugins: [pinia, vuetify],
      },
      props: { message: message },
    });

    expect(wrapper.html()).toContain(message);
  });

  describe("formattedSnackbarTextPart2 split logic", () => {
    function createWrapper() {
      return shallowMount(TheSnackbar, {
        global: {
          plugins: [pinia, vuetify],
        },
      });
    }

    it("splits LF-only newlines into separate lines", () => {
      const wrapper = createWrapper();

      const vm: any = wrapper.vm;
      vm.snackbarTextPart2 = "line1\nline2\nline3";

      expect(vm.formattedSnackbarTextPart2).toEqual([
        "line1",
        "line2",
        "line3",
      ]);
    });

    it("splits CRLF newlines without leaving trailing \\r characters", () => {
      const wrapper = createWrapper();

      const vm: any = wrapper.vm;
      vm.snackbarTextPart2 = "line1\r\nline2\r\nline3";

      expect(vm.formattedSnackbarTextPart2).toEqual([
        "line1",
        "line2",
        "line3",
      ]);
      vm.formattedSnackbarTextPart2.forEach((line: string) =>
        expect(line).not.toContain("\r")
      );
    });

    it("returns an empty array for undefined input", () => {
      const wrapper = createWrapper();

      const vm: any = wrapper.vm;
      vm.snackbarTextPart2 = undefined;

      expect(vm.formattedSnackbarTextPart2).toEqual([]);
    });

    it("returns an empty array for an empty string", () => {
      const wrapper = createWrapper();

      const vm: any = wrapper.vm;
      vm.snackbarTextPart2 = "";

      expect(vm.formattedSnackbarTextPart2).toEqual([]);
    });

    it("handles a single line (no newline) as a one-element array", () => {
      const wrapper = createWrapper();

      const vm: any = wrapper.vm;
      vm.snackbarTextPart2 = "only one line";

      expect(vm.formattedSnackbarTextPart2).toEqual(["only one line"]);
    });
  });
});
