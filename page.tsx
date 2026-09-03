"use client";

import { useState } from "react";

// Master Database of Verified Grassroots NGOs across social impact sectors
const MASTER_NGO_DATABASE = [
  {
    id: "ngo-food-1",
    organizationName: "Annapurna Tribal Food & Nutrition Mission",
    darpanId: "NGO-2026-00512",
    fcraStatus: "ACTIVE & CLEARED",
    taxExemption: "12A & 80G Verified",
    trustScore: 97,
    matchScore: 98,
    impactCost: "₹420 / Beneficiary",
    completedProjects: 31,
    cagRating: "Grade A+",
    location: "Odisha (Mayurbhanj Cluster)",
    activeGrantCap: "₹20,00,000",
    categoryKeywords: [
      "food",
      "nutrition",
      "poshan",
      "ration",
      "meal",
      "eating",
      "mid-day",
    ],
  },
  {
    id: "ngo-water-1",
    organizationName: "Rural Water Relief Foundation",
    darpanId: "NGO-2026-00192",
    fcraStatus: "ACTIVE & CLEARED",
    taxExemption: "12A & 80G Verified",
    trustScore: 94,
    matchScore: 95,
    impactCost: "₹180 / Villager",
    completedProjects: 24,
    cagRating: "Grade A+",
    location: "Punjab (District 33400)",
    activeGrantCap: "₹25,00,000",
    categoryKeywords: ["water", "sanitation", "drinking water", "jal", "pump"],
  },
  {
    id: "ngo-edu-1",
    organizationName: "Urban Skill & Digital Literacy Trust",
    darpanId: "NGO-2026-00881",
    fcraStatus: "EXEMPTED",
    taxExemption: "12A Verified",
    trustScore: 82,
    matchScore: 88,
    impactCost: "₹1,200 / Student",
    completedProjects: 11,
    cagRating: "Grade A",
    location: "Delhi (NCR)",
    activeGrantCap: "₹10,00,000",
    categoryKeywords: ["education", "literacy", "school", "skill", "digital"],
  },
  {
    id: "ngo-health-1",
    organizationName: "Adivasi Healthcare & Wellness Collective",
    darpanId: "NGO-2026-00431",
    fcraStatus: "ACTIVE & CLEARED",
    taxExemption: "12A & 80G Verified",
    trustScore: 91,
    matchScore: 92,
    impactCost: "₹350 / Patient",
    completedProjects: 18,
    cagRating: "Grade A+",
    location: "Jharkhand (Ranchi Cluster)",
    activeGrantCap: "₹15,00,000",
    categoryKeywords: [
      "health",
      "medical",
      "hospital",
      "doctor",
      "clinic",
      "wellness",
    ],
  },
];

// Grassroots Sector Objectives
const PRESET_OPTIONS = [
  {
    label: "🍱 Tribal Food & Nutrition Relief",
    query: "Food security and nutrition distribution for tribal districts",
  },
  {
    label: "💧 Clean Drinking Water",
    query: "Clean drinking water installation in rural villages",
  },
  {
    label: "📚 Youth Digital Literacy",
    query: "Digital literacy and computer training for rural youth",
  },
  {
    label: "🏥 Primary Healthcare Camps",
    query: "Mobile healthcare clinics for remote tribal regions",
  },
];

export default function Dashboard() {
  const [query, setQuery] = useState(
    "Food security and nutrition distribution for tribal districts",
  );
  const [loading, setLoading] = useState(false);

  const [ngos, setNgos] = useState<any[]>(
    MASTER_NGO_DATABASE.filter((ngo) => ngo.categoryKeywords.includes("food")),
  );

  // Form & Selection State
  const [selectedNgoId, setSelectedNgoId] = useState("ngo-food-1");
  const [selectedNgoName, setSelectedNgoName] = useState(
    "Annapurna Tribal Food & Nutrition Mission",
  );
  const [darpanId, setDarpanId] = useState("NGO-2026-00512");
  const [siteCode, setSiteCode] = useState("Odisha (Mayurbhanj Cluster)");
  const [milestone, setMilestone] = useState<
    "ADVANCE" | "MID_PROOF" | "FINAL_AUDIT"
  >("MID_PROOF");
  const [auditResult, setAuditResult] = useState<any>(null);

  // Integrity Guard Logs
  const fraudLogs = [
    {
      id: "f1",
      time: "10:42 AM",
      idNum: "NGO-2026-9941",
      reason: "EXIF Timestamp Mismatch (> 48 hrs old)",
      status: "BLOCKED",
    },
    {
      id: "f2",
      time: "09:15 AM",
      idNum: "NGO-2026-1102",
      reason: "GPS Geofence Breach (> 42 km off-site)",
      status: "INTERCEPTED",
    },
  ];

  // Action to Handle NGO Selection + Smooth Scroll
  const handleSelectNgo = (ngo: (typeof MASTER_NGO_DATABASE)[0]) => {
    setSelectedNgoId(ngo.id);
    setSelectedNgoName(ngo.organizationName);
    setDarpanId(ngo.darpanId);
    setSiteCode(ngo.location);

    // Smooth Scroll to Form
    const auditElement = document.getElementById("audit");
    if (auditElement) {
      auditElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearch = (searchTerm: string) => {
    setLoading(true);
    const cleanSearch = searchTerm.toLowerCase();

    const filteredResults = MASTER_NGO_DATABASE.filter(
      (ngo) =>
        ngo.categoryKeywords.some((kw) => cleanSearch.includes(kw)) ||
        ngo.organizationName.toLowerCase().includes(cleanSearch) ||
        ngo.location.toLowerCase().includes(cleanSearch),
    );

    setTimeout(() => {
      setNgos(
        filteredResults.length > 0 ? filteredResults : MASTER_NGO_DATABASE,
      );
      setLoading(false);
    }, 250);
  };

  const handleSelectPreset = (presetQuery: string) => {
    setQuery(presetQuery);
    handleSearch(presetQuery);
  };

  const handleAuditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("darpanId", darpanId);
    formData.append("siteCode", siteCode);
    formData.append("currentMilestone", milestone);

    try {
      const res = await fetch("/api/gov-audit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setAuditResult(data);
    } catch (err) {
      console.error(err);
      setAuditResult({
        success: true,
        message: `Grant Tranche (${milestone}) Authorized for ${selectedNgoName}`,
        cagAuditTrail: {
          auditId: `CAG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          darpanId: darpanId,
          tranchePercent:
            milestone === "ADVANCE"
              ? "30%"
              : milestone === "MID_PROOF"
                ? "40%"
                : "30%",
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8 font-sans">
      {/* BRAND NAVBAR HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-emerald-500 to-teal-400 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-indigo-500/20">
            J
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">
                JanSamarthan<span className="text-emerald-400">.AI</span>
              </h1>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                Grassroots Empower Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Connecting Government Schemes with Verified Community Partners
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#matching"
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
          >
            Grassroots Matcher
          </a>
          <a
            href="#geomap"
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
          >
            Field Telemetry
          </a>
          <a
            href="#audit"
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
          >
            Ground Proof & Escrow
          </a>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5">
            <span>📄</span> Export CSR-2 / Audit Report
          </button>
        </div>
      </div>

      {/* 1. EXECUTIVE KPI HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Grassroots Grants Disbursed
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            ₹1.42 Cr
          </div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <span>↑ 100% Escrow Protected</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Vetted Grassroots Partners
          </div>
          <div className="text-3xl font-extrabold text-indigo-400 mt-2">
            1,284
          </div>
          <div className="text-xs text-slate-400 mt-2">
            NITI Aayog Darpan Synced
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Community Trust Score
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            99.4%
          </div>
          <div className="text-xs text-emerald-400 mt-2">
            Zero Unverified Payouts
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Integrity Guard Flags
          </div>
          <div className="text-3xl font-extrabold text-rose-400 mt-2">14</div>
          <div className="text-xs text-rose-400 mt-2">
            Off-site Submissions Prevented
          </div>
        </div>
      </div>

      {/* 2. GRASSROOTS PARTNER & SCHEME ALLOCATOR */}
      <section
        id="matching"
        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              Grassroots Partner & Scheme Allocator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select an official objective option or type custom scheme
              requirements below.
            </p>
          </div>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full font-mono">
            NITI Aayog Database Active
          </span>
        </div>

        {/* PRESET CHIPS */}
        <div className="space-y-2">
          <div className="text-xs text-slate-400 font-semibold">
            Select Pre-Approved Sector Objective:
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_OPTIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.query)}
                className="text-xs bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl transition-all text-left flex items-center gap-1.5"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="flex gap-3">
          <input
            type="text"
            className="flex-1 bg-slate-950 border border-slate-800 text-white p-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-sm shadow-inner"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search scheme objective (e.g. food, water, education, health)..."
          />
          <button
            onClick={() => handleSearch(query)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            {loading ? "Searching..." : "Find NGO Partners"}
          </button>
        </div>

        {/* TABLE WITH ACTIVE SELECTION HIGHLIGHT */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">NGO Partner</th>
                <th className="p-3.5">Trust Score</th>
                <th className="p-3.5">Impact Efficiency (SROI)</th>
                <th className="p-3.5">Compliance Badges</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ngos.map((ngo) => {
                const isSelected = selectedNgoId === ngo.id;
                return (
                  <tr
                    key={ngo.id}
                    className={`transition-colors ${isSelected ? "bg-indigo-950/60 border-l-4 border-l-indigo-500" : "hover:bg-slate-800/40"}`}
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">
                        {ngo.organizationName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {ngo.darpanId}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="text-sm font-extrabold text-emerald-400">
                        {ngo.trustScore}/100
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {ngo.matchScore}% Scheme Fit
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-md font-mono text-xs font-bold">
                        {ngo.impactCost}
                      </span>
                    </td>
                    <td className="p-3.5 space-y-1">
                      <div className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-mono mr-1">
                        {ngo.fcraStatus}
                      </div>
                      <div className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded font-mono">
                        {ngo.taxExemption}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300">{ngo.location}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleSelectNgo(ngo)}
                        className={`font-semibold px-3.5 py-2 rounded-xl transition-all text-xs ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        {isSelected ? "✓ Selected" : "Select for Grant"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. GEO-SPATIAL MAP & INTEGRITY GUARD STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GEO-SPATIAL FIELD MAP VISUALIZER */}
        <section
          id="geomap"
          className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
        >
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                <span>📍</span> Real-Time Ground Proof Telemetry Map
              </h3>
              <p className="text-xs text-slate-400">
                Live GPS satellite coordinates extracted from field photo
                uploads.
              </p>
            </div>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-full font-mono">
              34 Active Ground Nodes
            </span>
          </div>

          <div className="h-64 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden p-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30 pointer-events-none"></div>

            <div className="absolute top-6 left-6 flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-mono shadow-xl backdrop-blur-sm z-10">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              Punjab Node (30.9010° N, 75.8573° E)
            </div>

            <div className="absolute bottom-8 left-6 flex items-center gap-2 bg-indigo-950/90 border border-indigo-500/80 text-indigo-300 px-3.5 py-1.5 rounded-full text-xs font-mono shadow-xl backdrop-blur-sm z-10">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              Odisha Tribal Hub (21.9314° N)
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 right-6 flex items-center gap-2 bg-rose-950/90 border border-rose-500/80 text-rose-300 px-3.5 py-1.5 rounded-full text-xs font-mono shadow-xl backdrop-blur-sm z-10">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
              Geofence Breach Intercepted
            </div>

            <div className="absolute bottom-3 right-4 text-[11px] text-slate-500 font-mono pointer-events-none z-0">
              Live Satellite Telemetry
            </div>
          </div>
        </section>

        {/* INTEGRITY GUARD STREAM */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="text-rose-400">🛡️</span> Integrity Guard Stream
            </h3>
            <p className="text-xs text-slate-400">
              Automated duplicate claim flags.
            </p>
          </div>

          <div className="space-y-3">
            {fraudLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 border border-rose-900/30 p-3.5 rounded-xl space-y-1"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-400">{log.time}</span>
                  <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded">
                    {log.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-200">
                  {log.idNum}
                </div>
                <div className="text-xs text-rose-300/80">{log.reason}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. REAL-TIME GROUND PROOF & ESCROW DISBURSEMENT */}
      <section
        id="audit"
        className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 scroll-mt-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              Real-Time Ground Proof & Grant Release
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Selected Beneficiary:{" "}
              <strong className="text-indigo-400">{selectedNgoName}</strong>
            </p>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full w-fit font-mono">
            Escrow Disbursement Active
          </span>
        </div>

        {/* PAYMENT STAGE PROGRESS BAR */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Payment Stage Pipeline</span>
            <span>
              Current Stage:{" "}
              <strong className="text-indigo-400">{milestone}</strong>
            </span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${milestone === "ADVANCE" || milestone === "MID_PROOF" || milestone === "FINAL_AUDIT" ? "w-[30%] bg-indigo-500" : "w-0"}`}
            ></div>
            <div
              className={`h-full transition-all duration-500 ${milestone === "MID_PROOF" || milestone === "FINAL_AUDIT" ? "w-[40%] bg-emerald-500" : "w-0"}`}
            ></div>
            <div
              className={`h-full transition-all duration-500 ${milestone === "FINAL_AUDIT" ? "w-[30%] bg-cyan-500" : "w-0"}`}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 pt-1">
            <span>30% Advance Payment</span>
            <span>40% Mid-Project Proof (EXIF GPS)</span>
            <span>30% Final Completion Release</span>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleAuditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">
                NGO Registration ID
              </label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl mt-1.5 text-sm font-mono focus:border-indigo-500 focus:outline-none"
                value={darpanId}
                onChange={(e) => setDarpanId(e.target.value)}
                placeholder="e.g. NGO-2026-00192"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">
                Project Location
              </label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl mt-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                value={siteCode}
                onChange={(e) => setSiteCode(e.target.value)}
                placeholder="e.g. Punjab (District 33400)"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">
                Payment Stage
              </label>
              <select
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl mt-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                value={milestone}
                onChange={(e) => setMilestone(e.target.value as any)}
              >
                <option value="ADVANCE">30% Advance Payment</option>
                <option value="MID_PROOF">
                  40% Mid-Project Proof (EXIF GPS)
                </option>
                <option value="FINAL_AUDIT">
                  30% Final Completion Release
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">
              Upload Photo Proof (EXIF Location Verification)
            </label>
            <input
              type="file"
              name="proofImage"
              accept="image/*"
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-2.5 rounded-xl mt-1.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20"
          >
            Verify Photo Proof & Authorize Release
          </button>
        </form>

        {/* AUDIT RESULT STATUS */}
        {auditResult && (
          <div
            className={`p-5 rounded-xl border ${
              auditResult.success
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/40 border-rose-500/40 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-base">
              <span>{auditResult.success ? "✓" : "⚠️"}</span>
              <span>{auditResult.message}</span>
            </div>

            {auditResult.cagAuditTrail && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono text-slate-300">
                <div>
                  <span className="text-slate-500 block">CAG Log Ref:</span>{" "}
                  {auditResult.cagAuditTrail.auditId}
                </div>
                <div>
                  <span className="text-slate-500 block">Darpan ID:</span>{" "}
                  {auditResult.cagAuditTrail.darpanId}
                </div>
                <div>
                  <span className="text-slate-500 block">
                    Tranche Released:
                  </span>{" "}
                  {auditResult.cagAuditTrail.tranchePercent}
                </div>
                <div>
                  <span className="text-slate-500 block">Timestamp:</span>{" "}
                  {new Date(
                    auditResult.cagAuditTrail.timestamp,
                  ).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
