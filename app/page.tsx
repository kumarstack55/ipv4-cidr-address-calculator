"use client"
import React, { useState, useRef, useEffect } from 'react';
import { CidrAddress } from "./models/CidrAddress";
import { CidrAddressFactory } from "./models/CidrAddressFactory";
import { LuClipboard, LuClipboardCheck } from "react-icons/lu";
import * as d3 from 'd3';


let DEFAULT_CIDR = "192.168.1.0/24"
let DEFAULT_CIDR1 = "192.168.0.0/23"
let DEFAULT_CIDR2 = "192.168.0.0/24"
let DEFAULT_CIDR3 = "192.168.1.0/24"

type AddressesSectionProps = {
  cidrAddresses: CidrAddress[];
  onAddressChange: (addresses: CidrAddress[]) => void;
}

function AddressesSection({ cidrAddresses: cidrAddresses, onAddressChange }: AddressesSectionProps) {
  const [editingCidrAddresses, setEditingAddresses] = useState<{ [key: number]: string }>({});

  // アドレスを削除する関数定義
  const handleRemoveAddress = (index: number) => {
    const newAddresses = [...cidrAddresses];
    newAddresses.splice(index, 1);
    onAddressChange(newAddresses);

    const newEditingAddresses = { ...editingCidrAddresses };
    delete newEditingAddresses[index];
    setEditingAddresses(newEditingAddresses);
  };

  // アドレスを追加する関数定義
  const handleAddAddress = () => {
    const newAddresses = [...cidrAddresses];
    const newCidrAddress = CidrAddressFactory.create(DEFAULT_CIDR)
    newAddresses.push(newCidrAddress);
    onAddressChange(newAddresses);

    const newEditingAddresses = { ...editingCidrAddresses };
    newEditingAddresses[newAddresses.length - 1] = newCidrAddress.cidr;
    setEditingAddresses(newEditingAddresses);
  };

  // プレフィックスを減少させる関数定義
  const handleDecreasePrefix = (index: number) => {
    const newCidrAddresses = [...cidrAddresses];
    const cidrAddress = newCidrAddresses[index];
    if (cidrAddress.prefix > 0) {
      cidrAddress.prefix--;
    }
    onAddressChange(newCidrAddresses);

    setEditingAddresses(prev => ({
      ...prev,
      [index]: cidrAddress.cidr
    }));

  };

  // プレフィックスを増加させる関数定義
  const handleIncreasePrefix = (index: number) => {
    const newCidrAddresses = [...cidrAddresses];
    const cidrAddress = newCidrAddresses[index];
    if (cidrAddress.prefix < 32) {
      cidrAddress.prefix++;
    }
    onAddressChange(newCidrAddresses);

    setEditingAddresses(prev => ({
      ...prev,
      [index]: cidrAddress.cidr
    }));
  };

  // サブネットを減少させる関数定義
  const handlePrevSubnet = (index: number) => {
    const newCidrAddresses = [...cidrAddresses];
    const cidrAddress = newCidrAddresses[index];
    const prevCidrAddress = cidrAddress.addValue(-cidrAddress.ipAddressesInCidr)
    newCidrAddresses[index] = prevCidrAddress;
    onAddressChange(newCidrAddresses);

    setEditingAddresses(prev => ({
      ...prev,
      [index]: prevCidrAddress.cidr
    }));
  };

  // サブネットを増加させる関数定義
  const handleNextSubnet = (index: number) => {
    const newCidrAddresses = [...cidrAddresses];
    const cidrAddress = newCidrAddresses[index];
    const nextCidrAddress = cidrAddress.addValue(cidrAddress.ipAddressesInCidr);
    newCidrAddresses[index] = nextCidrAddress;
    onAddressChange(newCidrAddresses);

    setEditingAddresses(prev => ({
      ...prev,
      [index]: nextCidrAddress.cidr
    }));
  };

  // ホストを減少させる関数定義
  const handlePrevHost = (index: number) => {
    const newCidrAddresses = [...cidrAddresses];
    const cidrAddress = newCidrAddresses[index];
    const prevCidrAddress = cidrAddress.addValue(-1);
    newCidrAddresses[index] = prevCidrAddress;
    onAddressChange(newCidrAddresses);

    setEditingAddresses(prev => ({
      ...prev,
      [index]: prevCidrAddress.cidr
    }));
  };

  // ホストを増加させる関数定義
  const handleNextHost = (index: number) => {
    const newCidrAddresses = [...cidrAddresses];
    const cidrAddress = newCidrAddresses[index];
    const nextCidrAddress = cidrAddress.addValue(1);
    newCidrAddresses[index] = nextCidrAddress;
    onAddressChange(newCidrAddresses);

    setEditingAddresses(prev => ({
      ...prev,
      [index]: nextCidrAddress.cidr
    }));
  };

  // レコードの値を変更する関数定義
  const handleAddressChange = (index: number, value: string) => {
    setEditingAddresses({ ...editingCidrAddresses, [index]: value });
  };

  // 変更する要素がフォーカスを失ったときの処理定義
  const handleAddressBlur = (index: number) => {
    const value = editingCidrAddresses[index];
    if (!value) return;

    try {
      const newAddresses = [...cidrAddresses];
      newAddresses[index] = CidrAddressFactory.create(value);
      onAddressChange(newAddresses);
    } catch (e) {
      setEditingAddresses({ ...editingCidrAddresses, [index]: cidrAddresses[index].cidr });
    }
  };

  return (
    <>
      <h2>Addresses</h2>
      <table>
        <tbody>
          <tr>
            <th>Address</th>
            <th>Range</th>
            <th>Operation</th>
          </tr>
          {cidrAddresses.map((address, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={editingCidrAddresses[index] ?? address.cidr}
                  onChange={(e) => handleAddressChange(index, e.target.value)}
                  onBlur={() => handleAddressBlur(index)
                  }
                />
              </td>
              <td>
                <div>
                  {address.networkAddress.getAddress()} - {address.broadcastAddress.getAddress()}
                </div>
                <div>
                  (IP addresses in CIDR: {address.ipAddressesInCidr})
                </div>
              </td>
              <td>
                <div>
                  Prefix:
                  <input
                    type="button"
                    value=" < "
                    className="button"
                    onClick={() => handleDecreasePrefix(index)}
                  />
                  /
                  <input
                    type="button"
                    value=" > "
                    className="button"
                    onClick={() => handleIncreasePrefix(index)}
                  />
                </div>
                <div>
                  Subnet:
                  <input
                    type="button"
                    value="Prev"
                    className="button"
                    onClick={() => handlePrevSubnet(index)}
                  />
                  /
                  <input
                    type="button"
                    value="Next"
                    className="button"
                    onClick={() => handleNextSubnet(index)}
                  />
                </div>
                <div>
                  Host:
                  <input
                    type="button"
                    value="Prev"
                    className="button"
                    onClick={() => handlePrevHost(index)}
                  />
                  /
                  <input
                    type="button"
                    value="Next"
                    className="button"
                    onClick={() => handleNextHost(index)}
                  />
                </div>
                <div>
                  <input
                    type="button"
                    value="Remove Address"
                    className="button"
                    onClick={() => handleRemoveAddress(index)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <input type="button" value="Add" className="button" onClick={handleAddAddress} />
    </>
  );
}

// Range型を定義
type Range = {
  cidr: string;
  start: number;
  end: number;
};

function parseCIDR(cidrAddress: CidrAddress): Range {
  const cidr = `${cidrAddress.cidr}`;
  const start = cidrAddress.networkAddress.value;
  const end = cidrAddress.broadcastAddress.value;
  return { cidr, start, end };
}

// onAddressChangeを削除してpropsの型を修正
type VisualSectionProps = {
  cidrAddresses: CidrAddress[];
};

function VisualSection({ cidrAddresses }: VisualSectionProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const ranges: Range[] = cidrAddresses.map(parseCIDR);
    const barH = 18;
    const margin = { top: 20, right: 20, bottom: 30, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = barH * ranges.length;

    const x = d3.scaleLinear()
      .domain([d3.min(ranges, d => d.start)!, d3.max(ranges, d => d.end)! + 1])
      .range([0, width]);

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append<SVGGElement>('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5));

    g.selectAll<SVGRectElement, Range>('rect')
      .data(ranges)
      .join('rect')
      .attr('x', (d: Range) => x(d.start))
      .attr('y', (_: Range, i: number) => i * barH)
      .attr('width', (d: Range) => x(d.end + 1) - x(d.start))
      .attr('height', barH - 4)
      .attr('fill', '#69b3a2');

    g.selectAll<SVGTextElement, Range>('text.label')
      .data(ranges)
      .join('text')
      .attr('class', 'label')
      .attr('x', (d: Range) => x(d.start) + 4)
      .attr('y', (_: Range, i: number) => i * barH + (barH - 4) / 2)
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .text((d: Range) => d.cidr);
  }, [cidrAddresses]);

  return (
    <div className="visual-container">
      <svg ref={svgRef} />
    </div>
  );
}

function ResultSection(props: { cidrAddress: CidrAddress }) {
  const cidrAddress = props.cidrAddress;
  const [copiedFlags, setCopiedFlags] = useState<{ [key: string]: boolean }>({});

  // コピー可能なアイテムをマップで定義
  const copyableItems = {
    cidr: { value: cidrAddress.cidr },
    network: { value: cidrAddress.networkAddress.getAddress() },
    netmask: { value: cidrAddress.netmask.getAddress() },
    wildcard: { value: cidrAddress.wildcard.getAddress() },
    broadcast: { value: cidrAddress.broadcastAddress.getAddress() }
  } as const;

  const handleCopy = async (id: keyof typeof copyableItems) => {
    try {
      // クリップボードにコピーする。
      await navigator.clipboard.writeText(copyableItems[id].value);

      // アイコンを管理するフラグを更新して、トーストを表示
      setCopiedFlags({ ...copiedFlags, [id]: true });
      setTimeout(() => {
        setCopiedFlags(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('コピーに失敗したよ！:', err);
    }
  };

  return (
    <>
      <h3>Address: {cidrAddress.cidr}</h3>
      <table>
        <tbody>
          <tr>
            <th>Item</th>
            <th>Decimal Dot Notation</th>
            <th>Numeric</th>
            <th>Binary Dot Notation</th>
            <th>Note</th>
          </tr>
          <tr>
            <td>
              CIDR
            </td>
            <td>
              <div className="dot-notation">
                {cidrAddress.toParts().map(part => (
                  <React.Fragment key={part.key}>
                    <div className={part.type}>{part.value}</div>
                  </React.Fragment>
                ))}
                <div onClick={() => handleCopy('cidr')}>
                  {copiedFlags['cidr'] ? <LuClipboardCheck /> : <LuClipboard />}
                  {copiedFlags['cidr'] && <span className="copy-toast">Copied!</span>}
                </div>
              </div>
            </td>
            <td>
              <div className="numeric">
                {cidrAddress.address.value}
              </div>
            </td>
            <td>
              <div className="dot-notation">
                {cidrAddress.toParts(2).map(part => (
                  <React.Fragment key={part.key}>
                    <div className={part.type}>{part.value}</div>
                  </React.Fragment>
                ))}
              </div>
            </td>
            <td>
              IP addresses in CIDR: {cidrAddress.ipAddressesInCidr}
            </td>
          </tr>
          <tr>
            <td>
              Network Address
            </td>
            <td>
              <div className="dot-notation">
                {cidrAddress.networkAddress.toParts().map(part => (
                  <React.Fragment key={part.key}>
                    <div className={part.type}>{part.value}</div>
                  </React.Fragment>
                ))}
                <div onClick={() => handleCopy('network')}>
                  {copiedFlags['network'] ? <LuClipboardCheck /> : <LuClipboard />}
                  {copiedFlags['network'] && <span className="copy-toast">Copied!</span>}
                </div>
              </div>
            </td>
            <td>
              <div className="numeric">
                {cidrAddress.networkAddress.value}
              </div>
            </td>
            <td>
              <div className="dot-notation">
                {cidrAddress.networkAddress.toParts(2).map(part => (
                  <React.Fragment key={part.key}>
                    <div className={part.type}>{part.value}</div>
                  </React.Fragment>
                ))}
              </div>
            </td>
            <td>
            </td>
          </tr>
          <tr>
            <td>
              Netmask
            </td>
            <td>
              <div className="dot-notation">
                {cidrAddress.netmask.toParts().map(part => (
                  <React.Fragment key={part.key}>
                    <div className={part.type}>{part.value}</div>
                  </React.Fragment>
                ))}
                <div onClick={() => handleCopy('netmask')}>
                  {copiedFlags['netmask'] ? <LuClipboardCheck /> : <LuClipboard />}
                  {copiedFlags['netmask'] && <span className="copy-toast">Copied!</span>}
                </div>
              </div>
            </td>
            <td>
              <div className="numeric">
                {cidrAddress.netmask.value}
              </div>
            </td>
            <td>
              <div className="dot-notation">
                {cidrAddress.netmask.toParts(2).map(part => (
                  <React.Fragment key={part.key}>
                    <div className={part.type}>{part.value}</div>
                  </React.Fragment>
                ))}
              </div>
            </td>
            <td>
            </td>
          </tr>
          <tr>
            <td>
              Wildcard
            </td>
            <td>
              <div className="dot-notation">
                {cidrAddress.wildcard.toParts().map(part => (
                  <React.Fragment key={part.key}>
                    <div className={part.type}>{part.value}</div>
                  </React.Fragment>
                ))}
                <div onClick={() => handleCopy('wildcard')}>
                  {copiedFlags['wildcard'] ? <LuClipboardCheck /> : <LuClipboard />}
                  {copiedFlags['wildcard'] && <span className="copy-toast">Copied!</span>}
                </div>
              </div>
            </td>
            <td>
              <div className="numeric">
                {cidrAddress.wildcard.value}
              </div>
            </td>
            <td>
              <div className="dot-notation">
                {cidrAddress.wildcard.toParts(2).map(part => (
                  <React.Fragment key={part.key}>
                    <div className={part.type}>{part.value}</div>
                  </React.Fragment>
                ))}
              </div>
            </td>
            <td>
            </td>
          </tr>
          <tr>
            <td>
              Broadcast Address
            </td>
            <td>
              <div className="dot-notation">
                {cidrAddress.broadcastAddress.toParts().map(part => (
                  <React.Fragment key={part.key}>
                    <div className={part.type}>{part.value}</div>
                  </React.Fragment>
                ))}
                <div onClick={() => handleCopy('broadcast')}>
                  {copiedFlags['broadcast'] ? <LuClipboardCheck /> : <LuClipboard />}
                  {copiedFlags['broadcast'] && <span className="copy-toast">Copied!</span>}
                </div>
              </div>
            </td>
            <td>
              <div className="numeric">
                {cidrAddress.broadcastAddress.value}
              </div>
            </td>
            <td>
              <div className="dot-notation">
                {cidrAddress.broadcastAddress.toParts(2).map(part => (
                  <React.Fragment key={part.key}>
                    <div className={part.type}>{part.value}</div>
                  </React.Fragment>
                ))}
              </div>
            </td>
            <td>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default function Home() {
  const [addressArray, setAddressArray] = useState<CidrAddress[]>([
    CidrAddressFactory.create(DEFAULT_CIDR1),
    CidrAddressFactory.create(DEFAULT_CIDR2),
    CidrAddressFactory.create(DEFAULT_CIDR3),
  ]);

  return (
    <div>
      <h1>IPv4 CIDR Address Calculator</h1>
      <AddressesSection
        cidrAddresses={addressArray}
        onAddressChange={setAddressArray}
      />
      <h2>Visualization</h2>
      <VisualSection cidrAddresses={addressArray} />
      <h2>Result</h2>
      {addressArray.map((address, index) => (
        <ResultSection key={index} cidrAddress={address} />
      ))}
    </div>
  );
}
