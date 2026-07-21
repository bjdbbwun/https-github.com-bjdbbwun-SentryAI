import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, Play, Pause, AlertTriangle, Shield, ShieldAlert, Zap, Globe, 
  Terminal, Key, Sparkles, Database, Server, RefreshCw, Layers, 
  Filter, Trash2, CheckCircle, ChevronDown, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThreatRecord, ThreatIndicator, normalizeIndicator } from './ThreatIntelligenceHub';

// Define the live event structure for display
interface LiveFeedEvent {
  id: string;
  name: string;
  category: 'Scam' | 'Phishing' | 'Domain' | 'Credential' | 'Malware';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  riskScore: number;
  timestamp: string;
  source: string;
  indicators: { type: string; value: string; originalValue: string }[];
  description: string;
  remediation: string[];
}

interface LiveThreatFeedProps {
  language?: string;
  theme?: string;
}

// Highly realistic threat components/scenarios to dynamically assemble
const scamTemplates = [
  {
    name: "Amazon Rewards Points Claim Scam",
    description: "Urgent SMS phishing campaign advising customers of an expiring promotional gift card, driving traffic to external malicious login portals.",
    remediation: ["Block sender SMS routing arrays", "Add domain indicators to global secure gateways"],
    indicatorType: "URL",
    indicatorValue: "hxxps://amazon-rewards-points-claim[.]top/login",
    source: "Honeypot SMS Array #4"
  },
  {
    name: "IRS Pending Overdue Tax Levy Urgency",
    description: "Threat actors masquerading as tax agents claiming dynamic asset seizure penalties, requiring immediate contact via fraudulent toll-free numbers.",
    remediation: ["Flag inbound telecomm routes", "Notify internal safety departments"],
    indicatorType: "Phone",
    indicatorValue: "+1-800-410-9082",
    source: "VOIP SIP Gateway Watch"
  },
  {
    name: "Tesla Double Crypto Giveaway Swindle",
    description: "Social media giveaway loop scam leveraging deepfake video clips to drain user decentralised crypto wallet keys via smart contracts.",
    remediation: ["Block destination wallet address on local ledger proxies", "Flag social channel landing domain"],
    indicatorType: "CryptoWallet",
    indicatorValue: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    source: "Web3 Sandbox Observer"
  },
  {
    name: "Meta Account Verification Urgent Appeal",
    description: "Urgent Instagram copyright notification coercion claiming account suspension in 24 hours unless a spoofed review form is submitted.",
    remediation: ["Mark sender domain as malicious in security exchange", "Trigger immediate administrative credential rotation"],
    indicatorType: "Domain",
    indicatorValue: "meta-profile-appeals-verification[.]info",
    source: "Social Honeynet Node"
  }
];

const phishTemplates = [
  {
    name: "DocuSign Pending Electronic Signature Probe",
    description: "Highly polished credential harvester masquerading as an envelope notification demanding signature on an employment agreement update.",
    remediation: ["Block outgoing mail routes to phishing server IP", "Run a tenant-wide sweep for associated document links"],
    indicatorType: "URL",
    indicatorValue: "hxxps://docusign-envelope-review[.]net/auth/login",
    source: "Spam Quarantine Feed"
  },
  {
    name: "Microsoft 365 Shared Document Access Phish",
    description: "Phishing emails claiming to share high-level financial folders, redirecting targets to external pages that harvest MFA credentials.",
    remediation: ["Revoke current MFA active sessions", "Add source domain to secure tenant blocklist"],
    indicatorType: "Domain",
    indicatorValue: "sharepoint-finance-folders[.]com",
    source: "Secure Mail Gateway Block"
  },
  {
    name: "Chase Bank Urgent Anti-Fraud Alert Verification",
    description: "SMS spoofing campaign mimicking true anti-fraud alerts to trick account holders into replying with secure SMS codes.",
    remediation: ["Report rogue mobile sender number to carrier networks", "Deploy brand-protection advisory to customers"],
    indicatorType: "Phone",
    indicatorValue: "+1-855-321-4921",
    source: "Carrier Security Stream"
  }
];

const domainTemplates = [
  {
    name: "Google Workspace Typosquatted Domain Active",
    description: "Newly registered malicious domain mimicking official Google sign-in portals, configured with authentic SSL and active DNS records.",
    remediation: ["Block domain resolution in DNS firewalls", "Report registrar trademark abuse"],
    indicatorType: "Domain",
    indicatorValue: "accounts.google-verify-security[.]xyz",
    source: "Passive DNS Stream"
  },
  {
    name: "Adobe Document Cloud Spoof Target Gate",
    description: "Active malicious landing host dressed as Adobe Document Cloud login triggers, designed to trap enterprise administrative credentials.",
    remediation: ["Block resolution on internal network nodes", "Update endpoint anti-phishing configurations"],
    indicatorType: "Domain",
    indicatorValue: "adobe-pdf-cloud-share[.]club",
    source: "WHOIS Registration Monitor"
  },
  {
    name: "Binance Ledger Update Typosquat Portal",
    description: "Malicious domain mimicking official cryptocurrency exchange wallets, attempting to capture mnemonic phrases and private ledger files.",
    remediation: ["Filter and block outbound DNS resolution", "Register address as malicious with public browser extensions"],
    indicatorType: "Domain",
    indicatorValue: "binance-wallet-recovery-key[.]online",
    source: "DGA Domain Predictor"
  }
];

const credentialTemplates = [
  {
    name: "Retail E-Commerce Corporate Database Leak",
    description: "Corporate and administrative credential database dumped in plaintext on dark web forum, containing active password hashes and corporate emails.",
    remediation: ["Enforce tenant-wide password rotation", "Deploy localized MFA renewal protocols"],
    indicatorType: "Email",
    indicatorValue: "admin@global-retail-solutions[.]com",
    source: "Dark Web Forum Monitor"
  },
  {
    name: "Public Pastebin Plaintext DevSecOps Tokens",
    description: "Plaintext developers login tokens and AWS client credentials leaked in public code paste, granting root database access.",
    remediation: ["Revoke current AWS secret keys immediately", "Audit database query logs for suspicious API actions"],
    indicatorType: "URL",
    indicatorValue: "hxxps://pastebin[.]com/raw/xz891823",
    source: "Source Code Leak Scanner"
  },
  {
    name: "SaaS Enterprise Billing Customer Credentials",
    description: "Active customer CRM billing dashboard passwords exposed via unsecured Elasticsearch instance index.",
    remediation: ["Quarantine affected customer records", "Rotate cloud credential access tokens"],
    indicatorType: "Email",
    indicatorValue: "billing-lead@enterprise-saas[.]com",
    source: "Cloud Security Leak Probe"
  }
];

const malwareTemplates = [
  {
    name: "Redline Stealer Payload Variant G",
    description: "High-severity infostealer designed to scrape browser-stored credentials, payment vectors, system details, and crypto wallet files.",
    remediation: ["Run full host antivirus scans", "Isolate infected subnets from public network gateways"],
    indicatorType: "Hash",
    indicatorValue: "f3a098bc19d3f820ae91b0123cbef901b023de4f67891ad0bcf4e90a",
    source: "Workstation Threat Endpoint"
  },
  {
    name: "LockBit 3.0 Ransomware Executable Variant",
    description: "Destructive malware that executes multi-threaded disk file encryption, leaving ransom text instructions on victims' desktop wallpaper.",
    remediation: ["Isolate host immediately", "Deploy offline storage backup copies"],
    indicatorType: "Hash",
    indicatorValue: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    source: "External C2 Gateway Honeynet"
  },
  {
    name: "AgentTesla Spyware Socket Payload",
    description: "Stealthy spyware keylogger that records keystrokes and periodically uploads files over secure SMTP ports to rogue email accounts.",
    remediation: ["Block source command C2 IP addresses", "Deploy active memory sweep on host subnets"],
    indicatorType: "IP",
    indicatorValue: "185[.]220[.]101[.]99",
    source: "Network Packet Analyzer"
  }
];

// Sub-categories list
const categories = [
  { id: 'Scam', labelEn: 'Scams', labelAr: 'عمليات الاحتيال' },
  { id: 'Phishing', labelEn: 'Phishing', labelAr: 'التصيد الإلكتروني' },
  { id: 'Domain', labelEn: 'Malicious Domains', labelAr: 'النطاقات الخبيثة' },
  { id: 'Credential', labelEn: 'Leaked Credentials', labelAr: 'تسريبات الهوية' },
  { id: 'Malware', labelEn: 'Malware', labelAr: 'البرمجيات الخبيثة' }
];

export function LiveThreatFeed({ language = 'English', theme = 'dark' }: LiveThreatFeedProps) {
  const isRTL = language === 'Arabic';
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(8000); // interval duration in ms (8s default)
  const [events, setEvents] = useState<LiveFeedEvent[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [ingestedIds, setIngestedIds] = useState<Set<string>>(new Set());
  const [cumulativeStats, setCumulativeStats] = useState({
    Total: 0,
    Scam: 0,
    Phishing: 0,
    Domain: 0,
    Credential: 0,
    Malware: 0
  });

  // Keep track of counts for generating unique random records
  const eventCounterRef = useRef(0);

  // Auto-generator function
  const generateRandomThreat = (specificCategory?: string): LiveFeedEvent => {
    eventCounterRef.current += 1;
    const catList = ['Scam', 'Phishing', 'Domain', 'Credential', 'Malware'];
    const chosenCat = specificCategory || catList[Math.floor(Math.random() * catList.length)];
    
    let templateList;
    switch (chosenCat) {
      case 'Scam': templateList = scamTemplates; break;
      case 'Phishing': templateList = phishTemplates; break;
      case 'Domain': templateList = domainTemplates; break;
      case 'Credential': templateList = credentialTemplates; break;
      default: templateList = malwareTemplates; break;
    }

    const baseTemplate = templateList[Math.floor(Math.random() * templateList.length)];
    const riskScore = Math.floor(65 + Math.random() * 34); // 65 to 99
    
    // Determine severity based on risk score
    let severity: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
    if (riskScore >= 90) severity = 'Critical';
    else if (riskScore >= 80) severity = 'High';
    else if (riskScore >= 70) severity = 'Medium';
    else severity = 'Low';

    // Randomize indicator values slightly to represent dynamic live telemetry
    let processedValue = baseTemplate.indicatorValue;
    if (baseTemplate.indicatorType === 'IP') {
      processedValue = `185.220.101.${Math.floor(10 + Math.random() * 240)}`;
    } else if (baseTemplate.indicatorType === 'Domain') {
      processedValue = processedValue.replace(/\[\.\]/g, '.');
      processedValue = `${Math.random().toString(36).substring(2, 6)}.${processedValue}`;
    } else if (baseTemplate.indicatorType === 'URL') {
      processedValue = processedValue.replace(/\[\.\]/g, '.').replace(/^hxxp/i, 'http');
      const parts = processedValue.split('/');
      parts[2] = `${Math.random().toString(36).substring(2, 6)}.${parts[2]}`;
      processedValue = parts.join('/');
    } else if (baseTemplate.indicatorType === 'Email') {
      processedValue = processedValue.replace(/\[\.\]/g, '.');
      processedValue = `${Math.random().toString(36).substring(2, 6)}@${processedValue.split('@')[1]}`;
    } else if (baseTemplate.indicatorType === 'CryptoWallet') {
      processedValue = processedValue.substring(0, 8) + Math.random().toString(16).substring(2, 10) + processedValue.substring(18);
    } else if (baseTemplate.indicatorType === 'Hash') {
      processedValue = Math.random().toString(16).substring(2, 12) + processedValue.substring(10);
    }

    const uniqueId = `live-feed-${Date.now()}-${eventCounterRef.current}`;

    return {
      id: uniqueId,
      name: `${baseTemplate.name} #${Math.floor(100 + Math.random() * 900)}`,
      category: chosenCat as any,
      severity,
      riskScore,
      timestamp: new Date().toISOString(),
      source: baseTemplate.source,
      indicators: [
        {
          type: baseTemplate.indicatorType,
          originalValue: baseTemplate.indicatorValue,
          value: processedValue
        }
      ],
      description: baseTemplate.description,
      remediation: baseTemplate.remediation
    };
  };

  // Populate initial feed items on load
  useEffect(() => {
    const initialEvents = [
      generateRandomThreat(),
      generateRandomThreat(),
      generateRandomThreat()
    ];
    setEvents(initialEvents);
    setCumulativeStats({
      Total: 3,
      Scam: initialEvents.filter(e => e.category === 'Scam').length,
      Phishing: initialEvents.filter(e => e.category === 'Phishing').length,
      Domain: initialEvents.filter(e => e.category === 'Domain').length,
      Credential: initialEvents.filter(e => e.category === 'Credential').length,
      Malware: initialEvents.filter(e => e.category === 'Malware').length
    });
  }, []);

  // Interval trigger for live generator
  useEffect(() => {
    if (!isPlaying) return;

    const runFeed = () => {
      const newEvent = generateRandomThreat();
      setEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Cap the scroll feed at 20 items for memory
      setCumulativeStats(prev => ({
        ...prev,
        Total: prev.Total + 1,
        [newEvent.category]: prev[newEvent.category] + 1
      }));
    };

    const interval = setInterval(runFeed, speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  // Handle immediate manual trigger of threat category
  const handleSimulateThreat = (specificCat: 'Scam' | 'Phishing' | 'Domain' | 'Credential' | 'Malware') => {
    const newEvent = generateRandomThreat(specificCat);
    setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
    setCumulativeStats(prev => ({
      ...prev,
      Total: prev.Total + 1,
      [newEvent.category]: prev[newEvent.category] + 1
    }));
  };

  // INGEST AN ENTRY INTO SENTRY DATABASE
  const handleIngestToDatabase = (evt: LiveFeedEvent) => {
    if (ingestedIds.has(evt.id)) return;

    try {
      // 1. Fetch current threats from localStorage
      let currentThreats: ThreatRecord[] = [];
      const savedThreats = localStorage.getItem('sentry_threat_records');
      if (savedThreats) {
        currentThreats = JSON.parse(savedThreats);
      }

      // Convert live feed indicators to standard ThreatIndicator
      const standardIndicators: ThreatIndicator[] = evt.indicators.map((ind, i) => {
        const normalized = normalizeIndicator(ind.type, ind.value);
        return {
          id: `ind-live-ingested-${Date.now()}-${i}`,
          type: ind.type as any,
          originalValue: ind.originalValue,
          value: normalized.normalized,
          description: normalized.description,
          addedAt: new Date().toISOString().split('T')[0]
        };
      });

      // Construct standard threat record
      const newRecord: ThreatRecord = {
        id: `threat-live-ingested-${Date.now()}`,
        name: evt.name,
        threatType: evt.category === 'Credential' ? 'Leaked Credentials' : evt.category === 'Domain' ? 'Malicious Domain' : evt.category,
        severity: evt.severity,
        riskScore: evt.riskScore,
        confidence: "High",
        firstSeen: evt.timestamp,
        lastSeen: evt.timestamp,
        aiSummary: evt.description,
        recommendedActions: evt.remediation,
        campaignId: null, // Standalone real-time threat
        indicators: standardIndicators,
        addedAt: new Date().toISOString().split('T')[0]
      };

      // Unshift to the beginning of threats
      currentThreats.unshift(newRecord);

      // Save back and broadcast event
      localStorage.setItem('sentry_threat_records', JSON.stringify(currentThreats));
      
      // Update local set
      setIngestedIds(prev => {
        const next = new Set(prev);
        next.add(evt.id);
        return next;
      });

      // Broadcast update events to refresh other tabs instantly
      window.dispatchEvent(new Event('sentry-threats-updated'));
      window.dispatchEvent(new Event('storage'));

    } catch (e) {
      console.error("Failed to ingest threat", e);
    }
  };

  const handleClearStream = () => {
    setEvents([]);
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'High': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Medium': return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
    }
  };

  const filteredEvents = events.filter(evt => {
    if (categoryFilter === 'All') return true;
    return evt.category === categoryFilter;
  });

  return (
    <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'} space-y-6`}>
      {/* Header Panel */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} pb-5 ${isRTL ? 'md:flex-row-reverse text-right' : ''}`}>
        <div className="space-y-1">
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="p-1 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded-lg">
              <Radio className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-cyan-400' : 'text-white/30'}`} />
            </span>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
              {isRTL ? "موجز حسي نشط للتهديدات" : "ACTIVE STRATEGIC TELEMETRY STREAM"}
            </span>
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">
            {isRTL ? "موجز التهديدات المباشر والحي" : "Live Threat Intel Feed"}
          </h3>
          <p className="text-xs text-white/50 leading-relaxed">
            {isRTL 
              ? "مراقبة مستمرة وبث حي لمكافحة هجمات التصيد والبرمجيات الخبيثة وتسريب الهويات والنطاقات المجهولة."
              : "Continuous ingestion monitoring stream tracking real-time scams, phishing runs, malware clusters, leaked credentials, and rogue subdomains."}
          </p>
        </div>

        {/* Action Controls */}
        <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Pause / Play */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              isPlaying 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{isRTL ? "إيقاف مؤقت" : "Pause Stream"}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{isRTL ? "استئناف البث" : "Resume Stream"}</span>
              </>
            )}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/5 p-1 rounded-xl text-[10px] font-mono">
            {[
              { label: '3s', ms: 3000 },
              { label: '8s', ms: 8000 },
              { label: '15s', ms: 15000 }
            ].map(sp => (
              <button
                key={sp.ms}
                onClick={() => setSpeed(sp.ms)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  speed === sp.ms 
                    ? 'bg-cyan-400 text-black' 
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClearStream}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white/50 hover:text-white transition-all text-xs"
            title={isRTL ? "تطهير الشاشة" : "Clear Feed Display"}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Tickers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: isRTL ? 'إجمالي الدفق' : 'Total Streamed', val: cumulativeStats.Total, color: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5' },
          { label: isRTL ? 'الاحتيال' : 'Scams', val: cumulativeStats.Scam, color: 'text-amber-500 border-amber-500/20 bg-amber-500/5' },
          { label: isRTL ? 'التصيد' : 'Phishing', val: cumulativeStats.Phishing, color: 'text-rose-500 border-rose-500/20 bg-rose-500/5' },
          { label: isRTL ? 'النطاقات' : 'Rogue Domains', val: cumulativeStats.Domain, color: 'text-purple-500 border-purple-500/20 bg-purple-500/5' },
          { label: isRTL ? 'التسريبات' : 'Leaked Creds', val: cumulativeStats.Credential, color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' },
          { label: isRTL ? 'البرمجيات' : 'Malware Payload', val: cumulativeStats.Malware, color: 'text-red-500 border-red-500/20 bg-red-500/5' }
        ].map((met, index) => (
          <div key={index} className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-[#08090A] border-white/5' : 'bg-slate-50 border-slate-200'} text-center space-y-1`}>
            <span className="text-[9px] font-mono text-white/40 uppercase block tracking-wider truncate">{met.label}</span>
            <span className={`text-lg font-black block tracking-tight ${met.color.split(' ')[0]}`}>{met.val}</span>
          </div>
        ))}
      </div>

      {/* Instant Injection trigger panel */}
      <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#08090A] border-white/5' : 'bg-slate-50 border-slate-200'} flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'md:flex-row-reverse text-right' : ''}`}>
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-white flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isRTL ? "مُحاكي غرس المخاطر المباشر" : "Interactive Hazard Injector"}</span>
          </p>
          <p className="text-[10px] text-white/40">
            {isRTL 
              ? "انقر فوراً لحقن نوع معين من المخاطر الحية لتغذية محرك الاستجابة التلقائي وتجربتها."
              : "Inject an immediate, custom threat event into the telemetry stream to observe normalization and defense."}
          </p>
        </div>
        <div className={`flex flex-wrap gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleSimulateThreat(cat.id as any)}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/[0.08] border border-white/5 rounded-lg text-[10px] text-white/70 hover:text-white font-mono font-bold uppercase transition-all flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>{isRTL ? cat.labelAr : cat.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main interactive stream container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stream Filter */}
        <div className="lg:col-span-3 space-y-3">
          <span className={`text-[10px] font-mono text-white/40 uppercase tracking-wider block font-bold ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? "فلترة دفق الموجز:" : "FILTER STREAM EVENT CATEGORIES:"}
          </span>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setCategoryFilter('All')}
              className={`px-3 py-2 rounded-lg text-xs text-left font-bold transition-all border flex items-center justify-between ${
                categoryFilter === 'All' 
                  ? 'bg-cyan-400/10 border-cyan-400/30 text-white' 
                  : 'bg-white/5 border-transparent text-white/50 hover:text-white hover:bg-white/[0.08]'
              } ${isRTL ? 'flex-row-reverse text-right' : ''}`}
            >
              <span>{isRTL ? "جميع التهديدات الحية" : "All Live Events"}</span>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
            </button>
            {categories.map(cat => {
              const count = events.filter(e => e.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-2 rounded-lg text-xs text-left font-bold transition-all border flex items-center justify-between ${
                    categoryFilter === cat.id 
                      ? 'bg-cyan-400/10 border-cyan-400/30 text-white' 
                      : 'bg-white/5 border-transparent text-white/50 hover:text-white hover:bg-white/[0.08]'
                  } ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                >
                  <span>{isRTL ? cat.labelAr : cat.labelEn}</span>
                  <div className="flex items-center gap-2">
                    {count > 0 && (
                      <span className="text-[9px] bg-cyan-400 text-black px-1.5 py-0.5 rounded-full font-mono font-black">
                        {count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Ingested List */}
        <div className="lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block font-bold">
              {isRTL ? `الموجز النشط (${filteredEvents.length} تظهر)` : `REAL-TIME TELEMETRY STREAM (${filteredEvents.length} visible)`}
            </span>
          </div>

          <div className={`max-h-[500px] overflow-y-auto pr-1 space-y-3 scrollbar-thin ${theme === 'dark' ? 'scrollbar-thumb-white/10' : 'scrollbar-thumb-slate-200'}`}>
            <AnimatePresence initial={false}>
              {filteredEvents.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-12 text-center border border-dashed rounded-xl ${theme === 'dark' ? 'border-white/5 text-white/15' : 'border-slate-200 text-slate-400'}`}
                >
                  <Activity className="w-10 h-10 mx-auto text-white/10 mb-2 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-wider">{isRTL ? "لا توجد تهديدات في البث حالياً" : "Telemetry is currently clean / empty"}</p>
                </motion.div>
              ) : (
                filteredEvents.map((evt) => {
                  const hasBeenIngested = ingestedIds.has(evt.id);
                  return (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: -10, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`p-4 rounded-xl border transition-all ${
                        theme === 'dark' ? 'bg-[#08090A] border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className={`flex flex-col md:flex-row justify-between items-start gap-4 ${isRTL ? 'md:flex-row-reverse text-right' : ''}`}>
                        
                        {/* Title & Category Tag */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getSeverityColor(evt.severity)}`}>
                              {evt.severity}
                            </span>
                            <span className="text-[9px] bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                              {evt.category}
                            </span>
                            <span className="text-[9px] text-white/40 font-mono">
                              {evt.source}
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-extrabold text-white group-hover:text-cyan-400 transition-colors">
                            {evt.name}
                          </h4>
                          
                          <p className="text-xs text-white/60 leading-relaxed">
                            {evt.description}
                          </p>

                          {/* Indicators info */}
                          <div className={`flex flex-wrap gap-2 pt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {evt.indicators.map((ind, i) => (
                              <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 font-mono text-[10px] text-cyan-300">
                                <span className="bg-cyan-400/10 text-cyan-400 px-1 py-0.5 rounded text-[8px] font-bold uppercase">{ind.type}</span>
                                <span className="truncate max-w-[250px]">{ind.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Ingestion Button */}
                        <div className={`flex flex-col gap-1.5 items-end ${isRTL ? 'items-start' : 'items-end'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/30 font-mono">
                              {new Date(evt.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          </div>

                          <button
                            onClick={() => handleIngestToDatabase(evt)}
                            disabled={hasBeenIngested}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                              hasBeenIngested 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default' 
                                : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow active:scale-95'
                            }`}
                          >
                            {hasBeenIngested ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                <span>{isRTL ? "مدرج بالمركز" : "Injected"}</span>
                              </>
                            ) : (
                              <>
                                <Database className="w-3 h-3" />
                                <span>{isRTL ? "غرس بالمركز" : "Ingest Threat"}</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
