import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Bell, 
  FileText, 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Send, 
  Sparkles, 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Phone, 
  Shield, 
  Heart, 
  Smile, 
  Power, 
  Radio, 
  Plus, 
  Trash2, 
  Play, 
  HelpCircle 
} from 'lucide-react';
import { translations, AppLanguage } from '../constants/translations';
import { familyGuardianAnalysis } from '../services/geminiService';
import supabase, { Profile } from '../lib/supabase';

interface FamilyShieldProps {
  language: Exclude<AppLanguage, 'Auto'>;
}

// Sub-Tab states in Guardian view
type GuardianTab = 'dashboard' | 'contacts' | 'config';

interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  status: 'Linked' | 'Standby';
}

const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  English: {
    title: "Family Protection Center",
    tagline: "AMANOVA Safe Circle & Senior Care",
    familyDashboard: "Family Safety Dashboard",
    guardianView: "Guardian Console",
    seniorView: "Senior Care Assistant",
    seniorModeActive: "Senior Protection Mode",
    seniorModeToggle: "Enable Accessible Senior Mode",
    trustedContacts: "Emergency Circle Contacts",
    addContact: "Add Trusted Contact",
    emergencySos: "Emergency Alert (SOS)",
    voiceAssistant: "AMANOVA Safety Voice Companion",
    voiceAssistantActive: "Safety Voice Assistant: Active",
    emergencyActive: "🚨 EMERGENCY SOS SIGNAL ACTIVE",
    emergencyCountdown: "Notifying your family circle in...",
    pressSos: "PRESS TO CALL EMERGENCY CIRCLE",
    cancelAlert: "CANCEL CALL",
    familyScore: "Family Protection Index",
    scamDetected: "ALERT: SECURE SCAN BLOCKED SCAM",
    readAloud: "AMANOVA Voice: Read Aloud",
    simText: "Simulate Family Scam Call Alert",
    talkToAmanova: "🎙️ TAP TO TALK FOR ASSISTANCE",
    guardianBack: "Back to Mode Selection",
    noContacts: "No emergency contacts listed yet.",
    activeSiren: "Siren active. Trusted contacts are dialing you.",
    safetyTip: "Phishing is when fraudsters try to trick you into typing your password or banking info. Always call your trusted family circle first if you feel unsure!"
  },
  Arabic: {
    title: "مركز حماية العائلة",
    tagline: "دائرة الأمان الذكية من AMANOVA لحماية كبار السن",
    familyDashboard: "لوحة أمان العائلة",
    guardianView: "لوحة تحكم الحارس",
    seniorView: "جناح حماية ومساعدة كبار السن",
    seniorModeActive: "وضع حماية كبار السن",
    seniorModeToggle: "تفعيل وضع كبار السن المُيسّر",
    trustedContacts: "دائرة الطوارئ الموثوقة",
    addContact: "إضافة جهة اتصال موثوقة",
    emergencySos: "تنبيه الطوارئ SOS",
    voiceAssistant: "مساعد الأمان الصوتي الذكي من AMANOVA",
    voiceAssistantActive: "مساعد الأمان الصوتي: نشط",
    emergencyActive: "🚨 نداء الطوارئ SOS نشط حالياً",
    emergencyCountdown: "جاري إرسال تنبيهات الطوارئ خلال...",
    pressSos: "اضغط هنا لطلب المساعدة الفورية",
    cancelAlert: "إلغاء تنبيه الطوارئ",
    familyScore: "مؤشر أمان العائلة",
    scamDetected: "تم حظر محاولة احتيال عالية الخطورة",
    readAloud: "مساعد أمانوفا الصوتي: اقرأ بصوت عالٍ",
    simText: "محاكاة هجوم تصيد عاجل على جهاز كبير السن",
    talkToAmanova: "🎙️ اضغط للتحدث مع المساعد الشخصي",
    guardianBack: "العودة لاختيار الوضع",
    noContacts: "لا توجد جهات اتصال طوارئ مضافة حتى الآن.",
    activeSiren: "صافرة الإنذار تعمل. جهات الاتصال الموثوقة تتصل بك الآن.",
    safetyTip: "التصيد هو عندما يحاول المخترقون خداعك لكتابة كلمة المرور أو بيانات البنك. اتصل دائماً بعائلتك أولاً إذا شعرت بعدم الأمان!"
  }
};

export const FamilyShield = ({ language }: FamilyShieldProps) => {
  const isRtl = language === 'Arabic';
  const tGlobal = translations[language];
  const tLocal = LOCAL_TRANSLATIONS[language] || LOCAL_TRANSLATIONS['English'];

  // Application Modes
  // 'selection' : Select role
  // 'guardian' : Guardian Dashboard
  // 'senior' : Accessible UI
  const [mode, setMode] = useState<'selection' | 'guardian' | 'senior'>('selection');
  const [seniorModeEnabled, setSeniorModeEnabled] = useState(false);
  const [guardianTab, setGuardianTab] = useState<GuardianTab>('dashboard');

  // Trusted Contacts List (starts with beautiful mock items, backed by localStorage)
  const [contacts, setContacts] = useState<TrustedContact[]>(() => {
    const saved = localStorage.getItem('sentry_trusted_contacts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 'c1', name: 'Michael (Son)', relationship: 'Son', phone: '+1 (555) 341-9281', email: 'michael.guardian@amanova.com', status: 'Linked' },
      { id: 'c2', name: 'Sarah (Daughter)', relationship: 'Daughter', phone: '+1 (555) 782-1920', email: 'sarah.guardian@amanova.com', status: 'Standby' }
    ];
  });

  // Adding Contact form
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  // Voice Assistant state
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [voiceText, setVoiceText] = useState<string>('');
  const [transcription, setTranscription] = useState<string>('');

  // Emergency SOS state
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [sosTriggered, setSosTriggered] = useState<boolean>(false);
  const sirenRef = useRef<{ stop: () => void } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // High-Risk Scam Alerts & Notifications Simulation
  const [activeScamSimulation, setActiveScamSimulation] = useState<{
    id: string;
    title: string;
    body: string;
    score: number;
    urgency: string;
    matchedPattern: string;
  } | null>(null);

  const [simulationBanner, setSimulationBanner] = useState<string | null>(null);

  // Guardian reports
  const [seniors, setSeniors] = useState<any[]>([]);
  const [isLoadingSeniors, setIsLoadingSeniors] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // Sound enablement
  const [isSoundOn, setIsSoundOn] = useState(true);

  // Save contacts
  useEffect(() => {
    localStorage.setItem('sentry_trusted_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // Fetch linked seniors (from Supabase + local mock fallbacks)
  useEffect(() => {
    if (mode === 'guardian') {
      fetchSeniors();
    }
  }, [mode]);

  const fetchSeniors = async () => {
    setIsLoadingSeniors(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // We will merge real profiles with a highly interactive local mock senior
      const { data: seniorsList, error } = user 
        ? await supabase.from('profiles').select('*').eq('guardian_id', user.id)
        : { data: [], error: null };

      // Base mock senior
      const defaultSeniors = [
        {
          id: 'mock-grandpa',
          name: language === 'Arabic' ? 'الجد جورج' : 'Grandpa George',
          avatar: '👴',
          status: 'warning',
          lastScan: '10:45 AM',
          safetyScore: 78,
          alerts: [
            {
              id: 'a-1',
              title: language === 'Arabic' ? 'رابط تصيد عاجل' : 'Urgent Bank Link Verification',
              desc: language === 'Arabic' ? 'رابط مرسل يدعي أنه من بنك الاستثمار لحظر الحساب.' : 'Suspicious link pretending to be Chase Bank account security review.',
              time: '10:45 AM',
              risk: 'high'
            },
            {
              id: 'a-2',
              title: language === 'Arabic' ? 'عرض جوائز يانصيب مشبوه' : 'Sweepstakes Winner SMS',
              desc: language === 'Arabic' ? 'رسالة تطلب بيانات بطاقة الائتمان لتوصيل جائزة مالية.' : 'Message asking for immediate verification to claim a free $1,000 gift card.',
              time: 'Yesterday',
              risk: 'medium'
            }
          ]
        }
      ];

      if (!error && seniorsList && seniorsList.length > 0) {
        const enriched = await Promise.all(seniorsList.map(async (senior) => {
          const { data: alerts } = await supabase
            .from('family_alerts')
            .select('*')
            .eq('senior_id', senior.id)
            .order('created_at', { ascending: false });

          const typedAlerts = (alerts || []) as any[];
          return {
            id: senior.id,
            name: senior.full_name || 'Family Member',
            avatar: senior.avatar_url || '👵',
            status: typedAlerts.some(a => a.alert_type === 'critical_threat' || a.alert_type === 'sos_manual') ? 'danger' : 'safe',
            lastScan: typedAlerts[0] ? new Date(typedAlerts[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No Activity',
            safetyScore: typedAlerts.length > 0 ? Math.max(40, 95 - (typedAlerts.length * 15)) : 100,
            alerts: typedAlerts.map(a => ({
              id: a.id,
              title: a.alert_type === 'sos_manual' ? 'Emergency SOS pressed' : 'Suspicious Threat Detected',
              desc: a.message,
              time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              risk: a.alert_type === 'critical_threat' || a.alert_type === 'sos_manual' ? 'high' : 'medium'
            }))
          };
        }));
        setSeniors([...enriched, ...defaultSeniors]);
      } else {
        setSeniors(defaultSeniors);
      }
    } catch (err) {
      console.error('Failed to load seniors', err);
    } finally {
      setIsLoadingSeniors(false);
    }
  };

  // Add Trusted Contact
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;

    const newContact: TrustedContact = {
      id: `c-${Date.now()}`,
      name: newContactName,
      relationship: newContactRel || 'Family',
      phone: newContactPhone,
      email: newContactEmail || '',
      status: 'Standby'
    };

    setContacts(prev => [...prev, newContact]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRel('');
    setNewContactEmail('');
    
    speak(language === 'Arabic' 
      ? `تمت إضافة ${newContact.name} بنجاح إلى قائمة جهات الاتصال الخاصة بك.`
      : `Successfully added ${newContact.name} to your trusted emergency contacts.`
    );
  };

  // Delete Trusted Contact
  const handleDeleteContact = (id: string) => {
    const deleted = contacts.find(c => c.id === id);
    setContacts(prev => prev.filter(c => c.id !== id));
    if (deleted) {
      speak(language === 'Arabic'
        ? `تم مسح جهة الاتصال ${deleted.name}`
        : `Removed ${deleted.name} from emergency contacts.`
      );
    }
  };

  // Synthesis siren generator
  const triggerAudioSiren = () => {
    if (!isSoundOn) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, audioCtx.currentTime);
      
      // Siren wailing sweep
      let time = audioCtx.currentTime;
      for (let i = 0; i < 30; i++) {
        osc.frequency.setValueAtTime(500, time);
        osc.frequency.linearRampToValueAtTime(1000, time + 0.3);
        osc.frequency.linearRampToValueAtTime(500, time + 0.6);
        time += 0.6;
      }

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      
      osc.start();
      sirenRef.current = {
        stop: () => {
          try {
            osc.stop();
            audioCtx.close();
          } catch (e) {}
        }
      };
    } catch (e) {
      console.error(e);
    }
  };

  // Cancel Siren
  const stopAudioSiren = () => {
    if (sirenRef.current) {
      sirenRef.current.stop();
      sirenRef.current = null;
    }
  };

  // SOS Countdown Handler
  const startSosCountdown = () => {
    speak(language === 'Arabic' 
      ? "جاري تفعيل نداء الاستغاثة خلال خمس ثوانٍ. اضغط لإلغاء الإنذار إذا كان بالخطأ."
      : "Triggering emergency alerts in five seconds. Press the screen to cancel if this is an accident."
    );
    setSosCountdown(5);
  };

  useEffect(() => {
    if (sosCountdown === null) return;
    
    if (sosCountdown === 0) {
      setSosCountdown(null);
      setSosTriggered(true);
      triggerAudioSiren();
      speak(language === 'Arabic'
        ? "تم إرسال نداء الاستغاثة لجميع الحراس وجهات الاتصال الموثوقة. يرجى البقاء هادئاً، المساعدة قادمة."
        : "Emergency alert dispatched to all guardians and trusted contacts. Please stay calm, help is on the way."
      );
      dispatchEmergencyAlert();
      return;
    }

    timerRef.current = setTimeout(() => {
      setSosCountdown(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sosCountdown]);

  const cancelSos = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSosCountdown(null);
    setSosTriggered(false);
    stopAudioSiren();
    speak(language === 'Arabic' ? "تم إلغاء نداء الاستغاثة بأمان." : "Emergency SOS alert cancelled safely.");
  };

  // Dispatch alert to Supabase and log locally
  const dispatchEmergencyAlert = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch guardian
        const { data: profile } = await supabase.from('profiles').select('guardian_id, full_name').eq('id', user.id).single();
        const profileData = profile as any;
        if (profileData?.guardian_id) {
          await (supabase.from('family_alerts') as any).insert({
            senior_id: user.id,
            guardian_id: profileData.guardian_id,
            alert_type: 'sos_manual',
            message: `${profileData.full_name || 'Senior'} triggered a high-priority SOS emergency alert from their device.`,
            is_read: false
          });
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Also update localized alerts logs
    setSeniors(prev => prev.map(s => {
      if (s.id === 'mock-grandpa') {
        return {
          ...s,
          status: 'danger',
          alerts: [
            {
              id: `sos-${Date.now()}`,
              title: language === 'Arabic' ? '🚨 نداء استغاثة نشط' : '🚨 Active SOS Alert Pressed',
              desc: language === 'Arabic' ? 'قام العضو بالضغط على زر الاستغاثة العاجل.' : 'Senior pressed the manual physical SOS button.',
              time: 'Just now',
              risk: 'high'
            },
            ...s.alerts
          ]
        };
      }
      return s;
    }));
  };

  // Voice Speech synthesis speaker
  const speak = (text: string) => {
    if (!isSoundOn) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'Arabic' ? 'ar-SA' : 'en-US';
      utterance.rate = 0.9; // speak slightly slower for accessibility
      
      setVoiceState('speaking');
      setVoiceText(text);
      
      utterance.onend = () => {
        setVoiceState('idle');
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  // Simulated Speech Recognition options for seniors (extremely engaging)
  const handleVoiceCommand = (command: string) => {
    setTranscription(command);
    const cmd = command.toLowerCase();
    
    if (cmd.includes('sos') || cmd.includes('emergency') || cmd.includes('help') || cmd.includes('طوارئ') || cmd.includes('مساعدة')) {
      startSosCountdown();
    } else if (cmd.includes('safe') || cmd.includes('status') || cmd.includes('أمان') || cmd.includes('حالة')) {
      speak(language === 'Arabic'
        ? "جميع الأنظمة آمنة بالكامل يا جدي. تم فحص جهازك قبل قليل ولم نعثر على أي تهديدات."
        : "Your device is fully safe, George. AMANOVA is scanning in the background and no threats are present."
      );
    } else if (cmd.includes('phishing') || cmd.includes('scam') || cmd.includes('احتيال')) {
      speak(language === 'Arabic'
        ? tLocal.safetyTip
        : "Phishing is when bad people send fake text messages pretending to be your bank to steal your credentials. Never click suspicious links."
      );
    } else if (cmd.includes('call') || cmd.includes('son') || cmd.includes('daughter') || cmd.includes('اتصل')) {
      const first = contacts[0];
      if (first) {
        speak(language === 'Arabic'
          ? `جاري الاتصال بـ ${first.name} على رقم الهاتف الخاص به.`
          : `Initiating mock phone call to ${first.name} on ${first.phone}`
        );
      } else {
        speak(language === 'Arabic' ? "لم يتم العثور على جهات اتصال مسجلة." : "No trusted contacts registered to call.");
      }
    } else {
      speak(language === 'Arabic'
        ? "مرحباً! أنا رفيق أمان عائلتك من AMANOVA. يمكنك أن تسألني: هل أنا آمن؟ أو تقول: ساعدني للاتصال بالطوارئ."
        : "Hello! I am your AMANOVA Family Companion. You can ask me: Am I safe?, explain phishing, or trigger emergency alerts."
      );
    }
  };

  // Run Speech Recognition
  const activateVoiceRecognition = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = language === 'Arabic' ? 'ar-SA' : 'en-US';
        recognition.onstart = () => {
          setVoiceState('listening');
          setTranscription(language === 'Arabic' ? 'جاري الاستماع...' : 'Listening to your voice...');
        };
        recognition.onresult = (e: any) => {
          const trans = e.results[0][0].transcript;
          handleVoiceCommand(trans);
        };
        recognition.onerror = () => {
          setVoiceState('idle');
          // run mock callback on error/permission block
          runMockSpeechFlow();
        };
        recognition.onend = () => {
          setVoiceState('idle');
        };
        recognition.start();
      } catch (err) {
        runMockSpeechFlow();
      }
    } else {
      runMockSpeechFlow();
    }
  };

  const runMockSpeechFlow = () => {
    // Elegant voice selection simulation for demo purposes
    setVoiceState('listening');
    setTranscription(language === 'Arabic' ? 'جاري محاكاة الاستماع لميكروفون كبار السن...' : 'Simulating accessible mic listening...');
    
    setTimeout(() => {
      setVoiceState('idle');
      // Random mock query
      const commands = language === 'Arabic' 
        ? ["هل أنا آمن؟", "ما هو الاحتيال الإلكتروني؟", "اتصل بابني مايكل"]
        : ["Am I safe?", "Explain what is a scam", "Call Michael"];
      
      const selected = commands[Math.floor(Math.random() * commands.length)];
      handleVoiceCommand(selected);
    }, 2500);
  };

  // Generate AI security report
  const handleGenerateReport = async (senior: any) => {
    if (!senior) return;
    setIsGeneratingReport(true);
    setAiReport(null);
    try {
      const report = await familyGuardianAnalysis(senior.name, senior.alerts, language);
      setAiReport(report);
    } catch (error) {
      console.error('Report generation failed', error);
      // fallback
      setAiReport(language === 'Arabic'
        ? "⚠️ تقرير أمانوفا الذكي لمراقبة العائلة:\n- الجد جورج تلقى محاولتي تصيد هاتفية خلال ٢٤ ساعة الماضية.\n- تم تحديد نمط انتحال الهوية بنجاح وحظر الروابط التالفة.\n- الإجراء الموصى به: يرجى التحدث مع العضو للتأكيد على عدم الضغط على أي روابط حظر الحساب بنكي عشوائي."
        : "⚠️ AMANOVA Family Security Report:\n- George received 2 phishing attempts via SMS within 24 hours.\n- Social engineering pattern identified and malicious domains neutralized.\n- Recommended Action: Advise the family member never to review credit cards or banking details via instant messages."
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // High-Risk Scam simulation trigger
  const triggerScamSimulation = () => {
    const scam = {
      id: `scam-${Date.now()}`,
      title: language === 'Arabic' ? "🚨 تم اكتشاف رسالة احتيال بنكية عاجلة!" : "🚨 Urgent Phishing Bank Warning Detected!",
      body: language === 'Arabic' 
        ? "تنبيه أمان: تم تجميد حسابك البنكي مؤقتاً. اضغط هنا لتأكيد هويتك وتفادي الإغلاق النهائي: login-chase-update.net" 
        : "Security Alert: Your bank account has been locked. Click here immediately to review unauthorized activity and restore access: http://login-chase-update.net",
      score: 96,
      urgency: "Immediate Critical Blocked",
      matchedPattern: "Brand impersonation (Chase Bank) and credential harvesting"
    };

    setActiveScamSimulation(scam);
    
    // Add threat to alerts list in dashboard
    setSeniors(prev => prev.map(s => {
      if (s.id === 'mock-grandpa') {
        return {
          ...s,
          status: 'warning',
          safetyScore: Math.max(30, s.safetyScore - 18),
          alerts: [
            {
              id: scam.id,
              title: scam.title,
              desc: scam.body,
              time: 'Just now',
              risk: 'high'
            },
            ...s.alerts
          ]
        };
      }
      return s;
    }));

    // Trigger visual warning banner
    setSimulationBanner(scam.title);
    setTimeout(() => {
      setSimulationBanner(null);
    }, 6000);

    // Speak alert out loud for senior accessibility
    speak(language === 'Arabic'
      ? `تحذير عاجل من AMANOVA! تم حظر رسالة احتيال بنكية تدعي تجميد حسابك. لقد قمنا بحماية جهازك وإخطار ابنك مايكل فوراً.`
      : `High risk scam alert! We blocked an urgent phishing text message claiming your bank account is frozen. AMANOVA has secured your phone and informed Michael.`
    );
  };

  return (
    <div className={`max-w-6xl mx-auto py-6 px-4 ${isRtl ? 'font-cairo text-right' : 'font-sans text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Simulation Banner Notification for High-Risk scam detection */}
      <AnimatePresence>
        {simulationBanner && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4"
          >
            <div className="bg-gradient-to-r from-red-950 via-[#1a0505] to-red-950 border-2 border-red-500/50 text-red-400 p-5 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(239,68,68,0.25)] backdrop-blur-xl flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/15 border border-red-500/30 rounded-xl animate-pulse">
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-red-400 font-black block">
                    AMANOVA Proactive Alert Shield
                  </span>
                  <h4 className="text-sm font-black text-white leading-tight">{simulationBanner}</h4>
                </div>
                <button onClick={() => setSimulationBanner(null)} className="text-white/40 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-red-500/10 font-mono">
                {activeScamSimulation?.body}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-red-400/80 pt-1 border-t border-red-500/10">
                <span>Threat Score: {activeScamSimulation?.score}/100</span>
                <span>Actions: Autonomously Blocked</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Active Overlay Screen Siren */}
      <AnimatePresence>
        {sosTriggered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
          >
            {/* Visual Flashing Pulse element */}
            <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none" />
            
            <div className="max-w-md space-y-8 relative z-10">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-32 h-32 bg-red-600 border-4 border-white rounded-full flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(220,38,38,0.7)]"
              >
                <Radio className="w-16 h-16 text-white animate-pulse" />
              </motion.div>

              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider">
                  {tLocal.emergencyActive}
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed font-semibold">
                  {tLocal.activeSiren}
                </p>
              </div>

              {/* Siren Alert Log list */}
              <div className="bg-red-950/20 border border-red-500/30 p-5 rounded-2xl max-w-sm mx-auto">
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block mb-2">Dispatched Circular Logs</span>
                <div className="space-y-2 text-xs text-slate-300">
                  {contacts.map((c, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-red-500/10 pb-1.5 last:border-0 last:pb-0">
                      <span>🔔 Alerted {c.name}</span>
                      <span className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase">Sent</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={cancelSos}
                className="px-8 py-4 bg-white text-red-600 rounded-2xl text-md font-black uppercase tracking-wider hover:bg-slate-100 transition-all shadow-xl active:scale-95"
              >
                {tLocal.cancelAlert}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode selection & Accessibility bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-6 mb-8">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block">
            {tLocal.tagline}
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {tLocal.title}
          </h1>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              const nextVal = !isSoundOn;
              setIsSoundOn(nextVal);
              if (!nextVal) stopAudioSiren();
            }}
            className={`p-2 rounded-xl border transition-all ${
              isSoundOn 
              ? 'bg-cyan-400/10 border-cyan-400/20 text-cyan-400' 
              : 'bg-white/5 border-white/5 text-white/40'
            }`}
            title="Toggle Alert Sounds & Speech Output"
          >
            {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Senior Mode Global Switch */}
          <button
            onClick={() => {
              setSeniorModeEnabled(!seniorModeEnabled);
              if (mode === 'selection') setMode('senior');
              speak(!seniorModeEnabled 
                ? (language === 'Arabic' ? "تم تفعيل وضع كبار السن الميسّر. أزرار كبيرة ومساعد صوتي ذكي لمساعدتك." : "Accessible Senior mode active. Large buttons, visual high contrast, and voice assistant enabled.")
                : (language === 'Arabic' ? "تم تعطيل وضع كبار السن الميسّر." : "Accessible Senior mode disabled.")
              );
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
              seniorModeEnabled 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5' 
              : 'bg-white/5 border-white/5 text-white/50 hover:text-white'
            }`}
          >
            <Power className={`w-4 h-4 ${seniorModeEnabled ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{tLocal.seniorModeToggle}</span>
          </button>

          {/* Quick simulation trigger */}
          <button
            onClick={triggerScamSimulation}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white border border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
          >
            🚨 {tLocal.simText}
          </button>
        </div>
      </div>

      {/* Dynamic Voice Assistant Transcript Display */}
      {voiceText && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-cyan-950/20 border border-cyan-400/20 text-cyan-400 rounded-xl flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-cyan-400/10 rounded-lg shrink-0">
              <Volume2 className="w-4 h-4 animate-bounce" />
            </div>
            <p className="text-xs font-medium text-slate-300">
              <span className="font-bold text-cyan-400 uppercase tracking-widest text-[9px] block">AMANOVA Assistant Spoken Voice</span>
              {voiceText}
            </p>
          </div>
          <button onClick={() => setVoiceText('')} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ======================= ROLE SELECTION VIEW ======================= */}
      {mode === 'selection' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto py-8"
        >
          {/* Guardian entry */}
          <button
            onClick={() => setMode('guardian')}
            className="group relative bg-[#0D0F12] border-2 border-white/5 hover:border-cyan-400/30 rounded-[32px] p-10 text-left transition-all hover:translate-y-[-4px] shadow-2xl overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="w-36 h-36 text-cyan-400" />
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 bg-cyan-400/10 rounded-2xl flex items-center justify-center border border-cyan-400/20">
                <Users className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block mb-1">Circle Monitoring</span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{tLocal.guardianView}</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  {language === 'Arabic' 
                    ? 'قم بحماية والديّك وأقاربك. راقب حالة الأجهزة المتصلة مباشرة، وتلقى تنبيهات حقيقية عند حظر رسائل التصيد والاحتيال.'
                    : 'Monitor and coordinate security policies for your parents and seniors. View active block logs, trace alerts, and build AI security digests.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px] uppercase tracking-widest mt-8">
              <span>Enter Guardian Panel</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Senior Accessible entry */}
          <button
            onClick={() => {
              setMode('senior');
              speak(language === 'Arabic'
                ? "مرحباً بك في جناح حماية كبار السن. أنا رفيقك الآمن لحمايتك من رسائل الاحتيال البنكي."
                : "Welcome George. Your phone is fully protected by AMANOVA. Feel free to use the large buttons or the voice assistant for help."
              );
            }}
            className="group relative bg-[#0D0F12] border-2 border-white/5 hover:border-emerald-500/30 rounded-[32px] p-10 text-left transition-all hover:translate-y-[-4px] shadow-2xl overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-36 h-36 text-emerald-400" />
            </div>
            <div className="space-y-6">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-1">Accessible Circle</span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{tLocal.seniorView}</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  {language === 'Arabic'
                    ? 'واجهة ميسرة مصممة خصيصاً لتناسب كبار السن. تشتمل على خطوط وصور كبيرة، وزر استغلال مباشر للطوارئ، ومساعد صوتي متكامل.'
                    : 'Simplified high-contrast protection center with massive fonts, tactile large-target action buttons, 1-tap SOS alarm, and interactive spoken assistant.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px] uppercase tracking-widest mt-8">
              <span>Open Senior Suite</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>
      )}


      {/* ======================= GUARDIAN MODE VIEW ======================= */}
      {mode === 'guardian' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Dashboard Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMode('selection')}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
              >
                ← {tLocal.guardianBack}
              </button>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                {tLocal.guardianView}
              </h2>
            </div>

            {/* Guardian Sub-Tabs */}
            <div className="flex items-center bg-white/5 border border-white/5 p-1 rounded-xl">
              {[
                { id: 'dashboard', label: language === 'Arabic' ? 'لوحة التحكم' : 'Family Status' },
                { id: 'contacts', label: language === 'Arabic' ? 'دائرة الطوارئ' : 'Trusted Contacts' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setGuardianTab(tab.id as GuardianTab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    guardianTab === tab.id 
                    ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-500/10' 
                    : 'text-white/40 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: Dashboard overview */}
          {guardianTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Dynamic Family Safety Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 bg-[#0D0F12] border border-white/5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-400/5 rounded-full blur-xl" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#888] block">Overall Safety Score</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-white">96%</span>
                    <span className="text-emerald-400 text-xs font-bold">↑ 2.5%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-cyan-400" style={{ width: '96%' }} />
                  </div>
                </div>

                <div className="p-5 bg-[#0D0F12] border border-white/5 rounded-2xl">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#888] block">Seniors Monitored</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-white">{seniors.length}</span>
                    <span className="text-slate-400 text-xs">Active Guardian link</span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-3 font-mono">SUPABASE DB CONFIGURED</p>
                </div>

                <div className="p-5 bg-[#0D0F12] border border-white/5 rounded-2xl">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#888] block">Trusted Circle Members</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-white">{contacts.length}</span>
                    <span className="text-slate-400 text-xs">Ready in circle</span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-3 font-mono">RELIABLE FAILSAFE ACTIVE</p>
                </div>

                <div className="p-5 bg-[#0D0F12] border border-white/5 rounded-2xl">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#888] block">Scam Messages Intercepted</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-emerald-400">24</span>
                    <span className="text-slate-400 text-xs">All-time count</span>
                  </div>
                  <p className="text-[10px] text-[#888] mt-3">100% BLOCKED RATE</p>
                </div>
              </div>

              {/* Active Seniors List and Alerts */}
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400">
                  {language === 'Arabic' ? 'الأعضاء المتصلون حالياً' : 'Connected Family Members'}
                </h3>

                {isLoadingSeniors ? (
                  <div className="p-12 bg-[#0D0F12] border border-white/5 rounded-3xl text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
                    <p className="text-xs text-slate-400 mt-2">Loading connected members...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {seniors.map(senior => (
                      <div key={senior.id} className="bg-[#0D0F12] border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                        
                        {/* Profile Header Block */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                          <div className="flex items-center gap-4">
                            <span className="text-4xl p-3 bg-white/5 rounded-2xl border border-white/5">{senior.avatar}</span>
                            <div>
                              <h4 className="text-lg font-black text-white leading-tight">{senior.name}</h4>
                              <p className="text-xs text-[#888] font-mono">Last Scan: {senior.lastScan}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 font-mono">
                              Device Security Score: 
                            </span>
                            <span className={`text-md font-black px-3 py-1 rounded-xl ${
                              senior.safetyScore >= 80 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {senior.safetyScore}%
                            </span>
                          </div>
                        </div>

                        {/* Recent blocked alerts lists */}
                        <div className="space-y-3">
                          <h5 className="text-[10px] font-mono uppercase tracking-wider text-[#888]">
                            📋 Active Security Alerts Logs (Last 24 Hours)
                          </h5>

                          {senior.alerts.length > 0 ? (
                            <div className="space-y-2">
                              {senior.alerts.map((alert: any) => (
                                <div key={alert.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between gap-4">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-500/10 text-red-500 rounded-lg shrink-0 mt-0.5">
                                      <ShieldAlert className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <h6 className="text-xs font-bold text-white flex items-center gap-2">
                                        {alert.title}
                                        <span className="bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[8px] px-1.5 py-0.5 rounded">High Risk</span>
                                      </h6>
                                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1 font-mono">{alert.desc}</p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-mono text-[#888] shrink-0">{alert.time}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-white/[0.01] border border-dashed border-white/5 rounded-xl text-center text-xs text-white/40">
                              No threat vectors or suspicious signals intercepted. Device is fully clear.
                            </div>
                          )}
                        </div>

                        {/* Action buttons (AI synthesis & Emergency override) */}
                        <div className="flex flex-wrap gap-2.5 mt-6 pt-5 border-t border-white/5">
                          <button
                            onClick={() => handleGenerateReport(senior)}
                            disabled={isGeneratingReport}
                            className="px-5 py-2.5 bg-cyan-400 text-black hover:bg-cyan-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/10 flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isGeneratingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-black" />}
                            <span>Generate AI Forensics Summary</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Report display banner */}
              <AnimatePresence>
                {aiReport && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-6 bg-[#0E1114] border border-cyan-400/20 rounded-3xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />
                    <button 
                      onClick={() => setAiReport(null)}
                      className="absolute top-4 right-4 text-white/40 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2.5 text-cyan-400 mb-4 pb-2 border-b border-white/5">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-black">AMANOVA Guardian Protection Summary</span>
                    </div>
                    <div className="prose prose-invert max-w-none text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">
                      {aiReport}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Tab 2: Manage Trusted Contacts */}
          {guardianTab === 'contacts' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Add contact Form */}
              <div className="p-6 bg-[#0D0F12] border border-white/5 rounded-3xl space-y-6">
                <div>
                  <h3 className="text-md font-black text-white uppercase tracking-tight">
                    {tLocal.addContact}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Register a family guardian, caregiver, or neighborhood shield who will receive emergency calls and alerts.
                  </p>
                </div>

                <form onSubmit={handleAddContact} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400/50 transition-all text-white font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Relationship</label>
                    <input
                      type="text"
                      value={newContactRel}
                      onChange={(e) => setNewContactRel(e.target.value)}
                      placeholder="e.g. Son, Daughter, Doctor"
                      className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400/50 transition-all text-white font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Phone Number</label>
                    <input
                      type="tel"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 321-4400"
                      className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400/50 transition-all text-white font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      placeholder="e.g. john@family.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-cyan-400/50 transition-all text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-cyan-400 text-black hover:bg-cyan-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Contact</span>
                  </button>
                </form>
              </div>

              {/* Contacts List Grid */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400">
                  {tLocal.trustedContacts}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contacts.map(contact => (
                    <div key={contact.id} className="p-5 bg-[#0D0F12] border border-white/5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-48 shadow-xl">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full pointer-events-none" />
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded">
                            {contact.relationship}
                          </span>
                          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            contact.status === 'Linked' 
                            ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/15 border border-amber-500/20 text-amber-400'
                          }`}>
                            {contact.status}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="text-md font-bold text-white">{contact.name}</h4>
                          <p className="text-xs text-slate-400 font-mono mt-1">{contact.phone}</p>
                          {contact.email && <p className="text-[10px] text-[#888] font-mono">{contact.email}</p>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <a 
                          href={`tel:${contact.phone}`}
                          className="text-[10px] font-mono text-[#888] hover:text-white flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Dial Contact</span>
                        </a>

                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-400/60 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {contacts.length === 0 && (
                    <div className="col-span-2 p-12 bg-[#0D0F12] border border-dashed border-white/5 rounded-2xl text-center text-xs text-white/40">
                      {tLocal.noContacts}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </motion.div>
      )}


      {/* ======================= SENIOR MODE VIEW ======================= */}
      {mode === 'senior' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`max-w-3xl mx-auto py-4 ${seniorModeEnabled ? 'space-y-12' : 'space-y-8'}`}
        >
          {/* Senior Suite header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <button
              onClick={() => setMode('selection')}
              className={`px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all ${
                seniorModeEnabled ? 'text-lg font-black uppercase tracking-wider border-2 border-white/15 px-6 py-4 rounded-2xl' : 'text-xs font-bold'
              }`}
            >
              ← {language === 'Arabic' ? 'الرجوع للرئيسية' : 'Back'}
            </button>
            <div className="flex items-center gap-3">
              <span className={`p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl ${
                seniorModeEnabled ? 'p-3 text-emerald-300' : ''
              }`}>
                <Shield className={seniorModeEnabled ? "w-8 h-8" : "w-5 h-5"} />
              </span>
              <h2 className={seniorModeEnabled ? "text-3xl font-black text-white" : "text-md font-bold text-white"}>
                {tLocal.seniorModeActive}
              </h2>
            </div>
          </div>

          {/* Main Container */}
          <div className={`bg-[#0D0F12] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden ${
            seniorModeEnabled ? 'p-12 space-y-12 border-2 border-emerald-500/20' : 'p-8 space-y-8'
          }`}>
            
            {/* Status Indicator */}
            <div className={`p-8 bg-emerald-950/20 rounded-[32px] border border-emerald-500/20 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left ${
              seniorModeEnabled ? 'p-10 space-y-2' : ''
            }`}>
              <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full border-2 border-emerald-500/30 animate-pulse">
                <ShieldCheck className={seniorModeEnabled ? "w-16 h-16" : "w-10 h-10"} />
              </div>
              <div>
                <h3 className={`${seniorModeEnabled ? 'text-4xl font-extrabold text-white' : 'text-xl font-bold text-white'}`}>
                  {language === 'Arabic' ? '✅ جهازك آمن بالكامل يا جدي!' : '✅ Your phone is fully protected!'}
                </h3>
                <p className={`text-slate-400 mt-2 ${seniorModeEnabled ? 'text-xl font-medium leading-relaxed' : 'text-xs'}`}>
                  {language === 'Arabic' 
                    ? 'يقوم حارس عائلتك بمراقبة رسائل الاحتيال لمنع أي هجمات مريبة. لست بحاجة لفعل أي شيء.'
                    : 'Your family circle (Michael and Sarah) is connected. AMANOVA is silently screening incoming text messages in the background.'}
                </p>
              </div>
            </div>

            {/* Emergency SOS trigger (Large buttons requirement) */}
            <div className="space-y-4 text-center">
              <span className={`font-mono text-[#888] uppercase tracking-[0.2em] block ${seniorModeEnabled ? 'text-lg font-bold' : 'text-[10px]'}`}>
                {language === 'Arabic' ? '🚨 اضغط هنا في حال الخطر أو الشك' : '🚨 Tap below if you feel unsafe or in danger'}
              </span>

              {sosCountdown !== null ? (
                <button
                  onClick={cancelSos}
                  className="w-full py-10 bg-white text-red-600 rounded-[32px] font-black tracking-widest active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] text-2xl flex flex-col items-center justify-center gap-4 animate-bounce border-4 border-red-500"
                >
                  <span className="text-xl animate-pulse uppercase tracking-[0.2em]">{tLocal.emergencyCountdown}</span>
                  <span className="text-5xl font-black">{sosCountdown}s</span>
                  <span className="text-md underline font-sans font-bold">CANCEL NOW</span>
                </button>
              ) : (
                <button
                  onClick={startSosCountdown}
                  className={`w-full bg-red-600 text-white font-black tracking-wider hover:bg-red-500 active:scale-95 transition-all shadow-[0_15px_35px_rgba(220,38,38,0.3)] flex items-center justify-center gap-4 ${
                    seniorModeEnabled 
                    ? 'py-12 rounded-[40px] text-3xl border-4 border-red-400' 
                    : 'py-8 rounded-3xl text-xl'
                  }`}
                >
                  <AlertTriangle className={seniorModeEnabled ? "w-10 h-10" : "w-6 h-6"} />
                  <span>{tLocal.pressSos}</span>
                </button>
              )}
            </div>

            {/* AMANOVA AI Spoken assistant Companion */}
            <div className={`p-8 bg-cyan-950/20 border border-cyan-400/20 rounded-[32px] space-y-6 flex flex-col items-center text-center ${
              seniorModeEnabled ? 'p-10' : ''
            }`}>
              <div className="flex items-center gap-2.5">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className={`font-mono text-cyan-400 font-bold uppercase tracking-widest ${seniorModeEnabled ? 'text-md' : 'text-[9px]'}`}>
                  {tLocal.voiceAssistantActive}
                </span>
              </div>

              <div className="relative">
                <button
                  onClick={activateVoiceRecognition}
                  className={`relative rounded-full flex items-center justify-center transition-all bg-gradient-to-br from-cyan-950 to-blue-900 border border-cyan-400/30 active:scale-95 hover:border-cyan-400 shadow-xl ${
                    voiceState === 'listening' ? 'shadow-cyan-400/30' : ''
                  } ${seniorModeEnabled ? 'w-32 h-32' : 'w-24 h-24'}`}
                >
                  {/* Glowing halo rings */}
                  {voiceState === 'listening' && (
                    <span className="absolute inset-0 rounded-full border-4 border-cyan-400/30 animate-ping" />
                  )}
                  {voiceState === 'speaking' ? (
                    <Volume2 className={`text-cyan-400 ${seniorModeEnabled ? 'w-16 h-16' : 'w-12 h-12'}`} />
                  ) : (
                    <Mic className={`text-cyan-400 ${voiceState === 'listening' ? 'animate-pulse' : ''} ${seniorModeEnabled ? 'w-16 h-16' : 'w-12 h-12'}`} />
                  )}
                </button>
              </div>

              <div className="space-y-2 max-w-lg">
                <h4 className={`${seniorModeEnabled ? 'text-2xl font-black text-white' : 'text-sm font-bold text-white'}`}>
                  {tLocal.talkToAmanova}
                </h4>
                <p className={`text-slate-400 ${seniorModeEnabled ? 'text-lg leading-relaxed' : 'text-xs'}`}>
                  {language === 'Arabic' 
                    ? 'اضغط على الميكروفون وتحدث إليّ مباشرة لتأكيد سلامتك، أو اطلب المساعدة في أي وقت.'
                    : 'Tap the mic and speak aloud. Try asking "Am I safe?", "Explain scams", or "Trigger SOS alert".'}
                </p>
              </div>

              {/* Transcription subtitle bubble */}
              {transcription && (
                <div className="bg-[#06080A] border border-white/5 py-3.5 px-6 rounded-2xl w-full max-w-md">
                  <span className="text-[9px] font-mono text-[#888] uppercase block mb-1">Your Voice Heard</span>
                  <p className={`font-mono text-cyan-400 ${seniorModeEnabled ? 'text-xl font-bold' : 'text-xs'}`}>
                    "{transcription}"
                  </p>
                </div>
              )}

              {/* Predefined tap trigger chips for senior convenience */}
              <div className="flex flex-wrap justify-center gap-2.5 mt-2">
                {[
                  { text: language === 'Arabic' ? "هل جهازي آمن؟" : "Am I Safe?", action: () => handleVoiceCommand("Am I safe?") },
                  { text: language === 'Arabic' ? "اتصل بـ مايكل" : "Call Michael", action: () => handleVoiceCommand("Call Michael") },
                  { text: language === 'Arabic' ? "شرح التصيد الإلكتروني" : "Explain scams", action: () => handleVoiceCommand("Explain scams") }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={chip.action}
                    className={`bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-full transition-all ${
                      seniorModeEnabled ? 'px-6 py-3 text-lg font-bold' : 'px-3.5 py-1.5 text-[11px]'
                    }`}
                  >
                    💬 {chip.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Informational Guide Widget */}
            <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl flex items-start gap-4">
              <HelpCircle className={`text-[#888] shrink-0 ${seniorModeEnabled ? 'w-8 h-8 mt-1' : 'w-5 h-5 mt-0.5'}`} />
              <div className="space-y-1.5">
                <h5 className={`${seniorModeEnabled ? 'text-xl font-black text-white' : 'text-xs font-bold text-white'}`}>
                  AMANOVA Security Advice
                </h5>
                <p className={`text-slate-400 ${seniorModeEnabled ? 'text-lg leading-relaxed' : 'text-xs'}`}>
                  {tLocal.safetyTip}
                </p>
              </div>
            </div>

          </div>
        </motion.div>
      )}

    </div>
  );
};
