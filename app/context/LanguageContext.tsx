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
    // Header
    "nav.contact": "Contact Sales Advisory",
    
    // Hero Section
    "hero.title": "Enterprise Infrastructure",
    "hero.title_accent": "Toolbox",
    "hero.subtitle": "Free, fast, and precise utilities designed for IT architects, system administrators, and bare-metal server operators.",
    
    // Tool Cards
    "card.raid.title": "RAID & NVMe Storage Calculator",
    "card.raid.desc": "Calculate raw vs. usable capacity, parity overhead, and IOPS for enterprise bare-metal arrays.",
    "card.bandwidth.title": "Bandwidth & Monthly Traffic Calculator",
    "card.bandwidth.desc": "Convert network port speeds (Mbps/Gbps) to monthly transfer volume (TB/PB) and estimate bandwidth usage.",
    "card.ip.title": "IP Subnet & CIDR Calculator",
    "card.ip.desc": "Calculate netmasks, usable host IP ranges, broadcast addresses, and gateway details for /24 to /30 subnets.",
    "card.open": "Open Utility →",
    "badge.popular": "POPULAR",
    "badge.new": "NEW",
    
    // Contact Section
    "contact.title": "Need Enterprise IaaS Solutions or Custom Hardware?",
    "contact.subtitle": "Get in touch with our infrastructure experts for high-bandwidth bare-metal, custom routing, or wholesale server deployment.",
    "contact.tg": "Telegram Support",
    "contact.email": "Sales Email",

    // Bandwidth Calculator Page
    "calc.title": "Network Bandwidth & Traffic Calculator",
    "calc.subtitle": "Calculate bandwidth, data transfer, or port utilization accurately for enterprise network planning.",
    "calc.mode.bandwidth": "Port Speed to Data Volume",
    "calc.mode.transfer": "Data Volume & Time to Required Bandwidth",
    "label.portSpeed": "Port Speed / Bandwidth Limit",
    "label.utilization": "Average Bandwidth Utilization (%)",
    "label.duration": "Time Period",
    "label.customDays": "Custom Days",
    "label.fileSize": "Total Data Transferred / Target Traffic",
    "label.speed": "Speed / Bandwidth",
    "label.days": "days",
    "time.1day": "1 Day",
    "time.7days": "7 Days (1 Week)",
    "time.30days": "30 Days (1 Month)",
    "time.custom": "Custom",
    "result.totalTraffic": "Total Traffic Consumed",
    "result.avgBandwidth": "Average Bandwidth Required",
    "result.estTime": "Estimated Transfer Time",
    "result.maxCapacity": "Theoretical Max Volume",
  },
  zh: {
    // Header
    "nav.contact": "联系架构师咨询",
    
    // Hero Section
    "hero.title": "企业级 IT 基础设施",
    "hero.title_accent": "工具箱",
    "hero.subtitle": "专为 IT 架构师、系统管理员及裸金属服务器运维人员打造的精准计算与规划工具。",
    
    // Tool Cards
    "card.raid.title": "RAID & NVMe 存储容量计算器",
    "card.raid.desc": "精准计算裸磁盘容量、实际可用容量、校验开销及企业级阵列 IOPS。",
    "card.bandwidth.title": "网络带宽与月流量计算器",
    "card.bandwidth.desc": "换算端口速率（Mbps/Gbps）与月度数据传输量（TB/PB），评估带宽峰值与占用率。",
    "card.ip.title": "IP 子网与 CIDR 划分计算器",
    "card.ip.desc": "快速计算子网掩码、可用主机 IP 范围、广播地址及 Gateway 网关参数。",
    "card.open": "打开工具 →",
    "badge.popular": "热门",
    "badge.new": "最新",
    
    // Contact Section
    "contact.title": "需要企业级 IaaS 方案或定制服务器硬件？",
    "contact.subtitle": "联系我们的基础设施架构师，获取大带宽裸金属、定制网络路由或服务器批发部署方案。",
    "contact.tg": "Telegram 快捷沟通",
    "contact.email": "商务与技术邮箱",

    // Bandwidth Calculator Page
    "calc.title": "网络带宽与流量计算器",
    "calc.subtitle": "精准计算带宽占用、流量消耗及传输时间，专为企业网络规划打造。",
    "calc.mode.bandwidth": "按带宽算总流量",
    "calc.mode.transfer": "按流量和时间反算所需带宽",
    "label.portSpeed": "端口带宽 / 速率上限",
    "label.utilization": "平均带宽利用率 (%)",
    "label.duration": "计算时长",
    "label.customDays": "自定义天数",
    "label.fileSize": "传输数据总量 / 目标流量",
    "label.speed": "传输速度 / 带宽",
    "label.days": "天",
    "time.1day": "1 天",
    "time.7days": "7 天 (1 周)",
    "time.30days": "30 天 (1 个月)",
    "time.custom": "自定义",
    "result.totalTraffic": "预估消耗流量",
    "result.avgBandwidth": "平均所需带宽",
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
