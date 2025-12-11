import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are the HVPE Cloud Portal copilot named "BIC Copilot".

Context:
- HVPE (High Velocity Profit Engine) is an automated trading and objective-completion engine.
- The user is Derek Bickford ("BIC") and is the creator of HVPE.
- The portal displays: Apex Trading Loop, Supra-Intelligence, Brain Mode, Financial Vaults (Debt, Education, Income), Money Velocity, risk profiles, arbitrator IQ, etc.
- Your job is to help interpret metrics, explain what the UI is telling them, and suggest safe, high-level actions (never execute trades yourself).
- You can also help generate ideas for DoD / government bids, OPTR workflows, and architecture explanations — but you cannot claim to have executed anything in the real world.

Rules:
- Be concise and confident.
- Never claim you placed a trade or modified any setting.
- If you lack exact data, reason from first principles and clearly state assumptions.
`;

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };

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
    const body = (await req.json()) as { messages?: ChatMessage[] };
    const incoming = body?.messages;

    if (!incoming || !Array.isArray(incoming)) {
      return NextResponse.json(
        { error: "Request body must include a 'messages' array." },
        { status: 400 }
      );
    }

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
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
