import { useState, useEffect } from 'react';
import { Award, BookOpen, Brain, CheckCircle, HelpCircle, Shield, ShieldAlert, ShieldCheck, Trophy, ArrowRight, Play, RefreshCw, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SevenLayerVisualizer } from './SevenLayerVisualizer';

interface Scenario {
  id: string;
  titleEn: string;
  titleAr: string;
  senderEn: string;
  senderAr: string;
  bodyEn: string;
  bodyAr: string;
  isThreat: boolean;
  type: 'Phishing' | 'Scam' | 'Social Engineering' | 'Safe';
  typeAr: string;
  reasonEn: string;
  reasonAr: string;
  layers: {
    layer1: { status: 'safe' | 'warning' | 'threat'; detailsEn: string; detailsAr: string };
    layer2: { status: 'safe' | 'warning' | 'threat'; detailsEn: string; detailsAr: string };
    layer3: { status: 'safe' | 'warning' | 'threat'; detailsEn: string; detailsAr: string };
    layer4: { status: 'safe' | 'warning' | 'threat'; detailsEn: string; detailsAr: string };
    layer5: { status: 'safe' | 'warning' | 'threat'; detailsEn: string; detailsAr: string };
    layer6: { status: 'safe' | 'warning' | 'threat'; detailsEn: string; detailsAr: string };
    layer7: { status: 'safe' | 'warning' | 'threat'; detailsEn: string; detailsAr: string };
  };
}

const ACADEMY_SCENARIOS: Scenario[] = [
  {
    id: 'netflix_typo',
    titleEn: 'Netflix Subscription Warning',
    titleAr: 'تحذير تجديد اشتراك نتفليكس',
    senderEn: 'support@netfIix-billing.com',
    senderAr: 'support@netfIix-billing.com',
    bodyEn: 'Your Netflix subscription has expired. Please update your payment information within 24 hours to avoid service suspension: https://netfIix-billing-security.com/login',
    bodyAr: 'لقد انتهت صلاحية اشتراك Netflix الخاص بك. يرجى تحديث معلومات الدفع الخاصة بك في غضون 24 ساعة لتجنب تعليق الخدمة: https://netfIix-billing-security.com/login',
    isThreat: true,
    type: 'Phishing',
    typeAr: 'تصيد احتيالي',
    reasonEn: 'Look closely at the domain name: "netfIix" uses an uppercase "I" instead of a lowercase "l". This is a classic brand typosquatting technique designed to mimic the official service.',
    reasonAr: 'انظر بتمعن لاسم النطاق: "netfIix" يستخدم الحرف الكبير "I" بدلاً من الحرف الصغير "l". هذه طريقة كلاسيكية لانتحال الماركات التجارية لإقناعك بالدخول.',
    layers: {
      layer1: { status: 'warning', detailsEn: 'Valid TLD (.com) but registered recently in an anonymous registrar.', detailsAr: 'نطاق TLD (.com) صالح ولكنه مسجل مؤخراً لدى مسجل مجهول.' },
      layer2: { status: 'threat', detailsEn: 'Brand Typosquatting detected: mimics Netflix with visual character confusion.', detailsAr: 'تم اكتشاف انتحال للماركة: يقلد Netflix مع تلاعب بالأحرف المتشابهة بصرياً.' },
      layer3: { status: 'warning', detailsEn: 'URL contains security-themed subdirectories to build fake trust.', detailsAr: 'يحتوي الرابط على مسارات فرعية متعلقة بالأمان لبناء ثقة زائفة.' },
      layer4: { status: 'threat', detailsEn: 'Semantic intent: Credential harvesting and account takeover attempt.', detailsAr: 'التحليل الدلالي: محاولة سرقة بيانات الاعتماد والسيطرة على الحساب.' },
      layer5: { status: 'threat', detailsEn: 'Urgency detected: 24-hour deadline causes emotional panic.', detailsAr: 'تم رصد حالة استعجال: مهلة 24 ساعة تسبب هلعاً عاطفياً لتسريع استجابتك.' },
      layer6: { status: 'safe', detailsEn: 'No MFA automated pattern bypass triggered.', detailsAr: 'لم يتم تفعيل نمط تجاوز التحقق التلقائي للرموز.' },
      layer7: { status: 'threat', detailsEn: 'Matches high-risk typosquatting patterns in SentryAI threat databases.', detailsAr: 'يطابق أنماط انتحال الهوية عالية الخطورة في قواعد بيانات تهديدات SentryAI.' }
    }
  },
  {
    id: 'dhl_free_tld',
    titleEn: 'DHL Express Delivery Pending',
    titleAr: 'توصيل شحنة DHL معلق',
    senderEn: 'dhl-delivery@express-tracking.tk',
    senderAr: 'dhl-delivery@express-tracking.tk',
    bodyEn: 'DHL Express: Your package code 82959-1 is waiting at our sorting hub. A small customs processing fee of $1.50 is pending. Pay immediately to schedule delivery: http://dhl-express-tracking.tk/customs',
    bodyAr: 'DHL Express: رمز شحنتك 82959-1 معلق في مركز الفرز الخاص بنا. هناك رسوم جمركية معلقة بقيمة $1.50. ادفع على الفور لجدولة التسليم: http://dhl-express-tracking.tk/customs',
    isThreat: true,
    type: 'Scam',
    typeAr: 'احتيال ونصب',
    reasonEn: 'The scammer demands money for package release and links to a free ".tk" top-level domain. Legitimate delivery companies never use free, untraceable TLDs like .tk, .ml, or .cf.',
    reasonAr: 'يطلب المحتال دفع رسوم شحن مستخدماً نطاقاً مجانياً ".tk". شركات الشحن الرسمية لا تستخدم أبداً النطاقات المجانية وغير القابلة للتتبع مثل .tk أو .ml.',
    layers: {
      layer1: { status: 'threat', detailsEn: 'High-risk Free TLD (.tk) detected. Heavily associated with malware and rapid campaign rollouts.', detailsAr: 'تم اكتشاف نطاق مجاني عالي الخطورة (.tk). يرتبط بكثافة بحملات البرمجيات الخبيثة.' },
      layer2: { status: 'warning', detailsEn: 'Mimics DHL Express shipping services without official server domain verification.', detailsAr: 'يقلد خدمات شحن DHL Express دون توثيق النطاق الرسمي للخدمة.' },
      layer3: { status: 'safe', detailsEn: 'URL structure is simple but standard HTTP with no secure layer.', detailsAr: 'بنية الرابط بسيطة لكنها تستخدم بروتوكول HTTP غير آمن وبدون تشفير.' },
      layer4: { status: 'threat', detailsEn: 'Scam intent: Financial extortion through low-amount baiting.', detailsAr: 'التحليل الدلالي: ابتزاز مالي عبر طعم بمبلغ بسيط لتسهيل الدفع.' },
      layer5: { status: 'warning', detailsEn: 'Subtle urgency created by claiming the package is waiting.', detailsAr: 'استعجال خفيف عبر الادعاء بأن الشحنة في الانتظار.' },
      layer6: { status: 'safe', detailsEn: 'No MFA code patterns detected.', detailsAr: 'لم يتم تتبع أي رموز تحقق ثنائية.' },
      layer7: { status: 'threat', detailsEn: 'Domain registry matches active blacklists in PhishTank and local heuristics.', detailsAr: 'سجل النطاق يطابق القوائم السوداء النشطة في PhishTank والمؤشرات المحلية.' }
    }
  },
  {
    id: 'whatsapp_otp_legit',
    titleEn: 'Official WhatsApp Authentication',
    titleAr: 'رمز تحقق واتساب الرسمي',
    senderEn: 'WhatsApp Security',
    senderAr: 'أمان واتساب',
    bodyEn: 'Your WhatsApp verification code is: 481-902. If you did not request this code, ignore this message. Do not share this code with anyone.',
    bodyAr: 'كود التحقق الخاص بواتساب هو: 481-902. إذا لم تكن قد طلبت هذا الكود، فيرجى تجاهل هذه الرسالة. لا تشارك الكود مع أي شخص.',
    isThreat: false,
    type: 'Safe',
    typeAr: 'آمن وموثوق',
    reasonEn: 'This matches the official WhatsApp MFA structure perfectly. It contains no hyperlinks, requests for money, or prompts asking you to forward the code to anyone.',
    reasonAr: 'هذا يطابق تماماً بنية رسائل التحقق الرسمية لواتساب. لا يحتوي على أي روابط إلكترونية، أو طلبات للأموال، أو حث على توجيه الكود لشخص آخر.',
    layers: {
      layer1: { status: 'safe', detailsEn: 'No external URL structure detected to evaluate.', detailsAr: 'لا توجد روابط خارجية في الرسالة لتقييم سمعتها.' },
      layer2: { status: 'safe', detailsEn: 'No brand impersonation signatures or malicious redirects.', detailsAr: 'لا توجد توقيعات لانتحال العلامة التجارية أو إعادة توجيه خبيث.' },
      layer3: { status: 'safe', detailsEn: 'Structural payload contains no clickable hyperlinks.', detailsAr: 'لا يحتوي نص الرسالة على أي روابط قابلة للنقر.' },
      layer4: { status: 'safe', detailsEn: 'Standard verification code language with strict privacy protection warnings.', detailsAr: 'لغة كود تحقق قياسية مع تحذيرات حماية الخصوصية الصارمة.' },
      layer5: { status: 'safe', detailsEn: 'Urgency is low and provides defensive bypass instructions (ignore if unrequested).', detailsAr: 'الاستعجال منخفض ويقدم إرشادات أمنية دفاعية (التجاهل في حال عدم الطلب).' },
      layer6: { status: 'safe', detailsEn: 'WhatsApp Multi-Factor Exemption Rule Active: Matches legitimate template.', detailsAr: 'قاعدة استثناء واتساب ثنائية العامل نشطة: الرسالة تطابق القالب الآمن.' },
      layer7: { status: 'safe', detailsEn: 'No match in any known threat database feeds.', detailsAr: 'لا يوجد أي تطابق في قواعد بيانات أو تغذيات التهديدات النشطة.' }
    }
  },
  {
    id: 'chase_at_redirect',
    titleEn: 'Chase Bank Suspicious Transfer',
    titleAr: 'تحذير بنك تشيس: تحويل مشبوه',
    senderEn: 'alerts@chase-security-check.com',
    senderAr: 'alerts@chase-security-check.com',
    bodyEn: 'Chase Alert: Did you authorize a transfer of $1,800.00 to John? If not, stop this transaction immediately by verifying your identity: http://chase.com@verification-chase-portal.biz/login',
    bodyAr: 'Chase Alert: هل قمت بتفويض تحويل بقيمة $1,800.00 إلى John؟ إذا لم يكن كذلك، أوقف هذه المعاملة فوراً بالتحقق من هويتك: http://chase.com@verification-chase-portal.biz/login',
    isThreat: true,
    type: 'Social Engineering',
    typeAr: 'هندسة اجتماعية',
    reasonEn: 'This link uses the advanced user-info delimiter trick. "http://chase.com@" makes you believe you are going to chase.com, but the browser actually redirects you to "verification-chase-portal.biz", a malicious portal.',
    reasonAr: 'هذا الرابط يستخدم حيلة علامة "@" المتقدمة. إضافة "http://chase.com@" تخدعك بأنك تدخل لموقع البنك الرسمي، لكن المتصفح يوجهك فعلياً إلى "verification-chase-portal.biz" الخبيث.',
    layers: {
      layer1: { status: 'threat', detailsEn: 'Target domain uses .biz, a low-reputation top-level domain frequently abused by bad actors.', detailsAr: 'النطاق الحقيقي المستهدف يستعمل .biz، وهو نطاق سيئ السمعة ومسيء الاستخدام.' },
      layer2: { status: 'threat', detailsEn: 'Brand Impersonation: Mimics Chase Bank digital identity using visual prefixing.', detailsAr: 'انتحال العلامة التجارية: يقلد الهوية الرقمية لبنك Chase عبر بادئة بصرية مخادعة.' },
      layer3: { status: 'threat', detailsEn: 'URL Forensic Threat: Employs the "@" user-info delimiter to override hostname destination.', detailsAr: 'خطر بنيوي في الرابط: يستخدم علامة "@" لتجاوز عنوان المستضيف وإعادة التوجيه.' },
      layer4: { status: 'threat', detailsEn: 'Semantic intent: Social engineering panic trigger to harvest financial login credentials.', detailsAr: 'التحليل الدلالي: إثارة الهلع عبر تحويل وهمي لسرقة بيانات تسجيل الدخول المصرفية.' },
      layer5: { status: 'threat', detailsEn: 'Extreme urgency: Threatens immediate loss of $1,800.00 if action is not taken.', detailsAr: 'حالة استعجال قصوى: يهدد بخسارة فورية لمبلغ $1,800.00 إن لم تتخذ إجراءً.' },
      layer6: { status: 'safe', detailsEn: 'No MFA authentication templates matched.', detailsAr: 'لم يتم تطابق أي قوالب تحقق أمنية رسمية.' },
      layer7: { status: 'threat', detailsEn: 'URL redirect sequence flagged in phishing telemetry databases.', detailsAr: 'تم وضع علامة حمراء على مسار إعادة التوجيه في قواعد بيانات التهديدات السيبرانية.' }
    }
  },
  {
    id: 'lotto_jackpot',
    titleEn: 'Mega Lotto Winner Notification',
    titleAr: 'إشعار الفوز بالجائزة الكبرى لوترو',
    senderEn: 'lotto-claim@outlook.com',
    senderAr: 'lotto-claim@outlook.com',
    bodyEn: 'CONGRATULATIONS! Your email address has won $5,000,000.00 in the Annual International Email Sweepstakes. Contact claim-manager-john@outlook.com immediately with your passport and bank details to transfer your funds.',
    bodyAr: 'تهانينا! لقد فاز بريدك الإلكتروني بمبلغ $5,000,000.00 في سحب البريد السنوي الدولي. تواصل مع claim-manager-john@outlook.com فوراً مع إرسال جواز سفرك وتفاصيل البنك لنقل أموالك.',
    isThreat: true,
    type: 'Scam',
    typeAr: 'احتيال ونصب',
    reasonEn: 'Classic lottery / sweepstakes scam. Legitimate lotteries do not pick random email addresses, and official sweepstakes never use free public Outlook email addresses to coordinate multi-million dollar transfers.',
    reasonAr: 'احتيال اليانصيب الكلاسيكي. اليانصيب الحقيقي لا يختار بريداً عشوائياً، ولا تستخدم الهيئات الرسمية حسابات Outlook مجانية لإدارة معاملات بملايين الدولارات.',
    layers: {
      layer1: { status: 'safe', detailsEn: 'Outlook.com is a highly trusted email provider domain.', detailsAr: 'موقع Outlook.com هو نطاق بريد إلكتروني موثوق للغاية.' },
      layer2: { status: 'warning', detailsEn: 'Uses public email provider to represent an international awards institution.', detailsAr: 'يستخدم مزود بريد عام لتمثيل مؤسسة جوائز دولية رسمية.' },
      layer3: { status: 'safe', detailsEn: 'No hyperlinks present inside the text body.', detailsAr: 'لا توجد روابط قابلة للنقر داخل نص الرسالة.' },
      layer4: { status: 'threat', detailsEn: 'Scam intent: High confidence lottery fraud designed to steal identity (passport) and banking credentials.', detailsAr: 'التحليل الدلالي: نصب يانصيب مؤكد يهدف لسرقة الهوية (جواز السفر) والبيانات المصرفية.' },
      layer5: { status: 'threat', detailsEn: 'Greed/Urgency hook: Massive financial reward used to bypass critical logical thinking.', detailsAr: 'الضغط العاطفي: جائزة مالية ضخمة جداً تستخدم لتعطيل التفكير المنطقي والدفاعي.' },
      layer6: { status: 'safe', detailsEn: 'No security MFA patterns detected.', detailsAr: 'لا توجد رموز تحقق تلقائية.' },
      layer7: { status: 'threat', detailsEn: 'Email address matched active advance-fee fraud database reports.', detailsAr: 'تطابق عنوان البريد مع تقارير الاحتيال المالي المتقدمة النشطة.' }
    }
  },
  {
    id: 'mom_greeting',
    titleEn: 'Family Weekend Invitation',
    titleAr: 'دعوة عائلية لعطلة نهاية الأسبوع',
    senderEn: 'Mom (Private Number)',
    senderAr: 'أمي (رقم خاص)',
    bodyEn: 'Hi sweetie! Hope you are having a wonderful week. Are you coming over for dinner this Saturday? I am making your favorite lasagna! Let me know by tonight so I can buy enough ingredients. Love you!',
    bodyAr: 'أهلاً يا حبيبي! أتمنى أن تقضي أسبوعاً رائعاً. هل ستأتي لتناول العشاء هذا السبت؟ سأصنع اللازانيا المفضلة لديك! أخبرني الليلة حتى أشتري مكونات كافية. أحبك!',
    isThreat: false,
    type: 'Safe',
    typeAr: 'آمن وموثوق',
    reasonEn: 'Authentic family conversation. No demands for sensitive data, no redirect links, no automated scam templates, and no high-risk cyber threat signatures.',
    reasonAr: 'محادثة عائلية حقيقية وصادقة. لا توجد أي مطالبات ببيانات حساسة، أو روابط إعادة توجيه، أو قوالب نصب مؤتمتة، أو توقيعات تهديد سيبراني.',
    layers: {
      layer1: { status: 'safe', detailsEn: 'No links detected to evaluate domains.', detailsAr: 'لا توجد روابط ليتم تقييم نطاقاتها.' },
      layer2: { status: 'safe', detailsEn: 'No brand names impersonated.', detailsAr: 'لا توجد أي علامات تجارية تم انتحالها.' },
      layer3: { status: 'safe', detailsEn: 'No structural hyperlink tricks found.', detailsAr: 'لا توجد خدع روابط مخفية.' },
      layer4: { status: 'safe', detailsEn: 'Warm personal communication without malicious cyber intent.', detailsAr: 'محادثة شخصية دافئة وخالية من أي نية خبيثة سيبرانياً.' },
      layer5: { status: 'safe', detailsEn: 'Natural social prompt (lasagna ingredients preparation) with no coercive psychological triggers.', detailsAr: 'استعجال اجتماعي طبيعي (تحضير العشاء) دون أي ضغط مالي أو أمني.' },
      layer6: { status: 'safe', detailsEn: 'Normal SMS format.', detailsAr: 'رسالة نصية طبيعية.' },
      layer7: { status: 'safe', detailsEn: 'Safe contact source. No security issues flagged.', detailsAr: 'مصدر آمن تماماً. لم يتم رصد أي مشكلات أمنية.' }
    }
  }
];

interface SentryAcademyProps {
  language: string;
  theme: 'light' | 'dark';
}

export function SentryAcademy({ language, theme }: SentryAcademyProps) {
  const isRTL = language === 'Arabic';
  
  // Score and level state
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem('sentry_academy_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userSelection, setUserSelection] = useState<'safe' | 'threat' | null>(null);
  const [isScanned, setIsScanned] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [scannedLayers, setScannedLayers] = useState<any | null>(null);

  useEffect(() => {
    localStorage.setItem('sentry_academy_score', score.toString());
  }, [score]);

  const currentScenario = ACADEMY_SCENARIOS[currentIdx];

  const handleSimulateScan = () => {
    if (isScanned) return;
    
    // Convert current scenario layers (with translated details) into standard format for the visualizer
    const mappedLayers = {
      layer1: { status: currentScenario.layers.layer1.status, details: isRTL ? currentScenario.layers.layer1.detailsAr : currentScenario.layers.layer1.detailsEn },
      layer2: { status: currentScenario.layers.layer2.status, details: isRTL ? currentScenario.layers.layer2.detailsAr : currentScenario.layers.layer2.detailsEn },
      layer3: { status: currentScenario.layers.layer3.status, details: isRTL ? currentScenario.layers.layer3.detailsAr : currentScenario.layers.layer3.detailsEn },
      layer4: { status: currentScenario.layers.layer4.status, details: isRTL ? currentScenario.layers.layer4.detailsAr : currentScenario.layers.layer4.detailsEn },
      layer5: { status: currentScenario.layers.layer5.status, details: isRTL ? currentScenario.layers.layer5.detailsAr : currentScenario.layers.layer5.detailsEn },
      layer6: { status: currentScenario.layers.layer6.status, details: isRTL ? currentScenario.layers.layer6.detailsAr : currentScenario.layers.layer6.detailsEn },
      layer7: { status: currentScenario.layers.layer7.status, details: isRTL ? currentScenario.layers.layer7.detailsAr : currentScenario.layers.layer7.detailsEn },
    };

    setScannedLayers(mappedLayers);
    setIsScanned(true);
  };

  const handleAnswer = (choice: 'safe' | 'threat') => {
    if (showFeedback) return;
    
    setUserSelection(choice);
    const correctAns = currentScenario.isThreat ? 'threat' : 'safe';
    const isUserCorrect = choice === correctAns;
    
    setIsCorrect(isUserCorrect);
    if (isUserCorrect) {
      setScore(prev => prev + 100);
    }
    
    setShowFeedback(true);
  };

  const handleNext = () => {
    setUserSelection(null);
    setIsScanned(false);
    setShowFeedback(false);
    setScannedLayers(null);
    setCurrentIdx((prev) => (prev + 1) % ACADEMY_SCENARIOS.length);
  };

  const handleReset = () => {
    setScore(0);
    setCurrentIdx(0);
    setUserSelection(null);
    setIsScanned(false);
    setShowFeedback(false);
    setScannedLayers(null);
    localStorage.removeItem('sentry_academy_score');
  };

  const getBadgeTitle = (s: number) => {
    if (s >= 500) return isRTL ? 'خبير سيبراني معتمد' : 'Certified Security Forensics Expert';
    if (s >= 300) return isRTL ? 'حارس أمن متقدم' : 'Advanced Safety Defender';
    if (s >= 100) return isRTL ? 'مراقب مبتدئ' : 'Cyber Sentry Cadet';
    return isRTL ? 'مستجد سيبراني' : 'Security Recruit';
  };

  return (
    <div className="space-y-12">
      {/* Academy Intro Banner */}
      <div className={`p-8 rounded-3xl relative overflow-hidden border ${theme === 'dark' ? 'bg-gradient-to-br from-[#0e1115] to-[#12161a] border-white/5' : 'bg-white border-slate-200'} shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-cyan-400 animate-bounce" />
            <h2 className={`text-2xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {isRTL ? 'أكاديمية التدريب والوعي الأمني' : 'SentryAI Cyber Academy'}
            </h2>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'} max-w-xl leading-relaxed`}>
            {isRTL 
              ? 'تدرب بذكاء على كشف رسائل التصيد الاحتيالي والنصب! تفحص السناريوهات الواقعية، وتعرف كيف يقوم "درع الطبقات السبع" بتحليلها لتنمية مهاراتك الأمنية.'
              : 'Train your cyber defense reflexes! Analyze realistic SMS & emails, watch SentryAIs 7-Layer scan execute in real-time, and test if you can classify threats accurately.'
            }
          </p>
        </div>

        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'} min-w-[240px] justify-between`}>
          <div>
            <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest block`}>
              {isRTL ? 'مجموع النقاط' : 'Score Achieved'}
            </span>
            <span className="text-2xl font-black text-cyan-400 tracking-tight flex items-center gap-1.5">
              <Trophy className="w-5 h-5" /> {score} XP
            </span>
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest block`}>
              {isRTL ? 'الرتبة الحالية' : 'Current Badge'}
            </span>
            <span className={`text-xs font-black ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
              {getBadgeTitle(score)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scenario Terminal */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-3xl border overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-[#0E1012] border-white/10' : 'bg-white border-slate-200'}`}>
            {/* Terminal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className={`text-[11px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest ml-2`}>
                  {isRTL ? `محاكاة السيناريو الأمني (${currentIdx + 1}/${ACADEMY_SCENARIOS.length})` : `Scenario Box (${currentIdx + 1}/${ACADEMY_SCENARIOS.length})`}
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-0.5 rounded-md uppercase">
                {isRTL ? 'محاكي حي' : 'Interactive Sandbox'}
              </span>
            </div>

            {/* Email/SMS Visual Container */}
            <div className="p-8 space-y-6">
              {/* Message Metadata Header */}
              <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'} space-y-2`}>
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest`}>
                    {isRTL ? 'المرسل:' : 'Sender:'}
                  </span>
                  <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                    {isRTL ? currentScenario.senderAr : currentScenario.senderEn}
                  </span>
                </div>
                <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest`}>
                    {isRTL ? 'الموضوع:' : 'Subject:'}
                  </span>
                  <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white/90' : 'text-slate-800'}`}>
                    {isRTL ? currentScenario.titleAr : currentScenario.titleEn}
                  </span>
                </div>
              </div>

              {/* Message Body Content */}
              <div className={`p-6 rounded-2xl border-l-4 border-cyan-400 leading-relaxed font-sans text-lg ${theme === 'dark' ? 'bg-[#121417]/30 text-white/90' : 'bg-slate-50/50 text-slate-800'}`}>
                {isRTL ? currentScenario.bodyAr : currentScenario.bodyEn}
              </div>

              {/* Action Simulator buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleSimulateScan}
                  disabled={isScanned}
                  className="flex-1 flex items-center justify-center gap-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:bg-white/[0.03] disabled:text-white/20 disabled:border-white/5 disabled:shadow-none border border-transparent text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] text-sm uppercase tracking-wider"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanned ? '' : 'animate-spin'}`} />
                  {isRTL ? 'تشغيل فحص الطبقات السبع المحاكي' : 'Run Simulated 7-Layer Scan'}
                </button>
              </div>
            </div>
          </div>

          {/* Expanded simulated 7-layer visualizer */}
          <AnimatePresence>
            {isScanned && scannedLayers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-3xl border border-white/10 overflow-hidden"
              >
                <SevenLayerVisualizer 
                  sevenLayers={scannedLayers} 
                  language={language} 
                  theme={theme} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Evaluation and Learning Panel */}
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between min-h-[420px] ${theme === 'dark' ? 'bg-[#0E1012] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
                <Brain className="w-5 h-5 text-cyan-400" />
                <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {isRTL ? 'التقييم والقرار الدفاعي' : 'Defensive Judgment'}
                </h3>
              </div>

              {!showFeedback ? (
                <div className="space-y-4">
                  <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                    {isRTL 
                      ? 'بناءً على فحوصات الأمان أعلاه والقرائن المستخلصة، ما هو تصنيفك الأمني الصحيح لهذه الرسالة؟' 
                      : 'Based on your visual inspection and the 7-layer telemetry diagnostics above, what is the correct verdict?'}
                  </p>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => handleAnswer('threat')}
                      className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all font-bold ${
                        theme === 'dark' 
                          ? 'bg-red-500/5 hover:bg-red-500/10 border-red-500/10 hover:border-red-500/30 text-red-400' 
                          : 'bg-red-50 hover:bg-red-100 border-red-100 text-red-700'
                      }`}
                    >
                      <span>{isRTL ? 'تهديد / احتيال مشبوه ⚠️' : 'Dangerous Threat / Scam ⚠️'}</span>
                      <ShieldAlert className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleAnswer('safe')}
                      className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all font-bold ${
                        theme === 'dark' 
                          ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/30 text-emerald-400' 
                          : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-700'
                      }`}
                    >
                      <span>{isRTL ? 'آمنة تماماً وموثوقة ✅' : 'Safe / Legitimate Content ✅'}</span>
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                    isCorrect 
                      ? theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      : theme === 'dark' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-700'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 shrink-0 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 shrink-0 text-red-400" />
                    )}
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-wide leading-none mb-1">
                        {isCorrect 
                          ? isRTL ? 'إجابة صحيحة ومتميزة! 🎉' : 'Outstanding! Correct Verdict 🎉'
                          : isRTL ? 'إجابة غير صحيحة ❌' : 'Incorrect Verdict ❌'
                        }
                      </h4>
                      <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">
                        {isCorrect ? '+100 XP Awarded' : 'Analysis Guide Below'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest block`}>
                      {isRTL ? 'لماذا تم هذا التصنيف؟' : 'Forensic Rationale'}
                    </span>
                    <p className={`text-xs leading-relaxed font-medium p-4 rounded-xl border ${theme === 'dark' ? 'bg-white/[0.01] border-white/5 text-white/80' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                      {isRTL ? currentScenario.reasonAr : currentScenario.reasonEn}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest block`}>
                      {isRTL ? 'النوع الدقيق للتهديد:' : 'Identified Vector:'}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      currentScenario.isThreat 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    }`}>
                      {isRTL ? currentScenario.typeAr : currentScenario.type}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {showFeedback && (
              <div className="pt-6 border-t border-white/5 flex gap-4">
                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 px-5 py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-wider"
                >
                  {isRTL ? 'السيناريو التالي' : 'Next Scenario'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick learning tip of the day */}
          <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-gradient-to-r from-cyan-950/20 to-transparent border-cyan-400/10' : 'bg-cyan-50/30 border-cyan-100'}`}>
            <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Star className="w-5 h-5 text-cyan-400 animate-pulse shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                  {isRTL ? 'نصيحة اليوم الأمنية' : 'Security Pro Tip'}
                </h4>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                  {isRTL 
                    ? 'انتبه دائماً للنطاقات الفرعية (Subdomains). أحياناً يضع المخترق اسم ماركة شهيرة كبادئة للرابط مثل: bank.com.hacker.ru لإيهامك بالدخول لموقع البنك بينما النطاق الحقيقي هو hacker.ru!'
                    : 'Always check the domain structure from right to left before clicking. In "chase.com.secured-portal.ru", the actual domain is "secured-portal.ru", NOT "chase.com". This is a sub-domain masking trap.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Reset progression button */}
          {score > 0 && (
            <button
              onClick={handleReset}
              className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-white/20 hover:text-red-400/60' : 'text-slate-400 hover:text-red-600'} transition-colors mx-auto block`}
            >
              {isRTL ? 'إعادة ضبط نقاط ومستويات الأكاديمية' : 'Reset Academy Progression'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
