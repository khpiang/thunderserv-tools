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

// 快捷月流量预设 (TB)
const CAP_PRESETS = [
  { label: "10 TB", value: 10 },
  { label: "50 TB", value: 50 },
  { label: "100 TB", value: 100 },
  { label: "300 TB", value: 300 },
  { label: "500 TB", value: 500 },
  { label: "1 PB (1000 TB)", value: 1000 },
];

// 快捷迁移数据量预设 (TB)
const MIGRATION_SIZE_PRESETS = [
  { label: "1 TB", value: 1 },
  { label: "10 TB", value: 10 },
  { label: "50 TB", value: 50 },
  { label: "100 TB", value: 100 },
  { label: "500 TB", value: 500 },
];

export default function BandwidthCalculator() {
  // 当前选中的 Tab
  const [activeTab, setActiveTab] = useState<"port" | "cap" | "migration">("port");
  
  // 通用设置
  const [tcpOverhead, setTcpOverhead] = useState<number>(3); // 默认扣除 3% TCP/IP Overhead
  const [copied, setCopied] = useState<boolean>(false);

  // ----------------------------------------------------
  // 模块 1 独立状态：端口极限计算
  // ----------------------------------------------------
  const [portSpeedGbps, setPortSpeedGbps] = useState<number>(10);

  const calculatePortProfile = () => {
    const rawMbps = portSpeedGbps * 1000;
    const effectiveMbps = rawMbps * (1 - tcpOverhead / 100);
    const realSpeedMBps = effectiveMbps / 8; // MB/s

    const monthSeconds = 30 * 24 * 3600;
    const maxMonthlyBits = rawMbps * monthSeconds;
    const maxMonthlyTB = maxMonthlyBits / (8 * 1000 * 1000);
    const maxDailyTB = maxMonthlyTB / 30;

    return { rawMbps, realSpeedMBps, maxDailyTB, maxMonthlyTB };
  };

  // ----------------------------------------------------
  // 模块 2 独立状态：流量配额换算
  // ----------------------------------------------------
  const [monthlyCapTB, setMonthlyCapTB] = useState<number>(300);

  const calculateCapProfile = () => {
    const totalBits = monthlyCapTB * 8 * 1000 * 1000;
    const monthSeconds = 30 * 24 * 3600;
    const avgMbps = totalBits / monthSeconds;
    const avgMBps = (avgMbps * (1 - tcpOverhead / 100)) / 8;

    return { avgMbps, avgMBps };
  };

  // ----------------------------------------------------
  // 模块 3 独立状态：数据迁移耗时
  // ----------------------------------------------------
  const [transferSizeTB, setTransferSizeTB] = useState<number>(50);
  const [transferSpeedMbps, setTransferSpeedMbps] = useState<number>(1000);

  const calculateMigrationProfile = () => {
    const totalBits = transferSizeTB * 8 * 1000 * 1000;
    const effectiveMbps = transferSpeedMbps * (1 - tcpOverhead / 100);

    if (effectiveMbps <= 0) return { days: 0, hours: 0, minutes: 0 };

    const totalSeconds = totalBits / effectiveMbps;
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return { days, hours, minutes };
  };

  const portRes = calculatePortProfile();
  const capRes = calculateCapProfile();
  const migrationRes = calculateMigrationProfile();

  // 格式化输出 MB/s 或 GB/s
  const formatSpeed = (mbpsVal: number) => {
    if (mbpsVal >= 1000) {
      return `${(mbpsVal / 1000).toFixed(2)} GB/s`;
    }
    return `${mbpsVal.toFixed(1)} MB/s`;
  };

  // 一键复制摘要（根据当前 Tab 复制）
  const handleCopySummary = () => {
    let summaryText = "";
    if (activeTab === "port") {
      const portText = portSpeedGbps >= 1 ? `${portSpeedGbps} Gbps` : `${portSpeedGbps * 1000} Mbps`;
      summaryText = `====================================
PORT HARDWARE PROFILE
====================================
• Port Speed: ${portText}
• Real Max Download Speed: ~${formatSpeed(portRes.realSpeedMBps)} (Excl. ${tcpOverhead}% TCP Overhead)
• Max Monthly Traffic (100% Uncapped): ~${portRes.maxMonthlyTB.toLocaleString(undefined, { maximumFractionDigits: 1 })} TB / Month
• Max Daily Throughput Limit: ~${portRes.maxDailyTB.toFixed(1)} TB / Day
====================================`;
    } else if (activeTab === "cap") {
      summaryText = `====================================
MONTHLY DATA CAP EQUIVALENT
====================================
• Monthly Allocation: ${monthlyCapTB} TB / Month
• 7x24 Continuous Equivalent Bandwidth: ~${capRes.avgMbps.toFixed(1)} Mbps
• Flat Continuous Download Speed: ~${capRes.avgMBps.toFixed(1)} MB/s (Excl. ${tcpOverhead}% TCP Overhead)
====================================`;
    } else {
      summaryText = `====================================
DATA MIGRATION ESTIMATE
====================================
• Data Volume: ${transferSizeTB} TB
• Allocated Bandwidth: ${transferSpeedMbps} Mbps
• Est. Completion Time: ${migrationRes.days}d ${migrationRes.hours}h ${migrationRes.minutes}m
====================================`;
    }

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
              Independent calculation tools for port limits, monthly data cap equivalents, and migration time.
            </p>
          </div>
          <button
            onClick={handleCopySummary}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 border border-blue-400/30 shadow-lg shadow-blue-600/20"
          >
            <span>{copied ? "✓ Copied Current Section!" : "📋 Copy Section Summary"}</span>
          </button>
        </div>

        {/* 顶部 Tab 切换 */}
        <div className="flex space-x-2 border-b border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab("port")}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition ${
              activeTab === "port"
                ? "bg-blue-600 text-white font-bold"
                : "bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            1. Port Capacity (端口上限)
          </button>
          <button
            onClick={() => setActiveTab("cap")}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition ${
              activeTab === "cap"
                ? "bg-blue-600 text-white font-bold"
                : "bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            2. Data Cap Equivalent (流量配额)
          </button>
          <button
            onClick={() => setActiveTab("migration")}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition ${
              activeTab === "migration"
                ? "bg-blue-600 text-white font-bold"
                : "bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            3. Migration Time (迁移耗时)
          </button>
        </div>

        {/* =================================================== */}
        {/* TAB 1: 端口性能与跑满流量计算器 */}
        {/* =================================================== */}
        {activeTab === "port" && (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col space-y-3">
              <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                Port Speed Hardware Capability
              </h2>
              {/* 快捷点击 preset */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-400">Presets:</span>
                {PORT_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setPortSpeedGbps(p.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-mono font-medium transition border ${
                      portSpeedGbps === p.value
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 block">
                  Port Speed (Gbps) [Custom Input]
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
                  TCP/IP Protocol Overhead ({tcpOverhead}%)
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

            {/* 结果区域 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
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
                  100% full-speed continuous for 30 Days (720 hrs)
                </div>
              </div>

              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-1">
                <div className="text-xs text-gray-400">Max Daily Throughput Limit</div>
                <div className="text-2xl font-black font-mono text-purple-400">
                  ~{portRes.maxDailyTB.toFixed(1)} TB / Day
                </div>
                <div className="text-[11px] text-gray-500">
                  Maximum possible data per 24 hours
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 2: 月流量配额折算器 */}
        {/* =================================================== */}
        {activeTab === "cap" && (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col space-y-3">
              <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                Monthly Data Cap Converter
              </h2>
              {/* 快捷点击 preset */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-400">Presets:</span>
                {CAP_PRESETS.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setMonthlyCapTB(c.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-mono font-medium transition border ${
                      monthlyCapTB === c.value
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 block">
                  Allocated Monthly Data Cap (TB) [Custom Input]
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
                  TCP/IP Protocol Overhead ({tcpOverhead}%)
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

            {/* 结果区域 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-1">
                <div className="text-xs text-gray-400">7x24 Continuous Bandwidth</div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  ~{capRes.avgMbps.toFixed(1)} Mbps
                </div>
                <div className="text-[11px] text-gray-500">
                  Flat usage spread evenly over 30 days (720 hrs)
                </div>
              </div>

              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-1">
                <div className="text-xs text-gray-400">Flat Continuous Download Speed</div>
                <div className="text-2xl font-black font-mono text-blue-400">
                  ~{capRes.avgMBps.toFixed(1)} MB/s
                </div>
                <div className="text-[11px] text-gray-500">
                  Excluding {tcpOverhead}% TCP/IP protocol overhead
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* TAB 3: 数据迁移耗时估算器 */}
        {/* =================================================== */}
        {activeTab === "migration" && (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col space-y-3">
              <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                Migration & Transfer Time Estimator
              </h2>
              {/* 快捷点击 preset */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-400">Data Presets:</span>
                {MIGRATION_SIZE_PRESETS.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setTransferSizeTB(m.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-mono font-medium transition border ${
                      transferSizeTB === m.value
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 block">
                  Total Data Size (TB) [Custom Input]
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
                  Allocated Bandwidth (Mbps) [Custom Input]
                </label>
                <input
                  type="number"
                  value={transferSpeedMbps}
                  onChange={(e) => setTransferSpeedMbps(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* 结果区域 */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div>
                <div className="text-xs text-gray-400">Estimated Completion Time</div>
                <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                  {migrationRes.days}d {migrationRes.hours}h {migrationRes.minutes}m
                </div>
              </div>
              <div className="text-xs text-gray-500 text-right">
                Assumes stable {transferSpeedMbps} Mbps connection<br />
                Includes {tcpOverhead}% TCP/IP protocol overhead deduction
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
