"use client";

import React, { useState } from "react";

export default function Home() {
  // 默认固定为英文模式 (English First)
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [driveType, setDriveType] = useState<"nvme" | "sata">("nvme");
  const [bayCount, setBayCount] = useState<number>(24);
  const [driveSize, setDriveSize] = useState<number>(18); // TB
  const [raidLevel, setRaidLevel] = useState<string>("raid10");

  // Storage calculation logic
  const calculateStorage = () => {
    const rawCapacity = bayCount * driveSize;
    let usableCapacity = 0;
    let parityCapacity = 0;

    switch (raidLevel) {
      case "raid0":
        usableCapacity = rawCapacity;
        parityCapacity = 0;
        break;
      case "raid1":
        usableCapacity = driveSize;
        parityCapacity = rawCapacity - driveSize;
        break;
      case "raid5":
        usableCapacity = (bayCount - 1) * driveSize;
        parityCapacity = driveSize;
        break;
      case "raid6":
      case "zfs2":
        usableCapacity = (bayCount - 2) * driveSize;
        parityCapacity = 2 * driveSize;
        break;
      case "raid10":
        usableCapacity = (bayCount / 2) * driveSize;
        parityCapacity = (bayCount / 2) * driveSize;
        break;
      default:
        usableCapacity = rawCapacity * 0.5;
        parityCapacity = rawCapacity * 0.5;
    }

    const efficiency = rawCapacity > 0 ? (usableCapacity / rawCapacity) * 100 : 0;
    
    // IOPS Estimation
    const baseIops = driveType === "nvme" ? 50000 : 250;
    const estReadIops = Math.round(bayCount * baseIops);
    const estWriteIops = raidLevel === "raid10" 
      ? Math.round((bayCount * baseIops) / 2) 
      : Math.round((bayCount * baseIops) / 4);

    return {
      rawCapacity: rawCapacity.toFixed(2),
      usableCapacity: usableCapacity.toFixed(2),
      parityCapacity: parityCapacity.toFixed(2),
      efficiency: efficiency.toFixed(1),
      estReadIops: estReadIops.toLocaleString(),
      estWriteIops: estWriteIops.toLocaleString(),
    };
  };

  const results = calculateStorage();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#111827]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/30">
              ⚡
            </div>
            <span className="font-bold text-xl tracking-wider text-white">
              ThunderServ <span className="text-blue-500 font-normal text-sm">Tools</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLang(lang === "en" ? "zh" : "en")}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-700 bg-gray-800/50 hover:border-gray-500 transition text-gray-200"
            >
              {lang === "en" ? "🌐 Switch Language (中文)" : "🌐 Switch Language (English)"}
            </button>
            <a
              href="#contact-section"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-blue-600/20"
            >
              Contact Sales Advisory
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* AdSense Slot */}
        <div className="w-full h-24 bg-gray-900/50 border border-dashed border-gray-800 rounded-xl flex items-center justify-center text-xs text-gray-500">
          [ Advertisement / Sponsor Banner ]
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {lang === "en" 
              ? "Enterprise RAID & NVMe Storage Capacity Calculator" 
              : "企业级 RAID & NVMe 存储阵列容量计算器"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {lang === "en"
              ? "Calculate raw vs. usable storage, parity overhead, and estimated IOPS performance metrics for enterprise bare-metal deployments."
              : "精确计算企业级 Bare-Metal 独服阵列的真实可用容量、冗余开销及 IOPS 性能指标。"}
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Input Panel */}
          <div className="lg:col-span-6 bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">
              {lang === "en" ? "1. Configuration Parameters" : "1. 阵列配置参数"}
            </h2>

            {/* Drive Interface */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">
                {lang === "en" ? "Drive Interface / Media Type" : "硬盘接口类型"}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDriveType("nvme")}
                  className={`py-2 px-4 rounded-lg text-xs font-bold transition border ${
                    driveType === "nvme"
                      ? "bg-blue-600/20 border-blue-500 text-blue-400"
                      : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  Enterprise NVMe PCIe 4.0
                </button>
                <button
                  onClick={() => setDriveType("sata")}
                  className={`py-2 px-4 rounded-lg text-xs font-bold transition border ${
                    driveType === "sata"
                      ? "bg-blue-600/20 border-blue-500 text-blue-400"
                      : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  Enterprise SATA / SAS HDD
                </button>
              </div>
            </div>

            {/* Bay Count */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-400">
                  {lang === "en" ? "Number of Drive Bays" : "硬盘数量 (Bays)"}
                </span>
                <span className="font-bold text-blue-400 text-sm">{bayCount} Bays</span>
              </div>
              <input
                type="range"
                min="2"
                max="36"
                step="2"
                value={bayCount}
                onChange={(e) => setBayCount(Number(e.target.value))}
                className="w-full accent-blue-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Drive Size */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">
                {lang === "en" ? "Single Drive Capacity" : "单盘容量"}
              </label>
              <select
                value={driveSize}
                onChange={(e) => setDriveSize(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value={1.92}>1.92 TB NVMe</option>
                <option value={3.84}>3.84 TB NVMe</option>
                <option value={7.68}>7.68 TB NVMe</option>
                <option value={15.36}>15.36 TB NVMe</option>
                <option value={12}>12 TB HDD</option>
                <option value={18}>18 TB HDD</option>
                <option value={22}>22 TB HDD</option>
              </select>
            </div>

            {/* RAID Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">
                {lang === "en" ? "RAID / ZFS Array Type" : "RAID / ZFS 阵列类型"}
              </label>
              <select
                value={raidLevel}
                onChange={(e) => setRaidLevel(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="raid0">RAID 0 (Striping - Maximum Performance, Zero Fault Tolerance)</option>
                <option value="raid1">RAID 1 (Mirroring - Full Redundancy)</option>
                <option value="raid5">RAID 5 (Single Parity - Balanced)</option>
                <option value="raid6">RAID 6 / ZFS RAID-Z2 (Dual Parity - High Fault Tolerance)</option>
                <option value="raid10">RAID 10 (Striped Mirror - Recommended for Production)</option>
              </select>
            </div>
          </div>

          {/* Right: Results Panel */}
          <div className="lg:col-span-6 bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">
                {lang === "en" ? "2. Array Capacity & Performance" : "2. 计算结果与性能指标"}
              </h2>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">{lang === "en" ? "Usable Capacity" : "实际可用容量"}</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                    {results.usableCapacity} <span className="text-sm text-gray-400 font-normal">TB</span>
                  </div>
                </div>

                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">{lang === "en" ? "Parity Overhead" : "冗余开销"}</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-1">
                    {results.parityCapacity} <span className="text-sm text-gray-400 font-normal">TB</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{lang === "en" ? "Storage Efficiency Rate" : "存储利用率"}</span>
                  <span className="font-bold text-white">{results.efficiency}%</span>
                </div>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${results.efficiency}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                  ></div>
                  <div
                    style={{ width: `${100 - Number(results.efficiency)}%` }}
                    className="bg-amber-500/80 h-full transition-all duration-500"
                  ></div>
                </div>
              </div>

              {/* IOPS */}
              <div className="mt-6 border-t border-gray-800 pt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block">{lang === "en" ? "Est. Read IOPS" : "预估读取 IOPS"}</span>
                  <span className="font-bold text-white text-base">~{results.estReadIops}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">{lang === "en" ? "Est. Write IOPS" : "预估写入 IOPS"}</span>
                  <span className="font-bold text-white text-base">~{results.estWriteIops}</span>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={() => alert(lang === "en" ? "Configuration Summary Copied!" : "配置摘要已复制！")}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs py-2.5 rounded-lg font-semibold transition"
              >
                {lang === "en" ? "Copy Configuration Summary" : "复制当前配置摘要"}
              </button>
            </div>
          </div>
        </div>

        {/* Global Standard Sales Contact Section */}
        <section
          id="contact-section"
          className="bg-gradient-to-br from-blue-900/30 via-gray-900 to-indigo-950/40 border border-blue-500/30 rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden"
        >
          <div className="max-w-3xl space-y-2">
            <span className="bg-blue-600/30 text-blue-400 border border-blue-500/40 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
              Enterprise Infrastructure Advisory
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Need High-Density Bare-Metal or Custom Storage Nodes?
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              We engineer custom bare-metal solutions in US West data centers (Los Angeles & San Jose). Offering high-bay NVMe storage nodes, unmetered 10Gbps connectivity, and dedicated IP allocations.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="https://t.me/thunderserv"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-3 rounded-xl transition flex items-center space-x-2"
            >
              <span>✈️ Telegram Support (@thunderserv)</span>
            </a>
            <a
              href="mailto:admin@thunderserv.com"
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-semibold text-xs px-5 py-3 rounded-xl transition flex items-center space-x-2"
            >
              <span>✉️ Submit Enterprise Inquiry</span>
            </a>
          </div>

          {/* 切换为中文时显示的提示 */}
          {lang === "zh" && (
            <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-300">
              <span>💬 大中华区企业咨询，请直接通过 Telegram 联系 <strong className="text-blue-400">@thunderserv</strong> 或发送邮件至 <strong className="text-blue-400">admin@thunderserv.com</strong>。</span>
            </div>
          )}
        </section>

        {/* Article SEO Section */}
        <article className="prose prose-invert max-w-none bg-[#111827]/50 border border-gray-800 rounded-2xl p-6 sm:p-8 text-sm text-gray-400 space-y-4">
          <h3 className="text-lg font-bold text-white">
            {lang === "en"
              ? "Understanding Storage Efficiency & Parity Overhead in Enterprise Arrays"
              : "企业级存储阵列可用容量与选型指南"}
          </h3>
          <p>
            {lang === "en"
              ? "When deploying high-density enterprise servers (such as 12-Bay or 24-Bay Bare-Metal chassis), calculating usable storage requires accounting for parity overhead, binary vs. decimal unit conversions, and filesystem reservation space."
              : "在部署高密度企业级服务器（如 12 盘位或 24 盘位 Bare-Metal）时，实际可用容量受冗余阵列级别、二进制与十进制换算以及文件系统预留开销的综合影响。"}
          </p>
          <p>
            {lang === "en"
              ? "For write-intensive and high-IOPS database operations, RAID 10 is strongly recommended due to zero parity calculation overhead. For high-capacity backup repositories or cold storage, RAID 6 or ZFS RAID-Z2 provides optimal dual-parity protection against simultaneous drive failures."
              : "对于高并发读写及高 IOPS 需求的数据库业务，强烈推荐 RAID 10；对于大容量备份或冷存储需求，RAID 6 或 ZFS RAID-Z2 可提供优秀的双盘冗余保障。"}
          </p>
        </article>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-8 bg-[#0b0f19] text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 ThunderServ Tools. All rights reserved.</p>
          <div className="flex justify-center space-x-4 text-gray-400">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#contact-section" className="hover:underline">Sales Advisory</a>
          </div>
        </div>
      </footer>
    </div>
  );
}