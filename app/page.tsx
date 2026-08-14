"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function HomePage() {
  const { language, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const tools = [
    {
      id: "raid-calculator",
      titleZh: "企业级 RAID 容量计算器",
      titleEn: "Enterprise RAID Storage Calculator",
      descZh: "计算各类 RAID 阵列可用容量、二进制 TiB 换算、冗余利用率与容错硬盘数。",
      descEn: "Calculate usable storage capacity, binary TiB conversions, fault tolerance, and array efficiency.",
      icon: "💽",
      href: "/raid-calculator",
      category: "Storage",
    },
    {
      id: "bandwidth-calculator",
      titleZh: "带宽与传输时间计算器",
      titleEn: "Bandwidth & Data Transfer Calculator",
      descZh: "计算不同网络带宽下的数据传输耗时，支持 TCP/协议开销开销调整与单位换算。",
      descEn: "Calculate transfer times across bandwidth speeds with TCP overhead & unit conversions.",
      icon: "⚡",
      href: "/bandwidth-calculator",
      category: "Network",
    },
    {
      id: "subnet-calculator",
      titleZh: "IPv4 子网掩码计算器",
      titleEn: "IPv4 Subnet Calculator",
      descZh: "计算 CIDR 网络边界、子网掩码、广播地址、掩码反码及可用主机 IP 范围。",
      descEn: "Calculate CIDR block ranges, subnet masks, wildcard masks, and usable host IP ranges.",
      icon: "🌐",
      href: "/subnet-calculator",
      category: "Network",
    },
  ];

  const filteredTools = tools.filter((tool) => {
    const q = searchQuery.toLowerCase();
    return (
      tool.titleZh.toLowerCase().includes(q) ||
      tool.titleEn.toLowerCase().includes(q) ||
      tool.descZh.toLowerCase().includes(q) ||
      tool.descEn.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q)
    );
  });

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
      {/* Top Branding Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-800 pb-6">
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
              : "Enterprise infrastructure utilities, hardware calculators, and network tools."}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
            Branded for <span className="text-blue-400 font-bold">thunderserv.com</span>
          </div>
          <button
            onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
            className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            {language === "zh" ? "English" : "中文"}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === "zh"
                ? "搜索工具 (例如: RAID, Bandwidth, Subnet)..."
                : "Search tools (e.g., RAID, Bandwidth, Subnet)..."
            }
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-gray-500 hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredTools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-6 transition shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-4xl">{tool.icon}</span>
                <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded">
                  {tool.category}
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
              <span>{language === "zh" ? "打开工具" : "Open Tool"}</span>
              <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          {language === "zh" ? "未找到匹配的工具" : "No matching tools found."}
        </div>
      )}

      {/* Footer Branding */}
      <footer className="border-t border-gray-800/60 pt-6 text-center text-xs text-gray-500 font-mono">
        <p>Powered by ThunderServ Infrastructure Solutions | thunderserv.com</p>
      </footer>
    </main>
  );
}
