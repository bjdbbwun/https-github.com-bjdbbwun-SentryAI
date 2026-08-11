import { useState, useEffect } from "react";
import {
  Brain, ShieldAlert, Cpu, Flame, Target, Search, RefreshCw, AlertTriangle,
  FileText, Network, Crosshair, HelpCircle, ArrowRight, CheckCircle, HelpCircle as QuestionIcon,
  Layers, Database, Sparkles, AlertOctagon, Link2, Mail, Phone, Lock, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AdversarialSimulationService,
  AseAnalysisResult,
  HeuristicResult,
  MitreMapping
} from "../services/adversarialSimulationService";

interface AseProps {
  language: string;
  theme: "light" | "dark";
}

const PRESET_THREAT_LURES = [
  {
    title: "MFA OAuth Session Hijacking",
    titleAr: "حملة اختطاف مصادقة OAuth الثنائية",
    type: "Email/URL",
    text: "IMPORTANT: Unusual Microsoft account activity detected. Someone from IP 185.220.101.45 attempted to sign into your workspace. You must re-verify your identity and re-authorize single sign-on within 24 hours to secure your corporate credentials: https://secure-microsoft-sso-auth-portal.com/login. Failure to update will result in complete account lockout.",
  },
  {
    title: "Urgent Wire Transfer Fraud (BEC)",
    titleAr: "احتيال تحويل مالي عاجل (BEC)",
    type: "Email",
    text: "Hi, I am in a board meeting right now and cannot take calls. I need you to immediately process a wire transfer of $24,500 to our new marketing vendor's routing account. This invoice is overdue and they threatened legal action if not paid today. Send payment receipt to security@cobalt-gateway.com as soon as complete. Urgent.",
  },
  {
    title: "IRS Legal Warning Scam",
    titleAr: "احتيال تهديد قانوني من مصلحة الضرائب",
    type: "SMS/Phone",
    text: "This is a final warning from the Internal Revenue Service. We have issued an arrest warrant in your name for tax evasion. Federal marshals are scheduled to arrive at your residence. To halt legal prosecution, call the settlement helpline immediately at +1 (202) 555-0143 or routing fee payment to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh.",
  },
  {
    title: "Crypto Trust Wallet Double Reward",
    titleAr: "احتيال مضاعفة العملات الرقمية",
    type: "Telegram/WhatsApp",
    text: "CONGRATULATIONS! Obitrex Global Security has selected your crypto wallet for our exclusive double-yield prize pool! Double your crypto holdings instantly. Claim your free voucher bonus reward now by connecting your Trust Wallet at the official portal link: https://trust-wallet-bonus-claim.xyz/verify. Offer expires soon!",
  }
];

export function AdversarialSimulationEngine({ language, theme }: AseProps) {
  const isArabic = language === "Arabic";
  const [inputText, setInputText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [result, setResult] = useState<AseAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "psychology" | "attacker" | "mitre" | "zero_day" | "correlation">("summary");

  const service = AdversarialSimulationService.getInstance();

  const stages = isArabic
    ? [
        "تشغيل فاحص الموزون الكشفي...",
        "تحديد استراتيجيات التلاعب النفسي...",
        "رسم تكتيكات مصفوفة MITRE ATT&CK...",
        "استخلاص مؤشرات الاختراق ومقارنة ذاكرة Obitrex Wolf...",
        "محاكاة التمدد المستقبلي والتأثير الهيكلي للتهديد..."
      ]
    : [
        "Triggering weighted heuristic scanner...",
        "Identifying cognitive manipulation metrics...",
        "Mapping MITRE ATT&CK vector tactics...",
        "Extracting entities & querying Obitrex Wolf Memory...",
        "Simulating future zero-day expansion models..."
      ];

  useEffect(() => {
    if (analyzing) {
      const interval = setInterval(() => {
        setAnalysisStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [analyzing, stages.length]);

  const handleAnalyze = async (textToScan = inputText) => {
    if (!textToScan || textToScan.trim().length === 0) {
      setError(isArabic ? "الرجاء إدخال نص للتحليل." : "Please enter some text or select a preset lure to analyze.");
      return;
    }

    setError(null);
    setAnalyzing(true);
    setAnalysisStage(0);
    setResult(null);

    try {
      const scanResult = await service.analyzeInput(textToScan, isArabic ? "Arabic" : "English");
      setResult(scanResult);
      setActiveTab("summary");
    } catch (err: any) {
      setError(err.message || "An error occurred during predictive simulation analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const selectPreset = (text: string) => {
    setInputText(text);
    handleAnalyze(text);
  };

  const getRiskColor = (score: number) => {
    if (score > 75) return "text-red-500 border-red-500/20 bg-red-500/5";
    if (score > 50) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    if (score > 25) return "text-yellow-500 border-yellow-500/20 bg-yellow-500/5";
    return "text-cyan-500 border-cyan-500/20 bg-cyan-500/5";
  };

  const getSeverityBg = (sev: string) => {
    const s = sev.toLowerCase();
    if (s === "critical" || s === "high") return "bg-red-500/10 text-red-400 border-red-500/20";
    if (s === "medium") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
  };

  return (
    <div className={`space-y-8 ${isArabic ? "font-cairo" : ""}`} dir={isArabic ? "rtl" : "ltr"}>
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-400/10 rounded-2xl border-2 border-cyan-400/20 shadow-cyan-500/5">
              <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
                {isArabic ? "محرك المحاكاة السلوكية والتنبؤية" : "Adversarial Simulation Engine"}
                <span className="text-[10px] bg-red-500/10 text-red-400 font-bold tracking-widest uppercase border border-red-500/20 px-2 py-0.5 rounded-full">
                  {isArabic ? "ترقية المؤسسات" : "Enterprise Upgrade"}
                </span>
              </h1>
              <p className="text-sm font-bold text-white/50 tracking-wider">
                {isArabic
                  ? "محرك ذكاء اصطناعي متكامل لفك رموز التلاعب المعرفي النفسي، مطابقة MITRE، ورسم أهداف الجناة قبل تأكيد التهديد."
                  : "Cognitive cyber intelligence to analyze attacker intent, cognitive psychology, MITRE vectors, and Zero-Day abuse trajectories."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Input and Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`border rounded-[32px] overflow-hidden p-8 ${theme === "dark" ? "bg-[#0d0e12] border-white/5" : "bg-white border-slate-200"} shadow-2xl space-y-6 relative`}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                {isArabic ? "لوحة مدخلات التهديد المعرفي" : "Adversarial Input Terminal"}
              </span>
              <span className="text-xs font-bold text-white/30 uppercase tracking-widest">
                {isArabic ? "فحص سلوكي حي" : "Real-time Behavioral Scan"}
              </span>
            </div>

            <textarea
              className={`w-full h-48 p-6 rounded-2xl border text-sm font-semibold tracking-wide resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all ${
                theme === "dark"
                  ? "bg-[#15161d] border-white/10 text-white placeholder-white/25"
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
              }`}
              placeholder={
                isArabic
                  ? "قم بلصق محتوى الرسالة، البريد الإلكتروني المشبوه، المعاملات، الروابط، قنوات التليجرام، أو نصوص التهديد لتفكيكها استباقياً..."
                  : "Paste email body, phishing SMS, WhatsApp transcripts, Telegram threat channels, crypto wallet transfers, or suspicious urls..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={analyzing}
            />

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center pt-2">
              <p className="text-xs font-medium text-white/40 max-w-md leading-relaxed">
                {isArabic
                  ? "* يستعمل النظام معالجة هجينة تجمع بين الأوزان الكشفية المحلية المعيارية ونظام تحليل الإدراك المعرفي للذكاء الاصطناعي."
                  : "* Utilizes Obitrex hybrid cognitive analysis running local weighted heuristics coupled with server-side AI intent engines."}
              </p>
              <button
                onClick={() => handleAnalyze()}
                disabled={analyzing || !inputText.trim()}
                className="w-full md:w-auto px-8 py-5 bg-cyan-400 text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 hover:bg-cyan-300 active:scale-95 transition-all disabled:opacity-40"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {isArabic ? "جاري التحليل..." : "Analyzing..."}
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4" />
                    {isArabic ? "محاكاة وتحليل التهديد" : "Simulate & Analyze"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preset Cyber Campaign Cases */}
        <div className="space-y-6">
          <div className={`border rounded-[32px] p-8 h-full flex flex-col justify-between ${theme === "dark" ? "bg-[#0d0e12] border-white/5" : "bg-white border-slate-200"} shadow-xl`}>
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                {isArabic ? "حالات تهديد معيارية للتجربة" : "Preset Threat Campaign Lures"}
              </span>
              <p className="text-xs font-bold text-white/40 leading-relaxed">
                {isArabic
                  ? "انقر فوق إحدى الحالات النموذجية أدناه لإدراجها في المحرك وبدء تحليل الأهداف السلوكية والنفسية ومطابقة مصفوفة MITRE."
                  : "Inject sophisticated credential or financial attack simulations to evaluate cognitive triggers and threat modeling."}
              </p>
            </div>

            <div className="grid gap-3 mt-6">
              {PRESET_THREAT_LURES.map((lure, idx) => (
                <button
                  key={idx}
                  onClick={() => selectPreset(lure.text)}
                  disabled={analyzing}
                  className={`w-full p-4 rounded-2xl text-left border transition-all flex flex-col gap-2 group hover:border-cyan-400/40 relative overflow-hidden ${
                    theme === "dark" ? "bg-[#15161d] border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-black uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                      {isArabic ? lure.titleAr : lure.title}
                    </span>
                    <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md font-bold text-white/60">
                      {lure.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed truncate-3-lines italic">
                    "{lure.text}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay state */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-12 border border-cyan-400/10 rounded-[32px] bg-cyan-950/5 flex flex-col items-center justify-center space-y-6 shadow-inner"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
              <Brain className="w-8 h-8 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-lg font-black uppercase tracking-widest text-white">
                {isArabic ? "محاكاة وتحليل الأهداف السلوكية" : "Cognitive Security Matrix Active"}
              </h3>
              <p className="text-xs font-bold text-cyan-400/80 animate-pulse uppercase tracking-widest min-h-[20px]">
                {stages[analysisStage]}
              </p>
              <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mx-auto mt-4">
                <div
                  className="h-full bg-cyan-400 transition-all duration-1000"
                  style={{ width: `${((analysisStage + 1) / stages.length) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results Display */}
      <AnimatePresence>
        {result && !analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header statistics bar */}
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 p-8 border rounded-[32px] ${
              theme === "dark" ? "bg-[#0d0e12] border-white/5" : "bg-white border-slate-200"
            } shadow-xl`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-cyan-400/10 border-2 border-cyan-400/20 text-cyan-400 font-bold text-2xl relative">
                  <div className="absolute inset-0 bg-cyan-400/5 rounded-2xl animate-ping" />
                  {result.riskScore}%
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/40">
                    {isArabic ? "مؤشر المخاطر التنبؤي" : "Predictive Risk Index"}
                  </h4>
                  <span className={`text-xs font-black uppercase tracking-widest border px-3 py-1 rounded-full inline-block mt-1 ${getRiskColor(result.riskScore)}`}>
                    {result.riskScore > 75 ? (isArabic ? "حرج" : "Critical") : result.riskScore > 50 ? (isArabic ? "مرتفع" : "High") : (isArabic ? "متوسط" : "Medium")}
                  </span>
                </div>
              </div>

              <div className="border-l border-white/5 pl-6 flex flex-col justify-center">
                <h4 className="text-xs font-black uppercase tracking-widest text-white/40">
                  {isArabic ? "نوع التهديد السلوكي" : "Behavioral Threat Type"}
                </h4>
                <p className="text-md font-bold text-white mt-1 capitalize">
                  {result.threatType}
                </p>
              </div>

              <div className="border-l border-white/5 pl-6 flex flex-col justify-center">
                <h4 className="text-xs font-black uppercase tracking-widest text-white/40">
                  {isArabic ? "الحملة المرتبطة" : "Associated Campaign"}
                </h4>
                <p className="text-md font-bold text-cyan-400 mt-1 capitalize">
                  {result.campaign || "None Identified"}
                </p>
              </div>

              <div className="border-l border-white/5 pl-6 flex flex-col justify-center">
                <h4 className="text-xs font-black uppercase tracking-widest text-white/40">
                  {isArabic ? "تقنية الكشف المستعملة" : "Engine Detection Methodology"}
                </h4>
                <p className="text-md font-bold text-amber-400 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {result.analysisType === "AI" ? "Gemini Cognitive AI" : "Obitrex Weighted Heuristics"}
                </p>
              </div>
            </div>

            {/* Navigation Tabs for detailed sections */}
            <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
              {[
                { id: "summary", label: isArabic ? "ملخص الذكاء التفسيري" : "Explainable AI Summary", icon: FileText },
                { id: "psychology", label: isArabic ? "التلاعب النفسي" : "Psychological Profile", icon: Brain },
                { id: "attacker", label: isArabic ? "الملف التعريفي للمهاجم" : "Attacker Profile", icon: Target },
                { id: "mitre", label: isArabic ? "مطابقة مصفوفة MITRE" : "MITRE ATT&CK Mapping", icon: Crosshair },
                { id: "zero_day", label: isArabic ? "المخاطر التنبؤية الصفرية" : "Zero-Day Predictives", icon: Layers },
                { id: "correlation", label: isArabic ? "مصفوفة الارتباط" : "Correlation Graph", icon: Network }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                      isActive
                        ? "bg-cyan-400 text-black border-cyan-400 shadow-md shadow-cyan-400/10"
                        : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Inner Tab contents */}
            <div className={`p-8 border rounded-[32px] ${theme === "dark" ? "bg-[#0d0e12] border-white/5" : "bg-white border-slate-200"} shadow-2xl min-h-[400px]`}>
              
              {/* Tab: SUMMARY */}
              {activeTab === "summary" && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      {isArabic ? "ملخص التحليل التفسيري التنبئي (Explainable AI)" : "Explainable AI Threat Assessment"}
                    </h3>
                    <span className="text-xs text-white/30 font-mono tracking-widest">Obitrex COGNITIVE LABS</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                          {isArabic ? "الملخص التنفيذي" : "Executive Briefing"}
                        </span>
                        <p className="text-sm font-semibold text-white/90 leading-relaxed italic border-l-2 border-cyan-400 pl-4">
                          "{result.aiSummary.executiveSummary}"
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                          {isArabic ? "التحليل السلوكي والتقني" : "Technical Behavioral Breakdown"}
                        </span>
                        <p className="text-xs font-semibold text-white/70 leading-relaxed">
                          {result.aiSummary.technicalSummary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                            {isArabic ? "منظور المهاجم (الأهداف النفسية)" : "Attacker Perspective"}
                          </span>
                          <p className="text-xs font-semibold text-white/80 leading-relaxed">
                            {result.aiSummary.attackerPerspective}
                          </p>
                        </div>
                        <div className="p-cyan-500/5 bg-cyan-500/5 border border-cyan-500/10 rounded-xl space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            {isArabic ? "منظور المدافع وخطط المواجهة" : "Defender Perspective"}
                          </span>
                          <p className="text-xs font-semibold text-white/80 leading-relaxed">
                            {result.aiSummary.defenderPerspective}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 border-l border-white/5 pl-8">
                      <div className="space-y-4">
                        <span className="text-xs font-black uppercase tracking-widest text-white/40 block">
                          {isArabic ? "توصيات الدفاع الاستباقية" : "Actionable Remediation Blueprint"}
                        </span>
                        <div className="grid gap-3">
                          {result.recommendations.map((rec, i) => (
                            <div key={i} className="flex gap-3 items-start text-xs font-semibold text-white/80">
                              <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 space-y-2">
                        <span className="text-xs font-black uppercase tracking-widest text-white/40 block">
                          {isArabic ? "توقعات تطور الهجوم مستقبلاً" : "Evolution Trajectory"}
                        </span>
                        <p className="text-xs text-amber-400/90 font-medium leading-relaxed italic bg-amber-400/5 border border-amber-400/10 p-4 rounded-xl">
                          {result.aiSummary.futureRisk}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: PSYCHOLOGY */}
              {activeTab === "psychology" && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-cyan-400" />
                      {isArabic ? "تحليل استراتيجيات التلاعب النفسي المعرفي" : "Psychological Coercion Mechanics"}
                    </h3>
                    <span className="text-xs text-white/30 font-mono tracking-widest">COGNITIVE MANIPULATION ENGINE</span>
                  </div>

                  <p className="text-xs font-bold text-white/50 max-w-2xl">
                    {isArabic
                      ? "يقيس هذا المحرك أساليب الضغط والابتزاز والتلاعب التي يوظفها الجاني لاختراق درجات الحذر المعرفية الطبيعية للضحية."
                      : "Analyzes the degree of cognitive triggers used by attackers to bypass natural human skepticism and force immediate action."}
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
                    <div className="space-y-6">
                      {[
                        { label: isArabic ? "لغة السلطة والهوية" : "Authority & Brand Trust", val: result.socialEngineering.authority, color: "bg-red-500" },
                        { label: isArabic ? "الضغط الزمني والاستعجال" : "Temporal Pressure & Urgency", val: result.socialEngineering.urgency, color: "bg-amber-500" },
                        { label: isArabic ? "استثارة الثقة الزائفة" : "Artificial Trust Builders", val: result.socialEngineering.trust, color: "bg-yellow-500" },
                        { label: isArabic ? "لغة الخوف والترهيب" : "Fear & Security Coercion", val: result.socialEngineering.fear, color: "bg-red-600" }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                            <span className="text-white/80">{item.label}</span>
                            <span className="text-cyan-400">{item.val}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6">
                      {[
                        { label: isArabic ? "استثارة الطمع أو الفوز" : "Financial Inducement & Greed", val: result.socialEngineering.greed, color: "bg-cyan-500" },
                        { label: isArabic ? "استغلال الفضول والترقب" : "Curiosity & Action Inquiries", val: result.socialEngineering.curiosity, color: "bg-blue-500" },
                        { label: isArabic ? "مفهوم الندرة والفرص المحدودة" : "Scarcity & Expiry Limits", val: result.socialEngineering.scarcity, color: "bg-purple-500" },
                        { label: isArabic ? "أسلوب المعاملة بالمثل" : "Reciprocity Incentives", val: result.socialEngineering.reciprocity, color: "bg-emerald-500" }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                            <span className="text-white/80">{item.label}</span>
                            <span className="text-cyan-400">{item.val}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 mt-8 border border-white/10">
                    <div className="space-y-2 text-center md:text-left">
                      <span className="text-xs font-black uppercase tracking-widest text-cyan-400 block">
                        {isArabic ? "مؤشر التلاعب المعرفي العام" : "Aggregated Cognitive Coercion Index"}
                      </span>
                      <p className="text-xs text-white/50 font-bold">
                        {isArabic
                          ? "يحسب هذا المعيار النسبة الإجمالية لمحاولات اختراق العوامل النفسية للضحية استناداً إلى دلالات المدخلات."
                          : "Calculates the dynamic overall cognitive coercion weighting assigned across all semantic vectors."}
                      </p>
                    </div>
                    <div className="text-5xl font-black italic tracking-tighter text-red-500">
                      {result.socialEngineering.overallManipulationScore}%
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: ATTACKER PROFILE */}
              {activeTab === "attacker" && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-cyan-400" />
                      {isArabic ? "الملف السلوكي التنبئي لجهة التهديد" : "Predictive Attacker Behavioral Profiling"}
                    </h3>
                    <span className="text-xs text-white/30 font-mono tracking-widest">THREAT ACTOR PROFILER</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                        {isArabic ? "مستوى الاحترافية والخبرة" : "Actor Sophistication"}
                      </span>
                      <p className="text-md font-bold text-cyan-400 capitalize">{result.attackerProfile.sophistication}</p>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                        {isArabic ? "الدافع المالي التقديري" : "Financial Motivation"}
                      </span>
                      <p className="text-md font-bold text-red-400 capitalize">{result.attackerProfile.financialMotivation}</p>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                        {isArabic ? "نضج وجودة الحملة" : "Campaign Maturity Stage"}
                      </span>
                      <p className="text-md font-bold text-amber-400 capitalize">{result.attackerProfile.campaignMaturity}</p>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                        {isArabic ? "النطاق المحتمل للاستهداف" : "Potential Attack Scale"}
                      </span>
                      <p className="text-md font-bold text-purple-400 capitalize">{result.attackerProfile.potentialScale}</p>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                        {isArabic ? "الجمهور المستهدف الأساسي" : "Primary Targeted Audience"}
                      </span>
                      <p className="text-sm font-bold text-white/95">{result.attackerProfile.primaryTargetAudience}</p>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                        {isArabic ? "الجمهور المستهدف الثانوي" : "Secondary Target Audience"}
                      </span>
                      <p className="text-sm font-bold text-white/80">{result.attackerProfile.secondaryTargetAudience || "None Identifed"}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                        <span>{isArabic ? "احتمالية سرقة الهويات والاعتمادات" : "Credential Theft Probability"}</span>
                        <span className="text-red-400">{result.attackerProfile.credentialTheftProbability}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400" style={{ width: `${result.attackerProfile.credentialTheftProbability}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                        <span>{isArabic ? "احتمالية احتيال تحويل الأموال والـ BEC" : "BEC / Wire Fraud Probability"}</span>
                        <span className="text-amber-400">{result.attackerProfile.becProbability}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: `${result.attackerProfile.becProbability}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: MITRE ATT&CK */}
              {activeTab === "mitre" && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Crosshair className="w-5 h-5 text-cyan-400" />
                      {isArabic ? "مطابقة تكتيكات وتقنيات مصفوفة MITRE ATT&CK" : "MITRE ATT&CK Vector Classifications"}
                    </h3>
                    <span className="text-xs text-white/30 font-mono tracking-widest">MITRE MATRIX MAPPING</span>
                  </div>

                  <p className="text-xs font-bold text-white/50 max-w-2xl">
                    {isArabic
                      ? "رسم تخطيطي تفصيلي للتقنيات والآليات المحددة التي يستعملها التهديد داخل مصفوفة الأمن العالمية MITRE."
                      : "Direct topological mapping of the behavioral vector into the globally recognized MITRE ATT&CK adversarial catalog."}
                  </p>

                  <div className="grid gap-4 pt-4">
                    {result.mitreMapping.map((mitre: MitreMapping, idx: number) => (
                      <div
                        key={idx}
                        className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-xs font-black rounded-lg">
                              {mitre.techniqueId}
                            </span>
                            <span className="text-sm font-black text-white uppercase tracking-tight">
                              {mitre.techniqueName}
                            </span>
                          </div>
                          <p className="text-xs text-white/70 font-semibold leading-relaxed">
                            {mitre.reason}
                          </p>
                        </div>

                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{isArabic ? "درجة الموثوقية" : "Confidence Rating"}</span>
                          <span className="text-xs font-black text-cyan-400 uppercase mt-1">{mitre.confidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: ZERO-DAY PREDICTIVES */}
              {activeTab === "zero_day" && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-cyan-400" />
                      {isArabic ? "تنبؤات المخاطر الصفرية والتطور المستقبلي" : "Predictive Zero-Day & Mutation Vectors"}
                    </h3>
                    <span className="text-xs text-white/30 font-mono tracking-widest">MUTATION ENGINE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {/* Gauges */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span>{isArabic ? "احتمالية تكرار الحملة لاحقاً" : "Future Abuse Expansion Rate"}</span>
                          <span className="text-cyan-400">{result.zeroDayPrediction.futureAbuseProbability}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: `${result.zeroDayPrediction.futureAbuseProbability}%` }} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span>{isArabic ? "درجة تفرد وجدة التكتيك (Novelty)" : "Tactical Novelty Index"}</span>
                          <span className="text-amber-400">{result.zeroDayPrediction.noveltyScore}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${result.zeroDayPrediction.noveltyScore}%` }} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span>{isArabic ? "درجة مطابقة النماذج التاريخية" : "Similarity to Known Patterns"}</span>
                          <span className="text-purple-400">{result.zeroDayPrediction.similarityToPreviousCampaigns}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400" style={{ width: `${result.zeroDayPrediction.similarityToPreviousCampaigns}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Metadata text */}
                    <div className="space-y-6">
                      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                        <span className="text-xs font-black uppercase tracking-widest text-white/40 block">
                          {isArabic ? "الاتجاه المحتمل لتوسع الحملة" : "Likely Attack Expansion Trajectory"}
                        </span>
                        <p className="text-xs font-semibold text-white/80 leading-relaxed italic border-l-2 border-amber-400 pl-4">
                          "{result.zeroDayPrediction.likelyExpansion}"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                            {isArabic ? "خطورة البنية التحتية للمهاجم" : "Infrastructure Risk Index"}
                          </span>
                          <span className="text-md font-bold text-red-400 capitalize">{result.zeroDayPrediction.infrastructureRisk}</span>
                        </div>
                        <div className="p-5 bg-white/5 border border-white/10 rounded-xl space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                            {isArabic ? "احتمالية رصد حملة موازية" : "Secondary Campaign Probability"}
                          </span>
                          <span className="text-md font-bold text-white">{result.zeroDayPrediction.futureCampaignProbability}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sentry Wolf Memory Match Block */}
                  <div className="p-6 bg-cyan-950/10 border border-cyan-400/20 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <span className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        {isArabic ? "مطابقة وتصنيف ذاكرة الذئب النشطة (Obitrex Wolf Memory)" : "Obitrex Wolf Threat Cluster Intelligence Memory Check"}
                      </span>
                      <span className="text-[10px] bg-cyan-400/20 text-cyan-400 font-bold uppercase tracking-widest border border-cyan-400/30 px-3 py-1 rounded-xl">
                        {isArabic ? "متطابق" : "CORRELATED"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">{isArabic ? "عنقود التهديد المطابق" : "Threat Cluster Match"}</span>
                        <p className="text-xs font-bold text-white capitalize">{result.wolfMemory.threatClusterMatch}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">{isArabic ? "نسبة تطابق التكتيك السلوكي" : "Tactical Correlation Weight"}</span>
                        <p className="text-xs font-bold text-cyan-400">{result.wolfMemory.campaignSimilarityPercentage}%</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">{isArabic ? "عدد الأنماط المطابقة" : "Matching Semantic Patterns"}</span>
                        <p className="text-xs font-bold text-white">{result.wolfMemory.matchingPatternsCount}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">{isArabic ? "سجلات تاريخية مماثلة" : "Historical Detections Found"}</span>
                        <p className="text-xs font-bold text-white">{result.wolfMemory.historicalDetectionsFound}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: CORRELATION MATRIX */}
              {activeTab === "correlation" && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Network className="w-5 h-5 text-cyan-400" />
                      {isArabic ? "رسم بياني بمصفوفة الارتباط واستخلاص الكيانات" : "Entity Relationship & Threat Correlation Matrix"}
                    </h3>
                    <span className="text-xs text-white/30 font-mono tracking-widest">ENTITY CORRELATOR</span>
                  </div>

                  <p className="text-xs font-bold text-white/50 max-w-2xl">
                    {isArabic
                      ? "رصد الروابط والهويات المستخلصة حيوياً من نص التهديد، مثل النطاقات، البريد، محافظ الكريبتو، وأرقام الهواتف."
                      : "Dynamic extraction of suspicious identifiers, networks, wallets, or aliases embedded directly within the adversarial context."}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {/* Domains */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                      <span className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        {isArabic ? "النطاقات / الروابط" : "Extracted Domains / Links"}
                      </span>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {result.correlation.domains.length > 0 ? (
                          result.correlation.domains.map((dom, i) => (
                            <span key={i} className="text-xs font-mono font-bold block bg-white/5 border border-white/10 p-2.5 rounded-xl text-white/90 truncate">
                              {dom}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-semibold text-white/30 italic block py-2">
                            {isArabic ? "لم يتم العثور على نطاقات" : "No domains extracted"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Emails */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                      <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {isArabic ? "العناوين الإلكترونية" : "Extracted Mailboxes"}
                      </span>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {result.correlation.emails.length > 0 ? (
                          result.correlation.emails.map((email, i) => (
                            <span key={i} className="text-xs font-mono font-bold block bg-white/5 border border-white/10 p-2.5 rounded-xl text-white/90 truncate">
                              {email}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-semibold text-white/30 italic block py-2">
                            {isArabic ? "لم يتم العثور على حسابات بريد" : "No mailboxes extracted"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Wallets */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                      <span className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        {isArabic ? "محافظ العملات الرقمية" : "Crypto Ledger Wallets"}
                      </span>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {result.correlation.wallets.length > 0 ? (
                          result.correlation.wallets.map((wallet, i) => (
                            <span key={i} className="text-xs font-mono font-bold block bg-white/5 border border-white/10 p-2.5 rounded-xl text-white/90 truncate">
                              {wallet}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-semibold text-white/30 italic block py-2">
                            {isArabic ? "لم يتم رصد محافظ تشفير" : "No crypto wallets found"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phone Numbers */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                      <span className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {isArabic ? "أرقام هواتف رُصدت" : "Extracted Phone Vectors"}
                      </span>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {result.correlation.phoneNumbers.length > 0 ? (
                          result.correlation.phoneNumbers.map((phone, i) => (
                            <span key={i} className="text-xs font-mono font-bold block bg-white/5 border border-white/10 p-2.5 rounded-xl text-white/90 truncate">
                              {phone}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-semibold text-white/30 italic block py-2">
                            {isArabic ? "لم يتم رصد أرقام هواتف" : "No phone numbers found"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Victm Profiles */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                      <span className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {isArabic ? "شرائح الضحايا المستهدفة" : "Extracted Victim Cohorts"}
                      </span>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {result.correlation.victims.length > 0 ? (
                          result.correlation.victims.map((vic, i) => (
                            <span key={i} className="text-xs font-bold block bg-white/5 border border-white/10 p-2.5 rounded-xl text-white/90 truncate">
                              {vic}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-semibold text-white/30 italic block py-2">
                            {isArabic ? "لم يتم تصنيف شريحة مستهدفة" : "No victim profiles assigned"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Connected Organizations */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                        <Crosshair className="w-4 h-4" />
                        {isArabic ? "المؤسسات والشركات المستهدفة" : "Target Organizations"}
                      </span>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {result.correlation.organizations.length > 0 ? (
                          result.correlation.organizations.map((org, i) => (
                            <span key={i} className="text-xs font-bold block bg-white/5 border border-white/10 p-2.5 rounded-xl text-white/90 truncate">
                              {org}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-semibold text-white/30 italic block py-2">
                            {isArabic ? "لم يتم تحديد شركات مستهدفة" : "No companies identified"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Evidence items timeline panel */}
            <div className={`p-8 border rounded-[32px] ${theme === "dark" ? "bg-[#0d0e12] border-white/5" : "bg-white border-slate-200"} shadow-xl space-y-6`}>
              <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-cyan-400" />
                {isArabic ? "قائمة الأدلة والمؤشرات المجمعة (Heuristic & Threat Evidence Logs)" : "Heuristic & Threat Evidence Log Timeline"}
              </h3>

              <div className="grid gap-4">
                {result.evidence.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold text-white/80"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-white/40 uppercase tracking-widest text-[9px] font-black">{item.evidenceType}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 rounded ${getSeverityBg(item.severity)}`}>
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-xs text-white/90">{item.reason}</p>
                    </div>

                    <div className="flex items-center gap-6 text-white/40 flex-shrink-0 font-mono text-[10px]">
                      <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                        {item.source}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
