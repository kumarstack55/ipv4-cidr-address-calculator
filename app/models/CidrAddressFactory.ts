import { CidrAddress } from './CidrAddress';

export class CidrAddressFactory {
    static create(addressStr: string): CidrAddress {
        // IPv4アドレスの形式をチェック
        const pattern = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
        if (!pattern.test(addressStr)) {
            throw new Error('Invalid IPv4 CIDR format');
        }

        // プレフィックス部分を取得
        const [ipAddress, prefixString] = addressStr.split('/');
        const prefix = Number(prefixString);
        const octets = ipAddress.split('.').map(Number);

        // 各オクテットが0-255の範囲内かチェック
        if (!octets.every(octet => octet >= 0 && octet <= 255)) {
            throw new Error('Invalid IPv4 address values');
        }

        // 32ビットの数値に変換
        const value = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];

        // prefixも一緒に渡す
        return new CidrAddress(value, prefix);
    }
}
