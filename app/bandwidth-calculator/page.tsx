"use client";

import React, { useState } from "react";

// 快捷端口预设 (Gbps)
const PORT_PRESETS = [
  { label: "100 Mbps", value: 0.1 },
  { label: "1 Gbps", value: 1 },
  { label: "10 Gbps", value: 10 },
  { label: "40 Gbps", value: 40 },
  { label: "100 Gbps", value: 100 },
  { label: "400 Gbps", value: 400 },
];

export default function BandwidthCalculator() {
  // 高级全局设置：TCP/IP 协议头预留
  const [tcpOverhead, setTcpOverhead] = useState<number>(3); // 默认扣除 3% 开销
  const [copied, setCopied] = useState<boolean>(false);

  // 1. 端口物理极限推算
  const [portSpeedGbps, setPortSpeedGbps] = useState<number>(10); // 默认 10 Gbps

  // 2. 限制月流量配额换算
  const [monthlyCapTB, setMonthlyCapTB] = useState<number>(300); // 默认 300 TB/月

  // 3. 数据迁移耗时计算
  const [transferSizeTB, setTransferSizeTB] = useState<number>(50); // 默认 50 TB
  const [transferSpeedMbps, setTransferSpeedMbps] = useState<number>(1000); // 默认 1 Gbps (1000 Mbps)

  // --- 核心计算逻辑 ---

  // 1. 端口物理极限与全速流量推算
  const calculatePortProfile = () => {
    const rawMbps = portSpeedGbps * 1000;
    const effectiveMbps = rawMbps * (1 - tcpOverhead / 100);
    const realSpeedMBps = effectiveMbps / 8; // 真实文件下载速度 (MB/s)

    // 全速跑满月流量 (30天 = 2,592,000秒)
    const monthSeconds = 30 * 24 * 3600;
    const maxMonthlyBits = rawMbps * monthSeconds; // Megabits
    const maxMonthlyTB = maxMonthlyBits / (8 * 1000 * 1000); // TB (1000 进制)
    const maxDailyTB = maxMonthlyTB / 30;

    return {
      rawMbps,
      realSpeedMBps,
      maxDailyTB,
      maxMonthlyTB,
    };
  };

  // 2. 月流量配额 ↔ 连续带宽等效计算
  const calculateCapEquivalents = () => {
    // 300 TB = 300 * 8 * 1,000,000 Megabits
    const totalBits = monthlyCapTB * 8 * 1000 * 1000;
    const monthSeconds = 30 * 24 * 3600;
    const avgMbps = totalBits / monthSeconds; // 7x24 平稳连续 Mbps
    const avgMBps = (avgMbps * (1 - tcpOverhead / 100)) / 8; // 平稳下载速率

    // 在端口最高速率 (Port Speed) 下耗尽配额的时间
    const portMbps = portSpeedGbps * 1000;
    const secondsToDeplete = portMbps > 0 ? totalBits / portMbps : 0;
    const hoursToDeplete = secondsToDeplete / 3600;
    const daysToDeplete = hoursToDeplete / 24;

    return {
      avgMbps,
      avgMBps,
      daysToDeplete,
      hoursToDeplete,
    };
  };

  // 3. 数据迁移耗时计算
  const calculateTransferTime = () => {
    const totalBits = transferSizeTB * 8 * 1000 * 1000; // Megabits
    const effectiveMbps = transferSpeedMbps * (1 - tcpOverhead / 100);

    if (effectiveMbps <= 0) return { days: 0, hours: 0, minutes: 0 };

    const totalSeconds = totalBits / effectiveMbps;
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return { days, hours, minutes };
  };

  const portRes = calculatePortProfile();
  const capRes = calculateCapEquivalents();
  const transferRes = calculateTransferTime();

  // 格式化输出 MB/s 或 GB/s
  const formatSpeed = (mbpsVal: number) => {
    if (mbpsVal >= 1000) {
      return `${(mbpsVal / 1000).toFixed(2)} GB/s`;
    }
    return `${mbpsVal.toFixed(1)} MB/s`;
  };

  // 一键复制方案摘要
  const handleCopySummary = () => {
    const portText = portSpeedGbps >= 1 ? `${portSpeedGbps} Gbps` : `${portSpeedGbps * 1000} Mbps`;
    const summaryText = `====================================
NETWORK BANDWIDTH & CAPACITY SUMMARY
====================================
1. PORT HARDWARE PROFILE
• Port Speed: ${portText}
• Real Max Download Speed: ~${formatSpeed(portRes.realSpeedMBps)} (Excl. ${tcpOverhead}% TCP Overhead)
• Max Monthly Traffic (100% Uncapped): ~${portRes.maxMonthlyTB.toLocaleString(undefined, { maximumFractionDigits: 1 })} TB / Month (~${portRes.maxDailyTB.toFixed(1)} TB/Day)

2. DATA CAP EQUIVALENT
• Allocated Monthly Cap: ${monthlyCapTB} TB / Month
• 7x24 Continuous Equivalent Bandwidth: ~${capRes.avgMbps.toFixed(1)} Mbps
• Full-Speed Burnout Duration (@ ${portText}): ~${capRes.daysToDeplete.toFixed(2)} Days (${capRes.hoursToDeplete.toFixed(1)} Hours)

3. DATA MIGRATION ESTIMATE
• Data Volume: ${transferSizeTB} TB
• Allocated Bandwidth: ${transferSpeedMbps} Mbps
• Est. Completion Time: ${transferRes.days}d ${transferRes.hours}h ${transferRes.minutes}m
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
              Network Bandwidth & Capacity Calculator
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Calculate max port throughput, monthly data cap equivalents, and migration transfer time.
            </p>
          </div>
          <button
            onClick={handleCopySummary}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 border border-blue-400/30 shadow-lg shadow-blue-600/20"
          >
            <span>{copied ? "✓ Copied to Clipboard!" : "📋 Copy Bandwidth Summary"}</span>
          </button>
        </div>

        {/* 模块 1：端口带宽能力与物理极限 */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
              1. Port Bandwidth & Uncapped Traffic Limits
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">
                Port Speed Capacity (Gbps)
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

          {/* 模块 1 结果面板 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-1">
              <div className="text-xs text-gray-400">Real Max Download Speed</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                ~{formatSpeed(portRes.realSpeedMBps)}
              </div>
              <div className="text-[11px] text-gray-500">
                Excluding {tcpOverhead}% TCP/IP protocol overhead
              </div>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-1">
              <div className="text-xs text-gray-400">Max Monthly Uncapped Traffic</div>
              <div className="text-2xl font-black font-mono text-blue-400">
                ~{portRes.maxMonthlyTB.toLocaleString(undefined, { maximumFractionDigits: 1 })} TB
              </div>
              <div className="text-[11px] text-gray-500">
                Running 100% full speed for 30 Days (720 hrs)
              </div>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-1">
              <div className="text-xs text-gray-400">Max Daily Throughput Limit</div>
              <div className="text-2xl font-black font-mono text-purple-400">
                ~{portRes.maxDailyTB.toFixed(1)} TB / Day
              </div>
              <div className="text-[11px] text-gray-500">
                Maximum possible data transferred per 24 hours
              </div>
            </div>
          </div>
        </div>

        {/* 模块 2：限制月流量 ↔ 连续带宽换算 */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
            2. Monthly Data Cap ↔ Continuous Bandwidth Equivalent
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">
                Allocated Monthly Data Cap (TB / Month)
              </label>
              <input
                type="number"
                value={monthlyCapTB}
                onChange={(e) => setMonthlyCapTB(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">
                Current Port Speed Context
              </label>
              <div className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-3 text-sm text-gray-300 font-mono">
                {portSpeedGbps >= 1 ? `${portSpeedGbps} Gbps` : `${portSpeedGbps * 1000} Mbps`} Port
              </div>
            </div>
          </div>

          {/* 模块 2 结果面板 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-1">
              <div className="text-xs text-gray-400">7x24 Continuous Bandwidth</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                ~{capRes.avgMbps.toFixed(1)} Mbps
              </div>
              <div className="text-[11px] text-gray-500">
                Flat usage over 30 days (720 hrs)
              </div>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-1">
              <div className="text-xs text-gray-400">Flat Continuous Download Speed</div>
              <div className="text-2xl font-black font-mono text-blue-400">
                ~{capRes.avgMBps.toFixed(1)} MB/s
              </div>
              <div className="text-[11px] text-gray-500">
                Average download speed if spread evenly
              </div>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-1">
              <div className="text-xs text-gray-400">Full-Speed Burnout Duration</div>
              <div className="text-2xl font-black font-mono text-amber-400">
                {capRes.daysToDeplete.toFixed(2)} Days
              </div>
              <div className="text-[11px] text-gray-500">
                Running 100% max speed on {portSpeedGbps >= 1 ? `${portSpeedGbps} Gbps` : `${portSpeedGbps * 1000} Mbps`} (~{capRes.hoursToDeplete.toFixed(1)} hrs)
              </div>
            </div>
          </div>
        </div>

        {/* 模块 3：数据传输与迁移时间计算 */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
            3. Migration & Large File Transfer Time Estimator
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
