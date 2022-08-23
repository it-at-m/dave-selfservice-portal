import MessageTime from "@/domain/chat/MessageTime";

export default interface Message {
  content: string;
  myself: boolean;
  participantId: number;
  timestamp: MessageTime;
  type: string;
  uploaded: boolean;
  viewed: boolean;
}