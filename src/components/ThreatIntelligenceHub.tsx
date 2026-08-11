import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Activity, 
  FileText, 
  Brain, 
  Filter, 
  Calendar, 
  Check, 
  Trash2, 
  Sliders, 
  Globe, 
  Fingerprint, 
  Wallet, 
  Phone, 
  Shield, 
  Tag, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Upload, 
  Copy, 
  Flame,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Sparkle,
  X,
  Users,
  ChevronRight,
  TrendingUp,
  Lock,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeThreatReport, IngestedThreatAnalysis } from '../services/geminiService';
import { LiveThreatFeed } from './LiveThreatFeed';
import { ObitrexSICCoreView } from './SentrySICCoreView';
import { CentralIntelligenceCore } from '../services/centralIntelligenceCore';

// Interfaces for Threat Intelligence
export interface ThreatIndicator {
  id: string;
  type: "URL" | "Domain" | "Email" | "Phone" | "CryptoWallet" | "IP" | "Hash";
  originalValue: string;
  value: string;
  description: string;
  addedAt: string;
}

export interface ThreatCampaign {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Monitored" | "Remediated" | "Closed";
  targetSectors: string[];
  countries: string[];
  victimCount: number;
  aiSummary: string;
  threatCount: number;
  addedAt: string;
  relatedDomains?: string[];
  relatedEmails?: string[];
  relatedWallets?: string[];
  customTimeline?: { date: string; title: string; desc: string }[];
}

export interface ThreatRecord {
  id: string;
  name: string;
  threatType: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  riskScore: number;
  confidence: "High" | "Medium" | "Low";
  firstSeen: string;
  lastSeen: string;
  aiSummary: string;
  recommendedActions: string[];
  campaignId: string | null;
  indicators: ThreatIndicator[];
  addedAt: string;
}

// Ingestion Pipeline Log Item
interface NormalizationLog {
  timestamp: string;
  type: string;
  original: string;
  normalized: string;
  status: "Success" | "Ignored";
}

// Indicator normalization logic
export function normalizeIndicator(type: string, value: string): { original: string, normalized: string, description: string } {
  const original = value;
  let normalized = value.trim();
  let description = '';

  switch (type) {
    case 'URL':
      // replace hxxp/hxxps with http/https
      normalized = normalized.replace(/^hxxp(s?)/i, (_, s) => `http${s || ''}`);
      // remove brackets around dots e.g., [.] or (.)
      normalized = normalized.replace(/\[\.\]/g, '.').replace(/\(\.\)/g, '.');
      normalized = normalized.replace(/\[:\]/g, ':');
      description = 'Sanitized Web Destination Link';
      break;
    case 'Domain':
      // remove protocols if present
      normalized = normalized.replace(/^https?:\/\//i, '');
      // remove path and query params
      normalized = normalized.split('/')[0];
      // remove www.
      normalized = normalized.replace(/^www\./i, '');
      // replace brackets
      normalized = normalized.replace(/\[\.\]/g, '.').replace(/\(\.\)/g, '.');
      normalized = normalized.toLowerCase();
      description = 'Normalized Target Domain Host';
      break;
    case 'Email':
      // replace bracket defanging
      normalized = normalized.replace(/\[\.\]/g, '.').replace(/\(\.\)/g, '.');
      normalized = normalized.replace(/\s+/g, '');
      normalized = normalized.toLowerCase();
      description = 'Standardized Target Email Address';
      break;
    case 'Phone':
      // keep only numbers, + and -
      normalized = normalized.replace(/[^\d+-]/g, '');
      description = 'Sanitized Communication Line';
      break;
    case 'CryptoWallet':
      // trim spaces, preserve wallet casing
      normalized = normalized.replace(/\s+/g, '');
      description = 'Verified Cryptocurrency Address';
      break;
    case 'IP':
      // replace bracket defanging e.g. 192[.]168[.]1[.]1
      normalized = normalized.replace(/\[\.\]/g, '.').replace(/\(\.\)/g, '.');
      normalized = normalized.replace(/\s+/g, '');
      description = 'Standardized Host IP Address';
      break;
    case 'Hash':
      // clean whitespace, lower hex characters
      normalized = normalized.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
      if (normalized.length === 32) description = 'MD5 Cryptographic Hash';
      else if (normalized.length === 40) description = 'SHA-1 Cryptographic Hash';
      else if (normalized.length === 64) description = 'SHA-256 Cryptographic Hash';
      else description = 'File Fingerprint Hash';
      break;
    default:
      description = 'Identified Indicator of Compromise';
  }

  return { original, normalized, description };
}

// Pre-seeded database items for high-fidelity mock data on initial render
const defaultCampaigns: ThreatCampaign[] = [
  {
    id: "camp-cobalt-shadow",
    name: "Operation Cobalt Shadow",
    description: "Highly coordinated APT campaign targeting secure financial protocols and sovereign banking gateways.",
    status: "Active",
    targetSectors: ["Finance", "Banking", "Government"],
    countries: ["United States", "United Kingdom", "Germany", "Japan"],
    victimCount: 48,
    aiSummary: "A state-sponsored cyber espionage campaign utilizing sophisticated double-extortion payloads and custom single sign-on credential phish portals. The threat actors demonstrate persistent command & control capabilities through nested reverse-proxy networks.",
    threatCount: 2,
    addedAt: "2026-06-10",
    relatedDomains: ["cobalt-api-gate.net", "secure-bank-login-update.com"],
    relatedEmails: ["security@cobalt-gateway.com"],
    relatedWallets: [],
    customTimeline: [
      { date: "2026-06-10", title: "Campaign Detection", desc: "First sighting of Operation Cobalt Shadow phishing vectors." },
      { date: "2026-06-12", title: "Core Backdoor Discovered", desc: "APT malware payload analyzed and neutralized on staging subnet." }
    ]
  },
  {
    id: "camp-vanguard",
    name: "Vanguard Crypto Ransomware",
    description: "Multiphase ransomware campaigns targeting cloud databases with double extortion mechanisms.",
    status: "Monitored",
    targetSectors: ["Healthcare", "Cloud Services", "Logistics"],
    countries: ["Canada", "Australia", "France"],
    victimCount: 15,
    aiSummary: "A financially motivated ransomware group targeting database infrastructure. Demands payment in cryptocurrencies through specialized communication portals.",
    threatCount: 1,
    addedAt: "2026-06-25",
    relatedDomains: ["vanguard-extortion.onion"],
    relatedEmails: [],
    relatedWallets: ["1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"],
    customTimeline: [
      { date: "2026-06-25", title: "Ransomware Attack", desc: "First victim logs server-wide file encryption with payment instructions." }
    ]
  },
  {
    id: "camp-volt-typhoon",
    name: "Volt Typhoon Scams",
    description: "Broad-spectrum credential harvesting and SMS/email spoofing mimicking enterprise providers.",
    status: "Remediated",
    targetSectors: ["Telecommunications", "Education"],
    countries: ["India", "Singapore", "New Zealand"],
    victimCount: 112,
    aiSummary: "SMS and phishing sweep mimicking local enterprise billing portals and support desks. Neutralized via coordination with domain registrars.",
    threatCount: 1,
    addedAt: "2026-07-01",
    relatedDomains: ["login.microsoft-auth-update.live"],
    relatedEmails: ["support@telecom-verify-assist.org"],
    relatedWallets: [],
    customTimeline: [
      { date: "2026-07-01", title: "Campaign Launch", desc: "Spam phone arrays flood telecomm carriers with billing failure warnings." },
      { date: "2026-07-14", title: "Command and Control Blocked", desc: "C2 endpoints added to global firewall registries, collapsing the campaign." }
    ]
  }
];

const defaultThreats: ThreatRecord[] = [
  {
    id: "threat-1",
    name: "Cobalt Shadow Backdoor Core",
    threatType: "APT",
    severity: "Critical",
    riskScore: 94,
    confidence: "High",
    firstSeen: "2026-06-12T04:15:00.000Z",
    lastSeen: "2026-07-15T18:30:00.000Z",
    aiSummary: "Sophisticated remote backdoor deployed via target phishing attachments. Uses high-entropy payloads to hijack local terminal states and establish silent outbound sockets to malicious server infrastructures.",
    recommendedActions: [
      "Block outbound connections to identified C2 IP addresses.",
      "Revoke and rotate active access tokens on affected subnets.",
      "Enforce strictly isolated, zero-trust rules on container runtime gates."
    ],
    campaignId: "camp-cobalt-shadow",
    addedAt: "2026-06-15",
    indicators: [
      {
        id: "ind-1",
        type: "IP",
        originalValue: "185[.]220[.]101[.]45",
        value: "185.220.101.45",
        description: "Standardized Host IP Address",
        addedAt: "2026-06-15"
      },
      {
        id: "ind-2",
        type: "Domain",
        originalValue: "cobalt-api-gate[.]net",
        value: "cobalt-api-gate.net",
        description: "Normalized Target Domain Host",
        addedAt: "2026-06-15"
      },
      {
        id: "ind-3",
        type: "Hash",
        originalValue: "a1b2c3d4e5f607182930a4b5c6d7e8f9",
        value: "a1b2c3d4e5f607182930a4b5c6d7e8f9",
        description: "MD5 Cryptographic Hash",
        addedAt: "2026-06-15"
      }
    ]
  },
  {
    id: "threat-2",
    name: "Cobalt Phishing Portal",
    threatType: "Phishing",
    severity: "High",
    riskScore: 82,
    confidence: "Medium",
    firstSeen: "2026-06-14T09:00:00.000Z",
    lastSeen: "2026-07-12T22:10:00.000Z",
    aiSummary: "Credential harvesting portal dressed as authentic corporate single sign-on triggers. Utilizes urgent threat hooks (e.g., 'MFA Key Update') to collect security vectors.",
    recommendedActions: [
      "Incorporate malicious domain credentials into secure mail filters.",
      "Conduct dark web sweeps for potentially compromised administrative mailboxes.",
      "Deploy localized MFA renewal protocols to authenticate true identities."
    ],
    campaignId: "camp-cobalt-shadow",
    addedAt: "2026-06-16",
    indicators: [
      {
        id: "ind-4",
        type: "URL",
        originalValue: "hxxps://secure-bank-login-update[.]com/auth",
        value: "https://secure-bank-login-update.com/auth",
        description: "Sanitized Web Destination Link",
        addedAt: "2026-06-16"
      },
      {
        id: "ind-5",
        type: "Email",
        originalValue: "security@cobalt-gateway[.]com",
        value: "security@cobalt-gateway.com",
        description: "Standardized Target Email Address",
        addedAt: "2026-06-16"
      }
    ]
  },
  {
    id: "threat-3",
    name: "Vanguard Ransomware v3.2 Payload",
    threatType: "Ransomware",
    severity: "Critical",
    riskScore: 98,
    confidence: "High",
    firstSeen: "2026-06-25T11:45:00.000Z",
    lastSeen: "2026-07-16T02:15:00.000Z",
    aiSummary: "Lethal cryptographic ransomware targeting local databases. Leverages multi-threaded file encryption algorithms to lock local resources, subsequently executing a payment demand to specific crypto wallets.",
    recommendedActions: [
      "Isolate critical staging servers from public network gateways.",
      "Deploy offline database snapshots to recover uncorrupted backups.",
      "Add security indicators to firewalls to halt Vanguard lateral movement."
    ],
    campaignId: "camp-vanguard",
    addedAt: "2026-06-27",
    indicators: [
      {
        id: "ind-6",
        type: "CryptoWallet",
        originalValue: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        value: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        description: "Verified Cryptocurrency Address",
        addedAt: "2026-06-27"
      },
      {
        id: "ind-7",
        type: "Hash",
        originalValue: "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855",
        value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        description: "SHA-256 Cryptographic Hash",
        addedAt: "2026-06-27"
      }
    ]
  },
  {
    id: "threat-4",
    name: "Volt Typhoon Social Spoof",
    threatType: "Social Engineering",
    severity: "High",
    riskScore: 78,
    confidence: "High",
    firstSeen: "2026-07-01T08:00:00.000Z",
    lastSeen: "2026-07-14T17:40:00.000Z",
    aiSummary: "SMS and support scam using social channels. Attractors claim severe billing failures to manipulate clients into calling spoofed administrative phone lines to resolve disputes.",
    recommendedActions: [
      "Block spam phone number arrays with global telecom registers.",
      "Transmit alert notifications to users alerting them to active support spoofs.",
      "Enforce dynamic host domain lockouts to break the communication chain."
    ],
    campaignId: "camp-volt-typhoon",
    addedAt: "2026-07-02",
    indicators: [
      {
        id: "ind-8",
        type: "Domain",
        originalValue: "login.microsoft-auth-update[.]live",
        value: "login.microsoft-auth-update.live",
        description: "Normalized Target Domain Host",
        addedAt: "2026-07-02"
      },
      {
        id: "ind-9",
        type: "Phone",
        originalValue: "+1-888-512-0943",
        value: "+18885120943",
        description: "Sanitized Communication Line",
        addedAt: "2026-07-02"
      }
    ]
  }
];

// Auto-link utility to find match between a threat and existing campaigns
export function findAutoCampaignLink(
  threatName: string,
  aiSummary: string,
  indicators: { type: string; value: string }[],
  campaignsList: ThreatCampaign[]
): { campaignId: string; reason: string } | null {
  const nameLower = threatName.toLowerCase();
  const summaryLower = aiSummary.toLowerCase();

  for (const camp of campaignsList) {
    const campNameLower = camp.name.toLowerCase();
    
    // 1. Keyword match on campaign name (excluding generic words)
    const keywords = campNameLower
      .replace(/operation|campaign|scams|scam|crypto|ransomware/gi, "")
      .trim()
      .split(/\s+/)
      .filter(w => w.length >= 3);
    
    for (const kw of keywords) {
      if (kw.length >= 3 && (nameLower.includes(kw) || summaryLower.includes(kw))) {
        return { 
          campaignId: camp.id, 
          reason: `Keyword match on '${kw}' in threat name/briefing` 
        };
      }
    }

    // 2. Matching against campaign sectors or related lists
    const campDomains = camp.relatedDomains || [];
    const campEmails = camp.relatedEmails || [];
    const campWallets = camp.relatedWallets || [];
    
    for (const ind of indicators) {
      const valLower = ind.value.toLowerCase();
      
      // Match domains
      if (ind.type === "Domain" || ind.type === "URL") {
        if (campDomains.some(d => valLower.includes(d.toLowerCase()) || d.toLowerCase().includes(valLower))) {
          return {
            campaignId: camp.id,
            reason: `Indicator domain/URL matches associated campaign domain`
          };
        }
      }
      // Match emails
      if (ind.type === "Email") {
        if (campEmails.some(e => valLower === e.toLowerCase())) {
          return {
            campaignId: camp.id,
            reason: `Indicator email matches associated campaign email`
          };
        }
      }
      // Match wallets
      if (ind.type === "CryptoWallet") {
        if (campWallets.some(w => valLower === w.toLowerCase())) {
          return {
            campaignId: camp.id,
            reason: `Crypto wallet address matches associated campaign wallet`
          };
        }
      }
    }
  }

  return null;
}

export function ThreatIntelligenceHub({ language = "English", theme = "dark" }: { language?: string, theme?: string }) {
  const isRTL = language === 'Arabic';
  
  // State variables for Hub data
  const [threats, setThreats] = useState<ThreatRecord[]>(() => {
    const saved = localStorage.getItem('sentry_threat_records');
    return saved ? JSON.parse(saved) : defaultThreats;
  });
  
  const [campaigns, setCampaigns] = useState<ThreatCampaign[]>(() => {
    const saved = localStorage.getItem('sentry_threat_campaigns');
    return saved ? JSON.parse(saved) : defaultCampaigns;
  });

  const [normalizationLogs, setNormalizationLogs] = useState<NormalizationLog[]>(() => {
    const saved = localStorage.getItem('sentry_normalization_logs');
    return saved ? JSON.parse(saved) : [
      { timestamp: "2026-07-16T10:00:00.000Z", type: "IP", original: "185[.]220[.]101[.]45", normalized: "185.220.101.45", status: "Success" },
      { timestamp: "2026-07-16T10:05:00.000Z", type: "URL", original: "hxxps://secure-bank-login-update[.]com/auth", normalized: "https://secure-bank-login-update.com/auth", status: "Success" },
      { timestamp: "2026-07-16T10:10:00.000Z", type: "Hash", original: "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855", normalized: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", status: "Success" }
    ];
  });

  // Active navigation tab within the Hub
  const [hubTab, setHubTab] = useState<'overview' | 'ingestion' | 'database' | 'campaigns' | 'timeline' | 'indicators' | 'sic'>('overview');
  
  // Ingestion panel sub-tabs
  const [ingestMode, setIngestMode] = useState<'ai' | 'manual' | 'csv'>('ai');

  // Interactive filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterCampaign, setFilterCampaign] = useState<string>('All');
  const [selectedThreat, setSelectedThreat] = useState<ThreatRecord | null>(null);

  // AI Ingestion specific state
  const [rawReport, setRawReport] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiParsedResult, setAiParsedResult] = useState<IngestedThreatAnalysis | null>(null);
  const [aiSelectedCampaign, setAiSelectedCampaign] = useState<string>('none');
  const [aiReportError, setAiReportError] = useState<string | null>(null);

  // Manual form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Malware');
  const [formSeverity, setFormSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [formRiskScore, setFormRiskScore] = useState(75);
  const [formConfidence, setFormConfidence] = useState<'High' | 'Medium' | 'Low'>('High');
  const [formSummary, setFormSummary] = useState('');
  const [formActions, setFormActions] = useState('');
  const [formCampaign, setFormCampaign] = useState('none');
  const [formIndicators, setFormIndicators] = useState<{ type: string, value: string }[]>([{ type: 'IP', value: '' }]);

  // CSV Ingest state
  const [csvRawText, setCsvRawText] = useState('');
  const [csvTargetThreatName, setCsvTargetThreatName] = useState('Bulk CSV Ingestion Threat');
  const [csvInferredIndicators, setCsvInferredIndicators] = useState<{ type: string, original: string, normalized: string, description: string, valid: boolean }[]>([]);

  // Campaign Form State
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');
  const [newCampaignSectors, setNewCampaignSectors] = useState('');
  const [newCampaignStatus, setNewCampaignStatus] = useState<"Active" | "Monitored" | "Remediated" | "Closed">("Active");
  const [newCampaignCountries, setNewCampaignCountries] = useState('');
  const [newCampaignVictims, setNewCampaignVictims] = useState(0);
  const [newCampaignAiSummary, setNewCampaignAiSummary] = useState('');
  const [newCampaignDomains, setNewCampaignDomains] = useState('');
  const [newCampaignEmails, setNewCampaignEmails] = useState('');
  const [newCampaignWallets, setNewCampaignWallets] = useState('');
  const [newCampaignTimeline, setNewCampaignTimeline] = useState<{ date: string; title: string; desc: string }[]>([]);
  const [campaignSuccessMsg, setCampaignSuccessMsg] = useState(false);

  // Selected Campaign and Flow control states
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("camp-cobalt-shadow");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [autoLinkAlert, setAutoLinkAlert] = useState<{ threatName: string; campaignName: string; reason: string } | null>(null);

  // Indicator lookup state
  const [lookupValue, setLookupValue] = useState('');
  const [lookupResult, setLookupResult] = useState<{ indicator: ThreatIndicator, threat: ThreatRecord }[] | null>(null);
  const [lookupSearched, setLookupSearched] = useState(false);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('sentry_threat_records', JSON.stringify(threats));
  }, [threats]);

  useEffect(() => {
    localStorage.setItem('sentry_threat_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('sentry_normalization_logs', JSON.stringify(normalizationLogs));
  }, [normalizationLogs]);

  // Handle live threat feed ingestion events
  useEffect(() => {
    const handleStorageUpdate = () => {
      const savedThreats = localStorage.getItem('sentry_threat_records');
      if (savedThreats) {
        try {
          setThreats(JSON.parse(savedThreats));
        } catch (e) {
          console.error(e);
        }
      }
      const savedCampaigns = localStorage.getItem('sentry_threat_campaigns');
      if (savedCampaigns) {
        try {
          setCampaigns(JSON.parse(savedCampaigns));
        } catch (e) {
          console.error(e);
        }
      }
      const savedLogs = localStorage.getItem('sentry_normalization_logs');
      if (savedLogs) {
        try {
          setNormalizationLogs(JSON.parse(savedLogs));
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener('sentry-threats-updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('sentry-threats-updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Dynamic Campaign Intelligence Resolver
  const computedCampaigns = useMemo(() => {
    return campaigns.map(camp => {
      const campThreats = threats.filter(t => t.campaignId === camp.id);
      
      // 1. Gather all indicators from associated threats
      const campIndicators = campThreats.flatMap(t => t.indicators);
      
      // 2. Extract and resolve related domains (type: Domain, URL)
      const domainsSet = new Set<string>(camp.relatedDomains || []);
      campIndicators.forEach(ind => {
        if (ind.type === "Domain") {
          domainsSet.add(ind.value);
        } else if (ind.type === "URL") {
          try {
            const cleanUrl = ind.value.replace(/^hxxps?:\/\//i, '').replace(/^https?:\/\//i, '').split('/')[0];
            domainsSet.add(cleanUrl.split(':')[0]);
          } catch {
            domainsSet.add(ind.value);
          }
        }
      });

      // 3. Extract and resolve related emails (type: Email)
      const emailsSet = new Set<string>(camp.relatedEmails || []);
      campIndicators.forEach(ind => {
        if (ind.type === "Email") {
          emailsSet.add(ind.value);
        }
      });

      // 4. Extract and resolve related wallets (type: CryptoWallet)
      const walletsSet = new Set<string>(camp.relatedWallets || []);
      campIndicators.forEach(ind => {
        if (ind.type === "CryptoWallet") {
          walletsSet.add(ind.value);
        }
      });

      // 5. Construct full timeline (combining custom milestones and threat sighting logs)
      const timelineEvents: { date: string; title: string; desc: string; type: 'milestone' | 'sighting' }[] = [];
      
      if (camp.customTimeline) {
        camp.customTimeline.forEach(evt => {
          timelineEvents.push({
            date: evt.date,
            title: evt.title,
            desc: evt.desc,
            type: 'milestone'
          });
        });
      }

      campThreats.forEach(t => {
        timelineEvents.push({
          date: t.firstSeen ? t.firstSeen.split('T')[0] : t.addedAt,
          title: `Threat Sighted: ${t.name}`,
          desc: t.aiSummary || `Indicators: ${t.indicators.map(i => i.value).join(', ')}`,
          type: 'sighting'
        });
      });

      // Sort timeline events chronologically descending
      timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        ...camp,
        indicators: campIndicators,
        relatedDomains: Array.from(domainsSet),
        relatedEmails: Array.from(emailsSet),
        relatedWallets: Array.from(walletsSet),
        timeline: timelineEvents,
        threatCount: campThreats.length
      };
    });
  }, [campaigns, threats]);

  // Find currently selected campaign from computed list
  const selectedCampaign = useMemo(() => {
    return computedCampaigns.find(c => c.id === selectedCampaignId) || computedCampaigns[0] || null;
  }, [computedCampaigns, selectedCampaignId]);

  // Aggregate metrics
  const stats = useMemo(() => {
    const totalThreats = threats.length;
    const criticalCount = threats.filter(t => t.severity === 'Critical' || t.severity === 'High').length;
    const activeCamps = campaigns.filter(c => c.status === 'Active').length;
    
    let totalIndicators = 0;
    threats.forEach(t => {
      totalIndicators += t.indicators.length;
    });

    return { totalThreats, criticalCount, activeCamps, totalIndicators };
  }, [threats, campaigns]);

  // Unified Filtered Threats list
  const filteredThreats = useMemo(() => {
    return threats.filter(record => {
      const matchesSearch = searchQuery.trim() === '' || 
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.threatType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.aiSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.indicators.some(ind => ind.value.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSeverity = filterSeverity === 'All' || record.severity === filterSeverity;
      const matchesType = filterType === 'All' || record.threatType === filterType;
      const matchesCampaign = filterCampaign === 'All' || 
        (filterCampaign === 'None' ? !record.campaignId : record.campaignId === filterCampaign);

      return matchesSearch && matchesSeverity && matchesType && matchesCampaign;
    });
  }, [threats, searchQuery, filterSeverity, filterType, filterCampaign]);

  // List of all threat types
  const allThreatTypes = useMemo(() => {
    const types = new Set<string>();
    threats.forEach(t => types.add(t.threatType));
    return Array.from(types);
  }, [threats]);

  // Timeline list (sorted chronologically by firstSeen)
  const timelineEvents = useMemo(() => {
    const events = threats.map(t => ({
      id: t.id,
      name: t.name,
      type: 'threat',
      threatType: t.threatType,
      severity: t.severity,
      riskScore: t.riskScore,
      timestamp: new Date(t.firstSeen),
      timeString: t.firstSeen,
      lastSeen: t.lastSeen,
      summary: t.aiSummary,
      campaignName: campaigns.find(c => c.id === t.campaignId)?.name || null
    }));

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [threats, campaigns]);

  // Extract indicators directly for the lookup list
  const allIndicatorsList = useMemo(() => {
    const list: { indicator: ThreatIndicator, threat: ThreatRecord }[] = [];
    threats.forEach(t => {
      t.indicators.forEach(ind => {
        list.push({ indicator: ind, threat: t });
      });
    });
    return list;
  }, [threats]);

  // Indicator lookup functionality
  const handleIndicatorLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupValue.trim()) return;

    const normalizedQuery = lookupValue.trim().toLowerCase();
    // Try to find matching indicators
    const results = allIndicatorsList.filter(item => {
      return item.indicator.value.toLowerCase().includes(normalizedQuery) ||
             item.indicator.originalValue.toLowerCase().includes(normalizedQuery);
    });

    setLookupResult(results);
    setLookupSearched(true);
  };

  // Run AI parsing pipeline with Gemini
  const handleAiParsing = async () => {
    if (!rawReport.trim() || isAiParsing) return;
    setIsAiParsing(true);
    setAiReportError(null);
    setAiParsedResult(null);

    try {
      const response = await analyzeThreatReport(rawReport);
      setAiParsedResult(response);
    } catch (err: any) {
      console.error("AI Ingestion failed", err);
      setAiReportError("Intelligence analysis engine encountered an unexpected error. Falling back to structured parser.");
    } finally {
      setIsAiParsing(false);
    }
  };

  // Add AI parsed threat to the database
  const commitAiThreat = () => {
    if (!aiParsedResult) return;

    const newThreatId = `threat-${Date.now()}`;
    const nowStr = new Date().toISOString();

    // Map extracted indicators and run normalization
    const mappedIndicators: ThreatIndicator[] = aiParsedResult.indicators.map((ind, index) => {
      const normalizedResult = normalizeIndicator(ind.type, ind.value);
      
      // Log normalization action
      const log: NormalizationLog = {
        timestamp: nowStr,
        type: ind.type,
        original: ind.value,
        normalized: normalizedResult.normalized,
        status: "Success"
      };
      setNormalizationLogs(prev => [log, ...prev]);

      return {
        id: `ind-extracted-${Date.now()}-${index}`,
        type: ind.type,
        originalValue: ind.value,
        value: normalizedResult.normalized,
        description: ind.description || normalizedResult.description,
        addedAt: nowStr.split('T')[0]
      };
    });

    let targetCampaignId: string | null = aiSelectedCampaign === 'none' ? null : aiSelectedCampaign;
    let autoLinkedReason = "";

    if (!targetCampaignId) {
      const autoLinkResult = findAutoCampaignLink(
        aiParsedResult.name,
        aiParsedResult.aiSummary,
        aiParsedResult.indicators,
        campaigns
      );
      if (autoLinkResult) {
        targetCampaignId = autoLinkResult.campaignId;
        autoLinkedReason = autoLinkResult.reason;
      }
    }

    const newRecord: ThreatRecord = {
      id: newThreatId,
      name: aiParsedResult.name,
      threatType: aiParsedResult.threatType,
      severity: aiParsedResult.severity,
      riskScore: aiParsedResult.riskScore,
      confidence: aiParsedResult.confidence,
      firstSeen: nowStr,
      lastSeen: nowStr,
      aiSummary: aiParsedResult.aiSummary,
      recommendedActions: aiParsedResult.recommendedActions,
      campaignId: targetCampaignId,
      indicators: mappedIndicators,
      addedAt: nowStr.split('T')[0]
    };

    // Increment count on campaign if applicable
    if (targetCampaignId) {
      setCampaigns(prev => prev.map(c => {
        if (c.id === targetCampaignId) {
          return { ...c, threatCount: c.threatCount + 1 };
        }
        return c;
      }));

      if (autoLinkedReason) {
        const linkedCampName = campaigns.find(c => c.id === targetCampaignId)?.name || "Associated Campaign";
        setAutoLinkAlert({
          threatName: aiParsedResult.name,
          campaignName: linkedCampName,
          reason: autoLinkedReason
        });
      }
    }

    setThreats(prev => [newRecord, ...prev]);
    
    // Publish to Obitrex Central Intelligence Core (SIC) event bus
    CentralIntelligenceCore.getInstance().publish("ThreatDetected", "AI_INGESTION_PIPELINE", {
      name: newRecord.name,
      classification: newRecord.threatType,
      riskScore: newRecord.riskScore,
      confidence: newRecord.confidence,
      campaignId: newRecord.campaignId
    });

    // Clear states
    setRawReport('');
    setAiParsedResult(null);
    setAiSelectedCampaign('none');
    
    // Switch to database view and open selected
    setSelectedThreat(newRecord);
    setHubTab('database');
  };

  // Add Manual Threat to database
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const nowStr = new Date().toISOString();
    const newThreatId = `threat-${Date.now()}`;

    // Map indicators and run normalization
    const mappedIndicators: ThreatIndicator[] = formIndicators
      .filter(ind => ind.value.trim() !== '')
      .map((ind, index) => {
        const normalizedResult = normalizeIndicator(ind.type, ind.value);

        // Log normalization
        const log: NormalizationLog = {
          timestamp: nowStr,
          type: ind.type,
          original: ind.value,
          normalized: normalizedResult.normalized,
          status: "Success"
        };
        setNormalizationLogs(prev => [log, ...prev]);

        return {
          id: `ind-manual-${Date.now()}-${index}`,
          type: ind.type as any,
          originalValue: ind.value,
          value: normalizedResult.normalized,
          description: normalizedResult.description,
          addedAt: nowStr.split('T')[0]
        };
      });

    const parsedActions = formActions
      .split('\n')
      .map(act => act.trim())
      .filter(act => act !== '');

    let targetCampaignId: string | null = formCampaign === 'none' ? null : formCampaign;
    let autoLinkedReason = "";

    if (!targetCampaignId) {
      const autoLinkResult = findAutoCampaignLink(
        formName,
        formSummary || "",
        mappedIndicators,
        campaigns
      );
      if (autoLinkResult) {
        targetCampaignId = autoLinkResult.campaignId;
        autoLinkedReason = autoLinkResult.reason;
      }
    }

    const newRecord: ThreatRecord = {
      id: newThreatId,
      name: formName,
      threatType: formType,
      severity: formSeverity,
      riskScore: formRiskScore,
      confidence: formConfidence,
      firstSeen: nowStr,
      lastSeen: nowStr,
      aiSummary: formSummary || "Threat ingested manually via security administration hub.",
      recommendedActions: parsedActions.length > 0 ? parsedActions : ["Scan local networks for matching indicators of compromise."],
      campaignId: targetCampaignId,
      indicators: mappedIndicators,
      addedAt: nowStr.split('T')[0]
    };

    if (targetCampaignId) {
      setCampaigns(prev => prev.map(c => {
        if (c.id === targetCampaignId) {
          return { ...c, threatCount: c.threatCount + 1 };
        }
        return c;
      }));

      if (autoLinkedReason) {
        const linkedCampName = campaigns.find(c => c.id === targetCampaignId)?.name || "Associated Campaign";
        setAutoLinkAlert({
          threatName: formName,
          campaignName: linkedCampName,
          reason: autoLinkedReason
        });
      }
    }

    setThreats(prev => [newRecord, ...prev]);

    // Publish to Obitrex Central Intelligence Core (SIC) event bus
    CentralIntelligenceCore.getInstance().publish("ThreatDetected", "MANUAL_INGESTION_FORM", {
      name: newRecord.name,
      classification: newRecord.threatType,
      riskScore: newRecord.riskScore,
      confidence: newRecord.confidence,
      campaignId: newRecord.campaignId
    });

    // Reset Manual Form
    setFormName('');
    setFormType('Malware');
    setFormSeverity('High');
    setFormRiskScore(75);
    setFormConfidence('High');
    setFormSummary('');
    setFormActions('');
    setFormCampaign('none');
    setFormIndicators([{ type: 'IP', value: '' }]);

    // Go to DB and select
    setSelectedThreat(newRecord);
    setHubTab('database');
  };

  // Add more manual indicator fields
  const addManualIndicatorField = () => {
    setFormIndicators(prev => [...prev, { type: 'IP', value: '' }]);
  };

  // Remove manual indicator field
  const removeManualIndicatorField = (index: number) => {
    setFormIndicators(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update manual indicator value
  const updateManualIndicator = (index: number, key: 'type' | 'value', value: string) => {
    setFormIndicators(prev => prev.map((ind, idx) => {
      if (idx === index) {
        return { ...ind, [key]: value };
      }
      return ind;
    }));
  };

  // Parse CSV records
  useEffect(() => {
    if (!csvRawText.trim()) {
      setCsvInferredIndicators([]);
      return;
    }

    const lines = csvRawText.split('\n');
    const parsed: typeof csvInferredIndicators = [];

    lines.forEach(line => {
      if (!line.trim()) return;
      const parts = line.split(',');
      if (parts.length < 2) return;

      const type = parts[0].trim();
      const rawVal = parts[1].trim();
      const validTypes = ["URL", "Domain", "Email", "Phone", "CryptoWallet", "IP", "Hash"];

      if (validTypes.includes(type) && rawVal) {
        const norm = normalizeIndicator(type, rawVal);
        parsed.push({
          type,
          original: rawVal,
          normalized: norm.normalized,
          description: norm.description,
          valid: true
        });
      } else {
        parsed.push({
          type: type || 'Unknown',
          original: rawVal || line,
          normalized: 'Parsing Failure',
          description: 'Invalid indicator code or null value',
          valid: false
        });
      }
    });

    setCsvInferredIndicators(parsed);
  }, [csvRawText]);

  // Commit CSV Threats
  const commitCsvIngest = () => {
    const validExtracted = csvInferredIndicators.filter(i => i.valid);
    if (validExtracted.length === 0) return;

    const nowStr = new Date().toISOString();
    const newThreatId = `threat-csv-${Date.now()}`;

    const mappedIndicators: ThreatIndicator[] = validExtracted.map((ind, index) => {
      // Log normalization
      const log: NormalizationLog = {
        timestamp: nowStr,
        type: ind.type,
        original: ind.original,
        normalized: ind.normalized,
        status: "Success"
      };
      setNormalizationLogs(prev => [log, ...prev]);

      return {
        id: `ind-csv-${Date.now()}-${index}`,
        type: ind.type as any,
        originalValue: ind.original,
        value: ind.normalized,
        description: ind.description,
        addedAt: nowStr.split('T')[0]
      };
    });

    let targetCampaignId: string | null = null;
    let autoLinkedReason = "";

    const autoLinkResult = findAutoCampaignLink(
      csvTargetThreatName,
      "",
      mappedIndicators,
      campaigns
    );
    if (autoLinkResult) {
      targetCampaignId = autoLinkResult.campaignId;
      autoLinkedReason = autoLinkResult.reason;
    }

    const newRecord: ThreatRecord = {
      id: newThreatId,
      name: csvTargetThreatName || "Bulk Ingestion Threat Feed",
      threatType: "Malware",
      severity: "High",
      riskScore: 80,
      confidence: "High",
      firstSeen: nowStr,
      lastSeen: nowStr,
      aiSummary: `Batch CSV ingested threat pipeline carrying ${validExtracted.length} normalized indicators.`,
      recommendedActions: ["Enforce host blocking strategies for the appended indicator list."],
      campaignId: targetCampaignId,
      indicators: mappedIndicators,
      addedAt: nowStr.split('T')[0]
    };

    if (targetCampaignId) {
      setCampaigns(prev => prev.map(c => {
        if (c.id === targetCampaignId) {
          return { ...c, threatCount: c.threatCount + 1 };
        }
        return c;
      }));

      if (autoLinkedReason) {
        const linkedCampName = campaigns.find(c => c.id === targetCampaignId)?.name || "Associated Campaign";
        setAutoLinkAlert({
          threatName: csvTargetThreatName,
          campaignName: linkedCampName,
          reason: autoLinkedReason
        });
      }
    }

    setThreats(prev => [newRecord, ...prev]);
    setCsvRawText('');
    setCsvTargetThreatName('Bulk CSV Ingestion Threat');
    setSelectedThreat(newRecord);
    setHubTab('database');
  };

  // Add Campaign Form submit
  const handleCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    const sectors = newCampaignSectors
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '');

    const countriesList = newCampaignCountries
      .split(',')
      .map(c => c.trim())
      .filter(c => c !== '');

    const domainsList = newCampaignDomains
      .split(',')
      .map(d => d.trim())
      .filter(d => d !== '');

    const emailsList = newCampaignEmails
      .split(',')
      .map(em => em.trim())
      .filter(em => em !== '');

    const walletsList = newCampaignWallets
      .split(',')
      .map(w => w.trim())
      .filter(w => w !== '');

    const newCamp: ThreatCampaign = {
      id: `camp-${Date.now()}`,
      name: newCampaignName,
      description: newCampaignDesc || "Operational defense monitoring tracking active indicators.",
      status: newCampaignStatus,
      targetSectors: sectors.length > 0 ? sectors : ["Technology"],
      countries: countriesList.length > 0 ? countriesList : ["Global"],
      victimCount: newCampaignVictims || 0,
      aiSummary: newCampaignAiSummary || "Strategic intelligence summary parsed and initialized by Obitrex.",
      threatCount: 0,
      addedAt: new Date().toISOString().split('T')[0],
      relatedDomains: domainsList,
      relatedEmails: emailsList,
      relatedWallets: walletsList,
      customTimeline: newCampaignTimeline.length > 0 ? newCampaignTimeline : [
        { date: new Date().toISOString().split('T')[0], title: "Campaign Initialized", desc: "Monitored campaign record created in the Intelligence Hub." }
      ]
    };

    setCampaigns(prev => [...prev, newCamp]);

    // Publish to Obitrex Central Intelligence Core (SIC) event bus
    CentralIntelligenceCore.getInstance().publish("CampaignExpanded", "CAMPAIGN_REGISTRY_HUB", {
      campaignId: newCamp.id,
      name: newCamp.name,
      status: newCamp.status,
      targetSectors: newCamp.targetSectors
    });

    setNewCampaignName('');
    setNewCampaignDesc('');
    setNewCampaignSectors('');
    setNewCampaignStatus('Active');
    setNewCampaignCountries('');
    setNewCampaignVictims(0);
    setNewCampaignAiSummary('');
    setNewCampaignDomains('');
    setNewCampaignEmails('');
    setNewCampaignWallets('');
    setNewCampaignTimeline([]);
    setIsCreatingCampaign(false);
    
    setCampaignSuccessMsg(true);
    setTimeout(() => setCampaignSuccessMsg(false), 3000);
  };

  // Delete Threat
  const handleDeleteThreat = (threatId: string) => {
    const threat = threats.find(t => t.id === threatId);
    if (!threat) return;

    // Decrement campaign count if needed
    if (threat.campaignId) {
      setCampaigns(prev => prev.map(c => {
        if (c.id === threat.campaignId) {
          return { ...c, threatCount: Math.max(0, c.threatCount - 1) };
        }
        return c;
      }));
    }

    setThreats(prev => prev.filter(t => t.id !== threatId));
    if (selectedThreat?.id === threatId) {
      setSelectedThreat(null);
    }
  };

  return (
    <div id="threat-intel-hub" className="space-y-8">
      {/* Auto Link Alert Notice */}
      <AnimatePresence>
        {autoLinkAlert && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="bg-cyan-500/10 border border-cyan-400/30 p-5 rounded-2xl flex items-start gap-4 shadow-xl shadow-cyan-950/20 mb-6 overflow-hidden"
          >
            <div className="p-2.5 bg-cyan-400 text-black rounded-xl shrink-0">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">Obitrex Intelligence Correlation</h4>
                <span className="text-[9px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded font-black uppercase">Auto-Linked</span>
              </div>
              <p className="text-sm text-white font-bold">
                Automatically associated threat <span className="text-cyan-300 font-extrabold">"{autoLinkAlert.threatName}"</span> to Campaign <span className="text-amber-400 font-extrabold">"{autoLinkAlert.campaignName}"</span>
              </p>
              <p className="text-xs text-white/70">
                <span className="text-cyan-400 font-bold font-mono uppercase text-[9px] mr-1">Match vector:</span>
                {autoLinkAlert.reason}
              </p>
            </div>
            <button
              onClick={() => setAutoLinkAlert(null)}
              className="text-white/40 hover:text-white transition-colors p-1 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Head section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tighter flex items-center gap-3">
            <Flame className="w-8 h-8 text-cyan-400 animate-pulse" />
            {isRTL ? 'مركز استخبارات التهديدات' : 'Threat Intelligence Hub'}
          </h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
            {isRTL 
              ? 'نظام استيعاب، تصنيف، توحيد، وتتبع الحملات التخريبية في الوقت الفعلي.' 
              : 'Enterprise-grade ingestion, classification, normalization, and tracking system.'}
          </p>
        </div>

        {/* Hub internal navigation */}
        <div className={`flex flex-wrap gap-1 p-1 rounded-xl ${theme === 'dark' ? 'bg-[#0F1012] border-white/5' : 'bg-slate-100 border-slate-200'} border`}>
          {(['overview', 'ingestion', 'database', 'campaigns', 'timeline', 'indicators', 'sic'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setHubTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                hubTab === tab
                  ? 'bg-cyan-400 text-black shadow-md'
                  : `${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-500 hover:text-slate-950'}`
              }`}
            >
              {tab === 'overview' && (isRTL ? 'نظرة عامة' : 'Overview')}
              {tab === 'ingestion' && (isRTL ? 'الاستيراد والتسجيل' : 'Pipeline')}
              {tab === 'database' && (isRTL ? 'قاعدة التهديدات' : 'Database')}
              {tab === 'campaigns' && (isRTL ? 'الحملات' : 'Campaigns')}
              {tab === 'timeline' && (isRTL ? 'الخط الزمني' : 'Timeline')}
              {tab === 'indicators' && (isRTL ? 'المؤشرات' : 'Indicators')}
              {tab === 'sic' && (isRTL ? 'مركز الاستخبارات SIC' : 'Central Intelligence (SIC)')}
            </button>
          ))}
        </div>
      </div>

      {/* Primary content area based on Hub tabs */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: OVERVIEW */}
        {hubTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: isRTL ? 'إجمالي التهديدات' : 'Total Threats', value: stats.totalThreats, desc: 'Ingested records', icon: Shield, color: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5' },
                { label: isRTL ? 'عالية الخطورة' : 'High / Critical', value: stats.criticalCount, desc: 'Immediate action required', icon: AlertTriangle, color: 'text-red-500 border-red-500/20 bg-red-500/5' },
                { label: isRTL ? 'الحملات النشطة' : 'Active Campaigns', value: stats.activeCamps, desc: 'Coordinated adversaries', icon: Activity, color: 'text-amber-500 border-amber-500/20 bg-amber-500/5' },
                { label: isRTL ? 'مؤشرات التهديد المعالجة' : 'Normalized IOCs', value: stats.totalIndicators, desc: 'Cleaned indicator database', icon: Database, color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' }
              ].map((item, index) => (
                <div key={index} className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'} shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{item.label}</span>
                    <div className={`p-2 rounded-xl border ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tight">{item.value}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Continuous Live Threat Feed Stream */}
            <LiveThreatFeed language={language} theme={theme} />

            {/* Quick Layout: Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Recent Threats & Actions */}
              <div className="lg:col-span-2 space-y-6">
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-extrabold uppercase tracking-tight flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      {isRTL ? 'أحدث التهديدات المسجلة' : 'Recent Threat Sighting Feed'}
                    </h3>
                    <button onClick={() => setHubTab('database')} className="text-xs font-bold text-cyan-400 hover:underline uppercase tracking-widest">
                      {isRTL ? 'عرض الكل' : 'View database'} →
                    </button>
                  </div>

                  <div className="space-y-4">
                    {threats.slice(0, 3).map((record) => (
                      <div 
                        key={record.id} 
                        onClick={() => { setSelectedThreat(record); setHubTab('database'); }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                          theme === 'dark' 
                            ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-cyan-400/20' 
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-cyan-400/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              record.severity === 'Critical' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                              record.severity === 'High' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                              'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>
                              {record.severity}
                            </span>
                            <span className="font-bold text-sm group-hover:text-cyan-400 transition-colors">{record.name}</span>
                          </div>
                          <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
                            {new Date(record.firstSeen).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-xs mt-2 line-clamp-2 ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                          {record.aiSummary}
                        </p>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[10px] font-mono text-cyan-400/80">
                          <span>{isRTL ? 'نوع التهديد' : 'Type'}: <span className="font-bold text-white/80">{record.threatType}</span></span>
                          <span>{isRTL ? 'المؤشرات' : 'Indicators'}: <span className="font-bold text-white/80">{record.indicators.length}</span></span>
                          {record.campaignId && (
                            <span className="text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                              {campaigns.find(c => c.id === record.campaignId)?.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Normalization Activity Logs */}
                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}>
                  <h3 className="text-lg font-extrabold uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-cyan-400" />
                    {isRTL ? 'سجل تصفية وتوحيد المؤشرات' : 'Real-Time Normalization Log'}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className={`border-b ${theme === 'dark' ? 'border-white/10 text-white/40' : 'border-slate-100 text-slate-500'} font-bold`}>
                          <th className="pb-3">{isRTL ? 'الوقت' : 'Time'}</th>
                          <th className="pb-3">{isRTL ? 'النوع' : 'Type'}</th>
                          <th className="pb-3">{isRTL ? 'القيمة الأصلية' : 'Defanged Original'}</th>
                          <th className="pb-3">{isRTL ? 'القيمة المعالجة' : 'Normalized'}</th>
                          <th className="pb-3">{isRTL ? 'الحالة' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {normalizationLogs.slice(0, 4).map((log, index) => (
                          <tr key={index} className="hover:bg-white/[0.01]">
                            <td className="py-2.5 text-white/35 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                            <td className="py-2.5"><span className="text-cyan-400 font-bold">{log.type}</span></td>
                            <td className="py-2.5 text-red-400/80 max-w-[150px] truncate">{log.original}</td>
                            <td className="py-2.5 text-emerald-400 font-bold max-w-[150px] truncate">{log.normalized}</td>
                            <td className="py-2.5">
                              <span className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] text-emerald-500 font-bold leading-none">
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Threat Parser Promo & Info */}
              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border relative overflow-hidden ${
                  theme === 'dark' ? 'bg-gradient-to-b from-cyan-400/10 to-transparent border-cyan-400/20' : 'bg-cyan-50/50 border-cyan-400/20'
                }`}>
                  <div className="absolute top-4 right-4 text-cyan-400 animate-pulse">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight mb-2">
                    {isRTL ? 'الاستيعاب الذكي بالذكاء الاصطناعي' : 'AI-Powered Parser'}
                  </h3>
                  <p className={`text-xs leading-relaxed mb-6 ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                    {isRTL 
                      ? 'قم بلصق مقال إخباري أمني، أو بريد مشبوه، أو تقرير أمني خام. سيقوم الذكاء الاصطناعي باستخراج التهديد، تصنيفه، توليد التوصيات، وتوحيد المؤشرات تلقائياً.'
                      : 'Upload or paste unstructured threat briefings or reports. Gemini extracts and classifies risks, formulates remediations, and strips/normalizes target indicator feeds instantly.'}
                  </p>
                  <button
                    onClick={() => { setHubTab('ingestion'); setIngestMode('ai'); }}
                    className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    {isRTL ? 'افتح خط المعالجة' : 'Open AI Pipeline'}
                  </button>
                </div>

                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-white/40">
                    {isRTL ? 'إحصائيات التصنيف' : 'Indicator Type Breakdown'}
                  </h3>
                  <div className="space-y-3.5">
                    {[
                      { type: 'IP Addresses', count: allIndicatorsList.filter(i => i.indicator.type === 'IP').length, icon: Globe, pct: 30, color: 'bg-indigo-500' },
                      { type: 'Domains & URLs', count: allIndicatorsList.filter(i => i.indicator.type === 'Domain' || i.indicator.type === 'URL').length, icon: Shield, pct: 40, color: 'bg-cyan-400' },
                      { type: 'Emails & Phones', count: allIndicatorsList.filter(i => i.indicator.type === 'Email' || i.indicator.type === 'Phone').length, icon: Phone, pct: 15, color: 'bg-amber-500' },
                      { type: 'File Hashes', count: allIndicatorsList.filter(i => i.indicator.type === 'Hash').length, icon: Fingerprint, pct: 25, color: 'bg-rose-500' },
                      { type: 'Crypto Wallets', count: allIndicatorsList.filter(i => i.indicator.type === 'CryptoWallet').length, icon: Wallet, pct: 10, color: 'bg-emerald-500' }
                    ].map((row, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-2 opacity-80">
                            <row.icon className="w-3.5 h-3.5 text-cyan-400" />
                            {row.type}
                          </span>
                          <span className="font-mono">{row.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${row.color}`} style={{ width: `${Math.max(8, (row.count / Math.max(1, stats.totalIndicators)) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: INGESTION PIPELINE */}
        {hubTab === 'ingestion' && (
          <motion.div
            key="ingestion"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Ingestion Mode Sub-tab selection */}
            <div className={`flex flex-wrap gap-2 p-1.5 rounded-2xl ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-slate-100 border-slate-200'} border`}>
              <button
                onClick={() => setIngestMode('ai')}
                className={`flex-1 min-w-[150px] py-3.5 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  ingestMode === 'ai'
                    ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                    : `${theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-950 hover:bg-white'} `
                }`}
              >
                <Brain className="w-4 h-4" />
                {isRTL ? 'استيراد بالذكاء الاصطناعي (Gemini)' : 'Gemini AI Parser'}
              </button>
              <button
                onClick={() => setIngestMode('manual')}
                className={`flex-1 min-w-[150px] py-3.5 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  ingestMode === 'manual'
                    ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                    : `${theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-950 hover:bg-white'} `
                }`}
              >
                <Plus className="w-4 h-4" />
                {isRTL ? 'تسجيل يدوي كلاسيكي' : 'Classic Manual Entry'}
              </button>
              <button
                onClick={() => setIngestMode('csv')}
                className={`flex-1 min-w-[150px] py-3.5 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  ingestMode === 'csv'
                    ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                    : `${theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-950 hover:bg-white'} `
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                {isRTL ? 'محلل الدفعات CSV' : 'Bulk CSV Ingestion'}
              </button>
            </div>

            {/* Ingest Mode Content Panels */}
            <AnimatePresence mode="wait">
              
              {/* Pipeline: AI Gemini Ingestion */}
              {ingestMode === 'ai' && (
                <motion.div
                  key="ai-ingest"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}>
                    <h3 className="text-lg font-extrabold uppercase tracking-tight mb-2 flex items-center gap-2">
                      <Sparkle className="w-5 h-5 text-cyan-400 animate-pulse" />
                      {isRTL ? 'تحليل التقرير بواسطة الذكاء الاصطناعي' : 'Advisory / Incident Report Parsing Pipeline'}
                    </h3>
                    <p className={`text-xs mb-6 ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'}`}>
                      {isRTL 
                        ? 'ألصق أي مستند أمني غير منظم أو تدوينة مدونة أو تحذير من CISA. سيقوم النظام بتحليل الهيكل واستنباط المؤشرات مع توحيدها تلقائياً.'
                        : 'Paste any security advisory, CISA alert, security blog post, or unstructured telemetry email. Gemini will parse metadata, formulate recommended actions, and extract normalized indicators.'}
                    </p>

                    <div className="space-y-4">
                      <textarea
                        value={rawReport}
                        onChange={(e) => setRawReport(e.target.value)}
                        placeholder={
                          isRTL 
                            ? "ألصق التقرير الأمني هنا... مثال:\nنشهد هجمات نشطة على خوادم الاستضافة. تم العثور على عنوان IP المهاجم 185[.]220[.]101[.]45 يحاول سحب البيانات إلى النطاق cobalt-api-gate[.]net باستخدام محفظة BTC المستهدفة 1A1zP1eP5..." 
                            : "Paste your unstructured raw security advisory or blog text here...\nExample:\nWe are seeing active scanning campaigns targeting corporate databases. The attacker uses the IP address 185[.]220[.]101[.]45 to query target subnets, downloading payloads from hxxps://malicious-gateway[.]tk/updater.exe and utilizing the Bitcoin wallet 1A1zP1eP5QGefi..."
                        }
                        className={`w-full h-64 p-4 font-mono text-xs border rounded-2xl focus:outline-none focus:border-cyan-400 ${
                          theme === 'dark' ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />

                      <div className="flex justify-end gap-4">
                        <button
                          onClick={handleAiParsing}
                          disabled={!rawReport.trim() || isAiParsing}
                          className="px-8 py-4 bg-cyan-400 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:bg-cyan-300 disabled:bg-slate-200 disabled:text-slate-400 shadow-lg"
                        >
                          {isAiParsing ? (
                            <span className="flex items-center gap-2">
                              <Activity className="w-4 h-4 animate-spin" />
                              {isRTL ? 'جاري التحليل والتوحيد...' : 'Analyzing & Normalizing...'}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              {isRTL ? 'بدء التحليل الذكي' : 'Parse & Normalise with AI'}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Output Preview & Ingest Confirmation */}
                  {aiReportError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider">
                      {aiReportError}
                    </div>
                  )}

                  {aiParsedResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 rounded-2xl border space-y-6 ${
                        theme === 'dark' ? 'bg-[#0E1012] border-cyan-400/20' : 'bg-cyan-50/20 border-cyan-400/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div>
                          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">AI Extracted Threat Intelligence</span>
                          <h4 className="text-xl font-extrabold text-white mt-1">{aiParsedResult.name}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            aiParsedResult.severity === 'Critical' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                            aiParsedResult.severity === 'High' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                            'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                          }`}>
                            {aiParsedResult.severity} Severity
                          </span>
                          <span className="bg-cyan-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                            Risk: {aiParsedResult.riskScore}/100
                          </span>
                        </div>
                      </div>

                      {/* Summary, type and confidence */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1 md:col-span-2">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">{isRTL ? 'الملخص الفني الذكي' : 'Technical Summary'}</span>
                          <p className="text-sm leading-relaxed text-white/80">{aiParsedResult.aiSummary}</p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">{isRTL ? 'نوع التصنيف' : 'Classification Type'}</span>
                            <span className="text-sm font-bold text-cyan-400">{aiParsedResult.threatType}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">{isRTL ? 'ثقة التحليل' : 'Analysis Confidence'}</span>
                            <span className="text-sm font-bold text-emerald-400">{aiParsedResult.confidence}</span>
                          </div>
                        </div>
                      </div>

                      {/* Extracted Indicators & Normalization preview */}
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                          {isRTL ? 'المؤشرات المستخرجة ومعالجتها (IOC Normalization)' : 'Extracted IOCs & Normalization Pipeline'}
                        </span>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {aiParsedResult.indicators.length > 0 ? aiParsedResult.indicators.map((ind, idx) => {
                            const norm = normalizeIndicator(ind.type, ind.value);
                            return (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white/[0.01] border border-white/5 rounded-xl text-xs font-mono">
                                <div className="flex items-center gap-3">
                                  <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{ind.type}</span>
                                  <span className="text-red-400/80 truncate max-w-[180px]">{ind.value}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ArrowRight className="w-3.5 h-3.5 text-white/20 hidden sm:block" />
                                  <span className="text-emerald-400 font-bold truncate max-w-[180px]" title="Normalized Value">{norm.normalized}</span>
                                </div>
                                <span className="text-[10px] text-white/40 italic">{norm.description}</span>
                              </div>
                            );
                          }) : (
                            <p className="text-xs text-white/30 italic">No network or software indicators discovered in report.</p>
                          )}
                        </div>
                      </div>

                      {/* Recommended Actions */}
                      <div className="space-y-2 pt-4 border-t border-white/5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">{isRTL ? 'التوصيات والإجراءات المقترحة' : 'Actionable Security Remedies'}</span>
                        <ul className="list-disc pl-5 text-xs text-white/70 space-y-1 leading-relaxed">
                          {aiParsedResult.recommendedActions.map((act, idx) => (
                            <li key={idx}>{act}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Campaign association */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-white/60">{isRTL ? 'ربط بحملة:' : 'Link to Campaign:'}</label>
                          <select
                            value={aiSelectedCampaign}
                            onChange={(e) => setAiSelectedCampaign(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400 text-white"
                          >
                            <option value="none">None (Individual Threat)</option>
                            {campaigns.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => setAiParsedResult(null)}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white/60 uppercase tracking-widest"
                          >
                            Discard
                          </button>
                          <button
                            onClick={commitAiThreat}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            {isRTL ? 'تأكيد التسجيل وحفظ المؤشرات' : 'Ingest & Store Intelligence'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Pipeline: Manual Classic Ingestion */}
              {ingestMode === 'manual' && (
                <motion.div
                  key="manual-ingest"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}
                >
                  <form onSubmit={handleManualSubmit} className="space-y-6">
                    <h3 className="text-lg font-extrabold uppercase tracking-tight flex items-center gap-2 border-b border-white/5 pb-3">
                      <Plus className="w-5 h-5 text-cyan-400" />
                      {isRTL ? 'إدخال يدوي مخصص لاستخبارات التهديد' : 'Manual Cyber Intelligence Entry Form'}
                    </h3>

                    {/* Threat Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Threat Name / Title *</label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="e.g. BlackByte Ransomware Host"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Threat Type</label>
                        <select
                          value={formType}
                          onChange={(e) => setFormType(e.target.value)}
                          className="w-full bg-[#151619] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 text-white"
                        >
                          <option value="Phishing">Phishing</option>
                          <option value="Malware">Malware</option>
                          <option value="Ransomware">Ransomware</option>
                          <option value="APT">APT (Advanced Persistent Threat)</option>
                          <option value="Spyware">Spyware</option>
                          <option value="Botnet">Botnet</option>
                          <option value="DDoS">DDoS</option>
                          <option value="Insider Threat">Insider Threat</option>
                          <option value="Scam">Scam</option>
                          <option value="Social Engineering">Social Engineering</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Severity</label>
                        <select
                          value={formSeverity}
                          onChange={(e) => setFormSeverity(e.target.value as any)}
                          className="w-full bg-[#151619] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 text-white"
                        >
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Risk Score (0 - 100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formRiskScore}
                          onChange={(e) => setFormRiskScore(parseInt(e.target.value) || 0)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Confidence Level</label>
                        <select
                          value={formConfidence}
                          onChange={(e) => setFormConfidence(e.target.value as any)}
                          className="w-full bg-[#151619] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 text-white"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>

                    {/* Threat Text Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Technical Summary Description</label>
                      <textarea
                        value={formSummary}
                        onChange={(e) => setFormSummary(e.target.value)}
                        placeholder="Detail the actions, mechanism, targets and threat actors behind this observation."
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 text-white"
                      />
                    </div>

                    {/* Recommended Actions */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Recommended Mitigations (One per line)</label>
                      <textarea
                        value={formActions}
                        onChange={(e) => setFormActions(e.target.value)}
                        placeholder="Example:\nIsolate targeted staging servers.\nRotate administrator LDAP tokens."
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 text-white"
                      />
                    </div>

                    {/* Campaign Association */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Associated Campaign</label>
                      <select
                        value={formCampaign}
                        onChange={(e) => setFormCampaign(e.target.value)}
                        className="bg-[#151619] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400 text-white block w-full"
                      >
                        <option value="none">None (Stand-alone Alert)</option>
                        {campaigns.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dynamic Manual Indicators */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Indicators of Compromise (IOCs)</label>
                        <button
                          type="button"
                          onClick={addManualIndicatorField}
                          className="text-[10px] font-black uppercase tracking-widest bg-cyan-400/10 border border-cyan-400/20 px-3 py-1.5 rounded-lg text-cyan-400 hover:bg-cyan-400/20 transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Indicator
                        </button>
                      </div>

                      <div className="space-y-2">
                        {formIndicators.map((ind, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <select
                              value={ind.type}
                              onChange={(e) => updateManualIndicator(idx, 'type', e.target.value)}
                              className="bg-[#151619] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400 text-white w-1/4"
                            >
                              <option value="IP">IP Address</option>
                              <option value="URL">URL Link</option>
                              <option value="Domain">Domain Name</option>
                              <option value="Email">Email Address</option>
                              <option value="Phone">Phone Line</option>
                              <option value="CryptoWallet">Crypto Wallet</option>
                              <option value="Hash">MD5/SHA Hash</option>
                            </select>
                            <input
                              type="text"
                              required
                              value={ind.value}
                              onChange={(e) => updateManualIndicator(idx, 'value', e.target.value)}
                              placeholder="e.g. 192[.]168[.]1[.]1 or evil-site[.]net"
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs focus:outline-none focus:border-cyan-400 text-white"
                            />
                            {formIndicators.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeManualIndicatorField(idx)}
                                className="text-red-400 hover:text-red-300 p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                      <button
                        type="submit"
                        className="px-8 py-4 bg-emerald-500 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:bg-emerald-400 shadow-lg"
                      >
                        Save Threat & Normalized Indicators
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Pipeline: Bulk CSV Ingestion */}
              {ingestMode === 'csv' && (
                <motion.div
                  key="csv-ingest"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}>
                    <h3 className="text-lg font-extrabold uppercase tracking-tight mb-2 flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                      {isRTL ? 'تحميل قائمة المؤشرات بالدفعات' : 'Bulk Ingress CSV Processor'}
                    </h3>
                    <p className={`text-xs mb-6 ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'}`}>
                      {isRTL 
                        ? 'ألصق أسطر CSV بالتنسيق (النوع, القيمة) لتحليلها، وتصفيتها، وتخزينها دفعة واحدة.'
                        : 'Format your input as: Type, Value (e.g. IP, 192[.]168[.]1[.]1). One indicator record per line. The pipeline parses, sanitizes, and logs normalizations instantly.'}
                    </p>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-white/60 uppercase">Aggregated Feed Name</label>
                        <input
                          type="text"
                          value={csvTargetThreatName}
                          onChange={(e) => setCsvTargetThreatName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-white/60 uppercase">CSV Raw Content (Type, Value)</label>
                        <textarea
                          value={csvRawText}
                          onChange={(e) => setCsvRawText(e.target.value)}
                          placeholder="IP,185[.]220[.]101[.]55\nDomain,malicious-portal[.]live\nURL,hxxp://scam[.]tk/gift\nHash,a1b2c3d4e5f607182930"
                          className="w-full h-48 p-4 font-mono text-xs border rounded-2xl focus:outline-none focus:border-cyan-400 bg-black/40 border-white/10 text-white"
                        />
                      </div>

                      {/* Realtime Inferred normalization list */}
                      {csvInferredIndicators.length > 0 && (
                        <div className="space-y-2 pt-4 border-t border-white/5">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Live Parser Real-time Normalization Output</span>
                          <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
                            {csvInferredIndicators.map((ind, idx) => (
                              <div key={idx} className={`p-2 border rounded-lg flex items-center justify-between ${
                                ind.valid ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-red-500/5 border-red-500/10 text-red-400'
                              }`}>
                                <div className="flex gap-4">
                                  <span className="font-bold">[{ind.type}]</span>
                                  <span>Orig: {ind.original}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span>→</span>
                                  <span className="font-black text-white">{ind.normalized}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end pt-4">
                            <button
                              onClick={commitCsvIngest}
                              className="px-8 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
                            >
                              Commit Batch Ingestion ({csvInferredIndicators.filter(i => i.valid).length} indicators)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        )}

        {/* TAB 3: THREAT DATABASE */}
        {hubTab === 'database' && (
          <motion.div
            key="database"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Filters panel */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'
            }`}>
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRTL ? 'ابحث عن اسم، تصنيف، أو مؤشر...' : 'Search threats, types or indicators...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-cyan-400 text-white"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-white/40 mr-1">Severity:</span>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="All">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <span className="text-white/40">Campaign:</span>
                  <select
                    value={filterCampaign}
                    onChange={(e) => setFilterCampaign(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="All">All Campaigns</option>
                    <option value="None">None</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content list / detail view layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* List block */}
              <div className={`lg:col-span-2 space-y-4 max-h-[800px] overflow-y-auto pr-2`}>
                {filteredThreats.length > 0 ? filteredThreats.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => setSelectedThreat(record)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedThreat?.id === record.id
                        ? 'border-cyan-400 bg-cyan-400/[0.02]'
                        : `${theme === 'dark' ? 'bg-[#0E1012] border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:border-slate-300'}`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                            record.severity === 'Critical' ? 'bg-red-500/20 text-red-500 border border-red-500/20' :
                            record.severity === 'High' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' :
                            'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10'
                          }`}>
                            {record.severity}
                          </span>
                          <span className="text-xs font-mono text-white/40 uppercase">{record.threatType}</span>
                        </div>
                        <h4 className="font-extrabold text-base text-white group-hover:text-cyan-400 transition-colors">{record.name}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-white/5 px-2.5 py-1 rounded border border-white/5">
                          Risk: {record.riskScore}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteThreat(record.id); }}
                          className="text-white/20 hover:text-red-400 p-1.5 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className={`text-xs mt-3 line-clamp-2 ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                      {record.aiSummary}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400">
                        <Database className="w-3.5 h-3.5" />
                        <span>{record.indicators.length} {isRTL ? 'مؤشرات نشطة' : 'Indicators'}</span>
                      </div>

                      {record.campaignId && (
                        <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded">
                          {campaigns.find(c => c.id === record.campaignId)?.name}
                        </span>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className={`py-24 text-center border-2 border-dashed ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} rounded-3xl opacity-20`}>
                    <Database className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-sm font-mono uppercase tracking-widest">No matching threats in database</p>
                  </div>
                )}
              </div>

              {/* Detail view block */}
              <div className="lg:col-span-1">
                {selectedThreat ? (
                  <div className={`p-6 rounded-2xl border space-y-6 sticky top-6 ${
                    theme === 'dark' ? 'bg-[#0E1012] border-cyan-400/20' : 'bg-cyan-50/10 border-cyan-400/20'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">Intel Analysis Document</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          selectedThreat.severity === 'Critical' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                          selectedThreat.severity === 'High' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                          'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {selectedThreat.severity}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-white">{selectedThreat.name}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-mono border-y border-white/5 py-4">
                      <div>
                        <span className="text-white/40 block uppercase text-[9px] tracking-widest">Risk Index</span>
                        <span className="text-sm font-bold text-cyan-400">{selectedThreat.riskScore}/100</span>
                      </div>
                      <div>
                        <span className="text-white/40 block uppercase text-[9px] tracking-widest">Confidence</span>
                        <span className="text-sm font-bold text-emerald-400">{selectedThreat.confidence}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block uppercase text-[9px] tracking-widest">First Seen</span>
                        <span className="text-white/80 text-[10px]">{new Date(selectedThreat.firstSeen).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block uppercase text-[9px] tracking-widest">Threat Type</span>
                        <span className="text-white/80 font-bold text-[10px]">{selectedThreat.threatType}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">AI Threat Summary</span>
                      <p className="text-xs leading-relaxed text-white/80">{selectedThreat.aiSummary}</p>
                    </div>

                    {/* Associated Indicators */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Associated IOCs ({selectedThreat.indicators.length})</span>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedThreat.indicators.map((ind) => (
                          <div key={ind.id} className="p-2.5 bg-white/[0.01] border border-white/5 rounded-xl font-mono text-[10px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">{ind.type}</span>
                              <button
                                onClick={() => navigator.clipboard.writeText(ind.value)}
                                className="text-white/35 hover:text-white"
                                title="Copy Value"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-white font-bold break-all">{ind.value}</p>
                            {ind.originalValue !== ind.value && (
                              <p className="text-white/30 text-[9px] break-all">Orig: {ind.originalValue}</p>
                            )}
                            <p className="text-[9px] text-white/40 italic">{ind.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    <div className="space-y-2 pt-4 border-t border-white/5">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Recommended Remedies</span>
                      <ul className="list-disc pl-4 text-xs text-white/70 space-y-1 leading-relaxed">
                        {selectedThreat.recommendedActions.map((act, idx) => (
                          <li key={idx}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className={`p-12 text-center border border-dashed border-white/10 rounded-2xl ${
                    theme === 'dark' ? 'bg-[#0E1012]/30 text-white/20' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <Sliders className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-xs font-mono uppercase tracking-widest">Select a threat to view deep analysis forensics</p>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 4: CAMPAIGN TRACKING */}
        {hubTab === 'campaigns' && (
          <motion.div
            key="campaigns"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Split layout: Selector Sidebar on left, Deep forensics detail or creation wizard on right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Campaigns Navigation (col-span-4) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-extrabold uppercase tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    {isRTL ? 'حملات التتبع' : 'Campaign Intel'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsCreatingCampaign(true);
                      setSelectedCampaignId("");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                      isCreatingCampaign 
                        ? 'bg-cyan-400 text-black' 
                        : 'bg-white/5 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/10'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {isRTL ? 'إنشاء حملة' : 'New Campaign'}
                  </button>
                </div>

                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                  {computedCampaigns.map((camp) => {
                    const isSelected = selectedCampaignId === camp.id && !isCreatingCampaign;
                    const statusColors = 
                      camp.status === 'Active' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                      camp.status === 'Monitored' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                      'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';

                    return (
                      <div
                        key={camp.id}
                        onClick={() => {
                          setSelectedCampaignId(camp.id);
                          setIsCreatingCampaign(false);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-950/40 to-black/30 border-cyan-400/40 shadow-lg shadow-cyan-950/10'
                            : 'bg-[#0E1012] border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/80" />
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${statusColors}`}>
                              {camp.status}
                            </span>
                            <span className="text-[10px] font-mono text-white/40">
                              {camp.addedAt}
                            </span>
                          </div>

                          <h4 className={`text-sm font-bold transition-colors ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                            {camp.name}
                          </h4>

                          <p className="text-xs text-white/60 line-clamp-2">
                            {camp.description}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-white/40">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-red-400" />
                              <strong className="text-white">{camp.victimCount || 0}</strong> {isRTL ? 'ضحية' : 'victims'}
                            </span>
                            <span>
                              <strong className="text-cyan-400">{camp.threatCount}</strong> {isRTL ? 'تهديد' : 'threats'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Intelligent Forensics Panel or Campaign Registration Form (col-span-8) */}
              <div className="lg:col-span-8">
                {isCreatingCampaign ? (
                  /* Campaign Creation Wizard Container */
                  <motion.div
                    key="create-campaign-wizard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-6 rounded-2xl border space-y-6 ${
                      theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">Obitrex Campaign Registry</span>
                        <h3 className="text-xl font-extrabold text-white mt-1">
                          {isRTL ? 'تأسيس حملة استخبارات جديدة' : 'Establish Coordinated Campaign'}
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setIsCreatingCampaign(false);
                          if (computedCampaigns.length > 0) setSelectedCampaignId(computedCampaigns[0].id);
                        }}
                        className="text-xs font-bold text-white/40 hover:text-white uppercase font-mono tracking-widest"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleCampaignSubmit} className="space-y-6 text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Campaign Name *</label>
                          <input
                            type="text"
                            required
                            value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                            placeholder="e.g. Operation Cobalt Shadow"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Current Defensive Status</label>
                          <select
                            value={newCampaignStatus}
                            onChange={(e) => setNewCampaignStatus(e.target.value as any)}
                            className="w-full bg-[#151619] border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white"
                          >
                            <option value="Active">Active Attackers</option>
                            <option value="Monitored">Monitored / Under surveillance</option>
                            <option value="Remediated">Remediated / Mitigation Active</option>
                            <option value="Closed">Closed Case</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Target Sectors (Comma separated)</label>
                          <input
                            type="text"
                            value={newCampaignSectors}
                            onChange={(e) => setNewCampaignSectors(e.target.value)}
                            placeholder="Finance, Healthcare, Government"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Geopolitical Countries Affected</label>
                          <input
                            type="text"
                            value={newCampaignCountries}
                            onChange={(e) => setNewCampaignCountries(e.target.value)}
                            placeholder="United States, United Kingdom, Japan"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Victim Count (Initial estimate)</label>
                          <input
                            type="number"
                            min="0"
                            value={newCampaignVictims}
                            onChange={(e) => setNewCampaignVictims(parseInt(e.target.value) || 0)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Campaign Summary Briefing</label>
                        <input
                          type="text"
                          value={newCampaignDesc}
                          onChange={(e) => setNewCampaignDesc(e.target.value)}
                          placeholder="Short high-level description for general feeds..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">AI Strategic Analysis / Motives</label>
                        <textarea
                          value={newCampaignAiSummary}
                          onChange={(e) => setNewCampaignAiSummary(e.target.value)}
                          placeholder="Deep technical breakdown of actor tactics, malware families used, and predicted visual maneuvers..."
                          className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-mono"
                        />
                      </div>

                      <div className="border-t border-white/5 pt-4 space-y-4">
                        <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Coordinated Indicators of Compromise</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Related Domains</label>
                            <input
                              type="text"
                              value={newCampaignDomains}
                              onChange={(e) => setNewCampaignDomains(e.target.value)}
                              placeholder="domain1.com, secure-login.net"
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Related Emails</label>
                            <input
                              type="text"
                              value={newCampaignEmails}
                              onChange={(e) => setNewCampaignEmails(e.target.value)}
                              placeholder="hacker@proton.me, admin@cobalt.net"
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Related Crypto Wallets</label>
                            <input
                              type="text"
                              value={newCampaignWallets}
                              onChange={(e) => setNewCampaignWallets(e.target.value)}
                              placeholder="BTC, ETH address strings"
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Timeline Milestones Builder */}
                      <div className="border-t border-white/5 pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Custom Timeline Milestones</h4>
                          <span className="text-[10px] font-mono text-white/30">{newCampaignTimeline.length} Milestones Added</span>
                        </div>

                        {/* Milestones list preview */}
                        {newCampaignTimeline.length > 0 && (
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 max-h-32 overflow-y-auto">
                            {newCampaignTimeline.map((ms, idx) => (
                              <div key={idx} className="flex items-start justify-between gap-4 text-xs font-mono pb-2 border-b border-white/5 last:border-0">
                                <div>
                                  <span className="text-cyan-400 font-bold mr-2">[{ms.date}]</span>
                                  <span className="text-white font-bold">{ms.title}</span>
                                  <p className="text-[10px] text-white/50 mt-0.5">{ms.desc}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setNewCampaignTimeline(prev => prev.filter((_, i) => i !== idx))}
                                  className="text-red-400 hover:text-red-300 font-bold"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Milestone Subform */}
                        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                              type="text"
                              id="ms-date"
                              placeholder="Date: YYYY-MM-DD"
                              className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                            />
                            <input
                              type="text"
                              id="ms-title"
                              placeholder="Milestone Event Title"
                              className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white md:col-span-2 focus:outline-none focus:border-cyan-400"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <input
                              type="text"
                              id="ms-desc"
                              placeholder="Milestone description and defensive outcomes..."
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const dateEl = document.getElementById('ms-date') as HTMLInputElement;
                                const titleEl = document.getElementById('ms-title') as HTMLInputElement;
                                const descEl = document.getElementById('ms-desc') as HTMLInputElement;

                                if (dateEl && titleEl && descEl && titleEl.value.trim()) {
                                  const dateVal = dateEl.value.trim() || new Date().toISOString().split('T')[0];
                                  setNewCampaignTimeline(prev => [
                                    ...prev,
                                    { date: dateVal, title: titleEl.value.trim(), desc: descEl.value.trim() || "Milestone reached." }
                                  ]);
                                  dateEl.value = '';
                                  titleEl.value = '';
                                  descEl.value = '';
                                }
                              }}
                              className="px-4 py-2 bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 rounded-lg text-xs font-bold hover:bg-cyan-400/35 transition-colors shrink-0"
                            >
                              + Add Milestone
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-cyan-950/20"
                      >
                        Launch Coordinated Campaign Tracker
                      </button>
                    </form>
                  </motion.div>
                ) : selectedCampaign ? (
                  /* Campaign Forensic Details View */
                  <motion.div
                    key={`campaign-detail-${selectedCampaign.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6 text-left"
                  >
                    {/* Header Banner */}
                    <div className={`p-6 rounded-2xl border ${
                      theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'
                    } relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/5 rounded-full blur-[100px] -z-10" />

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                              selectedCampaign.status === 'Active' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              selectedCampaign.status === 'Monitored' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {selectedCampaign.status} Campaign
                            </span>
                            <span className="text-[10px] font-mono text-white/30">Established: {selectedCampaign.addedAt}</span>
                          </div>
                          <h2 className="text-2xl font-black text-white mt-2">{selectedCampaign.name}</h2>
                          <p className="text-xs text-white/40 font-mono mt-0.5">Campaign Identifier Key: {selectedCampaign.id}</p>
                        </div>

                        {/* Top-level critical metrics */}
                        <div className="flex gap-4 shrink-0">
                          <div className="px-4 py-2 bg-white/[0.01] border border-white/5 rounded-xl text-center min-w-[100px]">
                            <span className="text-[9px] font-mono text-white/40 uppercase block">Victims Hit</span>
                            <span className="text-2xl font-black text-red-400 mt-1 block tracking-tight">
                              {selectedCampaign.victimCount || 0}
                            </span>
                          </div>
                          <div className="px-4 py-2 bg-white/[0.01] border border-white/5 rounded-xl text-center min-w-[100px]">
                            <span className="text-[9px] font-mono text-white/40 uppercase block">Threat Feeds</span>
                            <span className="text-2xl font-black text-cyan-400 mt-1 block tracking-tight">
                              {selectedCampaign.threatCount}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed text-white/80">{selectedCampaign.description}</p>

                      {/* Target Sectors & affected countries */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/5">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Target Demographics / Sectors</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCampaign.targetSectors.map((sec, idx) => (
                              <span key={idx} className="bg-white/5 border border-white/10 text-white/80 px-2.5 py-1 rounded-lg text-xs">
                                {sec}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Affected Sovereign Countries</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(selectedCampaign.countries || ["Global"]).map((country, idx) => (
                              <span key={idx} className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {country}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Strategic Motives Summary */}
                    <div className="p-6 bg-gradient-to-br from-[#0F1215] to-[#0A0B0D] border border-cyan-400/10 rounded-2xl relative shadow-lg">
                      <div className="absolute right-6 top-6 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 text-cyan-400 animate-spin-slow" />
                        Obitrex Security briefing
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">Strategic Intention & Motives briefing</span>
                        <p className="text-sm text-white/90 leading-relaxed font-mono pr-24 whitespace-pre-line">
                          {selectedCampaign.aiSummary || "Obitrex has mapped the defensive perimeter of this campaign. It demonstrates calculated attempts to evade threat lists. Defensive lockout procedures are advised."}
                        </p>
                      </div>
                    </div>

                    {/* Intelligence Indicators Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Domains */}
                      <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-xs font-mono font-bold uppercase text-cyan-400">Related Domains</span>
                          <span className="text-[10px] font-mono text-white/30 font-bold">{(selectedCampaign.relatedDomains || []).length}</span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {(selectedCampaign.relatedDomains || []).length > 0 ? (
                            (selectedCampaign.relatedDomains || []).map((dom, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white/[0.01] border border-white/5 rounded-lg text-xs font-mono">
                                <span className="text-red-400/80 truncate" title={dom}>{dom}</span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(dom)}
                                  className="text-white/30 hover:text-white p-1"
                                  title="Copy Domain"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-white/30 italic py-2">No domain IOCs registered.</p>
                          )}
                        </div>
                      </div>

                      {/* Emails */}
                      <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-xs font-mono font-bold uppercase text-amber-400">Related Emails</span>
                          <span className="text-[10px] font-mono text-white/30 font-bold">{(selectedCampaign.relatedEmails || []).length}</span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {(selectedCampaign.relatedEmails || []).length > 0 ? (
                            (selectedCampaign.relatedEmails || []).map((email, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white/[0.01] border border-white/5 rounded-lg text-xs font-mono">
                                <span className="text-amber-400/80 truncate" title={email}>{email}</span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(email)}
                                  className="text-white/30 hover:text-white p-1"
                                  title="Copy Email"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-white/30 italic py-2">No email accounts associated.</p>
                          )}
                        </div>
                      </div>

                      {/* Cryptowallets */}
                      <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-xs font-mono font-bold uppercase text-emerald-400">Related Crypto Wallets</span>
                          <span className="text-[10px] font-mono text-white/30 font-bold">{(selectedCampaign.relatedWallets || []).length}</span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {(selectedCampaign.relatedWallets || []).length > 0 ? (
                            (selectedCampaign.relatedWallets || []).map((wallet, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white/[0.01] border border-white/5 rounded-lg text-xs font-mono">
                                <span className="text-emerald-400/80 truncate" title={wallet}>{wallet}</span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(wallet)}
                                  className="text-white/30 hover:text-white p-1"
                                  title="Copy Wallet Address"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-white/30 italic py-2">No extortion wallets recorded.</p>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Integrated Chronological Timeline Map */}
                    <div className={`p-6 rounded-2xl border space-y-6 ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}>
                      <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-3">
                        Integrated Chronological Campaign Timeline Map
                      </h4>

                      <div className="relative pl-6 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:bg-white/10 text-left">
                        {selectedCampaign.timeline && selectedCampaign.timeline.length > 0 ? (
                          selectedCampaign.timeline.map((evt, idx) => (
                            <div key={idx} className="relative group">
                              {/* Timeline indicator circle */}
                              <div className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border transition-all ${
                                evt.type === 'milestone' 
                                  ? 'bg-amber-400 border-amber-400/40 shadow-sm shadow-amber-400' 
                                  : 'bg-cyan-400 border-cyan-400/40 shadow-sm shadow-cyan-400'
                              }`} />

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap text-xs">
                                  <span className={`font-bold font-mono ${evt.type === 'milestone' ? 'text-amber-400' : 'text-cyan-400'}`}>
                                    {evt.date}
                                  </span>
                                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                                    • {evt.type === 'milestone' ? 'Custom Milestone' : 'IOC Sighting Log'}
                                  </span>
                                </div>
                                <h5 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                                  {evt.title}
                                </h5>
                                <p className="text-xs text-white/60 leading-relaxed max-w-2xl">
                                  {evt.desc}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-white/30 italic">No timeline events or threat sightings have been mapped to this campaign yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Linked Ingested Threat Feeds */}
                    <div className={`p-6 rounded-2xl border space-y-4 ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}>
                      <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                        Linked Ingested Threats & Feed Reports ({(threats.filter(t => t.campaignId === selectedCampaign.id)).length})
                      </h4>

                      {(threats.filter(t => t.campaignId === selectedCampaign.id)).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(threats.filter(t => t.campaignId === selectedCampaign.id)).map((t) => (
                            <div
                              key={t.id}
                              onClick={() => { setSelectedThreat(t); setHubTab('database'); }}
                              className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl cursor-pointer flex flex-col justify-between transition-all group hover:border-cyan-400/20"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">{t.name}</h5>
                                  <p className="text-[9px] font-mono text-white/30 mt-0.5">IOCs: {t.indicators.length} • Risk: {t.riskScore}/100</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  t.severity === 'Critical' ? 'bg-red-500/20 text-red-500' :
                                  t.severity === 'High' ? 'bg-amber-500/20 text-amber-500' :
                                  'bg-cyan-500/10 text-cyan-400'
                                }`}>
                                  {t.severity}
                                </span>
                              </div>
                              <p className="text-[11px] text-white/50 line-clamp-2 mt-2 leading-relaxed">
                                {t.aiSummary}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-white/30 italic">No threat logs directly tied to this monitoring feed.</p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-[#0E1012]/30 text-white/20">
                    <Layers className="w-12 h-12 mx-auto mb-3 text-white/20" />
                    <p className="text-xs font-mono uppercase tracking-widest">Select or Establish a Threat Campaign to View Intelligence Forensics</p>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 5: CHRONOLOGICAL TIMELINE */}
        {hubTab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-xl font-extrabold uppercase tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                {isRTL ? 'الخط الزمني لاستخبارات التهديدات' : 'Chronological Incident Sighting Timeline'}
              </h3>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'}`}>
                Mapping out threat sightings and active indicators chronologically by first seen sightings.
              </p>
            </div>

            <div className="relative pl-6 sm:pl-32 space-y-12 before:absolute before:top-4 before:bottom-4 before:left-[11px] sm:before:left-[111px] before:w-0.5 before:bg-white/10">
              {timelineEvents.map((event) => (
                <div key={event.id} className="relative group">
                  
                  {/* Visual Date Indicator */}
                  <div className="absolute -left-6 sm:left-[-112px] top-1 flex flex-col items-center sm:items-end w-4 sm:w-24">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase leading-none hidden sm:block">
                      {new Date(event.timeString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[9px] font-mono text-white/30 hidden sm:block mt-1">
                      {new Date(event.timeString).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Bullet Marker */}
                  <div className={`absolute left-[-19px] sm:left-[-125px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-black transition-transform group-hover:scale-125 ${
                    event.severity === 'Critical' ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                    event.severity === 'High' ? 'border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                    'border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                  }`} />

                  {/* Sighting card */}
                  <div 
                    onClick={() => { setSelectedThreat(threats.find(t => t.id === event.id) || null); setHubTab('database'); }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      theme === 'dark' ? 'bg-[#0E1012] border-white/5 hover:border-cyan-400/20' : 'bg-white border-slate-200 hover:border-cyan-400/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3 mb-3">
                      <div>
                        <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block sm:hidden">
                          {new Date(event.timeString).toLocaleDateString()}
                        </span>
                        <h4 className="font-extrabold text-white group-hover:text-cyan-400 transition-colors">{event.name}</h4>
                        {event.campaignName && (
                          <span className="text-[9px] font-mono text-amber-500 font-bold bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded mt-1 inline-block">
                            Campaign: {event.campaignName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          event.severity === 'Critical' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                          event.severity === 'High' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                          'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {event.severity}
                        </span>
                        <span className="text-xs font-mono text-white/30">Risk: {event.riskScore}</span>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                      {event.summary}
                    </p>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[9px] font-mono text-white/40 uppercase">
                      <span>Classification: <span className="font-bold text-white/70">{event.threatType}</span></span>
                      <span>Sighted Last: <span className="font-bold text-white/70">{new Date(event.lastSeen).toLocaleDateString()}</span></span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 6: INDICATOR LOOKUP SEARCH */}
        {hubTab === 'indicators' && (
          <motion.div
            key="indicators"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Quick explanation & search lookup form */}
            <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}>
              <h3 className="text-lg font-extrabold uppercase tracking-tight mb-2 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                {isRTL ? 'البحث السريع واستعلام السمعة لمؤشرات التهديد' : 'Normalized IOC Lookup & Reputation Gateway'}
              </h3>
              <p className={`text-xs mb-6 ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'}`}>
                Query any IP address, hash, domain, crypto wallet, or URL to see if it exists in Obitrex's normalized cyber intelligence repository.
              </p>

              <form onSubmit={handleIndicatorLookup} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={lookupValue}
                  onChange={(e) => setLookupValue(e.target.value)}
                  placeholder="e.g. 185.220.101.45 or cobalt-api-gate.net"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-cyan-400 text-white font-mono"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md"
                >
                  Query Threat Intel Database
                </button>
              </form>
            </div>

            {/* Lookup result display */}
            <AnimatePresence mode="wait">
              {lookupSearched && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">
                    Query Results ({lookupResult?.length || 0} matches found)
                  </h4>

                  {lookupResult && lookupResult.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {lookupResult.map((item, index) => (
                        <div key={index} className={`p-5 rounded-2xl border space-y-4 ${
                          theme === 'dark' ? 'bg-[#0E1012] border-red-500/10' : 'bg-white border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">
                              Threat Signal Match
                            </span>
                            <span className="text-[10px] font-mono text-white/45">{new Date(item.indicator.addedAt).toLocaleDateString()}</span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-white/40 uppercase">Extracted Indicator</span>
                            <p className="text-sm font-bold text-cyan-400 font-mono break-all">{item.indicator.value}</p>
                            {item.indicator.originalValue !== item.indicator.value && (
                              <p className="text-[9px] font-mono text-white/30 break-all">Original Defanged: {item.indicator.originalValue}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-white/40 uppercase">Description</span>
                            <p className="text-xs text-white/80">{item.indicator.description}</p>
                          </div>

                          <div 
                            onClick={() => { setSelectedThreat(item.threat); setHubTab('database'); }}
                            className="pt-4 border-t border-white/5 flex items-center justify-between cursor-pointer hover:text-cyan-400 transition-colors"
                          >
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono text-white/30 block">Sighted in Record</span>
                              <span className="text-xs font-bold">{item.threat.name}</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">View Deep Forensics →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-12 text-center border-2 border-dashed border-white/5 rounded-2xl ${
                      theme === 'dark' ? 'bg-[#0E1012]/50 text-white/20' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Check className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-pulse" />
                      <p className="text-sm font-mono uppercase tracking-widest">Indicator NOT linked to any known threat signals</p>
                      <p className="text-xs text-white/40 mt-1">This address, link, or hash appears clean based on active campaign telemetry.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* General Indicators inventory database */}
            <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#0E1012] border-white/5' : 'bg-white border-slate-200'}`}>
              <h4 className="text-sm font-extrabold uppercase tracking-tight mb-6 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                {isRTL ? 'مخزن المؤشرات النشطة' : 'Normalized IOC Intelligence Repository'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {allIndicatorsList.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl font-mono text-[10px] space-y-1 hover:border-cyan-400/20 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">{item.indicator.type}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(item.indicator.value)}
                        className="text-white/35 hover:text-white"
                        title="Copy Value"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-white font-bold break-all">{item.indicator.value}</p>
                    <p className="text-[9px] text-white/45 truncate mt-1">Record: <span className="text-cyan-400 font-bold">{item.threat.name}</span></p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 7: CENTRAL INTELLIGENCE CORE (SIC) */}
        {hubTab === 'sic' && (
          <motion.div
            key="sic"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <ObitrexSICCoreView language={language} theme={theme} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
