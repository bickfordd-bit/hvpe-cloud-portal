import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/licenseSession.crypto";
import { executeWithPresence } from "@/lib/execution/withPresence";
import OpenAI from "openai";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.HVPE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "BILLY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, history } = await req.json();

  return executeWithPresence({
    tenant_id: session.tenant,
    intent: `bickford_chat: ${message.slice(0, 50)}`,
    action: async () => {
      try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are Bickford, Billy's AI investment assistant. You help Billy make informed trading decisions using paper trading (simulated). You provide clear, concise advice on stocks, portfolio allocation, and risk management. Always remind Billy that he's using paper trading mode (safe simulation).`,
            },
            ...history,
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        return NextResponse.json({
          response: completion.choices[0].message.content,
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || "Chat failed" },
          { status: 500 }
        );
      }
    },
  });
}
