import type {
  BackendIdDTO,
  ExternalZaehlungDTO,
  UpdateStatusDTO,
} from "@/api/client";
import type ZaehlungDTO from "@/types/zaehlung/ZaehlungDTO";

import { ZaehlungControllerApi } from "@/api/client";
import FetchService from "@/api/service/FetchService";
import createBackendApiConfiguration from "@/api/util/BackendApiConfiguration";
import { handleOpenApiError } from "@/api/util/OpenApiErrorHandler";

export default class ZaehlungService {
  private static readonly ENDPOINT: string = "api/dave-backend-service";
  private static readonly API = new ZaehlungControllerApi(
    createBackendApiConfiguration(this.ENDPOINT)
  );

  static saveExternalZaehlung(data: ExternalZaehlungDTO) {
    return handleOpenApiError(
      this.API.saveExternalZaehlung({
        externalZaehlungDTO: data,
      }).then((response) => response),
      "Beim Speichern der Zählung ist ein Fehler aufgetreten. Bitte Daten kontrollieren."
    );
  }

  static updateStatus(data: UpdateStatusDTO): Promise<BackendIdDTO> {
    return handleOpenApiError(
      this.API.updateStatus({
        updateStatusDTO: {
          zaehlungId: data.zaehlungId,
          status: data.status,
          dienstleisterkennung: data.dienstleisterkennung,
        },
      }).then((response) => response),
      "Beim Speichern der Zählung ist ein Fehler aufgetreten. Bitte Daten kontrollieren."
    );
  }

  static saveZaehlung(data: ZaehlungDTO): Promise<void> {
    return FetchService.postData(
      data,
      `${this.ENDPOINT}/zaehlung/saveExternal`,
      "Beim Speichern der Zählung ist ein Fehler aufgetreten. Bitte Daten kontrollieren."
    );
  }

  static getAllRelevantZaehlungen(): Promise<Array<ZaehlungDTO>> {
    return FetchService.getData(
      `${this.ENDPOINT}/zaehlung/getZaehlungenForExternal`,
      "Beim Laden der Zählung ist ein Fehler aufgetreten."
    );
  }
}
