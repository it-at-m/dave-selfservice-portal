import FetchService from "@/api/service/FetchService";
import ChatMessageDTO from "@/domain/dto/ChatMessageDTO";

export default class ChatMessageService {
    private static readonly ENDPOINT: string =
        "api/dave-backend-service/chat-message";

    static save(data: ChatMessageDTO): Promise<ChatMessageDTO> {
        return FetchService.postData(
            data,
            `${this.ENDPOINT}/save`,
            "Beim Speichern der ChatMessage ist ein Fehler aufgetreten. Bitte Daten kontrollieren."
        );
    }

    static getAllByZaehlungId(id: string): Promise<ChatMessageDTO[]> {
        return FetchService.getData(
            `${this.ENDPOINT}/allChatMessagesByZaehlungId?zaehlungId=${id}`,
            "Beim Holen der ChatMessages ist ein Fehler aufgetreten."
        );
    }

    static updateUnreadMessages(zaehlungId: string, participantId: number) {
        return FetchService.getData(
            `${this.ENDPOINT}/updateUnreadMessages?zaehlungId=${zaehlungId}&callingParticipantId=${participantId}`,
            "Beim Updaten des ViewStatus der Chat Messages ist ein Fehler aufgetreten."
        );
    }
}
