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
    "nav.contact": "Contact Sales Advisory",
    "hero.title": "Enterprise Infrastructure",
    "hero.title_accent": "Toolbox",
    "hero.subtitle": "Free, fast, and precise utilities designed for IT architects, system administrators, and bare-metal server operators.",
    "card.raid.title": "RAID & NVMe Storage Calculator",
    "card.raid.desc": "Calculate raw vs. usable capacity, parity overhead, and IOPS for enterprise bare-metal arrays.",
    "card.bandwidth.title": "Bandwidth & Monthly Traffic Calculator",
    "card.bandwidth.desc": "Convert network port speeds (Mbps/Gbps) to monthly transfer volume (TB/PB) and estimate bandwidth usage.",
    "card.ip.title": "IP Subnet & CIDR Calculator",
    "card.ip.desc": "Calculate netmasks, usable host IP ranges, broadcast addresses, and gateway details for /24 to /30 subnets.",
    "card.open": "Open Utility →",
    "badge.popular": "POPULAR",
    "badge.new": "NEW",
  },
  zh: {
    "nav.contact": "联系架构师咨询",
    "hero.title": "企业级 IT 基础设施",
    "hero.title_accent": "工具箱",
    "hero.subtitle": "专为 IT 架构师、系统管理员及裸金属服务器运维人员打造的精准计算与规划工具。",
    "card.raid.title": "RAID & NVMe 存储容量计算器",
    "card.raid.desc": "精准计算裸磁盘容量、实际可用容量、校验开销及企业级阵列 IOPS。",
    "card.bandwidth.title": "网络带宽与月流量计算器",
    "card.bandwidth.desc": "换算端口速率（Mbps/Gbps）与月度数据传输量（TB/PB），评估带宽峰值与占用率。",
    "card.ip.title": "IP 子网与 CIDR 划分计算器",
    "card.ip.desc": "快速计算子网掩码、可用主机 IP 范围、广播地址及 Gateway 网关参数。",
    "card.open": "打开工具 →",
    "badge.popular": "热门",
    "badge.new": "最新",
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
