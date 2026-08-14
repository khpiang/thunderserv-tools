"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function BandwidthCalculatorPage() {
  const { language } = useLanguage();

  // Active Tab: 
  // 1: Speed to Traffic & Profile
  // 2: Traffic to Speed
  // 3: Transfer Time
  // 4: 95th Percentile Billing
  // 5: Cost Estimator
  const [activeTab, setActiveTab] = useState<
    "speedToTraffic" | "trafficToSpeed" | "transferTime" | "billing95" | "cost"
  >("speedToTraffic");

  // Tab 1: Speed -> Traffic & Hardware Profile
  const [portSpeed, setPortSpeed] = useState<number>(10000); // Default 10Gbps
  const [speedUnit, setSpeedUnit] = useState<"Mbps" | "Gbps">("Mbps");
  const [utilization, setUtilization] = useState<number>(100);
  const [days, setDays] = useState<number>(30);
  const [overhead, setOverhead] = useState<number>(3); // 3% TCP Overhead

  // Tab 2: Traffic -> Speed
  const [targetTraffic, setTargetTraffic] = useState<number>(100);
  const [trafficUnit, setTrafficUnit] = useState<"GB" | "TB" | "PB">("TB");
  const [targetDays, setTargetDays] = useState<number>(30);

  // Tab 3: Transfer Time
  const [fileSize, setFileSize] = useState<number>(500);
  const [fileUnit, setFileUnit] = useState<"GB" | "TB">("GB");
  const [transferSpeed, setTransferSpeed] = useState<number>(100);
  const [transferSpeedUnit, setTransferSpeedUnit] = useState<"Mbps" | "Gbps" | "MB/s">("Mbps");

  // Tab 4: 95th Percentile Billing
  const [peakSpeed, setPeakSpeed] = useState<number>(1000); // Mbps
  const [burstRatio, setBurstRatio] = useState<number>(20); // 20% burst
  const [commitSpeed, setCommitSpeed] = useState<number>(500); // Committed Mbps

  // Tab 5: Cost & Overage Estimator
  const [basePrice, setBasePrice] = useState<number>(50); // $50 base cost
  const [includedTraffic, setIncludedTraffic] = useState<number>(10); // 10TB
  const [usedTraffic, setUsedTraffic] = useState<number>(25); // 25TB used
  const [overageRate, setOverageRate] = useState<number>(3); // $3/TB

  const [copied, setCopied] = useState<boolean>(false);

  // --- Calculations ---
  // Tab 1
  const rawSpeedMbps = speedUnit === "Gbps" ? portSpeed * 1000 : portSpeed;
  const realSpeedMbps = rawSpeedMbps * (1 - overhead / 100);
  const realDownloadSpeedGBs = realSpeedMbps / 8 / 1000;
  const realDownloadSpeedMBs = realSpeedMbps / 8;

  const effectiveMbps = rawSpeedMbps * (utilization / 100) * (1 - overhead / 100);
  const totalSecondsTab1 = days * 86400;
  const totalBytesTab1 = (effectiveMbps * 1000000 / 8) * totalSecondsTab1;
  const trafficTB = totalBytesTab1 / (1000 ** 4);
  const trafficTiB = totalBytesTab1 / (1024 ** 4);
  const dailyTB = ((effectiveMbps * 1000000 / 8) * 86400) / (1000 ** 4);

  // Tab 2
  const getTrafficInBits = () => {
    if (trafficUnit === "GB") return targetTraffic * (1000 ** 3) * 8;
    if (trafficUnit === "TB") return targetTraffic * (1000 ** 4) * 8;
    return targetTraffic * (1000 ** 5) * 8;
  };
  const totalSecondsTab2 = (targetDays || 1) * 86400;
  const reqMbps = getTrafficInBits() / totalSecondsTab2 / 1000000;
  const reqGbps = reqMbps / 1000;

  // Tab 3
  const getFileSizeBytes = () => (fileUnit === "TB" ? fileSize * (1000 ** 4) : fileSize * (1000 ** 3));
  const getSpeedInBitsPerSec = () => {
    if (transferSpeedUnit === "Gbps") return transferSpeed * 1000000000;
    if (transferSpeedUnit === "MB/s") return transferSpeed * 8 * 1000000;
    return transferSpeed * 1000000;
  };
  const transferSecs = getSpeedInBitsPerSec() > 0 ? (getFileSizeBytes() * 8) / getSpeedInBitsPerSec() : 0;

  // Tab 4
  const estimated95thMbps = peakSpeed * (1 - burstRatio / 100 * 0.5); 
  const billableSpeedMbps = Math.max(estimated95thMbps, commitSpeed);

  // Tab 5
  const extraTraffic = Math.max(0, usedTraffic - includedTraffic);
  const overageCost = extraTraffic * overageRate;
  const totalMonthlyCost = basePrice + overageCost;

  const formatDuration = (secs: number) => {
    if (secs <= 0) return "0s";
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const parts = [];
    if (d > 0) parts.push(`${d}${language === "zh" ? "天" : "d"}`);
    if (h > 0) parts.push(`${h}${language === "zh" ? "小时" : "h"}`);
    if (m > 0) parts.push(`${m}${language === "zh" ? "分" : "m"}`);
    if (s > 0 || parts.length === 0) parts.push(`${s}${language === "zh" ? "秒" : "s"}`);
    return parts.join(" ");
  };

  const profileText = `====================================
PORT HARDWARE PROFILE
====================================
• Port Speed: ${speedUnit === "Gbps" ? `${portSpeed} Gbps` : `${portSpeed} Mbps`}
• Real Max Download Speed: ~${realDownloadSpeedGBs >= 1 ? `${realDownloadSpeedGBs.toFixed(2)} GB/s` : `${realDownloadSpeedMBs.toFixed(1)} MB/s`} (Excl. ${overhead}% TCP Overhead)
• Max Monthly Traffic (${utilization}% Uncapped): ~${trafficTB.toLocaleString("en-US", { maximumFractionDigits: 0 })} TB / Month (${trafficTiB.toLocaleString("en-US", { maximumFractionDigits: 0 })} TiB)
• Max Daily Throughput Limit: ~${dailyTB.toFixed(1)} TB / Day
====================================`;

  const handleCopyProfile = () => {
    navigator.clipboard.writeText(profileText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-blue-400 hover:text-blue-300 border border-gray-700/80 px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-md"
        >
          <span className="text-base">← 🏠</span>
          <span>{language === "zh" ? "返回工具列表" : "Back to All Tools"}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white mb-2">
          🌐 {language === "zh" ? "企业级网络带宽与流量计算器" : "Enterprise Bandwidth & Traffic Suite"}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          {language === "zh"
            ? "完整的 IaaS 运维工具箱：网络端口评估、反算带宽、传输耗时、95计费及流量超额成本估算。"
            : "Complete IaaS utility: Port profiles, traffic/speed conversions, transfer speed timing, 95th percentile billing, and overage cost calculation."}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-gray-900/80 p-1.5 rounded-xl border border-gray-800 mb-8">
        {[
          { id: "speedToTraffic", name: language === "zh" ? "1. 端口 Profile" : "1. Speed & Profile" },
          { id: "trafficToSpeed", name: language === "zh" ? "2. 流量 ➔ 带宽" : "2. Traffic → Speed" },
          { id: "transferTime", name: language === "zh" ? "3. 传输耗时" : "3. Transfer Time" },
          { id: "billing95", name: language === "zh" ? "4. 95th 计费评估" : "4. 95th Percentile" },
          { id: "cost", name: language === "zh" ? "5. 流量费用超额估算" : "5. Cost & Overage" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[140px] py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab 1 */}
      {activeTab === "speedToTraffic" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  {language === "zh" ? "端口速率 (Port Speed)" : "Port Speed"}
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    value={portSpeed}
                    onChange={(e) => setPortSpeed(Number(e.target.value))}
                    className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg"
                  />
                  <select
                    value={speedUnit}
                    onChange={(e) => setSpeedUnit(e.target.value as "Mbps" | "Gbps")}
                    className="bg-gray-800 text-gray-200 px-4 py-2.5 rounded-xl border border-gray-700 font-semibold text-sm"
                  >
                    <option value="Mbps">Mbps</option>
                    <option value="Gbps">Gbps</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[100, 1000, 10000, 40000, 100000].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        if (s >= 1000) {
                          setPortSpeed(s / 1000);
                          setSpeedUnit("Gbps");
                        } else {
                          setPortSpeed(s);
                          setSpeedUnit("Mbps");
                        }
                      }}
                      className="text-[11px] bg-gray-950 hover:bg-gray-800 text-gray-400 border border-gray-800 px-2.5 py-1 rounded-md font-mono"
                    >
                      {s >= 1000 ? `${s / 1000} Gbps` : `${s} Mbps`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    {language === "zh" ? "利用率 (%)" : "Utilization (%)"}
                  </label>
                  <input
                    type="number"
                    value={utilization}
                    onChange={(e) => setUtilization(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    {language === "zh" ? "TCP Overhead (%)" : "TCP Overhead (%)"}
                  </label>
                  <input
                    type="number"
                    value={overhead}
                    onChange={(e) => setOverhead(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-gradient-to-br from-blue-950/40 via-gray-900 to-gray-900 border border-blue-900/50 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-6">📊 Estimated Network Throughput</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-400">Max Monthly Transfer (TB)</div>
                    <div className="text-3xl font-extrabold text-blue-400 font-mono">
                      ~{trafficTB.toLocaleString("en-US", { maximumFractionDigits: 0 })} TB
                    </div>
                  </div>
                  <div className="border-t border-gray-800 pt-3">
                    <div className="text-xs font-semibold text-gray-400">Binary Capacity (TiB)</div>
                    <div className="text-2xl font-bold text-gray-200 font-mono">
                      ~{trafficTiB.toLocaleString("en-US", { maximumFractionDigits: 0 })} TiB
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">📋 PORT HARDWARE PROFILE</h3>
              <button
                onClick={handleCopyProfile}
                className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg font-semibold"
              >
                {copied ? "✓ Copied!" : "Copy Profile Text"}
              </button>
            </div>
            <pre className="bg-gray-900 border border-gray-800/80 rounded-xl p-4 text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto">
              {profileText}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2 */}
      {activeTab === "trafficToSpeed" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Target Total Traffic</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={targetTraffic}
                  onChange={(e) => setTargetTraffic(Number(e.target.value))}
                  className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg"
                />
                <select
                  value={trafficUnit}
                  onChange={(e) => setTrafficUnit(e.target.value as any)}
                  className="bg-gray-800 text-gray-200 px-4 py-2.5 rounded-xl border border-gray-700 font-semibold"
                >
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                  <option value="PB">PB</option>
                </select>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 bg-gray-900 border border-blue-900/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">⚡ Required Bandwidth (24/7)</h2>
            <div className="text-3xl font-extrabold text-blue-400 font-mono">{reqMbps.toFixed(2)} Mbps</div>
            <div className="text-xl font-bold text-gray-300 font-mono mt-2">{reqGbps.toFixed(3)} Gbps</div>
          </div>
        </div>
      )}

      {/* Tab 3 */}
      {activeTab === "transferTime" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Data Size</label>
              <input
                type="number"
                value={fileSize}
                onChange={(e) => setFileSize(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono"
              />
            </div>
          </div>
          <div className="lg:col-span-6 bg-gray-900 border border-blue-900/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">⏱️ Transfer Time</h2>
            <div className="text-3xl font-extrabold text-blue-400 font-mono">{formatDuration(transferSecs)}</div>
          </div>
        </div>
      )}

      {/* Tab 4: 95th Percentile */}
      {activeTab === "billing95" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Peak Bandwidth (Mbps)</label>
              <input
                type="number"
                value={peakSpeed}
                onChange={(e) => setPeakSpeed(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Commit Rate (Mbps)</label>
              <input
                type="number"
                value={commitSpeed}
                onChange={(e) => setCommitSpeed(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono"
              />
            </div>
          </div>
          <div className="lg:col-span-6 bg-gray-900 border border-blue-900/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">📉 Estimated 95th Percentile Billable Bandwidth</h2>
            <div className="text-3xl font-extrabold text-blue-400 font-mono">{billableSpeedMbps.toFixed(0)} Mbps</div>
            <p className="text-xs text-gray-400 mt-4">Top 5% burst samples dropped per 95th percentile standard.</p>
          </div>
        </div>
      )}

      {/* Tab 5: Cost & Overage */}
      {activeTab === "cost" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Base Monthly Cost ($)</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Overage Rate ($/TB)</label>
                <input
                  type="number"
                  value={overageRate}
                  onChange={(e) => setOverageRate(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Included Traffic (TB)</label>
                <input
                  type="number"
                  value={includedTraffic}
                  onChange={(e) => setIncludedTraffic(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Total Used Traffic (TB)</label>
                <input
                  type="number"
                  value={usedTraffic}
                  onChange={(e) => setUsedTraffic(Number(e.target.value))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono"
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 bg-gray-900 border border-blue-900/50 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-6">💵 Monthly Estimated Total Bill</h2>
              <div className="text-4xl font-extrabold text-emerald-400 font-mono">${totalMonthlyCost.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-2">
                Base Fee: ${basePrice} | Overage ({extraTraffic} TB): ${overageCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
