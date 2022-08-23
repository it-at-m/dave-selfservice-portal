import {ApiError, Levels} from '@/api/error';
import BaseUrlProvider from "@/api/util/BaseUrlProvider";
import SsoUserInfoResponse from "@/domain/SsoUserInfoResponse";
import FetchUtils from "@/api/util/FetchUtils";

export default class SsoUserInfoService {

  private static readonly BASE: string = BaseUrlProvider.getBaseUrl();

  private static readonly ENDPOINT: string = "api/sso/userinfo";

  static getUserInfo(): Promise<SsoUserInfoResponse> {
    return fetch(`${this.BASE}/${this.ENDPOINT}`, FetchUtils.getGETConfig())
        .then(response => {
          if (!response.ok) {
            return new SsoUserInfoResponse("no_authority", "no_authority", []);
          }
          return response.json();
        }).catch(error => {
          throw new ApiError(Levels.ERROR, "Verbindung zum API-Gateway oder SSO-Dienst konnte nicht aufgebaut werden.", error);
        });
  }

}
