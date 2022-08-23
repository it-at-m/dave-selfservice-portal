import Status from "@/domain/enums/Status";

export default interface UpdateStatusDTO {

  zaehlungId: string;
  status: Status;

}
