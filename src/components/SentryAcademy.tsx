import { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  Brain, 
  CheckCircle, 
  HelpCircle, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Trophy, 
  ArrowRight, 
  Play, 
  RefreshCw, 
  Star, 
  Volume2, 
  VolumeX, 
  Printer, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  BookMarked,
  Layers,
  ChevronRight
} from 'lucide-react';
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
      layer7: { status: 'threat', detailsEn: 'Matches high-risk typosquatting patterns in Obitrex threat databases.', detailsAr: 'يطابق أنماط انتحال الهوية عالية الخطورة في قواعد بيانات تهديدات Obitrex.' }
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
      layer7: { status: 'threat', detailsEn: 'Domain registry matches active blacklists in PhishTank and local heuristics.', detailsAr: 'سجل النطاق يطابق القوائم السوداء النشطة في PhishTank والمؤشارات المحلية.' }
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

interface Lesson {
  id: string;
  icon: any;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  conceptEn: string;
  conceptAr: string;
  trickEn: string;
  trickAr: string;
  ruleEn: string;
  ruleAr: string;
  checkpointQEn: string;
  checkpointQAr: string;
  optionsEn: string[];
  optionsAr: string[];
  correctIdx: number;
}

const ACADEMY_LESSONS: Lesson[] = [
  {
    id: 'l1',
    icon: ShieldCheck,
    titleEn: 'Lesson 1: The Urgent Bank Text',
    titleAr: 'الدرس الأول: رسائل البنك العاجلة والذعر',
    summaryEn: 'Scammers pretend to be your bank to scare you into revealing your account passwords.',
    summaryAr: 'يدعي النصابون أنهم من بنكك المالي لتخويفك حتى تكشف عن كلمات مرور حسابك المصرفي.',
    conceptEn: 'Scammers send messages stating your debit card has been suspended or that a fraudulent $1,500 transaction occurred. They provide a link to resolve it.',
    conceptAr: 'يرسل المحتالون رسائل تدعي تجميد بطاقتك أو إجراء تحويل مشبوه بمبلغ كبير، ويضعون رابطاً يزعمون أنه لحل المشكلة فوراً.',
    trickEn: 'They use emotional panic to bypass your logical defense. The linked page looks identical to Chase or Wells Fargo, but collects your login credentials.',
    trickAr: 'يستخدمون ذعر تجميد الأموال لتعطيل تفكيرك المنطقي. والصفحة المرتبطة بالرابط تطابق موقع البنك تماماً لسرقة اسم المستخدم وكلمة المرور.',
    ruleEn: 'REAL BANKS will never send text links to unlock cards. If you feel suspicious, ignore the message and call the number printed directly on the back of your physical plastic bank card!',
    ruleAr: 'البنوك الحقيقية لا ترسل أبداً روابط نصية لفك حظر البطاقات. إذا شعرت بالشك، تجاهل الرسالة واتصل بالرقم المطبوع مباشرة خلف بطاقتك البنكية البلاستيكية!',
    checkpointQEn: 'You receive a text stating "Your bank card is frozen. Verify immediately at verify-chase.com". What is the safest action?',
    checkpointQAr: 'وصلتك رسالة نصية تقول "تم تجميد بطاقتك المصرفية. تحقق فوراً عبر verify-chase.com". ما هو الإجراء الأكثر أماناً؟',
    optionsEn: [
      'Click the link immediately to prevent permanent locking of your card.',
      'Delete the text, look up your bank official phone number, or dial the phone number on the back of your bank card.'
    ],
    optionsAr: [
      'الضغط على الرابط فوراً لتفادي إغلاق البطاقة بشكل نهائي.',
      'حذف الرسالة، والاتصال بالرقم الرسمي للبنك أو الرقم المكتوب خلف بطاقتك البنكية الشخصية.'
    ],
    correctIdx: 1
  },
  {
    id: 'l2',
    icon: Volume2,
    titleEn: 'Lesson 2: AI Voice Cloning',
    titleAr: 'الدرس الثاني: انتحال الصوت بالذكاء الاصطناعي',
    summaryEn: 'Scammers copy a loved one\'s voice to call you demanding quick financial aid.',
    summaryAr: 'يقوم النصابون بنسخ نبرة صوت أحد أقاربك والاتصال بك مدعين حاجتهم الماسة للمساعدة المالية السريعة.',
    conceptEn: 'By recording just 3 seconds of your grandchild or relative speaking from a video online, scammers can type any text and generate a highly realistic voice.',
    conceptAr: 'من خلال تسجيل 3 ثوانٍ فقط من صوت حفيدك أو قريبك من أي فيديو على الإنترنت، يمكن للمحتالين توليد صوت مطابق له تماماً ليتحدث بما يريدون.',
    trickEn: 'They create extreme emergencies—claiming they are in jail, got into a major accident, or lost their passport—and demand cash, wire transfers, or gift cards.',
    trickAr: 'يصنعون قصصاً طارئة وقاسية: مثل التعرض لحادث سير، أو الاحتجاز، ويطالبون بأموال نقدية أو بطاقات هدايا فورية لمنع تفاقم المشكلة.',
    ruleEn: 'Never send money based purely on a voice call. Hang up and dial your family member directly on their normal known mobile number, or set a secret Family Safe Word only you share.',
    ruleAr: 'لا ترسل المال أبداً بناءً على مكالمة صوتية فقط. أغلق الخط واتصل بقريبك مباشرة على رقمه المعتاد، أو اتفقوا على "كلمة سر عائلية" للتحقق عند الشك.',
    checkpointQEn: 'Someone calls sounding exactly like your granddaughter, crying that she was arrested and needs $1,000 sent via digital gift cards. What is your response?',
    checkpointQAr: 'اتصل بك شخص صوته يطابق صوت حفيدتك تماماً، وتبكي مدعية أنه تم إيقافها وتطلب $1,000 عبر بطاقات هدايا. ما هي ردة فعلك؟',
    optionsEn: [
      'Hang up immediately, call your granddaughter directly, or text her parents to verify where she is.',
      'Hurry to the nearest store to purchase the digital gift cards before she gets into more trouble.'
    ],
    optionsAr: [
      'إغلاق الهاتف فوراً، والاتصال بحفيدتك مباشرة أو مراسلة والديها للتحقق من مكانها الحقيقي.',
      'الإسراع لأقرب متجر لشراء بطاقات الهدايا المطلوبة قبل أن يزداد مأزقها.'
    ],
    correctIdx: 0
  },
  {
    id: 'l3',
    icon: Layers,
    titleEn: 'Lesson 3: Package Delivery Surcharges',
    titleAr: 'الدرس الثالث: رسوم الشحن الجمركية الضئيلة',
    summaryEn: 'Scammers claim a package is held for a tiny $1.50 fee to steal your credit card numbers.',
    summaryAr: 'يدعي النصابون أن هناك شحنة باسمك معلقة مقابل رسوم بسيطة تبلغ $1.50 لسرقة أرقام بطاقاتك الائتمانية.',
    conceptEn: 'You receive a text stating DHL, USPS, or FedEx has a package waiting for you, but there is a pending customs payment or address correction required.',
    conceptAr: 'تصلك رسالة نصية تدعي أن هناك شحنة باسمك معلقة لدى البريد أو DHL وتحتاج لدفع رسوم جمركية بسيطة أو تعديل عنوان التسليم.',
    trickEn: 'Because the amount requested is small (like $1.50 or $2.00), seniors assume it is low-risk. But entering your details on their fake portal hands your physical billing card directly to bad actors.',
    trickAr: 'لأن المبلغ المطلوب صغير جداً (مثل دولار ونصف)، يعتقد كبار السن أن الأمر آمن. لكن إدخال بيانات بطاقتك يمنح النصابين تحكماً كاملاً لسحب آلاف الدولارات.',
    ruleEn: 'If you did not order anything, ignore it completely. Real delivery organizations never demand digital currency payments or host tracking portals on random non-official web domains.',
    ruleAr: 'إذا لم تقم بطلب أي شحنة، فتجاهل الرسالة تماماً. شركات الشحن الرسمية لا تطلب أبداً دفع مبالغ عبر روابط نصية عشوائية أو نطاقات غير رسمية.',
    checkpointQEn: 'A text says "Your DHL delivery is on hold. Pay $1.20 to release." You did not order any package. What should you do?',
    checkpointQAr: 'رسالة نصية تقول: "شحنتك معلقة، ادفع $1.20 للإفراج عنها". لم تطلب أي شحنة مؤخراً. ماذا تفعل؟',
    optionsEn: [
      'Pay the $1.20 since it is such a small amount and you do not want to miss a potential gift.',
      'Ignore or delete the text. It is a scam designed to harvest your credit card details.'
    ],
    optionsAr: [
      'دفع المبلغ ($1.20) لأنه بسيط جداً ولا تريد تفويت أي هدية محتملة قد تكون مرسلة لك.',
      'تجاهل الرسالة أو حذفها نهائياً. إنها حيلة احتيالية لسرقة تفاصيل بطاقتك الائتمانية.'
    ],
    correctIdx: 1
  },
  {
    id: 'l4',
    icon: Shield,
    titleEn: 'Lesson 4: QR Code Safety',
    titleAr: 'الدرس الرابع: احتيال رموز الاستجابة السريعة (QR)',
    summaryEn: 'Fake QR codes on parking meters and flyers can redirect you to billing scams.',
    summaryAr: 'ملصقات رموز QR المزيفة على عدادات المواقف والملصقات توجهك لصفحات دفع وهمية.',
    conceptEn: 'Scammers print malicious QR codes on physical stickers and paste them directly over real payment options on parking meters, public tables, or utility flyers.',
    conceptAr: 'يقوم النصابون بطباعة رموز QR خبيثة على ملصقات، ويلصقونها فوق خيارات الدفع الحقيقية في عدادات مواقف السيارات أو لوائح الشوارع.',
    trickEn: 'Scanning the QR code opens a fake browser window that charges a "parking fee" or promises a "Senior Discount," stealing your digital wallet credentials.',
    trickAr: 'مسح الرمز يفتح متصفحاً يعرض صفحة دفع وهمية لرسوم الموقف أو يعد بخصم خاص لكبار السن، لسرقة معلومات بطاقتك الائتمانية.',
    ruleEn: 'Avoid scanning random QR codes in physical environments or inside unsolicited emails. Always pay using standard cash, credit card slots, or official city apps.',
    ruleAr: 'تجنب مسح أي رموز QR عشوائية في الأماكن العامة أو الرسائل المجهولة. ادفع دائماً بالطريقة التقليدية بالبطاقة أو النقد أو تطبيق البلدية الرسمي.',
    checkpointQEn: 'You see a paper sticker on a parking meter that says "Scan QR Code to Pay for Parking". What is the safest course?',
    checkpointQAr: 'وجدت ملصقاً ورقياً على عداد الموقف يقول "امسح رمز QR لدفع رسوم الموقف". ما هو الخيار الآمن؟',
    optionsEn: [
      'Scan the QR code and pay. It is fast and convenient.',
      'Pay directly at the physical machine with coins or your plastic card, avoiding the physical sticker.'
    ],
    optionsAr: [
      'مسح الكود والدفع من خلاله نظراً لسهولته وسرعته.',
      'الدفع مباشرة عبر الآلة المادية باستخدام العملات المعدنية أو البطاقة البلاستيكية، وتجنب الملصق الورقي.'
    ],
    correctIdx: 1
  }
];

interface LatestScam {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  severity: 'Critical' | 'High' | 'Medium';
  year: string;
}

const LATEST_SCAMS_2026: LatestScam[] = [
  {
    id: 's1',
    titleEn: 'AI Family Emergency Cloning',
    titleAr: 'انتحال أصوات العائلة بالذكاء الاصطناعي',
    descEn: 'Extremely high risk. Scammers clone the voice of your child or grandchild from social media to demand immediate wire payments or cash under the guise of an emergency arrest or medical trauma.',
    descAr: 'خطورة قصوى. يقوم النصابون بتقليد صوت ابنك أو حفيدك بدقة عالية لطلب تحويلات مالية فورية بحجة التعرض لحادث سير أو توقيف شرطة مفاجئ.',
    severity: 'Critical',
    year: '2026 Active'
  },
  {
    id: 's2',
    titleEn: 'Toll Road Payment Text Traps (Smishing)',
    titleAr: 'رسائل رسوم الطرق والمخالفات المرورية',
    descEn: 'Scammers send urgent texts pretending to be toll operators (like SunPass, EZ-Pass) claiming you have an unpaid toll bill of $4.50, warning of a $50 fine. The link harvests card numbers.',
    descAr: 'رسائل نصية مستعجلة تدعي أنها من هيئة الطرق السريعة تخبرك بوجود مخالفة بقيمة 4.50 دولار مع التحذير من غرامة 50 دولار. الرابط المرفق يسرق حسابك البنكي.',
    severity: 'High',
    year: '2026 Active'
  },
  {
    id: 's3',
    titleEn: 'Quishing (QR Code Phishing)',
    titleAr: 'احتيال رموز QR في المواقف العامة',
    descEn: 'Pasting malicious QR codes over physical parking meters, or sending emails with QR codes instead of links to bypass email security filter scanning.',
    descAr: 'إلصاق رموز استجابة سريعة خبيثة فوق عدادات المواقف في الشوارع، أو إرسال صور QR في البريد بدلاً من الروابط لتجاوز فحص فلاتر الأمان.',
    severity: 'Medium',
    year: '2026 Active'
  },
  {
    id: 's4',
    titleEn: 'Government Agent & SSA Threats',
    titleAr: 'انتحال صفة موظفي التأمينات والجهات الحكومية',
    descEn: 'Phone calls or texts claiming your Social Security Number or national ID is suspended due to fraud. They order you to buy gift cards or bitcoin to secure your funds.',
    descAr: 'اتصالات هاتفية تدعي أنها من جهات التأمينات الاجتماعية أو الشرطة لتعليق رقمك القومي بسبب جرائم وهمية، ويطلبون سحب أموالك فوراً وتحويلها لحسابات أمان زافية.',
    severity: 'Critical',
    year: '2026 Active'
  }
];

interface ObitrexAcademyProps {
  language: string;
  theme: 'light' | 'dark';
}

export function ObitrexAcademy({ language, theme }: ObitrexAcademyProps) {
  const isRTL = language === 'Arabic';
  
  // Tab states: 'lessons' | 'quizzes' | 'latest' | 'certificate'
  const [activeSubTab, setActiveSubTab] = useState<'lessons' | 'quizzes' | 'latest' | 'certificate'>('lessons');

  // Score and level state
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem('sentry_academy_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Lessons Progression
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number>(0);
  const [lessonAnswers, setLessonAnswers] = useState<Record<string, number>>({});
  const [lessonFeedback, setLessonFeedback] = useState<Record<string, boolean>>({});
  const [lessonAudioPlaying, setLessonAudioPlaying] = useState<boolean>(false);

  // Quiz Scenarios States
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState<number>(0);
  const [userSelection, setUserSelection] = useState<'safe' | 'threat' | null>(null);
  const [isScanned, setIsScanned] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [scannedLayers, setScannedLayers] = useState<any | null>(null);

  // Certificate Name state
  const [certificateName, setCertificateName] = useState<string>(() => {
    return localStorage.getItem('sentry_certificate_student_name') || 'George Obitrex';
  });

  useEffect(() => {
    localStorage.setItem('sentry_academy_score', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('sentry_certificate_student_name', certificateName);
  }, [certificateName]);

  const currentScenario = ACADEMY_SCENARIOS[currentScenarioIdx];
  const currentLesson = ACADEMY_LESSONS[selectedLessonIdx];

  // Sound/Speech Cancel on tab shift
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setLessonAudioPlaying(false);
  }, [activeSubTab, selectedLessonIdx]);

  // Read Lesson Out Loud
  const toggleReadAloud = (textToRead: string) => {
    if ('speechSynthesis' in window) {
      if (lessonAudioPlaying) {
        window.speechSynthesis.cancel();
        setLessonAudioPlaying(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = isRTL ? 'ar-SA' : 'en-US';
      utterance.rate = 0.85; // slower rate for seniors
      utterance.onend = () => setLessonAudioPlaying(false);
      utterance.onerror = () => setLessonAudioPlaying(false);
      setLessonAudioPlaying(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert(isRTL ? 'ميزة قراءة النصوص غير مدعومة في متصفحك.' : 'Text-to-speech is not supported on your browser.');
    }
  };

  // Lesson Checkpoint submission
  const handleLessonAnswerSubmit = (optionIdx: number) => {
    if (lessonFeedback[currentLesson.id] !== undefined) return;

    const isOptionCorrect = optionIdx === currentLesson.correctIdx;
    setLessonAnswers(prev => ({ ...prev, [currentLesson.id]: optionIdx }));
    setLessonFeedback(prev => ({ ...prev, [currentLesson.id]: isOptionCorrect }));

    if (isOptionCorrect) {
      setScore(prev => prev + 50); // award 50 XP
    }
  };

  // Play scenario simulator scan
  const handleSimulateScan = () => {
    if (isScanned) return;
    
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

  // Scenario decision verdict submission
  const handleAnswer = (choice: 'safe' | 'threat') => {
    if (showFeedback) return;
    
    setUserSelection(choice);
    const correctAns = currentScenario.isThreat ? 'threat' : 'safe';
    const isUserCorrect = choice === correctAns;
    
    setIsCorrect(isUserCorrect);
    if (isUserCorrect) {
      setScore(prev => prev + 100); // 100 XP
    }
    
    setShowFeedback(true);
  };

  const handleNextScenario = () => {
    setUserSelection(null);
    setIsScanned(false);
    setShowFeedback(false);
    setScannedLayers(null);
    setCurrentScenarioIdx((prev) => (prev + 1) % ACADEMY_SCENARIOS.length);
  };

  const handleReset = () => {
    setScore(0);
    setCurrentScenarioIdx(0);
    setSelectedLessonIdx(0);
    setUserSelection(null);
    setIsScanned(false);
    setShowFeedback(false);
    setScannedLayers(null);
    setLessonAnswers({});
    setLessonFeedback({});
    localStorage.removeItem('sentry_academy_score');
  };

  const getBadgeTitle = (s: number) => {
    if (s >= 500) return isRTL ? 'حارس سيبراني معتمد' : 'Certified Security Expert';
    if (s >= 300) return isRTL ? 'مدافع عائلي متقدم' : 'Advanced Family Defender';
    if (s >= 100) return isRTL ? 'حارس مبتدئ' : 'Obitrex Cadet';
    return isRTL ? 'مستجد أمني' : 'Security Recruit';
  };

  // Print function for certificate
  const handlePrintCertificate = () => {
    window.print();
  };

  const currentLevelBadge = getBadgeTitle(score);
  const isCertificateUnlocked = score >= 400;

  return (
    <div className={`space-y-8 max-w-6xl mx-auto py-2 ${isRTL ? 'font-cairo text-right' : 'font-sans text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Academy Core Header Dashboard */}
      <div className={`p-8 rounded-[32px] relative overflow-hidden border ${theme === 'dark' ? 'bg-gradient-to-br from-[#0D0F12] to-[#12161D] border-white/5' : 'bg-white border-slate-200'} shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl">
              <Award className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
                {isRTL ? 'أكاديمية مكافحة الاحتيال لكبار السن' : 'SENIOR SCAM ACADEMY'}
              </span>
              <h2 className={`text-2xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {isRTL ? 'مركز التدريب والدفاع الرقمي' : 'Obitrex Academy'}
              </h2>
            </div>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'} max-w-xl leading-relaxed`}>
            {isRTL 
              ? 'أكاديمية تفاعلية ميسّرة لكبار السن لتعلم كشف محاولات الاحتيال وتجنبها بسهولة. تصفح الدروس البسيطة، تدرب على كشف التهديدات، واحصل على شهادة حارس الأمان المعتمد.'
              : 'Senior-friendly learning center. Study simple lessons, test your cyber defensive reflexes in realistic simulator quizzes, and earn an official printable certificate.'
            }
          </p>
        </div>

        {/* XP Progress Indicator Card */}
        <div className={`flex items-center gap-4 p-5 rounded-2xl border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'} min-w-[260px] justify-between relative z-10`}>
          <div>
            <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest block`}>
              {isRTL ? 'نقاط الخبرة' : 'My Progress'}
            </span>
            <span className="text-3xl font-black text-cyan-400 tracking-tight flex items-center gap-1.5">
              <Trophy className="w-6 h-6 shrink-0" /> {score} XP
            </span>
          </div>
          <div className="text-right border-l border-white/5 pl-4">
            <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest block`}>
              {isRTL ? 'الرتبة الأمنية' : 'Academy Badge'}
            </span>
            <span className={`text-xs font-black ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
              {currentLevelBadge}
            </span>
          </div>
        </div>
      </div>

      {/* Obitrex Academy Sub Tabs navigation bar */}
      <div className="flex flex-wrap items-center bg-white/5 border border-white/5 p-1 rounded-2xl gap-1 max-w-md md:max-w-xl">
        {[
          { id: 'lessons', label: isRTL ? 'الدروس التعليمية 📚' : 'Lessons 📚', icon: BookOpen },
          { id: 'quizzes', label: isRTL ? 'اختبار السيناريوهات 🧠' : 'Practice Quizzes 🧠', icon: Brain },
          { id: 'latest', label: isRTL ? 'أحدث أساليب الاحتيال 🚨' : 'Latest Scams 🚨', icon: ShieldAlert },
          { id: 'certificate', label: isRTL ? 'شهادتي المعتمدة 🎓' : 'My Certificate 🎓', icon: Award }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all min-w-[130px] ${
                activeSubTab === tab.id 
                ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-500/10 font-black' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <TabIcon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body rendering */}
      <AnimatePresence mode="wait">
        
        {/* ===================== TAB 1: LESSONS HUB ===================== */}
        {activeSubTab === 'lessons' && (
          <motion.div
            key="lessons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left sidebar lessons selector (Large targets for seniors) */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                {isRTL ? 'دروس الحماية البسيطة' : 'SELECT SCAM LESSON'}
              </span>
              <div className="space-y-2">
                {ACADEMY_LESSONS.map((lesson, idx) => {
                  const LessonIcon = lesson.icon;
                  const isAnswered = lessonAnswers[lesson.id] !== undefined;
                  const isCorrectAnswer = lessonFeedback[lesson.id] === true;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLessonIdx(idx)}
                      className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between gap-4 group ${
                        idx === selectedLessonIdx 
                        ? 'bg-cyan-400/10 border-cyan-400 text-white shadow-xl shadow-cyan-400/5' 
                        : 'bg-[#0D0F12] border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                      } ${isRTL ? 'text-right flex-row-reverse' : ''}`}
                    >
                      <div className={`flex items-center gap-3.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          idx === selectedLessonIdx 
                          ? 'bg-cyan-400 text-black' 
                          : 'bg-white/5 text-cyan-400'
                        }`}>
                          <LessonIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-tight leading-none text-white">
                            {isRTL ? lesson.titleAr.split(':')[1] || lesson.titleAr : lesson.titleEn.split(':')[1] || lesson.titleEn}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                            {isRTL ? 'مكافحة النصب' : 'Anti-Scam Concept'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Completion status icon */}
                      {isAnswered ? (
                        <span className={`p-1 rounded-full shrink-0 ${isCorrectAnswer ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Reset state helper */}
              <div className="p-5 bg-gradient-to-r from-cyan-950/20 to-transparent border border-cyan-400/10 rounded-2xl space-y-1 mt-4">
                <h5 className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                  {isRTL ? '💡 نقاط مخصصة لكبار السن' : '💡 Senior-Friendly Safety'}
                </h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isRTL 
                    ? 'استخدم أزرار القراءة الصوتية للاستماع للدروس. النصوص واضحة وبسيطة لمساعدتك على الحماية الذاتية.'
                    : 'Turn on the Read Aloud voice tool to hear lessons. Our larger font ensures a stress-free reading experience.'}
                </p>
              </div>
            </div>

            {/* Right main lesson view (High Contrast, Massive readable text) */}
            <div className="lg:col-span-2 space-y-6">
              <div className={`rounded-3xl border p-8 space-y-6 shadow-2xl ${theme === 'dark' ? 'bg-[#0E1012] border-white/10' : 'bg-white border-slate-200'}`}>
                
                {/* Lesson Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                      {isRTL ? 'درس الأمان التفاعلي' : 'INTERACTIVE EDUCATION MODULE'}
                    </span>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                      {isRTL ? currentLesson.titleAr : currentLesson.titleEn}
                    </h3>
                  </div>

                  {/* READ ALOUD VOICE ASSISTANT */}
                  <button
                    onClick={() => toggleReadAloud(isRTL 
                      ? `${currentLesson.titleAr}. ${currentLesson.conceptAr}. الأسلوب الخبيث المستخدم: ${currentLesson.trickAr}. قاعدة الحماية الذهبية: ${currentLesson.ruleAr}` 
                      : `${currentLesson.titleEn}. ${currentLesson.conceptEn}. How it works: ${currentLesson.trickEn}. Obitrex golden rule: ${currentLesson.ruleEn}`
                    )}
                    className={`px-5 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2.5 self-start ${
                      lessonAudioPlaying 
                      ? 'bg-cyan-400 text-black border-cyan-400 animate-pulse font-black shadow-lg shadow-cyan-400/20' 
                      : 'bg-white/5 border-white/5 text-cyan-400 hover:border-cyan-400/20 hover:text-white'
                    }`}
                  >
                    {lessonAudioPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{lessonAudioPlaying ? (isRTL ? 'إيقاف المساعد الصوتي ⏹️' : 'STOP VOICE ASSISTANT ⏹️') : (isRTL ? '🎙️ قراءة الدرس بصوت عالٍ' : '🎙️ READ ALOUD FOR ME')}</span>
                  </button>
                </div>

                {/* Animated Speech waves if audio playing */}
                {lessonAudioPlaying && (
                  <div className="flex items-center gap-1.5 p-3.5 bg-cyan-950/30 border border-cyan-400/10 text-cyan-400 text-xs font-mono rounded-xl">
                    <div className="flex gap-1">
                      <span className="w-1 h-3 bg-cyan-400 rounded animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1 h-4 bg-cyan-400 rounded animate-bounce" style={{ animationDelay: '0.3s' }} />
                      <span className="w-1 h-2 bg-cyan-400 rounded animate-bounce" style={{ animationDelay: '0.5s' }} />
                      <span className="w-1 h-3.5 bg-cyan-400 rounded animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span>{isRTL ? 'جاري القراءة الصوتية الميسّرة للدرس ببطء...' : 'Obitrex Senior Companion speaking...' }</span>
                  </div>
                )}

                {/* Main Lesson Body with Huge typography */}
                <div className="space-y-6">
                  {/* Summary Callout */}
                  <p className="text-lg font-bold text-cyan-300 leading-relaxed italic bg-cyan-950/10 p-5 rounded-2xl border-l-4 border-cyan-400">
                    "{isRTL ? currentLesson.summaryAr : currentLesson.summaryEn}"
                  </p>

                  {/* Section 1: Concept */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                      {isRTL ? 'ما هو هذا الأسلوب الاحتيالي؟' : '1. THE SCAM PATTERN'}
                    </span>
                    <p className="text-base text-slate-200 leading-relaxed font-semibold">
                      {isRTL ? currentLesson.conceptAr : currentLesson.conceptEn}
                    </p>
                  </div>

                  {/* Section 2: Trick */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block font-black">
                      ⚠️ {isRTL ? 'كيف يقوم النصابون بخداعك؟' : '2. HOW THE TRICK WORKS'}
                    </span>
                    <p className="text-base text-slate-300 leading-relaxed font-semibold">
                      {isRTL ? currentLesson.trickAr : currentLesson.trickEn}
                    </p>
                  </div>

                  {/* Section 3: Golden Safety Rule */}
                  <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-black flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> {isRTL ? 'قاعدة الأمان الذهبية لكبار السن' : '3. Obitrex GOLDEN SAFETY RULE'}
                    </span>
                    <p className="text-base text-slate-200 leading-relaxed font-bold">
                      {isRTL ? currentLesson.ruleAr : currentLesson.ruleEn}
                    </p>
                  </div>
                </div>

                {/* Checkpoint Validation Quiz Question */}
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Brain className="w-5 h-5 shrink-0" />
                    <h4 className="text-xs font-black uppercase tracking-[0.15em]">
                      {isRTL ? 'سؤال التحقق: قيم قرارك الدفاعي' : 'LESSON CHECKPOINT: TEST YOUR JUDGMENT'}
                    </h4>
                  </div>

                  <p className="text-sm font-bold text-white leading-relaxed">
                    {isRTL ? currentLesson.checkpointQAr : currentLesson.checkpointQEn}
                  </p>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    { (isRTL ? currentLesson.optionsAr : currentLesson.optionsEn).map((option, oIdx) => {
                      const isAnswered = lessonAnswers[currentLesson.id] !== undefined;
                      const userAnsIdx = lessonAnswers[currentLesson.id];
                      const isOptionSelected = userAnsIdx === oIdx;
                      const isCorrectOption = oIdx === currentLesson.correctIdx;

                      let btnStyle = 'bg-[#0D0F12] border-white/5 text-slate-300 hover:border-cyan-400/20';
                      if (isAnswered) {
                        if (isCorrectOption) {
                          btnStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold';
                        } else if (isOptionSelected) {
                          btnStyle = 'bg-red-500/10 border-red-500/30 text-red-400';
                        } else {
                          btnStyle = 'bg-[#0D0F12]/50 border-white/5 text-slate-500 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isAnswered}
                          onClick={() => handleLessonAnswerSubmit(oIdx)}
                          className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-start gap-3 ${btnStyle} ${isRTL ? 'text-right' : ''}`}
                        >
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5 ${
                            isAnswered && isCorrectOption 
                            ? 'bg-emerald-500 text-black border-transparent' 
                            : isOptionSelected && !isCorrectOption 
                            ? 'bg-red-500 text-white border-transparent'
                            : 'border-white/20'
                          }`}>
                            {oIdx === 0 ? 'A' : 'B'}
                          </span>
                          <span className="font-semibold leading-snug">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Checkpoint feedback banner */}
                  {lessonAnswers[currentLesson.id] !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border flex items-center gap-3 ${
                        lessonFeedback[currentLesson.id]
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}
                    >
                      {lessonFeedback[currentLesson.id] ? (
                        <>
                          <CheckCircle className="w-5 h-5 shrink-0" />
                          <div className="text-xs">
                            <span className="font-black uppercase tracking-wider block">{isRTL ? 'أحسنت! إجابة صحيحة بالكامل 🎉' : 'OUTSTANDING! CORRECT RESPONSE 🎉'}</span>
                            <span className="font-mono text-[9px] opacity-80">{isRTL ? '+50 نقطة خبرة أضيفت لرصيدك' : '+50 XP Awarded to your progress'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-5 h-5 shrink-0" />
                          <div className="text-xs">
                            <span className="font-black uppercase tracking-wider block">{isRTL ? 'إجابة غير دقيقة ❌' : 'INCORRECT VERDICT ❌'}</span>
                            <p className="font-medium text-slate-300 mt-1">
                              {isRTL 
                                ? `قاعدة الأمان الصحيحة هي: ${currentLesson.ruleAr}` 
                                : `The correct guideline is: ${currentLesson.ruleEn}`}
                            </p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== TAB 2: INTERACTIVE SCENARIOS QUIZ ===================== */}
        {activeSubTab === 'quizzes' && (
          <motion.div
            key="quizzes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Scenario Terminal */}
            <div className="lg:col-span-2 space-y-6">
              <div className={`rounded-[32px] border overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-[#0E1012] border-white/10' : 'bg-white border-slate-200'}`}>
                {/* Terminal Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className={`text-[11px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest ml-2`}>
                      {isRTL ? `محاكاة واختبار التهديدات (${currentScenarioIdx + 1}/${ACADEMY_SCENARIOS.length})` : `SCENARIO THREAT FORENSICS (${currentScenarioIdx + 1}/${ACADEMY_SCENARIOS.length})`}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-0.5 rounded-md uppercase font-black">
                    {isRTL ? 'درع المحاكاة' : 'Simulator'}
                  </span>
                </div>

                {/* Email/SMS Visual Container */}
                <div className="p-8 space-y-6">
                  {/* Message Metadata Header */}
                  <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'} space-y-3`}>
                    <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest`}>
                        {isRTL ? 'اسم المرسل الرقمي:' : 'Sender Address:'}
                      </span>
                      <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-400/5 px-2.5 py-1 rounded border border-cyan-400/15">
                        {isRTL ? currentScenario.senderAr : currentScenario.senderEn}
                      </span>
                    </div>
                    <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest`}>
                        {isRTL ? 'موضوع الرسالة:' : 'Subject Header:'}
                      </span>
                      <span className={`text-xs font-black ${theme === 'dark' ? 'text-white/90' : 'text-slate-800'}`}>
                        {isRTL ? currentScenario.titleAr : currentScenario.titleEn}
                      </span>
                    </div>
                  </div>

                  {/* Message Body Content */}
                  <div className={`p-6 rounded-2xl border-l-4 border-cyan-400 leading-relaxed font-sans text-xl ${theme === 'dark' ? 'bg-[#121417]/40 text-white/90 shadow-inner' : 'bg-slate-50/50 text-slate-800'}`}>
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
                      {isRTL ? 'تشغيل فحص الأمان ذو الطبقات السبع المحاكي 📡' : 'Run Simulated 7-Layer Security Scan 📡'}
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
              <div className={`p-6 rounded-[32px] border shadow-xl flex flex-col justify-between min-h-[440px] ${theme === 'dark' ? 'bg-[#0E1012] border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="space-y-6">
                  <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
                    <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {isRTL ? 'التقييم والقرار الدفاعي' : 'Defensive Judgment'}
                    </h3>
                  </div>

                  {!showFeedback ? (
                    <div className="space-y-4">
                      <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'} font-semibold`}>
                        {isRTL 
                          ? 'بناءً على الدروس السابقة ومؤشرات فحص درع الأمان أعلاه، ما هو قرارك النهائي للتعامل مع هذه الرسالة؟' 
                          : 'Evaluate this message. Use the 7-layer scan diagnostics above to support your final verdict. Is this a safe message or a threat?'}
                      </p>

                      <div className="space-y-3 pt-2">
                        <button
                          onClick={() => handleAnswer('threat')}
                          className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all font-black text-sm uppercase tracking-wider ${
                            theme === 'dark' 
                              ? 'bg-red-500/5 hover:bg-red-500/10 border-red-500/10 hover:border-red-500/30 text-red-400 shadow-md' 
                              : 'bg-red-50 hover:bg-red-100 border-red-100 text-red-700'
                          }`}
                        >
                          <span>{isRTL ? 'تهديد / احتيال مشبوه ⚠️' : 'Dangerous Threat / Scam ⚠️'}</span>
                          <ShieldAlert className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleAnswer('safe')}
                          className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all font-black text-sm uppercase tracking-wider ${
                            theme === 'dark' 
                              ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/30 text-emerald-400 shadow-md' 
                              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-700'
                          }`}
                        >
                          <span>{isRTL ? 'آمنة تماماً وموثوقة ✅' : 'Safe / Legitimate Content ✅'}</span>
                          <ShieldCheck className="w-5 h-5" />
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
                              ? isRTL ? 'قرار حكيم! إجابة صحيحة 🎉' : 'Outstanding! Correct Verdict 🎉'
                              : isRTL ? 'قرار غير صحيح ❌' : 'Incorrect Verdict ❌'
                            }
                          </h4>
                          <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest block mt-0.5 font-bold">
                            {isCorrect ? '+100 XP Earned!' : 'Read Analysis Below'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest block`}>
                          {isRTL ? 'التحليل والقرينة الأمنية:' : 'Forensic Rationale'}
                        </span>
                        <p className={`text-xs leading-relaxed font-bold p-4 rounded-xl border ${theme === 'dark' ? 'bg-white/[0.01] border-white/5 text-white/80' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                          {isRTL ? currentScenario.reasonAr : currentScenario.reasonEn}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-widest block`}>
                          {isRTL ? 'نوع التهديد الأمني:' : 'Identified Vector:'}
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
                  <div className="pt-6 border-t border-white/5 flex gap-4 mt-6">
                    <button
                      onClick={handleNextScenario}
                      className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 px-5 py-4 rounded-xl font-bold transition-all text-xs uppercase tracking-wider active:scale-95"
                    >
                      {isRTL ? 'السيناريو التالي' : 'Next Scenario'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Reset progression button */}
              {score > 0 && (
                <button
                  onClick={handleReset}
                  className={`text-[10px] font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-white/20 hover:text-red-400/60' : 'text-slate-400 hover:text-red-600'} transition-colors mx-auto block pt-2`}
                >
                  {isRTL ? 'إعادة ضبط التقدم في الأكاديمية' : 'Reset Academy Progress'}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ===================== TAB 3: LATEST SCAMS ===================== */}
        {activeSubTab === 'latest' && (
          <motion.div
            key="latest"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="border-b border-white/5 pb-4">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                {isRTL ? 'مؤشرات التهديد الحالية' : 'LIVE 2026 CYBER INTELLIGENCE'}
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                {isRTL ? 'أحدث أساليب النصب النشطة حالياً' : 'Latest Scam Techniques Alert Hub'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isRTL 
                  ? 'هذه الأساليب يتم تحديثها تلقائياً بالاعتماد على ذكاء Obitrex وتحليلات التهديدات السيبرانية لحماية عائلتك.'
                  : 'Up-to-the-minute threat vector catalog tracked by Obitrex security analytics.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {LATEST_SCAMS_2026.map(scam => (
                <div 
                  key={scam.id}
                  className="bg-[#0D0F12] border border-white/5 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/5 border border-cyan-400/10 px-2 py-0.5 rounded uppercase font-black">
                        {scam.year}
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-black ${
                        scam.severity === 'Critical' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : scam.severity === 'High' 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {isRTL ? (scam.severity === 'Critical' ? 'حرج' : scam.severity === 'High' ? 'عالٍ جداً' : 'متوسط') : `${scam.severity} Severity`}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white tracking-tight uppercase">
                      {isRTL ? scam.titleAr : scam.titleEn}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                      {isRTL ? scam.descAr : scam.descEn}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-5 flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>Obitrex Shielding: Active</span>
                    <span>Classified AI Profile</span>
                  </div>
                </div>
              ))}
            </div>

            {/* General Advice Banner */}
            <div className="p-6 bg-[#0E1114] border border-cyan-400/20 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-2xl pointer-events-none" />
              <div className="p-3 bg-cyan-400/10 text-cyan-400 rounded-2xl border border-cyan-400/20 shrink-0">
                <Star className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  {isRTL ? 'درع الأمان السلوكي' : 'THE COGNITIVE FIREWALL RULE'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {isRTL 
                    ? 'مهما كانت أساليب الاحتيال متقدمة، فإنها تعتمد دائماً على ركنين: خلق حالة من الهلع والاستعجال الشديد (مثل "خلال 24 ساعة")، وطلب بيانات حساسة أو مدفوعات مالية. بمجرد أن تلاحظ هذين الأمرين، توقف تماماً واتصل بحراس عائلتك!'
                    : 'Regardless of the scam medium, they rely on two main behaviors: extreme panic (e.g. "within 2 hours") and request for personal details or urgent funds. When you see this pattern, pause immediately and call your trusted family circle!'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== TAB 4: CERTIFICATE ===================== */}
        {activeSubTab === 'certificate' && (
          <motion.div
            key="certificate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {isCertificateUnlocked ? (
              <div className="space-y-6">
                
                {/* Custom input for senior's name */}
                <div className="max-w-md mx-auto p-6 bg-[#0D0F12] border border-white/5 rounded-3xl space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <User className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      {isRTL ? 'تخصيص اسم الشهادة الخاص بك' : 'ENTER YOUR CERTIFICATE NAME'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isRTL 
                      ? 'اكتب اسمك لتعديل الاسم المطبوع على شهادة أمان عائلتك الرسمية.' 
                      : 'Type your name below to customize your official printable security credentials.'}
                  </p>
                  <input
                    type="text"
                    value={certificateName}
                    onChange={(e) => setCertificateName(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white font-bold focus:outline-none focus:border-cyan-400 font-sans"
                    placeholder="Grandpa George"
                  />
                </div>

                {/* THE PHYSICAL/DIGITAL CERTIFICATE BLOCK */}
                <div className="p-2 sm:p-6 bg-slate-900 border border-slate-800 rounded-[32px] max-w-3xl mx-auto shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none">
                  
                  {/* Decorative background vectors for certificate */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06)_0%,transparent_70%)] pointer-events-none print:hidden" />
                  
                  {/* Outer double border */}
                  <div className="border-4 border-double border-amber-500/50 p-6 sm:p-12 rounded-2xl relative z-10 space-y-8 text-center print:border-black print:p-8">
                    
                    {/* Header Seal layout */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/10 border-2 border-amber-300">
                        <ShieldCheck className="w-9 h-9 text-slate-950" />
                      </div>
                      <span className="text-xs font-mono font-black uppercase tracking-[0.25em] text-amber-500 print:text-black">
                        Obitrex Safe Digital Circle
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-3xl font-black uppercase tracking-tight text-white font-sans print:text-black">
                        {isRTL ? 'شهادة التميز والوقاية الرقمية' : 'Certificate of Scam Prevention'}
                      </h3>
                      <div className="h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent w-48 mx-auto print:bg-black" />
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-300 italic max-w-lg mx-auto leading-relaxed print:text-black">
                      {isRTL 
                        ? 'تشهد إدارة Obitrex وجناح حماية كبار السن الميسّر بأن العضو المجتهد قد اجتاز بنجاح كافة المحاكيات والدروس الأمنية.'
                        : 'This document formally certifies that the student below has successfully completed all interactive training modules and is fully equipped to detect social engineering threats.'}
                    </p>

                    <div className="space-y-1 py-4">
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block print:text-black font-black">
                        {isRTL ? 'مُنحت بفخر إلى' : 'THIS ACCREDITATION IS GRANTED TO'}
                      </span>
                      <h4 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase font-sans py-2 print:text-black border-b border-dashed border-amber-500/30 max-w-md mx-auto">
                        {certificateName}
                      </h4>
                    </div>

                    <p className="text-xs font-bold text-slate-300 max-w-md mx-auto leading-relaxed print:text-black">
                      {isRTL 
                        ? 'معترف به رسمياً كـ مدافع عائلي معتمد ضد محاولات الاختراق، التصيد، وانتحال الهوية الرقمية بالذكاء الاصطناعي لعام ٢٠٢٦.'
                        : 'Certified as an active Family Cyber Guard with official credentials, ready to defend their personal circles from modern AI-assisted security threats.'}
                    </p>

                    {/* Footer stamps / sign-offs */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-white/5 print:border-black">
                      <div className="text-center sm:text-left">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block print:text-black">Obitrex SECURITY GROUP</span>
                        <span className="text-xs font-bold text-cyan-400 print:text-black">Obitrex Guard Officer</span>
                      </div>
                      
                      {/* Gold Badge Overlay watermark */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-mono text-amber-500 font-bold uppercase tracking-widest print:text-black">
                          {isRTL ? 'الدرجة الممتازة' : 'GOLD SHIELD LEVEL'}
                        </span>
                        <span className="text-[10px] font-mono text-white/50 print:text-black">Verify Code: S-82959</span>
                      </div>

                      <div className="text-center sm:text-right">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block print:text-black">CREDENTIAL STATUS</span>
                        <span className="text-xs font-bold text-emerald-400 print:text-black flex items-center gap-1">
                          ● {isRTL ? 'نشط ومعتمد' : 'ACTIVE CERTIFICATION'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Print button controls */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handlePrintCertificate}
                    className="px-6 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/10 flex items-center gap-2 active:scale-95 print:hidden"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isRTL ? 'تحميل أو طباعة الشهادة الورقية 📄' : 'PRINT OR SAVE MY CERTIFICATE 📄'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto p-12 bg-[#0D0F12] border border-white/5 rounded-[32px] text-center space-y-6 shadow-2xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-dashed border-white/10 relative">
                  <Lock className="w-8 h-8 text-white/30" />
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-1 rounded-full">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    {isRTL ? 'شهادة الأمان مغلقة حالياً' : 'Safety Certificate Locked'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    {isRTL 
                      ? 'لإثبات مهاراتك الأمنية والحصول على الشهادة الرسمية المعمدة، يرجى تجميع ٤٠٠ نقطة خبرة (XP) على الأقل من خلال قراءة الدروس وإجابة اختبارات التحقق والسيناريوهات.'
                      : 'To unlock your official Obitrex printable certificate, you must gather at least 400 XP by studying the lessons and classifying sandbox threat scenarios.'}
                  </p>
                </div>

                {/* Progress bar to unlock */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>{isRTL ? 'النقاط الحالية:' : 'Your Progress:'} {score} XP</span>
                    <span>{isRTL ? 'الهدف المطلوب:' : 'Required:'} 400 XP</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-500" 
                      style={{ width: `${Math.min(100, (score / 400) * 100)}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setActiveSubTab('lessons')}
                  className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all w-full active:scale-95"
                >
                  {isRTL ? 'ابدأ قراءة الدروس الآن 📚' : 'START STUDYING LESSONS 📚'}
                </button>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
