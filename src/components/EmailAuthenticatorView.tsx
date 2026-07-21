import { useState, useMemo } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Info, Mail, Terminal, ArrowRight, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmailAuthenticatorProps {
  language: string;
  theme: 'light' | 'dark';
}

const PROTECTED_BRANDS = [
  "amazon", "paypal", "google", "facebook", "microsoft", "apple", "dhl", "fedex", 
  "netflix", "chase", "ebay", "instagram", "linkedin", "dropbox", "adobe", "whatsapp",
  "twitter", "yahoo", "outlook", "steam", "coinbase", "binance", "discord", "zoom", "stripe"
];

const GENERIC_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "proton", "icloud.com"];

export function EmailAuthenticatorView({ language, theme }: EmailAuthenticatorProps) {
  const isRTL = language === 'Arabic';
  const [activeSubTab, setActiveSubTab] = useState<'parser' | 'builder'>('parser');
  
  // Parser State
  const [rawText, setRawText] = useState('');
  const [parsedResults, setParsedResults] = useState<any | null>(null);

  // Builder State
  const [senderName, setSenderName] = useState('PayPal Security');
  const [senderEmail, setSenderEmail] = useState('support@paypa1-billing-update.com');
  const [spfStatus, setSpfStatus] = useState<'PASS' | 'FAIL' | 'NONE'>('FAIL');
  const [dkimStatus, setDkimStatus] = useState<'PASS' | 'FAIL' | 'NONE'>('NONE');
  const [dmarcStatus, setDmarcStatus] = useState<'PASS' | 'FAIL' | 'NONE'>('FAIL');

  // Multi-language text dictionary
  const dict: Record<string, Record<string, string>> = {
    title: {
      English: 'Email Spoofing & Header Authenticator',
      Arabic: 'محلل ترويسات البريد ومكافحة الانتحال'
    },
    subtitle: {
      English: 'Analyze raw email headers, SPF/DKIM alignment, and detect advanced sender brand impersonation attacks.',
      Arabic: 'تحليل ترويسات البريد الإلكتروني، والتحقق من تطابق SPF/DKIM، واكتشاف هجمات انتحال العلامات التجارية.'
    },
    tabParser: {
      English: 'Raw Header Analyzer',
      Arabic: 'تحليل الرسائل والترويسات الخام'
    },
    tabBuilder: {
      English: 'Interactive Compliance Builder',
      Arabic: 'محاكي توافقية البريد التفاعلي'
    },
    placeholder: {
      English: 'Paste raw email headers or full email text here...\nExample:\nFrom: PayPal Security <support@paypa1-billing.com>\nSubject: Action Required: Account Suspended\nReceived-SPF: fail\nAuthentication-Results: dkim=fail',
      Arabic: 'أدخل ترويسات البريد الإلكتروني الخام أو نص الرسالة الكامل هنا...\nمثال:\nFrom: PayPal Security <support@paypa1-billing.com>\nSubject: Action Required: Account Suspended\nReceived-SPF: fail\nAuthentication-Results: dkim=fail'
    },
    analyzeBtn: {
      English: 'Authenticate Headers',
      Arabic: 'تحليل وترخيص الترويسات'
    },
    analyzing: {
      English: 'Analyzing Protocols...',
      Arabic: 'جاري فحص بروتوكولات الحماية...'
    },
    authStatus: {
      English: 'Mail Integrity Status',
      Arabic: 'حالة سلامة وموثوقية البريد'
    },
    brandImpersonation: {
      English: 'Brand Impersonation Checks',
      Arabic: 'فحص انتحال الهوية والعلامات التجارية'
    },
    noImpersonation: {
      English: 'No brand impersonation detected in display name or sender domain.',
      Arabic: 'لم يتم رصد محاولة انتحال للعلامات التجارية في اسم العرض أو النطاق المرسل.'
    },
    technicalAudit: {
      English: 'Technical Security Standards Audit',
      Arabic: 'تدقيق المعايير الأمنية التقنية للبريد'
    },
    alignmentAlert: {
      English: 'DMARC/SPF Alignment Issue',
      Arabic: 'مشكلة في تطابق بروتوكول DMARC/SPF'
    },
    recommendation: {
      English: 'Recommended Action',
      Arabic: 'الإجراء الأمني الموصى به'
    },
    safeEmail: {
      English: 'Safe: Email matches authentic brand parameters.',
      Arabic: 'آمن: البريد الإلكتروني يتطابق مع المعايير الحقيقية للجهة المرسلة.'
    },
    unsafeEmail: {
      English: 'CRITICAL WARNING: High risk of spoofing. Do not trust sender credentials.',
      Arabic: 'تحذير أمني خطير: احتمال انتحال كبير جداً. لا تثق بالرسالة أو الروابط المرفقة.'
    }
  };

  const getTxt = (key: string) => {
    const lang = language === 'Arabic' ? 'Arabic' : 'English';
    return dict[key]?.[lang] || dict[key]?.['English'] || key;
  };

  // Helper algorithms for brand check
  const checkBrandImpersonation = (fromEmail: string, fromName: string) => {
    const alerts: string[] = [];
    let isSpoofed = false;
    
    const emailLower = fromEmail.toLowerCase();
    const nameLower = fromName.toLowerCase();
    const parts = emailLower.split("@");
    const domain = parts[parts.length - 1] || "";
    
    const isGenericDomain = GENERIC_DOMAINS.some(gen => domain.includes(gen));
    
    for (const brand of PROTECTED_BRANDS) {
      // 1. Name Spoofing
      if (nameLower.includes(brand)) {
        if (!domain.includes(brand)) {
          alerts.push(
            language === 'Arabic'
              ? `انتحال اسم العرض: يحتوي اسم المرسل على العلامة التجارية '${brand.toUpperCase()}'، ولكن نطاق البريد الفعلي عام/غير تابع لها ('${domain}').`
              : `Display Name Spoofing: Sender name claims to be '${brand.toUpperCase()}', but envelope domain is generic/unaffiliated ('${domain}').`
          );
          isSpoofed = true;
        }
      }
      
      // 2. Typosquatting / Lookalikes
      if (domain) {
        if (brand !== domain.split(".")[0]) {
          const replacements = [["o", "0"], ["l", "1"], ["i", "1"], ["m", "rn"], ["vv", "w"]];
          for (const [char, rep] of replacements) {
            const mutated = brand.replace(new RegExp(char, 'g'), rep);
            if (mutated !== brand && domain.includes(mutated) && !domain.includes(brand)) {
              alerts.push(
                language === 'Arabic'
                  ? `تزييف النطاق: النطاق '${domain}' يشبه نسخة معدلة وخبيثة من العلامة التجارية '${brand.toUpperCase()}'.`
                  : `Brand Typosquatting: Domain '${domain}' appears to be a spoofed variation of protected brand '${brand.toUpperCase()}'.`
              );
              isSpoofed = true;
              break;
            }
          }
          
          // Suspicious keywords combination
          if (domain.includes(brand) && !domain.endsWith(`.${brand}.com`) && !domain.endsWith(`.${brand}.net`) && domain !== `${brand}.com` && domain !== `${brand}.org` && domain !== `${brand}.net`) {
            alerts.push(
              language === 'Arabic'
                ? `دمج مشبوه: يحتوي النطاق '${domain}' على اسم '${brand.toUpperCase()}' مدمجاً مع كلمات مساعدة مريبة.`
                : `Suspicious Brand Combination: Domain '${domain}' contains '${brand.toUpperCase()}' combined with auxiliary/untrusted tokens.`
            );
            isSpoofed = true;
          }
        }
      }
    }
    
    return { isSpoofed, alerts };
  };

  // Run raw header parsing
  const handleParse = () => {
    if (!rawText.trim()) return;

    const lowerText = rawText.toLowerCase();
    const hasHeaders = ["from:", "subject:", "received-spf:", "dkim-signature:", "authentication-results:", "spf=", "dkim=", "dmarc="].some(m => lowerText.includes(m)) || lowerText.includes("received:") || lowerText.includes("message-id:");

    if (!hasHeaders) {
      setParsedResults({
        name: 'Unavailable',
        email: 'Unavailable',
        subject: 'Unavailable',
        spf: 'Unavailable',
        dkim: 'Unavailable',
        dmarc: 'Unavailable',
        brandCheck: { isSpoofed: false, alerts: [] },
        reason: 'Email headers were not provided. Authentication could not be verified.'
      });
      return;
    }

    // Regex extraction
    const fromMatch = rawText.match(/From:\s*([^<\n]+)?(?:<([^>\n]+)>)?/i) || rawText.match(/from:\s*([^\s\n]+)/i);
    const subjectMatch = rawText.match(/Subject:\s*(.*)/i);
    const spfMatch = rawText.match(/Received-SPF:\s*([a-z]+)/i) || rawText.match(/spf=\s*([a-z]+)/i);
    const dkimMatch = rawText.match(/dkim=\s*([a-z]+)/i) || rawText.match(/DKIM-Signature:/i);
    const dmarcMatch = rawText.match(/dmarc=\s*([a-z]+)/i);

    let extractedName = '';
    let extractedEmail = '';
    
    if (fromMatch) {
      if (fromMatch[2]) {
        extractedName = fromMatch[1]?.trim() || '';
        extractedEmail = fromMatch[2].trim();
      } else {
        extractedEmail = fromMatch[1]?.trim() || '';
      }
    }

    const subject = subjectMatch ? subjectMatch[1].trim() : 'No Subject Found';
    
    let spfVal: 'PASS' | 'FAIL' | 'NONE' | 'Unavailable' = 'NONE';
    if (spfMatch) {
      const s = spfMatch[1].toUpperCase();
      if (s.includes('PASS')) spfVal = 'PASS';
      else if (s.includes('FAIL')) spfVal = 'FAIL';
    }

    let dkimVal: 'PASS' | 'FAIL' | 'NONE' | 'Unavailable' = 'NONE';
    if (dkimMatch) {
      if (Array.isArray(dkimMatch)) {
        const d = dkimMatch[1]?.toUpperCase() || '';
        if (d.includes('PASS')) dkimVal = 'PASS';
        else if (d.includes('FAIL')) dkimVal = 'FAIL';
        else dkimVal = 'PASS'; // Presence of DKIM signature often defaults to passive pass unless failed
      } else {
        dkimVal = 'PASS';
      }
    }

    let dmarcVal: 'PASS' | 'FAIL' | 'NONE' | 'Unavailable' = 'NONE';
    if (dmarcMatch) {
      const dm = dmarcMatch[1].toUpperCase();
      if (dm.includes('PASS')) dmarcVal = 'PASS';
      else if (dm.includes('FAIL')) dmarcVal = 'FAIL';
    }

    const brandCheck = checkBrandImpersonation(extractedEmail, extractedName);

    setParsedResults({
      name: extractedName || 'Unknown Sender',
      email: extractedEmail || 'unknown@unverified.domain',
      subject,
      spf: spfVal,
      dkim: dkimVal,
      dmarc: dmarcVal,
      brandCheck,
      reason: 'Analyzed raw email headers.'
    });
  };

  // Run dynamic builder analytics
  const builderResults = useMemo(() => {
    const brandCheck = checkBrandImpersonation(senderEmail, senderName);
    
    // Overall Risk Calculation based on SPF/DKIM/DMARC statuses
    let riskScore = 0;
    if (spfStatus === 'FAIL') riskScore += 30;
    if (dkimStatus === 'FAIL' || dkimStatus === 'NONE') riskScore += 20;
    if (dmarcStatus === 'FAIL') riskScore += 40;
    if (brandCheck.isSpoofed) riskScore += 50;

    const riskLevel = riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'MEDIUM' : 'LOW';

    return {
      brandCheck,
      riskLevel,
      riskScore
    };
  }, [senderName, senderEmail, spfStatus, dkimStatus, dmarcStatus]);

  return (
    <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-[#0B0D0F] border-white/5' : 'bg-white border-slate-200'} shadow-2xl space-y-8`}>
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className="space-y-1">
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Mail className="w-6 h-6 text-cyan-400" />
            <h2 className={`text-2xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {getTxt('title')}
            </h2>
          </div>
          <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
            {getTxt('subtitle')}
          </p>
        </div>

        {/* Sub-tab Toggles */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 self-start">
          <button
            onClick={() => setActiveSubTab('parser')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'parser' 
                ? 'bg-cyan-400 text-black shadow-lg font-black' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            {getTxt('tabParser')}
          </button>
          <button
            onClick={() => setActiveSubTab('builder')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'builder' 
                ? 'bg-cyan-400 text-black shadow-lg font-black' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            {getTxt('tabBuilder')}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'parser' ? (
          <motion.div
            key="parser"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={getTxt('placeholder')}
                className={`w-full h-48 p-4 rounded-xl border-2 font-mono text-sm leading-relaxed ${
                  theme === 'dark' 
                    ? 'bg-[#0E1012] border-white/10 text-emerald-400 focus:border-cyan-400' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-400'
                } focus:outline-none resize-none`}
              />
              <button
                onClick={handleParse}
                disabled={!rawText.trim()}
                className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-200 disabled:text-slate-400 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
              >
                {getTxt('analyzeBtn')}
              </button>
            </div>

            {/* Parsed Results Panel */}
            {parsedResults && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-2xl border ${
                  theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'
                } space-y-6`}
              >
                <div className={`flex items-center justify-between border-b pb-4 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400">
                    {getTxt('authStatus')}
                  </h3>
                  <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${
                    parsedResults.brandCheck.isSpoofed || parsedResults.spf === 'FAIL' || parsedResults.dmarc === 'FAIL'
                      ? 'bg-red-500/10 border-red-500/20 text-red-500'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  }`}>
                    {parsedResults.brandCheck.isSpoofed || parsedResults.spf === 'FAIL' || parsedResults.dmarc === 'FAIL' ? 'UNSAFE / SPOOFED' : 'VERIFIED PASS'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Metadata fields */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1">Sender Email</span>
                      <p className="font-mono text-xs p-3 rounded-lg bg-white/5 border border-white/5 break-all">
                        {parsedResults.name ? `${parsedResults.name} ` : ''}&lt;{parsedResults.email}&gt;
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1">Subject Line</span>
                      <p className="text-xs p-3 rounded-lg bg-white/5 border border-white/5 font-bold">
                        {parsedResults.subject}
                      </p>
                    </div>
                  </div>

                  {/* Authentication Badges */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block mb-1">{getTxt('technicalAudit')}</span>
                    <div className="grid grid-cols-3 gap-3">
                      <div className={`p-3 rounded-xl border text-center ${
                        parsedResults.spf === 'PASS' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : parsedResults.spf === 'FAIL'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-white/5 border-white/5 text-white/40'
                      }`}>
                        <div className="text-[10px] font-mono font-bold">SPF</div>
                        <div className="text-xs font-black mt-1">{parsedResults.spf}</div>
                      </div>

                      <div className={`p-3 rounded-xl border text-center ${
                        parsedResults.dkim === 'PASS' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : parsedResults.dkim === 'FAIL'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-white/5 border-white/5 text-white/40'
                      }`}>
                        <div className="text-[10px] font-mono font-bold">DKIM</div>
                        <div className="text-xs font-black mt-1">{parsedResults.dkim}</div>
                      </div>

                      <div className={`p-3 rounded-xl border text-center ${
                        parsedResults.dmarc === 'PASS' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : parsedResults.dmarc === 'FAIL'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-white/5 border-white/5 text-white/40'
                      }`}>
                        <div className="text-[10px] font-mono font-bold">DMARC</div>
                        <div className="text-xs font-black mt-1">{parsedResults.dmarc}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Impersonation Warnings */}
                <div className={`p-4 rounded-xl border ${
                  parsedResults.brandCheck.isSpoofed 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                } space-y-2`}>
                  <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <AlertOctagon className="w-4 h-4" />
                    <span>{getTxt('brandImpersonation')}</span>
                  </div>
                  {parsedResults.brandCheck.isSpoofed ? (
                    <ul className={`text-xs space-y-1.5 list-disc pl-4 ${isRTL ? 'text-right list-none pr-0' : ''}`}>
                      {parsedResults.brandCheck.alerts.map((alert: string, idx: number) => (
                        <li key={idx} className="font-medium leading-relaxed">{alert}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs font-medium">{getTxt('noImpersonation')}</p>
                  )}
                </div>

                {/* Compliance Recommendation */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block">{getTxt('recommendation')}</span>
                  <p className={`text-sm font-bold ${
                    parsedResults.brandCheck.isSpoofed || parsedResults.spf === 'FAIL' || parsedResults.dmarc === 'FAIL'
                      ? 'text-red-400'
                      : 'text-emerald-400'
                  }`}>
                    {parsedResults.brandCheck.isSpoofed || parsedResults.spf === 'FAIL' || parsedResults.dmarc === 'FAIL'
                      ? getTxt('unsafeEmail')
                      : getTxt('safeEmail')}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="builder"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Left Controls */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Sender Display Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Envelope From Email</label>
                <input
                  type="text"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">SPF Policy</label>
                  <select
                    value={spfStatus}
                    onChange={(e: any) => setSpfStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 font-bold text-white/80"
                  >
                    <option value="PASS" className="bg-[#0B0D0F]">PASS</option>
                    <option value="FAIL" className="bg-[#0B0D0F]">FAIL</option>
                    <option value="NONE" className="bg-[#0B0D0F]">NONE</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">DKIM Keys</label>
                  <select
                    value={dkimStatus}
                    onChange={(e: any) => setDkimStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 font-bold text-white/80"
                  >
                    <option value="PASS" className="bg-[#0B0D0F]">PASS</option>
                    <option value="FAIL" className="bg-[#0B0D0F]">FAIL</option>
                    <option value="NONE" className="bg-[#0B0D0F]">NONE</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">DMARC Policy</label>
                  <select
                    value={dmarcStatus}
                    onChange={(e: any) => setDmarcStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 font-bold text-white/80"
                  >
                    <option value="PASS" className="bg-[#0B0D0F]">PASS</option>
                    <option value="FAIL" className="bg-[#0B0D0F]">FAIL</option>
                    <option value="NONE" className="bg-[#0B0D0F]">NONE</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Audit Analysis Output */}
            <div className={`p-6 rounded-2xl border ${
              theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-slate-100 border-slate-200'
            } flex flex-col justify-between space-y-6`}>
              <div className="space-y-4">
                <div className={`flex items-center justify-between border-b pb-3 border-white/5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Real-Time Risk Simulator</span>
                  </div>
                  <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded ${
                    builderResults.riskLevel === 'CRITICAL' 
                      ? 'bg-red-500/15 text-red-500 border border-red-500/30' 
                      : builderResults.riskLevel === 'MEDIUM'
                      ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                  }`}>
                    {builderResults.riskLevel} RISK ({builderResults.riskScore}%)
                  </span>
                </div>

                {/* Simulated Raw Email display */}
                <div className="bg-[#050607] border border-white/5 p-4 rounded-xl font-mono text-[11px] leading-relaxed text-slate-400 space-y-1 select-none">
                  <div className="text-slate-500"># SIMULATED MAIL TRANSFER AGENT (MTA) DATA</div>
                  <div><span className="text-white/60 font-bold">From:</span> {senderName} &lt;{senderEmail}&gt;</div>
                  <div><span className="text-white/60 font-bold">SPF-Record:</span> {spfStatus} (Domain Alignment Audit)</div>
                  <div><span className="text-white/60 font-bold">DKIM-Signature:</span> {dkimStatus === 'PASS' ? 'v=1; a=rsa-sha256; d=verified' : dkimStatus === 'FAIL' ? 'invalid-key' : 'not-signed'}</div>
                  <div><span className="text-white/60 font-bold">DMARC-Result:</span> {dmarcStatus}</div>
                </div>

                {/* Heuristic Impersonation Details */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">Audit Flags</span>
                  <div className="space-y-2">
                    {builderResults.brandCheck.isSpoofed ? (
                      builderResults.brandCheck.alerts.map((alert: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-red-400 leading-relaxed">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span>{alert}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>No brand impersonation vector detected.</span>
                      </div>
                    )}

                    {spfStatus === 'FAIL' && (
                      <div className="flex items-start gap-2 text-xs text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>SPF Failure: Incoming server is not authorized to deliver mail for domain.</span>
                      </div>
                    )}
                    {dmarcStatus === 'FAIL' && (
                      <div className="flex items-start gap-2 text-xs text-red-400 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>DMARC Fail: Domain rejects sender validation alignment. Quarantine suggested.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block">{getTxt('recommendation')}</span>
                <p className={`text-xs font-bold ${
                  builderResults.riskLevel === 'CRITICAL' ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {builderResults.riskLevel === 'CRITICAL'
                    ? 'CRITICAL WARNING: This email fails multiple critical sender validations. Do not interact.'
                    : 'Safe: Email passes structural sender compliance check.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
