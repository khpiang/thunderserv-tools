"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.calculator": "Bandwidth Calculator",
    "nav.raid": "RAID Calculator",
    "calc.title": "Network Bandwidth & Traffic Calculator",
    "calc.subtitle": "Calculate bandwidth, data transfer, or port utilization accurately",
    "calc.mode.bandwidth": "Bandwidth & Usage",
    "calc.mode.transfer": "Transfer Speed / Time",
    "label.portSpeed": "Port Speed",
    "label.utilization": "Bandwidth Utilization (%)",
    "label.duration": "Duration / Time Frame",
    "label.customDays": "Custom Days",
    "label.fileSize": "File Size / Data Volume",
    "label.speed": "Speed / Bandwidth",
    "label.days": "days",
    "time.1day": "1 Day",
    "time.7days": "7 Days (1 Week)",
    "time.30days": "30 Days (1 Month)",
    "time.custom": "Custom",
    "result.totalTraffic": "Total Data Transferred",
    "result.avgBandwidth": "Average Bandwidth Required",
    "result.estTime": "Estimated Transfer Time",
    "result.maxCapacity": "Maximum Theoretical Capacity",
  },
  zh: {
    "nav.calculator": "带宽流量计算器",
    "nav.raid": "RAID 容量计算器",
    "calc.title": "网络带宽与流量计算器",
    "calc.subtitle": "精准计算带宽占用、流量消耗及传输时间",
    "calc.mode.bandwidth": "带宽与流量换算",
    "calc.mode.transfer": "传输速度与耗时",
    "label.portSpeed": "端口带宽/速率",
    "label.utilization": "平均带宽利用率 (%)",
    "label.duration": "计算时长",
    "label.customDays": "自定义天数",
    "label.fileSize": "文件大小 / 数据量",
    "label.speed": "传输速度 / 带宽",
    "label.days": "天",
    "time.1day": "1 天",
    "time.7days": "7 天 (1 周)",
    "time.30days": "30 天 (1 个月)",
    "time.custom": "自定义",
    "result.totalTraffic": "总消耗流量",
    "result.avgBandwidth": "所需平均带宽",
    "result.estTime": "预估传输耗时",
    "result.maxCapacity": "理论最大传输量",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("app_lang") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "zh")) {
      setLanguageState(savedLang);
    } else {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("zh")) {
        setLanguageState("zh");
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
