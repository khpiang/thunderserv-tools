"use client";

import React, { useState } from "react";

// 预设硬盘性能参数 (Read IOPS, Write IOPS, Throughput MB/s)
const DRIVE_PRESETS: Record<string, { label: string; rIops: number; wIops: number; speedMB: number }> = {
  nvme_gen4: { label: "Enterprise Gen4 NVMe SSD (U.2/U.3)", rIops: 800000, wIops: 200000, speedMB: 7000 },
  sata_ssd: { label: "Enterprise SATA SSD", rIops: 95000, wIops: 60000, speedMB: 550 },
  sas_15k: { label: "15K Enterprise SAS HDD", rIops: 210, wIops: 210, speedMB: 250 },
  sata_7k: { label: "7.2K Enterprise SATA HDD", rIops: 80, wIops: 80, speedMB: 200 },
  custom: { label: "Custom Performance", rIops: 100000, wIops: 50000, speedMB: 500 },
};

export default function RaidCalculator() {
  // 基础阵列配置
  const [driveCount, setDriveCount] = useState<number>(8);
  const [driveCapacityTB, setDriveCapacityTB] = useState<number>(3.84);
  const [raidType, setRaidType] = useState<string>("raid10");
  const [drivePrice, setDrivePrice] = useState<number>(350);

  // 高级配置：硬盘性能 & 损耗
  const [presetKey, setPresetKey] = useState<string>("nvme_gen4");
  const [customReadIops, setCustomReadIops] = useState<number>(800000);
  const [customWriteIops, setCustomWriteIops] = useState<number>(200000);
  const [readRatio, setReadRatio] = useState<number>(70); // 70% Read / 30% Write
  const [fsOverhead, setFsOverhead] = useState<number>(5); // 5% 文件系统预留
  const [copied, setCopied] = useState<boolean>(false);

  // 硬盘类型切换处理
  const handlePresetChange = (key: string) => {
    setPresetKey(key);
    if (key !== "custom") {
      setCustomReadIops(DRIVE_PRESETS[key].rIops);
      setCustomWriteIops(DRIVE_PRESETS[key].wIops);
    }
  };

  // 计算容量逻辑
  const calculateCapacity = () => {
    const rawTB = driveCount * driveCapacityTB;
    let usableTB = 0;
    let faultTolerance = "";
    let writePenalty = 1;

    switch (raidType) {
      case "raid0":
        usableTB = rawTB;
        faultTolerance = "0 Drives (No Redundancy)";
        writePenalty = 1;
        break;
      case "raid1":
        usableTB = driveCapacityTB;
        faultTolerance = `${driveCount - 1} Drives`;
        writePenalty = driveCount;
        break;
      case "raid5":
      case "zfs_z1":
        usableTB = (driveCount - 1) * driveCapacityTB;
        faultTolerance = "1 Drive";
        writePenalty = 4;
        break;
      case "raid6":
      case "zfs_z2":
        usableTB = (driveCount - 2) * driveCapacityTB;
        faultTolerance = "2 Drives";
        writePenalty = 6;
        break;
      case "raid10":
      case "zfs_mirror":
        usableTB = (driveCount / 2) * driveCapacityTB;
        faultTolerance = "Up to 1 Drive per mirror pair";
        writePenalty = 2;
        break;
      case "zfs_z3":
        usableTB = (driveCount - 3) * driveCapacityTB;
        faultTolerance = "3 Drives";
        writePenalty = 8;
        break;
      default:
        usableTB = 0;
    }

    if (driveCount < 2) usableTB = 0;

    // 十进制 TB 转 二进制 TiB (Factor: 1000^4 / 1024^4 ≈ 0.909494)
    const rawTiB = rawTB * 0.909494;
    const usableTiB = usableTB * 0.909494;
    const fsUsableTiB = usableTiB * (1 - fsOverhead / 100);

    // 成本计算
    const totalCost = driveCount * drivePrice;
    const costPerUsableTB = usableTB > 0 ? totalCost / usableTB : 0;

    // 性能 IOPS 估算逻辑
    const singleReadIops = presetKey === "custom" ? customReadIops : DRIVE_PRESETS[presetKey].rIops;
    const singleWriteIops = presetKey === "custom" ? customWriteIops : DRIVE_PRESETS[presetKey].wIops;

    const totalRawReadIops = singleReadIops * driveCount;
    const totalRawWriteIops = (singleWriteIops * driveCount) / writePenalty;

    const rFrac = readRatio / 100;
    const wFrac = (100 - readRatio) / 100;
    
    // 混合读写最大 Effective IOPS
    const effectiveIOPS = Math.round(1 / (rFrac / totalRawReadIops + wFrac / totalRawWriteIops));

    return {
      rawTB,
      rawTiB,
      usableTB,
      usableTiB,
      fsUsableTiB,
      faultTolerance,
      totalCost,
      costPerUsableTB,
      effectiveIOPS,
      totalRawReadIops,
      totalRawWriteIops,
    };
  };

  const results = calculateCapacity();

  // 一键复制方案摘要
  const handleCopySummary = () => {
    const summaryText = `====================================
STORAGE SPECIFICATION SUMMARY
====================================
• Hardware: ${driveCount} x ${driveCapacityTB}TB (${DRIVE_PRESETS[presetKey]?.label || "Custom"})
• RAID Config: ${raidType.toUpperCase()} (${results.faultTolerance} Fault Tolerance)
• Raw Capacity: ${results.rawTB.toFixed(2)} TB (${results.rawTiB.toFixed(2)} TiB)
• Usable Capacity: ${results.usableTB.toFixed(2)} TB (${results.usableTiB.toFixed(2)} TiB)
• Net Usable (Excl. ${fsOverhead}% FS Overhead): ${results.fsUsableTiB.toFixed(2)} TiB
------------------------------------
PERFORMANCE & COST ESTIMATION
• Est. Mixed IOPS (${readRatio}% Read / ${100 - readRatio}% Write): ~${results.effectiveIOPS.toLocaleString()} IOPS
• Max Read IOPS: ~${Math.round(results.totalRawReadIops).toLocaleString()} IOPS
• Total Hardware Cost: $${results.totalCost.toLocaleString()} USD
• Cost per Usable TB: $${results.costPerUsableTB.toFixed(2)} USD / TB
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
              Enterprise RAID & NVMe Storage Calculator
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Calculate usable capacities (TB/TiB), ZFS pools, IOPS performance penalty, and cost-per-TB metrics.
            </p>
          </div>
          <button
            onClick={handleCopySummary}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 border border-blue-400/30 shadow-lg shadow-blue-600/20"
          >
            <span>{copied ? "✓ Copied to Clipboard!" : "📋 Copy Architecture Summary"}</span>
          </button>
        </div>

        {/* 顶部主配置区 */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">1. Disk Array & Drive Specifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 硬盘数量 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">Number of Drives</label>
              <input
                type="number"
                min="1"
                max="100"
                value={driveCount}
                onChange={(e) => setDriveCount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* 单盘容量 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">Single Drive Capacity (TB)</label>
              <input
                type="number"
                step="0.01"
                value={driveCapacityTB}
                onChange={(e) => setDriveCapacityTB(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* RAID / ZFS 类型 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">RAID / ZFS Configuration</label>
              <select
                value={raidType}
                onChange={(e) => setRaidType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                <optgroup label="Hardware RAID">
                  <option value="raid0">RAID 0 (Striping)</option>
                  <option value="raid1">RAID 1 (Mirroring)</option>
                  <option value="raid5">RAID 5 (Single Parity)</option>
                  <option value="raid6">RAID 6 (Dual Parity)</option>
                  <option value="raid10">RAID 10 (Striped Mirrors)</option>
                </optgroup>
                <optgroup label="ZFS Software Storage">
                  <option value="zfs_z1">ZFS RAID-Z1 (1-Drive Parity)</option>
                  <option value="zfs_z2">ZFS RAID-Z2 (2-Drive Parity)</option>
                  <option value="zfs_z3">ZFS RAID-Z3 (3-Drive Parity)</option>
                  <option value="zfs_mirror">ZFS Striped Mirrors (ZFS Mirror)</option>
                </optgroup>
              </select>
            </div>

            {/* 单盘价格 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">Single Drive Price ($ USD)</label>
              <input
                type="number"
                value={drivePrice}
                onChange={(e) => setDrivePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 核心数据卡片展示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-1">
            <div className="text-xs text-gray-400">Usable Space (Decimal TB)</div>
            <div className="text-2xl font-black font-mono text-emerald-400">{results.usableTB.toFixed(2)} TB</div>
            <div className="text-xs text-gray-500">Raw: {results.rawTB.toFixed(2)} TB</div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-1">
            <div className="text-xs text-gray-400">OS Recognized Space (Binary TiB)</div>
            <div className="text-2xl font-black font-mono text-blue-400">{results.usableTiB.toFixed(2)} TiB</div>
            <div className="text-xs text-gray-500">Net ({fsOverhead}% FS Loss): <span className="text-gray-300 font-bold">{results.fsUsableTiB.toFixed(2)} TiB</span></div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-1">
            <div className="text-xs text-gray-400">Total Hardware Cost</div>
            <div className="text-2xl font-black font-mono text-amber-400">${results.totalCost.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Cost/Usable TB: <span className="text-amber-300 font-bold">${results.costPerUsableTB.toFixed(2)}</span></div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 space-y-1">
            <div className="text-xs text-gray-400">Fault Tolerance</div>
            <div className="text-base font-bold text-white mt-1">{results.faultTolerance}</div>
            <div className="text-xs text-gray-500">Allowed Drive Failures</div>
          </div>
        </div>

        {/* 高级参数：IOPS & 性能计算模块 */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">2. Drive Performance & Workload IOPS Estimation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">Drive Hardware Profile</label>
              <select
                value={presetKey}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                {Object.entries(DRIVE_PRESETS).map(([key, item]) => (
                  <option key={key} value={key}>{item.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">
                Workload Read / Write Ratio ({readRatio}% Read / {100 - readRatio}% Write)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={readRatio}
                onChange={(e) => setReadRatio(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer mt-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 block">
                Filesystem / Metadata Safety Reserve ({fsOverhead}%)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={fsOverhead}
                onChange={(e) => setFsOverhead(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* 性能推算结果面板 */}
          <div className="pt-4 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
              <div className="text-gray-400 mb-1">Max Mixed IOPS ({readRatio}/{100-readRatio})</div>
              <div className="text-xl font-bold text-emerald-400">~{results.effectiveIOPS.toLocaleString()} IOPS</div>
              <div className="text-[10px] text-gray-500 mt-1">Calculated with RAID Write Penalty</div>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
              <div className="text-gray-400 mb-1">Total Array Max Read IOPS</div>
              <div className="text-xl font-bold text-white">~{Math.round(results.totalRawReadIops).toLocaleString()} IOPS</div>
              <div className="text-[10px] text-gray-500 mt-1">Combined Read Throughput limit</div>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
              <div className="text-gray-400 mb-1">Total Array Max Write IOPS</div>
              <div className="text-xl font-bold text-amber-400">~{Math.round(results.totalRawWriteIops).toLocaleString()} IOPS</div>
              <div className="text-[10px] text-gray-500 mt-1">After RAID Write Penalty</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
