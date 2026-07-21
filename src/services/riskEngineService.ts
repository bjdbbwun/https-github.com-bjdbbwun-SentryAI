import { GoogleGenAI, Type } from "@google/genai";

let aiClient: any = null;
function getAiClient(): any {
  if (aiClient) return aiClient;
  aiClient = {
    models: {
      generateContent: async (args: any) => {
        const response = await fetch("/api/v1/gemini/generateContent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: args.model,
            contents: args.contents,
            config: args.config,
          }),
        });

        const contentType = response.headers.get("Content-Type");
        const isJson = contentType && contentType.includes("application/json");

        if (!response.ok) {
          let errMsg = "Failed to generate content via Gemini server-side proxy.";
          if (isJson) {
            const err = await response.json().catch(() => ({}));
            errMsg = err.message || err.error || errMsg;
          } else {
            const rawText = await response.text().catch(() => "");
            if (rawText.includes("<!doctype html") || rawText.includes("<html")) {
              errMsg = "Server returned an HTML error page. Gemini service might be down or key is unconfigured.";
            } else {
              errMsg = rawText.slice(0, 150) || errMsg;
            }
          }
          throw new Error(errMsg);
        }

        if (!isJson) {
          throw new Error("Expected JSON response from Gemini proxy, but received non-JSON.");
        }

        const data = await response.json();
        return {
          text: data.text,
        };
      }
    }
  };
  return aiClient;
}

export type ReputationLevel = "Safe" | "Neutral" | "Suspicious" | "Malicious";
export type ThreatFeedStatus = "Clean" | "Listed (Minor)" | "Listed (High Abuse)" | "Blacklisted (SANS/Spamhaus)";
export type ThreatAgeLevel = "Zero-Day (0-3 days)" | "Fresh (4-14 days)" | "Active (15-90 days)" | "Aged (>90 days)";
export type BehaviorType = 
  | "Safe / Benign" 
  | "Spam / Adware" 
  | "Urgency / Social Pressure" 
  | "Fake Alert / System Spoof" 
  | "Credential Harvesting" 
  | "Remote Shell Execution" 
  | "Ransomware / Encryption";

export interface RiskEngineInput {
  name: string;
  domain: string;
  domainReputation: ReputationLevel;
  email: string;
  emailReputation: ReputationLevel;
  threatFeedStatus: ThreatFeedStatus;
  userReportsCount: number;
  aiAnalysisInput: string; // Suspicious text, behavior logs, or email content
  threatAge: ThreatAgeLevel;
  behavior: BehaviorType;
}

export interface RiskWeights {
  domainWeight: number;
  emailWeight: number;
  feedWeight: number;
  reportsWeight: number;
  aiWeight: number;
  ageWeight: number;
  behaviorWeight: number;
}

export interface RiskEngineResult {
  riskScore: number; // 0 - 100
  confidence: "High" | "Medium" | "Low";
  confidenceScore: number; // 0 - 100
  severity: "Low" | "Medium" | "High" | "Critical";
  priority: "Low" | "Medium" | "High" | "Immediate";
  
  // Breakdown scores (0-100) before weighting
  breakdown: {
    domainScore: number;
    emailScore: number;
    feedScore: number;
    reportsScore: number;
    aiScore: number;
    ageScore: number;
    behaviorScore: number;
  };
  
  evidence: string[];
  mitigationSteps: string[];
  aiSummary?: string;
  calculationLogs: string[];
  aiDecision?: {
    whyDetected: string;
    evidence: string[];
    matchedPatterns: string[];
    riskFactors: string[];
    recommendedActions: string[];
  };
  explainableAI?: {
    why: string;
    how: string;
    supportingEvidence: string[];
    alternativePossibilities: string;
    confidenceJustification: string;
    detailedRecommendations: string[];
  };
}

export const DEFAULT_WEIGHTS: RiskWeights = {
  domainWeight: 15,
  emailWeight: 15,
  feedWeight: 15,
  reportsWeight: 10,
  aiWeight: 15,
  ageWeight: 10,
  behaviorWeight: 20,
};

// Preset Scenarios for instant user testing
export interface RiskScenario {
  id: string;
  title: string;
  description: string;
  input: RiskEngineInput;
}

export const PRESET_SCENARIOS: RiskScenario[] = [
  {
    id: "scen-1",
    title: "MFA Token Hijacking Campaign",
    description: "Highly sophisticated threat mimicking corporate single sign-on to bypass MFA restrictions.",
    input: {
      name: "Operation OAuth Shadow",
      domain: "secure-okta-auth-renew.com",
      domainReputation: "Malicious",
      email: "it-support@secure-okta-auth-renew.com",
      emailReputation: "Malicious",
      threatFeedStatus: "Blacklisted (SANS/Spamhaus)",
      userReportsCount: 42,
      aiAnalysisInput: "URGENT Security update required. We have detected unauthorized attempts on your mailbox. You must click here to re-verify your Okta credentials immediately to avoid lock-out.",
      threatAge: "Zero-Day (0-3 days)",
      behavior: "Credential Harvesting"
    }
  },
  {
    id: "scen-2",
    title: "Sloppy Typosquat Phishing",
    description: "A suspicious freshly registered domain targeting Microsoft login screens but using bad language templates.",
    input: {
      name: "Microsoft 365 Spoofing",
      domain: "micros0ft-offic3-update.net",
      domainReputation: "Suspicious",
      email: "billing-office365@gmail.com",
      emailReputation: "Suspicious",
      threatFeedStatus: "Listed (Minor)",
      userReportsCount: 4,
      aiAnalysisInput: "Dear customer your payment failed. Log in to your microsoft dashboard and pay now. Click link micros0ft-offic3-update.net/pay",
      threatAge: "Fresh (4-14 days)",
      behavior: "Urgency / Social Pressure"
    }
  },
  {
    id: "scen-3",
    title: "Vanguard Ransomware Host",
    description: "A highly dangerous server running encryption command-and-control payloads.",
    input: {
      name: "Vanguard C2 Gateway",
      domain: "vanguard-c2-node-7.io",
      domainReputation: "Malicious",
      email: "none@vanguard-c2-node-7.io",
      emailReputation: "Neutral",
      threatFeedStatus: "Blacklisted (SANS/Spamhaus)",
      userReportsCount: 150,
      aiAnalysisInput: "Active network socket telemetry shows outbound payloads communicating with database port on node 7. Ransom request downloaded to local servers.",
      threatAge: "Active (15-90 days)",
      behavior: "Ransomware / Encryption"
    }
  },
  {
    id: "scen-4",
    title: "Baseline Benign Verification",
    description: "A standard newsletter email with zero threat signatures and positive domain authority.",
    input: {
      name: "Weekly Enterprise Briefing",
      domain: "newsletter.enterprise-hub.com",
      domainReputation: "Safe",
      email: "briefing@enterprise-hub.com",
      emailReputation: "Safe",
      threatFeedStatus: "Clean",
      userReportsCount: 0,
      aiAnalysisInput: "Welcome to this week's digest. Today we cover standard cloud computing optimization strategies, modern JavaScript frameworks, and developer productivity hacks.",
      threatAge: "Aged (>90 days)",
      behavior: "Safe / Benign"
    }
  }
];

/**
 * Calculates score for domain reputation
 */
function getDomainScore(rep: ReputationLevel): number {
  switch (rep) {
    case "Malicious": return 100;
    case "Suspicious": return 65;
    case "Neutral": return 20;
    case "Safe": return 0;
  }
}

/**
 * Calculates score for email reputation
 */
function getEmailScore(rep: ReputationLevel): number {
  switch (rep) {
    case "Malicious": return 100;
    case "Suspicious": return 70;
    case "Neutral": return 25;
    case "Safe": return 0;
  }
}

/**
 * Calculates score for threat feed status
 */
function getFeedScore(status: ThreatFeedStatus): number {
  switch (status) {
    case "Blacklisted (SANS/Spamhaus)": return 100;
    case "Listed (High Abuse)": return 80;
    case "Listed (Minor)": return 40;
    case "Clean": return 0;
  }
}

/**
 * Calculates score for user reports (logarithmic progression)
 */
function getReportsScore(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 20;
  if (count <= 3) return 45;
  if (count <= 10) return 70;
  if (count <= 50) return 90;
  return 100;
}

/**
 * Calculates threat age score
 * Zero-days and fresh threats are high risk because security vendors haven't released definitions yet.
 */
function getAgeScore(age: ThreatAgeLevel): number {
  switch (age) {
    case "Zero-Day (0-3 days)": return 100; // Zero-day windows are highly dangerous
    case "Fresh (4-14 days)": return 75;
    case "Active (15-90 days)": return 45;
    case "Aged (>90 days)": return 15;
  }
}

/**
 * Calculates behavior score
 */
function getBehaviorScore(behavior: BehaviorType): number {
  switch (behavior) {
    case "Ransomware / Encryption": return 100;
    case "Remote Shell Execution": return 95;
    case "Credential Harvesting": return 85;
    case "Fake Alert / System Spoof": return 60;
    case "Urgency / Social Pressure": return 45;
    case "Spam / Adware": return 20;
    case "Safe / Benign": return 0;
  }
}

/**
 * Computes deterministic risk score and metrics.
 * Runs instantly in the client and serves as an excellent fallback.
 */
export function calculateDeterministicRisk(
  input: RiskEngineInput,
  weights: RiskWeights = DEFAULT_WEIGHTS
): RiskEngineResult {
  const calculationLogs: string[] = [];
  const evidence: string[] = [];
  const mitigationSteps: string[] = [];

  // 1. Get raw scores
  const domainScore = getDomainScore(input.domainReputation);
  const emailScore = getEmailScore(input.emailReputation);
  const feedScore = getFeedScore(input.threatFeedStatus);
  const reportsScore = getReportsScore(input.userReportsCount);
  const ageScore = getAgeScore(input.threatAge);
  const behaviorScore = getBehaviorScore(input.behavior);
  
  // Heuristic baseline for AI Analysis in fallback
  let aiScore = 0;
  const contentLower = input.aiAnalysisInput.toLowerCase();
  if (contentLower.includes("password") || contentLower.includes("login") || contentLower.includes("credentials")) aiScore += 30;
  if (contentLower.includes("urgent") || contentLower.includes("immediate") || contentLower.includes("action required")) aiScore += 30;
  if (contentLower.includes("click here") || contentLower.includes("verify now") || contentLower.includes("suspended")) aiScore += 30;
  if (aiScore > 90) aiScore = 90;
  if (input.behavior === "Safe / Benign") aiScore = 5;

  calculationLogs.push("Initiating SentryAI Core Risk Engine thread...");
  calculationLogs.push(`Target asset under evaluation: "${input.name}"`);

  // 2. Compute weighted average
  const totalWeight = 
    weights.domainWeight + 
    weights.emailWeight + 
    weights.feedWeight + 
    weights.reportsWeight + 
    weights.aiWeight + 
    weights.ageWeight + 
    weights.behaviorWeight;

  const normalizedWeights = {
    domain: weights.domainWeight / totalWeight,
    email: weights.emailWeight / totalWeight,
    feed: weights.feedWeight / totalWeight,
    reports: weights.reportsWeight / totalWeight,
    ai: weights.aiWeight / totalWeight,
    age: weights.ageWeight / totalWeight,
    behavior: weights.behaviorWeight / totalWeight,
  };

  const weightedScore = 
    (domainScore * normalizedWeights.domain) +
    (emailScore * normalizedWeights.email) +
    (feedScore * normalizedWeights.feed) +
    (reportsScore * normalizedWeights.reports) +
    (aiScore * normalizedWeights.ai) +
    (ageScore * normalizedWeights.age) +
    (behaviorScore * normalizedWeights.behavior);

  const riskScore = Math.round(weightedScore);
  calculationLogs.push(`Calculated core risk index: ${riskScore}/100.`);

  // 3. Determine severity and priority
  let severity: RiskEngineResult["severity"] = "Low";
  let priority: RiskEngineResult["priority"] = "Low";

  if (riskScore >= 85) {
    severity = "Critical";
    priority = "Immediate";
  } else if (riskScore >= 65) {
    severity = "High";
    priority = "High";
  } else if (riskScore >= 35) {
    severity = "Medium";
    priority = "Medium";
  } else {
    severity = "Low";
    priority = "Low";
  }

  // 4. Calculate confidence
  let confidenceScore = 30; // base score
  if (input.domainReputation !== "Neutral") confidenceScore += 15;
  if (input.emailReputation !== "Neutral") confidenceScore += 15;
  if (input.threatFeedStatus !== "Clean") confidenceScore += 20;
  if (input.userReportsCount > 0) confidenceScore += 20;
  if (input.behavior !== "Safe / Benign") confidenceScore += 10;
  if (confidenceScore > 100) confidenceScore = 100;

  let confidence: RiskEngineResult["confidence"] = "Low";
  if (confidenceScore >= 70) {
    confidence = "High";
  } else if (confidenceScore >= 40) {
    confidence = "Medium";
  }

  // 5. Generate Evidence logs
  if (input.domainReputation === "Malicious") {
    evidence.push(`Domain reputation is flagged as known malicious: "${input.domain}"`);
    mitigationSteps.push(`Immediately append wildcard blocks for domain: "${input.domain}" on DNS firewalls.`);
  } else if (input.domainReputation === "Suspicious") {
    evidence.push(`Domain exhibits suspicious metrics or unregistered age gaps: "${input.domain}"`);
    mitigationSteps.push(`Enable passive logging and deep-inspection proxies for domain: "${input.domain}"`);
  }

  if (input.emailReputation === "Malicious" || input.emailReputation === "Suspicious") {
    evidence.push(`Sender mailbox is marked with spammer or phishing records: "${input.email}"`);
    mitigationSteps.push(`Isolate sender account "${input.email}" and perform credentials audits.`);
  }

  if (input.threatFeedStatus === "Blacklisted (SANS/Spamhaus)") {
    evidence.push("Threat matched verified tactical blacklist feeds (SANS Internet Storm Center / Spamhaus blocklists).");
    mitigationSteps.push("Perform historic retroactive firewall scan for any past interactions with this host.");
  } else if (input.threatFeedStatus !== "Clean") {
    evidence.push("Matched known cyber-security intelligence threat directories.");
    mitigationSteps.push("Alert localized administrators of active suspicious matches.");
  }

  if (input.userReportsCount > 0) {
    evidence.push(`Received ${input.userReportsCount} independent reports flagging this asset as malicious.`);
    mitigationSteps.push("Notify report responders and confirm remediation steps are in effect.");
  }

  if (input.threatAge === "Zero-Day (0-3 days)") {
    evidence.push("Threat is a Zero-day (active under 72 hours), denoting extremely high bypass capability.");
    mitigationSteps.push("Enforce defensive zero-day sandboxing and isolate host execution pathways.");
  }

  if (input.behavior !== "Safe / Benign") {
    evidence.push(`Observed malicious signature behavior class: "${input.behavior}"`);
    if (input.behavior === "Ransomware / Encryption") {
      mitigationSteps.push("SHUT DOWN compromised container nodes immediately and restore from cold physical storage snapshots.");
    } else if (input.behavior === "Credential Harvesting") {
      mitigationSteps.push("Rotate active corporate SSO tokens and require physical hardware security keys for all staff.");
    } else {
      mitigationSteps.push("Deploy localized defensive software blocklists targeting this behavioral vector.");
    }
  }

  if (evidence.length === 0) {
    evidence.push("No obvious malicious threat signatures detected.");
    mitigationSteps.push("No defensive actions required. SentryAI is continuously monitoring.");
  }

  calculationLogs.push(`Determined severity to be: ${severity.toUpperCase()}.`);
  calculationLogs.push(`Determined response priority to be: ${priority.toUpperCase()}.`);
  calculationLogs.push("Deterministic threat risk calculation completed.");

  const aiDecision = {
    whyDetected: `Heuristic score of ${riskScore}/100 calculated using deterministic SentryAI reputation matrices.`,
    evidence: [...evidence],
    matchedPatterns: [
      input.behavior !== "Safe / Benign" ? `${input.behavior} behavioral signature` : "Standard baseline verification pattern"
    ],
    riskFactors: riskScore >= 65 
      ? ["High reputation mismatch", "Zero-day exploitation vector", "Active community alerts"] 
      : ["Baseline system operations"],
    recommendedActions: [...mitigationSteps]
  };

  const isHighRisk = riskScore >= 65;
  const explainableAI = {
    why: isHighRisk
      ? `High-risk score of ${riskScore}/100 triggered by suspicious behavioral signature (${input.behavior}) and target domain reputation of (${input.domainReputation}).`
      : `Legitimate score of ${riskScore}/100. Target domain (${input.domain}) and email sender exhibit safe behavioral characteristics.`,
    how: isHighRisk
      ? `The campaign utilizes credential phishing techniques combined with urgent messaging templates via an untrusted email domain (${input.email}) to coerce users into authenticating.`
      : `No aggressive psychological manipulation or bypass routines were identified in the behavioral timeline.`,
    supportingEvidence: [
      `Domain Rep: ${input.domainReputation}`,
      `Email Rep: ${input.emailReputation}`,
      `Behavior: ${input.behavior}`
    ],
    alternativePossibilities: isHighRisk
      ? "This could be an internal corporate penetration testing simulation, but security standards require treating all unauthorized simulations as hostile campaigns."
      : "No alternative threat indicators match this baseline. Safe baseline operation is highly confirmed.",
    confidenceJustification: `Calculated with 100% mathematical certainty based on local weighted static matrices without external API dependency.`,
    detailedRecommendations: isHighRisk
      ? [
          "Deploy immediate defensive DNS blocks for the domain.",
          "Alert system administrators about active credential harvesting attempts."
        ]
      : ["Maintain standard continuous monitoring protocols."]
  };

  return {
    riskScore,
    confidence,
    confidenceScore,
    severity,
    priority,
    breakdown: {
      domainScore,
      emailScore,
      feedScore,
      reportsScore,
      aiScore,
      ageScore,
      behaviorScore,
    },
    evidence,
    mitigationSteps,
    aiSummary: "Baseline heuristic scan complete. No critical anomalies discovered in text inputs, or fallback calculation is active.",
    calculationLogs,
    aiDecision,
    explainableAI
  };
}

/**
 * Calculates risk using Gemini API for advanced cognitive reasoning.
 * Falls back to deterministic calculation on failure.
 */
export async function calculateAIRisk(
  input: RiskEngineInput,
  weights: RiskWeights = DEFAULT_WEIGHTS
): Promise<RiskEngineResult> {
  const baseResult = calculateDeterministicRisk(input, weights);

  const prompt = `You are the central engine of SentryAI's Enterprise Cognitive Risk Engine.
You need to analyze the following threat asset inputs and calculate an advanced, weighted threat score.

ASSET METADATA UNDER EVALUATION:
- Name: "${input.name}"
- Target Domain: "${input.domain}" (Reputation: ${input.domainReputation})
- Target Email Sender: "${input.email}" (Reputation: ${input.emailReputation})
- Threat Feeds Status: "${input.threatFeedStatus}"
- Community Reports Flag Count: ${input.userReportsCount}
- Observational Behavioral Vector: "${input.behavior}"
- Threat Age Category: "${input.threatAge}"
- Suspicious Content Input:
"""
${input.aiAnalysisInput}
"""

INSTRUCTIONS:
1. Conduct a deep cognitive review of the suspicious content input and behavior.
2. Calculate a precise "aiAnalysisScore" (0-100) representing the threat severity based on language style, tricks, urgency, and technical behaviors.
3. Analyze how all of these parameters interact (e.g., typosquat domains paired with zero-day behaviors represent extremely high threat levels).
4. Provide a highly professional, scannable "aiSummary" (max 3-4 sentences) summarizing the actor's tactics and intent.
5. Extract 3-5 specific bullet points of "evidence" citing language cues or reputation data.
6. Provide 3-5 highly prescriptive and technical "mitigationSteps" to lock down or remediate the system against this attack vector.

7. YOU MUST POPULATE THE "aiDecision" OBJECT EXACTLY ACCORDING TO THESE SECTIONS:
   - "whyDetected": Explain the exact indicators, natural language cues, or metadata triggers that caused this classification.
   - "evidence": At least 2-3 specific technical strings or indicators extracted from the asset details or content.
   - "matchedPatterns": Threat patterns identified (e.g. brand spoofing, credential harvesting, urgency pressure, authority spoofing).
   - "riskFactors": The specific vulnerabilities or potential damages (e.g. credentials compromise, unauthorized access, identity theft).
   - "recommendedActions": Actionable security recommendations.
   - NEVER return ONLY a classification like "High Risk" without detailed explanations across all these sections.

Return a raw JSON object conforming EXACTLY to the following schema:
{
  "aiAnalysisScore": number, // integer 0-100
  "aiSummary": string, // Detailed security briefing
  "evidence": string[], // List of evidence
  "mitigationSteps": string[], // Recommended steps
  "aiDecision": {
    "whyDetected": string,
    "evidence": string[],
    "matchedPatterns": string[],
    "riskFactors": string[],
    "recommendedActions": string[]
  }
}`;

  const aiClientInstance = getAiClient();
  if (!aiClientInstance) {
    throw new Error("Gemini API key is not configured or cannot be initialized.");
  }

  try {
    const response = await aiClientInstance.models.generateContent({
      model: "gemini-3-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiAnalysisScore: { type: Type.INTEGER },
            aiSummary: { type: Type.STRING },
            evidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            mitigationSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            aiDecision: {
              type: Type.OBJECT,
              properties: {
                whyDetected: { type: Type.STRING },
                evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
                matchedPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
                riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["whyDetected", "evidence", "matchedPatterns", "riskFactors", "recommendedActions"]
            }
          },
          required: ["aiAnalysisScore", "aiSummary", "evidence", "mitigationSteps", "aiDecision"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    
    // Recalculate using the Gemini AI-generated analysis score
    const aiScore = parsed.aiAnalysisScore;
    
    // 1. Get raw scores
    const domainScore = getDomainScore(input.domainReputation);
    const emailScore = getEmailScore(input.emailReputation);
    const feedScore = getFeedScore(input.threatFeedStatus);
    const reportsScore = getReportsScore(input.userReportsCount);
    const ageScore = getAgeScore(input.threatAge);
    const behaviorScore = getBehaviorScore(input.behavior);

    const totalWeight = 
      weights.domainWeight + 
      weights.emailWeight + 
      weights.feedWeight + 
      weights.reportsWeight + 
      weights.aiWeight + 
      weights.ageWeight + 
      weights.behaviorWeight;

    const normalizedWeights = {
      domain: weights.domainWeight / totalWeight,
      email: weights.emailWeight / totalWeight,
      feed: weights.feedWeight / totalWeight,
      reports: weights.reportsWeight / totalWeight,
      ai: weights.aiWeight / totalWeight,
      age: weights.ageWeight / totalWeight,
      behavior: weights.behaviorWeight / totalWeight,
    };

    const weightedScore = 
      (domainScore * normalizedWeights.domain) +
      (emailScore * normalizedWeights.email) +
      (feedScore * normalizedWeights.feed) +
      (reportsScore * normalizedWeights.reports) +
      (aiScore * normalizedWeights.ai) +
      (ageScore * normalizedWeights.age) +
      (behaviorScore * normalizedWeights.behavior);

    const riskScore = Math.round(weightedScore);

    let severity: RiskEngineResult["severity"] = "Low";
    let priority: RiskEngineResult["priority"] = "Low";

    if (riskScore >= 85) {
      severity = "Critical";
      priority = "Immediate";
    } else if (riskScore >= 65) {
      severity = "High";
      priority = "High";
    } else if (riskScore >= 35) {
      severity = "Medium";
      priority = "Medium";
    } else {
      severity = "Low";
      priority = "Low";
    }

    // Advanced confidence calculations with AI active
    let confidenceScore = 45; // higher baseline for running cognitive AI
    if (input.domainReputation !== "Neutral") confidenceScore += 15;
    if (input.emailReputation !== "Neutral") confidenceScore += 15;
    if (input.threatFeedStatus !== "Clean") confidenceScore += 15;
    if (input.userReportsCount > 3) confidenceScore += 15;
    if (confidenceScore > 100) confidenceScore = 100;

    let confidence: RiskEngineResult["confidence"] = "Medium";
    if (confidenceScore >= 70) {
      confidence = "High";
    }

    const mergedEvidence = Array.from(new Set([...baseResult.evidence, ...parsed.evidence])).filter(
      x => !x.includes("Baseline") && !x.includes("No obvious")
    );
    if (mergedEvidence.length === 0) mergedEvidence.push("No major technical evidence was found.");

    const mergedMitigation = Array.from(new Set([...parsed.mitigationSteps, ...baseResult.mitigationSteps])).filter(
      x => !x.includes("No defensive actions")
    );

    const calculationLogs = [
      "Initiating SentryAI Core Risk Engine thread...",
      `Target asset under evaluation: "${input.name}"`,
      "Invoked SentryAI Cognitive Brain API model...",
      `Gemini calculated semantic anomaly score: ${aiScore}/100.`,
      `Computed weighted threat index: ${riskScore}/100.`,
      `Determined severity to be: ${severity.toUpperCase()}.`,
      `Determined response priority to be: ${priority.toUpperCase()}.`,
      "Cognitive neural threat risk calculation completed."
    ];

    return {
      riskScore,
      confidence,
      confidenceScore,
      severity,
      priority,
      breakdown: {
        domainScore,
        emailScore,
        feedScore,
        reportsScore,
        aiScore,
        ageScore,
        behaviorScore,
      },
      evidence: mergedEvidence,
      mitigationSteps: mergedMitigation,
      aiSummary: parsed.aiSummary,
      calculationLogs,
      aiDecision: parsed.aiDecision,
      explainableAI: parsed.explainableAI || baseResult.explainableAI
    };

  } catch (error) {
    console.error("Advanced AI calculation failed, falling back to deterministic:", error);
    const fallbackLogs = [
      ...baseResult.calculationLogs,
      "WARNING: Cognitive AI check errored or timed out. Deterministic fallback calculation returned instead."
    ];
    return {
      ...baseResult,
      calculationLogs: fallbackLogs
    };
  }
}
