import { useState, useMemo } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Terminal, Cpu, Landmark, Sparkles, Key, AlertOctagon, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SignatureScannerProps {
  language: string;
  theme: 'light' | 'dark';
}

const SCAM_KEYWORDS = {
  urgency: ["urgent", "action required", "immediate", "suspending", "suspended", "blocked", "restricted", "expired", "terminate", "last warning"],
  financial: ["bank", "paypal", "crypto", "bitcoin", "refund", "invoice", "payment", "billing", "transfer", "claim", "prize", "lottery", "cash", "bonus"],
  authentication: ["verify", "login", "signin", "reset", "password", "credential", "unusual activity", "unauthorized", "security alert"],
  smishing_specific: ["shipping", "package", "delivery", "dhl", "fedex", "usps", "customs", "post office", "tracking"]
};

export function SignatureScannerView({ language, theme }: SignatureScannerProps) {
  const isRTL = language === 'Arabic';
  const [text, setText] = useState('');
  
  // Multi-language text dictionary
  const dict: Record<string, Record<string, string>> = {
    title: {
      English: 'Heuristic Signature Scanner',
      Arabic: 'ماسح تواقيع الهجمات الاحتيالية'
    },
    subtitle: {
      English: 'Execute heuristic algorithms to audit texts against regex matrices, cryptocoin ransom wallets, and link shorteners.',
      Arabic: 'تشغيل خوارزميات الاستكشاف لمطابقة النصوص مع قوالب الهندسة العكسية، ومحافظ الفدية، ومختصرات الروابط.'
    },
    placeholder: {
      English: 'Paste message or SMS content here for immediate heuristic compliance analysis...\nExample: Urgent security check required: Login immediately at http://192.168.1.50/signin. Send 0.5 BTC to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      Arabic: 'أدخل نص الرسالة أو SMS هنا للتحليل الفوري لمطابقة القوالب...\nمثال: مطلوب فحص أمني عاجل: سجل دخولك فوراً على http://192.168.1.50/signin. أرسل 0.5 بيتكوين إلى 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    gaugeTitle: {
      English: 'Heuristic Risk Level',
      Arabic: 'مستوى المخاطر الاستكشافي'
    },
    rulesTriggered: {
      English: 'Triggered Defenses & Rules',
      Arabic: 'قواعد الأمن المفعّلة والمطابقة'
    },
    keywordMatches: {
      English: 'Identified Threat Keywords',
      Arabic: 'الكلمات المفتاحية المهددة للسلامة'
    },
    cleanResult: {
      English: 'Heuristics are clean. No signature patterns matched.',
      Arabic: 'الرسالة نظيفة تماماً. لم تتطابق أي تراكيب خبيثة مع الفحص الاستكشافي.'
    }
  };

  const getTxt = (key: string) => {
    const lang = language === 'Arabic' ? 'Arabic' : 'English';
    return dict[key]?.[lang] || dict[key]?.['English'] || key;
  };

  // Compile scan metrics on-the-fly
  const analysis = useMemo(() => {
    if (!text.trim()) return null;

    const triggeredRules: string[] = [];
    const keywordHits: Record<string, string[]> = {};
    let score = 0;

    const textLower = text.toLowerCase();

    // 1. Keyword scans
    for (const [category, words] of Object.entries(SCAM_KEYWORDS)) {
      const hits: string[] = [];
      for (const word of words) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(textLower)) {
          hits.push(word);
        }
      }

      if (hits.length > 0) {
        keywordHits[category] = hits;
        if (category === 'urgency') {
          score += hits.length * 12;
          triggeredRules.push(
            language === 'Arabic' 
              ? `تم رصد مؤشر استعجال وضغط نفسي: [${hits.join(', ')}]` 
              : `Social Urgency Pattern detected: [${hits.join(', ')}]`
          );
        } else if (category === 'financial') {
          score += hits.length * 15;
          triggeredRules.push(
            language === 'Arabic' 
              ? `مؤشرات استدراج مالي/بنكي: [${hits.join(', ')}]` 
              : `Financial Bait Keyword detected: [${hits.join(', ')}]`
          );
        } else if (category === 'authentication') {
          score += hits.length * 18;
          triggeredRules.push(
            language === 'Arabic' 
              ? `محاولة سرقة بيانات المرور والهوية: [${hits.join(', ')}]` 
              : `Account Credential Harvesting phrase: [${hits.join(', ')}]`
          );
        } else if (category === 'smishing_specific') {
          score += hits.length * 10;
          triggeredRules.push(
            language === 'Arabic' 
              ? `انتحال شركات الشحن والطرود: [${hits.join(', ')}]` 
              : `Smishing Shipping & Customs bait: [${hits.join(', ')}]`
          );
        }
      }
    }

    // 2. Cryptographic Wallet regex checks
    const btcWalletRegex = /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/;
    const ethWalletRegex = /\b0x[a-fA-F0-9]{40}\b/;

    if (btcWalletRegex.test(text)) {
      triggeredRules.push(
        language === 'Arabic'
          ? 'بصمة تشفير فدية (BTC): تحتوي الرسالة على عنوان محفظة بيتكوين.'
          : 'Crypto Ransom Signature: Message contains a Bitcoin wallet address.'
      );
      score += 45;
    }

    if (ethWalletRegex.test(text)) {
      triggeredRules.push(
        language === 'Arabic'
          ? 'بصمة تشفير فدية (ETH): تحتوي الرسالة على عنوان محفظة إيثيريوم.'
          : 'Crypto Fraud Signature: Message contains an Ethereum wallet address.'
      );
      score += 40;
    }

    // 3. Shortlinks and IP in URLs
    const shortlinkRegex = /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|rebrand\.ly|is\.gd|ow\.ly|lnkd\.in)\b/i;
    const ipInUrlRegex = /\bhttps?:\/\/(?:\d{1,3}\.){3}\d{1,3}\b/i;
    const genericUrlRegex = /https?:\/\/[^\s<>"]+/g;

    const urls = text.match(genericUrlRegex) || [];

    if (shortlinkRegex.test(text)) {
      triggeredRules.push(
        language === 'Arabic'
          ? 'اختصار روابط مشبوه: يستعمل المهاجم روابط مخفية لتجنب الفحص.'
          : 'Suspicious Link Shortener: Redirection vector used to bypass active domain checks.'
      );
      score += 15;
    }

    if (ipInUrlRegex.test(text)) {
      triggeredRules.push(
        language === 'Arabic'
          ? 'رابط عنوان IP مباشر: خرق لمعايير النطاقات الآمنة ومؤشر خبيث مرتفع.'
          : 'Direct IP Target URL: Extreme threat vector bypasses registered domains.'
      );
      score += 35;
    }

    if (urls.length > 0) {
      triggeredRules.push(
        language === 'Arabic'
          ? `روابط نشطة مكتشفة: تحتوي الرسالة على ${urls.length} رابط خارجي.`
          : `Active Links Discovered: Found ${urls.length} target landing page(s).`
      );
      score += urls.length * 5;
    }

    const cappedScore = Math.min(score, 100);
    const threatLevel = cappedScore >= 65 ? 'HIGH' : cappedScore >= 30 ? 'MEDIUM' : 'LOW';

    return {
      triggeredRules,
      keywordHits,
      score: cappedScore,
      threatLevel,
      urls
    };
  }, [text, language]);

  return (
    <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-[#0B0D0F] border-white/5' : 'bg-white border-slate-200'} shadow-2xl space-y-8`}>
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className="space-y-1">
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Cpu className="w-6 h-6 text-cyan-400" />
            <h2 className={`text-2xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {getTxt('title')}
            </h2>
          </div>
          <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
            {getTxt('subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Field */}
        <div className="lg:col-span-7 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={getTxt('placeholder')}
            className={`w-full h-80 p-6 rounded-2xl border-2 font-mono text-sm leading-relaxed ${
              theme === 'dark' 
                ? 'bg-[#0E1012] border-white/10 text-cyan-400 focus:border-cyan-400' 
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-400'
            } focus:outline-none resize-none shadow-inner`}
          />
          {text && (
            <button
              onClick={() => setText('')}
              className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest ${
                theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-800'
              } transition-colors`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Input
            </button>
          )}
        </div>

        {/* Right Analysis Panel */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {analysis ? (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-6 rounded-2xl border ${
                  theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'
                } space-y-6`}
              >
                {/* Risk Gauge Header */}
                <div className={`flex items-center justify-between border-b pb-4 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                    {getTxt('gaugeTitle')}
                  </span>
                  <span className={`text-[10px] font-mono font-black px-3 py-1 rounded border ${
                    analysis.threatLevel === 'HIGH' 
                      ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                      : analysis.threatLevel === 'MEDIUM'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  }`}>
                    {analysis.threatLevel} ({analysis.score}%)
                  </span>
                </div>

                {/* Score Progress bar */}
                <div className="space-y-2">
                  <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.score}%` }}
                      className={`h-full ${
                        analysis.score >= 65 
                          ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
                          : analysis.score >= 30 
                          ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
                          : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                      }`}
                    />
                  </div>
                </div>

                {/* Rules Triggered list */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block">{getTxt('rulesTriggered')}</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {analysis.triggeredRules.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-rose-400 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keyword metrics */}
                {Object.keys(analysis.keywordHits).length > 0 && (
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest block">{getTxt('keywordMatches')}</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(analysis.keywordHits).map(([category, hits]) => (
                        (hits as string[]).map(word => (
                          <span key={word} className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase">
                            {word}
                          </span>
                        ))
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className={`h-full flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-2xl ${
                theme === 'dark' ? 'border-white/5 text-white/10' : 'border-slate-200 text-slate-300'
              }`}>
                <Terminal className="w-12 h-12 mb-3 animate-pulse text-cyan-400/20" />
                <p className="text-xs font-mono uppercase tracking-widest">{getTxt('cleanResult')}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
