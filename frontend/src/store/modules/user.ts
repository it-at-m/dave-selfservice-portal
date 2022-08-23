import SsoUserInfoResponse from "@/domain/SsoUserInfoResponse";

const rolePoweruser: string = "ROLE_POWERUSER";

/**
 * Der UserStore wird benötigt, um die vom KeyCloak erhaltenen Nutzerdaten (Name, eMail und Authorities)
 * über alle Views hinweg verteilen zu können. Dies betrifft vor allem die Authorities, da einzelnen Elemente
 * der Oberfläche nur für bestimmte Rollen sichtbar sein sollen.
 */
export default {
  namespaced: true,
  state: {
    ssoUserInfoResponse: {} as SsoUserInfoResponse,
  },
  getters: {
    getName(state: any): string {
      return state.ssoUserInfoResponse.name;
    },
    isPoweruser(state: any): boolean {
      return state.ssoUserInfoResponse.authorities.includes(rolePoweruser);
    },
    possibleRoles(): Array<String> {
      return [rolePoweruser];
    }
  },
  mutations: {
    setSsoUserInfoResponse(state: any, payload: SsoUserInfoResponse) {
      state.ssoUserInfoResponse = payload;
    },
  },
  actions: {
    setSsoUserInfoResponse(context: any, payload: SsoUserInfoResponse) {
      context.commit('setSsoUserInfoResponse', payload)
    },
  }
}