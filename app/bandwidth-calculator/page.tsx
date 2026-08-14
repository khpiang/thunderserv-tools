"use client";

import React, { useState } from "react";

export default function BandwidthCalculator() {
  const [speed, setSpeed] = useState<number>(1000);
  const [utilization, setUtilization] = useState<number>(80);

  const calculateTraffic = () => {
    const speedInMBps = (speed * (utilization / 100)) / 8;
    const monthlyGB = (speedInMBps * 3600 * 24 * 30.5) / 1024;
    const monthlyTB = monthlyGB / 1024;

    return {
      monthlyTB: monthlyTB.toFixed(2),
      monthlyGB: monthlyGB.toFixed(0),
      speedMBps: speedInMBps.toFixed(1),
    };
  };

  const results = calculateTraffic();

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Bandwidth & Monthly Traffic Calculator</h1>
          <p className="text-gray-400 text-sm mt-1">Convert continuous network port speed into monthly data transfer volume.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">1. Port & Utilization Parameters</h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">Port Speed (Mbps/Gbps)</label>
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none">
                <option value={100}>100 Mbps Port</option>
                <option value={1000}>1 Gbps Unmetered Port</option>
                <option value={10000}>10 Gbps Unmetered Port</option>
                <option value={40000}>40 Gbps High-Bandwidth Node</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-400">Average Bandwidth Utilization</span>
                <span className="font-bold text-blue-400">{utilization}%</span>
              </div>
              <input type="range" min="10" max="100" step="5" value={utilization} onChange={(e) => setUtilization(Number(e.target.value))} className="w-full accent-blue-500 bg-gray-800 h-2 rounded-lg cursor-pointer" />
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">2. Estimated Monthly Data Transfer</h2>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Monthly Volume (TB)</div>
                  <div className="text-2xl font-extrabold text-blue-400 mt-1">{results.monthlyTB} TB</div>
                </div>
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Transfer Speed (MB/s)</div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">{results.speedMBps} MB/s</div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-xs text-gray-300">
              💡 <strong>Need Unmetered 10Gbps Connectivity?</strong> ThunderServ provides high-capacity dedicated servers with full unmetered pipes in LA & San Jose data centers. Contact <strong className="text-blue-400">@thunderserv</strong> on Telegram for custom quotes.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
