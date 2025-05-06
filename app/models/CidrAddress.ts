import { Address } from './Address';
import { AddressPartType } from "./AddressPartType";
import { AddressType } from './AddressType';
import { AddressPart } from './AddressPart';

export class CidrAddress {
  public address: Address;
  public prefix: number;

  constructor(value: number, prefix: number = 32) {
    this.address = new Address(value);

    // プレフィックスが0-32の範囲内かチェック
    if (prefix < 0) {
      throw new Error('Prefix cannot be negative');
    }
    if (prefix > 32) {
      throw new Error('Prefix cannot be greater than 32');
    }

    this.prefix = prefix;
  }

  getAddress(base: number = 10, addressType: AddressType = AddressType.cidr): string {
    let value;
    switch (addressType) {
      case AddressType.cidr:
        value = this.address.value >>> 0;
        break;
      case AddressType.netmask:
        value = this.netmask.value >>> 0;
        break;
      case AddressType.wildcard:
        value = this.wildcard.value >>> 0;
        break;
      case AddressType.networkAddress:
        value = this.networkAddress.value >>> 0;
        break;
      case AddressType.broadcastAddress:
        value = this.broadcastAddress.value >>> 0;
        break;
      default:
        throw new Error('Invalid address type');
    }

    let octets = [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];

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

  getCidr(base: number = 10): string {
    let address = this.getAddress(base);
    return `${address}/${this.prefix}`;
  }

  get cidr(): string {
    return this.getCidr();
  }

  get netmask(): Address {
    // 32ビットのシフトを行うと負数になるため、回避する。
    if (this.prefix === 0) {
      return new Address(0);
    }

    return new Address((0xffffffff << (32 - this.prefix)) >>> 0);
  }

  get wildcard(): Address {
    return new Address(~this.netmask.value >>> 0);
  }

  get networkAddress(): Address {
    return new Address((this.address.value & this.netmask.value) >>> 0);
  }

  get broadcastAddress(): Address {
    return new Address((this.networkAddress.value | this.wildcard.value) >>> 0)
  }

  get ipAddressesInCidr(): number {
    return 2 ** (32 - this.prefix);
  }

  addValue(value: number): CidrAddress {
    let newValue = (this.address.value >>> 0) + value;
    if (newValue < 0) {
      throw new Error('Address value cannot be negative');
    }
    if (newValue > 0xffffffff) {
      throw new Error('Address value cannot be greater than 0xffffffff');
    }

    return new CidrAddress(newValue, this.prefix);
  }

  addPrefix(value: number): CidrAddress {
    let newPrefix = this.prefix + value;
    if (newPrefix < 0) {
      throw new Error('Prefix cannot be negative');
    }
    if (newPrefix > 32) {
      throw new Error('Prefix cannot be greater than 32');
    }

    return new CidrAddress(this.address.value, newPrefix);
  }

  toParts(base: number = 10): AddressPart[] {
    const parts: AddressPart[] = [];
    const cidrString = this.getCidr(base);
    const it = cidrString.matchAll(/\/\d+|\d+|\./g);
    let key = 0;
    for (const match of it) {
      const value = match[0];
      let type: AddressPartType;

      if (value === ".") {
        type = AddressPartType.Dot;
      }
      else if (value[0] === "/") {
        type = AddressPartType.Prefix;
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
