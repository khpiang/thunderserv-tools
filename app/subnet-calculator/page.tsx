"use client";

import React, { useState } from "react";

export default function SubnetCalculator() {
  const [ipInput, setIpInput] = useState("192.168.1.2");
  const [cidr, setCidr] = useState(29);

  // 处理 IP/CIDR 输入 (支持直接粘贴如 192.168.1.2/29)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes("/")) {
      const [ipPart, maskPart] = val.split("/");
      setIpInput(ipPart);
      const maskNum = parseInt(maskPart, 10);
      if (!isNaN(maskNum) && maskNum >= 8 && maskNum <= 32) {
        setCidr(maskNum);
      }
    } else {
      setIpInput(val);
    }
  };

  // IP 转 32位 整数
  const ipToInt = (ipStr: string): number | null => {
    const parts = ipStr.trim().split(".");
    if (parts.length !== 4) return null;
    let num = 0;
    for (let i = 0; i < 4; i++) {
      const part = parseInt(parts[i], 10);
      if (isNaN(part) || part < 0 || part > 255) return null;
      num = (num << 8) + part;
    }
    return num >>> 0;
  };

  // 整数转 IP
  const intToIp = (num: number): string => {
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255,
    ].join(".");
  };

  // 计算子网与 IP 详细分配
  const calculateDetails = () => {
    const ipNum = ipToInt(ipInput);
    if (ipNum === null) return null;

    const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcardNum = (~maskNum) >>> 0;
    const networkNum = (ipNum & maskNum) >>> 0;
    const broadcastNum = (networkNum | wildcardNum) >>> 0;

    const totalHosts = Math.pow(2, 32 - cidr);
    // 理论可用 IP (扣除 Network & Broadcast)
    const rawUsableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : totalHosts - 2;

    // IDC 实际分配逻辑：第一位 (Network + 1) 作为机房默认网关
    const gatewayNum = cidr >= 31 ? networkNum : networkNum + 1;
    const clientFirstUsable = cidr >= 31 ? networkNum : gatewayNum + 1;
    const clientLastUsable = cidr >= 31 ? broadcastNum : broadcastNum - 1;

    // 客户实际可用客户端 IP 数 (扣除 网关)
    const clientUsableCount = cidr >= 31 ? rawUsableHosts : Math.max(0, rawUsableHosts - 1);

    return {
      network: intToIp(networkNum),
      gateway: intToIp(gatewayNum),
      broadcast: intToIp(broadcastNum),
      netmask: intToIp(maskNum),
      wildcard: intToIp(wildcardNum),
      clientFirstUsable: intToIp(clientFirstUsable),
      clientLastUsable: intToIp(clientLastUsable),
      clientUsableCount,
      totalHosts,
    };
  };

  // CIDR 列表对比逻辑
  const generateSubnetTable = () => {
    const ipNum = ipToInt(ipInput);
    if (ipNum === null) return [];

    const currentMask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const baseNetwork = (ipNum & currentMask) >>> 0;

    const list = [];
    for (let prefix = cidr; prefix <= 30; prefix++) {
      const subnetMask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
      const totalIPs = Math.pow(2, 32 - prefix);
      const rawUsable = prefix >= 31 ? (prefix === 31 ? 2 : 1) : totalIPs - 2;
      const clientUsable = prefix >= 31 ? rawUsable : Math.max(0, rawUsable - 1);

      list.push({
        prefix: `/${prefix}`,
        netmask: intToIp(subnetMask),
        totalIPs,
        clientUsable,
        network: intToIp(baseNetwork),
      });
    }
    return list;
  };

  const details = calculateDetails();
  const subnetTable = generateSubnetTable();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans">
      {/* 统一 Header 导航 */}
      <header className="border-b border-gray-800 bg-[#111827]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl text-white">⚡</div>
            <span className="font-bold text-xl tracking-wider text-white">
              ThunderServ <span className="text-blue-500 font-normal text-sm">Tools</span>
            </span>
          </a>
          <a href="/" className="text-xs text-gray-400 hover:text-white transition">
            ← Back to All Tools
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            IP Subnet & CIDR Calculator
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Calculate gateway addresses, usable client host IP ranges, and subnet masks for bare-metal server allocations.
          </p>
        </div>

        {/* 输入设置卡片 */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">
                IP Address / CIDR (e.g. 192.168.1.2 or 192.168.1.2/29)
              </label>
              <input
                type="text"
                value={ipInput}
                onChange={handleInputChange}
                placeholder="192.168.1.2/29"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">
                Subnet Mask (CIDR)
              </label>
              <select
                value={cidr}
                onChange={(e) => setCidr(parseInt(e.target.value, 10))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                {Array.from({ length: 23 }, (_, i) => i + 8).map((prefix) => (
                  <option key={prefix} value={prefix}>
                    /{prefix}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {details ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 详细计算结果展示卡片 */}
            <div className="lg:col-span-12 bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h2 className="text-lg font-bold text-white">
                  Allocation Breakdown for <span className="text-blue-400 font-mono">{ipInput}/{cidr}</span>
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
                  {details.clientUsableCount} Client Usable IPs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Network Address</div>
                  <div className="text-base font-bold font-mono text-white mt-1">{details.network}</div>
                </div>

                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Default Gateway</div>
                  <div className="text-base font-bold font-mono text-amber-400 mt-1">{details.gateway}</div>
                </div>

                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Client Usable Range</div>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
                    {details.clientFirstUsable} – {details.clientLastUsable}
                  </div>
                </div>

                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Broadcast Address</div>
                  <div className="text-base font-bold font-mono text-white mt-1">{details.broadcast}</div>
                </div>

                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Subnet Mask</div>
                  <div className="text-base font-bold font-mono text-white mt-1">{details.netmask}</div>
                </div>

                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Wildcard Mask</div>
                  <div className="text-base font-bold font-mono text-white mt-1">{details.wildcard}</div>
                </div>

                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Client Usable Hosts</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                    {details.clientUsableCount} IPs
                  </div>
                </div>

                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Total Subnet IPs</div>
                  <div className="text-base font-bold font-mono text-white mt-1">
                    {details.totalHosts} IPs
                  </div>
                </div>
              </div>

              {/* CIDR 规格明细表格 */}
              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-sm font-bold text-gray-300 mb-3">Subnet Mask Quick Reference</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400">
                        <th className="py-2.5 px-3">CIDR</th>
                        <th className="py-2.5 px-3">Subnet Mask</th>
                        <th className="py-2.5 px-3">Total IPs</th>
                        <th className="py-2.5 px-3">Client Usable IPs</th>
                        <th className="py-2.5 px-3">Subnet Network</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {subnetTable.map((item) => (
                        <tr
                          key={item.prefix}
                          className={
                            item.prefix === `/${cidr}`
                              ? "bg-blue-600/20 text-blue-400 font-bold"
                              : "text-gray-300 hover:bg-gray-800/40"
                          }
                        >
                          <td className="py-2.5 px-3">{item.prefix}</td>
                          <td className="py-2.5 px-3">{item.netmask}</td>
                          <td className="py-2.5 px-3">{item.totalIPs}</td>
                          <td className="py-2.5 px-3 text-emerald-400">{item.clientUsable}</td>
                          <td className="py-2.5 px-3">{item.network}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-xs text-red-400">
            Please enter a valid IPv4 address (e.g., 192.168.1.2 or 192.168.1.2/29).
          </div>
        )}
      </main>
    </div>
  );
}
