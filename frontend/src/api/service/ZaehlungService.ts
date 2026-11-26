import type {
  BackendIdDTO,
  ExternalZaehlungDTO,
  UpdateStatusDTO,
} from "@/api/client";

import { ZaehlungControllerApi } from "@/api/client";
import createBackendApiConfiguration from "@/api/util/BackendApiConfiguration";
import BaseUrlProvider from "@/api/util/BaseUrlProvider";
import { handleOpenApiError } from "@/api/util/OpenApiErrorHandler";

export default class ZaehlungService {
  private static readonly ENDPOINT = `${BaseUrlProvider.getBaseUrl()}/api/dave-backend-service`;
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

  static updateStatus(updateStatusDto: UpdateStatusDTO): Promise<BackendIdDTO> {
    return handleOpenApiError(
      this.API.updateStatus({
        updateStatusDTO: updateStatusDto,
      }).then((response) => response),
      "Beim Speichern der Zählung ist ein Fehler aufgetreten. Bitte Daten kontrollieren."
    );
  }

  static getAllRelevantZaehlungen(): Promise<Array<ExternalZaehlungDTO>> {
    return handleOpenApiError(
      this.API.getZaehlungenForExternal(),
      "Beim Laden der Zählung ist ein Fehler aufgetreten."
    );
  }
}
