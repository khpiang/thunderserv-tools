"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function SubnetCalculatorPage() {
  const { language } = useLanguage();

  const [ipAddress, setIpAddress] = useState<string>("192.168.1.1");
  const [cidr, setCidr] = useState<number>(24);
  const [copied, setCopied] = useState<boolean>(false);

  // Helper: Convert IPv4 string to 32-bit number
  const ipToLong = (ip: string): number => {
    return (
      ip
        .split(".")
        .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
    );
  };

  // Helper: Convert 32-bit number back to IPv4 string
  const longToIp = (long: number): string => {
    return [
      (long >>> 24) & 255,
      (long >>> 16) & 255,
      (long >>> 8) & 255,
      long & 255,
    ].join(".");
  };

  // Validate IP format
  const isValidIp = (ip: string): boolean => {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
    });
  };

  // Calculations
  const calculateSubnet = () => {
    if (!isValidIp(ipAddress) || cidr < 0 || cidr > 32) {
      return null;
    }

    const ipLong = ipToLong(ipAddress);
    const maskLong = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
    const wildcardLong = ~maskLong >>> 0;

    const netLong = (ipLong & maskLong) >>> 0;
    const bcastLong = (netLong | wildcardLong) >>> 0;

    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, totalHosts - 2);

    const firstUsableLong = cidr >= 31 ? netLong : netLong + 1;
    const lastUsableLong = cidr >= 31 ? bcastLong : bcastLong - 1;

    return {
      ip: ipAddress,
      cidr,
      subnetMask: longToIp(maskLong),
      wildcardMask: longToIp(wildcardLong),
      networkAddress: longToIp(netLong),
      broadcastAddress: longToIp(bcastLong),
      firstUsable: longToIp(firstUsableLong),
      lastUsable: longToIp(lastUsableLong),
      totalHosts: totalHosts.toLocaleString(),
      usableHosts: usableHosts.toLocaleString(),
    };
  };

  const results = calculateSubnet();
  const today = new Date().toISOString().split("T")[0];

  const profileText = results
    ? `===================================================================
                     THUNDERSERV NETWORK PROFILE
                      https://thunderserv.com
===================================================================
Generated Date  : ${today}
Module          : Enterprise IPv4 Subnet Calculator

[SUBNET CONFIGURATION]
-------------------------------------------------------------------
• Input IP Address : ${results.ip}/${results.cidr}
• Subnet Mask      : ${results.subnetMask}
• Wildcard Mask    : ${results.wildcardMask}

[NETWORK ADDRESS BOUNDARIES]
-------------------------------------------------------------------
• Network Address  : ${results.networkAddress}
• Broadcast Address: ${results.broadcastAddress}
• Usable IP Range  : ${results.firstUsable} - ${results.lastUsable}
• Total Addresses  : ${results.totalHosts}
• Usable Hosts     : ${results.usableHosts}

===================================================================
Powered by ThunderServ Infrastructure Solutions | thunderserv.com
===================================================================`
    : "Invalid IPv4 Address input.";

  const handleCopyProfile = () => {
    if (!results) return;
    navigator.clipboard.writeText(profileText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
      {/* Top Nav */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-blue-400 hover:text-blue-300 border border-gray-700/80 px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-md"
        >
          <span>← 🏠</span>
          <span>{language === "zh" ? "返回工具列表" : "Back to All Tools"}</span>
        </Link>
      </div>

      {/* Single Clean Header */}
      <div className="mb-8 border-b border-gray-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            🌐 {language === "zh" ? "IPv4 子网掩码计算器" : "IPv4 Subnet Calculator"}
          </h1>
          <p className="text-gray-400 text-sm">
            {language === "zh"
              ? "计算 CIDR 网络地址、广播地址、掩码反码及可用主机 IP 范围。"
              : "Calculate CIDR block ranges, subnet masks, wildcard masks, and usable host IP ranges."}
          </p>
        </div>
        <div className="text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
          Branded for <span className="text-blue-400 font-bold">thunderserv.com</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Input Section */}
        <div className="lg:col-span-6 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
            ⚙️ {language === "zh" ? "网络参数设置" : "Subnet Inputs"}
          </h2>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              {language === "zh" ? "IP 地址 (IPv4)" : "IP Address (IPv4)"}
            </label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value.trim())}
              placeholder="e.g. 192.168.1.1"
              className={`w-full bg-gray-950 border ${
                isValidIp(ipAddress) ? "border-gray-700" : "border-red-500"
              } rounded-xl px-4 py-2.5 text-white font-mono text-lg focus:outline-none focus:border-blue-500`}
            />
            {!isValidIp(ipAddress) && (
              <p className="text-xs text-red-400 mt-1.5">
                {language === "zh" ? "请输入有效的 IPv4 地址 (例如 10.0.0.1)" : "Invalid IPv4 address format"}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                {language === "zh" ? "子网掩码 / CIDR" : "Subnet Mask / CIDR"}
              </label>
              <span className="text-xs font-mono text-blue-400 font-bold">/{cidr}</span>
            </div>
            <select
              value={cidr}
              onChange={(e) => setCidr(Number(e.target.value))}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-base font-semibold"
            >
              {Array.from({ length: 33 }, (_, i) => {
                const maskLong = i === 0 ? 0 : (0xffffffff << (32 - i)) >>> 0;
                const maskIp = longToIp(maskLong);
                const hosts = i >= 31 ? (i === 31 ? 2 : 1) : Math.max(0, Math.pow(2, 32 - i) - 2);
                return (
                  <option key={i} value={i}>
                    /{i} - {maskIp} ({hosts.toLocaleString()} hosts)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quick Preset CIDRs */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              {language === "zh" ? "常用 CIDR 预设:" : "Common Presets:"}
            </label>
            <div className="flex flex-wrap gap-2">
              {[8, 16, 24, 27, 28, 29, 30].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCidr(preset)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition ${
                    cidr === preset
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-gray-950 text-gray-300 border-gray-800 hover:bg-gray-800"
                  }`}
                >
                  /{preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output Results Panel */}
        <div className="lg:col-span-6 bg-gradient-to-br from-blue-950/40 via-gray-900 to-gray-900 border border-blue-900/50 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">📊 Calculated Boundaries</h2>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                thunderserv.com
              </span>
            </div>

            {results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-400">Network Address</div>
                    <div className="text-lg font-bold text-white font-mono">{results.networkAddress}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400">Broadcast Address</div>
                    <div className="text-lg font-bold text-white font-mono">{results.broadcastAddress}</div>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-3">
                  <div className="text-xs font-semibold text-gray-400 mb-1">Usable IP Range</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">
                    {results.firstUsable} — {results.lastUsable}
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-3 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-400">Subnet Mask</div>
                    <div className="text-sm font-mono text-gray-200">{results.subnetMask}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400">Wildcard Mask</div>
                    <div className="text-sm font-mono text-gray-200">{results.wildcardMask}</div>
                  </div>
                </div>

                <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="text-xs font-semibold text-gray-400">Usable Hosts</div>
                    <div className="text-xl font-bold text-yellow-400 font-mono">{results.usableHosts}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400">Total Addresses</div>
                    <div className="text-xl font-bold text-gray-300 font-mono">{results.totalHosts}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Please enter a valid IPv4 address to calculate subnet boundaries.
              </div>
            )}
          </div>

          <button
            onClick={handleCopyProfile}
            disabled={!results}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition mt-6"
          >
            {copied ? "✓ Copied Profile Text!" : "Copy Branded Profile Text"}
          </button>
        </div>
      </div>

      {/* Export Preview Section */}
      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">📄 BRANDED EXPORT DATA PREVIEW</h3>
        <pre className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
          {profileText}
        </pre>
      </div>
    </main>
  );
}
