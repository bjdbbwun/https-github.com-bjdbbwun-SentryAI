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

// The structure of an AI Detection Engine result
export interface DetectionResult {
  detectedType: "Phishing" | "Scam" | "Social Engineering" | "Crypto Scam" | "Fake Support" | "Fake Investment" | "Safe";
  riskScore: number; // Integer between 0 and 100
  confidence: "High" | "Medium" | "Low";
  evidence: string[]; // List of specific indicators or behaviors found in the text
  recommendation: string; // Actionable, concrete advice for the user
  explanation: string; // The "WHY" the AI reached its conclusion in detail
  aiDecision?: {
    whyDetected: string;
    evidence: string[];
    matchedPatterns: string[];
    riskFactors: string[];
    recommendedActions: string[];
  };
}

/**
 * Core AI Detection Engine function using Gemini.
 * Evaluates the input text against security heuristics and AI modeling to detect threats.
 */
export async function analyzeText(
  text: string,
  focusType?: "Phishing" | "Scam" | "Social Engineering" | "Crypto Scam" | "Fake Support" | "Fake Investment"
): Promise<DetectionResult> {
  const prompt = `You are the core of an enterprise-grade AI Cyber Security & Threat Detection Engine. 
Your task is to analyze the following content and detect malicious threats such as Phishing, Scams, Social Engineering, Crypto Scams, Fake Support, or Fake Investment schemes.

Input Content to Analyze:
"""
${text}
"""

Instructions:
1. Carefully analyze the provided text for malicious tactics, patterns, pressure, urgency, technical indicators, or misleading claims.
2. If a specific "focusType" is specified below, pay special attention to that category, but always report the true nature of the threat.
   Focus Target Category if specified: ${focusType || "None (Detect and classify automatically)"}
3. Determine the "detectedType". It MUST be one of:
   - "Phishing": Credential harvesting, deceptive links, brand impersonation.
   - "Scam": Deceptive transactions, free rewards, lotteries, buyer/seller frauds.
   - "Social Engineering": Manipulative requests, urgency, pretexting, authority impersonation.
   - "Crypto Scam": Seed phrase requests, guaranteed crypto returns, fake airdrops, transfer-to-receive scams.
   - "Fake Support": Mimicking technical support, requests for remote access, password requests, fake software updates.
   - "Fake Investment": High-yield investment programs, get-rich-quick, insider trading secrets, foreign currency exchange (forex) schemes.
   - "Safe": Genuine communication, benign educational content, or clearly harmless text.
4. Calculate a "riskScore" (integer 0 to 100):
   - 80-100: Active, high-fidelity malicious content.
   - 40-79: Highly suspicious, containing threat markers or social pressure triggers.
   - 0-39: Safe or extremely low risk.
5. Set "confidence" ("High" | "Medium" | "Low") based on the strength and quantity of evidence identified.
6. Provide a list of "evidence" (at least 2-5 bullet points) citing specific indicators or language styles found in the text.
7. Formulate a specific, protective "recommendation" containing the exact actions the user must take to stay safe.
8. Write a clear, detailed "explanation" describing exactly WHY you reached this conclusion, explaining your logical steps, the behavioral triggers detected, and the underlying threat mechanism.

9. YOU MUST POPULATE THE "aiDecision" OBJECT EXACTLY ACCORDING TO THESE SECTIONS:
   - "whyDetected": Explain the exact indicators, natural language cues, or metadata triggers that caused this classification.
   - "evidence": At least 2-3 specific technical strings or indicators extracted from the text.
   - "matchedPatterns": Threat patterns identified (e.g. brand spoofing, credential harvesting, urgency pressure, authority spoofing).
   - "riskFactors": The specific vulnerabilities or potential damages (e.g. credentials compromise, unauthorized access, identity theft).
   - "recommendedActions": Actionable security recommendations.
   - NEVER return ONLY a classification like "High Risk" without detailed explanations across all these sections.

Return a raw JSON object matching the defined schema exactly. Do not enclose in markdown code blocks.`;

  const aiClientInstance = getAiClient();
  if (!aiClientInstance) {
    console.warn("Gemini API key is not configured or cannot be initialized. Using backup heuristics.");
    return runBackupHeuristics(text, focusType);
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
            detectedType: {
              type: Type.STRING,
              enum: ["Phishing", "Scam", "Social Engineering", "Crypto Scam", "Fake Support", "Fake Investment", "Safe"]
            },
            riskScore: { type: Type.INTEGER },
            confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            explanation: { type: Type.STRING },
            evidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendation: { type: Type.STRING },
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
          required: ["detectedType", "riskScore", "confidence", "explanation", "evidence", "recommendation", "aiDecision"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim()) as DetectionResult;
    return parsed;
  } catch (error) {
    console.error("AI Detection Engine failed, using deterministic backup heuristics:", error);
    return runBackupHeuristics(text, focusType);
  }
}

/**
 * Specialized helper: Phishing Detection
 */
export async function detectPhishing(text: string): Promise<DetectionResult> {
  return analyzeText(text, "Phishing");
}

/**
 * Specialized helper: Scam Detection
 */
export async function detectScam(text: string): Promise<DetectionResult> {
  return analyzeText(text, "Scam");
}

/**
 * Specialized helper: Social Engineering Detection
 */
export async function detectSocialEngineering(text: string): Promise<DetectionResult> {
  return analyzeText(text, "Social Engineering");
}

/**
 * Specialized helper: Crypto Scam Detection
 */
export async function detectCryptoScam(text: string): Promise<DetectionResult> {
  return analyzeText(text, "Crypto Scam");
}

/**
 * Specialized helper: Fake Support Detection
 */
export async function detectFakeSupport(text: string): Promise<DetectionResult> {
  return analyzeText(text, "Fake Support");
}

/**
 * Specialized helper: Fake Investment Detection
 */
export async function detectFakeInvestment(text: string): Promise<DetectionResult> {
  return analyzeText(text, "Fake Investment");
}

/**
 * Heuristics-based fallback system if the Gemini API call fails
 */
function runBackupHeuristics(
  text: string,
  focusType?: "Phishing" | "Scam" | "Social Engineering" | "Crypto Scam" | "Fake Support" | "Fake Investment"
): DetectionResult {
  const content = text.toLowerCase();
  
  // Initialize safe defaults
  let detectedType: DetectionResult["detectedType"] = focusType || "Safe";
  let riskScore = 15;
  let confidence: DetectionResult["confidence"] = "Low";
  let explanation = "Analyzed content using local security signatures. No high-fidelity AI threat matches were found, but baseline scanning is complete.";
  let evidence: string[] = ["Baseline heuristics check completed successfully."];
  let recommendation = "Verify the authenticity of this message directly via official channels.";

  // Crypto Scam Signals
  if (content.includes("seed phrase") || content.includes("private key") || content.includes("airdrop") || (content.includes("crypto") && content.includes("wallet"))) {
    detectedType = "Crypto Scam";
    riskScore = 88;
    confidence = "Medium";
    evidence = [
      "Requests a seed phrase, private key, or wallet connection.",
      "Matches typical patterns for decentralized finance (DeFi) credential harvesting."
    ];
    explanation = "The input explicitly requests sensitive cryptographic secrets (seed phrases or private keys) or promises unverified airdrops, which is a classic crypto asset hijacking pattern.";
    recommendation = "Never share your recovery seed phrase or private keys with anyone, under any circumstances. Immediately disconnect any connected web3 wallets.";
  }
  // Fake Support Signals
  else if (content.includes("teamviewer") || content.includes("anydesk") || content.includes("support desk") || content.includes("microsoft support") || content.includes("call toll free") || content.includes("install remote")) {
    detectedType = "Fake Support";
    riskScore = 92;
    confidence = "High";
    evidence = [
      "Mentions well-known remote desktop software (TeamViewer, AnyDesk).",
      "Impersonates official technology support agents to request system control."
    ];
    explanation = "The communication contains patterns indicative of fake technical support scams. These typically request the victim to install remote control utilities or make immediate payments to fix non-existent registry issues.";
    recommendation = "Hang up or ignore the message. Do not download remote management tools like AnyDesk or TeamViewer, and never give control of your PC to unsolicited technicians.";
  }
  // Fake Investment Signals
  else if (content.includes("guaranteed return") || content.includes("high yield") || content.includes("double your money") || content.includes("passive income") || content.includes("risk free investment") || content.includes("invest today")) {
    detectedType = "Fake Investment";
    riskScore = 85;
    confidence = "Medium";
    evidence = [
      "Promises guaranteed or unusually high investment returns with zero risk.",
      "Uses high-pressure marketing tactics ('invest today', 'limited spots remaining')."
    ];
    explanation = "The content offers high-yield returns or guaranteed income. Real investments always carry risk, and any promise of 'guaranteed profit' or risk-free compounding is a hallmark of Ponzi schemes or investment scams.";
    recommendation = "Do not transfer money or crypto assets to this platform. Genuine brokerages never guarantee returns. Verify the organization with official financial regulators.";
  }
  // Phishing Signals
  else if (content.includes("login") || content.includes("verify account") || content.includes("password reset") || content.includes("suspended") || content.includes("unauthorized access") || content.includes("click here")) {
    detectedType = "Phishing";
    riskScore = 80;
    confidence = "High";
    evidence = [
      "Includes calls-to-action urging the recipient to log in or reset passwords.",
      "Creates artificial urgency regarding account suspension or unauthorized activity."
    ];
    explanation = "Detected strong credential harvesting and brand spoofing patterns. Phishing attempts routinely mimic security warnings from prominent companies to trick users into entering authentication credentials.";
    recommendation = "Do not click any embedded links. Access the service directly by typing the official URL into your web browser, and check your security dashboard directly.";
  }
  // Social Engineering Signals
  else if (content.includes("urgent") || content.includes("immediate action") || content.includes("ceo") || content.includes("wire transfer") || content.includes("buying gift cards") || content.includes("discreetly")) {
    detectedType = "Social Engineering";
    riskScore = 75;
    confidence = "Medium";
    evidence = [
      "Instructs the recipient to perform sensitive business transactions discreetly.",
      "Impersonates a senior authority figure (such as a CEO) to bypass standard safety guidelines."
    ];
    explanation = "The message employs pressure techniques and authority pretexting, matching common CEO fraud and wire transfer scam playbooks designed to bypass organizational security gates.";
    recommendation = "Verify the request independently via a separate, trusted communication channel (e.g. phone call or in-person check). Do not bypass standard wire-transfer authorization rules.";
  }
  // Generic Scam
  else if (content.includes("winner") || content.includes("claim prize") || content.includes("gift card") || content.includes("won") || content.includes("lottery") || content.includes("free reward")) {
    detectedType = "Scam";
    riskScore = 78;
    confidence = "High";
    evidence = [
      "Declares the recipient as a raffle or lottery winner without previous participation.",
      "Attempts to elicit a response by offering high-value free rewards or gift cards."
    ];
    explanation = "Matches lottery or sweepstakes scam profiles. These fraudulent schemes promise massive prizes but eventually require upfront administration fees or credential submissions to 'release the funds'.";
    recommendation = "Ignore and delete the message. Do not provide personal data, banking details, or processing fees to redeem unrequested prizes.";
  }

  const aiDecision = {
    whyDetected: explanation,
    evidence: evidence,
    matchedPatterns: [detectedType !== "Safe" ? `${detectedType} Pattern Match` : "Safe Signature Check"],
    riskFactors: riskScore >= 75 ? ["Potential credential leakage", "Asset/financial theft hazard"] : ["Low dynamic threat risk detected"],
    recommendedActions: [recommendation]
  };

  return {
    detectedType,
    riskScore,
    confidence,
    evidence,
    recommendation,
    explanation,
    aiDecision
  };
}
