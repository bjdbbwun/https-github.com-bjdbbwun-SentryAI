import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Flame, 
  TrendingUp, 
  Globe, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  RefreshCw, 
  ArrowRight, 
  Info, 
  Smartphone, 
  Tablet, 
  Send, 
  Zap, 
  Filter, 
  X,
  Target,
  Bell,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SecurityDashboardProps {
  language: 'English' | 'Arabic';
  theme: 'light' | 'dark';
  onNavigateToTab?: (tab: 'dashboard' | 'scanner' | 'intel' | 'risk_engine' | 'wolf' | 'history' | 'academy' | 'family' | 'settings' | 'enterprise' | 'score') => void;
}

interface ThreatCampaign {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  typeAr: string;
  status: 'Active' | 'Monitored' | 'Contained';
  statusAr: string;
  blockedCount: number;
  severity: 'Critical' | 'High' | 'Medium';
  lastSeen: string;
}

interface LiveThreatLog {
  id: string;
  source: string;
  type: string;
  typeAr: string;
  target: string;
  targetAr: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  action: string;
  actionAr: string;
  timestamp: string;
}

interface FamilyMemberStatus {
  id: string;
  name: string;
  nameAr: string;
  relation: string;
  relationAr: string;
  device: 'Phone' | 'Tablet' | 'Computer';
  deviceAr: string;
  status: 'Secure' | 'Warning' | 'Protected';
  statusAr: string;
  lastActive: string;
  lastActiveAr: string;
  scansCount: number;
}

// Translations dictionary specifically for the dashboard
const DASHBOARD_TRANSLATIONS = {
  English: {
    title: "Obitrex Dashboard",
    tagline: "Simple digital protection for you and your family",
    threatsToday: "Threats Blocked Today",
    campaigns: "Monitored Campaigns",
    riskTrends: "Weekly Risk Trends",
    threatMap: "Interactive Protection Map",
    latestThreats: "Real-time Activity Log",
    securityScore: "Obitrex Protection Score",
    familyStatus: "Family Safety Circle",
    activeDefenses: "Protection Status",
    remediationTitle: "Recommended Optimization Actions",
    remediateBtn: "Fix Issue",
    remediatedMsg: "Applied security patch successfully!",
    mfaRecommendation: "Enable Multi-Factor Authentication on family accounts (+6)",
    mfaDesc: "Protects against credential harvesting campaigns.",
    backupRecommendation: "Configure automatic backups on Grandma's iPad (+4)",
    backupDesc: "Mitigates ransomware threats.",
    academyRecommendation: "Complete Academy Lesson 2: AI Voice Cloning (+5)",
    academyDesc: "Trains reflexes against social engineering calls.",
    activeSlogan: "OBITREX DIGITAL PROTECTION SYSTEM ACTIVE",
    liveThreats: "Live Activity",
    nodesActive: "Protected Devices",
    mapLabel: "Active Safety Interceptors",
    sendTip: "Send Tip",
    pingSafe: "Ping Safe Word",
    familySafeTip: "Sent emergency code to",
    actionBlocked: "BLOCKED",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
    activeCampaigns: "Active Protection",
    contained: "Resolved",
    monitored: "Monitored",
    quickScan: "Initiate Diagnostic Audit",
    auditSuccess: "System diagnostic audit passed successfully!",
    counterLabel: "Logged Safety Incidents",
    threatOrigin: "Activity Source",
    threatDestination: "Target Device"
  },
  Arabic: {
    title: "لوحة تحكم أوبتريكس",
    tagline: "حماية رقمية بسيطة لك ولعائلتك",
    threatsToday: "التهديدات المحظورة اليوم",
    campaigns: "الحملات المراقبة",
    riskTrends: "اتجاهات المخاطر الأسبوعية",
    threatMap: "خريطة الحماية التفاعلية",
    latestThreats: "سجل الأنشطة الفوري",
    securityScore: "مؤشر حماية أوبتريكس",
    familyStatus: "دائرة حماية العائلة",
    activeDefenses: "حالة الحماية",
    remediationTitle: "إجراءات التحسين الموصى بها",
    remediateBtn: "إصلاح الثغرة",
    remediatedMsg: "تم تطبيق الترقية الأمنية بنجاح!",
    mfaRecommendation: "تفعيل التحقق الثنائي لحسابات العائلة (+6)",
    mfaDesc: "يمنع هجمات سرقة بيانات الاعتماد والسيطرة.",
    backupRecommendation: "تفعيل النسخ الاحتياطي التلقائي لجهاز الجدة (+4)",
    backupDesc: "يخفف من مخاطر برمجيات الفدية الخبيثة.",
    academyRecommendation: "إكمال الدرس الثاني بالأكاديمية: تزييف الصوت (+5)",
    academyDesc: "يدرب على كشف محاولات الهندسة الاجتماعية الصوتية.",
    activeSlogan: "نظام أوبتريكس للحماية الرقمية نشط",
    liveThreats: "الأنشطة الفورية",
    nodesActive: "الأجهزة المحمية",
    mapLabel: "أجهزة الحماية والاعتراض النشطة",
    sendTip: "إرسال نصيحة",
    pingSafe: "إرسال كلمة الأمان",
    familySafeTip: "تم إرسال رمز الطوارئ وكلمة السر إلى",
    actionBlocked: "تم الحظر",
    critical: "حرِج",
    high: "مرتفع",
    medium: "متوسط",
    low: "منخفض",
    activeCampaigns: "الحماية النشطة",
    contained: "تم الحل",
    monitored: "مراقب",
    quickScan: "بدء فحص تشخيصي",
    auditSuccess: "اكتمل الفحص التشخيصي بنجاح تام!",
    counterLabel: "الحوادث الأمنية المسجلة",
    threatOrigin: "مصدر النشاط",
    threatDestination: "الجهاز المستهدف"
  }
};

export function SecurityDashboard({ language, theme, onNavigateToTab }: SecurityDashboardProps) {
  const isRTL = language === 'Arabic';
  const t = DASHBOARD_TRANSLATIONS[language] || DASHBOARD_TRANSLATIONS['English'];

  // 1. STATE: Security Score and Optimization Items
  const [remediatedItems, setRemediatedItems] = useState<Record<string, boolean>>(() => {
    return {
      mfa: localStorage.getItem('sentry_patch_mfa') === 'true',
      backup: localStorage.getItem('sentry_patch_backup') === 'true',
      academy: localStorage.getItem('sentry_patch_academy') === 'true'
    };
  });
  const [showScorePulse, setShowScorePulse] = useState(false);

  // Dynamic security score calculation based on remediated items. Base nominal is 75, maxes out at 100.
  const securityScore = useMemo(() => {
    let score = 75;
    if (remediatedItems.mfa) score += 10;
    if (remediatedItems.backup) score += 7;
    if (remediatedItems.academy) score += 8;
    return Math.min(100, score);
  }, [remediatedItems]);

  useEffect(() => {
    localStorage.setItem('sentry_patch_mfa', String(!!remediatedItems.mfa));
    localStorage.setItem('sentry_patch_backup', String(!!remediatedItems.backup));
    localStorage.setItem('sentry_patch_academy', String(!!remediatedItems.academy));
  }, [remediatedItems]);

  // Two-way synchronization with other modules/tabs via custom events
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.type === 'patch_applied') {
        const patchId = e.detail.patchId;
        if (patchId === 'mfaPatch' || patchId === 'mfa') {
          setRemediatedItems(prev => ({ ...prev, mfa: true }));
        } else if (patchId === 'academyPatch' || patchId === 'academy') {
          setRemediatedItems(prev => ({ ...prev, academy: true }));
        } else if (patchId === 'backup') {
          setRemediatedItems(prev => ({ ...prev, backup: true }));
        }
        setShowScorePulse(true);
        setTimeout(() => setShowScorePulse(false), 1500);
      }
    };
    window.addEventListener('sentry-threats-updated', handleUpdate);
    return () => window.removeEventListener('sentry-threats-updated', handleUpdate);
  }, []);

  // 2. STATE: Threats Today (live updating counters)
  const [threatsCount, setThreatsCount] = useState(38);
  const [scannedSignalsCount, setScannedSignalsCount] = useState(1485);
  const [lastIncrement, setLastIncrement] = useState<'threat' | 'signal' | null>(null);

  // 3. STATE: Monitored Campaigns
  const [campaigns, setCampaigns] = useState<ThreatCampaign[]>([
    { id: 'camp-1', name: 'Operation Cobalt Shadow', nameAr: 'عملية الظل الكوبالتي', type: 'Credential Harvesting', typeAr: 'سرقة بيانات الدخول', status: 'Active', statusAr: 'نشط', blockedCount: 14, severity: 'Critical', lastSeen: '2 mins ago' },
    { id: 'camp-2', name: 'SunPass Toll Trap Smishing', nameAr: 'فخ رسائل رسوم الطرق', type: 'Financial Extortion', typeAr: 'ابتزاز مالي', status: 'Active', statusAr: 'نشط', blockedCount: 22, severity: 'High', lastSeen: '5 mins ago' },
    { id: 'camp-3', name: 'Netflix Subscription Typo spoof', nameAr: 'انتحال اشتراك نتفليكس الإملائي', type: 'Brand Phishing', typeAr: 'تصيد الماركات', status: 'Contained', statusAr: 'تم الاحتواء', blockedCount: 8, severity: 'Medium', lastSeen: '1 hour ago' },
    { id: 'camp-4', name: 'AI Grandma Voice Impersonator', nameAr: 'انتحال صوتي للجدة بالذكاء الاصطناعي', type: 'Social Engineering', typeAr: 'هندسة اجتماعية', status: 'Monitored', statusAr: 'مراقب', blockedCount: 3, severity: 'Critical', lastSeen: '15 mins ago' }
  ]);

  // 4. STATE: Live Threat Log ledger
  const [threatLogs, setThreatLogs] = useState<LiveThreatLog[]>([
    { id: 'log-1', source: 'support@netfIix-billing.com', type: 'Phishing Brand', typeAr: 'تصيد ماركات', target: 'Grandma\'s Inbox', targetAr: 'بريد الجدة', severity: 'High', action: 'RE-ROUTED TO SANDBOX', actionAr: 'تم النقل للبيئة المعزولة', timestamp: '09:32:04' },
    { id: 'log-2', source: '+1 (555) 392-8102', type: 'SunPass Scam SMS', typeAr: 'رسالة احتيال رسوم طرق', target: 'Dad\'s Phone', targetAr: 'هاتف الوالد', severity: 'High', action: 'BLOCKED & INGESTED', actionAr: 'تم الحظر وإضافته للقواعد', timestamp: '09:30:15' },
    { id: 'log-3', source: 'verification-chase-portal.biz', type: 'Redirect Delimiter Link', typeAr: 'رابط إعادة توجيه مخادع', target: 'Son\'s Tablet', targetAr: 'جهاز الابن اللوحي', severity: 'Critical', action: 'DNS POISON BLOCK', actionAr: 'حظر فوري للنطاق', timestamp: '09:27:40' },
    { id: 'log-4', source: 'claim-manager-john@outlook.com', type: 'Advance-fee Sweepstakes', typeAr: 'يانصيب وهمي مالي', target: 'Grandpa\'s Email', targetAr: 'بريد الجد', severity: 'Medium', action: 'SPAM QUARANTINE', actionAr: 'عزل فوري في المهملات', timestamp: '09:15:22' },
    { id: 'log-5', source: 'http://dhl-express-tracking.tk', type: 'Free TLD Malicious Site', typeAr: 'نطاق مجاني خبيث الشحن', target: 'Grandma\'s Tablet', targetAr: 'جهاز الجدة اللوحي', severity: 'High', action: 'IP CONFINEMENT', actionAr: 'حظر بروتوكول الإنترنت', timestamp: '08:54:11' }
  ]);

  // 5. STATE: Family Circle status list
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberStatus[]>([
    { id: 'f-1', name: 'Grandma Betty', nameAr: 'الجدة بيتي', relation: 'Grandmother', relationAr: 'الجدة', device: 'Tablet', deviceAr: 'جهاز لوحي', status: 'Protected', statusAr: 'محمي', lastActive: '3 mins ago', lastActiveAr: 'منذ ٣ دقائق', scansCount: 14 },
    { id: 'f-2', name: 'Grandpa Joseph', nameAr: 'الجد جوزيف', relation: 'Grandfather', relationAr: 'الجد', device: 'Tablet', deviceAr: 'جهاز لوحي', status: 'Secure', statusAr: 'آمن', lastActive: '12 mins ago', lastActiveAr: 'منذ ١٢ دقيقة', scansCount: 9 },
    { id: 'f-3', name: 'Uncle George', nameAr: 'العم جورج', relation: 'Uncle', relationAr: 'العم', device: 'Phone', deviceAr: 'هاتف', status: 'Secure', statusAr: 'آمن', lastActive: 'Just now', lastActiveAr: 'الآن', scansCount: 22 },
    { id: 'f-4', name: 'Daughter Sarah', nameAr: 'الابنة سارة', relation: 'Daughter', relationAr: 'الابنة', device: 'Phone', deviceAr: 'هاتف', status: 'Protected', statusAr: 'محمي', lastActive: '1 hr ago', lastActiveAr: 'منذ ساعة', scansCount: 31 }
  ]);

  // 6. STATE: Active Map Nodes for interactive map
  const [hoveredMapNode, setHoveredMapNode] = useState<string | null>(null);
  const [mapAttackCount, setMapAttackCount] = useState(0);

  // 7. Auxiliary Notifications or Audits
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Use localStorage history if present to populate actual logs
  useEffect(() => {
    const savedHistory = localStorage.getItem('sentry_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (parsed && parsed.length > 0) {
          // Map historical scans into threat logs
          const historicalLogs: LiveThreatLog[] = parsed.slice(0, 5).map((item: any, idx: number) => {
            const date = new Date(item.timestamp);
            const formattedTime = date.toTimeString().split(' ')[0];
            return {
              id: `hist-${item.id || idx}`,
              source: item.text.slice(0, 32) + (item.text.length > 32 ? '...' : ''),
              type: item.classification || 'Phishing Audit',
              typeAr: isRTL ? 'فحص تصيد' : 'Phishing Audit',
              target: 'Manual Input Scan',
              targetAr: isRTL ? 'فحص يدوي' : 'Manual Input Scan',
              severity: item.risk || 'Low',
              action: item.risk === 'High' ? 'DEEP ANALYSIS BLOCK' : 'LOGGED & PASSED',
              actionAr: isRTL ? (item.risk === 'High' ? 'حظر وتحليل عميق' : 'تسجيل وتمرير') : (item.risk === 'High' ? 'DEEP ANALYSIS BLOCK' : 'LOGGED & PASSED'),
              timestamp: formattedTime
            };
          });
          setThreatLogs(prev => {
            // Merge with default logs to ensure density, avoiding duplicates
            const combined = [...historicalLogs, ...prev];
            const seen = new Set();
            return combined.filter(el => {
              const duplicate = seen.has(el.source);
              seen.add(el.source);
              return !duplicate;
            }).slice(0, 6);
          });
        }
      } catch (e) {
        console.error('Failed to parse history for dashboard', e);
      }
    }
  }, [language]);

  // Real-time telemetry simulation logic
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Simulate new incoming signals scanned
      const signalIncrement = Math.floor(Math.random() * 3) + 1;
      setScannedSignalsCount(prev => prev + signalIncrement);
      setLastIncrement('signal');

      // 2. Occasionally trigger a blocked threat
      if (Math.random() > 0.8) {
        setThreatsCount(prev => prev + 1);
        setLastIncrement('threat');
        setMapAttackCount(prev => prev + 1);

        // Append a dynamic randomized log to the ledger
        const randomSource = [
          'alert-chase-update@secure-billing-ssl.org',
          '+1 (800) 412-0051',
          'sunpass-toll-violation.com/pay',
          'support@netflix-renewals-verify.cc',
          'package-held-fee-usps.tk',
          'verify-your-apple-id.net'
        ][Math.floor(Math.random() * 6)];

        const randomTypeEn = ['Phishing Smishing', 'Domain Spoofing', 'Financial Scam', 'Social Engineering Call'][Math.floor(Math.random() * 4)];
        const randomTypeAr = isRTL ? ['تصيد ذكي', 'تزييف نطاق', 'احتيال مالي', 'مكالمة هندسة اجتماعية'][Math.floor(Math.random() * 4)] : randomTypeEn;

        const randomTargetEn = ['Grandma Betty\'s iPad', 'Daughter Sarah\'s Phone', 'Grandpa\'s Ledger', 'Family Guard Server'][Math.floor(Math.random() * 4)];
        const randomTargetAr = isRTL ? ['لوحي الجدة بيتي', 'هاتف الابنة سارة', 'بريد الجد جوزيف', 'خادم الدفاع العائلي'][Math.floor(Math.random() * 4)] : randomTargetEn;

        const date = new Date();
        const timestampStr = date.toTimeString().split(' ')[0];

        const newLog: LiveThreatLog = {
          id: `live-rand-${Date.now()}`,
          source: randomSource,
          type: randomTypeEn,
          typeAr: randomTypeAr,
          target: randomTargetEn,
          targetAr: randomTargetAr,
          severity: Math.random() > 0.6 ? 'Critical' : 'High',
          action: 'NEURAL CORRELATION BLOCK',
          actionAr: isRTL ? 'حظر عصبي فوري للتهديد' : 'NEURAL CORRELATION BLOCK',
          timestamp: timestampStr
        };

        setThreatLogs(prev => [newLog, ...prev.slice(0, 5)]);

        // Increment block counts inside random campaigns
        setCampaigns(prevCamps => {
          const updated = [...prevCamps];
          const randomIdx = Math.floor(Math.random() * updated.length);
          updated[randomIdx] = {
            ...updated[randomIdx],
            blockedCount: updated[randomIdx].blockedCount + 1,
            lastSeen: isRTL ? 'الآن' : 'Just now'
          };
          return updated;
        });
      }

      // Clear the visual green/red highlight of increment after 800ms
      setTimeout(() => {
        setLastIncrement(null);
      }, 8000);

    }, 4500);

    return () => clearInterval(interval);
  }, [isRTL]);

  // Risk Trends AreaChart Mock Data
  const weeklyTrendsData = useMemo(() => {
    return [
      { day: isRTL ? 'الجمعة' : 'Fri', Blocked: 22, Campaigns: 1, Scans: 120 },
      { day: isRTL ? 'السبت' : 'Sat', Blocked: 18, Campaigns: 1, Scans: 95 },
      { day: isRTL ? 'الأحد' : 'Sun', Blocked: 35, Campaigns: 3, Scans: 140 },
      { day: isRTL ? 'الاثنين' : 'Mon', Blocked: 42, Campaigns: 4, Scans: 230 },
      { day: isRTL ? 'الثلاثاء' : 'Tue', Blocked: 29, Campaigns: 2, Scans: 190 },
      { day: isRTL ? 'الأربعاء' : 'Wed', Blocked: 48, Campaigns: 4, Scans: 280 },
      { day: isRTL ? 'الخميس' : 'Thu', Blocked: threatsCount, Campaigns: 4, Scans: scannedSignalsCount / 5 }
    ];
  }, [threatsCount, scannedSignalsCount, isRTL]);

  // Action Remediation handlers
  const handleRemediate = (id: string, scoreGained: number, nameEn: string) => {
    if (remediatedItems[id]) return;
    
    setRemediatedItems(prev => ({ ...prev, [id]: true }));
    setShowScorePulse(true);
    setActiveToast(`${isRTL ? 'تم تفعيل حماية' : 'Activated'} : ${nameEn}`);

    // Broadcast event to keep PersonalSecurityScore in sync
    const customEvent = new CustomEvent('sentry-threats-updated', {
      detail: { type: 'patch_applied', patchId: id === 'mfa' ? 'mfaPatch' : id === 'academy' ? 'academyPatch' : id }
    });
    window.dispatchEvent(customEvent);

    setTimeout(() => {
      setShowScorePulse(false);
    }, 1200);

    setTimeout(() => {
      setActiveToast(null);
    }, 4000);
  };

  // Emergency Audit simulator
  const handleRunEmergencyAudit = () => {
    setIsAuditing(true);
    setAuditMessage(null);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditMessage(t.auditSuccess);
      setThreatsCount(prev => prev + 1); // add audit threat
    }, 2500);
  };

  const handlePingSafeWord = (member: FamilyMemberStatus) => {
    setActiveToast(`${t.familySafeTip} ${isRTL ? member.nameAr : member.name} : "OBITREX_SECURE_2026"`);
    setTimeout(() => {
      setActiveToast(null);
    }, 5000);
  };

  return (
    <div className={`space-y-8 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} ${isRTL ? 'font-cairo text-right' : 'font-sans text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* 1. REAL-TIME SECURITY ALERTS BANNER / ACTIVE STATUS */}
      <div className={`p-8 rounded-[32px] relative overflow-hidden border ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#0B1123] via-[#0E152F] to-[#141C3D] border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.6)]' 
          : 'bg-white border-slate-200 shadow-sm'
      } flex flex-col lg:flex-row lg:items-center justify-between gap-6`}>
        
        {/* Glowing Background Orbs */}
        {theme === 'dark' && (
          <>
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-cyan-400/5 rounded-full blur-[80px]" />
            <div className="absolute left-10 -bottom-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px]" />
          </>
        )}

        <div className="space-y-2 relative z-10 flex-1">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
            {isRTL ? 'حماية رقمية' : 'Digital protection'}
          </span>
          <h2 className={`text-3xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {isRTL ? 'نظرة عامة على حمايتك' : 'Your protection overview'}
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} max-w-2xl leading-relaxed`}>
            {isRTL ? 'افحص الروابط المشبوهة، وراجع الأنشطة الأخيرة، واحمِ الأشخاص الذين يهمونك.' : 'Scan suspicious links, review recent activity, and protect the people who matter to you.'}
          </p>

          <div className="flex items-center gap-3 flex-wrap pt-2">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isRTL ? 'الحماية نشطة' : 'Protection Active'}
            </div>
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
              <Clock className="w-4 h-4 text-cyan-400" />
              {isRTL ? 'مراقب باستمرار' : 'Continuously Monitored'}
            </div>
          </div>
        </div>

        {/* Command Audit Controls */}
        <div className="relative z-10 shrink-0 flex flex-col gap-3 min-w-[240px]">
          <button
            onClick={handleRunEmergencyAudit}
            disabled={isAuditing}
            className={`w-full py-4 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border shadow-lg flex items-center justify-center gap-3 ${
              isAuditing 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 cursor-not-allowed' 
                : 'bg-cyan-400 text-black border-cyan-400 hover:bg-cyan-300 hover:shadow-cyan-400/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isAuditing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {isRTL ? 'جاري الفحص تشخيصي...' : 'Running Diagnostics...'}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                {isRTL ? 'بدء تدقيق أمني' : 'Run Security Check'}
              </>
            )}
          </button>

          {auditMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-[10px] font-bold text-emerald-400 uppercase leading-snug"
            >
              {auditMessage}
            </motion.div>
          )}
        </div>
      </div>

      {/* 2. DYNAMIC INTEL TOAST/NOTIFICATION POP */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1116] border-cyan-400/30 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} flex items-center gap-3 max-w-lg z-50`}
          >
            <div className="p-2 bg-cyan-400/10 rounded-xl">
              <Bell className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-xs font-bold text-white flex-1">{activeToast}</p>
            <button onClick={() => setActiveToast(null)} className="text-white/40 hover:text-white font-mono text-[10px] font-black uppercase">
              {isRTL ? 'إغلاق' : 'Close'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== BENTO GRID OF CYBER SECURITY INTELLIGENCE ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* BENTO COLUMN 1 (LEFT SIDE) */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* CARD A: SENTRY SECURITY SCORE */}
          <div 
            onClick={() => onNavigateToTab?.('score')}
            className={`p-6 rounded-3xl border ${
              theme === 'dark' ? 'bg-[#0D0F12] border-white/5 hover:border-cyan-400/30 shadow-xl' : 'bg-white border-slate-200 hover:border-cyan-400/30 shadow-sm'
            } flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all duration-300 hover:translate-y-[-2px]`}
          >
            
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-[9px] font-mono text-cyan-400 font-bold uppercase">
              <Fingerprint className="w-3 h-3 text-cyan-400" /> SEC-SCORE
            </div>

            {onNavigateToTab && (
              <div className="absolute top-4 right-4 text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isRTL ? 'فحص عميق ←' : 'DEEP AUDIT →'}
              </div>
            )}

            <div className="w-full text-center mb-6">
              <h3 className={`text-sm font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.securityScore}
              </h3>
            </div>

            {/* Circular Gauge Score */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Track circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  stroke={theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F1F5F9'} 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                {/* Colored gauge */}
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  stroke="#22D3EE" 
                  strokeWidth="8" 
                  fill="transparent"
                  strokeDasharray="263.8"
                  animate={{ strokeDashoffset: 263.8 - (263.8 * securityScore) / 100 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              {/* Central text indicator */}
              <div className="absolute text-center">
                <motion.span 
                  animate={showScorePulse ? { scale: [1, 1.2, 1] } : {}}
                  className={`text-5xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'} block`}
                >
                  {securityScore}
                </motion.span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block mt-0.5">
                  {securityScore >= 90 ? 'OPTIMAL' : securityScore >= 80 ? 'EXCELLENT' : 'MONITORED'}
                </span>
              </div>
            </div>

            {/* Active Slogan */}
            <p className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-wider leading-relaxed mt-6 mb-4 max-w-[220px]">
              {t.activeSlogan}
            </p>

            {/* Expandable Optimization Suggestions */}
            <div className="w-full border-t border-white/5 pt-4 space-y-3">
              <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'} mb-2`}>
                {t.remediationTitle}
              </h4>

              {/* MFA Item */}
              {!remediatedItems.mfa && (
                <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-100'} text-left flex items-start justify-between gap-3`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-white/90 block leading-tight">{t.mfaRecommendation}</span>
                    <span className="text-[9px] text-slate-500 block leading-snug">{t.mfaDesc}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemediate('mfa', 6, 'MFA Circle Guard');
                    }}
                    className="px-2.5 py-1 bg-cyan-400 text-black text-[9px] font-black uppercase rounded hover:bg-cyan-300 relative z-10"
                  >
                    {t.remediateBtn}
                  </button>
                </div>
              )}

              {/* Backups Item */}
              {!remediatedItems.backup && (
                <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-100'} text-left flex items-start justify-between gap-3`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-white/90 block leading-tight">{t.backupRecommendation}</span>
                    <span className="text-[9px] text-slate-500 block leading-snug">{t.backupDesc}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemediate('backup', 4, 'iPad Cloud Archival');
                    }}
                    className="px-2.5 py-1 bg-cyan-400 text-black text-[9px] font-black uppercase rounded hover:bg-cyan-300 relative z-10"
                  >
                    {t.remediateBtn}
                  </button>
                </div>
              )}

              {/* Academy Item */}
              {!remediatedItems.academy && (
                <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-100'} text-left flex items-start justify-between gap-3`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-white/90 block leading-tight">{t.academyRecommendation}</span>
                    <span className="text-[9px] text-slate-500 block leading-snug">{t.academyDesc}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemediate('academy', 5, 'Voice Cloner Shield');
                    }}
                    className="px-2.5 py-1 bg-cyan-400 text-black text-[9px] font-black uppercase rounded hover:bg-cyan-300 relative z-10"
                  >
                    {t.remediateBtn}
                  </button>
                </div>
              )}

              {Object.keys(remediatedItems).length === 3 && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t.remediatedMsg}</span>
                </div>
              )}

            </div>
          </div>

          {/* CARD B: THREATS TODAY STATUS SUMMARY */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0D0F12] border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
          } relative overflow-hidden group`}>
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <h3 className={`text-sm font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.threatsToday}
              </h3>
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Count card 1 */}
              <div className={`p-4 rounded-2xl border ${
                lastIncrement === 'threat' ? 'border-red-500 bg-red-500/5' : 'border-white/5 bg-white/[0.02]'
              } transition-all duration-300`}>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                  Blocked Incidents
                </span>
                <span className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} tracking-tight flex items-baseline gap-1`}>
                  {threatsCount}
                  {lastIncrement === 'threat' && (
                    <span className="text-xs font-mono text-red-500 font-bold">+1</span>
                  )}
                </span>
                <span className="text-[9px] text-red-500 font-bold mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                  Live Block Active
                </span>
              </div>

              {/* Count card 2 */}
              <div className={`p-4 rounded-2xl border ${
                lastIncrement === 'signal' ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 bg-white/[0.02]'
              } transition-all duration-300`}>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                  Scanned Telemetry
                </span>
                <span className={`text-4xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'} tracking-tight flex items-baseline gap-1`}>
                  {scannedSignalsCount}
                  {lastIncrement === 'signal' && (
                    <span className="text-xs font-mono text-emerald-400 font-bold animate-pulse">+new</span>
                  )}
                </span>
                <span className="text-[9px] text-slate-500 font-bold mt-1.5 block">
                  {t.counterLabel}
                </span>
              </div>
            </div>

            <div className="mt-5 p-3.5 bg-cyan-400/5 border border-cyan-400/10 rounded-2xl text-[10px] text-slate-400 leading-relaxed flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
              <span>Obitrex digital protection filters have analyzed and mitigated 100% of detected safety incidents in the last 24 hours. No data leaks found.</span>
            </div>
          </div>

        </div>

        {/* BENTO COLUMN 2 (MIDDLE COLUMN) */}
        <div className="space-y-8 lg:col-span-2 flex flex-col justify-between">
          
          {/* CARD C: INTERACTIVE ATTACK THREAT MAP */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0D0F12] border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
          } relative overflow-hidden flex-1 flex flex-col justify-between`}>
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest block">
                  TELEMETRY MATRIX GEOLOCATION
                </span>
                <h3 className={`text-sm font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t.threatMap}
                </h3>
              </div>
              <div className="flex items-center gap-2 bg-cyan-400/5 border border-cyan-400/10 px-3 py-1 rounded-full text-[10px] font-mono text-cyan-400 font-black uppercase">
                <Globe className="w-3.5 h-3.5" /> 5 {t.nodesActive}
              </div>
            </div>

            {/* Stylized SVG Map Representation with attack lines */}
            <div className="relative h-[250px] w-full bg-black/20 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
              
              {/* World map stylized dots grids background */}
              <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px]" />

              <svg className="w-full h-full absolute inset-0" viewBox="0 0 500 250">
                <defs>
                  <linearGradient id="cyber-arc" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Simulated Continents outlines */}
                <path d="M50,80 Q70,70 120,60 T180,80 T240,90 Q220,130 200,160 T120,200 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <path d="M300,50 Q350,40 420,50 T480,90 Q440,140 410,180 T320,190 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

                {/* Pulsating Attack Arcs from Source to Target */}
                {/* Arc 1: Tokyo to New York */}
                <path d="M420,80 Q250,30 110,80" fill="transparent" stroke="url(#cyber-arc)" strokeWidth="1.5" strokeDasharray="5 5" className="animate-[dash_30s_linear_infinite]" />
                {/* Arc 2: London to Riyadh */}
                <path d="M260,70 Q300,80 340,110" fill="transparent" stroke="url(#cyber-arc)" strokeWidth="1.5" strokeDasharray="6 3" />
                {/* Arc 3: Moscow to California */}
                <path d="M320,60 Q180,10 70,110" fill="transparent" stroke="url(#cyber-arc)" strokeWidth="2" strokeDasharray="8 8" />

                {/* Animated Bezier cyber interception dots */}
                <circle cx="110" cy="80" r="2" fill="#ef4444" className="animate-ping" />
                <circle cx="340" cy="110" r="2.5" fill="#22d3ee" />

                {/* Map Interactive Nodes */}
                {[
                  { id: 'node-ny', x: 110, y: 80, name: 'North America Node', details: 'Blocked: 112 phishing pages' },
                  { id: 'node-lon', x: 260, y: 70, name: 'Europe Node', details: 'Blocked: 84 smishing domains' },
                  { id: 'node-ryd', x: 340, y: 110, name: 'Middle East Node', details: 'Active Guard: 41 campaigns blocked' },
                  { id: 'node-tok', x: 420, y: 80, name: 'Asia-Pacific Node', details: 'Blocked: 59 voice cloning streams' },
                  { id: 'node-syd', x: 450, y: 190, name: 'Oceania Node', details: 'Scanned: 240 file payloads' }
                ].map((node) => {
                  const isHovered = hoveredMapNode === node.id;
                  return (
                    <g 
                      key={node.id} 
                      onMouseEnter={() => setHoveredMapNode(node.id)}
                      onMouseLeave={() => setHoveredMapNode(null)}
                      className="cursor-pointer group/node"
                    >
                      {/* Pulsating Radar Rings */}
                      <circle 
                        cx={node.x} 
                        cy={node.y} 
                        r={isHovered ? 12 : 6} 
                        className={`transition-all duration-300 ${
                          node.id === 'node-ryd' ? 'fill-cyan-400/10 stroke-cyan-400/40' : 'fill-red-500/10 stroke-red-500/30'
                        }`} 
                        strokeWidth="1"
                      />
                      {/* Core target dot */}
                      <circle 
                        cx={node.x} 
                        cy={node.y} 
                        r="3.5" 
                        className={`${
                          node.id === 'node-ryd' ? 'fill-cyan-400 group-hover/node:fill-white' : 'fill-rose-500 group-hover/node:fill-white'
                        } transition-colors`}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Live Overlay Map Tooltip */}
              <div className="absolute bottom-3 left-3 bg-[#0A0D11]/90 border border-white/10 p-2.5 rounded-xl backdrop-blur-md">
                <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase block tracking-widest">{t.mapLabel}</span>
                <span className="text-[10px] font-black text-white">{isRTL ? 'مركز التحكم والاعتراض العصبي' : 'Neural Threat Interceptor Active'}</span>
              </div>

              {/* Hover Node Card Info Panel */}
              <AnimatePresence>
                {hoveredMapNode && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-4 right-4 max-w-[200px] bg-cyan-950/90 border border-cyan-400/30 p-3 rounded-xl shadow-2xl backdrop-blur-md text-left space-y-1.5"
                  >
                    <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                      NODE INTEL
                    </span>
                    <p className="text-xs font-black text-white leading-tight">
                      {[
                        { id: 'node-ny', name: isRTL ? 'عقدة أمريكا الشمالية' : 'North America Node', desc: isRTL ? 'تم حظر ١١٢ صفحة تصيد وبطاقات دفع مزيفة.' : 'Blocked 112 fake payment cards.' },
                        { id: 'node-lon', name: isRTL ? 'عقدة أوروبا الغربية' : 'Europe Node', desc: isRTL ? 'حظر ٨٤ نطاقاً مسجلاً مؤخراً لمخالفات الطرق.' : 'Blocked 84 SunPass smishing domains.' },
                        { id: 'node-ryd', name: isRTL ? 'عقدة الشرق الأوسط' : 'Middle East Node', desc: isRTL ? 'نشط: تم تصفية ٤١ حملة احتيالية على كبار السن.' : 'Active: Blocked 41 local typosquats.' },
                        { id: 'node-tok', name: isRTL ? 'عقدة آسيا والمحيط الهادئ' : 'Asia-Pacific Node', desc: isRTL ? 'تم منع تزييف الصوت لـ ٥٩ مكالمة احتيالية.' : 'Prevented 59 cloned voice streams.' },
                        { id: 'node-syd', x: 450, y: 190, name: isRTL ? 'عقدة أوقيانوسيا' : 'Oceania Node', desc: isRTL ? 'فحص ٢٤٠ مرفق بريدي مشكوك به.' : 'Analyzed 240 zipped attachments.' }
                      ].find(n => n.id === hoveredMapNode)?.name || ''}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {[
                        { id: 'node-ny', name: 'North America Node', desc: isRTL ? 'تم حظر ١١٢ صفحة تصيد وبطاقات دفع مزيفة.' : 'Blocked 112 fake payment cards.' },
                        { id: 'node-lon', name: 'Europe Node', desc: isRTL ? 'حظر ٨٤ نطاقاً مسجلاً مؤخراً لمخالفات الطرق.' : 'Blocked 84 SunPass smishing domains.' },
                        { id: 'node-ryd', name: 'Middle East Node', desc: isRTL ? 'نشط: تم تصفية ٤١ حملة احتيالية على كبار السن.' : 'Active: Blocked 41 local typosquats.' },
                        { id: 'node-tok', name: 'Asia-Pacific Node', desc: isRTL ? 'تم منع تزييف الصوت لـ ٥٩ مكالمة احتيالية.' : 'Prevented 59 cloned voice streams.' },
                        { id: 'node-syd', name: 'Oceania Node', desc: isRTL ? 'فحص ٢٤٠ مرفق بريدي مشكوك به.' : 'Analyzed 240 zipped attachments.' }
                      ].find(n => n.id === hoveredMapNode)?.desc || ''}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Quick Map Legend info */}
            <div className="flex items-center justify-between flex-wrap gap-4 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  {isRTL ? 'مصدر هجوم مشتبه' : 'Scam Source Origin'}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                  {isRTL ? 'أمان العائلة النشط' : 'Obitrex Protect Point'}
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                {isRTL ? 'إجمالي محاولات الحظر المباشر: ٢٨ هجمة/ثانية' : 'Intercept speed: < 12ms // secure'}
              </span>
            </div>
          </div>

          {/* CARD D: RISK TRENDS WEEKLY CHART */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0D0F12] border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
          } flex flex-col justify-between h-[250px]`}>
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
              <div className="space-y-1">
                <h3 className={`text-sm font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t.riskTrends}
                </h3>
              </div>
              <div className="p-1.5 bg-cyan-400/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            {/* Recharts Area Chart for trends visualization */}
            <div className="w-full h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyTrendsData}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F1F5F9'} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748B', fontSize: 10, fontWeight: 'bold' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#64748B', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#0E1116' : '#FFFFFF', 
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: theme === 'dark' ? '#F8FAFC' : '#0F172A'
                    }} 
                  />
                  <Area type="monotone" dataKey="Blocked" name={isRTL ? 'تم حظره' : 'Blocked'} stroke="#22d3ee" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBlocked)" />
                  <Area type="monotone" dataKey="Scans" name={isRTL ? 'الفحص الإجمالي' : 'Total Audits'} stroke="#8b5cf6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorScans)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* ===================== CAMPAIGNS AND FAMILY CIRCLE SPLIT ROW ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CARD E: MONITORED ACTIVE SCAM CAMPAIGNS */}
        <div className={`p-6 rounded-3xl border ${
          theme === 'dark' ? 'bg-[#0D0F12] border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        } space-y-5`}>
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <Flame className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t.campaigns}
                </h3>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
                  Active Brand Spoofs & Phishing Operations
                </span>
              </div>
            </div>
            <span className="text-xs bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20 px-3 py-1 rounded-lg">
              {campaigns.filter(c => c.status === 'Active').length} Active
            </span>
          </div>

          <div className="space-y-3.5">
            {campaigns.map((camp) => (
              <div 
                key={camp.id}
                className={`p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-white/[0.01] border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-150 hover:border-cyan-400/20'
                } transition-all flex items-center justify-between gap-4`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                      {isRTL ? camp.nameAr : camp.name}
                    </span>
                    <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                      camp.severity === 'Critical' 
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                        : camp.severity === 'High' 
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}>
                      {camp.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                    <span>Type: {isRTL ? camp.typeAr : camp.type}</span>
                    <span>•</span>
                    <span>Last Active: {camp.lastSeen}</span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="text-xs font-black text-cyan-400 block tracking-tight">
                      {camp.blockedCount} blocked
                    </span>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">
                      {isRTL ? camp.statusAr : camp.status}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD F: FAMILY PROTECTION STATUS CIRCLE */}
        <div className={`p-6 rounded-3xl border ${
          theme === 'dark' ? 'bg-[#0D0F12] border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        } space-y-5`}>
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-400/10 border border-cyan-400/20 rounded-xl">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t.familyStatus}
                </h3>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
                  Secure Circle Devices and Safety Status
                </span>
              </div>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 px-3 py-1 rounded-lg">
              All Safe
            </span>
          </div>

          <div className="space-y-3.5">
            {familyMembers.map((member) => {
              const isWarning = member.status === 'Warning';
              return (
                <div 
                  key={member.id}
                  className={`p-4 rounded-2xl border ${
                    theme === 'dark' ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-100'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {member.device === 'Phone' ? <Smartphone className="w-5 h-5" /> : <Tablet className="w-5 h-5" />}
                    </div>
                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                          {isRTL ? member.nameAr : member.name}
                        </span>
                        <span className={`text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded bg-white/5`}>
                          {isRTL ? member.relationAr : member.relation}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                        <span>Device: {isRTL ? member.deviceAr : member.device}</span>
                        <span>•</span>
                        <span>Scans: {member.scansCount} audits</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end">
                    <div className="text-right">
                      <span className={`text-xs font-black ${isWarning ? 'text-amber-400 animate-pulse' : 'text-emerald-400'} block`}>
                        {isRTL ? member.statusAr : member.status}
                      </span>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">
                        {isRTL ? member.lastActiveAr : member.lastActive}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button 
                        onClick={() => handlePingSafeWord(member)}
                        title={t.pingSafe}
                        className={`p-2 rounded-lg text-[10px] font-mono font-black uppercase transition-all bg-cyan-400 text-black hover:bg-cyan-300`}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ===================== CARD G: LATEST THREATS LEDGER ===================== */}
      <div className={`p-6 rounded-3xl border ${
        theme === 'dark' ? 'bg-[#0D0F12] border-white/5 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
      } space-y-5`}>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h3 className={`text-sm font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {t.latestThreats}
            </h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
              Global threat intelligence feeds matched with local hardware audits
            </p>
          </div>
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-500 uppercase">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            {t.liveThreats}
          </div>
        </div>

        {/* ledger list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" dir={isRTL ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono text-slate-500 uppercase font-black">
                <th className="pb-3 text-left pl-3">{t.threatOrigin}</th>
                <th className="pb-3 text-left">{t.threatDestination}</th>
                <th className="pb-3 text-left">Type</th>
                <th className="pb-3 text-left">Severity</th>
                <th className="pb-3 text-center">Action Taken</th>
                <th className="pb-3 text-right pr-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-bold">
              {threatLogs.map((log) => (
                <tr 
                  key={log.id} 
                  className={`hover:bg-white/[0.01] transition-colors`}
                >
                  <td className="py-3.5 pl-3 text-cyan-400 font-mono tracking-tight font-black break-all max-w-[150px]">
                    {log.source}
                  </td>
                  <td className={`py-3.5 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                    {isRTL ? log.targetAr : log.target}
                  </td>
                  <td className={`py-3.5 ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                    {isRTL ? log.typeAr : log.type}
                  </td>
                  <td className="py-3.5">
                    <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                      log.severity === 'Critical' 
                        ? 'bg-rose-500/10 text-rose-500' 
                        : log.severity === 'High' 
                          ? 'bg-amber-500/10 text-amber-500' 
                          : 'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="text-[10px] font-mono font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2.5 py-1 rounded uppercase tracking-tighter">
                      {isRTL ? log.actionAr : log.action}
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-3 text-[10px] font-mono text-slate-500">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
