import { CentralIntelligenceCore } from "./centralIntelligenceCore";

/**
 * ADVERSARIAL SIMULATION ENGINE (ASE) TYPES & INTERFACES
 */

export interface HeuristicResult {
  name: string;
  weight: number;
  triggered: boolean;
  reason: string;
  evidence: string;
  confidence: "High" | "Medium" | "Low";
}

export interface AttackerProfile {
  sophistication: "Elite / APT" | "High / Organized" | "Medium / Sophisticated" | "Low / Script Kiddie";
  likelyObjective: string;
  financialMotivation: "Extreme" | "High" | "Medium" | "Low" | "None";
  credentialTheftProbability: number; // 0 - 100
  becProbability: number; // 0 - 100
  scamCategory: string;
  campaignMaturity: "Established" | "Developing" | "Emerging" | "Novel / Zero-Day";
  potentialScale: "Global" | "Regional / Targeted" | "Spear-Phishing / Individual";
  primaryTargetAudience: string;
  secondaryTargetAudience: string;
}

export interface MitreMapping {
  techniqueId: string;
  techniqueName: string;
  reason: string;
  confidence: "High" | "Medium" | "Low";
}

export interface SocialEngineeringScores {
  authority: number; // 0 - 100
  urgency: number; // 0 - 100
  trust: number; // 0 - 100
  fear: number; // 0 - 100
  greed: number; // 0 - 100
  curiosity: number; // 0 - 100
  scarcity: number; // 0 - 100
  reciprocity: number; // 0 - 100
  overallManipulationScore: number; // 0 - 100
}

export interface ZeroDayPrediction {
  futureAbuseProbability: number; // 0 - 100
  futureCampaignProbability: number; // 0 - 100
  likelyExpansion: string;
  infrastructureRisk: "Critical" | "High" | "Medium" | "Low";
  similarityToPreviousCampaigns: number; // 0 - 100
  noveltyScore: number; // 0 - 100
}

export interface WolfMemory {
  searchQuery: string;
  campaignSimilarityPercentage: number; // 0 - 100
  matchingPatternsCount: number;
  historicalDetectionsFound: number;
  threatClusterMatch: string;
}

export interface CorrelationMatrix {
  domains: string[];
  emails: string[];
  wallets: string[];
  phoneNumbers: string[];
  campaigns: string[];
  threats: string[];
  victims: string[];
  countries: string[];
  organizations: string[];
}

export interface EvidenceItem {
  evidenceType: string;
  reason: string;
  confidence: "High" | "Medium" | "Low";
  severity: "Critical" | "High" | "Medium" | "Low";
  source: string;
  timestamp: string;
}

export interface AISummary {
  executiveSummary: string;
  technicalSummary: string;
  behaviorAnalysis: string;
  attackerPerspective: string;
  defenderPerspective: string;
  recommendedActions: string[];
  futureRisk: string;
}

export interface AseAnalysisResult {
  riskScore: number; // 0 - 100
  confidence: "High" | "Medium" | "Low";
  severity: "Critical" | "High" | "Medium" | "Low";
  threatType: string;
  campaign: string;
  attackObjective: string;
  behaviorScore: number; // 0 - 100
  manipulationScore: number; // 0 - 100
  zeroDayProbability: number; // 0 - 100
  futureAbuseProbability: number; // 0 - 100
  heuristics: HeuristicResult[];
  attackerProfile: AttackerProfile;
  mitreMapping: MitreMapping[];
  socialEngineering: SocialEngineeringScores;
  zeroDayPrediction: ZeroDayPrediction;
  wolfMemory: WolfMemory;
  correlation: CorrelationMatrix;
  evidence: EvidenceItem[];
  recommendations: string[];
  aiSummary: AISummary;
  analysisType: "AI" | "Heuristic";
  analyzedInput: string;
  timestamp: string;
}

/**
 * ENTERPRISE ADVERSARIAL SIMULATION ENGINE SERVICE
 */
export class AdversarialSimulationService {
  private static instance: AdversarialSimulationService;
  private core: CentralIntelligenceCore;

  private constructor() {
    this.core = CentralIntelligenceCore.getInstance();
  }

  public static getInstance(): AdversarialSimulationService {
    if (!AdversarialSimulationService.instance) {
      AdversarialSimulationService.instance = new AdversarialSimulationService();
    }
    return AdversarialSimulationService.instance;
  }

  /**
   * Run full predictive adversarial analysis via the backend server-side endpoint.
   * Handles security filtering, sanitization, and publishes findings to CentralIntelligenceCore.
   */
  public async analyzeInput(
    inputText: string,
    language: "English" | "Arabic" = "English"
  ): Promise<AseAnalysisResult> {
    if (!inputText || inputText.trim().length === 0) {
      throw new Error("Input text is required for adversarial analysis.");
    }

    // Client-side sanitization against basic scripts to enforce Sentry security boundaries
    const sanitizedText = inputText
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/g, "")
      .trim();

    try {
      const response = await fetch("/api/v1/ase/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Optional API Key header (or can use default session context)
          "X-API-Key": "sentry_ent_live_demo1234",
        },
        body: JSON.stringify({
          inputText: sanitizedText,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to execute adversarial simulation analysis.");
      }

      const result: AseAnalysisResult = await response.json();

      // Publish high-fidelity findings to SentryAI Central Intelligence Core event bus
      this.core.publish("ScanCompleted", "AdversarialSimulationEngine", {
        riskScore: result.riskScore,
        classification: result.threatType,
        source: "ASE-PredictiveEngine",
        evidence: result.evidence.map((e) => e.reason),
      });

      if (result.riskScore > 60) {
        this.core.publish("ThreatDetected", "AdversarialSimulationEngine", {
          id: `threat-ase-${Date.now()}`,
          name: result.campaign || `ASE-Emerging-${result.threatType}`,
          threatType: result.threatType,
          severity: result.severity,
          riskScore: result.riskScore,
          confidence: result.confidence,
          aiSummary: result.aiSummary.executiveSummary,
          indicators: result.correlation.domains.map((d, i) => ({
            id: `ind-ase-dom-${i}-${Date.now()}`,
            type: "Domain" as const,
            originalValue: d,
            value: d,
            description: "Adversarially predicted command-and-control target",
            addedAt: new Date().toISOString(),
          })),
        });
      }

      return result;
    } catch (error: any) {
      console.error("[ASE Service Error]:", error);
      throw error;
    }
  }
}
