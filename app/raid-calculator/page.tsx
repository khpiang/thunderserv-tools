"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function RaidCalculatorPage() {
  const { language } = useLanguage();

  // Inputs
  const [driveCount, setDriveCount] = useState<number>(8);
  const [driveSize, setDriveSize] = useState<number>(18); // TB
  const [sizeUnit, setSizeUnit] = useState<"TB" | "GB">("TB");
  const [raidType, setRaidType] = useState<"RAID0" | "RAID1" | "RAID5" | "RAID6" | "RAID10" | "RAID50" | "RAID60">("RAID10");
  const [hotSpares, setHotSpares] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Raw drive size in TB
  const sizeInTB = sizeUnit === "GB" ? driveSize / 1000 : driveSize;
  const activeDrives = Math.max(0, driveCount - hotSpares);

  // Calculations
  const calculateRaid = () => {
    if (activeDrives <= 0) return { raw: 0, usableDecimal: 0, usableBinary: 0, faultTolerance: 0, efficiency: 0 };

    const rawTotal = driveCount * sizeInTB;
    let usableTB = 0;
    let maxFault = 0;

    switch (raidType) {
      case "RAID0":
        usableTB = activeDrives * sizeInTB;
        maxFault = 0;
        break;
      case "RAID1":
        usableTB = activeDrives >= 2 ? sizeInTB : 0;
        maxFault = activeDrives - 1;
        break;
      case "RAID5":
        usableTB = activeDrives >= 3 ? (activeDrives - 1) * sizeInTB : 0;
        maxFault = 1;
        break;
      case "RAID6":
        usableTB = activeDrives >= 4 ? (activeDrives - 2) * sizeInTB : 0;
        maxFault = 2;
        break;
      case "RAID10":
        usableTB = activeDrives >= 4 && activeDrives % 2 === 0 ? (activeDrives / 2) * sizeInTB : 0;
        maxFault = activeDrives >= 4 ? Math.floor(activeDrives / 2) : 0;
        break;
      case "RAID50":
        usableTB = activeDrives >= 6 && activeDrives % 2 === 0 ? (activeDrives - 2) * sizeInTB : 0;
        maxFault = 2;
        break;
      case "RAID60":
        usableTB = activeDrives >= 8 && activeDrives % 2 === 0 ? (activeDrives - 4) * sizeInTB : 0;
        maxFault = 4;
        break;
      default:
        usableTB = 0;
    }

    const usableBinary = usableTB * (1000 ** 4 / 1024 ** 4); // Convert TB -> TiB
    const efficiency = rawTotal > 0 ? (usableTB / rawTotal) * 100 : 0;

    return {
      raw: rawTotal,
      usableDecimal: usableTB,
      usableBinary: usableBinary,
      faultTolerance: maxFault,
      efficiency: efficiency,
    };
  };

  const results = calculateRaid();
  const today = new Date().toISOString().split("T")[0];

  const profileText = `===================================================================
                     THUNDERSERV RAID HARDWARE PROFILE
                      https://thunderserv.com
===================================================================
Generated Date  : ${today}
Module          : Enterprise RAID Storage Array Calculator

[ARRAY CONFIGURATION]
-------------------------------------------------------------------
• Disk Count     : ${driveCount} Drives (${hotSpares} Hot Spare)
• Single Capacity: ${driveSize} ${sizeUnit}
• RAID Level     : ${raidType}

[ARRAY PERFORMANCE & CAPACITY]
-------------------------------------------------------------------
• Total Raw Storage    : ${results.raw.toFixed(2)} TB
• Usable Capacity (DEC): ~${results.usableDecimal.toFixed(2)} TB
• Usable Capacity (BIN): ~${results.usableBinary.toFixed(2)} TiB
• Fault Tolerance      : Up to ${results.faultTolerance} Disk Failure(s)
• Storage Efficiency   : ${results.efficiency.toFixed(1)}%

===================================================================
Powered by ThunderServ Infrastructure Solutions | thunderserv.com
===================================================================`;

  const handleCopyProfile = () => {
    navigator.clipboard.writeText(profileText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
      {/* Back Nav */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-blue-400 hover:text-blue-300 border border-gray-700/80 px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-md"
        >
          <span>← 🏠</span>
          <span>{language === "zh" ? "返回工具列表" : "Back to All Tools"}</span>
        </Link>
      </div>

      {/* SINGLE CLEAN HEADER (Fixes duplicate logos) */}
      <div className="mb-8 border-b border-gray-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            💽 {language === "zh" ? "企业级 RAID 阵列容量计算器" : "Enterprise RAID Storage Calculator"}
          </h1>
          <p className="text-gray-400 text-sm">
            {language === "zh"
              ? "计算各 RAID 阵列的可用容量、二进制 TiB 换算、冗余利用率与容错硬盘数。"
              : "Calculate usable storage capacity, binary TiB conversions, fault tolerance, and array efficiency."}
          </p>
        </div>
        <div className="text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
          Branded for <span className="text-blue-400 font-bold">thunderserv.com</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Controls */}
        <div className="lg:col-span-7 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
            🛠️ {language === "zh" ? "阵列硬件配置" : "Hardware Configuration"}
          </h2>

          {/* Drive Count */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              {language === "zh" ? "硬盘数量 (Drives Count)" : "Number of Drives"}
            </label>
            <input
              type="number"
              min={1}
              max={128}
              value={driveCount}
              onChange={(e) => setDriveCount(Math.max(1, Number(e.target.value)))}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {[2, 4, 8, 12, 16, 24].map((c) => (
                <button
                  key={c}
                  onClick={() => setDriveCount(c)}
                  className="text-xs bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800 px-2.5 py-1 rounded-md font-mono"
                >
                  {c} Disks
                </button>
              ))}
            </div>
          </div>

          {/* Drive Size & Unit */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              {language === "zh" ? "单盘容量" : "Single Drive Size"}
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                min={1}
                value={driveSize}
                onChange={(e) => setDriveSize(Math.max(1, Number(e.target.value)))}
                className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg"
              />
              <select
                value={sizeUnit}
                onChange={(e) => setSizeUnit(e.target.value as "TB" | "GB")}
                className="bg-gray-800 text-gray-200 px-4 py-2.5 rounded-xl border border-gray-700 font-bold"
              >
                <option value="TB">TB</option>
                <option value="GB">GB</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {[2, 4, 8, 12, 16, 18, 20, 22].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setDriveSize(s);
                    setSizeUnit("TB");
                  }}
                  className="text-xs bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800 px-2 py-1 rounded-md font-mono"
                >
                  {s} TB
                </button>
              ))}
            </div>
          </div>

          {/* RAID Level */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              {language === "zh" ? "RAID 模式" : "RAID Mode"}
            </label>
            <select
              value={raidType}
              onChange={(e) => setRaidType(e.target.value as any)}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono text-base font-semibold"
            >
              <option value="RAID0">RAID 0 (Performance - No Fault Tolerance)</option>
              <option value="RAID1">RAID 1 (Mirroring - High Redundancy)</option>
              <option value="RAID5">RAID 5 (Single Parity - Min 3 Disks)</option>
              <option value="RAID6">RAID 6 (Dual Parity - Min 4 Disks)</option>
              <option value="RAID10">RAID 10 (Striped Mirror - Min 4 Disks)</option>
              <option value="RAID50">RAID 50 (Dual RAID 5 Groups - Min 6 Disks)</option>
              <option value="RAID60">RAID 60 (Dual RAID 6 Groups - Min 8 Disks)</option>
            </select>
          </div>

          {/* Hot Spares */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              {language === "zh" ? "热备盘数 (Hot Spares)" : "Hot Spare Drives"}
            </label>
            <input
              type="number"
              min={0}
              max={driveCount - 1}
              value={hotSpares}
              onChange={(e) => setHotSpares(Math.min(driveCount - 1, Math.max(0, Number(e.target.value))))}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white font-mono"
            />
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-950/40 via-gray-900 to-gray-900 border border-blue-900/50 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">📊 RAID Results</h2>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                thunderserv.com
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-gray-400">Usable Storage Capacity (Decimal)</div>
                <div className="text-4xl font-black text-white font-mono mt-1">
                  ~{results.usableDecimal.toFixed(2)} <span className="text-xl font-bold text-blue-400">TB</span>
                </div>
                <div className="text-xs font-mono text-gray-400 mt-1">
                  ≈ {results.usableBinary.toFixed(2)} TiB (Binary Operating System)
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-gray-400">Total Raw Space</div>
                  <div className="text-lg font-bold text-gray-200 font-mono">{results.raw.toFixed(2)} TB</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400">Storage Efficiency</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">{results.efficiency.toFixed(1)}%</div>
                </div>
              </div>

              <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4">
                <div className="text-xs font-semibold text-gray-400 mb-1">🛡️ Drive Fault Tolerance</div>
                <div className="text-lg font-bold text-yellow-400 font-mono">
                  Up to {results.faultTolerance} Disk Failure(s)
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Array type: {raidType} ({driveCount - hotSpares} active + {hotSpares} spare)
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyProfile}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition mt-6"
          >
            {copied ? "✓ Copied Profile Text!" : "Copy Branded Profile Text"}
          </button>
        </div>
      </div>

      {/* Export Preview */}
      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">📄 BRANDED EXPORT DATA PREVIEW</h3>
        <pre className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
          {profileText}
        </pre>
      </div>
    </main>
  );
}
