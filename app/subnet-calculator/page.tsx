"use client";

import React, { useState } from "react";

export default function SubnetCalculator() {
  const [input, setInput] = useState("192.168.1.2/29");
  const [ip, setIp] = useState("192.168.1.2");
  const [cidr, setCidr] = useState(29);

  // Parse IP input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.includes("/")) {
      const [ipPart, maskPart] = val.split("/");
      setIp(ipPart);
      const maskNum = parseInt(maskPart, 10);
      if (!isNaN(maskNum) && maskNum >= 0 && maskNum <= 32) {
        setCidr(maskNum);
      }
    } else {
      setIp(val);
    }
  };

  const handleCidrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCidr = parseInt(e.target.value, 10);
    setCidr(newCidr);
    setInput(`${ip}/${newCidr}`);
  };

  // Convert IP string to 32-bit integer
  const ipToInt = (ipStr: string): number | null => {
    const parts = ipStr.trim().split(".");
    if (parts.length !== 4) return null;
    let num = 0;
    for (let i = 0; i < 4; i++) {
      const part = parseInt(parts[i], 10);
      if (isNaN(part) || part < 0 || part > 255) return null;
      num = (num << 8) + part;
    }
    return num >>> 0;
  };

  // Convert 32-bit integer to IP string
  const intToIp = (num: number): string => {
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255,
    ].join(".");
  };

  // Calculate subnet details
  const calculateSubnet = () => {
    const ipNum = ipToInt(ip);
    if (ipNum === null) return null;

    const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcardNum = (~maskNum) >>> 0;
    const networkNum = (ipNum & maskNum) >>> 0;
    const broadcastNum = (networkNum | wildcardNum) >>> 0;

    let totalHosts = Math.pow(2, 32 - cidr);
    let usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : totalHosts - 2;

    let firstUsable = cidr >= 31 ? networkNum : networkNum + 1;
    let lastUsable = cidr >= 31 ? broadcastNum : broadcastNum - 1;

    return {
      network: intToIp(networkNum),
      broadcast: intToIp(broadcastNum),
      netmask: intToIp(maskNum),
      wildcard: intToIp(wildcardNum),
      firstUsable: intToIp(firstUsable),
      lastUsable: intToIp(lastUsable),
      usableHosts,
      totalHosts,
    };
  };

  const result = calculateSubnet();

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>Subnet Calculator</h1>
      <p>Calculate network ranges, usable IPs, and broadcast addresses for CIDR blocks.</p>

      <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem", gridTemplateColumns: "2fr 1fr" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            IP Address / CIDR
          </label>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="e.g. 192.168.1.2/29"
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Subnet Mask
          </label>
          <select
            value={cidr}
            onChange={handleCidrChange}
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            {[24, 25, 26, 27, 28, 29, 30].map((prefix) => (
              <option key={prefix} value={prefix}>
                /{prefix}
              </option>
            ))}
          </select>
        </div>
      </div>

      {result ? (
        <div style={{ background: "#f8f9fa", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e9ecef" }}>
          <h2>Results for {ip}/{cidr}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <tbody>
              <tr>
                <td style={{ padding: "0.5rem 0", fontWeight: "bold" }}>Subnet Network Address:</td>
                <td>{result.network}</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", fontWeight: "bold" }}>First Usable IP:</td>
                <td>{result.firstUsable}</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", fontWeight: "bold" }}>Last Usable IP:</td>
                <td>{result.lastUsable}</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", fontWeight: "bold" }}>Broadcast Address:</td>
                <td>{result.broadcast}</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", fontWeight: "bold" }}>Usable Hosts:</td>
                <td>{result.usableHosts.toLocaleString()} IPs</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", fontWeight: "bold" }}>Total IPs:</td>
                <td>{result.totalHosts.toLocaleString()} IPs</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", fontWeight: "bold" }}>Subnet Mask:</td>
                <td>{result.netmask}</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 0", fontWeight: "bold" }}>Wildcard Mask:</td>
                <td>{result.wildcard}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: "red" }}>Please enter a valid IP address (e.g., 192.168.1.2).</p>
      )}
    </div>
  );
}
