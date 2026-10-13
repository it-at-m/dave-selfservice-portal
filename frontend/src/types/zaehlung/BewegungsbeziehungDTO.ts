import type ZeitintervallDTO from "@/domain/dto/ZeitintervallDTO";
import type BaseEntity from "@/types/common/BaseEntity";

export default interface BewegungsbeziehungDTO extends BaseEntity {
  zeitintervalle: Array<ZeitintervallDTO>;
}
