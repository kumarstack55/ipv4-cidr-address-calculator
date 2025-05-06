# ipv4-cidr-address-calculator

IPv4 CIDRアドレス計算機です。

CIDRをそのまま貼り付けたり、貼り付けたあとにprefixを修正したり、CIDRを比較したり、といった機能を備えた計算機が見つからず、作りました。

## 要件

- Node.js v22.13+

## 開発

### 実行

開発サーバーを開始するには、次のようにします。

```bash
# powershell

npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を参照し、結果を確認します。

### 単体テスト

単体テストを実行するには、次のようにします。

```bash
# powershell

npm test

npx jest --watch
```

## TODO

- [ ] テキストエリアで、まとめて複数のcidrを入力できるようにする。
- [ ] ブラウザのローカルストレージにアドレスを保存する。

## 類似のプロジェクト

- [MxToolBox - Subnet Calculator](https://mxtoolbox.com/subnetcalculator.aspx)
- [cidr.xyz - IP / CIDR Calculator](https://cidr.xyz/)
- [サブネットマスク計算（IPv4)](https://note.cman.jp/network/subnetmask.cgi)

## LICENSE

MIT
