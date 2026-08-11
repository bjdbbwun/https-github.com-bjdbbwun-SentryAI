import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Key, 
  ShieldAlert, 
  CheckCircle, 
  Layers, 
  Send, 
  Copy, 
  Cpu, 
  Clock, 
  AlertTriangle, 
  Globe, 
  Mail, 
  Code, 
  Flame, 
  Play, 
  Plus, 
  Check,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EnterpriseAPIViewProps {
  language: 'English' | 'Arabic';
  theme: 'light' | 'dark';
}

interface ApiKeyData {
  apiKey: string;
  companyName: string;
  tier: string;
  rateLimitPerMin: number;
}

interface ThreatSubRecord {
  id: string;
  companyName: string;
  indicatorType: string;
  value: string;
  description: string;
  severity: string;
  submittedAt: string;
}

// Translations for Enterprise view
const TRANSLATIONS = {
  English: {
    title: "Obitrex Enterprise Gateway",
    tagline: "Industrial-Grade Threat Intelligence, Real-time Scans, & Custom API Keys",
    desc: "Empower your corporate defense team. Register high-entropy API tokens, monitor request windows, submit fresh indicators of compromise (IOCs), and integrate Obitrex's neural filters directly into your firewalls and proxies.",
    generateTitle: "Provision API Key",
    companyNameLabel: "Company / Security Org Name",
    companyPlaceholder: "e.g., Vanguard Threat Ops",
    tierLabel: "Selected Account Tier",
    generateBtn: "Generate Security Token",
    activeKeys: "Active Gateway Credentials",
    noKey: "No active API key registered yet. Provision a key below to access the gateway.",
    copyBtn: "Copy Key",
    copiedMsg: "Copied to clipboard!",
    rateLimitHeader: "API Key Rate Limiting Monitor",
    requestsUsed: "Requests Window Usage",
    remaining: "Remaining Requests",
    resetLabel: "Window resets in",
    seconds: "seconds",
    limitReached: "RATE LIMIT EXCEEDED",
    playgroundTitle: "Obitrex API Playground",
    checkUrlTab: "Check URL",
    checkEmailTab: "Check Email",
    checkDomainTab: "Check Domain",
    submitThreatTab: "Submit Threat",
    threatIntelTab: "Threat Intelligence",
    urlLabel: "Target URL to Scan",
    emailBodyLabel: "Raw Email Message Body",
    senderLabel: "Sender Email",
    recipientLabel: "Recipient Email",
    subjectLabel: "Subject Line",
    domainLabel: "Domain / Hostname to Analyze",
    iocTypeLabel: "Indicator Type",
    iocValueLabel: "IOC Value",
    iocDescLabel: "Threat Description",
    severityLabel: "Estimated Severity",
    submitThreatBtn: "Publish Threat to Network",
    sendRequestBtn: "Send API Request Payload",
    responseHeader: "Real-time JSON Response",
    codeSnippetsTitle: "Developer SDK Integration",
    copied: "Copied!",
    rateLimitSlogan: "Rate limits are enforced dynamically per-minute based on your API tier.",
    threatSuccess: "Threat successfully ingested and published!"
  },
  Arabic: {
    title: "بوابة Obitrex للمؤسسات",
    tagline: "استخبارات التهديدات الصناعية، فحص فوري، ومفاتيح برمجية مخصصة",
    desc: "قم بتمكين فريق الدفاع الأمني لشركتك. قم بتسجيل رموز برمجية عالية الأمان، وتتبع النوافذ الزمنية للطلبات، وأرسل مؤشرات اختراق جديدة، واثنِ المرشحات العصبية مباشرة في جدران الحماية والخوادم الوكيلة الخاصة بك.",
    generateTitle: "تهيئة مفتاح برمجي (API Key)",
    companyNameLabel: "اسم الشركة / المؤسسة الأمنية",
    companyPlaceholder: "مثال: عمليات تهديدات فانغارد",
    tierLabel: "فئة الحساب المحددة",
    generateBtn: "توليد رمز أمان فوري",
    activeKeys: "مفاتيح الوصول النشطة للبوابة",
    noKey: "لا توجد مفاتيح نشطة مسجلة حالياً. قم بتهيئة مفتاح وصول أدناه لبدء اختبار البوابة.",
    copyBtn: "نسخ المفتاح",
    copiedMsg: "تم النسخ بنجاح!",
    rateLimitHeader: "مراقب قيود معدل طلبات المفتاح",
    requestsUsed: "معدل استهلاك الطلبات الحالية",
    remaining: "الطلبات المتبقية",
    resetLabel: "إعادة تعيين النافذة خلال",
    seconds: "ثانية",
    limitReached: "تم تجاوز الحد الأقصى للطلبات",
    playgroundTitle: "منطقة تجربة وتطوير واجهة البرمجة",
    checkUrlTab: "فحص عنوان URL",
    checkEmailTab: "فحص البريد الإلكتروني",
    checkDomainTab: "فحص النطاق",
    submitThreatTab: "تقديم بلاغ تهديد",
    threatIntelTab: "تغذية استخبارات التهديدات",
    urlLabel: "عنوان URL المستهدف للفحص",
    emailBodyLabel: "نص رسالة البريد الإلكتروني الخام",
    senderLabel: "بريد المرسِل",
    recipientLabel: "بريد المستلِم",
    subjectLabel: "عنوان الرسالة",
    domainLabel: "النطاق / اسم المضيف المراد تحليله",
    iocTypeLabel: "نوع مؤشر الاختراق (IOC)",
    iocValueLabel: "قيمة المؤشر",
    iocDescLabel: "وصف التهديد والسلوك",
    severityLabel: "الخطورة المقدرة",
    submitThreatBtn: "نشر التهديد في الشبكة العالمية",
    sendRequestBtn: "إرسال حزمة طلب واجهة البرمجة",
    responseHeader: "استجابة JSON الفورية",
    codeSnippetsTitle: "أكواد دمج المطورين (SDK)",
    copied: "تم النسخ!",
    rateLimitSlogan: "يتم تطبيق قيود الطلبات ديناميكياً كل دقيقة بناءً على فئة مفتاح الأمان الخاصة بك.",
    threatSuccess: "تم استيعاب التهديد ونشره في جدار الحماية بنجاح!"
  }
};

export function EnterpriseAPIView({ language, theme }: EnterpriseAPIViewProps) {
  const isRTL = language === 'Arabic';
  const t = TRANSLATIONS[language] || TRANSLATIONS['English'];

  // Stored Keys & Active Selected Key
  const [companyName, setCompanyName] = useState("");
  const [selectedTier, setSelectedTier] = useState<"Standard" | "Enterprise" | "Unlimited">("Enterprise");
  const [activeKey, setActiveKey] = useState<ApiKeyData | null>({
    apiKey: "sentry_ent_live_demo1234",
    companyName: "Acme Cyber Security Corp",
    tier: "Enterprise",
    rateLimitPerMin: 60
  });

  // Rate limits state retrieved from headers on each playground call
  const [rateLimitTotal, setRateLimitTotal] = useState(60);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(60);
  const [rateLimitReset, setRateLimitReset] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);

  // Playground Active Endpoint Tab
  const [activePlayTab, setActivePlayTab] = useState<'check-url' | 'check-email' | 'check-domain' | 'submit-threat' | 'threat-intel'>('check-url');

  // Request Inputs
  const [inputUrl, setInputUrl] = useState("https://netflix-billing-renew-verify.tk/secure-login");
  const [inputEmail, setInputEmail] = useState({
    sender: "support@chase-portal-securing-update.biz",
    recipient: "target-executive@enterprise.com",
    subject: "Action Required: Enforce Multi-Factor Access",
    body: "We detected standard credential verification bypass on your profile. You must navigate to the link immediately to prevent absolute locks on administrative assets: http://login-verification-chase.tk/renew."
  });
  const [inputDomain, setInputDomain] = useState("sunpass-toll-violation.com");
  const [inputThreat, setInputThreat] = useState({
    indicatorType: "URL" as "URL" | "Domain" | "Email" | "Phone" | "IP" | "CryptoWallet",
    value: "http://malicious-ransomware-payout-chase.cc/download",
    description: "Vanguard ransomware download gateway masquerading as administrative banking portal.",
    severity: "Critical" as "Critical" | "High" | "Medium" | "Low"
  });

  // Outputs & UI Feedback States
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Code Snippet copying state
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Stats from Server
  const [serverStats, setServerStats] = useState<any>(null);

  // Update cooldown timer
  useEffect(() => {
    if (cooldownSeconds === null) return;
    if (cooldownSeconds <= 0) {
      setCooldownSeconds(null);
      return;
    }
    const timer = setTimeout(() => {
      setCooldownSeconds(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  // Fetch Server Stats periodically
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/v1/enterprise/stats");
      if (res.ok) {
        const data = await res.json();
        setServerStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch server stats", e);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handler: Provision new API key
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/enterprise/keygen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: companyName.trim(), tier: selectedTier })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to provision security token.");
      }

      const data = await res.json();
      const newKeyData: ApiKeyData = {
        apiKey: data.apiKey,
        companyName: data.companyName,
        tier: data.tier,
        rateLimitPerMin: data.rateLimitPerMin
      };

      setActiveKey(newKeyData);
      setRateLimitTotal(data.rateLimitPerMin);
      setRateLimitRemaining(data.rateLimitPerMin);
      setCompanyName("");
      setSuccessToast(isRTL ? "تم تهيئة المفتاح بنجاح!" : "Obitrex Security Key provisioned!");
      fetchStats();

      setTimeout(() => setSuccessToast(null), 4000);

    } catch (e: any) {
      setErrorMessage(e.message || "Keygen service connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Execute API call inside Playground
  const handleExecuteRequest = async () => {
    if (!activeKey) {
      setErrorMessage(isRTL ? "يرجى إنشاء مفتاح وصول أولاً." : "Please generate an API key first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setApiResponse(null);

    let endpoint = "";
    let bodyData: any = {};

    switch (activePlayTab) {
      case 'check-url':
        endpoint = "/api/v1/enterprise/check-url";
        bodyData = { url: inputUrl };
        break;
      case 'check-email':
        endpoint = "/api/v1/enterprise/check-email";
        bodyData = inputEmail;
        break;
      case 'check-domain':
        endpoint = "/api/v1/enterprise/check-domain";
        bodyData = { domain: inputDomain };
        break;
      case 'submit-threat':
        endpoint = "/api/v1/enterprise/submit-threat";
        bodyData = inputThreat;
        break;
      case 'threat-intel':
        endpoint = "/api/v1/enterprise/threat-intel";
        bodyData = {};
        break;
    }

    try {
      const isGet = activePlayTab === 'threat-intel';
      const method = isGet ? "GET" : "POST";

      const headers: Record<string, string> = {
        "X-API-Key": activeKey.apiKey
      };
      if (!isGet) {
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(endpoint, {
        method,
        headers,
        body: isGet ? undefined : JSON.stringify(bodyData)
      });

      // Parse headers for Rate Limit Monitor
      const hLimit = res.headers.get("X-RateLimit-Limit");
      const hRemaining = res.headers.get("X-RateLimit-Remaining");
      const hReset = res.headers.get("X-RateLimit-Reset");
      const hRetry = res.headers.get("Retry-After");

      if (hLimit) setRateLimitTotal(parseInt(hLimit));
      if (hRemaining) setRateLimitRemaining(parseInt(hRemaining));
      if (hReset) {
        const resetUnix = parseInt(hReset);
        const timeLeft = Math.max(0, Math.ceil(resetUnix - Date.now() / 1000));
        setRateLimitReset(timeLeft);
      }
      if (hRetry) {
        setCooldownSeconds(parseInt(hRetry));
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `API Error: Status ${res.status}`);
      }

      const responseJson = await res.json();
      setApiResponse(responseJson);

      if (activePlayTab === 'submit-threat') {
        setSuccessToast(t.threatSuccess);
        setTimeout(() => setSuccessToast(null), 5000);
      }

      fetchStats();

    } catch (e: any) {
      setErrorMessage(e.message || "Failed to establish a network connection to Obitrex API Gateway.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clipboard copies
  const handleCopyKey = () => {
    if (!activeKey) return;
    navigator.clipboard.writeText(activeKey.apiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  // Computed Code Snippets based on active tab and key
  const activeToken = activeKey?.apiKey || "YOUR_API_KEY";
  const apiOrigin = typeof window !== 'undefined' ? window.location.origin : "https://sentry-api.secure";

  const codeSnippets = {
    'check-url': {
      curl: `curl -X POST "${apiOrigin}/api/v1/enterprise/check-url" \\\n  -H "X-API-Key: ${activeToken}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"url": "${inputUrl}"}'`,
      javascript: `fetch("${apiOrigin}/api/v1/enterprise/check-url", {\n  method: "POST",\n  headers: {\n    "X-API-Key": "${activeToken}",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({ url: "${inputUrl}" })\n})\n.then(res => res.json())\n.then(data => console.log(data));`,
      python: `import requests\n\nurl = "${apiOrigin}/api/v1/enterprise/check-url"\nheaders = {\n    "X-API-Key": "${activeToken}",\n    "Content-Type": "application/json"\n}\npayload = { "url": "${inputUrl}" }\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`
    },
    'check-email': {
      curl: `curl -X POST "${apiOrigin}/api/v1/enterprise/check-email" \\\n  -H "X-API-Key: ${activeToken}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "sender": "${inputEmail.sender}",\n    "recipient": "${inputEmail.recipient}",\n    "subject": "${inputEmail.subject}",\n    "body": "${inputEmail.body.slice(0, 50)}..."\n  }'`,
      javascript: `fetch("${apiOrigin}/api/v1/enterprise/check-email", {\n  method: "POST",\n  headers: {\n    "X-API-Key": "${activeToken}",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    sender: "${inputEmail.sender}",\n    recipient: "${inputEmail.recipient}",\n    subject: "${inputEmail.subject}",\n    body: \`${inputEmail.body}\`\n  })\n})\n.then(res => res.json())\n.then(data => console.log(data));`,
      python: `import requests\n\nurl = "${apiOrigin}/api/v1/enterprise/check-email"\nheaders = {\n    "X-API-Key": "${activeToken}",\n    "Content-Type": "application/json"\n}\npayload = {\n    "sender": "${inputEmail.sender}",\n    "recipient": "${inputEmail.recipient}",\n    "subject": "${inputEmail.subject}",\n    "body": """${inputEmail.body}"""\n}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`
    },
    'check-domain': {
      curl: `curl -X POST "${apiOrigin}/api/v1/enterprise/check-domain" \\\n  -H "X-API-Key: ${activeToken}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"domain": "${inputDomain}"}'`,
      javascript: `fetch("${apiOrigin}/api/v1/enterprise/check-domain", {\n  method: "POST",\n  headers: {\n    "X-API-Key": "${activeToken}",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({ domain: "${inputDomain}" })\n})\n.then(res => res.json())\n.then(data => console.log(data));`,
      python: `import requests\n\nurl = "${apiOrigin}/api/v1/enterprise/check-domain"\nheaders = {\n    "X-API-Key": "${activeToken}",\n    "Content-Type": "application/json"\n}\npayload = { "domain": "${inputDomain}" }\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`
    },
    'submit-threat': {
      curl: `curl -X POST "${apiOrigin}/api/v1/enterprise/submit-threat" \\\n  -H "X-API-Key: ${activeToken}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "indicatorType": "${inputThreat.indicatorType}",\n    "value": "${inputThreat.value}",\n    "description": "${inputThreat.description}",\n    "severity": "${inputThreat.severity}"\n  }'`,
      javascript: `fetch("${apiOrigin}/api/v1/enterprise/submit-threat", {\n  method: "POST",\n  headers: {\n    "X-API-Key": "${activeToken}",\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({\n    indicatorType: "${inputThreat.indicatorType}",\n    value: "${inputThreat.value}",\n    description: "${inputThreat.description}",\n    severity: "${inputThreat.severity}"\n  })\n})\n.then(res => res.json())\n.then(data => console.log(data));`,
      python: `import requests\n\nurl = "${apiOrigin}/api/v1/enterprise/submit-threat"\nheaders = {\n    "X-API-Key": "${activeToken}",\n    "Content-Type": "application/json"\n}\npayload = {\n    "indicatorType": "${inputThreat.indicatorType}",\n    "value": "${inputThreat.value}",\n    "description": "${inputThreat.description}",\n    "severity": "${inputThreat.severity}"\n}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`
    },
    'threat-intel': {
      curl: `curl -X GET "${apiOrigin}/api/v1/enterprise/threat-intel" \\\n  -H "X-API-Key: ${activeToken}"`,
      javascript: `fetch("${apiOrigin}/api/v1/enterprise/threat-intel", {\n  method: "GET",\n  headers: {\n    "X-API-Key": "${activeToken}"\n  }\n})\n.then(res => res.json())\n.then(data => console.log(data));`,
      python: `import requests\n\nurl = "${apiOrigin}/api/v1/enterprise/threat-intel"\nheaders = {\n    "X-API-Key": "${activeToken}"\n}\n\nresponse = requests.get(url, headers=headers)\nprint(response.json())`
    }
  };

  const currentSnippets = codeSnippets[activePlayTab];

  return (
    <div className={`space-y-8 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} ${isRTL ? 'text-right' : 'text-left'}`}>
      
      {/* HEADER HERO BANNER */}
      <div className={`p-8 rounded-[32px] relative overflow-hidden border ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#070A0E] via-[#0D1117] to-[#12161D] border-white/5 shadow-2xl' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {theme === 'dark' && (
          <>
            <div className="absolute -right-32 -top-32 w-80 h-80 bg-cyan-400/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute left-20 -bottom-20 w-60 h-60 bg-purple-500/5 rounded-full blur-[80px]" />
          </>
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl">
                <Cpu className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest block">
                  B2B Security Integration Node
                </span>
                <h2 className="text-3xl font-black tracking-tight uppercase">
                  {t.title}
                </h2>
              </div>
            </div>
            <p className={`text-base font-medium ${theme === 'dark' ? 'text-cyan-400/90' : 'text-cyan-600'}`}>
              {t.tagline}
            </p>
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
              {t.desc}
            </p>
          </div>
        </div>
      </div>

      {/* TOASTS */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 rounded-2xl bg-[#090D11] border-2 border-emerald-500/40 text-emerald-400 shadow-2xl flex items-center gap-3 max-w-md mx-auto"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1: API KEY PROVISIONING & MONITOR */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* KEY GENERATION FORM */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0A0C0F] border-white/5' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Key className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-black uppercase tracking-wider">
                {t.generateTitle}
              </h3>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.companyNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t.companyPlaceholder}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold border outline-none transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/[0.02] border-white/10 text-white focus:border-cyan-400 focus:bg-white/[0.04]' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-500 focus:bg-white'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.tierLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Standard', 'Enterprise', 'Unlimited'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setSelectedTier(tier)}
                      className={`py-2 px-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                        selectedTier === tier
                          ? 'bg-cyan-400 text-black border-cyan-400'
                          : theme === 'dark'
                            ? 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20'
                            : 'bg-slate-100 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-cyan-400 text-black text-xs font-black uppercase tracking-wider hover:bg-cyan-300 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t.generateBtn}
              </button>
            </form>
          </div>

          {/* ACTIVE KEY DETAIL */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#0A0C0F] border-white/5' : 'bg-white border-slate-200'
          } space-y-4`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4.5 h-4.5 text-cyan-400" />
                {t.activeKeys}
              </span>
              {activeKey && (
                <span className="text-[10px] bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 font-bold px-2.5 py-0.5 rounded-lg">
                  {activeKey.tier}
                </span>
              )}
            </div>

            {activeKey ? (
              <div className="space-y-4">
                <div className={`p-3.5 rounded-2xl ${theme === 'dark' ? 'bg-white/[0.02] border border-white/5' : 'bg-slate-50 border border-slate-100'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{activeKey.companyName}</span>
                    <span className="text-[9px] text-slate-500">{activeKey.rateLimitPerMin} req/m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      readOnly
                      value={activeKey.apiKey}
                      className="w-full bg-transparent font-mono text-xs border-none outline-none select-all text-cyan-400"
                    />
                    <button
                      onClick={handleCopyKey}
                      className="p-2 hover:bg-cyan-400/10 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
                      title={t.copyBtn}
                    >
                      {keyCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {keyCopied && (
                    <span className="text-[9px] text-emerald-400 font-bold uppercase block text-right">
                      {t.copiedMsg}
                    </span>
                  )}
                </div>

                {/* RATE LIMIT GAUGES */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {t.requestsUsed}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-white">
                      {rateLimitTotal - rateLimitRemaining} / {rateLimitTotal}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        rateLimitRemaining / rateLimitTotal < 0.2 
                          ? 'bg-rose-500 animate-pulse' 
                          : rateLimitRemaining / rateLimitTotal < 0.5 
                            ? 'bg-amber-400' 
                            : 'bg-cyan-400'
                      }`}
                      style={{ width: `${((rateLimitTotal - rateLimitRemaining) / rateLimitTotal) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/[0.01]' : 'bg-slate-50'} border border-white/5`}>
                      <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block mb-0.5">
                        {t.remaining}
                      </span>
                      <span className={`text-xl font-mono font-black ${rateLimitRemaining < 5 ? 'text-rose-500' : 'text-white'}`}>
                        {rateLimitRemaining}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/[0.01]' : 'bg-slate-50'} border border-white/5`}>
                      <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block mb-0.5">
                        {t.resetLabel}
                      </span>
                      <span className="text-xl font-mono font-black text-cyan-400">
                        {rateLimitReset || 60}s
                      </span>
                    </div>
                  </div>
                </div>

                {cooldownSeconds !== null && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2 text-rose-400 animate-pulse">
                    <AlertTriangle className="w-4.5 h-4.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {t.limitReached}: RETRY IN {cooldownSeconds}s
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 leading-relaxed text-center py-4">
                {t.noKey}
              </p>
            )}
          </div>

          {/* ACTIVE TELEMETRY REGISTRY SUMMARY */}
          {serverStats && (
            <div className={`p-5 rounded-3xl border ${
              theme === 'dark' ? 'bg-[#0A0C0F]/80 border-white/5' : 'bg-white border-slate-200'
            } space-y-3 text-[11px]`}>
              <span className="text-[9px] font-mono text-cyan-400 font-black uppercase tracking-widest block">
                Distributed Ledgers
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Registered API Keys:</span>
                <span className="font-mono text-white font-black">{serverStats.activeKeysCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Corporate Submissions:</span>
                <span className="font-mono text-rose-400 font-black">{serverStats.totalSubmittedThreats}</span>
              </div>

              {serverStats.recentSubmissions && serverStats.recentSubmissions.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">
                    Recent Network Alerts
                  </span>
                  {serverStats.recentSubmissions.slice(0, 2).map((sub: any) => (
                    <div key={sub.id} className="p-2 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="text-[10px] font-bold block truncate text-slate-200">{sub.value}</span>
                        <span className="text-[8px] text-slate-500 truncate block">{sub.description}</span>
                      </div>
                      <span className="text-[8px] bg-rose-500/10 text-rose-400 font-bold uppercase py-0.5 px-1.5 rounded shrink-0">
                        {sub.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* COLUMN 2 & 3: PLAYGROUND & SDK INTEGRATION */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* PLAYGROUND CONTAINER */}
          <div className={`p-6 rounded-[32px] border ${
            theme === 'dark' ? 'bg-[#0A0C0F] border-white/5' : 'bg-white border-slate-200'
          } space-y-6`}>
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-cyan-400 font-black uppercase tracking-widest block">
                  SDK Interactive Sandbox
                </span>
                <h3 className="text-base font-black uppercase tracking-wider">
                  {t.playgroundTitle}
                </h3>
              </div>
            </div>

            {/* ENDPOINT TABS SELECTOR */}
            <div className="flex flex-wrap gap-2 p-1 bg-white/[0.01] border border-white/5 rounded-2xl">
              {[
                { id: 'check-url', label: t.checkUrlTab, icon: Globe },
                { id: 'check-email', label: t.checkEmailTab, icon: Mail },
                { id: 'check-domain', label: t.checkDomainTab, icon: Layers },
                { id: 'submit-threat', label: t.submitThreatTab, icon: Flame },
                { id: 'threat-intel', label: t.threatIntelTab, icon: Cpu },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activePlayTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActivePlayTab(tab.id as any);
                      setApiResponse(null);
                      setErrorMessage(null);
                    }}
                    className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      active
                        ? 'bg-cyan-400 text-black shadow-[0_4px_15px_rgba(34,211,238,0.25)]'
                        : theme === 'dark'
                          ? 'text-slate-400 hover:text-white hover:bg-white/5'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ERROR FEEDBACK */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-start gap-2.5">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block font-black uppercase">API Error Code Returned</span>
                  <p className="opacity-80 font-mono leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* TAB INPUT FORMS */}
            <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-100'} space-y-4`}>
              
              {/* TAB 1: Check URL */}
              {activePlayTab === 'check-url' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {t.urlLabel}
                  </label>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className={`w-full py-3 px-4 rounded-xl font-mono text-xs border outline-none ${
                      theme === 'dark' ? 'bg-[#06080A] border-white/10 text-cyan-400' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              )}

              {/* TAB 2: Check Email */}
              {activePlayTab === 'check-email' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {t.senderLabel}
                    </label>
                    <input
                      type="text"
                      value={inputEmail.sender}
                      onChange={(e) => setInputEmail({...inputEmail, sender: e.target.value})}
                      className={`w-full py-3 px-4 rounded-xl text-xs border outline-none ${
                        theme === 'dark' ? 'bg-[#06080A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {t.recipientLabel}
                    </label>
                    <input
                      type="text"
                      value={inputEmail.recipient}
                      onChange={(e) => setInputEmail({...inputEmail, recipient: e.target.value})}
                      className={`w-full py-3 px-4 rounded-xl text-xs border outline-none ${
                        theme === 'dark' ? 'bg-[#06080A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {t.subjectLabel}
                    </label>
                    <input
                      type="text"
                      value={inputEmail.subject}
                      onChange={(e) => setInputEmail({...inputEmail, subject: e.target.value})}
                      className={`w-full py-3 px-4 rounded-xl text-xs border outline-none ${
                        theme === 'dark' ? 'bg-[#06080A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {t.emailBodyLabel}
                    </label>
                    <textarea
                      rows={3}
                      value={inputEmail.body}
                      onChange={(e) => setInputEmail({...inputEmail, body: e.target.value})}
                      className={`w-full py-3 px-4 rounded-xl text-xs border outline-none font-sans ${
                        theme === 'dark' ? 'bg-[#06080A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Check Domain */}
              {activePlayTab === 'check-domain' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {t.domainLabel}
                  </label>
                  <input
                    type="text"
                    value={inputDomain}
                    onChange={(e) => setInputDomain(e.target.value)}
                    className={`w-full py-3 px-4 rounded-xl font-mono text-xs border outline-none ${
                      theme === 'dark' ? 'bg-[#06080A] border-white/10 text-cyan-400' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              )}

              {/* TAB 4: Submit Threat */}
              {activePlayTab === 'submit-threat' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {t.iocTypeLabel}
                    </label>
                    <select
                      value={inputThreat.indicatorType}
                      onChange={(e) => setInputThreat({...inputThreat, indicatorType: e.target.value as any})}
                      className={`w-full py-3 px-4 rounded-xl text-xs border outline-none ${
                        theme === 'dark' ? 'bg-[#06080A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="URL">URL</option>
                      <option value="Domain">Domain</option>
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="IP">IP Address</option>
                      <option value="CryptoWallet">Crypto Wallet</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {t.severityLabel}
                    </label>
                    <select
                      value={inputThreat.severity}
                      onChange={(e) => setInputThreat({...inputThreat, severity: e.target.value as any})}
                      className={`w-full py-3 px-4 rounded-xl text-xs border outline-none ${
                        theme === 'dark' ? 'bg-[#06080A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {t.iocValueLabel}
                    </label>
                    <input
                      type="text"
                      value={inputThreat.value}
                      onChange={(e) => setInputThreat({...inputThreat, value: e.target.value})}
                      placeholder="e.g., evil-host.net"
                      className={`w-full py-3 px-4 rounded-xl font-mono text-xs border outline-none ${
                        theme === 'dark' ? 'bg-[#06080A] border-white/10 text-cyan-400' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {t.iocDescLabel}
                    </label>
                    <input
                      type="text"
                      value={inputThreat.description}
                      onChange={(e) => setInputThreat({...inputThreat, description: e.target.value})}
                      className={`w-full py-3 px-4 rounded-xl text-xs border outline-none ${
                        theme === 'dark' ? 'bg-[#06080A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: Threat Intelligence Feed */}
              {activePlayTab === 'threat-intel' && (
                <div className="py-2 text-center">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This endpoint fetches the entire live telemetry dataset including all custom reported Indicators of Compromise (IOCs) and system defaults.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleExecuteRequest}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#22D3EE] hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    <span>Executing Dynamic Scan Payload...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>{activePlayTab === 'submit-threat' ? t.submitThreatBtn : t.sendRequestBtn}</span>
                  </>
                )}
              </button>
            </div>

            {/* LIVE RESPONSE JSON OUTPUT */}
            {apiResponse && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest block">
                  {t.responseHeader}
                </span>
                <pre className={`p-5 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed border ${
                  theme === 'dark' 
                    ? 'bg-[#050709] border-cyan-400/20 text-cyan-400' 
                    : 'bg-slate-900 border-slate-800 text-cyan-300'
                } max-h-[350px]`}>
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* CODE SNIPPETS CODE PANEL */}
          <div className={`p-6 rounded-[32px] border ${
            theme === 'dark' ? 'bg-[#0A0C0F] border-white/5' : 'bg-white border-slate-200'
          } space-y-4`}>
            
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4.5 h-4.5 text-cyan-400" />
                {t.codeSnippetsTitle}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Python */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-slate-400">Python (Requests)</span>
                  <button
                    onClick={() => handleCopySnippet(currentSnippets.python, 'python')}
                    className="text-[8px] text-cyan-400 hover:text-white uppercase font-black"
                  >
                    {copiedSnippet === 'python' ? t.copied : 'Copy Code'}
                  </button>
                </div>
                <pre className={`p-3 rounded-xl font-mono text-[9px] overflow-x-auto ${theme === 'dark' ? 'bg-black/40 text-slate-300' : 'bg-slate-100 text-slate-800'} max-h-[140px]`}>
                  {currentSnippets.python}
                </pre>
              </div>

              {/* JavaScript */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-slate-400">JavaScript (Fetch)</span>
                  <button
                    onClick={() => handleCopySnippet(currentSnippets.javascript, 'javascript')}
                    className="text-[8px] text-cyan-400 hover:text-white uppercase font-black"
                  >
                    {copiedSnippet === 'javascript' ? t.copied : 'Copy Code'}
                  </button>
                </div>
                <pre className={`p-3 rounded-xl font-mono text-[9px] overflow-x-auto ${theme === 'dark' ? 'bg-black/40 text-slate-300' : 'bg-slate-100 text-slate-800'} max-h-[140px]`}>
                  {currentSnippets.javascript}
                </pre>
              </div>

              {/* Bash cURL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-slate-400">cURL (Terminal Bash)</span>
                  <button
                    onClick={() => handleCopySnippet(currentSnippets.curl, 'curl')}
                    className="text-[8px] text-cyan-400 hover:text-white uppercase font-black"
                  >
                    {copiedSnippet === 'curl' ? t.copied : 'Copy Code'}
                  </button>
                </div>
                <pre className={`p-3 rounded-xl font-mono text-[9px] overflow-x-auto ${theme === 'dark' ? 'bg-black/40 text-slate-300' : 'bg-slate-100 text-slate-800'} max-h-[140px]`}>
                  {currentSnippets.curl}
                </pre>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
