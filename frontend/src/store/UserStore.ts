import type SsoUserInfoResponse from "@/domain/SsoUserInfoResponse";

import { defineStore } from "pinia";
import { computed, ref } from "vue";

const rolePoweruser = "ROLE_POWERUSER";

/**
 * Der UserStore wird benötigt, um die vom KeyCloak erhaltenen Nutzerdaten (Name, eMail und Authorities)
 * über alle Views hinweg verteilen zu können. Dies betrifft vor allem die Authorities, da einzelnen Elemente
 * der Oberfläche nur für bestimmte Rollen sichtbar sein sollen.
 */
export const useUserStore = defineStore("userStore", () => {
  const ssoUserInfoResponse = ref<SsoUserInfoResponse>(
    {} as SsoUserInfoResponse
  );

  const possibleRoles = ref<Array<string>>([rolePoweruser]);

  const getName = computed(() => ssoUserInfoResponse.value.name);

  const isPoweruser = computed(() =>
    ssoUserInfoResponse.value.authorities?.includes(rolePoweruser)
  );

  // function()s become actions
  function setSsoUserInfoResponse(payload: SsoUserInfoResponse) {
    ssoUserInfoResponse.value = payload;
  }

  return {
    possibleRoles,
    getName,
    isPoweruser,
    setSsoUserInfoResponse,
  };
});
