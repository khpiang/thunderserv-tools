"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          {t("hero.title")}{" "}
          <span className="text-blue-500">{t("hero.title_accent")}</span>
        </h1>
        <p className="text-lg text-gray-400">
          {t("hero.subtitle")}
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tool 1: RAID Calculator */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-gray-700 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">💾</span>
              <span className="text-[10px] font-semibold tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800 px-2.5 py-1 rounded-full uppercase">
                {t("badge.popular")}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {t("card.raid.title")}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {t("card.raid.desc")}
            </p>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            {t("card.open")}
          </a>
        </div>

        {/* Tool 2: Bandwidth Calculator */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-gray-700 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">🌐</span>
              <span className="text-[10px] font-semibold tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800 px-2.5 py-1 rounded-full uppercase">
                {t("badge.new")}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {t("card.bandwidth.title")}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {t("card.bandwidth.desc")}
            </p>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            {t("card.open")}
          </a>
        </div>

        {/* Tool 3: IP Subnet Calculator */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-gray-700 transition">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">🔢</span>
              <span className="text-[10px] font-semibold tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800 px-2.5 py-1 rounded-full uppercase">
                {t("badge.new")}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {t("card.ip.title")}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {t("card.ip.desc")}
            </p>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            {t("card.open")}
          </a>
        </div>
      </div>
    </main>
  );
}
