"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const { lang, setLang } = useLanguage();

  return (
    <header className="border-b border-gray-800 bg-[#111827]/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl text-white">⚡</div>
          <span className="font-bold text-xl tracking-wider text-white">
            ThunderServ <span className="text-blue-500 font-normal text-sm">Tools</span>
          </span>
        </a>

        {/* 顶部悬浮的 Globe + EN/ZH 切换悬浮框 */}
        <div className="relative flex items-center bg-gray-900 border border-gray-700/80 rounded-lg p-1 space-x-1 shadow-inner">
          <div className="px-1.5 text-gray-400">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>

          <button
            onClick={() => setLang("en")}
            className={`text-[11px] font-bold px-2 py-0.5 rounded transition ${
              lang === "en" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            EN
          </button>

          <span className="text-gray-700 text-xs font-light">|</span>

          <button
            onClick={() => setLang("zh")}
            className={`text-[11px] font-bold px-2 py-0.5 rounded transition ${
              lang === "zh" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            中文
          </button>
        </div>
      </div>
    </header>
  );
}
