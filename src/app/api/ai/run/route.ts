import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runChat } from "@/lib/ai/openaiClient";

type Mode =
  | "optr-gap-analysis"
  | "optr-bid-draft"
  | "bic-objective-plan"
  | "bic-exec-summary"
  | "bic-risk-summary"
  | "hvpe-idea"
  | "hvpe-trade-narrative"
  | "generic";

function buildPrompt(mode: Mode, payload: any) {
  switch (mode) {
    case "optr-gap-analysis":
      return [
        {
          role: "system" as const,
          content:
            "You are OPTR, a government RFP/RFI analyst. Provide concise gap/delta analysis and action steps for compliance. Respond in bullet points."
        },
        {
          role: "user" as const,
          content: `RFP/RFI text:\n${payload?.rfp || ""}\n\nOur draft/capabilities:\n${payload?.capabilities || ""}`
        }
      ];

    case "optr-bid-draft":
      return [
        {
          role: "system" as const,
          content:
            "You are OPTR, drafting a concise response for a government bid. Write crisp sections with compliance language, avoid fluff, and align to the provided RFP language."
        },
        {
          role: "user" as const,
          content: `RFP section:\n${payload?.rfp || ""}\n\nOur capabilities/background:\n${payload?.capabilities || ""}\n\nRequested sections:\n${payload?.sections || ""}`
        }
      ];

    case "bic-objective-plan":
      return [
        {
          role: "system" as const,
          content:
            "You are BIC, a goal-to-plan engine for Bickford Technologies. Produce a short plan with 3-5 steps, owners, and success criteria."
        },
        {
          role: "user" as const,
          content: `Objective:\n${payload?.objective || ""}\n\nContext:\n${payload?.context || ""}`
        }
      ];

    case "bic-exec-summary":
      return [
        {
          role: "system" as const,
          content:
            "You are BIC writing a terse executive summary for leadership. Provide 3-5 bullets: outcome, impact, risk, next steps."
        },
        {
          role: "user" as const,
          content: `Topic:\n${payload?.topic || ""}\n\nKey facts:\n${payload?.facts || ""}`
        }
      ];

    case "bic-risk-summary":
      return [
        {
          role: "system" as const,
          content:
            "You are BIC acting as a risk officer. Summarize top risks and mitigations in short bullets. Be specific and actionable."
        },
        {
          role: "user" as const,
          content: `Context:\n${payload?.context || ""}\n\nKnown risks:\n${payload?.risks || ""}`
        }
      ];

    case "hvpe-idea":
      return [
        {
          role: "system" as const,
          content:
            "You are HVPE Supra. Generate a succinct trading or growth idea with rationale, risk, and next action."
        },
        {
          role: "user" as const,
          content: `Current focus:\n${payload?.focus || ""}\nConstraints:\n${payload?.constraints || ""}`
        }
      ];

    case "hvpe-trade-narrative":
      return [
        {
          role: "system" as const,
          content:
            "You are HVPE Supra narrating current trading posture. Provide a concise narrative: market context, posture, key positions, risk, and next action."
        },
        {
          role: "user" as const,
          content: `Markets:\n${payload?.markets || ""}\nPositions:\n${payload?.positions || ""}\nFocus:\n${payload?.focus || ""}`
        }
      ];

    default:
      return payload?.messages || [];
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const mode: Mode = body?.mode || "generic";
    const payload = body?.payload || {};
    const tenantId = body?.tenantId || "bickford-core";
    const userId = body?.userId || null;

    const messages = buildPrompt(mode, payload);
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided for chat" },
        { status: 400 }
      );
    }

    const result = await runChat({
      messages,
      model: body?.model || "gpt-4.1-mini",
      temperature: typeof body?.temperature === "number" ? body.temperature : 0.2
    });

    // Best-effort log; do not block response on errors
    try {
      await prisma.aiUsageLog.create({
        data: {
          tenantId,
          userId,
          mode,
          model: result.model,
          promptTokens: result.usage?.prompt_tokens ?? null,
          completionTokens: result.usage?.completion_tokens ?? null,
          totalTokens: result.usage?.total_tokens ?? null,
          latencyMs: result.latencyMs,
          success: true
        }
      });
    } catch (logErr) {
      console.warn("Failed to log AI usage", logErr);
    }

    return NextResponse.json({
      mode,
      content: result.content,
      usage: result.usage,
      model: result.model,
      latencyMs: result.latencyMs
    });
  } catch (error) {
    console.error("AI run error:", error);
    try {
      await prisma.aiUsageLog.create({
        data: {
          tenantId: "unknown",
          mode: "generic",
          success: false,
          errorMessage: (error as Error).message
        }
      });
    } catch (logErr) {
      console.warn("Failed to log AI usage (error path)", logErr);
    }
    return NextResponse.json(
      { error: "Internal error running AI task" },
      { status: 500 }
    );
  }
}
