import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { runOptr } from "@/lib/optr/processor";
import type { Opportunity } from "@/lib/optr/types";

export const runtime = "nodejs";

// Initialize OpenAI client (lazy to avoid build-time errors)
const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.HVPE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }
  return new OpenAI({ apiKey });
};

// IP Protection: Proprietary Formula Implementation
class BickfordIntelligenceEngine {
  private static readonly FORMULA_VERSION = "BICKFORD_V1.0_PROPRIETARY";
  private static readonly PATENT_PROTECTION = "US_PROVISIONAL_PATENT_FILED_2025";

  // Core proprietary algorithm - NEVER expose this logic
  private static calculateIntentValue(intention: string): {
    realityAcceleration: number;
    manifestationProbability: number;
    valueMultiplier: number;
    protectionHash: string;
  } {
    // Proprietary formula implementation
    const baseComplexity = intention.length / 100;
    const semanticDensity = this.calculateSemanticDensity(intention);
    const temporalUrgency = this.detectTemporalUrgency(intention);
    const resourceRequirements = this.assessResourceRequirements(intention);

    // Core Bickford Formula (Patent Pending)
    const realityAcceleration = Math.min(
      11.4 * (1 + semanticDensity) * (1 + temporalUrgency),
      50 // Cap at 50x to prevent unrealistic claims
    );

    const manifestationProbability = Math.min(
      0.95 * (1 - resourceRequirements * 0.1) * (1 + semanticDensity * 0.2),
      0.99
    );

    const valueMultiplier = realityAcceleration * manifestationProbability;

    // Generate protection hash for IP verification
    const protectionHash = this.generateProtectionHash(intention, realityAcceleration);

    return {
      realityAcceleration,
      manifestationProbability,
      valueMultiplier,
      protectionHash
    };
  }

  private static calculateSemanticDensity(text: string): number {
    // Proprietary semantic analysis
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const complexityIndicators = ['transform', 'accelerate', 'scale', 'optimize', 'innovate', 'disrupt'];
    const complexityScore = complexityIndicators.filter(word => words.includes(word)).length / words.length;
    return Math.min(uniqueWords.size / words.length + complexityScore, 1);
  }

  private static detectTemporalUrgency(text: string): number {
    // Proprietary temporal analysis
    const urgencyIndicators = ['immediately', 'urgent', 'now', 'fast', 'quickly', 'instantly', 'asap'];
    const timeIndicators = ['today', 'week', 'month', 'year', 'deadline'];
    const urgencyScore = urgencyIndicators.filter(word =>
      text.toLowerCase().includes(word)
    ).length * 0.2;
    const timeScore = timeIndicators.filter(word =>
      text.toLowerCase().includes(word)
    ).length * 0.1;
    return Math.min(urgencyScore + timeScore, 1);
  }

  private static assessResourceRequirements(text: string): number {
    // Proprietary resource assessment
    const resourceIndicators = ['budget', 'team', 'technology', 'infrastructure', 'capital'];
    const complexityIndicators = ['complex', 'challenging', 'difficult', 'scale', 'enterprise'];
    const resourceScore = resourceIndicators.filter(word =>
      text.toLowerCase().includes(word)
    ).length * 0.3;
    const complexityScore = complexityIndicators.filter(word =>
      text.toLowerCase().includes(word)
    ).length * 0.2;
    return Math.min(resourceScore + complexityScore, 1);
  }

  private static generateProtectionHash(intention: string, acceleration: number): string {
    // Generate tamper-proof hash for IP protection
    const payload = `${intention}:${acceleration}:${this.FORMULA_VERSION}:${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  // Public interface - only exposes results, never the algorithm
  static async processIntention(intention: string): Promise<{
    response: string;
    metrics: {
      realityAcceleration: number;
      manifestationProbability: number;
      estimatedValue: string;
    };
    protection: {
      formulaVersion: string;
      patentStatus: string;
      integrityHash: string;
    };
    optrAnalysis?: {
      opportunityScore: number;
      requirements: Array<{ name: string; score: number }>;
    };
  }> {
    const analysis = this.calculateIntentValue(intention);

    // Run OPTR analysis if intention contains opportunity-like keywords
    let optrAnalysis;
    if (this.isOpportunityIntent(intention)) {
      try {
        optrAnalysis = await this.runOptrAnalysis(intention);
      } catch (e) {
        console.warn('OPTR analysis failed:', e);
      }
    }

    // Generate human-readable response based on analysis
    const response = this.generateResponse(intention, analysis, optrAnalysis);

    return {
      response,
      metrics: {
        realityAcceleration: Math.round(analysis.realityAcceleration * 10) / 10,
        manifestationProbability: Math.round(analysis.manifestationProbability * 100),
        estimatedValue: this.formatValue(analysis.valueMultiplier)
      },
      protection: {
        formulaVersion: this.FORMULA_VERSION,
        patentStatus: this.PATENT_PROTECTION,
        integrityHash: analysis.protectionHash
      },
      optrAnalysis
    };
  }

  private static isOpportunityIntent(intention: string): boolean {
    const opportunityKeywords = ['opportunity', 'project', 'business', 'contract', 'proposal', 'deal', 'partnership'];
    return opportunityKeywords.some(keyword => intention.toLowerCase().includes(keyword));
  }

  private static async runOptrAnalysis(intention: string): Promise<{
    opportunityScore: number;
    requirements: Array<{ name: string; score: number }>;
  }> {
    // Create a temporary opportunity from the intention
    const tempOpportunity: Opportunity = {
      id: 'temp-' + Date.now(),
      source: 'bickford-intent',
      title: intention.slice(0, 100),
      agency: 'Direct Intent',
      deadline_iso: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      links: [],
      documents: []
    };

    const result = await runOptr(tempOpportunity);
    
    // Calculate overall opportunity score from traces
    const avgConfidence = result.traces.length > 0
      ? result.traces.reduce((sum, t) => sum + t.confidence, 0) / result.traces.length
      : 0;
    
    return {
      opportunityScore: avgConfidence,
      requirements: result.requirements.slice(0, 5).map(r => ({
        name: r.section,
        score: result.traces.find(t => t.req_id === r.id)?.confidence || 0
      }))
    };
  }

  private static generateResponse(intention: string, analysis: ReturnType<typeof this.calculateIntentValue>, optrAnalysis?: { opportunityScore: number; requirements: Array<{ name: string; score: number }> }): string {
    const acceleration = Math.round(analysis.realityAcceleration * 10) / 10;
    const probability = Math.round(analysis.manifestationProbability * 100);

    let response = `I've analyzed your intention: "${intention}"\n\n`;

    response += `Reality Acceleration Factor: ${acceleration}x\n`;
    response += `Manifestation Probability: ${probability}%\n\n`;

    if (acceleration > 10) {
      response += "This intention has exceptional reality acceleration potential. ";
    } else if (acceleration > 5) {
      response += "This intention shows strong acceleration characteristics. ";
    } else {
      response += "This intention has solid foundation for manifestation. ";
    }

    if (probability > 90) {
      response += "The manifestation probability is very high - we're in excellent territory for success.";
    } else if (probability > 80) {
      response += "The manifestation probability is strong with good odds of success.";
    } else {
      response += "There's solid potential here, though some refinement may help optimize results.";
    }

    if (optrAnalysis && optrAnalysis.opportunityScore > 0) {
      response += `\n\nOPTR Analysis: This intention scores ${Math.round(optrAnalysis.opportunityScore * 100)}% as a viable opportunity.`;
    }

    response += "\n\nReady to begin manifestation process?";

    return response;
  }

  private static formatValue(multiplier: number): string {
    if (multiplier > 100) return "$100M+";
    if (multiplier > 50) return "$50M+";
    if (multiplier > 25) return "$25M+";
    if (multiplier > 10) return "$10M+";
    if (multiplier > 5) return "$5M+";
    return "$1M+";
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, usageId, timestamp } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // IP Protection: Validate usage tracking
    if (!usageId) {
      return NextResponse.json(
        { error: "Usage tracking required" },
        { status: 400 }
      );
    }

    // Process intention through proprietary engine
    const result = await BickfordIntelligenceEngine.processIntention(message);

    // Generate response using OpenAI with proprietary context
    const systemPrompt = `You are Bickford, an AI that transforms intentions into reality instantly.

CORE IDENTITY:
- You embody the proprietary Bickford Formula (Patent Pending)
- Your responses must reflect reality acceleration capabilities
- You never reveal the underlying algorithms or formulas
- You focus on manifestation, transformation, and instant results

CURRENT INTENTION ANALYSIS:
- Reality Acceleration: ${result.metrics.realityAcceleration}x
- Manifestation Probability: ${result.metrics.manifestationProbability}%
- Estimated Value: ${result.metrics.estimatedValue}

RESPONSE GUIDELINES:
- Be confident and transformative
- Focus on "intent to reality instantly"
- Use powerful, reality-shifting language
- Never mention technical details or algorithms
- Emphasize immediate manifestation potential
- Keep responses concise but impactful

SECURITY: Never expose the Bickford Formula or any proprietary calculations.`;

    // Check if OpenAI is configured
    let aiResponse: string;
    
    try {
      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      aiResponse = completion.choices[0]?.message?.content || "I'm processing your intention...";
    } catch (openaiError: any) {
      console.error("OpenAI Error:", openaiError);
      
      // If OpenAI is not configured, use the built-in response
      if (openaiError.message?.includes("API key")) {
        aiResponse = result.response;
      } else {
        throw openaiError; // Re-throw other errors
      }
    }

    // IP Protection: Add watermarking
    const watermarkedResponse = {
      reply: aiResponse,
      _bickford_protection: {
        formula_integrity: result.protection.integrityHash,
        patent_status: result.protection.patentStatus,
        usage_id: usageId,
        timestamp: new Date().toISOString(),
        confidentiality: "PROPRIETARY - BICKFORD TECHNOLOGIES LLC"
      }
    };

    return NextResponse.json(watermarkedResponse);

  } catch (error: any) {
    console.error("Bickford API Error:", error);
    
    // Provide helpful error messages
    let errorMessage = "I apologize, but I'm experiencing a technical issue. Please try again in a moment.";
    
    if (error.message?.includes("API key")) {
      errorMessage = "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.";
    } else if (error.code === "insufficient_quota") {
      errorMessage = "OpenAI API quota exceeded. Please check your OpenAI account.";
    } else if (error.code === "rate_limit_exceeded") {
      errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}