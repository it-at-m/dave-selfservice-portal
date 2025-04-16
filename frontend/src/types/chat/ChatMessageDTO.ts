import type BaseEntity from "@/types/common/BaseEntity";

export default interface ChatMessageDTO extends BaseEntity {
  zaehlungId: string;
  messageId: string; //Wird diese ID benötigt (evtl. zum Sortieren)?
  content: string;
  participantId: number;
  timestamp: string;
  type: string;
  uploaded: boolean;
  viewed: boolean;
}
