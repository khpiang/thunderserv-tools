"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo / Brand Name */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <span className="text-blue-500">ThunderServ</span> Tools
        </Link>

        {/* Navigation & Language Switcher */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-white transition-colors">
              {t("nav.calculator")}
            </Link>
          </nav>

          {/* Language Switch Button */}
          <button
            onClick={() => setLanguage(language === "en" ? "zh" : "en")}
            className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:bg-gray-700 hover:text-white transition-all"
          >
            <span>🌐</span>
            <span>{language === "en" ? "中文" : "English"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
