import { AddressPartType } from "./AddressPartType";
import { AddressPart } from "./AddressPart";

export class Address {
  public value: number;

  constructor(value: number) {
    this.value = value >>> 0;
  }

  getAddress(base: number = 10): string {
    let octets = [(this.value >>> 24) & 0xff, (this.value >>> 16) & 0xff, (this.value >>> 8) & 0xff, this.value & 0xff];

    let parts: string[] = [];
    if (base === 2) {
      parts = octets.map(octet => octet.toString(base).padStart(8, '0'));
    }
    else if (base === 10) {
      parts = octets.map(octet => octet.toString(base));
    }
    else {
      throw new Error('Base must be either 2 or 10');
    }

    return parts.join('.');
  }

  addValue(value: number): Address {
    let newValue = (this.value >>> 0) + value;
    if (newValue < 0) {
      throw new Error('Address value cannot be negative');
    }
    if (newValue > 0xffffffff) {
      throw new Error('Address value cannot be greater than 0xffffffff');
    }

    return new Address(newValue);
  }

  toParts(base: number = 10): AddressPart[] {
    const parts: AddressPart[] = [];
    const addressString = this.getAddress(base);
    const it = addressString.matchAll(/\d+|\./g);
    let key = 0;
    for (const match of it) {
      const value = match[0];
      let type: AddressPartType;

      if (value === ".") {
        type = AddressPartType.Dot;
      } else {
        if (base === 2) {
          type = AddressPartType.Binary;
        } else {
          type = AddressPartType.Decimal;
        }
      }
      const part: AddressPart = { key: key++, value, type };
      parts.push(part);
    }
    return parts;
  }
}
