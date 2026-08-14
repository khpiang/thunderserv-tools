"use client";

import React, { useState } from "react";

export default function RaidCalculator() {
  const [driveType, setDriveType] = useState<"nvme" | "sata">("nvme");
  const [bayCount, setBayCount] = useState<number>(24);
  const [driveSize, setDriveSize] = useState<number>(18);
  const [raidLevel, setRaidLevel] = useState<string>("raid10");

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
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans">
      <header className="border-b border-gray-800 bg-[#111827]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl text-white">⚡</div>
            <span className="font-bold text-xl tracking-wider text-white">ThunderServ <span className="text-blue-500 font-normal text-sm">Tools</span></span>
          </a>
          <a href="/" className="text-xs text-gray-400 hover:text-white transition">← Back to All Tools</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Enterprise RAID & NVMe Storage Calculator</h1>
          <p className="text-gray-400 text-sm mt-1">Calculate raw vs. usable storage, parity overhead, and estimated IOPS performance metrics.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">1. Configuration Parameters</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">Drive Interface</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDriveType("nvme")} className={`py-2 px-4 rounded-lg text-xs font-bold border ${driveType === "nvme" ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-gray-800/50 border-gray-700 text-gray-400"}`}>Enterprise NVMe PCIe 4.0</button>
                <button onClick={() => setDriveType("sata")} className={`py-2 px-4 rounded-lg text-xs font-bold border ${driveType === "sata" ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-gray-800/50 border-gray-700 text-gray-400"}`}>Enterprise SATA / SAS HDD</button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-400">Number of Drive Bays</span>
                <span className="font-bold text-blue-400">{bayCount} Bays</span>
              </div>
              <input type="range" min="2" max="36" step="2" value={bayCount} onChange={(e) => setBayCount(Number(e.target.value))} className="w-full accent-blue-500 bg-gray-800 h-2 rounded-lg cursor-pointer" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">Single Drive Capacity</label>
              <select value={driveSize} onChange={(e) => setDriveSize(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none">
                <option value={1.92}>1.92 TB NVMe</option>
                <option value={3.84}>3.84 TB NVMe</option>
                <option value={7.68}>7.68 TB NVMe</option>
                <option value={15.36}>15.36 TB NVMe</option>
                <option value={12}>12 TB HDD</option>
                <option value={18}>18 TB HDD</option>
                <option value={22}>22 TB HDD</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">RAID / ZFS Array Type</label>
              <select value={raidLevel} onChange={(e) => setRaidLevel(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none">
                <option value="raid0">RAID 0 (Striping)</option>
                <option value="raid1">RAID 1 (Mirroring)</option>
                <option value="raid5">RAID 5 (Single Parity)</option>
                <option value="raid6">RAID 6 / ZFS RAID-Z2 (Dual Parity)</option>
                <option value="raid10">RAID 10 (Striped Mirror)</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">2. Results & Metrics</h2>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Usable Capacity</div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">{results.usableCapacity} TB</div>
                </div>
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Parity Overhead</div>
                  <div className="text-2xl font-extrabold text-amber-500 mt-1">{results.parityCapacity} TB</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Efficiency</span>
                  <span className="font-bold text-white">{results.efficiency}%</span>
                </div>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
                  <div style={{ width: `${results.efficiency}%` }} className="bg-emerald-500 h-full"></div>
                  <div style={{ width: `${100 - Number(results.efficiency)}%` }} className="bg-amber-500/80 h-full"></div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-800 pt-4 grid grid-cols-2 gap-4 text-xs">
                <div><span className="text-gray-400 block">Est. Read IOPS</span><span className="font-bold text-white text-base">~{results.estReadIops}</span></div>
                <div><span className="text-gray-400 block">Est. Write IOPS</span><span className="font-bold text-white text-base">~{results.estWriteIops}</span></div>
              </div>
            </div>

            <button onClick={() => alert("Copied!")} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs py-2.5 rounded-lg font-semibold mt-6">Copy Configuration Summary</button>
          </div>
        </div>
      </main>
    </div>
  );
}

