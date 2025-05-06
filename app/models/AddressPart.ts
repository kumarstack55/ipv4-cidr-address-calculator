import { AddressPartType } from "./AddressPartType";

export interface AddressPart {
  key: number;
  value: string;
  type: AddressPartType;
}
