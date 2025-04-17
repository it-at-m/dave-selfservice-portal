import type UpdateStatusDTO from "@/domain/dto/UpdateStatusDTO";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import FetchService from "@/api/service/FetchService";

export default class ZaehlungService {
  private static readonly ENDPOINT: string =
    "api/dave-backend-service/zaehlung";

  static saveZaehlung(data: ZaehlungDTO): Promise<void> {
    return FetchService.postData(
      data,
      `${this.ENDPOINT}/saveExternal`,
      "Beim Speichern der Zählung ist ein Fehler aufgetreten. Bitte Daten kontrollieren."
    );
  }

  static getAllRelevantZaehlungen(): Promise<Array<ZaehlungDTO>> {
    return FetchService.getData(
      `${this.ENDPOINT}/getZaehlungenForExternal`,
      "Beim Laden der Zählung ist ein Fehler aufgetreten."
    );
  }

  static updateStatus(data: UpdateStatusDTO): Promise<void> {
    return FetchService.postData(
      data,
      `${this.ENDPOINT}/updateStatus`,
      "Beim Speichern der Zählung ist ein Fehler aufgetreten. Bitte Daten kontrollieren."
    );
  }
}
