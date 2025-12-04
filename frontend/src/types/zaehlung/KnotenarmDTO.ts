import type BaseEntity from "@/types/common/BaseEntity";

export default interface KnotenarmDTO extends BaseEntity {
  nummer: number;
  strassenname: string;
  filename: string;
  filedata: Array<string>;
}
