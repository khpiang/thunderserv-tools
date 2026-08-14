"use client";

import React from "react";
import Link from "next/link";
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
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
          <Link
            href="/raid-calculator"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            {t("card.open")}
          </Link>
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
          <Link
            href="/bandwidth-calculator"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            {t("card.open")}
          </Link>
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
          <Link
            href="/subnet-calculator"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            {t("card.open")}
          </Link>
        </div>
      </div>

      {/* Enterprise Advisory & Contact Section */}
      <div id="contact" className="bg-gradient-to-r from-blue-950/40 via-gray-900 to-gray-900/80 border border-blue-900/50 rounded-2xl p-8 sm:p-10 shadow-2xl">
        <div className="max-w-3xl">
          <h3 className="text-2xl font-bold text-white mb-3">
            {t("contact.title")}
          </h3>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
            {t("contact.subtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {/* Telegram Link */}
            <a
              href="https://t.me/thunderserv" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <span>💬</span>
              <span>{t("contact.tg")}</span>
            </a>

            {/* Email Link */}
            <a
              href="mailto:sales@thunderserv.com"
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-semibold text-sm px-5 py-3 rounded-xl transition flex items-center gap-2"
            >
              <span>✉️</span>
              <span>sales@thunderserv.com</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
