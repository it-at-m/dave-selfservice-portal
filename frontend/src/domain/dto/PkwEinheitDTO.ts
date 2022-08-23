import BaseEntity from "@/domain/BaseEntity";

export default interface PkwEinheitDTO extends BaseEntity {
  pkw: number;
  lkw: number;
  lastzuege: number;
  busse: number;
  kraftraeder: number;
  fahrradfahrer: number;
}