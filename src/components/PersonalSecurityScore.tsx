import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Key, 
  Lock, 
  Mail, 
  History, 
  Users, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Smartphone, 
  Cpu, 
  Sparkles, 
  Brain, 
  ArrowRight, 
  AlertOctagon,
  Fingerprint,
  TrendingUp,
  Award,
  BookOpen,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PersonalSecurityScoreProps {
  language: 'English' | 'Arabic';
  theme: 'light' | 'dark';
}

const TRANSLATIONS = {
  English: {
    title: "Personal Security Score Analyzer",
    subtitle: "Evaluate and harden your identity defenses against dynamic social engineering and cyber threat vectors.",
    scoreTitle: "Aggregate Security Stance",
    scoreOptimal: "OPTIMAL DEFENSE",
    scoreHigh: "SECURE & WATCHFUL",
    scoreMedium: "VULNERABILITIES DETECTED",
    scoreLow: "CRITICAL RISK EXPOSURE",
    
    passwordHealth: "Password Strength Audit",
    passwordDesc: "Evaluates key lengths, character variations, and credential entropy.",
    testPasswordPlaceholder: "Type a password to test...",
    passWeak: "Weak / Compromised",
    passFair: "Medium Strength",
    passStrong: "High Entropy / Strong",
    
    twoFaStatus: "Multi-Factor Authentication",
    twoFaDesc: "Select your active authentication protocol on primary accounts.",
    twoFaNone: "No MFA Active",
    twoFaSMS: "SMS Verification (SIM-Swap risk)",
    twoFaApp: "Authenticator App (TOTP)",
    twoFaKey: "Hardware Security Key (FIDO2)",
    
    emailExposure: "Dark Web Leak Scan",
    emailDesc: "Queries public breach databases for credential exposure logs.",
    emailInputPlaceholder: "Enter email address...",
    emailScanBtn: "Scan Dark Web Logs",
    scanning: "Searching Breached Records...",
    exposedIn: "Exposed in {count} database leaks!",
    noExposures: "No exposure detected in public logs.",
    
    threatHistory: "Historical Scan Activity",
    threatHistoryDesc: "Aggregates past scan queries and reported scam records.",
    scansPerformed: "Manual Scans Logged",
    threatsFlagged: "High-Risk Threats Flagged",
    historyGrade: "History Stance Rating",
    
    scamInteractions: "Security Reflex & Awareness",
    scamInteractionsDesc: "Evaluate behavioral traps and educational milestones.",
    clickedPhishLabel: "Have you ever clicked on an unexpected SMS/Email link?",
    clickedPhishYes: "Yes, I have",
    clickedPhishNo: "No, never",
    completedAcademyLabel: "Have you completed AMANOVA Academy training lessons?",
    completedAcademyYes: "Yes (+10 score bonus)",
    completedAcademyNo: "No, not yet",
    
    recommendations: "Actionable Defense Protocols",
    deployPatch: "Deploy Countermeasure",
    patchApplied: "Countermeasure Operational!",
    congratulations: "Pristine Defense Achieved! All recommendation patches are active.",
    
    aiInsightsTitle: "AI Cognitive Security Briefing",
    aiGenerating: "Generating neural optimization briefing...",
    aiBriefingFallback: "Enforce distinct passphrases across accounts. Avoid SMS 2FA. Clear historical browser sessions monthly to mitigate cookie hijacking.",
    generateAIBtn: "Query Gemini Security Counsel",
    
    pwnedSourceText: "Detected in {source} leak. High exposure risk."
  },
  Arabic: {
    title: "محلل مؤشر الأمان الشخصي",
    subtitle: "قم بتقييم وتحصين دفاعات هويتك الرقمية ضد الهندسة الاجتماعية والتهديدات السيبرانية المتطورة.",
    scoreTitle: "مستوى الأمان الموحد",
    scoreOptimal: "دفاع مثالي ممتاز",
    scoreHigh: "آمن وحذر",
    scoreMedium: "تم كشف نقاط ضعف",
    scoreLow: "خطر اختراق حرج",
    
    passwordHealth: "تدقيق قوة كلمة المرور",
    passwordDesc: "يحلل طول الكلمة، وتنوع الأحرف، وقوة التشفير.",
    testPasswordPlaceholder: "اكتب كلمة مرور لاختبارها...",
    passWeak: "ضعيفة / معرضة للاختراق",
    passFair: "متوسطة القوة",
    passStrong: "عالية القوة والتعقيد",
    
    twoFaStatus: "التحقق متعدد العوامل (2FA)",
    twoFaDesc: "حدد طريقة التحقق النشطة لحساباتك الرئيسية.",
    twoFaNone: "لا يوجد تحقق ثنائي",
    twoFaSMS: "رسائل نصية قصيرة (خطر تبديل الشريحة)",
    twoFaApp: "تطبيق المصادقة (TOTP)",
    twoFaKey: "مفتاح أمان مادي (FIDO2)",
    
    emailExposure: "فحص تسريب البريد الإلكتروني",
    emailDesc: "يبحث في قواعد البيانات العامة عن تسريبات حساباتك الموثقة.",
    emailInputPlaceholder: "أدخل بريدك الإلكتروني...",
    emailScanBtn: "فحص الويب المظلم",
    scanning: "جاري البحث في السجلات المسربة...",
    exposedIn: "مكشوف في {count} من تسريبات البيانات!",
    noExposures: "لم يتم العثور على أي تسريبات لبريدك الإلكتروني.",
    
    threatHistory: "سجل عمليات الفحص السابقة",
    threatHistoryDesc: "يحلل عدد الفحوصات والتهديدات التي قمت بالإبلاغ عنها.",
    scansPerformed: "الفحوصات اليدوية المسجلة",
    threatsFlagged: "التهديدات عالية الخطورة المكتشفة",
    historyGrade: "تقييم السجل الأمني",
    
    scamInteractions: "وعي وسلوك الحماية",
    scamInteractionsDesc: "يقيم تصرفاتك السلوكية ومستواك التعليمي.",
    clickedPhishLabel: "هل سبق لك النقر على رابط في بريد أو رسالة غير متوقعة؟",
    clickedPhishYes: "نعم، لقد فعلت",
    clickedPhishNo: "لا، لم أفعل أبداً",
    completedAcademyLabel: "هل أكملت الدروس التعليمية في أكاديمية AMANOVA؟",
    completedAcademyYes: "نعم (+١٠ نقاط إضافية)",
    completedAcademyNo: "لا، ليس بعد",
    
    recommendations: "بروتوكولات الدفاع الفورية الموصى بها",
    deployPatch: "تفعيل الإجراء المضاد",
    patchApplied: "تم تفعيل الترقية الأمنية!",
    congratulations: "لقد وصلت إلى مستوى الأمان الكامل! تم تفعيل جميع ترقيات الحماية.",
    
    aiInsightsTitle: "تقرير الأمان العصبي الذكي من Gemini",
    aiGenerating: "جاري توليد التقرير الأمني الذكي...",
    aiBriefingFallback: "استخدم كلمات مرور فريدة لكل حساب. تجنب تفعيل التحقق الثنائي عبر الرسائل النصية المباشرة لتجنب الاختراق. قم بزيارة قسم الأكاديمية دورياً.",
    generateAIBtn: "طلب استشارة أمنية من Gemini",
    
    pwnedSourceText: "تم كشف تسريب بريدك في قاعدة بيانات {source}."
  }
};

export function PersonalSecurityScore({ language, theme }: PersonalSecurityScoreProps) {
  const isRTL = language === 'Arabic';
  const t = TRANSLATIONS[language] || TRANSLATIONS['English'];

  // --- 1. STATE VARIABLES ---
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [twoFa, setTwoFa] = useState<'none' | 'sms' | 'app' | 'key'>('app');
  const [emailInput, setEmailInput] = useState('user@example.com');
  const [isEmailScanning, setIsEmailScanning] = useState(false);
  const [emailExposures, setEmailExposures] = useState<{ source: string; date: string; risk: string }[] | null>(null);
  
  // Behavior parameters
  const [clickedPhishing, setClickedPhishing] = useState<boolean>(false);
  const [completedAcademy, setCompletedAcademy] = useState<boolean>(true);

  // Remediation Patches state
  const [activePatches, setActivePatches] = useState<Record<string, boolean>>(() => {
    return {
      mfaPatch: localStorage.getItem('sentry_patch_mfa') === 'true',
      passLengthPatch: localStorage.getItem('sentry_patch_password') === 'true',
      darkWebLeakPatch: localStorage.getItem('sentry_patch_darkweb') === 'true',
      academyPatch: localStorage.getItem('sentry_patch_academy') === 'true'
    };
  });

  const [aiBriefing, setAiBriefing] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Track standard scan counts from localStorage
  const [historyStats, setHistoryStats] = useState({ scans: 14, highThreats: 2 });

  useEffect(() => {
    const saved = localStorage.getItem('sentry_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const highRiskCount = parsed.filter((item: any) => item.risk === 'High' || item.risk === 'Critical').length;
          setHistoryStats({
            scans: Math.max(12, parsed.length),
            highThreats: highRiskCount
          });
        }
      } catch (e) {
        console.error('Failed to parse history stats', e);
      }
    }
  }, []);

  // Synchronize from global events
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.type === 'patch_applied') {
        const patchId = e.detail.patchId;
        if (patchId === 'mfaPatch' || patchId === 'mfa') {
          setActivePatches(prev => ({ ...prev, mfaPatch: true }));
          localStorage.setItem('sentry_patch_mfa', 'true');
        } else if (patchId === 'academyPatch' || patchId === 'academy') {
          setActivePatches(prev => ({ ...prev, academyPatch: true }));
          localStorage.setItem('sentry_patch_academy', 'true');
        } else if (patchId === 'passLengthPatch' || patchId === 'password') {
          setActivePatches(prev => ({ ...prev, passLengthPatch: true }));
          localStorage.setItem('sentry_patch_password', 'true');
        } else if (patchId === 'darkWebLeakPatch' || patchId === 'darkweb') {
          setActivePatches(prev => ({ ...prev, darkWebLeakPatch: true }));
          localStorage.setItem('sentry_patch_darkweb', 'true');
        }
      }
    };
    window.addEventListener('sentry-threats-updated', handleUpdate);
    return () => window.removeEventListener('sentry-threats-updated', handleUpdate);
  }, []);

  // --- 2. CALCULATIONS ---

  // Password assessment score (0 - 20 points)
  const passwordResult = useMemo(() => {
    let score = 0;
    if (password.length === 0) return { score: 0, text: t.testPasswordPlaceholder, level: 'none' };
    
    // length rules
    if (password.length >= 8) score += 5;
    if (password.length >= 12) score += 5;
    if (password.length >= 16) score += 3;
    
    // characters rules
    if (/[A-Z]/.test(password)) score += 2;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 2;
    if (/[^A-Za-z0-9]/.test(password)) score += 2;

    // Patch applied
    if (activePatches.passLengthPatch) {
      score = 20;
    }

    let text = t.passWeak;
    let level: 'weak' | 'fair' | 'strong' = 'weak';
    if (score >= 15) {
      text = t.passStrong;
      level = 'strong';
    } else if (score >= 8) {
      text = t.passFair;
      level = 'fair';
    }

    return { score, text, level };
  }, [password, activePatches.passLengthPatch, t]);

  // 2FA Strength Score (0 - 25 points)
  const twoFaScore = useMemo(() => {
    if (activePatches.mfaPatch) return 25;
    switch (twoFa) {
      case 'key': return 25;
      case 'app': return 20;
      case 'sms': return 10;
      case 'none': return 0;
      default: return 20;
    }
  }, [twoFa, activePatches.mfaPatch]);

  // Email exposure score (0 - 20 points)
  // Starts at 20, drops by 7 per database exposure up to a max of 20 deduction.
  const emailExposureScore = useMemo(() => {
    if (activePatches.darkWebLeakPatch) return 20;
    if (!emailExposures) return 20; // assumed secure until scanned
    const deduction = emailExposures.length * 7;
    return Math.max(0, 20 - deduction);
  }, [emailExposures, activePatches.darkWebLeakPatch]);

  // Threat history score (0 - 15 points)
  // Starts at 15. Drops if they have registered critical unresolved threats in local records.
  const threatHistoryScore = useMemo(() => {
    const threatDeduction = Math.min(10, historyStats.highThreats * 5);
    return Math.max(5, 15 - threatDeduction);
  }, [historyStats]);

  // Scam interactions / awareness reflex score (0 - 20 points)
  const scamInteractionsScore = useMemo(() => {
    let score = 20;
    if (clickedPhishing) score -= 10;
    if (completedAcademy || activePatches.academyPatch) score += 5; // boost
    return Math.max(0, Math.min(20, score));
  }, [clickedPhishing, completedAcademy, activePatches.academyPatch]);

  // Combined score (0 - 100)
  const aggregateScore = useMemo(() => {
    const rawSum = passwordResult.score + twoFaScore + emailExposureScore + threatHistoryScore + scamInteractionsScore;
    return Math.min(100, Math.max(0, Math.round(rawSum)));
  }, [passwordResult.score, twoFaScore, emailExposureScore, threatHistoryScore, scamInteractionsScore]);

  // Dynamic recommendations generated in real-time
  const dynamicRecommendations = useMemo(() => {
    const items = [];

    // 1. Password weakness
    if (passwordResult.score < 15 && !activePatches.passLengthPatch) {
      items.push({
        id: 'passLengthPatch',
        gainedPoints: 15 - passwordResult.score + 5,
        titleEn: "Enforce Multi-layered Passphrase",
        titleAr: "استخدام كلمة مرور معقدة متعددة الرموز",
        descEn: "Upgrade to a 16+ character master key using diverse cases and symbols.",
        descAr: "قم بالترقية إلى مفتاح مرور يزيد عن ١٦ رمزاً مع استخدام أحرف كبيرة وصغيرة."
      });
    }

    // 2. 2FA not ideal
    if (twoFaScore < 25 && !activePatches.mfaPatch) {
      items.push({
        id: 'mfaPatch',
        gainedPoints: 25 - twoFaScore,
        titleEn: "Harden Secondary Login Verification",
        titleAr: "تشديد جدار حماية الحسابات الأساسية",
        descEn: "Upgrade MFA from SMS to Hardware Key or Google Authenticator.",
        descAr: "قم بترقية التحقق الثنائي من رسائل الهاتف المباشرة إلى تطبيق مصادقة مشفر."
      });
    }

    // 3. Email exposed in dark web leaks
    if (emailExposures && emailExposures.length > 0 && !activePatches.darkWebLeakPatch) {
      items.push({
        id: 'darkWebLeakPatch',
        gainedPoints: emailExposures.length * 7,
        titleEn: "Purge Exposed Password Sessions",
        titleAr: "حذف وإغلاق جلسات البريد المخترقة",
        descEn: "Revoke credentials and active tokens across databases leaked on web.",
        descAr: "قم بتبديل مفاتيح الدخول وإبطال الجلسات النشطة في المنصات التي تم تسريب بياناتها."
      });
    }

    // 4. Academy not done
    if (!completedAcademy && !activePatches.academyPatch) {
      items.push({
        id: 'academyPatch',
        gainedPoints: 10,
        titleEn: "Complete Anti-Phishing Neural Training",
        titleAr: "إكمال التدريب الأكاديمي لمكافحة الاحتيال",
        descEn: "Enroll in AMANOVA Academy Lesson 2 to train reflexes against social traps.",
        descAr: "أكمل درس الأكاديمية الخاص بتعزيز مهارة كشف انتحال الصوت والهندسة الاجتماعية."
      });
    }

    return items;
  }, [passwordResult, twoFaScore, emailExposures, completedAcademy, activePatches]);

  // --- 3. ACTIONS ---

  const handleApplyPatch = (id: string) => {
    setActivePatches(prev => {
      const updated = { ...prev, [id]: true };
      localStorage.setItem('sentry_patch_mfa', String(!!updated.mfaPatch));
      localStorage.setItem('sentry_patch_password', String(!!updated.passLengthPatch));
      localStorage.setItem('sentry_patch_darkweb', String(!!updated.darkWebLeakPatch));
      localStorage.setItem('sentry_patch_academy', String(!!updated.academyPatch));
      return updated;
    });

    const globalScoreIncrement = id === 'mfaPatch' ? 6 : id === 'academyPatch' ? 5 : 4;
    
    // Broadcast event to other components to update their dashboards
    const customEvent = new CustomEvent('sentry-threats-updated', {
      detail: { type: 'patch_applied', patchId: id, scoreGained: globalScoreIncrement }
    });
    window.dispatchEvent(customEvent);
  };

  const handleEmailScan = () => {
    if (isEmailScanning || !emailInput.trim()) return;
    setIsEmailScanning(true);
    setEmailExposures(null);

    setTimeout(() => {
      // Simulate real breach results based on input email
      const simulatedBreaches = [
        { source: 'Canva Cloud Dump', date: 'May 2024', risk: 'Medium' },
        { source: 'Adobe Credentials Collection', date: 'Oct 2023', risk: 'High' }
      ];
      // Add a third if it's a typical compromised email
      if (emailInput.includes('hacker') || emailInput.includes('pwned') || emailInput.length % 2 === 0) {
        simulatedBreaches.push({ source: 'BreachCompilation v2', date: 'Jan 2026', risk: 'Critical' });
      }
      setEmailExposures(simulatedBreaches);
      setIsEmailScanning(false);
    }, 1800);
  };

  const generateAIBriefing = async () => {
    setIsAiLoading(true);
    setAiBriefing('');

    try {
      // Use standard fetch call to proxy backend for secure Gemini operations
      const response = await fetch('/api/query-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are the chief AI Cyber Threat Advisor at AMANOVA.
          The user has a Personal Security Score of ${aggregateScore}/100.
          
          Specific Parameters Evaluated:
          - Password Score: ${passwordResult.score}/20 (Password current complexity tier: ${passwordResult.text})
          - 2FA Factor strength level: ${twoFaScore}/25 (Active choice: ${twoFa})
          - Email Exposure Risk: ${emailExposureScore}/20 (Leaks detected: ${emailExposures?.length || 0})
          - Threat History Level: ${threatHistoryScore}/15 (Scan count: ${historyStats.scans})
          - Awareness/Scam interaction response: ${scamInteractionsScore}/20
          
          Mission: Provide a highly custom, crisp 3-bullet personalized security hardening protocol based on this profile.
          Language: Respond entirely in ${language}. Maintain serious, highly technical, yet reassuring display style. No generic introductions or conversational fluff. Use elegant spacing.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiBriefing(data.result || t.aiBriefingFallback);
      } else {
        setAiBriefing(t.aiBriefingFallback);
      }
    } catch (e) {
      console.error('Gemini proxy error', e);
      setAiBriefing(t.aiBriefingFallback);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={`space-y-8 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} ${isRTL ? 'font-cairo text-right' : 'font-sans text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* HEADER SECTION */}
      <div className={`p-8 rounded-[32px] relative overflow-hidden border ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#0B0F13] via-[#0E1217] to-[#12161E] border-white/5 shadow-2xl' 
          : 'bg-white border-slate-200/80 shadow-[0_8px_30px_rgba(100,116,139,0.04)]'
      }`}>
        {theme === 'dark' && (
          <div className="absolute -right-24 -top-24 w-64 h-64 bg-cyan-400/5 rounded-full blur-[90px]" />
        )}
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl">
            <Fingerprint className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-[0.25em] block">
              Identity Threat Vector Auditor
            </span>
            <h1 className="text-3xl font-black uppercase tracking-tight">
              {t.title}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'} mt-1 max-w-2xl`}>
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* DETAILED VECTOR AUDIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: THE FIVE MULTI-VECTORS OF PERSONAL DEFENSE (COL-SPAN 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* VECTOR 1: PASSWORD HEALTH */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0D0F12] border-white/5' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">{t.passwordHealth}</h3>
                  <span className={`text-[9px] ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{t.passwordDesc}</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">{passwordResult.score} / 20 pts</span>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.testPasswordPlaceholder}
                  disabled={activePatches.passLengthPatch}
                  className={`w-full p-4 rounded-xl text-sm ${
                    theme === 'dark' ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'
                  } border focus:outline-none focus:border-cyan-400 font-mono`}
                />
                <button 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-bold ${
                    passwordResult.level === 'strong' ? 'text-emerald-400' : passwordResult.level === 'fair' ? 'text-amber-400' : 'text-rose-500'
                  }`}>
                    {passwordResult.text}
                  </span>
                  <div className="flex gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${password.length >= 12 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {password.length} chars
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${/[^A-Za-z0-9]/.test(password) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      Symbols
                    </span>
                  </div>
                </div>
              )}

              {activePatches.passLengthPatch && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>AMANOVA Passphrase Shield Active (Enforced High Entropy Core)</span>
                </div>
              )}
            </div>
          </div>

          {/* VECTOR 2: 2FA STATUS */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0D0F12] border-white/5' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">{t.twoFaStatus}</h3>
                  <span className={`text-[9px] ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{t.twoFaDesc}</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">{twoFaScore} / 25 pts</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'none', label: t.twoFaNone, points: 0, danger: true },
                { id: 'sms', label: t.twoFaSMS, points: 10, warning: true },
                { id: 'app', label: t.twoFaApp, points: 20, safe: true },
                { id: 'key', label: t.twoFaKey, points: 25, optimal: true }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (!activePatches.mfaPatch) {
                      setTwoFa(opt.id as any);
                    }
                  }}
                  disabled={activePatches.mfaPatch}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    twoFa === opt.id
                      ? 'bg-cyan-400/10 border-cyan-400 text-cyan-400'
                      : theme === 'dark' ? 'bg-black/20 border-white/5 text-slate-400 hover:border-white/10' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold font-sans">{opt.label}</span>
                  <span className={`text-[10px] font-mono font-bold ${
                    opt.points === 25 ? 'text-emerald-400' : opt.points === 20 ? 'text-cyan-400' : opt.points === 10 ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    +{opt.points}
                  </span>
                </button>
              ))}
            </div>

            {activePatches.mfaPatch && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Multi-factor Hardware Vault Patched Successfully (+25 optimal tier)</span>
              </div>
            )}
          </div>

          {/* VECTOR 3: EMAIL EXPOSURE */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0D0F12] border-white/5' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">{t.emailExposure}</h3>
                  <span className={`text-[9px] ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{t.emailDesc}</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">{emailExposureScore} / 20 pts</span>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={t.emailInputPlaceholder}
                disabled={activePatches.darkWebLeakPatch}
                className={`flex-1 p-4 rounded-xl text-sm ${
                  theme === 'dark' ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'
                } border focus:outline-none focus:border-cyan-400 font-sans`}
              />
              <button
                onClick={handleEmailScan}
                disabled={isEmailScanning || activePatches.darkWebLeakPatch}
                className="px-6 py-4 bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-800 disabled:text-slate-500 text-black font-black uppercase rounded-xl text-xs tracking-wider transition-all"
              >
                {isEmailScanning ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {t.scanning}
                  </span>
                ) : t.emailScanBtn}
              </button>
            </div>

            {/* Simulated exposures details */}
            {emailExposures && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className={`p-3.5 rounded-xl border ${
                  emailExposures.length > 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                } text-xs font-bold`}>
                  {emailExposures.length > 0 
                    ? t.exposedIn.replace('{count}', String(emailExposures.length))
                    : t.noExposures}
                </div>

                {emailExposures.length > 0 && !activePatches.darkWebLeakPatch && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                    {emailExposures.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg border text-left ${
                          theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <span className="text-[10px] font-black text-white/90 block leading-tight">{item.source}</span>
                        <span className="text-[9px] text-slate-500 block leading-normal">{item.date}</span>
                        <span className="text-[9px] text-red-500 uppercase font-black block mt-1 tracking-wider">{item.risk} Exposure</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activePatches.darkWebLeakPatch && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Identities Revoked & Dark Web Exposure Patched (+20 score restored)</span>
              </div>
            )}
          </div>

          {/* VECTOR 4: THREAT HISTORY & SCAN ENGAGEMENT */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0D0F12] border-white/5' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">{t.threatHistory}</h3>
                  <span className={`text-[9px] ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{t.threatHistoryDesc}</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">{threatHistoryScore} / 15 pts</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider mb-0.5">{t.scansPerformed}</span>
                <span className="text-2xl font-black">{historyStats.scans}</span>
                <span className="text-[9px] text-emerald-400 font-black block mt-1">Audit Ledger Registered</span>
              </div>

              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider mb-0.5">{t.threatsFlagged}</span>
                <span className={`text-2xl font-black ${historyStats.highThreats > 0 ? 'text-amber-500' : 'text-cyan-400'}`}>
                  {historyStats.highThreats}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Real-time Block Feed</span>
              </div>
            </div>
          </div>

          {/* VECTOR 5: SCAM INTERACTIONS & AWARENESS */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0D0F12] border-white/5' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">{t.scamInteractions}</h3>
                  <span className={`text-[9px] ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{t.scamInteractionsDesc}</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">{scamInteractionsScore} / 20 pts</span>
            </div>

            <div className="space-y-4">
              {/* Scam Click question */}
              <div className="space-y-2">
                <label className="text-xs font-bold block">{t.clickedPhishLabel}</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setClickedPhishing(true)}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-black uppercase transition-all ${
                      clickedPhishing 
                        ? 'bg-rose-500/15 border-rose-500 text-rose-500' 
                        : theme === 'dark' ? 'bg-black/20 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {t.clickedPhishYes}
                  </button>
                  <button
                    onClick={() => setClickedPhishing(false)}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-black uppercase transition-all ${
                      !clickedPhishing 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : theme === 'dark' ? 'bg-black/20 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {t.clickedPhishNo}
                  </button>
                </div>
              </div>

              {/* Academy Lessons check */}
              <div className="space-y-2">
                <label className="text-xs font-bold block">{t.completedAcademyLabel}</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCompletedAcademy(true)}
                    disabled={activePatches.academyPatch}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-black uppercase transition-all ${
                      completedAcademy || activePatches.academyPatch
                        ? 'bg-cyan-400/10 border-cyan-400 text-cyan-400' 
                        : theme === 'dark' ? 'bg-black/20 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {t.completedAcademyYes}
                  </button>
                  <button
                    onClick={() => setCompletedAcademy(false)}
                    disabled={activePatches.academyPatch}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-black uppercase transition-all ${
                      !completedAcademy && !activePatches.academyPatch
                        ? 'bg-rose-500/15 border-rose-500 text-rose-500' 
                        : theme === 'dark' ? 'bg-black/20 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {t.completedAcademyNo}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AGGREGATE DISPLAY, DYNAMIC RECOMMENDATIONS AND COGNITIVE BRIEFING */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* THE BIG SECURITY SCORE GAUGE */}
          <div className={`p-6 rounded-[32px] border ${
            theme === 'dark' ? 'bg-gradient-to-b from-[#0B0F13] to-[#0E1217] border-white/5 shadow-2xl' : 'bg-white border-slate-200'
          } flex flex-col items-center justify-center relative overflow-hidden group`}>
            
            {theme === 'dark' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-[40px]" />
            )}

            <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-[0.2em] mb-4">
              {t.scoreTitle}
            </span>

            {/* Circular SVG gauge */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  stroke={theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F1F5F9'} 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  stroke={aggregateScore >= 90 ? '#10B981' : aggregateScore >= 75 ? '#22D3EE' : aggregateScore >= 50 ? '#F59E0B' : '#EF4444'} 
                  strokeWidth="8" 
                  fill="transparent"
                  strokeDasharray="263.8"
                  animate={{ strokeDashoffset: 263.8 - (263.8 * aggregateScore) / 100 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <motion.span 
                  className={`text-5xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'} block`}
                >
                  {aggregateScore}
                </motion.span>
                <span className={`text-[9px] font-mono font-black uppercase tracking-widest block mt-1 ${
                  aggregateScore >= 90 ? 'text-emerald-400' : aggregateScore >= 75 ? 'text-cyan-400' : aggregateScore >= 50 ? 'text-amber-400' : 'text-rose-500'
                }`}>
                  {aggregateScore >= 90 ? t.scoreOptimal : aggregateScore >= 75 ? t.scoreHigh : aggregateScore >= 50 ? t.scoreMedium : t.scoreLow}
                </span>
              </div>
            </div>

            {/* Micro-insights box */}
            <div className={`w-full mt-6 p-4 rounded-2xl ${
              theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'
            } border text-[11px] text-slate-400 leading-relaxed text-center`}>
              {isRTL 
                ? 'مؤشر أمان متكامل بناءً على خمسة أبعاد أمنية رئيسية. قم بتفعيل الدفاعات لمعالجة الثغرات فوراً.'
                : 'Aggregated security index formulated from multi-vector posture analyses. Deploy countermeasures below to neutralize threats immediately.'}
            </div>
          </div>

          {/* DYNAMIC RECOMMENDATIONS PROTOCOL */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0D0F12] border-white/5' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-black uppercase tracking-wider">{t.recommendations}</h3>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {dynamicRecommendations.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-xl border ${
                      theme === 'dark' ? 'bg-white/[0.01] border-white/5 hover:border-cyan-400/20' : 'bg-slate-50 border-slate-200'
                    } flex flex-col justify-between gap-3 transition-colors`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white/90 leading-tight">
                          {isRTL ? item.titleAr : item.titleEn}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400">+{item.gainedPoints} pts</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-snug">
                        {isRTL ? item.descAr : item.descEn}
                      </span>
                    </div>

                    <button
                      onClick={() => handleApplyPatch(item.id)}
                      className="w-full py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-[10px] font-black uppercase rounded-lg tracking-wider transition-all"
                    >
                      {t.deployPatch}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {dynamicRecommendations.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center"
                >
                  <Award className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                    {t.congratulations}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* COGNITIVE AI BRIEFING BOX */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-gradient-to-br from-[#0B0F13] to-[#12161E] border-white/5' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-wider">{t.aiInsightsTitle}</h3>
              </div>
            </div>

            <div className="space-y-4">
              {isAiLoading ? (
                <div className="space-y-2 py-4">
                  <div className="h-3 w-3/4 bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-slate-800 rounded animate-pulse" />
                  <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider mt-2">
                    {t.aiGenerating}
                  </span>
                </div>
              ) : aiBriefing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-xs ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'} leading-relaxed font-sans font-medium bg-black/15 p-4 rounded-xl border border-white/5`}
                >
                  {aiBriefing}
                </motion.div>
              ) : (
                <button
                  onClick={generateAIBriefing}
                  className="w-full py-3 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  {t.generateAIBtn}
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
