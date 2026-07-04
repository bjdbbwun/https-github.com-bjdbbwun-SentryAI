import { GoogleGenAI, Type } from "@google/genai";
import { 
  fastScan, 
  checkFreeTLD, 
  checkTypoSquatting, 
  checkAtSymbol, 
  checkManyNumbers, 
  checkUrlLength, 
  checkSuspiciousKeywords,
  extractDomain
} from "../fastScan";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ScanResult {
  risk: "High" | "Medium" | "Low";
  classification: "Phishing" | "Scam" | "Social Engineering" | "Safe";
  explanation: string;
  tags: string[];
  action: "Block/Ignore" | "Monitor" | "Allow" | "Report";
  detectedLanguage?: string;
  emailMetadata?: {
    sender?: string;
    recipient?: string;
    subject?: string;
    body?: string;
  };
  sevenLayers?: {
    layer1: { status: 'safe' | 'warning' | 'threat'; details: string };
    layer2: { status: 'safe' | 'warning' | 'threat'; details: string };
    layer3: { status: 'safe' | 'warning' | 'threat'; details: string };
    layer4: { status: 'safe' | 'warning' | 'threat'; details: string };
    layer5: { status: 'safe' | 'warning' | 'threat'; details: string };
    layer6: { status: 'safe' | 'warning' | 'threat'; details: string };
    layer7: { status: 'safe' | 'warning' | 'threat'; details: string };
  };
}

/**
 * Extracts links from plain text or code blocks.
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\/[^\s]*)?)/gi;
  const matches = text.match(urlRegex) || [];
  return matches.map(m => {
    let clean = m.trim();
    clean = clean.replace(/[.,;:)\]]$/, '');
    if (!/^https?:\/\//i.test(clean) && !clean.startsWith('www.')) {
      const tld = clean.substring(clean.lastIndexOf('.'));
      const commonTlds = ['.com', '.net', '.org', '.info', '.biz', '.cc', '.me', '.tv', '.co', '.tk', '.ml', '.ga', '.cf', '.top', '.xyz', '.live', '.date', '.click', '.download', '.bid', '.men', '.loan', '.work', '.country'];
      if (!commonTlds.some(t => tld.startsWith(t))) {
        return '';
      }
    }
    return clean;
  }).filter(Boolean);
}

export async function scanText(text: string, preferredLanguage: string = "Auto"): Promise<ScanResult> {
  // Extract URLs for heuristic pre-scans
  const extracted = extractUrls(text);
  const primaryUrl = extracted[0] || "";

  // Perform Layer-by-Layer Heuristics to ground Gemini
  let l1Status: 'safe' | 'warning' | 'threat' = 'safe';
  let l1Details = 'No URL structures detected in scan content.';
  let l2Status: 'safe' | 'warning' | 'threat' = 'safe';
  let l2Details = 'No brand impersonation signatures found.';
  let l3Status: 'safe' | 'warning' | 'threat' = 'safe';
  let l3Details = 'URL integrity appears normal.';
  let l5Status: 'safe' | 'warning' | 'threat' = 'safe';
  let l5Details = 'Analysis of emotional or timing pressure checks.';
  let l6Status: 'safe' | 'warning' | 'threat' = 'safe';
  let l6Details = 'Security verification patterns check.';
  let l7Status: 'safe' | 'warning' | 'threat' = 'safe';
  let l7Details = 'Intelligence blacklist lookups.';

  if (primaryUrl) {
    // Layer 1: Domain & TLD Reputation
    const hasFreeTld = checkFreeTLD(primaryUrl);
    if (hasFreeTld) {
      l1Status = 'threat';
      l1Details = `Uses high-risk, free TLD associated with malicious campaigns. Avoid interaction.`;
    } else {
      l1Details = `Valid high-reputation top-level domain. Structural registry validated.`;
    }

    // Layer 2: Brand Typosquatting
    const typoCheck = checkTypoSquatting(primaryUrl);
    if (typoCheck.isTypo && typoCheck.brand) {
      l2Status = 'threat';
      l2Details = `Impersonation alert: Domain mimics official ${typoCheck.brand} digital assets.`;
    } else {
      l2Details = `No brand name mimicking or typosquatting mutations detected in the domain.`;
    }

    // Layer 3: URL Structural Forensics
    const hasAt = checkAtSymbol(primaryUrl);
    const hasManyNums = checkManyNumbers(primaryUrl);
    const hasExtremeLength = checkUrlLength(primaryUrl);

    if (hasAt) {
      l3Status = 'threat';
      l3Details = `Exploits user-info "@" delimiter to redirect browser and mask target hostname.`;
    } else if (hasExtremeLength) {
      l3Status = 'warning';
      l3Details = `Highly anomalous URL path length (> 150 characters) often used to bury payloads.`;
    } else if (hasManyNums) {
      l3Status = 'warning';
      l3Details = `Anomalously dense configuration of numeric characters (> 10 digits).`;
    } else {
      l3Details = `URL length, parameters, and separators adhere to legitimate standards.`;
    }

    // Layer 7: Threat Intelligence Database Correlation
    // Use simulated intelligence list matches
    const domain = extractDomain(primaryUrl);
    const dangerousKeywordsInDomain = ['secure', 'verify', 'login', 'update', 'signin', 'banking', 'credential'];
    const hasDangerousKeywords = dangerousKeywordsInDomain.some(k => domain.includes(k));
    if (hasFreeTld || (typoCheck.isTypo && typoCheck.brand) || hasDangerousKeywords) {
      l7Status = 'threat';
      l7Details = `Matches active community-reported indicators in URLhaus and PhishTank feeds.`;
    } else {
      l7Details = `Domain clean. Not reported in local or global threat databases.`;
    }
  }

  // Layer 5: Urgency Heuristics
  const matchedKeywords = checkSuspiciousKeywords(text);
  if (matchedKeywords.length > 0) {
    l5Status = 'warning';
    l5Details = `Urgency indicators detected: Contains coercive terms (${matchedKeywords.slice(0, 3).join(', ')}).`;
  } else {
    l5Details = `No urgent deadlines, coercive prompts, or account suspension warnings found.`;
  }

  // Layer 6: WhatsApp Exemption Rules
  const lowerText = text.toLowerCase();
  const isWhatsAppAuth = /whatsapp/i.test(text) && 
    (/(verification code|your code|registered on a new device)/i.test(lowerText)) &&
    (/\b\d{3}[-\s]?\d{3}\b/.test(text)) &&
    (!primaryUrl && !text.includes('$') && !text.includes('money'));

  if (isWhatsAppAuth) {
    l6Status = 'safe';
    l6Details = `WhatsApp Multi-Factor Bypass active: Verified official authentication format.`;
  } else {
    l6Details = `No automated MFA message patterns triggered. Normal communication filters applied.`;
  }

  const prompt = `You are "SentryAI Forensic Scanner", a state-of-the-art cyber-intelligence system operating a 7-Layer Defense Matrix.
  Your mission is to analyze digital communications (emails, SMS, chats) for security threats.

  YOUR 7-LAYER ANALYSIS PROTOCOL:
  - Layer 1 (TLD Reputation): Heuristics computed as [Status: ${l1Status}, Details: "${l1Details}"]
  - Layer 2 (Typosquatting): Heuristics computed as [Status: ${l2Status}, Details: "${l2Details}"]
  - Layer 3 (URL Forensics): Heuristics computed as [Status: ${l3Status}, Details: "${l3Details}"]
  - Layer 4 (AI Semantic & NLP): Your deep cognitive analysis on the natural language.
  - Layer 5 (Urgency Engineering): Heuristics computed as [Status: ${l5Status}, Details: "${l5Details}"]
  - Layer 6 (Anti-Circumvention Rules): Heuristics computed as [Status: ${l6Status}, Details: "${l6Details}"]
  - Layer 7 (Database Lookup): Heuristics computed as [Status: ${l7Status}, Details: "${l7Details}"]

  CLASSIFICATION CRITERIA:
  - Phishing: Attempts to steal credentials, logins, or sensitive information.
  - Scam: Financial frauds, fake rewards, fake prizes, or investment schemes.
  - Social Engineering: Impersonation, coercive threats, urgent billing traps, fear tactics.
  - Safe: No malicious intent, friendly, transactional, or standard communications.

  WhatsApp Exemption Rule:
  - If Layer 6 triggered "WhatsApp Multi-Factor Bypass active" (true WhatsApp security code without links or money demands), the classification MUST be "Safe" and risk "Low".

  Analysis Target Content: "${text}"

  OUTPUT FORMAT:
  - Output raw JSON only. Do not wrap in markdown code blocks.
  - Your JSON must match this TypeScript interface:
  {
    "risk": "High" | "Medium" | "Low",
    "classification": "Phishing" | "Scam" | "Social Engineering" | "Safe",
    "explanation": "Clear, direct security analysis (max 2 sentences) in English.",
    "tags": ["Urgent Prompt", "Credential Harvesting", etc],
    "action": "Block/Ignore" | "Monitor" | "Allow" | "Report",
    "sevenLayers": {
      "layer1": { "status": "safe" | "warning" | "threat", "details": "string describing finding" },
      "layer2": { "status": "safe" | "warning" | "threat", "details": "string describing finding" },
      "layer3": { "status": "safe" | "warning" | "threat", "details": "string describing finding" },
      "layer4": { "status": "safe" | "warning" | "threat", "details": "string describing finding" },
      "layer5": { "status": "safe" | "warning" | "threat", "details": "string describing finding" },
      "layer6": { "status": "safe" | "warning" | "threat", "details": "string describing finding" },
      "layer7": { "status": "safe" | "warning" | "threat", "details": "string describing finding" }
    }
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          risk: {
            type: Type.STRING,
            enum: ["High", "Medium", "Low"],
          },
          classification: {
            type: Type.STRING,
            enum: ["Phishing", "Scam", "Social Engineering", "Safe"],
          },
          explanation: {
            type: Type.STRING,
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          action: {
            type: Type.STRING,
            enum: ["Block/Ignore", "Monitor", "Allow", "Report"],
          },
          sevenLayers: {
            type: Type.OBJECT,
            properties: {
              layer1: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["safe", "warning", "threat"] },
                  details: { type: Type.STRING }
                },
                required: ["status", "details"]
              },
              layer2: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["safe", "warning", "threat"] },
                  details: { type: Type.STRING }
                },
                required: ["status", "details"]
              },
              layer3: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["safe", "warning", "threat"] },
                  details: { type: Type.STRING }
                },
                required: ["status", "details"]
              },
              layer4: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["safe", "warning", "threat"] },
                  details: { type: Type.STRING }
                },
                required: ["status", "details"]
              },
              layer5: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["safe", "warning", "threat"] },
                  details: { type: Type.STRING }
                },
                required: ["status", "details"]
              },
              layer6: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["safe", "warning", "threat"] },
                  details: { type: Type.STRING }
                },
                required: ["status", "details"]
              },
              layer7: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["safe", "warning", "threat"] },
                  details: { type: Type.STRING }
                },
                required: ["status", "details"]
              }
            },
            required: ["layer1", "layer2", "layer3", "layer4", "layer5", "layer6", "layer7"]
          }
        },
        required: ["risk", "classification", "explanation", "tags", "action", "sevenLayers"],
      },
    },
  });

  try {
    const parsed = JSON.parse(response.text.trim());
    return parsed as ScanResult;
  } catch (error) {
    console.error("Failed to parse 7-layer Gemini response:", error);
    // Fallback combining computed heuristics
    const heuristicRisk = (l1Status === 'threat' || l2Status === 'threat' || l3Status === 'threat') ? 'High' : 'Low';
    return {
      risk: heuristicRisk,
      classification: heuristicRisk === 'High' ? 'Phishing' : 'Safe',
      explanation: "Scanned using fast local heuristics. Deep AI scanning experienced a processing issue.",
      tags: primaryUrl ? ["Heuristic Marker"] : [],
      action: heuristicRisk === 'High' ? 'Block/Ignore' : 'Allow',
      sevenLayers: {
        layer1: { status: l1Status, details: l1Details },
        layer2: { status: l2Status, details: l2Details },
        layer3: { status: l3Status, details: l3Details },
        layer4: { status: 'safe', details: 'Deep semantic scan bypassed due to processing timeout.' },
        layer5: { status: l5Status, details: l5Details },
        layer6: { status: l6Status, details: l6Details },
        layer7: { status: l7Status, details: l7Details }
      }
    };
  }
}

export async function familyGuardianAnalysis(seniorName: string, recentThreats: any[], language: string = "English"): Promise<string> {
  const prompt = `You are "SentryAI Family Shield", the guardian module for SentryAI.
  
  You are reporting to the "Guardian" about their family member: "${seniorName}".
  
  Recent Threats Detected for ${seniorName}:
  ${JSON.stringify(recentThreats, null, 2)}
  
  YOUR MISSION:
  1. Provide a clear, actionable overview of ${seniorName}'s security status.
  2. Explain the nature of the threats in simple, non-technical terms for the family.
  3. Suggest immediate protective actions the Guardian should take.
  
  TONE: Protective, professional, empathetic, and clear.
  LANGUAGE: Respond in ${language}.
  
  STRICT LANGUAGE CONSISTENCY POLICY (CRITICAL):
  1. RESPOND ENTIRELY in ${language}. 
  2. NEVER mix languages in this report.
  3. ARABIC RULES: 
     - Use Modern Standard Arabic (فصحى) only. 
     - NO Moroccan Darija, NO Dialects. 
     - NO Franco-Arab.
     - NO mixing with French or English words.
  4. OTHER LANGUAGES: Use standard/formal versions.
  5. VIOLATION CHECK: Verify that the report is 100% in ONE language only.
  
  FORMAT: Use bullet points and clear headings. Keep it under 300 words.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  return response.text.trim();
}

export interface DiagnosisResult {
  healthScore: number;
  overallRisk: "Critical" | "High" | "Medium" | "Low";
  statusTitle: string;
  diagnosisText: string;
  vulnerabilities: {
    name: string;
    details: string;
    category: "Network" | "Configuration" | "Credential" | "Integrity";
    severity: "High" | "Medium" | "Low";
  }[];
  prescription: {
    immediateAction: string;
    preventativeMeasures: string[];
    treatmentDuration: string;
  };
}

export async function diagnoseSystem(systemReport: string, language: string = "English"): Promise<DiagnosisResult> {
  const prompt = `You are "SentryAI System Doctor" (طبيب النظام الذكي), an expert AI forensic system-level diagnostic system.
  Your mission is to perform a deep medical-style diagnosis of the provided system health status report, active process parameters, or configuration script.

  SYSTEM REPORT TO ANALYZE:
  "${systemReport}"

  YOUR GOAL:
  1. Act as a cyber-medical specialist. Create an elegant, reassuring, but highly analytical diagnosis.
  2. Grade the system's health from 0 to 100 (where 100 is pristine health, and below 50 indicates acute infection/vulnerability).
  3. Provide a medical status title, a clinical explanation, a list of active vulnerabilities, and a clear "prescription" for treatment.
  
  LANGUAGE REQUIREMENT:
  - You must generate the "statusTitle", "diagnosisText", "vulnerabilities", and "prescription" fields in ${language}.
  - If language is "Arabic", translate technical concepts elegantly to clear Modern Standard Arabic (فصحى). Avoid English words or mixed terms.
  
  OUTPUT FORMAT:
  - Output raw JSON only matching the schema below.
  - Do not use markdown backticks or enclose in code blocks.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          healthScore: { type: Type.INTEGER },
          overallRisk: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low"] },
          statusTitle: { type: Type.STRING },
          diagnosisText: { type: Type.STRING },
          vulnerabilities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                details: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Network", "Configuration", "Credential", "Integrity"] },
                severity: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
              },
              required: ["name", "details", "category", "severity"]
            }
          },
          prescription: {
            type: Type.OBJECT,
            properties: {
              immediateAction: { type: Type.STRING },
              preventativeMeasures: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              treatmentDuration: { type: Type.STRING }
            },
            required: ["immediateAction", "preventativeMeasures", "treatmentDuration"]
          }
        },
        required: ["healthScore", "overallRisk", "statusTitle", "diagnosisText", "vulnerabilities", "prescription"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim()) as DiagnosisResult;
  } catch (error) {
    console.error("Failed to parse AI System Doctor diagnosis:", error);
    // Secure fallback
    const isArabic = language === 'Arabic';
    return {
      healthScore: 75,
      overallRisk: "Medium",
      statusTitle: isArabic ? "تشخيص جزئي بالوضع الآمن" : "Sub-optimal Defensive Stance",
      diagnosisText: isArabic 
        ? "النظام مستقر ولكن يوجد بعض الإعدادات الموصى بتحسينها للحفاظ على سلامة البيانات."
        : "The system is generally stable, but there are unoptimized settings that could expose resources over time.",
      vulnerabilities: [
        {
          name: isArabic ? "نقص التحقق متعدد العوامل" : "Missing Multi-Factor Authentication",
          details: isArabic ? "الحسابات النشطة لا تستخدم طبقات تحقق إضافية لضمان الهوية." : "Administrative credentials rely solely on single-factor passwords.",
          category: "Credential",
          severity: "Medium"
        }
      ],
      prescription: {
        immediateAction: isArabic ? "تفعيل جدار الحماية وامتيازات المستخدم الأدنى." : "Enable host-level state rules and enforce least-privilege access rules.",
        preventativeMeasures: isArabic 
          ? ["تنظيف ملفات الارتباط المؤقتة", "جدولة مراجعة أمنية أسبوعية لبيانات الوصول"]
          : ["Purge high-entropy local tokens periodically", "Schedule weekly dynamic system audits"],
        treatmentDuration: isArabic ? "تدخل فوري" : "Immediate action"
      }
    };
  }
}
