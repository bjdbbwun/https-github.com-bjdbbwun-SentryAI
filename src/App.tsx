import { useState, useEffect, useMemo, FormEvent } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shield, ShieldAlert, ShieldCheck, Info, History, Trash2, Send, Loader2, AlertTriangle, CheckCircle2, ChevronRight, Download, X, ThumbsUp, ThumbsDown, Languages, Settings, Mail, Forward, Users, Bell, FileText, Lock, LogOut, HelpCircle, BookOpen, Skull, Flame, Zap, Database, LayoutDashboard, Cpu, Fingerprint, Brain, Clock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { scanText, ScanResult } from './services/geminiService';
import { translations, AppLanguage } from './constants/translations';
import { FamilyShield } from './components/FamilyShield';
import { SettingsView } from './components/SettingsView';
import { NotificationSystem } from './components/NotificationSystem';
import { AuthPage } from './components/AuthPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { SevenLayerVisualizer } from './components/SevenLayerVisualizer';
import { AmanovaAcademy } from './components/SentryAcademy';
import { HistoryDashboardChart } from './components/HistoryDashboardChart';
import { EmailAuthenticatorView } from './components/EmailAuthenticatorView';
import { SignatureScannerView } from './components/SignatureScannerView';
import { AmanovaWolfView } from './components/SentryWolfView';
import { ThreatIntelligenceHub } from './components/ThreatIntelligenceHub';
import { RiskEngineView } from './components/RiskEngineView';
import { AIDecisionExplanationView } from './components/AIDecisionExplanationView';
import { SecurityDashboard } from './components/SecurityDashboard';
import { EnterpriseAPIView } from './components/EnterpriseAPIView';
import { PersonalSecurityScore } from './components/PersonalSecurityScore';
import { AdversarialSimulationEngine } from './components/AdversarialSimulationEngine';
import AuthCallbackPage from './components/AuthCallbackPage';
import supabase, { ScanHistory as DBScanHistory, FamilyAlert } from './lib/supabase';
import { Sun, Moon } from 'lucide-react';

const AppLogo = ({ className = "w-6 h-6 text-cyan-400" }: { className?: string }) => (
  <div className="p-2 bg-cyan-400/10 border border-cyan-400/20 rounded-xl flex items-center justify-center">
    <ShieldCheck className="w-5 h-5 text-cyan-400" />
  </div>
);

interface ScanHistoryItem extends ScanResult {
  id: string;
  text: string;
  timestamp: Date;
}

const FeedbackForm = ({ onDismiss, language = 'English' }: { onDismiss?: () => void, language?: Exclude<AppLanguage, 'Auto'> }) => {
  const t = translations[language];
  const [rating, setRating] = useState<'accurate' | 'inaccurate' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Simulate submission
    console.log('Feedback submitted:', { rating, comment });
    setSubmitted(true);
    if (onDismiss) {
      setTimeout(onDismiss, 2000);
    }
  };

    if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 bg-cyan-500/10 border-2 border-cyan-500/30 rounded-2xl text-center shadow-xl"
      >
        <CheckCircle2 className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
        <p className="text-base font-black text-cyan-400 uppercase tracking-widest">{t.feedbackReceived}</p>
        <p className="text-sm text-white/60 mt-2 uppercase tracking-wider font-bold">{t.helpful}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{t.rateAccuracy || 'Rate accuracy'}</span>
        <div className="flex gap-4">
          <button 
            onClick={() => setRating('accurate')}
            className={`p-4 rounded-xl transition-all shadow-lg ${rating === 'accurate' ? 'bg-cyan-400 text-black scale-110' : 'bg-white/5 text-white/40 hover:text-white'}`}
          >
            <ThumbsUp className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setRating('inaccurate')}
            className={`p-4 rounded-xl transition-all shadow-lg ${rating === 'inaccurate' ? 'bg-red-500 text-black scale-110' : 'bg-white/5 text-white/40 hover:text-white'}`}
          >
            <ThumbsDown className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {rating && (
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.addComments}
            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 resize-none h-32 font-sans leading-relaxed"
          />
          <button 
            type="submit"
            className="w-full py-4 bg-cyan-400 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-cyan-300 shadow-xl active:scale-95"
          >
            {t.submitFeedback}
          </button>
        </motion.form>
      )}
    </div>
  );
};

const ForwardingOptions = ({ 
  data, 
  language = 'English', 
  onComplete,
  onToast
}: { 
  data: ScanResult, 
  language?: Exclude<AppLanguage, 'Auto'>,
  onComplete: () => void,
  onToast?: (msg: string, type: 'success' | 'info') => void
}) => {
  const t = translations[language];
  const [includeRisk, setIncludeRisk] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleForwardToThreatIntelHub = () => {
    // Create threat record
    const nowStr = new Date().toISOString();
    const newThreatId = `threat-fwd-${Date.now()}`;
    
    // Formulate indicators from data tags
    const mappedIndicators = (data.tags || []).map((tag: string, index: number) => {
      let type: "Domain" | "Email" | "IP" | "Hash" | "URL" = "Domain";
      if (tag.includes('@')) type = "Email";
      else if (tag.match(/\d+\.\d+\.\d+\.\d+/)) type = "IP";
      else if (tag.startsWith('http')) type = "URL";
      else if (tag.length === 32 || tag.length === 64) type = "Hash";
      
      return {
        id: `ind-fwd-${Date.now()}-${index}`,
        type,
        originalValue: tag,
        value: tag,
        description: `Ingested from automated scanner signature`,
        addedAt: nowStr.split('T')[0]
      };
    });

    // Retrieve campaigns
    const savedCampaignsRaw = localStorage.getItem('sentry_threat_campaigns');
    let campaignsList: any[] = [];
    if (savedCampaignsRaw) {
      try {
        campaignsList = JSON.parse(savedCampaignsRaw);
      } catch {
        // use default
      }
    }
    
    // Fallback if not found
    if (!campaignsList || campaignsList.length === 0) {
      campaignsList = [
        {
          id: "camp-cobalt-shadow",
          name: "Operation Cobalt Shadow",
          status: "Active",
          threatCount: 2,
          victimCount: 48,
          relatedDomains: ["cobalt-api-gate.net"],
          relatedEmails: [],
          relatedWallets: []
        }
      ];
    }
    
    // Auto-link logic matching domains/emails or keywords
    let targetCampaignId: string | null = null;
    let linkedReason = "";
    
    for (const camp of campaignsList) {
      const campNameLower = camp.name.toLowerCase();
      // First, check keyword in name
      const kw = campNameLower.replace(/operation|campaign|scams|scam/gi, "").trim().split(/\s+/)[0];
      if (kw && kw.length >= 3) {
        const textLower = ((data.explanation || "") + " " + (data.classification || "")).toLowerCase();
        if (textLower.includes(kw.toLowerCase())) {
          targetCampaignId = camp.id;
          linkedReason = `Keyword match on '${kw}'`;
          break;
        }
      }

      // Second, check domain/email matches in tags
      const campDomains = camp.relatedDomains || [];
      const campEmails = camp.relatedEmails || [];
      for (const tag of (data.tags || [])) {
        if (campDomains.some((d: string) => tag.toLowerCase().includes(d.toLowerCase()))) {
          targetCampaignId = camp.id;
          linkedReason = `Matching campaign domain '${tag}'`;
          break;
        }
        if (campEmails.some((e: string) => tag.toLowerCase() === e.toLowerCase())) {
          targetCampaignId = camp.id;
          linkedReason = `Matching campaign email '${tag}'`;
          break;
        }
      }
      if (targetCampaignId) break;
    }

    const newRecord = {
      id: newThreatId,
      name: `Scanner Target: ${data.classification || 'Suspicious Activity'}`,
      threatType: data.classification || 'Credential Harvesting',
      severity: data.risk === 'High' ? 'Critical' : data.risk === 'Medium' ? 'High' : 'Low',
      riskScore: data.riskScore || (data.risk === 'High' ? 88 : data.risk === 'Medium' ? 55 : 12),
      confidence: data.confidence || 'High',
      firstSeen: nowStr,
      lastSeen: nowStr,
      aiSummary: data.explanation || "Processed through automated scanner signature checks.",
      recommendedActions: data.recommendation ? [data.recommendation] : ["Inspect local endpoints for matching indicators."],
      campaignId: targetCampaignId,
      indicators: mappedIndicators,
      addedAt: nowStr.split('T')[0]
    };

    // Save to local storage
    const savedThreatsRaw = localStorage.getItem('sentry_threat_records');
    let threatsList: any[] = [];
    if (savedThreatsRaw) {
      try {
        threatsList = JSON.parse(savedThreatsRaw);
      } catch {
        // empty
      }
    }
    
    localStorage.setItem('sentry_threat_records', JSON.stringify([newRecord, ...threatsList]));
    
    // Update campaigns threat count and link indicators
    if (targetCampaignId) {
      const updatedCampaigns = campaignsList.map((c: any) => {
        if (c.id === targetCampaignId) {
          return { 
            ...c, 
            threatCount: (c.threatCount || 0) + 1,
            relatedDomains: Array.from(new Set([...(c.relatedDomains || []), ...mappedIndicators.filter(i => i.type === "Domain" || i.type === "URL").map(i => i.value)])),
            relatedEmails: Array.from(new Set([...(c.relatedEmails || []), ...mappedIndicators.filter(i => i.type === "Email").map(i => i.value)]))
          };
        }
        return c;
      });
      localStorage.setItem('sentry_threat_campaigns', JSON.stringify(updatedCampaigns));
    }

    if (onToast) {
      const campName = targetCampaignId ? campaignsList.find((c: any) => c.id === targetCampaignId)?.name : null;
      const toastMsg = campName 
        ? `Successfully archived & Auto-linked new indicators to existing campaign "${campName}"!`
        : `Successfully archived in AMANOVA Intelligence as standalone threat record.`;
      onToast(toastMsg, 'success');
    }
    onComplete();
  };

  const handleForward = () => {
    // Validation: Ensure at least one data point is selected
    if (!includeRisk && !includeTags && (!includeMetadata || !data.emailMetadata)) {
      setError(language === 'Arabic' ? 'يرجى اختيار بيانات واحدة على الأقل للتقرير' : 'Please select at least one data point for the report');
      return;
    }

    setError(null);
    const subject = `[Security Alert] Suspicious Content Detected - Risk: ${data.risk}`;
    let body = `SECURITY ANALYSIS REPORT\n`;
    body += `Generated by AMANOVA\n`;
    body += `----------------------------------------\n\n`;
    
    if (includeRisk) {
      body += `RISK LEVEL: ${data.risk}\n`;
    }
    
    body += `EXPLANATION: ${data.explanation}\n\n`;

    if (includeTags && data.tags.length > 0) {
      body += `THREAT INDICATORS:\n- ${data.tags.join('\n- ')}\n\n`;
    }

    if (includeMetadata && data.emailMetadata) {
      body += `EXTRACTED METADATA:\n`;
      if (data.emailMetadata.sender) body += `From: ${data.emailMetadata.sender}\n`;
      if (data.emailMetadata.recipient) body += `To: ${data.emailMetadata.recipient}\n`;
      if (data.emailMetadata.subject) body += `Subject: ${data.emailMetadata.subject}\n`;
      if (data.emailMetadata.body) body += `Body Preview: ${data.emailMetadata.body.substring(0, 200)}...\n`;
      body += `\n`;
    }

    body += `----------------------------------------\n`;
    body += `This report was automatically generated for human review.`;

    const mailtoUrl = `mailto:security-ops@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    onComplete();
  };

  return (
    <div className="space-y-8 bg-white/[0.04] border-2 border-white/10 p-8 rounded-3xl shadow-xl">
      <div className="flex items-center gap-4 mb-2">
        <Forward className="w-6 h-6 text-cyan-400" />
        <h3 className="text-base font-black uppercase tracking-widest">{t.forwardAnalysis}</h3>
      </div>
      
      <div className="space-y-5">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{t.selectData}</p>
        
        <label className="flex items-center gap-4 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={includeRisk} 
            onChange={() => {
              setIncludeRisk(!includeRisk);
              setError(null);
            }}
            className="w-6 h-6 rounded-lg border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400/50 transition-all"
          />
          <span className="text-base font-bold text-white/60 group-hover:text-white transition-colors">{t.includeRisk}</span>
        </label>

        <label className="flex items-center gap-4 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={includeTags} 
            onChange={() => {
              setIncludeTags(!includeTags);
              setError(null);
            }}
            className="w-6 h-6 rounded-lg border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400/50 transition-all"
          />
          <span className="text-base font-bold text-white/60 group-hover:text-white transition-colors">{t.includeTags}</span>
        </label>

        {data.emailMetadata && (
          <label className="flex items-center gap-4 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={includeMetadata} 
              onChange={() => {
                setIncludeMetadata(!includeMetadata);
                setError(null);
              }}
              className="w-6 h-6 rounded-lg border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400/50 transition-all"
            />
            <span className="text-base font-bold text-white/60 group-hover:text-white transition-colors">{t.includeMetadata}</span>
          </label>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-black uppercase tracking-wider shadow-lg"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={handleForwardToThreatIntelHub}
          className="w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-400 hover:from-cyan-900 hover:to-blue-900 border border-cyan-400/30 flex items-center justify-center gap-2"
        >
          <Database className="w-4 h-4" />
          Archive & Link Intel
        </button>

        <button 
          onClick={handleForward}
          className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
            error ? 'bg-white/5 text-white/20' : 'bg-cyan-400 text-black hover:bg-cyan-300'
          }`}
        >
          <Mail className="w-4 h-4" />
          {t.sendNow}
        </button>
      </div>
    </div>
  );
};

const ScanHistory = ({ language, history, setHistory, t, isRTL, theme, getRiskColor, getRiskIcon, openModal, clearHistory, exportToCSV }: any) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-cyan-400" />
          <h2 className={`text-xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t.historyTitle}</h2>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 text-cyan-400/60 hover:text-cyan-400 text-[10px] font-mono uppercase tracking-widest transition-colors py-2 px-4 rounded-lg bg-cyan-400/5 hover:bg-cyan-400/10"
            >
              <Download className="w-3 h-3" />
              {t.exportCsv}
            </button>
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 text-red-500/60 hover:text-red-500 text-[10px] font-mono uppercase tracking-widest transition-colors py-2 px-4 rounded-lg bg-red-500/5 hover:bg-red-500/10"
            >
              <Trash2 className="w-3 h-3" />
              {t.clearHistory}
            </button>
          </div>
        )}
      </div>

      {/* High-level cybersecurity overview and 7-day threat distribution chart */}
      <HistoryDashboardChart history={history} language={language} theme={theme} />

      <div className="space-y-3">
        {history.length > 0 ? (
          history.map((item: any) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => openModal(item)}
              className={`group ${theme === 'dark' ? 'bg-[#151619] border-white/5 hover:border-white/20' : 'bg-white border-slate-200 hover:border-cyan-400/30 shadow-sm'} border rounded-xl p-4 transition-all cursor-pointer`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className={`mt-1 p-2 rounded-lg border ${getRiskColor(item.risk)}`}>
                    {getRiskIcon(item.risk)}
                  </div>
                  <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <span className={`font-black text-2xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.risk} Threat</span>
                          {item.classification && (
                            <span className={`text-xs font-black italic px-3 py-1 rounded-lg border ${
                              item.classification === 'Safe' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
                            }`}>
                              {t[`classification${item.classification.replace(/\s+/g, '')}`] || item.classification}
                            </span>
                          )}
                          {item.action && (
                            <span className="text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-1 rounded uppercase tracking-tighter">
                              {item.action}
                            </span>
                          )}
                          <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'} uppercase bg-white/5 px-2 py-1 rounded`}>
                            {item.timestamp.toLocaleTimeString()} — {item.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    {item.emailMetadata && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.emailMetadata.sender && (
                          <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'} uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/10`}>
                            {t.sender}: {item.emailMetadata.sender}
                          </span>
                        )}
                        {item.emailMetadata.subject && (
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20">
                            {t.subject}: {item.emailMetadata.subject}
                          </span>
                        )}
                      </div>
                    )}
                    <p className={`text-base ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'} line-clamp-2 italic leading-relaxed`}>
                      {t.historyContent}: {item.text}
                    </p>
                    <p className={`text-lg ${theme === 'dark' ? 'text-white/90' : 'text-slate-800'} border-l-4 border-cyan-400 pl-4 py-1 leading-relaxed font-bold`}>
                      {item.explanation}
                    </p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-white/20' : 'text-slate-300'}`} />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className={`py-24 text-center space-y-4 ${theme === 'dark' ? 'bg-[#151619]/50 border-white/5' : 'bg-slate-100/50 border-slate-200'} rounded-3xl border border-dashed`}>
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <History className={`w-8 h-8 ${theme === 'dark' ? 'text-white/10' : 'text-slate-300'}`} />
            </div>
            <p className={`font-mono text-xs uppercase tracking-widest ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>
              {t.emptyHistory}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function Dashboard({ user, profile, language, setLanguage, theme, setTheme }: any) {
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(() => {
    const saved = localStorage.getItem('sentry_last_result');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'intel' | 'risk_engine' | 'wolf' | 'history' | 'academy' | 'family' | 'settings' | 'enterprise' | 'score' | 'ase'>('dashboard');
  const [scannerSubTab, setScannerSubTab] = useState<'neural' | 'email' | 'heuristics'>('neural');
  const [selectedScanType, setSelectedScanType] = useState<"Text" | "SMS" | "Emails" | "URLs" | "Images" | "QR Codes" | "Phone Numbers" | "Auto">("URLs");
  const [uploadedImage, setUploadedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<'Idle' | 'Validating' | 'Scanning' | 'Completed' | 'Failed'>('Idle');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [modalData, setModalData] = useState<ScanResult | null>(null);
  const [showForwardScanner, setShowForwardScanner] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [intelToast, setIntelToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showIntelToast = (message: string, type: 'success' | 'info' = 'success') => {
    setIntelToast({ message, type });
    setTimeout(() => {
      setIntelToast(null);
    }, 5000);
  };

  const uiLanguage = language === 'Auto' ? 'English' : language;
  const t = translations[uiLanguage];
  const isRTL = language === 'Arabic';

  const languages = [
    { code: 'AUTO', name: 'Auto' },
    { code: 'EN', name: 'English' },
    { code: 'AR', name: 'Arabic' },
    { code: 'ES', name: 'Spanish' },
    { code: 'FR', name: 'French' },
    { code: 'DE', name: 'German' },
    { code: 'NL', name: 'Dutch' }
  ] as const;

  const liveSignals = useMemo(() => {
    if (!inputText.trim()) return [];
    
    const signals: { type: string, label: string, severity: 'warn' | 'crit' }[] = [];
    const text = inputText.toLowerCase();

    // Urgency Patterns
    if (/\b(urgent|immediately|asap|24 hours|expire|suspended|closed|action required)\b/.test(text)) {
      signals.push({ type: 'Urgency', label: 'High Urgency Detected', severity: 'crit' });
    }

    // Financial Triggers
    if (/\b(bank|account|transfer|wires|payment|prize|won|reward|lottery|crypto|bitcoin)\b/.test(text)) {
      signals.push({ type: 'Financial', label: 'Financial Trigger Keywords', severity: 'warn' });
    }

    // Credential Harvesting
    if (/\b(password|login|verify|identity|ssn|credentials|security code|otp)\b/.test(text)) {
      signals.push({ type: 'Auth', label: 'Sensitive Data Request', severity: 'crit' });
    }

    // Link/Action patterns
    if (/\b(click here|link below|bit\.ly|t\.co|shorturl)\b/.test(text)) {
      signals.push({ type: 'Action', label: 'Suspicious Call to Action', severity: 'warn' });
    }

    return signals;
  }, [inputText]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('sentry_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const now = new Date().getTime();
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

        // Filter out entries older than 7 days and convert strings back to Date objects
        const filteredHistory = parsed
          .map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }))
          .filter((item: any) => {
            return (now - item.timestamp.getTime()) < SEVEN_DAYS_MS;
          });

        setHistory(filteredHistory);
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sentry_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (result) {
      localStorage.setItem('sentry_last_result', JSON.stringify(result));
    } else {
      localStorage.removeItem('sentry_last_result');
    }
  }, [result]);

  const openModal = (data: ScanResult) => {
    setModalData(data);
    setShowForwardModal(false);
    setShowModal(true);
  };

  const handleScan = async () => {
    if ((!inputText.trim() && !uploadedImage) || isScanning) return;

    console.log("AMANOVA: Initiating scan protocol for content type:", selectedScanType);
    setIsScanning(true);
    setResult(null);
    setShowForwardScanner(false);

    // If URL scanning, run Phase 1 pipeline
    if (selectedScanType === 'URLs') {
      setPipelineStatus('Validating');
      const submittedUrl = inputText.trim();
      
      if (!submittedUrl) {
        showIntelToast("URL cannot be empty.", "info");
        setPipelineStatus('Failed');
        setIsScanning(false);
        return;
      }

      if (submittedUrl.length > 2000) {
        showIntelToast("URL is too long (maximum 2000 characters).", "info");
        setPipelineStatus('Failed');
        setIsScanning(false);
        return;
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(submittedUrl);
      } catch {
        showIntelToast("Invalid URL format. Please include protocol (e.g., https://).", "info");
        setPipelineStatus('Failed');
        setIsScanning(false);
        return;
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        showIntelToast("Protocol must be http: or https:.", "info");
        setPipelineStatus('Failed');
        setIsScanning(false);
        return;
      }

      const hostname = parsedUrl.hostname.toLowerCase();
      if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]") {
        showIntelToast("Localhost scanning is not permitted.", "info");
        setPipelineStatus('Failed');
        setIsScanning(false);
        return;
      }

      if (parsedUrl.username || parsedUrl.password) {
        showIntelToast("URLs with embedded authentication are not permitted.", "info");
        setPipelineStatus('Failed');
        setIsScanning(false);
        return;
      }

      setPipelineStatus('Scanning');
      
      let session = null;
      try {
        const sessionRes = await supabase.auth.getSession();
        session = sessionRes.data.session;
      } catch (err) {
        console.log("[AMANOVA Diagnostic] Error getting session:", err);
      }

      const isExpired = session && session.expires_at ? (session.expires_at * 1000 < Date.now()) : false;

      if (!session || isExpired) {
        console.log("[AMANOVA Diagnostic] Session missing or expired, attempting refresh...");
        try {
          const refreshRes = await supabase.auth.refreshSession();
          session = refreshRes.data.session;
        } catch (refreshErr) {
          console.log("[AMANOVA Diagnostic] Session refresh error:", refreshErr);
        }
      }

      // Safe Diagnostic logging:
      // - whether a session exists
      // - whether an access token exists as a boolean
      // - pipeline stage
      console.log("[AMANOVA Diagnostic] Session exists:", !!session);
      console.log("[AMANOVA Diagnostic] Access token exists:", !!session?.access_token);
      console.log("[AMANOVA Diagnostic] Pipeline stage: Scanning");

      if (!session) {
        showIntelToast("Authentication required. Please sign in to scan URLs.", "info");
        setPipelineStatus('Failed');
        setIsScanning(false);
        return;
      }

      const languageCodeMap: Record<string, string> = {
        'English': 'en',
        'Arabic': 'ar',
        'French': 'fr',
        'Spanish': 'es',
        'German': 'de',
        'Dutch': 'nl',
        'Auto': 'en'
      };
      const currentLanguageCode = languageCodeMap[language] || 'en';

      try {
        const response = await fetch("/api/v1/scans/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            contentType: "url",
            content: submittedUrl,
            language: currentLanguageCode
          })
        });

        // Safe Diagnostic logging:
        // - HTTP response status
        console.log("[AMANOVA Diagnostic] HTTP response status:", response.status);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: "The security reputation service is temporarily unavailable." }));
          console.log("[AMANOVA Diagnostic] Safe API error message:", errData.message || "Security scan failed.");
          
          const unavailableResult: ScanResult = {
            risk: "Unknown",
            classification: "Unknown" as any,
            explanation: "No obvious warning signs were detected locally, but the link could not be verified.",
            riskScore: null,
            confidence: null,
            action: "Unable to verify",
            evidence: [errData.message || "We could not complete the reputation check."],
            recommendation: "Do not open or trust this link until the verification service is available.",
            detectedLanguage: currentLanguageCode.toUpperCase(),
            tags: ["UNAVAILABLE"],
            scannedType: "URLs",
            isUnavailable: true
          };

          setResult(unavailableResult);
          setPipelineStatus('Completed');
          setIsScanning(false);

          const newHistoryItem: ScanHistoryItem = {
            id: crypto.randomUUID(),
            text: submittedUrl,
            ...unavailableResult,
            timestamp: new Date()
          };
          setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
          return;
        }

        const data = await response.json();
        
        // Map the real API response
        const { scan, evidence, incidentId, notificationId } = data;

        const riskLevelMap: Record<string, "Low" | "Medium" | "High"> = {
          low: "Low",
          medium: "Medium",
          high: "High",
          critical: "High"
        };
        const mappedRisk = riskLevelMap[scan.riskLevel] || "Low";

        const classificationMap: Record<string, string> = {
          none: "Safe",
          phishing: "Phishing",
          malware: "Phishing",
          scam: "Scam",
          social_engineering: "Social Engineering"
        };
        const mappedClassification = classificationMap[scan.threatType] || (scan.verdict === "safe" ? "Safe" : "Phishing");

        const mappedConfidence = scan.confidenceScore >= 90 ? "High" : (scan.confidenceScore >= 50 ? "Medium" : "Low");
        const mappedAction = scan.verdict === "dangerous" ? "Block/Ignore" : (scan.verdict === "suspicious" ? "Monitor" : "Allow");

        const evidenceList = [
          `Source: ${evidence.source}`,
          `Reputation status: ${evidence.status}`,
          ...(evidence.threatCategories && evidence.threatCategories.length > 0
            ? [`Threat categories detected: ${evidence.threatCategories.join(", ")}`]
            : [])
        ];

        const mappedResult: ScanResult = {
          risk: mappedRisk,
          classification: mappedClassification as any,
          explanation: scan.explanation,
          riskScore: scan.riskScore,
          confidence: mappedConfidence,
          action: mappedAction,
          evidence: evidenceList,
          recommendation: scan.verdict === "dangerous" 
            ? "Do not open this link. It has been flagged as malicious." 
            : "This URL has been checked and found safe to proceed.",
          detectedLanguage: currentLanguageCode.toUpperCase(),
          tags: evidence.threatCategories || [],
          scannedType: "URLs"
        };

        setResult(mappedResult);
        setPipelineStatus('Completed');

        // Send family alert if user is a senior and threat is high
        if (profile?.role === 'senior' && profile.guardian_id && mappedResult.risk === 'High') {
          await (supabase.from('family_alerts') as any).insert({
            senior_id: profile.id,
            guardian_id: profile.guardian_id,
            alert_type: 'critical_threat',
            message: `${profile.full_name || 'Senior'} received a ${mappedResult.risk} threat.`,
            is_read: false
          });
        }

        const newHistoryItem: ScanHistoryItem = {
          id: scan.id || crypto.randomUUID(),
          text: submittedUrl,
          ...mappedResult,
          timestamp: new Date()
        };

        setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
      } catch (err: any) {
        console.error("URL scan request failed:", err);
        console.log("[AMANOVA Diagnostic] Safe API error message:", err?.message || "Network or server error.");
        
        const unavailableResult: ScanResult = {
          risk: "Unknown",
          classification: "Unknown" as any,
          explanation: "No obvious warning signs were detected locally, but the link could not be verified.",
          riskScore: null,
          confidence: null,
          action: "Unable to verify",
          evidence: ["Network or server error occurred during scan."],
          recommendation: "Do not open or trust this link until the verification service is available.",
          detectedLanguage: currentLanguageCode.toUpperCase(),
          tags: ["UNAVAILABLE"],
          scannedType: "URLs",
          isUnavailable: true
        };

        setResult(unavailableResult);
        setPipelineStatus('Completed');
        setIsScanning(false);

        const newHistoryItem: ScanHistoryItem = {
          id: crypto.randomUUID(),
          text: submittedUrl,
          ...unavailableResult,
          timestamp: new Date()
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
      } finally {
        setIsScanning(false);
      }
      return;
    }

    setPipelineStatus('Scanning');
    try {
      const scanResult = await scanText(
        inputText, 
        language, 
        selectedScanType, 
        uploadedImage ? { base64: uploadedImage.base64, mimeType: uploadedImage.mimeType } : undefined
      );
      console.log("AMANOVA: Scan complete. Result:", scanResult);
      setResult(scanResult);
      setPipelineStatus('Completed');
      
      // Send family alert if user is a senior and threat is high
      if (profile?.role === 'senior' && profile.guardian_id && (scanResult.risk === 'High' || (scanResult.risk as string) === 'Critical')) {
        await (supabase.from('family_alerts') as any).insert({
          senior_id: profile.id,
          guardian_id: profile.guardian_id,
          alert_type: 'critical_threat',
          message: `${profile.full_name || 'Senior'} received a ${scanResult.risk} threat.`,
          is_read: false
        });
      }
      
      const newHistoryItem: ScanHistoryItem = {
        id: crypto.randomUUID(),
        text: inputText,
        ...scanResult,
        timestamp: new Date()
      };
      
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
    } catch (error) {
      console.error('Scan failed', error);
      setPipelineStatus('Failed');
    } finally {
      setIsScanning(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('sentry_history');
  };

  const exportToCSV = () => {
    if (history.length === 0) return;

    const headers = ['Timestamp', 'Original Text', 'Risk Level', 'Explanation'];
    const rows = history.map(item => [
      item.timestamp.toISOString(),
      `"${item.text.replace(/"/g, '""').replace(/\n/g, ' ')}"`, // Escape quotes and remove newlines for CSV
      item.risk,
      `"${item.explanation.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `amanova_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = async () => {
    console.log("AMANOVA: Initiating sign out protocol...");
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('sentry_last_result');
      // Auth state change will handle redirection
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Low': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'High': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'Medium': return <Info className="w-5 h-5 text-amber-500" />;
      case 'Low': return <ShieldCheck className="w-5 h-5 text-cyan-400" />;
      default: return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: language === 'Arabic' ? 'لوحة القيادة' : 'Dashboard' },
    { id: 'score', icon: Fingerprint, label: language === 'Arabic' ? 'مؤشر الأمان' : 'Security Score' },
    { id: 'scanner', icon: Shield, label: language === 'Arabic' ? 'الفحص' : 'Scanner' },
    { id: 'intel', icon: Flame, label: language === 'Arabic' ? 'مركز الاستخبارات' : 'Intel Hub' },
    { id: 'risk_engine', icon: Zap, label: language === 'Arabic' ? 'محرك المخاطر' : 'Risk Engine' },
    { id: 'wolf', icon: Skull, label: language === 'Arabic' ? 'الذئب' : 'AMANOVA Wolf' },
    { id: 'ase', icon: Brain, label: language === 'Arabic' ? 'محاكاة الجناة' : 'Adversarial Simulation' },
    { id: 'history', icon: History, label: language === 'Arabic' ? 'التنبيهات' : 'History' },
    { id: 'academy', icon: BookOpen, label: language === 'Arabic' ? 'الأكاديمية' : 'Academy' },
    { id: 'family', icon: Users, label: language === 'Arabic' ? 'العائلة' : 'Family' },
    { id: 'enterprise', icon: Cpu, label: language === 'Arabic' ? 'بوابة الشركات' : 'Enterprise API' },
    { id: 'settings', icon: Settings, label: language === 'Arabic' ? 'الإعدادات' : 'Settings' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#06080A] text-[#E4E3E0]' : 'bg-slate-50 text-slate-900'} font-sans selection:bg-cyan-400 selection:text-black ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AMANOVA Unified Intelligence Alerts */}
      <AnimatePresence>
        {intelToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4"
          >
            <div className="bg-[#0A0D10]/95 border-2 border-cyan-400/30 text-cyan-400 p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(34,211,238,0.15)] backdrop-blur-xl flex items-center gap-3">
              <div className="p-2 bg-cyan-400/10 border border-cyan-400/20 rounded-xl shrink-0">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-50 block">AMANOVA Intel Linker</span>
                <p className="text-xs font-bold text-white leading-relaxed">{intelToast.message}</p>
              </div>
              <button 
                onClick={() => setIntelToast(null)}
                className="text-white/40 hover:text-white p-1 text-[10px] font-black font-mono shrink-0"
              >
                DISMISS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar for Desktop */}
      <aside className={`fixed top-0 bottom-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} w-60 hidden md:flex flex-col py-8 px-4 ${theme === 'dark' ? 'bg-[#0A0F1D] border-slate-800' : 'bg-white border-slate-200'} z-50`}>
        <div className="flex items-center gap-3 mb-8 px-2 shrink-0">
          <div className="p-2 bg-cyan-400/10 border border-cyan-400/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <span className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'} uppercase font-sans`}>
            AMANOVA
          </span>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-400 font-semibold'
                    : `${theme === 'dark' ? 'text-slate-400 hover:bg-white/5 hover:text-slate-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={isRTL ? 'font-cairo' : ''}>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="mt-auto border-t border-slate-800/50 pt-4 space-y-3 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold uppercase shrink-0">
              {profile?.full_name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div className="overflow-hidden text-left">
              <p className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider block">
                {profile?.role === 'senior' ? (isRTL ? 'وضع كبار السن' : 'Senior Mode') : (isRTL ? 'المراقب' : 'Guardian')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-1 pt-1">
            <button 
              onClick={() => setShowHelpModal(true)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                theme === 'dark' ? 'text-slate-400 hover:bg-white/5 hover:text-slate-100' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Help Centre"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{isRTL ? 'مساعدة' : 'Help'}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="py-2 px-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all text-xs font-medium flex items-center justify-center gap-2"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className={`relative max-w-6xl mx-auto px-6 py-12 ${isRTL ? 'md:pr-[280px]' : 'md:pl-[280px]'} pb-32`}>
        {/* Background Decor */}
        {theme === 'dark' && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-400/10 rounded-full blur-[120px]" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-cyan-400/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150" />
          </div>
        )}

        {/* Header */}
        <header className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} pb-8`}>
          <div className="text-left">
            <div className="flex items-center gap-4 mb-2">
              <h1 className={`text-4xl font-extrabold tracking-tighter ${theme === 'dark' ? 'bg-gradient-to-br from-white via-white to-cyan-400/50 bg-clip-text text-transparent' : 'text-slate-900'} drop-shadow-sm leading-none`}>
                AMANOVA
              </h1>
            </div>
            <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-4">
              {t.slogan}
            </p>
            <p className={`${theme === 'dark' ? 'text-white/60' : 'text-slate-500'} max-w-md text-base leading-relaxed`}>
              {t.tagline} <br />
              {t.engine}
            </p>
          </div>

          <div className="flex items-center gap-4">
             <NotificationSystem language={uiLanguage} theme={theme} />
             <button 
               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               className={`p-3 rounded-2xl transition-all shadow-sm border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/60' : 'bg-white border-slate-200 text-slate-500'}`}
             >
               {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white dark:border-white/10 shadow-lg uppercase">
                {profile?.full_name?.[0] || user?.email?.[0] || 'U'}
             </div>
          </div>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <SecurityDashboard 
                  language={uiLanguage === 'Arabic' ? 'Arabic' : 'English'} 
                  theme={theme} 
                  onNavigateToTab={setActiveTab} 
                />
              </motion.div>
            )}

            {activeTab === 'enterprise' && (
              <motion.div
                key="enterprise"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <EnterpriseAPIView language={uiLanguage === 'Arabic' ? 'Arabic' : 'English'} theme={theme} />
              </motion.div>
            )}

            {activeTab === 'scanner' && (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Check a Link Header */}
                <div className="text-left space-y-2 mb-6">
                  <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white font-sans' : 'text-slate-900 font-sans'} tracking-tight`}>
                    {language === 'Arabic' ? 'فحص رابط' : 'Check a link'}
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'} font-normal`}>
                    {language === 'Arabic' ? 'أدخل رابطاً للتحقق من سلامته وسمعته رقمياً.' : 'Enter a link to check its digital safety and reputation.'}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {scannerSubTab === 'neural' && (
                    <motion.div
                      key="neural-scan"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="space-y-12"
                    >
                      {/* Input Section */}
                      <div className="space-y-4">
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/15 to-cyan-600/15 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                          <textarea
                            id="threat-input"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={
                              language === 'Arabic' 
                                ? 'أدخل الرابط المشبوه هنا (مثال: https://example.com)...' 
                                : 'Enter suspicious link here (e.g., https://example.com)...'
                            }
                            className={`relative w-full h-[120px] ${theme === 'dark' ? 'bg-[#0E1012] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-950'} border-2 rounded-2xl p-6 text-base focus:outline-none focus:border-cyan-400 transition-all placeholder:text-slate-400 resize-none font-sans leading-relaxed shadow-sm`}
                          />
                          
                          <div className="absolute bottom-4 right-4">
                            <button
                              id="scan-button"
                              onClick={handleScan}
                              disabled={!inputText.trim() || isScanning}
                              className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-200 disabled:text-slate-400 text-black px-6 py-3 rounded-xl text-sm font-bold transition-all transform active:scale-95 shadow-sm"
                            >
                              {isScanning ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>{language === 'Arabic' ? 'جاري الفحص...' : 'Checking...'}</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4" />
                                  <span>{language === 'Arabic' ? 'فحص الرابط' : 'Check link'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Analysis Results Display */}
                      {result && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`space-y-8 pt-8 border-t-2 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}
                        >
                          <div className={`${theme === 'dark' ? 'bg-[#121417] border-white/10' : 'bg-white border-slate-200'} border rounded-2xl overflow-hidden shadow-2xl`}>
                                <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'} flex items-center justify-between`}>
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'} uppercase tracking-widest leading-none`}>{t.securityResult}</span>
                                {result.detectedLanguage && (
                                  <span className={`text-[9px] font-mono ${theme === 'dark' ? 'bg-white/5 text-white/30 border-white/5' : 'bg-slate-100 text-slate-500 border-slate-200'} px-2 py-0.5 rounded border uppercase tracking-tighter`}>
                                    {t.detected}: {result.detectedLanguage}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">{t.verifiedLog}</span>
                              </div>
                            </div>
                            
                            {/* Email Metadata Section */}
                            {result.emailMetadata && (
                              <div className={`px-8 py-6 border-b ${theme === 'dark' ? 'border-white/5 bg-cyan-400/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
                                <div className="flex items-center gap-3 mb-6">
                                  <div className={`p-2 ${theme === 'dark' ? 'bg-cyan-400/10 border-cyan-400/20' : 'bg-cyan-400/5 border-slate-200'} rounded-lg border`}>
                                    <Mail className="w-4 h-4 text-cyan-400" />
                                  </div>
                                  <div>
                                     <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.2em] font-bold block">Email Forensics</span>
                                     <span className={`text-[9px] ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'} uppercase tracking-widest`}>Metadata Extraction Active</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    {result.emailMetadata.sender && (
                                      <div className="group">
                                        <div className="flex items-center gap-2 mb-1.5">
                                          <Send className={`w-3 h-3 ${theme === 'dark' ? 'text-white/20' : 'text-slate-300'}`} />
                                          <label className={`text-[9px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest`}>{t.sender}</label>
                                        </div>
                                        <p className={`text-xs ${theme === 'dark' ? 'text-white/80 bg-white/[0.03] border-white/5 group-hover:border-white/10' : 'text-slate-600 bg-white border-slate-100 group-hover:border-slate-200'} font-mono break-all p-3 rounded-xl border transition-colors shadow-inner`}>{result.emailMetadata.sender}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-4">
                                    {result.emailMetadata.subject && (
                                      <div className="group">
                                        <div className="flex items-center gap-2 mb-1.5">
                                          <Shield className={`w-3 h-3 ${theme === 'dark' ? 'text-white/20' : 'text-slate-300'}`} />
                                          <label className={`text-[9px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest`}>{t.subject}</label>
                                        </div>
                                        <p className={`text-xs text-cyan-400 font-bold ${theme === 'dark' ? 'bg-white/[0.03] border-white/5 group-hover:border-white/10' : 'bg-white border-slate-100 group-hover:border-slate-200'} p-3 rounded-xl border transition-colors shadow-inner`}>{result.emailMetadata.subject}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Analysis Results Display */}
                            <div className="p-6 text-left space-y-6">
                              {/* Consumer-Friendly Main Alert Card */}
                              <div className={`p-6 rounded-2xl border-2 ${
                                result.isUnavailable 
                                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                                  : result.risk === 'High' 
                                    ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                              }`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${
                                      result.isUnavailable 
                                        ? 'bg-amber-500/20 text-amber-400' 
                                        : result.risk === 'High' 
                                          ? 'bg-red-500/20 text-red-400' 
                                          : 'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                      {result.isUnavailable ? (
                                        <AlertTriangle className="w-8 h-8" />
                                      ) : result.risk === 'High' ? (
                                        <ShieldAlert className="w-8 h-8" />
                                      ) : (
                                        <ShieldCheck className="w-8 h-8" />
                                      )}
                                    </div>
                                    <div className="text-left space-y-1">
                                      <span className={`text-[10px] font-mono uppercase tracking-widest ${
                                        theme === 'dark' ? 'text-white/40' : 'text-slate-500'
                                      }`}>
                                        {language === 'Arabic' ? 'النتيجة' : 'Result'}
                                      </span>
                                      <h3 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                        {result.isUnavailable 
                                          ? (language === 'Arabic' ? 'غير قادر على التحقق' : 'Unable to verify')
                                          : result.risk === 'High' 
                                            ? (language === 'Arabic' ? 'تهديد مؤكد' : 'Verified threat')
                                            : (language === 'Arabic' ? 'تم التحقق منه كآمن' : 'Verified clean')}
                                      </h3>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <div className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border ${
                                      result.isUnavailable 
                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                                        : result.risk === 'High' 
                                          ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    }`}>
                                      {language === 'Arabic' ? 'التصنيف:' : 'Classification:'} <span className="font-extrabold">
                                        {result.isUnavailable ? (language === 'Arabic' ? 'غير معروف' : 'Unknown') : (result.classification === 'Safe' ? (language === 'Arabic' ? 'تم التحقق منه' : 'Verified') : result.classification)}
                                      </span>
                                    </div>

                                    <div className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border ${
                                      result.isUnavailable 
                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                                        : result.risk === 'High' 
                                          ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    }`}>
                                      {language === 'Arabic' ? 'الإجراء الموصى به:' : 'Action:'} <span className="font-extrabold">
                                        {result.isUnavailable 
                                          ? (language === 'Arabic' ? 'التحقق عبر قنوات بديلة' : 'Verify manually')
                                          : result.risk === 'High' 
                                            ? (language === 'Arabic' ? 'حظر / تجاهل' : 'Block') 
                                            : (language === 'Arabic' ? 'السماح' : 'Allow')}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className={`mt-4 pt-4 border-t ${
                                  result.isUnavailable 
                                    ? 'border-amber-500/10' 
                                    : result.risk === 'High' 
                                      ? 'border-red-500/10' 
                                      : 'border-emerald-500/10'
                                } text-left space-y-2`}>
                                  <p className={`text-base font-semibold leading-relaxed ${theme === 'dark' ? 'text-white/90' : 'text-slate-800'}`}>
                                    {result.explanation}
                                  </p>
                                  {result.recommendation && (
                                    <p className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>
                                      {result.recommendation}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Toggle button for technical details */}
                              <div className="flex justify-end pt-2">
                                <button
                                  type="button"
                                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                                  className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest rounded-xl border transition-all ${
                                    theme === 'dark' 
                                      ? 'bg-white/[0.02] border-white/5 text-white/40 hover:text-white hover:bg-white/[0.05]' 
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                  }`}
                                >
                                  {showTechnicalDetails 
                                    ? (language === 'Arabic' ? 'إخفاء التفاصيل الفنية' : 'Hide technical details') 
                                    : (language === 'Arabic' ? 'عرض التفاصيل الفنية' : 'Show technical details')}
                                </button>
                              </div>

                              {/* Traditional Technical Table (renders when expanded) */}
                              {showTechnicalDetails && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="overflow-x-auto rounded-xl border border-white/5 bg-[#080B0E]/30 text-left w-full"
                                >
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className={`border-b ${theme === 'dark' ? 'border-white/10 bg-white/[0.02] text-white/40' : 'border-slate-100 bg-slate-50 text-slate-500'} text-xs font-bold uppercase tracking-widest ${isRTL ? 'text-right' : ''}`}>
                                        <th className="px-6 py-4 font-bold">{t.riskAssessment}</th>
                                        <th className="px-6 py-4 font-bold">{t.threatClassification}</th>
                                        <th className="px-6 py-4 font-bold">{t.technicalBriefing}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        <td className={`px-6 py-8 align-top border-r border-white/5 w-[25%]`}>
                                          <div className="space-y-4">
                                            <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border-2 ${getRiskColor(result.risk)}`}>
                                              {getRiskIcon(result.risk)}
                                              <span className="text-lg font-black uppercase tracking-tight">{result.risk}</span>
                                            </div>
                                            <div className="space-y-1.5 pt-2">
                                              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-slate-400">
                                                <span>{language === 'Arabic' ? 'مؤشر المخاطر' : 'Risk Score'}</span>
                                                <span className="font-bold text-cyan-400">
                                                  {result.isUnavailable ? '—' : `${result.riskScore || (result.risk === 'High' ? 85 : result.risk === 'Medium' ? 50 : 15)}%`}
                                                </span>
                                              </div>
                                              {!result.isUnavailable && (
                                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-white/5">
                                                  <div 
                                                    className={`h-full rounded-full ${result.risk === 'High' || result.risk === 'Critical' ? 'bg-red-500' : result.risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${result.riskScore || (result.risk === 'High' ? 85 : result.risk === 'Medium' ? 50 : 15)}%` }}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </td>
                                        <td className={`px-6 py-8 align-top border-r border-white/5 w-[30%]`}>
                                          <div className="space-y-4">
                                            <div className="space-y-2">
                                              <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'} uppercase tracking-widest block`}>{t.detected}</span>
                                              <p className={`text-xl font-black italic tracking-tighter ${
                                                result.classification === 'Safe' ? 'text-emerald-500' : 'text-cyan-400'
                                              }`}>
                                                {result.isUnavailable ? '—' : (t[`classification${result.classification.replace(/\s+/g, '')}`] || result.classification)}
                                              </p>
                                            </div>
                                            <div className="pt-2 flex items-center justify-between border-t border-white/5">
                                              <span className={`text-[9px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest block`}>{language === 'Arabic' ? 'مستوى الثقة' : 'Confidence'}</span>
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest ${
                                                result.confidence === 'High' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : result.confidence === 'Medium' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                                              }`}>
                                                {result.isUnavailable ? '—' : (result.confidence || 'High')}
                                              </span>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-6 py-8 align-top">
                                          <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                                            "{result.explanation}"
                                          </p>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </motion.div>
                              )}
                            </div>

                            {showTechnicalDetails && (
                              <div className="divide-y divide-white/5 bg-[#080B0E]/20">
                                {/* Evidence Dossier Section */}
                                {result.evidence && result.evidence.length > 0 && (
                                  <div className={`px-8 py-6 border-t ${theme === 'dark' ? 'border-white/5 bg-white/[0.01]' : 'border-slate-100 bg-slate-50/20'}`}>
                                    <h4 className={`text-[10px] font-bold ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'} uppercase tracking-[0.3em] mb-3`}>
                                      {language === 'Arabic' ? 'ملف الأدلة العصبية للذكاء الاصطناعي' : 'AI NEURAL EVIDENCE DOSSIER'}
                                    </h4>
                                    <ul className="space-y-2">
                                      {result.evidence.map((ev, index) => (
                                        <li key={index} className="flex items-start gap-2.5 text-xs text-white/70">
                                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shadow-[0_0_6px_rgba(34,211,238,0.4)]" />
                                          <span className="font-sans leading-relaxed">{ev}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Mitigation Protocol / Detailed Recommendation */}
                                {result.recommendation && (
                                  <div className={`px-8 py-6 border-t ${theme === 'dark' ? 'border-white/5 bg-cyan-400/[0.01]' : 'border-slate-100 bg-cyan-400/[0.01]'}`}>
                                    <h4 className={`text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em] mb-2`}>
                                      {language === 'Arabic' ? 'بروتوكول إجراءات التخفيف الموصى بها' : 'RECOMMENDED MITIGATION PROTOCOL'}
                                    </h4>
                                    <p className="text-xs text-white/80 leading-relaxed font-sans font-medium">
                                      {result.recommendation}
                                    </p>
                                  </div>
                                )}

                                {/* AMANOVA Cognitive Decision Intelligence */}
                                {result.aiDecision && (
                                  <div className="px-8 py-6 border-t border-white/5">
                                    <AIDecisionExplanationView 
                                      decision={result.aiDecision} 
                                      fallbackTitle="Neural Scan Artifact" 
                                      explainableAI={result.explainableAI}
                                      language={uiLanguage}
                                    />
                                  </div>
                                )}

                                {/* AMANOVA 7-Layer Forensic Scan Visualizer */}
                                <SevenLayerVisualizer 
                                  sevenLayers={result.sevenLayers} 
                                  language={uiLanguage} 
                                  theme={theme} 
                                />

                                {/* Forensic Truth & Evidence Validation Grid */}
                                {(result.emailAuthValidation || result.whoisValidation || result.urgencyAnalysis || (result.structuredEvidence && result.structuredEvidence.length > 0)) && (
                                  <div className="px-8 py-8 border-t border-white/5 bg-[#080B0E]/60">
                                    <div className="flex items-center gap-3 mb-6">
                                      <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl shadow-[0_0_12px_rgba(99,102,241,0.15)]">
                                        <Fingerprint className="w-5 h-5 animate-pulse" />
                                      </div>
                                      <div>
                                        <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-widest block">Forensic Integrity & Verification</span>
                                        <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                          {language === 'Arabic' ? 'شبكة التحقق الإثباتي وصحة الأدلة الجنائية' : 'Evidential Integrity & Forensic Verification Grid'}
                                        </h3>
                                      </div>
                                    </div>

                                    <p className={`text-[11px] mb-6 leading-relaxed ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>
                                      {language === 'Arabic' 
                                        ? 'يفصل النظام بشكل صارم بين الحقائق الرقمية المؤكدة والتقديرات السلوكية لمنع الادعاءات غير الموثقة.'
                                        : 'AMANOVA strictly separates verified physical evidence from behavioral estimations and heuristic signatures to ensure forensic integrity.'}
                                    </p>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                      {/* L1: Email Authentication Verification */}
                                      {result.emailAuthValidation && (
                                        <div className="p-5 bg-[#0B0F13] border border-white/5 rounded-2xl space-y-4">
                                          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                                            <div className="flex items-center gap-2">
                                              <Mail className="w-4 h-4 text-cyan-400" />
                                              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-300">Email Authenticity</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest ${
                                              result.emailAuthValidation.status === "Verified"
                                                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                                : "text-slate-400 bg-slate-500/10 border border-slate-500/20"
                                            }`}>
                                              {result.emailAuthValidation.status}
                                            </span>
                                          </div>

                                          <div className="grid grid-cols-3 gap-2">
                                            {(["spf", "dkim", "dmarc"] as const).map((key) => {
                                              const val = result.emailAuthValidation?.[key] || "Unavailable";
                                              return (
                                                <div key={key} className="p-2 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                                                  <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 block mb-1">{key}</span>
                                                  <span className={`text-[10px] font-mono font-black ${
                                                    val === "PASS" ? "text-emerald-400" :
                                                    val === "FAIL" ? "text-red-400 animate-pulse" :
                                                    val === "NONE" ? "text-amber-400" : "text-slate-500"
                                                  }`}>
                                                    {val}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          </div>

                                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans italic">
                                            {result.emailAuthValidation.reason}
                                          </p>
                                        </div>
                                      )}

                                      {/* L2: WHOIS & Domain Age Validation */}
                                      {result.whoisValidation && (
                                        <div className="p-5 bg-[#0B0F13] border border-white/5 rounded-2xl space-y-4">
                                          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                                            <div className="flex items-center gap-2">
                                              <Globe className="w-4 h-4 text-cyan-400" />
                                              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-300">Domain Reputation</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest ${
                                              result.whoisValidation.status === "Verified" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" :
                                              result.whoisValidation.status === "Estimated" ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" :
                                              result.whoisValidation.status === "Behavioral" ? "text-cyan-400 bg-cyan-500/10 border border-cyan-400/20" :
                                              "text-slate-400 bg-slate-500/10 border border-slate-500/20"
                                            }`}>
                                              {result.whoisValidation.status}
                                            </span>
                                          </div>

                                          <div className="space-y-2.5">
                                            <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-xl border border-white/5">
                                              <span className="text-[9px] font-mono uppercase text-slate-400">Domain Age</span>
                                              <span className="text-xs font-bold text-white font-mono">{result.whoisValidation.registrationAge || "Unavailable"}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-xl border border-white/5">
                                              <span className="text-[9px] font-mono uppercase text-slate-400">Registrar</span>
                                              <span className="text-xs font-bold text-cyan-400 font-mono truncate max-w-[120px]" title={result.whoisValidation.registrar}>{result.whoisValidation.registrar || "Unavailable"}</span>
                                            </div>
                                          </div>

                                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans italic">
                                            {result.whoisValidation.reason}
                                          </p>
                                        </div>
                                      )}

                                      {/* L3: Contextual Urgency Analysis */}
                                      {result.urgencyAnalysis && (
                                        <div className="p-5 bg-[#0B0F13] border border-white/5 rounded-2xl space-y-4">
                                          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                                            <div className="flex items-center gap-2">
                                              <Clock className="w-4 h-4 text-cyan-400" />
                                              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-300">Social Urgency Analysis</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest ${
                                              result.urgencyAnalysis.status === "Verified" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" :
                                              result.urgencyAnalysis.status === "Estimated" ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" :
                                              result.urgencyAnalysis.status === "Behavioral" ? "text-cyan-400 bg-cyan-500/10 border border-cyan-400/20" :
                                              "text-slate-400 bg-slate-500/10 border border-slate-500/20"
                                            }`}>
                                              {result.urgencyAnalysis.status}
                                            </span>
                                          </div>

                                          <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-slate-400">
                                              <span>Urgency Pressure</span>
                                              <span className="font-bold text-cyan-400">{result.urgencyAnalysis.urgencyScore}%</span>
                                            </div>
                                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-white/5">
                                              <div 
                                                className="h-full rounded-full bg-cyan-400"
                                                style={{ width: `${result.urgencyAnalysis.urgencyScore}%` }}
                                              />
                                            </div>
                                          </div>

                                          <div className="flex flex-wrap gap-1">
                                            {result.urgencyAnalysis.urgencyEvidence && result.urgencyAnalysis.urgencyEvidence.length > 0 ? (
                                              result.urgencyAnalysis.urgencyEvidence.map((token, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] font-mono text-cyan-300">
                                                  {token}
                                                </span>
                                              ))
                                            ) : (
                                              <span className="text-[8px] font-mono text-slate-500 italic">No pressure keywords isolated.</span>
                                            )}
                                          </div>

                                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans italic">
                                            {result.urgencyAnalysis.urgencyReason}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Detailed Evidentiary Conclusion Log */}
                                    {result.structuredEvidence && result.structuredEvidence.length > 0 && (
                                      <div className="space-y-3.5 pt-4 border-t border-white/5 text-left">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                                          {language === 'Arabic' ? 'سجل استنتاجات الأدلة الجنائية المصنفة' : 'CLASSIFIED FORENSIC EVIDENCE CONCLUSION LOG'}
                                        </h4>
                                        <div className="overflow-hidden border border-white/5 rounded-2xl bg-black/25">
                                          <table className="w-full text-left border-collapse">
                                            <thead>
                                              <tr className="border-b border-white/5 bg-white/[0.01] text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                                                <th className="px-5 py-3 font-bold">Conclusion / Finding</th>
                                                <th className="px-5 py-3 font-bold">Evidence Source</th>
                                                <th className="px-5 py-3 font-bold text-center">Trust Level / Tag</th>
                                                <th className="px-5 py-3 font-bold">Forensic Reason & Reference</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-[11px] text-slate-300 font-sans">
                                              {result.structuredEvidence.map((concl, idx) => (
                                                <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                                                  <td className="px-5 py-3.5 font-semibold text-white leading-normal">
                                                    {concl.evidence}
                                                  </td>
                                                  <td className="px-5 py-3.5 font-mono text-[10px] text-cyan-400">
                                                    {concl.evidenceSource}
                                                  </td>
                                                  <td className="px-5 py-3.5 text-center">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest ${
                                                      concl.trustTag === "Verified" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" :
                                                      concl.trustTag === "Estimated" ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" :
                                                      concl.trustTag === "Behavioral" ? "text-cyan-400 bg-cyan-500/10 border border-cyan-400/20" :
                                                      "text-slate-400 bg-slate-500/10 border border-slate-500/20"
                                                    }`}>
                                                      {concl.trustTag}
                                                    </span>
                                                  </td>
                                                  <td className="px-5 py-3.5 text-slate-400 leading-normal">
                                                    {concl.explanation}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Verified Threat Intelligence Sources */}
                                {result.googleSafeBrowsing && (
                                  <div className="px-8 py-6 border-t border-white/5 text-left">
                                    <h3 className={`text-[10px] font-bold ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'} uppercase tracking-[0.3em] mb-4`}>
                                      {language === 'Arabic' ? 'مصادر استخبارات التهديدات المعتمدة' : 'Verified Threat Intelligence Sources'}
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                      <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                                        result.googleSafeBrowsing.isMalicious 
                                          ? 'bg-red-500/5 border-red-500/20' 
                                          : result.googleSafeBrowsing.status === 'clean'
                                          ? 'bg-emerald-500/5 border-emerald-500/20'
                                          : 'bg-slate-500/5 border-slate-500/20'
                                      }`}>
                                        <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-xl border ${
                                            result.googleSafeBrowsing.isMalicious
                                              ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                              : result.googleSafeBrowsing.status === 'clean'
                                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                              : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                          }`}>
                                            {result.googleSafeBrowsing.isMalicious ? (
                                              <ShieldAlert className="w-5 h-5 text-red-400" />
                                            ) : (
                                              <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                            )}
                                          </div>
                                          <div>
                                            <span className="text-[11px] font-sans font-black text-white flex items-center gap-1.5">
                                              ✓ Google Safe Browsing
                                            </span>
                                            <span className={`text-[9px] font-mono uppercase block ${
                                              result.googleSafeBrowsing.isMalicious ? 'text-red-400' : 'text-slate-400'
                                            }`}>
                                              {result.googleSafeBrowsing.isMalicious 
                                                ? `Malicious: ${result.googleSafeBrowsing.threatCategories.join(', ')}` 
                                                : result.googleSafeBrowsing.message}
                                            </span>
                                          </div>
                                        </div>
                                        {result.googleSafeBrowsing.isMalicious && (
                                          <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded text-[9px] font-mono font-bold uppercase text-red-400 tracking-widest animate-pulse">
                                            Verified Threat
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Threat Indicators Container */}
                                <div className="px-8 py-6 border-t border-white/5 text-left">
                                  <h3 className={`text-[10px] font-bold ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'} uppercase tracking-[0.3em] mb-4`}>{t.threatIndicators}</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {result.tags.length > 0 ? result.tags.map(tag => (
                                      <motion.span 
                                        key={tag}
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2"
                                      >
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                        {tag}
                                      </motion.span>
                                    )) : (
                                      <span className="text-white/40 font-bold text-[10px] uppercase italic">{t.noIndicators}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="max-w-md space-y-8">
                             {showForwardScanner ? (
                               <motion.div
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                               >
                                 <ForwardingOptions 
                                   data={result} 
                                   language={uiLanguage} 
                                   onComplete={() => setShowForwardScanner(false)} 
                                   onToast={showIntelToast}
                                 />
                               </motion.div>
                             ) : (
                               <button
                                 onClick={() => setShowForwardScanner(true)}
                                 className={`w-full py-4 ${theme === 'dark' ? 'bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.08]' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'} border rounded-2xl flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all shadow-sm`}
                               >
                                 <Forward className="w-4 h-4" />
                                 {t.forwardToSecurity}
                               </button>
                             )}
                             <FeedbackForm language={uiLanguage} />
                          </div>
                        </motion.div>
                      )}
                      
                      {!result && !isScanning && (
                         <div className={`py-24 text-center border-2 border-dashed ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} rounded-3xl opacity-20`}>
                            <Shield className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-sm font-mono uppercase tracking-widest">{t.emptyHistory.split('.')[0]} // Idle</p>
                         </div>
                      )}
                    </motion.div>
                  )}

                  {scannerSubTab === 'email' && (
                    <motion.div
                      key="email-authenticate"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="w-full"
                    >
                      <EmailAuthenticatorView language={uiLanguage} theme={theme} />
                    </motion.div>
                  )}

                  {scannerSubTab === 'heuristics' && (
                    <motion.div
                      key="heuristics-scan"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="w-full"
                    >
                      <SignatureScannerView language={uiLanguage} theme={theme} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'intel' && (
              <motion.div
                key="intel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <ThreatIntelligenceHub language={uiLanguage} theme={theme} />
              </motion.div>
            )}

            {activeTab === 'risk_engine' && (
              <motion.div
                key="risk_engine"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <RiskEngineView language={uiLanguage} theme={theme} />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <ScanHistory language={uiLanguage} history={history} setHistory={setHistory} t={t} isRTL={isRTL} theme={theme} getRiskColor={getRiskColor} getRiskIcon={getRiskIcon} openModal={openModal} clearHistory={clearHistory} exportToCSV={exportToCSV} />
              </motion.div>
            )}

            {activeTab === 'wolf' && (
              <motion.div
                key="wolf"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <AmanovaWolfView language={uiLanguage} theme={theme} />
              </motion.div>
            )}

            {activeTab === 'ase' && (
              <motion.div
                key="ase"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <AdversarialSimulationEngine language={uiLanguage} theme={theme} />
              </motion.div>
            )}

            {activeTab === 'academy' && (
              <motion.div
                key="academy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <AmanovaAcademy language={uiLanguage} theme={theme} />
              </motion.div>
            )}

            {activeTab === 'family' && (
              <motion.div
                key="family"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <FamilyShield language={uiLanguage} />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SettingsView 
                  language={language} 
                  setLanguage={setLanguage} 
                  theme={theme} 
                  setTheme={setTheme} 
                  user={user}
                  profile={profile}
                  onLogout={handleLogout}
                  onOpenHelp={() => setShowHelpModal(true)}
                />
              </motion.div>
            )}

            {activeTab === 'score' && (
              <motion.div
                key="score"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <PersonalSecurityScore 
                  language={uiLanguage === 'Arabic' ? 'Arabic' : 'English'} 
                  theme={theme} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className={`mt-24 pt-12 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} flex flex-col md:flex-row justify-between gap-12 pb-12`}>
          <div className="space-y-4">
            <div className={`flex items-center gap-3 group cursor-help ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse" />
              <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'} uppercase tracking-widest`}>
                {t.systemNominal}
              </span>
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'} max-w-sm uppercase font-bold tracking-widest leading-relaxed ${isRTL ? 'text-right' : ''}`}>
               AMANOVA Digital Protection <br />
               Created for digital safety and analysis aid.
            </p>
          </div>
          
          <div className={`flex items-end gap-10 text-xs font-bold ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'} uppercase tracking-widest ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex flex-col gap-2 ${isRTL ? 'items-start' : 'items-end'}`}>
              <span>{t.securityLevel}</span>
              <span className="text-cyan-400 font-black opacity-100 text-sm tracking-tighter">{t.restricted}</span>
            </div>
            <div className={`flex flex-col gap-2 ${isRTL ? 'items-start' : 'items-end'}`}>
              <span>{t.dataCenter}</span>
              <span className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} opacity-80 leading-none`}>{t.region}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className={`fixed bottom-6 left-6 right-6 h-20 ${theme === 'dark' ? 'bg-[#0D0D0D]/80 border-white/10' : 'bg-white/80 border-slate-200'} backdrop-blur-2xl border rounded-[28px] md:hidden flex items-center justify-around px-4 z-50 shadow-2xl`}>
        {tabs.filter(tab => ['dashboard', 'scanner', 'history', 'family', 'settings'].includes(tab.id)).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-500/30' : 'text-[#888888]'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-tighter ${isActive ? 'text-cyan-400' : 'text-[#888888]'} ${isRTL ? 'font-cairo' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Threat Alert Modal */}
      <AnimatePresence>
        {showModal && modalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#151619] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className={`h-2 w-full ${modalData.risk === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} />
              
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-4 rounded-2xl ${modalData.risk === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none">
                      {modalData.risk} {t.modalRisk}
                    </h2>
                    <div className="flex flex-wrap gap-3 mt-4">
                       {modalData.tags?.map(tag => (
                          <span key={tag} className="text-white/60 font-bold text-xs uppercase tracking-widest border-2 border-white/20 px-3 py-1 rounded-xl bg-white/5">
                            {tag}
                          </span>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">{t.briefing}</h3>
                    <p className={`text-white leading-relaxed italic font-bold text-2xl border-cyan-400 py-4 ${isRTL ? 'border-r-4 pr-8 text-right' : 'border-l-4 pl-8'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                      "{modalData.explanation}"
                    </p>
                  </div>

                  {modalData.emailMetadata && (
                    <div className="space-y-6 bg-white/[0.06] border-2 border-white/20 rounded-3xl p-8 shadow-2xl">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-2.5 bg-cyan-400/10 rounded-xl border-2 border-cyan-400/30">
                          <Mail className="w-5 h-5 text-cyan-400" />
                        </div>
                        <span className="text-sm font-black text-cyan-400 uppercase tracking-widest">Extracted Forensics</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {modalData.emailMetadata.sender && (
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-white/40 uppercase block tracking-widest">{t.sender}</span>
                            <span className="text-sm font-bold text-white/90 block truncate bg-white/10 p-3 rounded-xl border border-white/10">{modalData.emailMetadata.sender}</span>
                          </div>
                        )}
                        {modalData.emailMetadata.recipient && (
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-white/40 uppercase block tracking-widest">{t.recipient}</span>
                            <span className="text-sm font-bold text-white/90 block truncate bg-white/10 p-3 rounded-xl border border-white/10">{modalData.emailMetadata.recipient}</span>
                          </div>
                        )}
                        {modalData.emailMetadata.subject && (
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-white/40 uppercase block tracking-widest">{t.subject}</span>
                            <span className="text-sm font-bold text-cyan-400 block truncate bg-cyan-400/10 p-3 rounded-xl border border-cyan-400/20">{modalData.emailMetadata.subject}</span>
                          </div>
                        )}
                      </div>
                      {modalData.emailMetadata.body && (
                        <div className="space-y-2 pt-4">
                           <span className="text-xs font-bold text-white/40 uppercase block tracking-widest">{t.bodyLabel}</span>
                           <p className="text-base text-white/70 leading-relaxed italic bg-white/10 p-5 rounded-xl border border-white/10">
                             "{modalData.emailMetadata.body.length > 200 ? `${modalData.emailMetadata.body.substring(0, 200)}...` : modalData.emailMetadata.body}"
                           </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AMANOVA 7-Layer Forensic Scan Visualizer */}
                  {modalData.sevenLayers && (
                    <div className="rounded-3xl overflow-hidden border border-white/10">
                      <SevenLayerVisualizer 
                        sevenLayers={modalData.sevenLayers} 
                        language={uiLanguage} 
                        theme={theme} 
                      />
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">{t.countermeasures}</h3>
                    <div className="bg-red-500/10 border-2 border-red-500/20 p-8 rounded-3xl flex items-start gap-6 shadow-xl">
                      <AlertTriangle className="w-10 h-10 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-lg font-black text-white uppercase tracking-tight">{t.doNotInteract}</p>
                        <p className="text-sm text-white/80 mt-2 leading-relaxed font-bold">{t.countermeasuresDesc}</p>
                      </div>
                    </div>
                  </div>

                  {showForwardModal ? (
                    <ForwardingOptions 
                      data={modalData} 
                      language={uiLanguage} 
                      onComplete={() => setShowForwardModal(false)} 
                      onToast={showIntelToast}
                    />
                  ) : (
                    <button
                      onClick={() => setShowForwardModal(true)}
                      className="w-full py-6 bg-cyan-400 text-black rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest hover:bg-cyan-300 transition-all shadow-2xl active:scale-95"
                    >
                      <Forward className="w-6 h-6" />
                      {t.forwardToSecurity}
                    </button>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <FeedbackForm language={uiLanguage} onDismiss={() => setShowModal(false)} />
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-cyan-400 transition-colors shadow-lg active:scale-95"
                  >
                    {t.modalUnderstand}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Help Centre Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-2xl ${theme === 'dark' ? 'bg-[#151619] border-white/10' : 'bg-white border-slate-200'} border rounded-3xl overflow-hidden shadow-2xl`}
            >
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-400/10 rounded-lg border border-cyan-400/20">
                    <HelpCircle className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {language === 'Arabic' ? 'مركز المساعدة' : 'Help Centre'}
                  </span>
                </div>
                <button 
                  onClick={() => setShowHelpModal(false)}
                  className={`p-2 hover:bg-white/5 rounded-full transition-colors ${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 md:p-12 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                    {language === 'Arabic' ? 'كيفية الفحص' : 'How to Scan'}
                  </h3>
                  <p className={`text-base leading-relaxed ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'} font-medium`}>
                    {language === 'Arabic' ? 'ببساطة انسخ أي نص مشبوه من رسائل البريد الإلكتروني أو الرسائل النصية أو وسائل التواصل الاجتماعي والصقه في صندوق الفحص. سيقوم نظام الذكاء الاصطناعي لدينا بتحليل المحتوى فوراً بحثاً عن أي تهديدات.' : 'Simply copy any suspicious text from emails, text messages, or social media and paste it into the scanner box. Our AI engine will instantly analyze the content for threats.'}
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                    {language === 'Arabic' ? 'مستويات الخطورة' : 'Risk Levels'}
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className={`flex gap-5 p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                      <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                      <div className="space-y-1">
                        <span className={`text-sm font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>High / Critical</span>
                        <p className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'} leading-relaxed font-bold`}>
                          {language === 'Arabic' ? 'تهديد مؤكد. لا تتفاعل مع المحتوى أو تضغط على أي روابط.' : 'Confirmed threat. Do not interact with the content or click any links.'}
                        </p>
                      </div>
                    </div>
                    <div className={`flex gap-5 p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                      <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 flex-shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                      <div className="space-y-1">
                        <span className={`text-sm font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Medium / Warning</span>
                        <p className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'} leading-relaxed font-bold`}>
                          {language === 'Arabic' ? 'محتوى مشبوه. يتطلب الحذر الشديد والتحقق الإضافي.' : 'Suspicious content. Requires extreme caution and further verification.'}
                        </p>
                      </div>
                    </div>
                    <div className={`flex gap-5 p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                      <div className="space-y-1">
                        <span className={`text-sm font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Low / Safe</span>
                        <p className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'} leading-relaxed font-bold`}>
                          {language === 'Arabic' ? 'يبدو أن المحتوى آمن للاستخدام العادي.' : 'Content appears legitimate for normal interaction.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                    {language === 'Arabic' ? 'وضع الحماية (Guardian Mode)' : 'Guardian Mode'}
                  </h3>
                  <p className={`text-base leading-relaxed ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'} font-medium`}>
                    {language === 'Arabic' ? 'اذهب إلى تبويب العائلة لربط حسابك بـ "ولي أمر" موثوق. سيتلقون تنبيهات فورية إذا اكتشف النظام تهديدات خطيرة موجهة إليك.' : 'Visit the Family tab to link your account with a trusted Guardian. They will receive instant alerts if the system detects high-level threats targeted at you.'}
                  </p>
                </div>

                <div className="pt-8 flex justify-end">
                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="px-10 py-4 bg-cyan-400 text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-300 transition-all shadow-xl active:scale-95"
                  >
                    {language === 'Arabic' ? 'فهمت' : 'Understood'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<AppLanguage>('English');
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => setProfile(data));
    } else {
      setProfile(null);
    }
  }, [user]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#06080A] flex items-center justify-center font-sans tracking-widest text-[#0070f3] uppercase font-black">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-16 h-16 animate-spin" />
          <span>Initializing AMANOVA...</span>
        </div>
      </div>
    );
  }

  const currentLanguage = language === 'Auto' ? 'English' : language;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage isRtl={currentLanguage === 'Arabic'} />} />
        <Route 
          path="/" 
          element={
            user ? (
              <Dashboard 
                user={user} 
                profile={profile} 
                language={language} 
                setLanguage={setLanguage}
                theme={theme}
                setTheme={setTheme}
              />
            ) : (
              <AuthPage 
                language={currentLanguage} 
                onSuccess={() => {
                  console.log("AMANOVA: Auth success callback triggered. Refreshing session...");
                  supabase.auth.getSession().then(({ data: { session } }) => {
                    if (session) {
                      console.log("AMANOVA: Session found, updating user state.");
                      setUser(session.user);
                    }
                  });
                }} 
              />
            )
          } 
        />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
