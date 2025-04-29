import type Status from "@/types/enum/Status";

export default interface UpdateStatusDTO {
  zaehlungId: string;
  status: Status;
}
