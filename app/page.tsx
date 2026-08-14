"use client";

import React from "react";

export default function Home() {
  const tools = [
    {
      title: "RAID & NVMe Storage Calculator",
      desc: "Calculate raw vs. usable capacity, parity overhead, and IOPS for enterprise bare-metal arrays.",
      link: "/raid-calculator",
      icon: "💾",
      badge: "Popular",
    },
    {
      title: "Bandwidth & Monthly Traffic Calculator",
      desc: "Convert network port speeds (Mbps/Gbps) to monthly transfer volume (TB/PB) and estimate bandwidth usage.",
      link: "/bandwidth-calculator",
      icon: "🌐",
      badge: "New",
    },
    {
      title: "IP Subnet & CIDR Calculator",
      desc: "Calculate netmasks, usable host IP ranges, broadcast addresses, and gateway details for /24 to /30 subnets.",
      link: "/subnet-calculator",
      icon: "🔢",
      badge: "New",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col justify-between">
      <div>
        <header className="border-b border-gray-800 bg-[#111827]/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/30">
                ⚡
              </div>
              <span className="font-bold text-xl tracking-wider text-white">
                ThunderServ <span className="text-blue-500 font-normal text-sm">Tools</span>
              </span>
            </a>

            <a
              href="#contact-section"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-blue-600/20"
            >
              Contact Sales Advisory
            </a>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise Infrastructure <span className="text-blue-500">Toolbox</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Free, fast, and precise utilities designed for IT architects, system administrators, and bare-metal server operators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <a
                key={tool.link}
                href={tool.link}
                className="group bg-[#111827] border border-gray-800 hover:border-blue-500/50 rounded-2xl p-6 transition duration-300 shadow-xl flex flex-col justify-between space-y-4 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl">{tool.icon}</span>
                    <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                      {tool.badge}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition">
                    {tool.title}
                  </h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="text-xs font-semibold text-blue-400 flex items-center space-x-1 group-hover:translate-x-1 transition">
                  <span>Open Utility</span>
                  <span>→</span>
                </div>
              </a>
            ))}
          </div>

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
          </section>
        </main>
      </div>

      <footer className="border-t border-gray-800 py-8 bg-[#0b0f19] text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 ThunderServ Tools. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
'@ | Set-Content -Path app\page.tsx -Encoding UTF8
