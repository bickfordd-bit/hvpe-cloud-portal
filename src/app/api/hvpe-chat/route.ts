import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

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

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };
type Persona = "trader" | "founder" | "investor" | "dod";

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

    return `\n\nLive HVPE snapshot (from metrics service):\n- ${parts.join(
      "\n- "
    )}`;
  } catch (err) {
    console.error("Failed to load HVPE metrics:", err);
    return "";
  }
}

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function POST(req: NextRequest) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set. Add it to your env." },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json()) as {
      messages?: ChatMessage[];
      persona?: Persona;
    };
    const incoming = body?.messages;

    if (!incoming || !Array.isArray(incoming)) {
      return NextResponse.json(
        { error: "Request body must include a 'messages' array." },
        { status: 400 }
      );
    }

    const persona: Persona = body?.persona ?? "trader";

    let personaPrompt = TRADER_MODE_PROMPT;
    if (persona === "founder") personaPrompt = FOUNDER_MODE_PROMPT;
    else if (persona === "investor") personaPrompt = INVESTOR_MODE_PROMPT;
    else if (persona === "dod") personaPrompt = DOD_MODE_PROMPT;

    const hvpeContext = await getHvpePortalContext();

    const systemContent =
      BASE_SYSTEM_PROMPT + "\n" + personaPrompt + (hvpeContext || "");

    const messages: ChatMessage[] = [
      { role: "system", content: systemContent },
      ...incoming.map((m) => ({
        role: m.role,
        content: m.content
      }))
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      temperature: 0.5,
      max_tokens: 400
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "I couldn't generate a response. Check OPENAI configuration.";

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("hvpe-chat route error:", err);
    return NextResponse.json(
      {
        error: "Unexpected error in hvpe-chat route.",
        details: String(err?.message || err)
      },
      { status: 500 }
    );
  }
}
