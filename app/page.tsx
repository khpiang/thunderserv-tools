"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function HomePage() {
  const { language, setLanguage } = useLanguage();

  const tools = [
    {
      id: "raid-calculator",
      titleZh: "RAID 容量计算器",
      titleEn: "RAID Storage Calculator",
      descZh: "计算各类 enterprise RAID 阵列的可用容量、二进制 TiB 换算、容错盘数与阵列利用率。",
      descEn: "Calculate usable storage, binary TiB conversions, fault tolerance, and array efficiency.",
      icon: "💽",
      href: "/raid-calculator",
      badge: "Storage",
    },
    {
      id: "subnet-calculator",
      titleZh: "IPv4 子网掩码计算器",
      titleEn: "IPv4 Subnet Calculator",
      descZh: "计算 CIDR 网络边界、子网掩码、广播地址、掩码反码及可用主机 IP 范围。",
      descEn: "Calculate CIDR block ranges, subnet masks, wildcard masks, and usable host IP ranges.",
      icon: "🌐",
      href: "/subnet-calculator",
      badge: "Networking",
    },
  ];

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
      {/* Top Header / Branding Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚡</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              ThunderServ Infrastructure Tools
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            {language === "zh"
              ? "面向 IaaS 基础设施与服务器运维的高效实用工具箱"
              : "Enterprise infrastructure utilities and calculator suite."}
          </p>
        </div>

        {/* Language Switcher & Domain Branding */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
            <span className="text-blue-400 font-bold">thunderserv.com</span>
          </div>
          <button
            onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
            className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            {language === "zh" ? "English" : "中文"}
          </button>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-6 transition shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-4xl">{tool.icon}</span>
                <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded">
                  {tool.badge}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition mb-2">
                {language === "zh" ? tool.titleZh : tool.titleEn}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {language === "zh" ? tool.descZh : tool.descEn}
              </p>
            </div>

            <div className="mt-6 flex items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300">
              <span>{language === "zh" ? "打开工具" : "Open Utility"}</span>
              <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Branding */}
      <footer className="border-t border-gray-800/60 pt-6 text-center text-xs text-gray-500 font-mono">
        <p>Powered by ThunderServ Infrastructure Solutions | thunderserv.com</p>
      </footer>
    </main>
  );
}
