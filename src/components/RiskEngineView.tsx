import { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Zap, Sparkles, Activity, 
  FileText, Layers, Settings, Globe, Mail, Users, Radio, Terminal, 
  Sliders, ArrowRight, Clock, Brain, PlusCircle, Copy, Play, CheckCircle2,
  SlidersHorizontal, RefreshCw, AlertOctagon, ListFilter, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RiskEngineInput, 
  RiskWeights, 
  RiskEngineResult, 
  DEFAULT_WEIGHTS, 
  PRESET_SCENARIOS, 
  calculateDeterministicRisk, 
  calculateAIRisk,
  ReputationLevel,
  ThreatFeedStatus,
  ThreatAgeLevel,
  BehaviorType
} from '../services/riskEngineService';
import { AIDecisionExplanationView } from './AIDecisionExplanationView';

interface RiskEngineViewProps {
  language: string;
  theme: 'light' | 'dark';
}

export function RiskEngineView({ language, theme }: RiskEngineViewProps) {
  const isRTL = language === 'Arabic';
  
  // 1. Inputs State
  const [assetName, setAssetName] = useState("Operation OAuth Shadow");
  const [domain, setDomain] = useState("secure-okta-auth-renew.com");
  const [domainRep, setDomainRep] = useState<ReputationLevel>("Malicious");
  const [email, setEmail] = useState("it-support@secure-okta-auth-renew.com");
  const [emailRep, setEmailRep] = useState<ReputationLevel>("Malicious");
  const [feedStatus, setFeedStatus] = useState<ThreatFeedStatus>("Blacklisted (SANS/Spamhaus)");
  const [reportsCount, setReportsCount] = useState(42);
  const [threatAge, setThreatAge] = useState<ThreatAgeLevel>("Zero-Day (0-3 days)");
  const [behavior, setBehavior] = useState<BehaviorType>("Credential Harvesting");
  const [aiText, setAiText] = useState("URGENT Security update required. We have detected unauthorized attempts on your mailbox. You must click here to re-verify your Okta credentials immediately to avoid lock-out.");

  // 2. Weights State
  const [weights, setWeights] = useState<RiskWeights>(DEFAULT_WEIGHTS);
  const [showWeightTuner, setShowWeightTuner] = useState(false);
  const [useAI, setUseAI] = useState(true);

  // 3. Execution & Calculation States
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationStep, setCalculationStep] = useState(0);
  const [currentLogs, setCurrentLogs] = useState<string[]>([]);
  const [result, setResult] = useState<RiskEngineResult | null>(null);

  // Initialize with a default run
  useEffect(() => {
    handleCalculate(true); // run quick baseline instantly
  }, []);

  // Recalculate instantly if user adjusts weights dynamically
  const handleWeightChange = (key: keyof RiskWeights, val: number) => {
    const updatedWeights = { ...weights, [key]: val };
    setWeights(updatedWeights);
    
    // Perform rapid in-memory recalculation
    const input: RiskEngineInput = {
      name: assetName,
      domain,
      domainReputation: domainRep,
      email,
      emailReputation: emailRep,
      threatFeedStatus: feedStatus,
      userReportsCount: reportsCount,
      aiAnalysisInput: aiText,
      threatAge,
      behavior
    };
    
    // We update results immediately
    const quickResult = calculateDeterministicRisk(input, updatedWeights);
    setResult(prev => {
      if (!prev) return quickResult;
      return {
        ...quickResult,
        aiSummary: prev.aiSummary, // preserve active AI summary if available
        calculationLogs: ["Dynamic Weights recalibrated.", ...quickResult.calculationLogs]
      };
    });
  };

  // Preset Scenario Loader
  const loadScenario = (scen: typeof PRESET_SCENARIOS[0]) => {
    setAssetName(scen.input.name);
    setDomain(scen.input.domain);
    setDomainRep(scen.input.domainReputation);
    setEmail(scen.input.email);
    setEmailRep(scen.input.emailReputation);
    setFeedStatus(scen.input.threatFeedStatus);
    setReportsCount(scen.input.userReportsCount);
    setThreatAge(scen.input.threatAge);
    setBehavior(scen.input.behavior);
    setAiText(scen.input.aiAnalysisInput);
    
    // Run quick recalculation instantly
    const quickResult = calculateDeterministicRisk(scen.input, weights);
    setResult(quickResult);
  };

  // Perform detailed Risk calculation with animated console simulation
  const handleCalculate = async (instant = false) => {
    const input: RiskEngineInput = {
      name: assetName,
      domain,
      domainReputation: domainRep,
      email,
      emailReputation: emailRep,
      threatFeedStatus: feedStatus,
      userReportsCount: reportsCount,
      aiAnalysisInput: aiText,
      threatAge,
      behavior
    };

    if (instant) {
      const quickResult = calculateDeterministicRisk(input, weights);
      setResult(quickResult);
      return;
    }

    setIsCalculating(true);
    setCalculationStep(0);
    setCurrentLogs([]);

    const traceLogs = [
      "⚡ AMANOVA risk evaluation thread triggered.",
      `🔍 Target Asset registered: "${input.name}"`,
      `🌐 Resolving reputation score for domain: "${input.domain}"`,
      `📧 Analyzing mailbox parameters for sender: "${input.email}"`,
      "📡 Pinging threat intelligence feeds (Spamhaus, AbuseIPDB)...",
      `📊 Analyzing ${input.userReportsCount} community user incident flags...`,
      `🧠 Triggering ${useAI ? "Cognitive Gemini Parser" : "Signature Heuristic Analyzer"} to parse behavioral patterns...`,
      `⏳ Calibrating decay functions based on age gap: "${input.threatAge}"`,
      "⚖️ Applying interactive risk engine metric weight configurations...",
      "🔬 Normalizing data and synthesizing threat metrics..."
    ];

    // Simulate logs drawing step-by-step for a realistic cyber experience
    for (let i = 0; i < traceLogs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 200));
      setCurrentLogs(prev => [...prev, traceLogs[i]]);
      setCalculationStep(i + 1);
    }

    try {
      let finalRes: RiskEngineResult;
      if (useAI) {
        finalRes = await calculateAIRisk(input, weights);
      } else {
        finalRes = calculateDeterministicRisk(input, weights);
      }
      
      // Inject simulated logs alongside actual service results
      finalRes.calculationLogs = [...traceLogs, ...finalRes.calculationLogs];
      setResult(finalRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  // Color mappings
  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'text-red-400 border-red-400/20 bg-red-400/10 shadow-red-500/10';
      case 'High': return 'text-orange-400 border-orange-400/20 bg-orange-400/10 shadow-orange-500/10';
      case 'Medium': return 'text-amber-400 border-amber-400/20 bg-amber-400/10 shadow-amber-500/10';
      default: return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10 shadow-emerald-500/10';
    }
  };

  const getPriorityColor = (pr: string) => {
    switch (pr) {
      case 'Immediate': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'High': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    }
  };

  return (
    <div id="risk-engine-hub" className="space-y-8 text-left">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            AMANOVA Core Systems
          </span>
          <h2 className="text-2xl font-black uppercase text-white mt-1">
            {isRTL ? 'محرك المخاطر التفاعلي' : 'Cognitive Risk Engine'}
          </h2>
          <p className="text-xs text-white/50 max-w-xl mt-1">
            {isRTL 
              ? 'احسب واختبر مخاطر التهديدات بدقة باستخدام سمعة النطاقات والبريد، بلاغات المستخدمين، والذكاء الاصطناعي مع إمكانية تعديل الأوزان بشكل مباشر.' 
              : 'Evaluate enterprise assets against key risk metrics, configure mathematical weights dynamically, and observe computed risk thresholds in real-time.'
            }
          </p>
        </div>
        
        {/* Toggle between AI / Heuristics mode */}
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-2 rounded-xl shrink-0">
          <button
            onClick={() => setUseAI(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              useAI 
                ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            {isRTL ? 'تحليل ذكي' : 'Cognitive AI'}
          </button>
          <button
            onClick={() => setUseAI(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              !useAI 
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' 
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            {isRTL ? 'محدد محلي' : 'Local Rules'}
          </button>
        </div>
      </div>

      {/* Preset Scenarios Selector Quick Loader */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
          <ListFilter className="w-3.5 h-3.5 text-cyan-400" />
          {isRTL ? 'تحميل سيناريو تهديد محاكي' : 'Load Simulation Scenario Templates'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_SCENARIOS.map((scen) => {
            const isLoaded = assetName === scen.input.name;
            return (
              <div
                key={scen.id}
                onClick={() => loadScenario(scen)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none text-left relative group ${
                  isLoaded 
                    ? 'bg-gradient-to-br from-cyan-950/30 to-black/40 border-cyan-400/50 shadow-md shadow-cyan-950/20' 
                    : 'bg-[#0E1012] border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                }`}
              >
                {isLoaded && (
                  <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                )}
                <span className={`text-[9px] font-mono uppercase font-black tracking-wider ${
                  isLoaded ? 'text-cyan-400' : 'text-white/30 group-hover:text-white/60'
                }`}>
                  {scen.input.behavior}
                </span>
                <h5 className="text-xs font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                  {scen.title}
                </h5>
                <p className="text-[10px] text-white/50 line-clamp-2 mt-1 leading-normal">
                  {scen.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Config Panel Left, Display Analytics Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Asset Configurator (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#0E1012] border border-white/5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-extrabold uppercase text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                {isRTL ? 'تكوين معاملات التهديد' : 'Threat Parameter Configurator'}
              </h3>
              
              <button
                onClick={() => setShowWeightTuner(!showWeightTuner)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  showWeightTuner 
                    ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/40' 
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                {isRTL ? 'تعديل الأوزان' : 'Tweak Weights'}
              </button>
            </div>

            {/* WEIGHT TUNER EXPANDABLE PANEL */}
            <AnimatePresence>
              {showWeightTuner && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/[0.01] border border-cyan-400/10 p-4 rounded-xl space-y-4 overflow-hidden mb-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      Interactive Mathematical Sliders
                    </span>
                    <button
                      onClick={() => setWeights(DEFAULT_WEIGHTS)}
                      className="text-[9px] font-mono text-white/30 hover:text-cyan-400 uppercase font-bold"
                    >
                      Reset Defaults
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Domain Weight */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                        <span>Domain Reputation Weight</span>
                        <span className="text-cyan-400 font-bold">{weights.domainWeight}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={weights.domainWeight}
                        onChange={(e) => handleWeightChange("domainWeight", parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-white/5 h-1 rounded"
                      />
                    </div>

                    {/* Email Weight */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                        <span>Email Reputation Weight</span>
                        <span className="text-cyan-400 font-bold">{weights.emailWeight}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={weights.emailWeight}
                        onChange={(e) => handleWeightChange("emailWeight", parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-white/5 h-1 rounded"
                      />
                    </div>

                    {/* Feed Match Weight */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                        <span>Threat Feeds Weight</span>
                        <span className="text-cyan-400 font-bold">{weights.feedWeight}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={weights.feedWeight}
                        onChange={(e) => handleWeightChange("feedWeight", parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-white/5 h-1 rounded"
                      />
                    </div>

                    {/* User Reports Weight */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                        <span>User Reports Weight</span>
                        <span className="text-cyan-400 font-bold">{weights.reportsWeight}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={weights.reportsWeight}
                        onChange={(e) => handleWeightChange("reportsWeight", parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-white/5 h-1 rounded"
                      />
                    </div>

                    {/* AI Anomaly Weight */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                        <span>AI Cognitive Parser Weight</span>
                        <span className="text-cyan-400 font-bold">{weights.aiWeight}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={weights.aiWeight}
                        onChange={(e) => handleWeightChange("aiWeight", parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-white/5 h-1 rounded"
                      />
                    </div>

                    {/* Threat Age Weight */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                        <span>Threat Age Weight</span>
                        <span className="text-cyan-400 font-bold">{weights.ageWeight}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={weights.ageWeight}
                        onChange={(e) => handleWeightChange("ageWeight", parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-white/5 h-1 rounded"
                      />
                    </div>

                    {/* Behavioral Signature Weight */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                        <span>Observed Behavior Weight</span>
                        <span className="text-cyan-400 font-bold">{weights.behaviorWeight}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={weights.behaviorWeight}
                        onChange={(e) => handleWeightChange("behaviorWeight", parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-white/5 h-1 rounded"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CONFIG FIELDS */}
            <div className="space-y-4">
              
              {/* Asset Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block">Threat Asset Name</label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g. Operation Cobalt Shadow"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-bold"
                />
              </div>

              {/* Domain Config */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block">Target Domain URL</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. domain.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block">Domain Reputation</label>
                  <select
                    value={domainRep}
                    onChange={(e) => setDomainRep(e.target.value as ReputationLevel)}
                    className="w-full bg-[#151619] border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-bold"
                  >
                    <option value="Safe">Safe / High Trust Authority</option>
                    <option value="Neutral">Neutral / Untested Domain</option>
                    <option value="Suspicious">Suspicious / Gapped Records</option>
                    <option value="Malicious">Malicious / Blacklisted Domain</option>
                  </select>
                </div>
              </div>

              {/* Email Config */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block">Sender Email Address</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@domain.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block">Email Reputation</label>
                  <select
                    value={emailRep}
                    onChange={(e) => setEmailRep(e.target.value as ReputationLevel)}
                    className="w-full bg-[#151619] border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-bold"
                  >
                    <option value="Safe">Safe / Verified Domain SPF</option>
                    <option value="Neutral">Neutral / Standard Inbox</option>
                    <option value="Suspicious">Suspicious / Spam Triggers</option>
                    <option value="Malicious">Malicious / Phishing Spammer</option>
                  </select>
                </div>
              </div>

              {/* Threat Feeds & User Reports */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block">Threat Intelligence Feeds</label>
                  <select
                    value={feedStatus}
                    onChange={(e) => setFeedStatus(e.target.value as ThreatFeedStatus)}
                    className="w-full bg-[#151619] border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-bold"
                  >
                    <option value="Clean">Clean (No matching feed logs)</option>
                    <option value="Listed (Minor)">Listed in local reputation indexes</option>
                    <option value="Listed (High Abuse)">Listed in active AbuseIPDB/Threat database</option>
                    <option value="Blacklisted (SANS/Spamhaus)">Blacklisted on Spamhaus / SANS gateways</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block">User Reports Flag Count</label>
                    <span className="text-cyan-400 font-bold font-mono text-[10px]">{reportsCount} flags</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={reportsCount}
                    onChange={(e) => setReportsCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-mono"
                  />
                </div>
              </div>

              {/* Threat Age & Obs Behavior */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block">Threat Age Window</label>
                  <select
                    value={threatAge}
                    onChange={(e) => setThreatAge(e.target.value as ThreatAgeLevel)}
                    className="w-full bg-[#151619] border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-bold"
                  >
                    <option value="Zero-Day (0-3 days)">Zero-Day (0-3 days) - Extremely Active</option>
                    <option value="Fresh (4-14 days)">Fresh Threat (4-14 days)</option>
                    <option value="Active (15-90 days)">Active / Tracked (15-90 days)</option>
                    <option value="Aged (>90 days)">Aged / Outdated (&gt;90 days)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block">Observed Behavioral Signature</label>
                  <select
                    value={behavior}
                    onChange={(e) => setBehavior(e.target.value as BehaviorType)}
                    className="w-full bg-[#151619] border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-bold"
                  >
                    <option value="Safe / Benign">Safe / Benign Activity</option>
                    <option value="Spam / Adware">Spam / Adware Dissemination</option>
                    <option value="Urgency / Social Pressure">Urgency / Social Pressure Pretext</option>
                    <option value="Fake Alert / System Spoof">Fake Alert / Local System Spoof</option>
                    <option value="Credential Harvesting">Credential Harvesting Forms</option>
                    <option value="Remote Shell Execution">Remote Shell Execution Payload</option>
                    <option value="Ransomware / Encryption">Ransomware / Encrypted Payload</option>
                  </select>
                </div>
              </div>

              {/* Suspicious content input area */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block">
                  AI Cognitive Context Input (Email Body / Server Logs / Shellcode)
                </label>
                <textarea
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Paste details of the threat (suspicious phrasing, behavior signatures, emails, terminal warnings) to invoke AMANOVA cognitive calculations..."
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-sans leading-relaxed"
                />
              </div>

            </div>

            {/* Calculate Button */}
            <button
              onClick={() => handleCalculate()}
              disabled={isCalculating}
              className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                isCalculating 
                  ? 'bg-cyan-500/10 text-cyan-400/50 cursor-not-allowed border border-cyan-400/20' 
                  : 'bg-cyan-400 text-black hover:bg-cyan-300 shadow-cyan-500/10 hover:scale-[1.01]'
              }`}
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing threat vectors...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Evaluate & Calculate Risk
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Calculations display trace / final report (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* Show logs trace if actively calculating */}
            {isCalculating ? (
              <motion.div
                key="calculating-trace"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 bg-[#0E1012] border border-cyan-400/20 rounded-2xl space-y-4"
              >
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                  <Terminal className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                      RISK EVALUATION THREAD IN PROGRESS
                    </h3>
                    <p className="text-[10px] text-white/40">AMANOVA core pipeline processing algorithms</p>
                  </div>
                </div>

                <div className="p-4 bg-black/40 rounded-xl font-mono text-[11px] text-cyan-400/80 space-y-2 h-[340px] overflow-y-auto border border-white/5 flex flex-col justify-end">
                  {currentLogs.map((log, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2"
                    >
                      <span className="text-white/30 shrink-0">[{idx + 1}]</span>
                      <p>{log}</p>
                    </motion.div>
                  ))}
                  
                  {/* Blinking console cursor */}
                  <div className="flex items-center gap-1 mt-1 text-cyan-400 animate-pulse">
                    <span>&gt; AMANOVA_RISK_DAEMON_ONLINE</span>
                    <div className="w-1.5 h-3 bg-cyan-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-mono text-white/35">Running calculations matrix...</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{Math.round((calculationStep / 10) * 100)}% Complete</span>
                </div>
              </motion.div>
            ) : result ? (
              
              /* Show calculations results report */
              <motion.div
                key="calculated-results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Result Overview Card */}
                <div className="p-6 bg-[#0E1012] border border-white/5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/5 rounded-full blur-[90px] pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-5 mb-5">
                    
                    {/* Gauge and Score Display */}
                    <div className="flex items-center gap-4">
                      {/* Circle Gauge graphic representing Risk Score */}
                      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="40" cy="40" r="34"
                            className="stroke-white/5 fill-none"
                            strokeWidth="6"
                          />
                          <circle
                            cx="40" cy="40" r="34"
                            className={`fill-none transition-all duration-1000 ${
                              result.riskScore >= 85 ? 'stroke-red-500 shadow-red-500/25' :
                              result.riskScore >= 65 ? 'stroke-orange-500' :
                              result.riskScore >= 35 ? 'stroke-amber-500' : 'stroke-emerald-400'
                            }`}
                            strokeWidth="6"
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={2 * Math.PI * 34 * (1 - result.riskScore / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xl font-black text-white block tracking-tighter leading-none">
                            {result.riskScore}
                          </span>
                          <span className="text-[8px] font-mono text-white/40 uppercase block leading-none mt-0.5">
                            Index
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">AMANOVA Calculation Outcome</span>
                        <h3 className="text-lg font-extrabold text-white mt-0.5">Threat Asset Evaluated</h3>
                        <p className="text-[10px] font-mono text-white/35 mt-0.5">Hash Id: RISK-{Math.floor(100000 + Math.random() * 900000)}</p>
                      </div>
                    </div>

                    {/* Quick Core Badges */}
                    <div className="flex flex-wrap gap-2 sm:self-center shrink-0">
                      <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase text-center min-w-[75px] ${getSeverityColor(result.severity)}`}>
                        <span className="text-[8px] opacity-40 block">Severity</span>
                        <span className="mt-0.5 block">{result.severity}</span>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase text-center min-w-[75px] ${getPriorityColor(result.priority)}`}>
                        <span className="text-[8px] opacity-40 block">Priority</span>
                        <span className="mt-0.5 block">{result.priority}</span>
                      </div>
                    </div>

                  </div>

                  {/* Confidence block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-cyan-400/10 text-cyan-400 rounded-lg">
                        <Radio className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-white/40 uppercase block">Analysis Confidence</span>
                        <span className="text-xs font-black text-white block uppercase tracking-wider">{result.confidence} Confidence ({result.confidenceScore}%)</span>
                      </div>
                    </div>
                    
                    {/* Tiny visual confidence level bar */}
                    <div className="self-center">
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            result.confidence === 'High' ? 'bg-cyan-400' :
                            result.confidence === 'Medium' ? 'bg-amber-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${result.confidenceScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Contribution Map */}
                <div className="p-6 bg-[#0E1012] border border-white/5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2 flex justify-between items-center">
                    <span>Interactive Risk Score Contribution Matrix</span>
                    <span className="text-[10px] text-white/30 font-bold uppercase font-mono">Normalized Weight Breakdown</span>
                  </h4>

                  <div className="space-y-3.5 text-[11px]">
                    
                    {/* Domain Reputation row */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-white/70">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          Domain Reputation Score
                        </span>
                        <span className="font-bold">
                          {result.breakdown.domainScore} / 100 <span className="text-cyan-400/60 text-[10px]">({Math.round(result.breakdown.domainScore * (weights.domainWeight / 100))} pts contribution)</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden relative">
                        <div className="h-full bg-cyan-400/80 rounded-full" style={{ width: `${result.breakdown.domainScore}%` }} />
                        <div className="absolute top-0 bottom-0 right-0 w-[15%] border-l border-white/10" title="Ideal range border" />
                      </div>
                    </div>

                    {/* Email Reputation row */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-white/70">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          Email Reputation Score
                        </span>
                        <span className="font-bold">
                          {result.breakdown.emailScore} / 100 <span className="text-cyan-400/60 text-[10px]">({Math.round(result.breakdown.emailScore * (weights.emailWeight / 100))} pts)</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400/80 rounded-full" style={{ width: `${result.breakdown.emailScore}%` }} />
                      </div>
                    </div>

                    {/* Threat Feeds row */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-white/70">
                        <span className="flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          Threat Feeds Matches
                        </span>
                        <span className="font-bold">
                          {result.breakdown.feedScore} / 100 <span className="text-cyan-400/60 text-[10px]">({Math.round(result.breakdown.feedScore * (weights.feedWeight / 100))} pts)</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400/80 rounded-full" style={{ width: `${result.breakdown.feedScore}%` }} />
                      </div>
                    </div>

                    {/* User Reports row */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-white/70">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          User Incident Report Index
                        </span>
                        <span className="font-bold">
                          {result.breakdown.reportsScore} / 100 <span className="text-cyan-400/60 text-[10px]">({Math.round(result.breakdown.reportsScore * (weights.reportsWeight / 100))} pts)</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400/80 rounded-full" style={{ width: `${result.breakdown.reportsScore}%` }} />
                      </div>
                    </div>

                    {/* AI Cognitive row */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-white/70">
                        <span className="flex items-center gap-1.5">
                          <Brain className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          AI Anomaly & Cognitive Score
                        </span>
                        <span className="font-bold">
                          {result.breakdown.aiScore} / 100 <span className="text-cyan-400/60 text-[10px]">({Math.round(result.breakdown.aiScore * (weights.aiWeight / 100))} pts)</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400/80 rounded-full" style={{ width: `${result.breakdown.aiScore}%` }} />
                      </div>
                    </div>

                    {/* Threat Age row */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-white/70">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          Threat Age Window Urgency
                        </span>
                        <span className="font-bold">
                          {result.breakdown.ageScore} / 100 <span className="text-cyan-400/60 text-[10px]">({Math.round(result.breakdown.ageScore * (weights.ageWeight / 100))} pts)</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400/80 rounded-full" style={{ width: `${result.breakdown.ageScore}%` }} />
                      </div>
                    </div>

                    {/* Obs Behavior row */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-white/70">
                        <span className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          Observed Behavior Threat Class
                        </span>
                        <span className="font-bold">
                          {result.breakdown.behaviorScore} / 100 <span className="text-cyan-400/60 text-[10px]">({Math.round(result.breakdown.behaviorScore * (weights.behaviorWeight / 100))} pts)</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400/80 rounded-full" style={{ width: `${result.breakdown.behaviorScore}%` }} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* SentryAI Cognitive Threat Analysis Summary */}
                <div className="p-6 bg-gradient-to-r from-cyan-950/25 to-black/30 border border-cyan-400/15 rounded-2xl relative">
                  <div className="absolute top-4 right-4 bg-cyan-400/10 border border-cyan-400/20 rounded px-2 py-0.5 text-[8px] font-black uppercase text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-spin-slow" />
                    Cognitive AI Briefing
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">Cognitive Security Briefing</span>
                    <p className="text-xs text-white/80 leading-relaxed font-sans pr-16 whitespace-pre-line">
                      {result.aiSummary || "Calculated secure baseline metrics. Asset exhibits standard behavior profiles with weighted priority locks active."}
                    </p>
                  </div>
                </div>

                {/* SentryAI Cognitive Decision Intelligence */}
                <AIDecisionExplanationView 
                  decision={result.aiDecision} 
                  fallbackTitle={assetName} 
                  explainableAI={result.explainableAI}
                  language={language}
                />

                {/* Technical Diagnostic Evidence */}
                <div className="p-6 bg-[#0E1012] border border-white/5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">
                    Observed Threat Evidence Logs ({result.evidence.length})
                  </h4>
                  <ul className="space-y-2.5 text-xs text-white/70">
                    {result.evidence.map((ev, i) => (
                      <li key={i} className="flex items-start gap-2.5 font-sans leading-normal">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400/80 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(248,113,113,0.6)]" />
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mitigation & Lockdown Protocols */}
                <div className="p-6 bg-[#0E1012] border border-white/5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-2">
                    Enterprise Defensive Lockdown Protocols ({result.mitigationSteps.length})
                  </h4>
                  <div className="space-y-3 text-xs text-white/80">
                    {result.mitigationSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                        <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded-md shrink-0 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase block">Protocol #{i + 1}</span>
                          <p className="font-sans leading-relaxed text-white">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trace Audit Logs footer accordion */}
                <div className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400/50" />
                    <span>Calculations Thread Audit Logs</span>
                  </div>
                  <div className="max-h-24 overflow-y-auto pr-1 text-[9px] font-mono text-white/40 space-y-1">
                    {result.calculationLogs.map((log, i) => (
                      <div key={i}>&gt; {log}</div>
                    ))}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-black/10 text-white/20 p-8 text-center">
                <Sliders className="w-12 h-12 text-white/10 mb-3 animate-pulse" />
                <p className="text-xs font-mono uppercase tracking-widest">Awaiting threat configurations...</p>
                <p className="text-[10px] text-white/40 mt-1 max-w-sm">Load a simulation template or enter customized inputs, then press "Evaluate" to compute mathematical risk variables.</p>
              </div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
