"use client";

import React, { useState } from "react";

// 快捷端口预设 (Mbps)
const PORT_PRESETS = [
  { label: "100 Mbps", value: 0.1 },
  { label: "1 Gbps", value: 1 },
  { label: "10 Gbps", value: 10 },
  { label: "40 Gbps", value: 40 },
  { label: "100 Gbps", value: 100 },
  { label: "400 Gbps", value: 400 },
];

export default function BandwidthCalculator() {
  // 1. 月流量 ↔ 连续带宽 换算
  const [monthlyTB, setMonthlyTB] = useState<number>(300); // 默认 300 TB/月
  const [portSpeedGbps, setPortSpeedGbps] = useState<number>(10); // 默认 10 Gbps

  // 2. 数据传输耗时计算
  const [transferSizeTB, setTransferSizeTB] = useState<number>(50); // 50 TB 数据
  const [transferSpeedMbps, setTransferSpeedMbps] = useState<number>(1000); // 1 Gbps (1000 Mbps)

  // 3. 高级设置
  const [tcpOverhead, setTcpOverhead] = useState<number>(3); // 3% TCP/IP Overhead
  const [copied, setCopied] = useState<boolean>(false);

  // --- 核心逻辑计算 ---

  // A. 月流量换算为 7x24 连续 Mbps
  const calculateTrafficToBandwidth = () => {
    const totalBits = monthlyTB * 8 * 1000 * 1000; // Megabits (Decimal)
    const monthSeconds = 30 * 24 * 3600;
    const avgMbps = totalBits / monthSeconds;

    // TCP Overhead 调整后的有效下载速度 (MB/s)
    const rawMbps = avgMbps * (1 - tcpOverhead / 100);
    const avgMBps = rawMbps / 8;

    // 全速跑满端口耗尽流量的时间
    const portMbps = portSpeedGbps * 1000;
    const secondsToDeplete = portMbps > 0 ? (monthlyTB * 8 * 1000 * 1000) / portMbps : 0;
    const hoursToDeplete = secondsToDeplete / 3600;
    const daysToDeplete = hoursToDeplete / 24;

    return {
      avgMbps,
      avgMBps,
      daysToDeplete,
      hoursToDeplete,
    };
  };

  // B. 传输耗时计算
  const calculateTransferTime = () => {
    const totalBits = transferSizeTB * 8 * 1000 * 1000; // Megabits
    const effectiveMbps = transferSpeedMbps * (1 - tcpOverhead / 100);
    
    if (effectiveMbps <= 0) return { days: 0, hours: 0, minutes: 0, totalSeconds: 0 };

    const totalSeconds = totalBits / effectiveMbps;
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return { days, hours, minutes, totalSeconds };
  };

  const trafficRes = calculateTrafficToBandwidth();
  const transferRes = calculateTransferTime();

  // 一键复制方案摘要
  const handleCopySummary = () => {
    const summaryText = `====================================
BANDWIDTH & TRAFFIC SPECIFICATION
====================================
• Port Capacity: ${portSpeedGbps >= 1 ? `${portSpeedGbps} Gbps` : `${portSpeedGbps * 1000} Mbps`}
• Monthly Data Allocation: ${monthlyTB} TB / Month
• 7x24 Continuous Equivalent Bandwidth: ~${trafficRes.avgMbps.toFixed(1)} Mbps
• Net Transfer Speed (Excl. ${tcpOverhead}% TCP Overhead): ~${trafficRes.avgMBps.toFixed(1)} MB/s
• Full-Speed Burnout Time (${portSpeedGbps >= 1 ? `${portSpeedGbps} Gbps` : `${portSpeedGbps * 1000} Mbps`} continuous): ~${trafficRes.daysToDeplete.toFixed(2)} Days (${trafficRes.hoursToDeplete.toFixed(1)} Hours)
------------------------------------
DATA TRANSFER TIME ESTIMATE
• Data Volume: ${transferSizeTB} TB
• Allocated Bandwidth: ${transferSpeedMbps} Mbps
• Est. Time to Complete: ${transferRes.days}d ${transferRes.hours}h ${transferRes.minutes}m
====================================`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans">
      {/* 统一 Header */}
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Network Bandwidth & Traffic Calculator
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Convert monthly data caps (TB) to continuous Mbps, estimate port burnout duration, and calculate migration transfer time.
            </p>
          </div>
          <button
            onClick={handleCopySummary}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 border border-blue-400/30 shadow-lg shadow-blue-600/20"
          >
            <span>{copied ? "✓ Copied to Clipboard!" : "📋 Copy Bandwidth Summary"}</span>
          </button>
        </div>

        {/* 模块 1：月流量 ↔ 连续带宽等效转换 */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
              1. Monthly Data Cap ↔ Continuous Bandwidth Equivalent
            </h2>

            {/* 常用端口快捷选择按钮组 */}
            <div className="flex flex-wrap gap-1.5">
              {PORT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPortSpeedGbps(p.value)}
                  className={`text-xs px-2.5 py-1 rounded-md font-mono font-medium transition border ${
                    portSpeedGbps === p.value
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">
                Monthly Data Cap (TB / Month)
              </label>
              <input
                type="number"
                value={monthlyTB}
                onChange={(e) => setMonthlyTB(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">
                Port Speed (Gbps)
              </label>
              <input
                type="number"
                step="0.001"
                value={portSpeedGbps}
                onChange={(e) => setPortSpeedGbps(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">
                TCP/IP Protocol Overhead Reserve ({tcpOverhead}%)
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={tcpOverhead}
                onChange={(e) => setTcpOverhead(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* 模块 1 结果展示卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-1">
              <div className="text-xs text-gray-400">7x24 Continuous Bandwidth</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                ~{trafficRes.avgMbps.toFixed(1)} Mbps
              </div>
              <div className="text-[11px] text-gray-500">
                Based on 30 days (720 hrs) flat usage
              </div>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-1">
              <div className="text-xs text-gray-400">Real Download Throughput</div>
              <div className="text-2xl font-black font-mono text-blue-400">
                ~{trafficRes.avgMBps.toFixed(1)} MB/s
              </div>
              <div className="text-[11px] text-gray-500">
                Excluding {tcpOverhead}% TCP/IP overhead
              </div>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-1 sm:col-span-2 lg:col-span-1">
              <div className="text-xs text-gray-400">Full Speed Burnout Duration</div>
              <div className="text-2xl font-black font-mono text-amber-400">
                {trafficRes.daysToDeplete.toFixed(2)} Days
              </div>
              <div className="text-[11px] text-gray-500">
                Running 100% max speed on a {portSpeedGbps >= 1 ? `${portSpeedGbps} Gbps` : `${portSpeedGbps * 1000} Mbps`} link (~{trafficRes.hoursToDeplete.toFixed(1)} hrs)
              </div>
            </div>
          </div>
        </div>

        {/* 模块 2：数据传输与迁移时间计算 */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
            2. Migration & Large File Transfer Time Estimator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">
                Total Data Size to Transfer (TB)
              </label>
              <input
                type="number"
                value={transferSizeTB}
                onChange={(e) => setTransferSizeTB(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">
                Allocated Speed / Bandwidth Limit (Mbps)
              </label>
              <input
                type="number"
                value={transferSpeedMbps}
                onChange={(e) => setTransferSpeedMbps(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-gray-400">Estimated Transfer Completion Time</div>
              <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                {transferRes.days}d {transferRes.hours}h {transferRes.minutes}m
              </div>
            </div>
            <div className="text-xs text-gray-500 text-right">
              Assumes stable {transferSpeedMbps} Mbps connection<br />
              Includes {tcpOverhead}% TCP/IP protocol overhead deduction
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
