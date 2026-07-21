import React, { useState, useEffect, useMemo } from "react";
import {
  Cpu,
  Activity,
  Database,
  Zap,
  Eye,
  TrendingUp,
  Sparkles,
  Layers,
  Search,
  RefreshCw,
  GitCommit,
  Network,
  Workflow,
  AlertTriangle,
  Brain,
  Shield,
  HelpCircle,
  Clock,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  CentralIntelligenceCore,
  SICEvent,
  AttackChain,
  PredictiveIntel,
  ThreatRelation,
} from "../services/centralIntelligenceCore";
import { defaultThreats } from "../services/geminiService";

export function AmanovaSICCoreView({
  language = "English",
  theme = "dark",
}: {
  language?: string;
  theme?: string;
}) {
  const isRTL = language === "Arabic";
  const sic = CentralIntelligenceCore.getInstance();

  // State Management
  const [activeTab, setActiveTab] = useState<"bus" | "risk" | "chains" | "relations" | "prediction">("bus");
  const [events, setEvents] = useState<SICEvent[]>(() => sic.getEventHistory());
  const [selectedEvent, setSelectedEvent] = useState<SICEvent | null>(null);

  // Dynamic Simulators state
  const [simulatorInput, setSimulatorInput] = useState("URGENT: Your payment for secure backup failed. Access http://secured-billing-okta-reverify.net to sign in now and re-enable active access.");
  const [simulatedRisk, setSimulatedRisk] = useState<any>(null);
  const [isSimulatingRisk, setIsSimulatingRisk] = useState(false);

  // Attack Chain state
  const [activeChain, setActiveChain] = useState<AttackChain | null>(null);
  const [isReconstructingChain, setIsReconstructingChain] = useState(false);
  const [chainTargetClass, setChainTargetClass] = useState("Phishing");

  // Predictive Intel state
  const [predictiveData, setPredictiveData] = useState<PredictiveIntel | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionTargetCampaign, setPredictionTargetCampaign] = useState("camp-cobalt-shadow");

  // Relationship Engine state
  const [searchQuery, setSearchQuery] = useState("cobalt-api-gate.net");
  const [discoveredRelations, setDiscoveredRelations] = useState<ThreatRelation[]>([]);
  const [relationSearched, setRelationSearched] = useState(false);

  // Auto trigger default states
  useEffect(() => {
    // Generate initial events if empty to populate the bus
    const initialEvents = sic.getEventHistory();
    if (initialEvents.length === 0) {
      sic.publish("NewThreatFeed", "SENTRY_INTEL_SYSTEM", {
        feedName: "SANS Internet Storm Center Malicious IP Registry",
        indicatorsInjected: ["185.220.101.45", "103.14.26.110"],
      });
      sic.publish("ThreatDetected", "FAST_SCANNER", {
        name: "SMS Credentials harvesting bait targeting Okta Single Sign-On.",
        classification: "Phishing",
        riskScore: 92,
        confidence: "High",
        evidence: ["Uses typosquatting domain secure-okta-auth-renew.com", "Coercive high urgency language patterns"],
      });
      sic.publish("RiskScoreChanged", "SIC_GLOBAL_RISK_ENGINE", {
        oldScore: 35,
        newScore: 78,
        status: "High Danger Event Escalated",
      });
      setEvents(sic.getEventHistory());
    }
  }, []);

  // Listen to live events
  useEffect(() => {
    const handleLiveEvent = (e: any) => {
      setEvents(sic.getEventHistory());
    };
    window.addEventListener("sentry-sic-event", handleLiveEvent);
    return () => window.removeEventListener("sentry-sic-event", handleLiveEvent);
  }, []);

  // Compute stats
  const eventCounts = useMemo(() => {
    return events.reduce((acc: Record<string, number>, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {});
  }, [events]);

  // Handle Risk Analysis Simulator
  const handleCalculateRisk = async () => {
    setIsSimulatingRisk(true);
    // Parse simulated inputs
    const lowercaseInput = simulatorInput.toLowerCase();
    const hasPhish = lowercaseInput.includes("okta") || lowercaseInput.includes("billing") || lowercaseInput.includes("payment");
    const threatScore = hasPhish ? 88 : 20;

    const result = sic.calculateUnifiedGlobalRisk({
      campaignCount: hasPhish ? 3 : 1,
      recentScanScore: threatScore,
      recentScanClassification: hasPhish ? "Phishing" : "Safe",
      historicalAlertCount: hasPhish ? 12 : 1,
      personalSecurityScore: 68, // Baseline secure score
      userAppliedRemediations: ["mfaPatch"],
      threatAgeLevel: hasPhish ? "Zero-Day" : "Aged",
    });

    // Artificially wait to simulate cognitive engine
    setTimeout(() => {
      setSimulatedRisk(result);
      setIsSimulatingRisk(false);

      // Publish event
      sic.publish("RiskScoreChanged", "SIC_SIMULATOR_CORE", {
        unifiedScore: result.globalRiskScore,
        severity: result.status,
        inputAnalyzed: simulatorInput.substring(0, 40) + "...",
      });
    }, 1200);
  };

  // Handle Attack Chain Reconstruction
  const handleReconstructChain = async () => {
    setIsReconstructingChain(true);
    setActiveChain(null);

    try {
      const chain = await sic.reconstructAttackChain(
        `Dynamic simulated trigger for category: ${chainTargetClass}. Tracking multi-stage behavioral payloads on local terminal gates.`,
        chainTargetClass
      );
      setActiveChain(chain);

      // Publish event
      sic.publish("CampaignExpanded", "SIC_ATTACK_FORENSICS", {
        chainId: chain.id,
        chainName: chain.name,
        nodesCount: chain.nodes.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsReconstructingChain(false);
    }
  };

  // Handle Predictive Intel Engine
  const handlePredictiveIntel = async () => {
    setIsPredicting(true);
    setPredictiveData(null);

    const campaignNames: Record<string, string> = {
      "camp-cobalt-shadow": "Operation Cobalt Shadow",
      "camp-vanguard": "Vanguard Crypto Ransomware",
      "camp-volt-typhoon": "Volt Typhoon Scams",
    };

    try {
      const data = await sic.generatePredictiveIntel(
        predictionTargetCampaign,
        campaignNames[predictionTargetCampaign] || "Custom Campaign Tracking Thread"
      );
      setPredictiveData(data);

      sic.publish("CampaignExpanded", "SIC_PREDICTIVE_INTEL", {
        campaignId: predictionTargetCampaign,
        expansionRisk: data.expansionRisk,
        confidenceScore: data.confidenceScore,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  // Handle Relationships Search
  const handleRelationsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const found = sic.getRelationsForIndicator(searchQuery);
    setDiscoveredRelations(found);
    setRelationSearched(true);

    sic.publish("IOCFound", "SIC_RELATIONSHIP_ENGINE", {
      query: searchQuery,
      relationshipsCount: found.length,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0D151E] via-[#090D12] to-[#05070A] border border-cyan-400/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-[80px]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl text-cyan-400 shrink-0">
                <Cpu className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.2em] font-bold block">
                  SIC Enterprise System
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  AMANOVA Central Intelligence Core
                </h3>
              </div>
            </div>
            <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
              Orchestrator brain of AMANOVA. Utilizing event-driven architectures to automate correlation across the Threat Hub, AI Analysis pipelines, scanners, risk calculators, and predictive telemetry.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl shrink-0">
            <div className="text-right">
              <span className="text-[9px] font-mono text-white/40 uppercase block">Central Core Status</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE / MONITORED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[#090D11] border border-white/5">
        {[
          { id: "bus", label: isRTL ? "ناقل الأحداث" : "Central Event Bus", icon: Activity },
          { id: "risk", label: isRTL ? "مؤشر المخاطر الشامل" : "Global Risk Engine", icon: Layers },
          { id: "chains", label: isRTL ? "إعادة بناء الهجمات" : "Attack Chain Reconstruction", icon: Workflow },
          { id: "relations", label: isRTL ? "ترابط التهديدات" : "Threat Relations", icon: Network },
          { id: "prediction", label: isRTL ? "التنبؤ الذكي" : "Predictive Intel", icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                isActive ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/10" : "text-white/50 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {/* PANEL 1: EVENT BUS */}
        {activeTab === "bus" && (
          <motion.div
            key="bus-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Column: Live event logger */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-2xl bg-[#0E1012] border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h4 className="text-sm font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                      Unified Bus Telemetry Logger
                    </h4>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">Real-time distributed pub/sub events broker</p>
                  </div>
                  <button
                    onClick={() => setEvents(sic.getEventHistory())}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all border border-white/5"
                    title="Refresh Log Stack"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {events.length === 0 ? (
                    <div className="text-center py-12 text-white/30 font-mono text-xs">
                      No events dispatched on central bus thread.
                    </div>
                  ) : (
                    events
                      .slice()
                      .reverse()
                      .map((evt) => {
                        const isSelected = selectedEvent?.id === evt.id;
                        return (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-cyan-500/10 border-cyan-400/40"
                                : "bg-[#111316] border-white/5 hover:border-white/10"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase ${
                                    evt.type.includes("Detected") || evt.type.includes("Compromised")
                                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                      : evt.type.includes("Score")
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                  }`}>
                                    {evt.type}
                                  </span>
                                  <span className="text-[9px] font-mono text-white/30">{evt.id}</span>
                                </div>
                                <p className="text-xs font-bold text-white/80 line-clamp-1">
                                  {evt.data?.name || evt.data?.feedName || evt.data?.threatName || `Structured Event Payload`}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-mono text-white/30 block">
                                  {new Date(evt.timestamp).toLocaleTimeString(undefined, {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </span>
                                <span className="text-[9px] font-mono text-cyan-400/60 block truncate max-w-[120px]">
                                  {evt.source}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Payload Inspector */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-[#0E1012] border border-white/5 h-full space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="text-sm font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Payload Inspector
                    </h4>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">Deep inspection of serialized Event message fields</p>
                  </div>

                  {selectedEvent ? (
                    <div className="space-y-4 font-mono text-xs text-white/80 bg-[#111316] p-4 rounded-xl border border-white/5">
                      <div className="space-y-2 border-b border-white/5 pb-3">
                        <p><span className="text-cyan-400 font-bold">Event ID:</span> {selectedEvent.id}</p>
                        <p><span className="text-cyan-400 font-bold">Type:</span> {selectedEvent.type}</p>
                        <p><span className="text-cyan-400 font-bold">Source:</span> {selectedEvent.source}</p>
                        <p><span className="text-cyan-400 font-bold">Timestamp:</span> {selectedEvent.timestamp}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-cyan-400 font-bold mb-1">Raw JSON Data Structure:</p>
                        <pre className="text-[10px] overflow-x-auto text-amber-200/80 p-2 bg-black/40 rounded leading-relaxed">
                          {JSON.stringify(selectedEvent.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-white/30 font-mono text-xs border border-dashed border-white/5 rounded-xl">
                      Select an event from the log feed to inspect its parameters.
                    </div>
                  )}
                </div>

                <div className="p-4 bg-cyan-400/5 border border-cyan-400/15 rounded-xl">
                  <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                    SOAR Automation Status
                  </span>
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    SIC auto-correlates threats across modules. High risk (Score ≥ 75) triggers a SOAR security orchestration pipeline, auto-notifying the dashboard.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* PANEL 2: GLOBAL RISK ENGINE */}
        {activeTab === "risk" && (
          <motion.div
            key="risk-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Simulation controls */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-6 rounded-2xl bg-[#0E1012] border border-white/5 space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-tight text-white">
                    Risk Engine Inputs
                  </h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Adjust telemetry inputs to simulate global risk</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-white/40 uppercase block">Observable Security Text</label>
                  <textarea
                    value={simulatorInput}
                    onChange={(e) => setSimulatorInput(e.target.value)}
                    rows={4}
                    className="w-full bg-[#111316] border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white"
                  />
                  <span className="text-[9px] font-mono text-white/30 block">
                    Type 'billing' or 'okta' to trigger highly suspicious context calculations.
                  </span>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-xs font-mono text-white/50">
                    <span>Active Campaigns Count</span>
                    <span className="font-bold text-white">3</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-white/50">
                    <span>Historical Alert Count</span>
                    <span className="font-bold text-white">12</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-white/50">
                    <span>Personal Security Score</span>
                    <span className="font-bold text-emerald-400">68/100</span>
                  </div>
                </div>

                <button
                  onClick={handleCalculateRisk}
                  disabled={isSimulatingRisk}
                  className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-400/35 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSimulatingRisk ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      SIMULATING THREAD...
                    </>
                  ) : (
                    "CALCULATE PLATFORM RISK"
                  )}
                </button>
              </div>
            </div>

            {/* Simulation outputs */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-2xl bg-[#0E1012] border border-white/5 h-full space-y-6 flex flex-col justify-between">
                <div>
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="text-sm font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Dynamic Multi-Source Risk Matrix
                    </h4>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">Calculated unified risk score based on XDR telemetry</p>
                  </div>

                  {simulatedRisk ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Gauge */}
                      <div className="flex flex-col items-center justify-center p-6 bg-[#111316] rounded-xl border border-white/5 relative">
                        <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider block mb-2">Unified Risk Index</span>
                        <div className="relative flex items-center justify-center w-32 h-32">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="8"
                              className="text-white/5"
                              fill="transparent"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="8"
                              className={`${
                                simulatedRisk.globalRiskScore >= 80
                                  ? "text-red-500"
                                  : simulatedRisk.globalRiskScore >= 60
                                  ? "text-amber-500"
                                  : "text-cyan-400"
                              }`}
                              strokeDasharray={`${2 * Math.PI * 56}`}
                              strokeDashoffset={`${
                                2 * Math.PI * 56 * (1 - simulatedRisk.globalRiskScore / 100)
                              }`}
                              strokeLinecap="round"
                              fill="transparent"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black tracking-tighter text-white">
                              {simulatedRisk.globalRiskScore}
                            </span>
                            <span className="text-[10px] font-mono uppercase text-white/40">/ 100</span>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase mt-4 tracking-wider border ${
                          simulatedRisk.status === "Critical"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : simulatedRisk.status === "High"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        }`}>
                          {simulatedRisk.status} SEVERITY
                        </span>
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-4">
                        <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider block">Telemetry Vector Risk Breakdown</span>
                        {Object.entries(simulatedRisk.breakdown).map(([key, val]: any) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-xs font-mono text-white/70">
                              <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                              <span className="font-bold text-white">{val}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-400 transition-all duration-500"
                                style={{ width: `${val}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-white/30 font-mono text-xs border border-dashed border-white/5 rounded-xl pt-16">
                      <HelpCircle className="w-12 h-12 text-white/10 mx-auto mb-3" />
                      Click "Calculate Platform Risk" to initiate the SIC global engine thread and evaluate unified telemetry vectors.
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-white/50 bg-[#111316] p-4 rounded-xl border border-white/5 leading-relaxed">
                  <span className="font-bold text-white block mb-0.5">Enterprise SIEM Grounding:</span>
                  Unified risk scores aggregate real-time campaigns, system detections, zero-day threat ages, user behavior remidations, and historical attack logs to compute immediate mitigation response protocols.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* PANEL 3: ATTACK CHAIN RECONSTRUCTION */}
        {activeTab === "chains" && (
          <motion.div
            key="chains-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Controls */}
            <div className="p-6 rounded-2xl bg-[#0E1012] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-tight text-white">
                  Mitre-Mapped Attack Chain Reconstruction
                </h4>
                <p className="text-xs text-white/40 mt-0.5">Reconstruct multi-stage attack sequences from a threat classification</p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={chainTargetClass}
                  onChange={(e) => setChainTargetClass(e.target.value)}
                  className="bg-[#111316] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Phishing">Phishing Campaign</option>
                  <option value="Scam">Double-Invoice Scam</option>
                  <option value="Crypto Scam">Seed-Phrase Harvest</option>
                  <option value="Fake Support">Remote Desk Shell</option>
                  <option value="Fake Investment">Ponzi/HYIP Scheme</option>
                </select>

                <button
                  onClick={handleReconstructChain}
                  disabled={isReconstructingChain}
                  className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-400/35 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {isReconstructingChain ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      RECONSTRUCTING CHANNELS...
                    </>
                  ) : (
                    "GENERATE ATTACK SEQUENCE"
                  )}
                </button>
              </div>
            </div>

            {/* Visualizer */}
            <div className="p-6 rounded-2xl bg-[#0E1012] border border-white/5 space-y-6 min-h-[350px]">
              {activeChain ? (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">Reconstruction Model Result</span>
                    <h5 className="text-lg font-black text-white">{activeChain.name}</h5>
                    <p className="text-xs text-white/60 mt-1">{activeChain.summary}</p>
                  </div>

                  {/* Nodes list */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                    {/* SVG Connector Line */}
                    <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[1px] border-t border-dashed border-white/15 -z-10" />

                    {activeChain.nodes.map((node) => (
                      <div key={node.id} className="relative space-y-3 p-4 bg-[#111316] border border-white/5 rounded-xl hover:border-cyan-400/20 transition-all">
                        {/* Step count indicator */}
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-full bg-cyan-400 text-black font-mono font-black text-xs flex items-center justify-center">
                            {node.step}
                          </span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            node.severity === "Critical"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-cyan-500/10 text-cyan-400 border border-cyan-400/25"
                          }`}>
                            {node.severity}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block">{node.phase}</span>
                          <p className="text-xs font-bold text-white break-words">{node.vector}</p>
                          <p className="text-[11px] text-white/50 leading-relaxed pt-1 border-t border-white/5">{node.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-white/30 font-mono text-xs border border-dashed border-white/5 rounded-xl h-64 flex flex-col items-center justify-center">
                  <Workflow className="w-12 h-12 text-white/10 mb-3" />
                  Select an exploit category and click "Generate Attack Sequence" to simulate visual attack chain models dynamically mapping back to MITRE ATT&CK vectors.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PANEL 4: THREAT RELATIONS */}
        {activeTab === "relations" && (
          <motion.div
            key="relations-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Search IOC relationships */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-6 rounded-2xl bg-[#0E1012] border border-white/5 space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-tight text-white">
                    Threat Relationship Explorer
                  </h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Explore relationships between indicators, campaigns, and files</p>
                </div>

                <form onSubmit={handleRelationsSearch} className="space-y-3">
                  <label className="text-[10px] font-mono text-white/40 uppercase block">Indicator / Campaign Key</label>
                  <input
                    type="text"
                    required
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. cobalt-api-gate.net or 1A1zP1eP5QG"
                    className="w-full bg-[#111316] border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md"
                  >
                    DISCOVER RELATIONSHIPS
                  </button>
                </form>

                <div className="p-4 bg-[#111316] rounded-xl border border-white/5 space-y-2">
                  <span className="text-[9px] font-mono text-white/40 uppercase block">Seeded Indicators in Memory:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["cobalt-api-gate.net", "185.220.101.45", "security@cobalt-gateway.com", "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"].map((seed) => (
                      <button
                        key={seed}
                        onClick={() => setSearchQuery(seed)}
                        className="px-2 py-1 bg-white/5 border border-white/5 hover:border-cyan-400/20 rounded font-mono text-[9px] text-white/60 truncate max-w-[150px]"
                      >
                        {seed}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Relations Tree graph viewer */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-2xl bg-[#0E1012] border border-white/5 h-full space-y-4">
                <div className="border-b border-white/5 pb-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-400" />
                    Interconnectivity Node Graph Viewer
                  </h4>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">Discovered interconnected nodes within the platform relationship db</p>
                </div>

                {relationSearched ? (
                  <div className="space-y-4 min-h-[250px] flex flex-col justify-between">
                    {discoveredRelations.length > 0 ? (
                      <div className="space-y-4">
                        <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider block">
                          Discovered Links ({discoveredRelations.length})
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {discoveredRelations.map((rel, idx) => (
                            <div key={idx} className="p-4 bg-[#111316] border border-white/5 rounded-xl space-y-2 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-1 bg-cyan-400/5 rounded-bl-lg text-[8px] font-mono font-black text-cyan-400 uppercase tracking-widest border-l border-b border-white/5">
                                {rel.relationshipType}
                              </div>
                              <div className="space-y-1">
                                <span className="bg-white/5 text-white/50 px-1.5 py-0.5 rounded text-[8px] font-mono uppercase">
                                  {rel.sourceType}
                                </span>
                                <p className="text-xs font-bold text-white font-mono break-all leading-relaxed">{rel.sourceValue}</p>
                              </div>
                              <div className="flex justify-center py-1">
                                <ArrowRight className="w-4 h-4 text-cyan-400/40 rotate-90 md:rotate-0" />
                              </div>
                              <div className="space-y-1">
                                <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded text-[8px] font-mono uppercase">
                                  {rel.targetType}
                                </span>
                                <p className="text-xs font-bold text-white font-mono break-all leading-relaxed">{rel.targetValue}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-white/30 font-mono text-xs border border-dashed border-white/5 rounded-xl flex-1 flex flex-col items-center justify-center">
                        No interconnected nodes found for indicator in graph database.
                        <p className="text-[10px] text-white/20 mt-1">Try one of the pre-seeded search chips.</p>
                      </div>
                    )}

                    <div className="text-[10px] text-white/40 leading-relaxed border-t border-white/5 pt-3 font-mono uppercase">
                      SIC automatically catalogs relationships between domains, mails, wallets, hashes, and campaigns.
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-white/30 font-mono text-xs border border-dashed border-white/5 rounded-xl h-64 flex flex-col items-center justify-center">
                    <Network className="w-12 h-12 text-white/10 mb-3" />
                    Enter an IOC value and click "Discover Relationships" to explore nested threat networks.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* PANEL 5: PREDICTIVE INTEL */}
        {activeTab === "prediction" && (
          <motion.div
            key="prediction-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Target selectors */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-6 rounded-2xl bg-[#0E1012] border border-white/5 space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-tight text-white">
                    Predictive Intelligence Core
                  </h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Forecast emerging scam vectors and high-risk indicators</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-white/40 uppercase block">Select Threat Campaign</label>
                  <select
                    value={predictionTargetCampaign}
                    onChange={(e) => setPredictionTargetCampaign(e.target.value)}
                    className="w-full bg-[#111316] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="camp-cobalt-shadow">Operation Cobalt Shadow (APT)</option>
                    <option value="camp-vanguard">Vanguard Crypto Ransomware</option>
                    <option value="camp-volt-typhoon">Volt Typhoon Scams</option>
                  </select>
                </div>

                <button
                  onClick={handlePredictiveIntel}
                  disabled={isPredicting}
                  className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-400/35 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isPredicting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      GENERATING FORECAST...
                    </>
                  ) : (
                    "FORECAST CAMPAIGN EVOLUTION"
                  )}
                </button>
              </div>
            </div>

            {/* Prediction results */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-2xl bg-[#0E1012] border border-white/5 h-full space-y-4">
                <div className="border-b border-white/5 pb-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Emerging Threat Predictive Modeling
                  </h4>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">Calculated future exploitation pathways utilizing cognitive AI models</p>
                </div>

                {predictiveData ? (
                  <div className="space-y-6 pt-2">
                    {/* Metrics row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#111316] border border-white/5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Estimated Expansion Risk</span>
                          <span className={`text-base font-black ${
                            predictiveData.expansionRisk === "Critical" || predictiveData.expansionRisk === "High"
                              ? "text-red-500"
                              : "text-amber-500"
                          }`}>
                            {predictiveData.expansionRisk}
                          </span>
                        </div>
                        <AlertTriangle className="w-6 h-6 text-amber-500/30" />
                      </div>

                      <div className="p-4 bg-[#111316] border border-white/5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Forecast Confidence Score</span>
                          <span className="text-base font-black text-cyan-400">{predictiveData.confidenceScore}%</span>
                        </div>
                        <Sparkles className="w-6 h-6 text-cyan-400/30" />
                      </div>
                    </div>

                    {/* Lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/5">
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-white/40 uppercase block tracking-wider">
                          Emerging Campaign Scam Formats
                        </span>
                        <ul className="space-y-2 text-xs text-white/80 list-disc list-inside">
                          {predictiveData.emergingScams.map((scam, i) => (
                            <li key={i} className="leading-relaxed">{scam}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-white/40 uppercase block tracking-wider">
                          High-Risk Domain Indicators (Pre-emptive)
                        </span>
                        <div className="space-y-2">
                          {predictiveData.highRiskIndicators.map((ind, i) => (
                            <span
                              key={i}
                              className="block p-2 bg-[#111316] border border-white/5 rounded font-mono text-xs text-red-400"
                            >
                              {ind}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-white/30 font-mono text-xs border border-dashed border-white/5 rounded-xl h-64 flex flex-col items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-white/10 mb-3" />
                    Select a monitored campaign and click "Forecast Campaign Evolution" to query predictive AI models.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
