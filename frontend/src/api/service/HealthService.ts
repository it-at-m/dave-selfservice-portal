import {ApiError, Levels} from '@/api/error';
import HealthState from "@/domain/HealthState";
import BaseUrlProvider from "@/api/util/BaseUrlProvider";

export default class HealthService {

  private static readonly BASE: string = BaseUrlProvider.getBaseUrl();

  private static readonly ENDPOINT: string = "actuator/health";

  static checkHealth(): Promise<HealthState> {
    return fetch(`${this.BASE}/${this.ENDPOINT}`).then(response => {
      if (!response.ok) {
        throw new ApiError(Levels.WARNING, "Beim Laden der Daten vom API-Gateway ist ein Fehler aufgetreten.");
      }
      return response.json();
    }).catch(error => {
      throw new ApiError(Levels.ERROR, "Verbindung zum API-Gateway konnte nicht aufgebaut werden.", error);
    })
  }

}