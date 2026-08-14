"use client";

import React, { useState } from "react";

export default function SubnetCalculator() {
  const [ipInput, setIpInput] = useState("192.168.1.2");
  const [cidr, setCidr] = useState(29);

  // 处理输入框变更（支持直接粘贴 192.168.1.2/29）
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

  // 计算单一 IP/子网详情
  const calculateDetails = () => {
    const ipNum = ipToInt(ipInput);
    if (ipNum === null) return null;

    const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcardNum = (~maskNum) >>> 0;
    const networkNum = (ipNum & maskNum) >>> 0;
    const broadcastNum = (networkNum | wildcardNum) >>> 0;

    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : totalHosts - 2;

    const firstUsable = cidr >= 31 ? networkNum : networkNum + 1;
    const lastUsable = cidr >= 31 ? broadcastNum : broadcastNum - 1;

    return {
      network: intToIp(networkNum),
      broadcast: intToIp(broadcastNum),
      netmask: intToIp(maskNum),
      wildcard: intToIp(wildcardNum),
      firstUsable: intToIp(firstUsable),
      lastUsable: intToIp(lastUsable),
      usableHosts,
      totalHosts,
    };
  };

  // 保留原有的 CIDR 切分表格逻辑
  const generateSubnetTable = () => {
    const ipNum = ipToInt(ipInput);
    if (ipNum === null) return [];

    const currentMask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const baseNetwork = (ipNum & currentMask) >>> 0;

    const list = [];
    for (let prefix = cidr; prefix <= 30; prefix++) {
      const subnetMask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
      const totalIPs = Math.pow(2, 32 - prefix);
      const usableIPs = prefix >= 31 ? (prefix === 31 ? 2 : 1) : totalIPs - 2;
      const network = intToIp(baseNetwork);
      const netmask = intToIp(subnetMask);

      list.push({
        prefix: `/${prefix}`,
        netmask,
        totalIPs,
        usableIPs,
        network,
      });
    }
    return list;
  };

  const details = calculateDetails();
  const subnetTable = generateSubnetTable();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Subnet Calculator</h1>
      <p className="text-gray-400 mb-6">
        Analyze IP addresses, subnet masks, usable ranges, and CIDR subnets.
      </p>

      {/* 输入框区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            IP Address (e.g., 192.168.1.2 or 192.168.1.2/29)
          </label>
          <input
            type="text"
            value={ipInput}
            onChange={handleInputChange}
            placeholder="192.168.1.2/29"
            className="w-full p-2.5 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subnet Prefix</label>
          <select
            value={cidr}
            onChange={(e) => setCidr(parseInt(e.target.value, 10))}
            className="w-full p-2.5 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
          >
            {Array.from({ length: 23 }, (_, i) => i + 8).map((prefix) => (
              <option key={prefix} value={prefix}>
                /{prefix}
              </option>
            ))}
          </select>
        </div>
      </div>

      {details ? (
        <div className="space-y-8">
          {/* 1. IP 详细解析卡片 */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              IP Range & Network Details ({ipInput}/{cidr})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-400">Network Address</div>
                <div className="text-base font-mono font-medium text-white">{details.network}</div>
              </div>
              <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-400">First Usable IP</div>
                <div className="text-base font-mono font-medium text-green-400">{details.firstUsable}</div>
              </div>
              <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-400">Last Usable IP</div>
                <div className="text-base font-mono font-medium text-green-400">{details.lastUsable}</div>
              </div>
              <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-400">Broadcast Address</div>
                <div className="text-base font-mono font-medium text-white">{details.broadcast}</div>
              </div>

              <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-400">Subnet Mask</div>
                <div className="text-base font-mono text-white">{details.netmask}</div>
              </div>
              <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-400">Wildcard Mask</div>
                <div className="text-base font-mono text-white">{details.wildcard}</div>
              </div>
              <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-400">Usable Hosts</div>
                <div className="text-base font-mono text-white">{details.usableHosts.toLocaleString()}</div>
              </div>
              <div className="bg-gray-900/60 p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-400">Total IPs</div>
                <div className="text-base font-mono text-white">{details.totalHosts.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* 2. 保留原有的 CIDR 对比表格 */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              Subnet CIDR Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-sm">
                    <th className="py-2 px-3">CIDR</th>
                    <th className="py-2 px-3">Subnet Mask</th>
                    <th className="py-2 px-3">Total IPs</th>
                    <th className="py-2 px-3">Usable IPs</th>
                    <th className="py-2 px-3">Subnet Base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm font-mono">
                  {subnetTable.map((item) => (
                    <tr
                      key={item.prefix}
                      className={item.prefix === `/${cidr}` ? "bg-blue-900/30 text-blue-300 font-bold" : "hover:bg-gray-800/40"}
                    >
                      <td className="py-2 px-3">{item.prefix}</td>
                      <td className="py-2 px-3">{item.netmask}</td>
                      <td className="py-2 px-3">{item.totalIPs.toLocaleString()}</td>
                      <td className="py-2 px-3">{item.usableIPs.toLocaleString()}</td>
                      <td className="py-2 px-3">{item.network}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-red-900/30 border border-red-700 text-red-300 rounded">
          Please enter a valid IP address (e.g., 192.168.1.2 or 192.168.1.2/29).
        </div>
      )}
    </div>
  );
}
