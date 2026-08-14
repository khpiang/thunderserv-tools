@'
"use client";

import React, { useState } from "react";

export default function SubnetCalculator() {
  const [cidr, setCidr] = useState<number>(29);

  const getSubnetInfo = () => {
    switch (cidr) {
      case 30: return { netmask: "255.255.255.252", totalIp: 4, usableIp: 2, desc: "P2P Gateway Link" };
      case 29: return { netmask: "255.255.255.248", totalIp: 8, usableIp: 5, desc: "Standard Small Block (/29 Allocation)" };
      case 28: return { netmask: "255.255.255.240", totalIp: 16, usableIp: 13, desc: "Medium IP Block (/28 Allocation)" };
      case 27: return { netmask: "255.255.255.224", totalIp: 32, usableIp: 29, desc: "Large Cluster Block (/27 Allocation)" };
      case 24: return { netmask: "255.255.255.0", totalIp: 256, usableIp: 253, desc: "Full Class C /24 Subnet Block" };
      default: return { netmask: "255.255.255.248", totalIp: 8, usableIp: 5, desc: "Custom Block" };
    }
  };

  const info = getSubnetInfo();

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">IPv4 Subnet & CIDR Calculator</h1>
          <p className="text-gray-400 text-sm mt-1">Calculate netmasks, total IP counts, and usable host addresses for dedicated server IP allocations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Select Subnet Prefix (CIDR)</h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">CIDR Notation</label>
              <select value={cidr} onChange={(e) => setCidr(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none">
                <option value={30}>/30 (2 Usable IPs)</option>
                <option value={29}>/29 (5 Usable IPs - Default Enterprise)</option>
                <option value={28}>/28 (13 Usable IPs)</option>
                <option value={27}>/27 (29 Usable IPs)</option>
                <option value={24}>/24 (253 Usable IPs - Full Subnet Block)</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">Subnet Allocation Details</h2>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Usable Host IPs</div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">{info.usableIp} IPs</div>
                </div>
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-400">Subnet Netmask</div>
                  <div className="text-lg font-bold text-white mt-1">{info.netmask}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-xs text-gray-300">
              💡 <strong>Need Dedicated IP Subnets or ARIN Justification Support?</strong> We offer clean /29, /28, and routed /24 IPv4 blocks for infrastructure clients. Contact <strong className="text-blue-400">admin@thunderserv.com</strong>.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
'@ | Set-Content -Path app\subnet-calculator\page.tsx -Encoding UTF8