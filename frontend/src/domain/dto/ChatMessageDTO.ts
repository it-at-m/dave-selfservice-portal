import MessageTime from "@/domain/chat/MessageTime";
import BaseEntity from "@/domain/BaseEntity";

export default interface ChatMessageDTO extends BaseEntity {
    id: string;
    zaehlungId: string;
    content: string;
    participantId: number;
    messageTimeDTO: MessageTime;
    type: string;
    uploaded: boolean;
    viewed: boolean;
}
