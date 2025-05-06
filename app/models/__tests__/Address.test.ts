import { CidrAddress } from '../CidrAddress';
import { CidrAddressFactory } from '../CidrAddressFactory';

describe('Address', () => {
  describe('constructor', () => {
    it('デフォルトのプレフィックスは32', () => {
      const addr = new CidrAddress(0);
      expect(addr.prefix).toBe(32);
    });

    it('負のプレフィックスはエラー', () => {
      expect(() => new CidrAddress(0, -1)).toThrow('Prefix cannot be negative');
    });

    it('プレフィックスが32より大きいとエラー', () => {
      expect(() => new CidrAddress(0, 33)).toThrow('Prefix cannot be greater than 32');
    });
  });

  describe('netmask', () => {
    it('プレフィックス0のネットマスクは0.0.0.0', () => {
      const addr = new CidrAddress(0, 0);
      expect(addr.netmask.value).toBe(0x00000000);
    });

    it('プレフィックス24のネットマスクは255.255.255.0', () => {
      const addr = new CidrAddress(0, 24);
      expect(addr.netmask.value).toBe(0xffffff00);
    });

    it('プレフィックス32のネットマスクは255.255.255.255', () => {
      const addr = new CidrAddress(0, 32);
      expect(addr.netmask.value).toBe(0xffffffff);
    });
  });

  describe('wildcard', () => {
    it('プレフィックス0のワイルドカードは255.255.255.255', () => {
      const addr = new CidrAddress(0, 0);
      expect(addr.wildcard.value).toBe(0xffffffff);
    });

    it('プレフィックス24のワイルドカードは0.0.0.255', () => {
      const addr = new CidrAddress(0, 24);
      expect(addr.wildcard.value).toBe(0x000000ff);
    });

    it('プレフィックス32のワイルドカードは0.0.0.0', () => {
      const addr = new CidrAddress(0, 32);
      expect(addr.wildcard.value).toBe(0x00000000);
    });
  });

  describe('networkAddress', () => {
    it('0.0.0.0/0のネットワークアドレスは0.0.0.0', () => {
      const addr = CidrAddressFactory.create('0.0.0.0/0');
      expect(addr.networkAddress.value).toBe(0x00000000);
    });

    it('192.168.1.1/24のネットワークアドレスは192.168.1.0', () => {
      const addr = CidrAddressFactory.create('192.168.1.1/24');
      expect(addr.networkAddress.value).toBe(0xc0a80100);
    });

    it('255.255.255.255/32のネットワークアドレスは255.255.255.255', () => {
      const addr = CidrAddressFactory.create('255.255.255.255/32');
      expect(addr.networkAddress.value).toBe(0xffffffff);
    });
  });

  describe('broadcastAddress', () => {
    it('0.0.0.0/0のブロードキャストアドレスは255.255.255.255', () => {
      const addr = CidrAddressFactory.create('0.0.0.0/0');
      expect(addr.broadcastAddress.value).toBe(0xffffffff);
    });

    it('192.168.1.1/24のブロードキャストアドレスは192.168.1.255', () => {
      const addr = CidrAddressFactory.create('192.168.1.1/24');
      expect(addr.broadcastAddress.value).toBe(0xc0a801ff);
    });

    it('255.255.255.255/32のブロードキャストアドレスは255.255.255.255', () => {
      const addr = CidrAddressFactory.create('255.255.255.255/32');
      expect(addr.broadcastAddress.value).toBe(0xffffffff);
    });
  });

  describe('ipAddressesInCidr', () => {
    it('/32 は1個のIPアドレス', () => {
      const addr = CidrAddressFactory.create('192.168.1.1/32');
      expect(addr.ipAddressesInCidr).toBe(1);
    });

    it('/24 は256個のIPアドレス', () => {
      const addr = CidrAddressFactory.create('192.168.1.0/24');
      expect(addr.ipAddressesInCidr).toBe(256);
    });

    it('/0 は4294967296個のIPアドレス', () => {
      const addr = CidrAddressFactory.create('0.0.0.0/0');
      expect(addr.ipAddressesInCidr).toBe(4294967296);
    });
  });

  describe('cidr', () => {
    it('プライベートアドレスの文字列表現', () => {
      const addr = CidrAddressFactory.create('192.168.1.1/24');
      expect(addr.cidr).toBe('192.168.1.1/24');
    });

    it('0.0.0.0/0 の文字列表現', () => {
      const addr = CidrAddressFactory.create('0.0.0.0/0');
      expect(addr.cidr).toBe('0.0.0.0/0');
    });

    it('255.255.255.255/32 の文字列表現', () => {
      const addr = CidrAddressFactory.create('255.255.255.255/32');
      expect(addr.cidr).toBe('255.255.255.255/32');
    });
  });

  describe('add', () => {
    it('192.168.1.1に1を足すと192.168.1.2になる', () => {
      const addr = CidrAddressFactory.create('192.168.1.1/24');
      const result = addr.addValue(1);
      expect(result.cidr).toBe('192.168.1.2/24');
    });

    it('プレフィックス長は保持される', () => {
      const addr = CidrAddressFactory.create('192.168.1.1/24');
      const result = addr.addValue(1);
      expect(result.prefix).toBe(24);
    });

    it('255.255.255.255に1を足すとエラー', () => {
      const addr = CidrAddressFactory.create('255.255.255.255/32');
      expect(() => addr.addValue(1)).toThrow('Address value cannot be greater than 0xffffffff');
    });

    it('0.0.0.0から1を引くとエラー', () => {
      const addr = CidrAddressFactory.create('0.0.0.0/0');
      expect(() => addr.addValue(-1)).toThrow('Address value cannot be negative');
    });
  });

  describe('addPrefix', () => {
    it('プレフィックスを1増やせる', () => {
      const addr = CidrAddressFactory.create('192.168.1.1/24');
      const result = addr.addPrefix(1);
      expect(result.prefix).toBe(25);
    });

    it('プレフィックス32以上にはならない', () => {
      const addr = CidrAddressFactory.create('192.168.1.1/32');
      expect(() => addr.addPrefix(1)).toThrow('Prefix cannot be greater than 32');
    });

    it('プレフィックス0未満にはならない', () => {
      const addr = CidrAddressFactory.create('192.168.1.1/0');
      expect(() => addr.addPrefix(-1)).toThrow('Prefix cannot be negative');
    });

    it('アドレス値は変化しない', () => {
      const addr = CidrAddressFactory.create('192.168.1.1/24');
      const result = addr.addPrefix(1);
      expect(result.address.value >>> 0).toBe(0xc0a80101);
    });
  });
});
