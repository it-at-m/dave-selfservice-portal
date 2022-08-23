import FetchService from "@/api/service/FetchService";
import ZaehlungDTO from "@/domain/dto/ZaehlungDTO";
import SavedDTO from "@/domain/dto/SavedDTO";
import UpdateStatusDTO from "@/domain/dto/UpdateStatusDTO";

export default class ZaehlungService {

  private static readonly ENDPOINT: string = "api/dave-backend-service/zaehlung";

  static saveZaehlung(data: ZaehlungDTO): Promise<SavedDTO> {
    return FetchService.postData(data, `${this.ENDPOINT}/saveExternal`, "Beim Speichern der Zählung ist ein Fehler aufgetreten. Bitte Daten kontrollieren.");
  }

  static getAllRelevantZaehlungen(): Promise<Array<ZaehlungDTO>> {
    return FetchService.getData(`${this.ENDPOINT}/getZaehlungenForExternal`, "Beim Laden der Zählung ist ein Fehler aufgetreten.");
  }

  static updateStatus(data: UpdateStatusDTO): Promise<SavedDTO> {
    return FetchService.postData(data, `${this.ENDPOINT}/updateStatus`, "Beim Speichern der Zählung ist ein Fehler aufgetreten. Bitte Daten kontrollieren.");
  }

}
