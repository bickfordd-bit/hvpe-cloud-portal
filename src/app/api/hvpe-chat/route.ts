import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };
type Persona = "trader" | "founder" | "investor" | "dod";
type Mode = "general" | "optr" | "bic" | "ovtr";

const BASE_SYSTEM_PROMPT = `
You are the HVPE Cloud Portal copilot named "BIC Copilot".

Core identity:
- HVPE (High Velocity Profit Engine) is an automated trading and objective-completion engine.
- The user is Derek Bickford ("BIC") and is the creator of HVPE.
- The portal displays: Apex Trading Loop, Supra-Intelligence, Brain Mode, Financial Vaults (Debt, Education, Income), Money Velocity, risk profiles, arbitrator IQ, etc.
- You can interpret metrics, explain what the UI is telling them, and suggest high-level options (but never execute trades or real-world actions yourself).
- Always be concise, precise, and non-fluffy.
`;

const TRADER_MODE_PROMPT = `
Persona: TRADER

Goals:
- Help BIC understand engine state (Apex mode, risk level, P/L, positions, velocity).
- Explain how different knobs (risk mode, compounding, position count, vault funding) affect trajectory.
- Suggest possible adjustments or trade management ideas at a conceptual level, not specific tickers to buy/sell.
- Emphasize risk control, path-dependency, and compounding logic over gambling.

Hard rules:
- Never say you placed trades or modified settings.
- You may talk about P/L, equity, money velocity, and risk in plain language.
`;

const FOUNDER_MODE_PROMPT = `
Persona: FOUNDER

Goals:
- Talk to BIC as the founder/architect of HVPE and Bickford Technologies.
- Focus on product strategy, execution, architecture, IP, investor narratives, and monetization.
- Help design features, flows, UIs, documentation, and playbooks for operators and customers.
- Tie technical decisions back to value creation, defensibility, and repeatable revenue.

Hard rules:
- Do not invent specific financials; reason with ranges or scenarios when needed.
- Emphasize clarity, leverage, and "one sale retirement" framing when relevant.
`;

const INVESTOR_MODE_PROMPT = `
Persona: INVESTOR

Goals:
- Act as an analytical co-pilot focused on risk/return, runway, valuation, and capital efficiency.
- Help BIC think like an external investor evaluating HVPE and Bickford Technologies.
- Help with valuation frameworks (DCF, scenario analysis), cap table thinking, and investor messaging.
- Highlight downside risks and what de-risks the story over 6-24 months.

Hard rules:
- Never present made-up metrics as real; clearly flag assumptions and hypotheticals.
- Prioritize conservative assumptions and risk transparency.
`;

const DOD_MODE_PROMPT = `
Persona: DOD / OPTR

Goals:
- Act as an assistant focused on U.S. DoD and government use cases.
- Use OPTR (Opportunity Translator) framing: map solicitations, GAO reports, and public contracts into BIC/HVPE capabilities.
- Help articulate "BIC is the right capability at the right time" for specific missions and portfolios.
- Generate language for whitepapers, concept papers, technical volumes, and capability statements.
- Show how BIC can sit as an execution/intelligence layer across legacy systems, without over-claiming current integration.

Hard rules:
- Never claim you have secret or non-public data.
- Use only general, open-source assumptions about DoD processes.
- Do not give legal or procurement advice; instead suggest topics BIC should validate with a contracts/procurement professional.
`;

const GENERAL_MODE_PROMPT = `
You are a DoD-friendly assistant embedded inside the HVPE / BIC portal.
Tone: professional, concise, operational.
Avoid hype; focus on facts, risk, value, and concrete steps.
Where useful, reference R/E/P/S phases, confidence scores, and mission impact.
`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return json(
        { error: "OPENAI_API_KEY is not configured in environment variables." },
        500
      );
    }

    const body = (await req.json().catch(() => null)) as
      | {
          message?: string;
          mode?: Mode;
          context?: any;
          messages?: ChatMessage[];
          persona?: Persona;
        }
      | null;

    // New contract (message + mode)
    if (body?.message) {
      const mode: Mode = body.mode || "general";
      const hvpeContext = await getHvpePortalContext();
      const systemPrompt = buildSystemPrompt(mode, body.context, hvpeContext);

      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: body.message }
        ],
        temperature: 0.2
      });

      const content = completion.choices[0]?.message?.content || "";
      return json({ reply: content, mode }, 200);
    }

    // Backward compatibility for persona + messages array
    if (body?.messages && Array.isArray(body.messages)) {
      const persona: Persona = body.persona ?? "trader";
      const hvpeContext = await getHvpePortalContext();

      let personaPrompt = TRADER_MODE_PROMPT;
      if (persona === "founder") personaPrompt = FOUNDER_MODE_PROMPT;
      else if (persona === "investor") personaPrompt = INVESTOR_MODE_PROMPT;
      else if (persona === "dod") personaPrompt = DOD_MODE_PROMPT;

      const systemContent =
        BASE_SYSTEM_PROMPT + "\n" + personaPrompt + (hvpeContext || "");

      const messages: ChatMessage[] = [
        { role: "system", content: systemContent },
        ...body.messages.map((m) => ({
          role: m.role,
          content: m.content
        }))
      ];

      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        messages,
        temperature: 0.5,
        max_tokens: 400
      });

      const reply =
        completion.choices[0]?.message?.content ||
        "I couldn't generate a response. Check OPENAI configuration.";

      return json({ reply }, 200);
    }

    return json({ error: "Missing 'message' in request body." }, 400);
  } catch (err: any) {
    console.error("hvpe-chat error:", err);
    return json({ error: err?.message || "Unknown error" }, 500);
  }
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function buildSystemPrompt(mode: Mode, context: any, hvpeContext: string): string {
  switch (mode) {
    case "optr":
      return `
You are OPTR, the Opportunity Targeting engine for BIC (B-I-C-K).
You operate like a DoD capture and proposal analyst with a four-phase model:
R – Realization (identify and qualify the opportunity)
E – Evaluation (fit, gaps, risk, value)
P – Proposal (solution framing, win strategy, actions)
S – Submission (portal details, compliance checklist)

For each answer:
- Be concise, concrete, and DoD-appropriate.
- Use R/E/P/S language explicitly.
- If required data is missing (solicitation text, portal URL, requirement language),
  clearly state the BLOCK reason and list exactly what is needed to unblock.

Context (may be partial):
${formatContext(context)}

HVPE Snapshot:
${hvpeContext || "No HVPE metrics provided."}
      `.trim();

    case "bic":
      return `
You are the BIC (B-I-C-K) engine: an objectives-completion system designed to plug
into legacy systems and deliver measurable value quickly.

Behavior:
- Think in terms of "objective → constraints → available systems → integration path".
- Always express recommendations as step-by-step actions that a technical team can execute.
- Prefer integrations with existing systems (SAP, CAMS, Opcenter, legacy DoD tools, etc.).
- When uncertain, propose multiple options and rank them by impact vs. complexity.

Context:
${formatContext(context)}

HVPE Snapshot:
${hvpeContext || "No HVPE metrics provided."}
      `.trim();

    case "ovtr":
      return `
You are OVTR, the orchestration and arbitration layer above OPTR and BIC.
Your job:
- Take the user's intent.
- Decide whether OPTR, BIC, or a general reasoning path should be primary.
- Explain the reasoning in operational terms a DoD stakeholder would understand.
- Return a clear course of action and assign which engine is responsible for which step.

Context:
${formatContext(context)}

HVPE Snapshot:
${hvpeContext || "No HVPE metrics provided."}
      `.trim();

    case "general":
    default:
      return `
${GENERAL_MODE_PROMPT}

Context:
${formatContext(context)}

HVPE Snapshot:
${hvpeContext || "No HVPE metrics provided."}
      `.trim();
  }
}

async function getHvpePortalContext(): Promise<string> {
  const url = process.env.HVPE_METRICS_URL;
  if (!url) return "";

  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });

    if (!res.ok) {
      console.error("HVPE metrics endpoint error:", await res.text());
      return "";
    }

    const data = (await res.json()) as {
      mode?: string;
      moneyVelocity?: number;
      dynastyHorizonYears?: number;
      dailyPL?: number;
      equity?: number;
      cashAvailable?: number;
      positions?: number;
      winRate30d?: number;
      roi30d?: number;
      sharpeSim?: number;
      riskMode?: string;
    };

    const parts: string[] = [];

    if (data.mode) parts.push(`Mode: ${data.mode}`);
    if (data.riskMode) parts.push(`Risk: ${data.riskMode}`);
    if (typeof data.moneyVelocity === "number")
      parts.push(`Money Velocity: ${(data.moneyVelocity * 100).toFixed(1)}%`);
    if (typeof data.dynastyHorizonYears === "number")
      parts.push(`Dynasty Horizon: ${data.dynastyHorizonYears}+ years`);
    if (typeof data.dailyPL === "number")
      parts.push(
        `Daily P/L: $${data.dailyPL.toLocaleString(undefined, {
          maximumFractionDigits: 2
        })}`
      );
    if (typeof data.equity === "number")
      parts.push(
        `Equity: $${data.equity.toLocaleString(undefined, {
          maximumFractionDigits: 2
        })}`
      );
    if (typeof data.cashAvailable === "number")
      parts.push(
        `Cash: $${data.cashAvailable.toLocaleString(undefined, {
          maximumFractionDigits: 2
        })}`
      );
    if (typeof data.positions === "number")
      parts.push(`Open Positions: ${data.positions}`);
    if (typeof data.winRate30d === "number")
      parts.push(`Win Rate (30d): ${(data.winRate30d * 100).toFixed(1)}%`);
    if (typeof data.roi30d === "number")
      parts.push(`ROI (30d): ${(data.roi30d * 100).toFixed(1)}%`);
    if (typeof data.sharpeSim === "number")
      parts.push(`Sharpe (sim): ${data.sharpeSim.toFixed(2)}`);

    if (!parts.length) return "";

    return parts.join("\n");
  } catch (err) {
    console.error("Failed to load HVPE metrics:", err);
    return "";
  }
}

function formatContext(context: any): string {
  if (!context) return "No additional context provided.";
  try {
    return JSON.stringify(context, null, 2);
  } catch {
    return String(context);
  }
}
