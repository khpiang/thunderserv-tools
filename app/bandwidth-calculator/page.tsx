"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function BandwidthCalculatorPage() {
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<"bandwidth" | "transfer">("bandwidth");
  const [portSpeed, setPortSpeed] = useState<number>(1000); // Mbps
  const [utilization, setUtilization] = useState<number>(100); // %
  const [timePreset, setTimePreset] = useState<string>("30"); // days
  const [customDays, setCustomDays] = useState<number>(30);

  const [fileSize, setFileSize] = useState<number>(100); // GB
  const [speed, setSpeed] = useState<number>(100); // Mbps

  const getDays = () => {
    if (timePreset === "1") return 1;
    if (timePreset === "7") return 7;
    if (timePreset === "30") return 30;
    return customDays || 1;
  };

  // Bandwidth calculation
  const days = getDays();
  const totalSeconds = days * 86400;
  const effectiveSpeedMbps = portSpeed * (utilization / 100);
  const totalDataBytes = (effectiveSpeedMbps * 1000000 / 8) * totalSeconds;
  const totalDataTB = totalDataBytes / (1000 ** 4);
  const totalDataTiB = totalDataBytes / (1024 ** 4);

  // Transfer speed calculation
  const fileSizeBytes = fileSize * (1000 ** 3);
  const transferSeconds = speed > 0 ? (fileSizeBytes * 8) / (speed * 1000000) : 0;
  const formatTime = (secs: number) => {
    if (secs <= 0) return "0s";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
      {/* 优化后的强目显眼返回按钮 */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-blue-400 hover:text-blue-300 border border-gray-700/80 px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-md"
        >
          <span className="text-base">← 🏠</span>
          <span>{language === "zh" ? "返回工具列表" : "Back to All Tools"}</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white mb-2">
          {t("calc.title")}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          {t("calc.subtitle")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 max-w-md mb-8">
        <button
          onClick={() => setMode("bandwidth")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
            mode === "bandwidth"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {t("calc.mode.bandwidth")}
        </button>
        <button
          onClick={() => setMode("transfer")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
            mode === "transfer"
              ? "bg-blue-600 text-white shadow"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {t("calc.mode.transfer")}
        </button>
      </div>

      {/* Mode 1: Bandwidth */}
      {mode === "bandwidth" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {t("label.portSpeed")}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={portSpeed}
                  onChange={(e) => setPortSpeed(Number(e.target.value))}
                  className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <span className="bg-gray-800 text-gray-300 px-4 py-2.5 rounded-xl border border-gray-700 font-semibold text-sm flex items-center">
                  Mbps
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {t("label.utilization")}
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
                {t("label.duration")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {[
                  { id: "1", label: t("time.1day") },
                  { id: "7", label: t("time.7days") },
                  { id: "30", label: t("time.30days") },
                  { id: "custom", label: t("time.custom") },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTimePreset(item.id)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                      timePreset === item.id
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {timePreset === "custom" && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="bg-gray-800 text-gray-300 px-4 py-2.5 rounded-xl border border-gray-700 font-semibold text-sm flex items-center">
                    {t("label.days")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-950/40 via-gray-900 to-gray-900 border border-blue-900/50 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span>📊</span> {t("result.totalTraffic")}
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Standard (TB - Decimal)
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono">
                    {totalDataTB.toFixed(2)} <span className="text-xl text-blue-300">TB</span>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Binary Standard (TiB)
                  </div>
                  <div className="text-2xl font-bold text-gray-200 font-mono">
                    {totalDataTiB.toFixed(2)} <span className="text-base text-gray-400">TiB</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-xs text-gray-500 border-t border-gray-800/80 pt-4">
              Calculated using: {effectiveSpeedMbps} Mbps @ 100% duty cycle over {days} day(s).
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Transfer Speed */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {t("label.fileSize")} (GB)
              </label>
              <input
                type="number"
                value={fileSize}
                onChange={(e) => setFileSize(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {t("label.speed")} (Mbps)
              </label>
              <input
                type="number"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-950/40 via-gray-900 to-gray-900 border border-blue-900/50 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span>⏱️</span> {t("result.estTime")}
              </h2>

              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono mb-2">
                {formatTime(transferSeconds)}
              </div>
              <div className="text-xs text-gray-400">
                Total duration: {Math.round(transferSeconds)} seconds
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
