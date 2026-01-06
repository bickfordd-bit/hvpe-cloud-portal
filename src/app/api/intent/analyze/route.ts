/**
 * Intent Analysis API Route
 * POST /api/intent/analyze - Analyze user intent using AI
 */

import { NextRequest, NextResponse } from "next/server";
import { runChat } from "@/lib/ai/openaiClient";

type AnalyzeRequest = {
  intent: string;
};

type Action = {
  step: string;
  why: string;
};

type AnalyzeResponse = {
  summary: string;
  actions: Action[];
  configFlags?: string[];
};

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequest = await req.json();
    const { intent } = body;

    if (!intent || typeof intent !== "string" || !intent.trim()) {
      return NextResponse.json(
        { error: "Intent is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    // Use OpenAI to analyze the intent
    const systemPrompt = `You are an AI assistant helping Billy, a trader, understand and execute trading and portfolio management intents.

Analyze the user's intent and provide:
1. A brief summary (one sentence) of what they want to do
2. A list of concrete actions needed to fulfill the intent (2-5 actions)
3. For each action, explain WHY it's needed in coaching style
4. Optional: config flags that should be created/modified

Respond ONLY with valid JSON in this exact format:
{
  "summary": "Got it! Here's what I'll do: ...",
  "actions": [
    {
      "step": "Action description",
      "why": "Rationale in coaching style"
    }
  ],
  "configFlags": ["OPTIONAL_FLAG_NAME"]
}

Keep responses lightweight and actionable. Focus on trading/portfolio context.`;

    const userPrompt = `User intent: "${intent}"

Analyze this intent and provide the execution plan.`;

    const { content } = await runChat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "gpt-4o-mini",
      temperature: 0.3,
    });

    // Parse the AI response
    let analysis: AnalyzeResponse;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      // Fallback: try to parse as-is
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        {
          summary:
            "I understood your intent but couldn't create a structured plan.",
          actions: [
            {
              step: "Manual review needed",
              why: "The AI response format was unexpected. Please try rephrasing your intent.",
            },
          ],
        },
        { status: 200 },
      );
    }

    // Validate the response structure
    if (!analysis.summary || !Array.isArray(analysis.actions)) {
      return NextResponse.json(
        {
          summary:
            "I understood your intent but couldn't create a structured plan.",
          actions: [
            {
              step: "Manual review needed",
              why: "The AI response structure was incomplete. Please try rephrasing your intent.",
            },
          ],
        },
        { status: 200 },
      );
    }

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error("Intent analysis failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Intent analysis failed", details: errorMessage },
      { status: 500 },
    );
  }
}
