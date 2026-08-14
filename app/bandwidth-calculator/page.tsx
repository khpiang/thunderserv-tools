"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function BandwidthCalculatorPage() {
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    "trafficToSpeed" | "speedToTraffic" | "transferTime" | "billing95" | "cost"
  >("trafficToSpeed");

  // ==========================================
  // STATE: Traffic to Speed Module
  // ==========================================
  const [targetTraffic, setTargetTraffic] = useState<number>(100);
  const [trafficUnit, setTrafficUnit] = useState<"GB" | "TB" | "PB">("TB");
  const [calcBase, setCalcBase] = useState<1000 | 1024>(1000); // 1000=Decimal, 1024=Binary

  // Time & Window Constraints
  const [days, setDays] = useState<number>(30);
  const [hoursPerDay, setHoursPerDay] = useState<number>(24);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(7);

  // Network Adjustments
  const [burstFactor, setBurstFactor] = useState<number>(1.5); // 1.5x peak
  const [tcpOverhead, setTcpOverhead] = useState<number>(3); // 3%
  const [targetUtil, setTargetUtil] = useState<number>(80); // 80% safe threshold

  const [copied, setCopied] = useState<boolean>(false);

  // ==========================================
  // CALCULATIONS: Traffic to Speed
  // ==========================================
  // 1. Convert total traffic to Bits
  const getTrafficInBits = () => {
    const base = calcBase;
    let multiplier = 1;
    if (trafficUnit === "GB") multiplier = base ** 3;
    if (trafficUnit === "TB") multiplier = base ** 4;
    if (trafficUnit === "PB") multiplier = base ** 5;
    return targetTraffic * multiplier * 8;
  };

  // 2. Calculate Effective Total Transfer Seconds
  const totalWeeks = days / 7;
  const activeDaysPerWeek = Math.min(daysPerWeek, 7);
  const totalActiveDays = totalWeeks * activeDaysPerWeek;
  const totalActiveHours = totalActiveDays * Math.min(hoursPerDay, 24);
  const totalActiveSeconds = totalActiveHours * 3600;

  // 3. Raw & Adjusted Bandwidth
  const rawBitsPerSec = totalActiveSeconds > 0 ? getTrafficInBits() / totalActiveSeconds : 0;
  const bitsPerSecWithOverhead = rawBitsPerSec / (1 - tcpOverhead / 100);

  // Speed outputs
  const avgMbps = bitsPerSecWithOverhead / 1000000;
  const avgGbps = avgMbps / 1000;
  const avgMBs = avgMbps / 8;

  // Peak outputs
  const peakMbps = avgMbps * burstFactor;
  const peakGbps = peakMbps / 1000;
  const peakMBs = peakMbps / 8;

  // Recommended Port Size considering target utilization (e.g., 80%)
  const recommendedBandwidthMbps = peakMbps / (targetUtil / 100);
  const getRecommendedPort = (mbps: number) => {
    if (mbps <= 100) return "100 Mbps Fast Ethernet";
    if (mbps <= 1000) return "1 Gbps Uplink Port";
    if (mbps <= 10000) return "10 Gbps SFP+ Port";
    if (mbps <= 25000) return "25 Gbps SFP28 Port";
    if (mbps <= 40000) return "40 Gbps QSFP+ Port";
    if (mbps <= 100000) return "100 Gbps QSFP28 Port";
    return `${(mbps / 1000).toFixed(0)} Gbps Dedicated Cluster`;
  };

  // ==========================================
  // EXPORT PROFILE TEXT (Branded)
  // ==========================================
  const generateExportText = () => {
    const today = new Date().toISOString().split("T")[0];
    return `===================================================================
                     THUNDERSERV NETWORK PROFILE
                      https://thunderserv.com
===================================================================
Generated Date : ${today}
Module         : Traffic to Required Bandwidth Analysis

[INPUT CONFIGURATION]
-------------------------------------------------------------------
• Total Traffic       : ${targetTraffic} ${trafficUnit} (${calcBase === 1000 ? "Decimal / 1000" : "Binary / 1024"})
• Time Duration       : ${days} Days (${hoursPerDay} Hours/Day, ${daysPerWeek} Days/Week)
• Peak Burst Factor   : ${burstFactor}x
• TCP Overhead        : ${tcpOverhead}%
• Target Utilization  : ${targetUtil}% (Safety Threshold)

[BANDWIDTH ANALYSIS & RECOMMENDATIONS]
-------------------------------------------------------------------
• Average Required Speed : ${avgMbps.toFixed(2)} Mbps (${avgMBs >= 1000 ? `${(avgMBs / 1000).toFixed(2)} GB/s` : `${avgMBs.toFixed(2)} MB/s`})
• Estimated Peak Speed   : ${peakMbps.toFixed(2)} Mbps (${peakMBs >= 1000 ? `${(peakMBs / 1000).toFixed(2)} GB/s` : `${peakMBs.toFixed(2)} MB/s`})
• Recommended Port Size  : ${getRecommendedPort(recommendedBandwidthMbps)}
• Rec. Provisioned Bandwidth: ~${recommendedBandwidthMbps.toFixed(0)} Mbps

===================================================================
Powered by ThunderServ Infrastructure Solutions | thunderserv.com
===================================================================`;
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(generateExportText());
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

      {/* Header */}
      <div className="mb-8 border-b border-gray-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            🌐 {language === "zh" ? "企业级网络带宽与流量计算器" : "Enterprise Bandwidth & Traffic Suite"}
          </h1>
          <p className="text-gray-400 text-sm">
            {language === "zh"
              ? "精确评估传输反算、端口需求、95计费及流量成本方案。"
              : "Enterprise IaaS utility for traffic conversions, port requirements, and billing analysis."}
          </p>
        </div>
        <div className="text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
          Branded for <span className="text-blue-400 font-bold">thunderserv.com</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-gray-900/80 p-1.5 rounded-xl border border-gray-800 mb-8">
        {[
          { id: "trafficToSpeed", name: language === "zh" ? "1. 流量 ➔ 带宽评估" : "1. Traffic → Speed" },
          { id: "speedToTraffic", name: language === "zh" ? "2. 端口 Profile" : "2. Speed & Profile" },
          { id: "transferTime", name: language === "zh" ? "3. 传输耗时" : "3. Transfer Time" },
          { id: "billing95", name: language === "zh" ? "4. 95th 计费评估" : "4. 95th Percentile" },
          { id: "cost", name: language === "zh" ? "5. 流量费用成本" : "5. Cost Estimator" },
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

      {/* MODULE 1: TRAFFIC TO SPEED */}
      {activeTab === "trafficToSpeed" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Form Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Box 1: Traffic & Base */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <span>1️⃣</span> {language === "zh" ? "目标流量与进制设定" : "Target Traffic & Standards"}
                </h2>

                <div className="flex gap-2">
                  <input
                    type="number"
                    value={targetTraffic}
                    onChange={(e) => setTargetTraffic(Math.max(0, Number(e.target.value)))}
                    className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-xl focus:border-blue-500 focus:outline-none"
                  />
                  <select
                    value={trafficUnit}
                    onChange={(e) => setTrafficUnit(e.target.value as any)}
                    className="bg-gray-800 text-gray-200 px-4 py-2.5 rounded-xl border border-gray-700 font-bold text-sm"
                  >
                    <option value="GB">GB</option>
                    <option value="TB">TB</option>
                    <option value="PB">PB</option>
                  </select>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-gray-500">{language === "zh" ? "快捷填入:" : "Presets:"}</span>
                  {[10, 50, 100, 500, 1000].map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        setTargetTraffic(v);
                        setTrafficUnit("TB");
                      }}
                      className="text-xs bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800 px-2.5 py-1 rounded-lg font-mono transition"
                    >
                      {v} TB
                    </button>
                  ))}
                </div>

                {/* Standard Base */}
                <div className="flex items-center justify-between border-t border-gray-800/80 pt-3">
                  <span className="text-xs font-semibold text-gray-400">
                    {language === "zh" ? "计算进制标准" : "Calculation Standard"}
                  </span>
                  <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
                    <button
                      onClick={() => setCalcBase(1000)}
                      className={`px-3 py-1 text-xs rounded-md font-semibold transition ${
                        calcBase === 1000 ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Decimal (1000)
                    </button>
                    <button
                      onClick={() => setCalcBase(1024)}
                      className={`px-3 py-1 text-xs rounded-md font-semibold transition ${
                        calcBase === 1024 ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Binary (1024)
                    </button>
                  </div>
                </div>
              </div>

              {/* Box 2: Time Windows */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <span>2️⃣</span> {language === "zh" ? "传输时间窗口约束" : "Transfer Time Window"}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                      {language === "zh" ? "总天数 (Days)" : "Total Days"}
                    </label>
                    <input
                      type="number"
                      value={days}
                      onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                      {language === "zh" ? "每日小时数 (Hours/Day)" : "Hours per Day"}
                    </label>
                    <input
                      type="number"
                      max={24}
                      min={1}
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(Math.min(24, Math.max(1, Number(e.target.value))))}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                      {language === "zh" ? "每周运行天数" : "Days per Week"}
                    </label>
                    <input
                      type="number"
                      max={7}
                      min={1}
                      value={daysPerWeek}
                      onChange={(e) => setDaysPerWeek(Math.min(7, Math.max(1, Number(e.target.value))))}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Window Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => {
                      setHoursPerDay(24);
                      setDaysPerWeek(7);
                    }}
                    className="text-xs bg-gray-950 hover:bg-gray-800 text-blue-300 border border-gray-800 px-3 py-1.5 rounded-lg"
                  >
                    24/7 {language === "zh" ? "全天连续传输" : "Full Continuous"}
                  </button>
                  <button
                    onClick={() => {
                      setHoursPerDay(6);
                      setDaysPerWeek(7);
                    }}
                    className="text-xs bg-gray-950 hover:bg-gray-800 text-blue-300 border border-gray-800 px-3 py-1.5 rounded-lg"
                  >
                    🌙 {language === "zh" ? "夜间备份 (6h/天)" : "Nightly Backup (6h/day)"}
                  </button>
                  <button
                    onClick={() => {
                      setHoursPerDay(8);
                      setDaysPerWeek(5);
                    }}
                    className="text-xs bg-gray-950 hover:bg-gray-800 text-blue-300 border border-gray-800 px-3 py-1.5 rounded-lg"
                  >
                    🏢 {language === "zh" ? "工作日窗口 (5天/8h)" : "Business Hours (5d/8h)"}
                  </button>
                </div>
              </div>

              {/* Box 3: Network Factor */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <span>3️⃣</span> {language === "zh" ? "网络开销与峰值冗余" : "Network Factors & Overhead"}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                      {language === "zh" ? "峰值波谷系数 (Peak Ratio)" : "Peak Burst Factor"}
                    </label>
                    <select
                      value={burstFactor}
                      onChange={(e) => setBurstFactor(Number(e.target.value))}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-semibold text-sm"
                    >
                      <option value={1.0}>1.0x ({language === "zh" ? "绝对匀速" : "Flat Continuous"})</option>
                      <option value={1.3}>1.3x ({language === "zh" ? "小幅波动" : "Mild Burst"})</option>
                      <option value={1.5}>1.5x ({language === "zh" ? "标准企业级推荐" : "Recommended Enterprise"})</option>
                      <option value={2.0}>2.0x ({language === "zh" ? "高突发业务" : "High Burst"})</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                      {language === "zh" ? "TCP 报头损耗 (%)" : "TCP Overhead (%)"}
                    </label>
                    <input
                      type="number"
                      value={tcpOverhead}
                      onChange={(e) => setTcpOverhead(Number(e.target.value))}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                      {language === "zh" ? "安全水位线 (%)" : "Safety Utilization (%)"}
                    </label>
                    <input
                      type="number"
                      value={targetUtil}
                      onChange={(e) => setTargetUtil(Number(e.target.value))}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Output Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-gradient-to-br from-blue-950/50 via-gray-900 to-gray-900 border border-blue-800/60 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Calculated Results</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                      thunderserv.com
                    </span>
                  </div>

                  {/* Average Bandwidth */}
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-gray-400 mb-1">
                      {language === "zh" ? "平均所需带宽 (Average Continuous)" : "Average Required Bandwidth"}
                    </div>
                    <div className="text-4xl font-black text-white font-mono tracking-tight">
                      {avgMbps.toFixed(2)} <span className="text-xl font-bold text-blue-400">Mbps</span>
                    </div>
                    <div className="text-xs font-mono text-gray-400 mt-1">
                      ≈ {avgGbps.toFixed(3)} Gbps | {avgMBs >= 1000 ? `${(avgMBs / 1000).toFixed(2)} GB/s` : `${avgMBs.toFixed(2)} MB/s`}
                    </div>
                  </div>

                  {/* Peak Bandwidth */}
                  <div className="border-t border-gray-800 pt-4 mb-6">
                    <div className="text-xs font-semibold text-gray-400 mb-1">
                      {language === "zh" ? "预估高峰突发带宽 (Estimated Peak)" : "Estimated Peak Speed"} ({burstFactor}x)
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 font-mono">
                      {peakMbps.toFixed(2)} Mbps
                    </div>
                    <div className="text-xs font-mono text-gray-400 mt-0.5">
                      ≈ {peakGbps.toFixed(3)} Gbps | {peakMBs >= 1000 ? `${(peakMBs / 1000).toFixed(2)} GB/s` : `${peakMBs.toFixed(2)} MB/s`}
                    </div>
                  </div>

                  {/* Recommended Physical Port */}
                  <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-400 mb-1">
                      💡 {language === "zh" ? "建议采购硬件端口 (Recommended Uplink)" : "Recommended Port Size"}
                    </div>
                    <div className="text-lg font-bold text-yellow-400 font-mono">
                      {getRecommendedPort(recommendedBandwidthMbps)}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      {language === "zh"
                        ? `(基于 ${targetUtil}% 最佳安全水位预留配额: ~${recommendedBandwidthMbps.toFixed(0)} Mbps)`
                        : `(Based on ${targetUtil}% safe threshold provision: ~${recommendedBandwidthMbps.toFixed(0)} Mbps)`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCopyExport}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 text-sm"
                >
                  <span>📋</span>
                  <span>{copied ? "✓ Copied Profile to Clipboard!" : "Copy Branded Profile Text"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Export / Preview Block */}
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span>📄</span> BRANDED EXPORT DATA PREVIEW
              </h3>
              <span className="text-xs font-mono text-blue-400">thunderserv.com</span>
            </div>
            <pre className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
              {generateExportText()}
            </pre>
          </div>
        </div>
      )}

      {/* Placeholders for other tabs */}
      {activeTab !== "trafficToSpeed" && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
          <p className="text-base font-semibold">{language === "zh" ? "切换至其它计算模块..." : "Switching to module..."}</p>
        </div>
      )}
    </main>
  );
}
