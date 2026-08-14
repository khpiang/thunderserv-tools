"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function BandwidthCalculatorPage() {
  const { t, language } = useLanguage();

  // Mode: 1 = Speed to Traffic, 2 = Traffic to Speed, 3 = Transfer Time
  const [activeTab, setActiveTab] = useState<"speedToTraffic" | "trafficToSpeed" | "transferTime">("speedToTraffic");

  // Tab 1: Speed -> Traffic
  const [portSpeed, setPortSpeed] = useState<number>(1000);
  const [speedUnit, setSpeedUnit] = useState<"Mbps" | "Gbps">("Mbps");
  const [utilization, setUtilization] = useState<number>(100);
  const [days, setDays] = useState<number>(30);

  // Tab 2: Traffic -> Required Speed
  const [targetTraffic, setTargetTraffic] = useState<number>(100);
  const [trafficUnit, setTrafficUnit] = useState<"GB" | "TB" | "PB">("TB");
  const [targetDays, setTargetDays] = useState<number>(30);

  // Tab 3: File Transfer Time
  const [fileSize, setFileSize] = useState<number>(500);
  const [fileUnit, setFileUnit] = useState<"GB" | "TB">("GB");
  const [transferSpeed, setTransferSpeed] = useState<number>(100);
  const [transferSpeedUnit, setTransferSpeedUnit] = useState<"Mbps" | "Gbps" | "MB/s">("Mbps");

  // Calculations for Tab 1
  const speedInMbps = speedUnit === "Gbps" ? portSpeed * 1000 : portSpeed;
  const effectiveMbps = speedInMbps * (utilization / 100);
  const totalSecondsTab1 = days * 86400;
  const totalBytesTab1 = (effectiveMbps * 1000000 / 8) * totalSecondsTab1;
  const trafficTB = totalBytesTab1 / (1000 ** 4);
  const trafficTiB = totalBytesTab1 / (1024 ** 4);
  const trafficGB = totalBytesTab1 / (1000 ** 3);

  // Calculations for Tab 2
  const getTrafficInBits = () => {
    if (trafficUnit === "GB") return targetTraffic * (1000 ** 3) * 8;
    if (trafficUnit === "TB") return targetTraffic * (1000 ** 4) * 8;
    return targetTraffic * (1000 ** 5) * 8;
  };
  const totalSecondsTab2 = (targetDays || 1) * 86400;
  const reqMbps = getTrafficInBits() / totalSecondsTab2 / 1000000;
  const reqGbps = reqMbps / 1000;

  // Calculations for Tab 3
  const getFileSizeBytes = () => {
    return fileUnit === "TB" ? fileSize * (1000 ** 4) : fileSize * (1000 ** 3);
  };
  const getSpeedInBitsPerSec = () => {
    if (transferSpeedUnit === "Gbps") return transferSpeed * 1000000000;
    if (transferSpeedUnit === "MB/s") return transferSpeed * 8 * 1000000;
    return transferSpeed * 1000000;
  };
  const transferSecs = getSpeedInBitsPerSec() > 0 ? (getFileSizeBytes() * 8) / getSpeedInBitsPerSec() : 0;

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

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
      {/* 返回首页主按钮 */}
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
          🌐 {language === "zh" ? "网络带宽与流量计算器" : "Network Bandwidth & Traffic Calculator"}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          {language === "zh" 
            ? "提供端口速率换算、月度流量估算、反算所需带宽及大文件传输耗时计算。" 
            : "Convert port speeds, estimate monthly data transfers, calculate required bandwidth, and predict file transfer times."}
        </p>
      </div>

      {/* 功能选项卡切换 */}
      <div className="flex flex-wrap gap-2 bg-gray-900/80 p-1.5 rounded-xl border border-gray-800 mb-8 max-w-3xl">
        <button
          onClick={() => setActiveTab("speedToTraffic")}
          className={`flex-1 min-w-[180px] py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-lg transition ${
            activeTab === "speedToTraffic"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {language === "zh" ? "1. 带宽 ➔ 总流量" : "1. Speed → Data Volume"}
        </button>
        <button
          onClick={() => setActiveTab("trafficToSpeed")}
          className={`flex-1 min-w-[180px] py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-lg transition ${
            activeTab === "trafficToSpeed"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {language === "zh" ? "2. 流量 ➔ 所需带宽" : "2. Data Volume → Speed"}
        </button>
        <button
          onClick={() => setActiveTab("transferTime")}
          className={`flex-1 min-w-[180px] py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-lg transition ${
            activeTab === "transferTime"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {language === "zh" ? "3. 传输耗时计算" : "3. Transfer Time Calculator"}
        </button>
      </div>

      {/* Tab 1: 带宽算流量 */}
      {activeTab === "speedToTraffic" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {language === "zh" ? "端口速率 / 网络带宽" : "Port Speed / Bandwidth"}
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  value={portSpeed}
                  onChange={(e) => setPortSpeed(Number(e.target.value))}
                  className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono text-lg"
                />
                <select
                  value={speedUnit}
                  onChange={(e) => setSpeedUnit(e.target.value as "Mbps" | "Gbps")}
                  className="bg-gray-800 text-gray-200 px-4 py-2.5 rounded-xl border border-gray-700 font-semibold text-sm focus:outline-none"
                >
                  <option value="Mbps">Mbps</option>
                  <option value="Gbps">Gbps</option>
                </select>
              </div>

              {/* 快捷预设按钮 */}
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
                    className="text-[11px] bg-gray-950 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 px-2.5 py-1 rounded-md transition font-mono"
                  >
                    {s >= 1000 ? `${s / 1000}Gbps` : `${s}Mbps`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {language === "zh" ? "平均带宽利用率 (%)" : "Average Bandwidth Utilization (%)"}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={utilization}
                onChange={(e) => setUtilization(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {language === "zh" ? "计算时间 (天)" : "Duration (Days)"}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 7, 30, 365].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      days === d
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    {d} {language === "zh" ? "天" : "Days"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-br from-blue-950/40 via-gray-900 to-gray-900 border border-blue-900/50 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span>📊</span> {language === "zh" ? "计算结果（预估数据传输量）" : "Estimated Data Transferred"}
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Standard (Decimal TB)
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono">
                    {trafficTB >= 1000 ? (trafficTB / 1000).toFixed(2) : trafficTB.toFixed(2)}{" "}
                    <span className="text-xl text-blue-300">{trafficTB >= 1000 ? "PB" : "TB"}</span>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Binary Standard (TiB)
                  </div>
                  <div className="text-2xl font-bold text-gray-200 font-mono">
                    {trafficTiB.toFixed(2)} <span className="text-base text-gray-400">TiB</span>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Gigabytes (GB)
                  </div>
                  <div className="text-xl font-bold text-gray-300 font-mono">
                    {trafficGB.toLocaleString("en-US", { maximumFractionDigits: 0 })} <span className="text-sm text-gray-400">GB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-xs text-gray-500 border-t border-gray-800/80 pt-4">
              Calculated using: {effectiveMbps} Mbps effective speed @ {utilization}% duty cycle over {days} days.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 流量算所需带宽 */}
      {activeTab === "trafficToSpeed" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {language === "zh" ? "目标消耗总流量" : "Target Total Data Volume"}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={targetTraffic}
                  onChange={(e) => setTargetTraffic(Number(e.target.value))}
                  className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono text-lg"
                />
                <select
                  value={trafficUnit}
                  onChange={(e) => setTrafficUnit(e.target.value as "GB" | "TB" | "PB")}
                  className="bg-gray-800 text-gray-200 px-4 py-2.5 rounded-xl border border-gray-700 font-semibold text-sm focus:outline-none"
                >
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                  <option value="PB">PB</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {language === "zh" ? "跑完流量所需天数" : "Time Period (Days)"}
              </label>
              <input
                type="number"
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-br from-blue-950/40 via-gray-900 to-gray-900 border border-blue-900/50 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span>⚡</span> {language === "zh" ? "计算结果（24/7 恒定所需带宽）" : "Required Continuous Bandwidth"}
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Megabits Per Second (Mbps)
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono">
                    {reqMbps.toFixed(2)} <span className="text-xl text-blue-300">Mbps</span>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Gigabits Per Second (Gbps)
                  </div>
                  <div className="text-2xl font-bold text-gray-200 font-mono">
                    {reqGbps.toFixed(3)} <span className="text-base text-gray-400">Gbps</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-xs text-gray-500 border-t border-gray-800/80 pt-4">
              Required rate for 24/7 continuous non-stop transfer over {targetDays} day(s).
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 传输耗时计算器 */}
      {activeTab === "transferTime" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {language === "zh" ? "文件 / 数据包大小" : "File / Package Size"}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={fileSize}
                  onChange={(e) => setFileSize(Number(e.target.value))}
                  className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono text-lg"
                />
                <select
                  value={fileUnit}
                  onChange={(e) => setFileUnit(e.target.value as "GB" | "TB")}
                  className="bg-gray-800 text-gray-200 px-4 py-2.5 rounded-xl border border-gray-700 font-semibold text-sm focus:outline-none"
                >
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {language === "zh" ? "传输速度 / 下载网络速率" : "Transfer / Download Speed"}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={transferSpeed}
                  onChange={(e) => setTransferSpeed(Number(e.target.value))}
                  className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono text-lg"
                />
                <select
                  value={transferSpeedUnit}
                  onChange={(e) => setTransferSpeedUnit(e.target.value as "Mbps" | "Gbps" | "MB/s")}
                  className="bg-gray-800 text-gray-200 px-3 py-2.5 rounded-xl border border-gray-700 font-semibold text-sm focus:outline-none"
                >
                  <option value="Mbps">Mbps (b=bit)</option>
                  <option value="MB/s">MB/s (B=Byte)</option>
                  <option value="Gbps">Gbps</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-br from-blue-950/40 via-gray-900 to-gray-900 border border-blue-900/50 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span>⏱️</span> {language === "zh" ? "预估完成时间" : "Estimated Completion Time"}
              </h2>

              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono mb-2">
                {formatDuration(transferSecs)}
              </div>
              <div className="text-xs text-gray-400 font-mono mt-4">
                Total duration: {Math.round(transferSecs).toLocaleString()} seconds
              </div>
            </div>

            <div className="mt-8 text-xs text-gray-500 border-t border-gray-800/80 pt-4">
              Tip: 1 Byte (B) = 8 bits (b). A 100Mbps line downloads at a max speed of 12.5 MB/s.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
