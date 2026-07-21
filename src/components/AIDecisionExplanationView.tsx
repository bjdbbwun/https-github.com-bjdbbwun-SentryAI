import React from "react";
import { motion } from "motion/react";
import { 
  Brain, 
  Fingerprint, 
  Cpu, 
  ShieldAlert, 
  CheckSquare,
  Sparkles,
  HelpCircle,
  FileText
} from "lucide-react";

export interface ExplainableAIData {
  why: string;
  how: string;
  supportingEvidence: string[];
  alternativePossibilities: string;
  confidenceJustification: string;
  detailedRecommendations: string[];
}

interface AIDecisionData {
  whyDetected: string;
  evidence: string[];
  matchedPatterns: string[];
  riskFactors: string[];
  recommendedActions: string[];
}

interface AIDecisionExplanationViewProps {
  decision?: AIDecisionData;
  fallbackTitle?: string;
  explainableAI?: ExplainableAIData;
  language?: string;
}

export function AIDecisionExplanationView({ 
  decision, 
  fallbackTitle = "Threat Asset Evaluated",
  explainableAI,
  language = "English"
}: AIDecisionExplanationViewProps) {
  if (!decision) {
    return (
      <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl text-center text-white/40 text-xs">
        No structured cognitive decision data is available for this run.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Main Header Container with Ambient Backglow */}
      <div className="p-6 bg-gradient-to-br from-[#121820]/80 to-[#0A0D12] border border-cyan-400/20 rounded-2xl relative overflow-hidden shadow-xl shadow-cyan-500/5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-400/10 text-cyan-400 rounded-xl border border-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">Cognitive Logic Engine</span>
              <h4 className="text-sm font-black text-white tracking-tight">AI Decision Intelligence Explanation</h4>
            </div>
          </div>
          <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-spin-slow" />
            Active Brain Mode
          </div>
        </div>

        {/* 1. WHY DETECTED */}
        <div className="space-y-2 p-4 bg-[#14232C]/30 border border-cyan-500/10 rounded-xl">
          <div className="flex items-center gap-2 text-cyan-400">
            <HelpCircle className="w-4 h-4 shrink-0 text-cyan-400" />
            <span className="text-[10px] font-mono font-black uppercase tracking-wider">1. Why Detected / Threat Context</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium whitespace-pre-line">
            {decision.whyDetected || "Triggered due to anomalous multi-vector reputation metrics and high pressure natural language cues."}
          </p>
        </div>
      </div>

      {/* Grid for Evidence (2) & Matched Patterns (3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 2. EVIDENCE */}
        <div className="p-5 bg-[#0E1012] border border-white/5 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-2 text-red-400 pb-2 border-b border-white/5">
            <Fingerprint className="w-4 h-4 text-red-400" />
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-red-400">2. Specific Evidence Found</span>
          </div>
          <ul className="space-y-2.5 text-xs text-white/70">
            {decision.evidence && decision.evidence.length > 0 ? (
              decision.evidence.map((ev, i) => (
                <li key={i} className="flex items-start gap-2.5 font-sans leading-normal">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400/80 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(248,113,113,0.6)]" />
                  <span className="text-slate-300 font-medium">{ev}</span>
                </li>
              ))
            ) : (
              <li className="text-white/30 text-[11px] font-mono">No specific evidence points parsed.</li>
            )}
          </ul>
        </div>

        {/* 3. MATCHED PATTERNS */}
        <div className="p-5 bg-[#0E1012] border border-white/5 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-2 text-amber-400 pb-2 border-b border-white/5">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400">Evidence</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {decision.matchedPatterns && decision.matchedPatterns.length > 0 ? (
              decision.matchedPatterns.map((pat, i) => (
                <div 
                  key={i} 
                  className="px-2.5 py-1.5 bg-amber-500/5 border border-amber-500/20 text-amber-400 rounded-xl text-[10px] font-mono font-black flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0 animate-pulse" />
                  {pat}
                </div>
              ))
            ) : (
              <span className="text-white/30 text-[11px] font-mono">No attack patterns classified.</span>
            )}
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed font-sans pt-1">
            Patterns mapped against AMANOVA's global tactics, techniques, and procedures (TTP) registry matrix.
          </p>
        </div>
      </div>

      {/* Grid for Risk Factors (4) & Recommended Actions (5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 4. RISK FACTORS */}
        <div className="p-5 bg-[#0E1012] border border-white/5 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-2 text-orange-400 pb-2 border-b border-white/5">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-orange-400">4. Critical Risk Factors</span>
          </div>
          <ul className="space-y-2.5 text-slate-300 text-xs">
            {decision.riskFactors && decision.riskFactors.length > 0 ? (
              decision.riskFactors.map((rf, i) => (
                <li key={i} className="flex items-start gap-2.5 font-sans leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400/80 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
                  <span className="font-semibold">{rf}</span>
                </li>
              ))
            ) : (
              <li className="text-white/30 text-[11px] font-mono">No secondary risk factors triggered.</li>
            )}
          </ul>
        </div>

        {/* 5. RECOMMENDED ACTIONS */}
        <div className="p-5 bg-[#0E1012] border border-white/5 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-white/5">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-400">5. Prioritized Recommended Actions</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {decision.recommendedActions && decision.recommendedActions.length > 0 ? (
              decision.recommendedActions.map((act, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 bg-white/[0.01] border border-white/5 rounded-xl">
                  <div className="p-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 shrink-0 mt-0.5 font-mono text-[9px] font-bold px-1.5">
                    Step {i + 1}
                  </div>
                  <p className="font-sans font-medium text-slate-200 leading-relaxed">{act}</p>
                </div>
              ))
            ) : (
              <span className="text-white/30 text-[11px] font-mono">No immediate remediation tasks required.</span>
            )}
          </div>
        </div>

        {/* 6. EXPLAINABLE AI FORENSIC REASONING */}
        {explainableAI && (
          <div className="p-6 bg-[#0B0D0F] border border-cyan-500/10 rounded-2xl space-y-4 shadow-[0_0_15px_rgba(34,211,238,0.02)] col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 text-cyan-400 pb-2.5 border-b border-white/5">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-cyan-400">
                {language === "Arabic" ? "لماذا هذه النتيجة؟" : "Why this result?"}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Cognitive Why & How */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="font-mono font-black text-[10px] text-cyan-300/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" />
                    {language === "Arabic" ? "لماذا هذه النتيجة؟" : "Why this result?"}
                  </h4>
                  <p className="text-slate-300 font-sans font-medium leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                    {explainableAI.why}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-mono font-black text-[10px] text-amber-400/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5" />
                    {language === "Arabic" ? "آلية الهجوم خطوة بخطوة (كيف؟)" : "Step-by-Step Operation ('How')"}
                  </h4>
                  <p className="text-slate-300 font-sans font-medium leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                    {explainableAI.how}
                  </p>
                </div>
              </div>

              {/* Benign Alternative & Rationale */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="font-mono font-black text-[10px] text-cyan-300/80 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    {language === "Arabic" ? "الاحتمالات البديلة التي تم مراجعتها واستبعادها" : "Benign Alternatives Considered & Discarded"}
                  </h4>
                  <p className="text-slate-300 font-sans font-medium leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                    {explainableAI.alternativePossibilities}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-mono font-black text-[10px] text-cyan-300/80 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {language === "Arabic" ? "مبرر درجة الموثوقية" : "Confidence & Attribution Rationale"}
                  </h4>
                  <p className="text-slate-300 font-sans font-medium leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                    {explainableAI.confidenceJustification}
                  </p>
                </div>
              </div>
            </div>

            {explainableAI.supportingEvidence && explainableAI.supportingEvidence.length > 0 && (
              <div className="pt-3 border-t border-white/5">
                <h4 className="font-mono font-black text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                  {language === "Arabic" ? "أدلة الإسناد الرئيسية" : "Key Supporting Indicators & Evidence"}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {explainableAI.supportingEvidence.map((ev, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white/[0.02] border border-white/10 rounded-lg text-[10px] font-mono text-cyan-300">
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
