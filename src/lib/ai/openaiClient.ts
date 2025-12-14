import OpenAI from "openai";

const apiKey =
  process.env.HVPE_OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.OPTR_OPENAI_KEY;

export function getOpenAI() {
  if (!apiKey) {
    throw new Error("OpenAI API key is not set (HVPE_OPENAI_API_KEY or OPENAI_API_KEY)");
  }
  return new OpenAI({ apiKey });
}

export type RunChatParams = {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  model?: string;
  temperature?: number;
};

export async function runChat({
  messages,
  model = "gpt-4.1-mini",
  temperature = 0.2
}: RunChatParams) {
  const client = getOpenAI();
  const started = Date.now();
  const res = await client.chat.completions.create({
    model,
    messages,
    temperature
  });
  const latencyMs = Date.now() - started;

  return {
    content: res.choices[0]?.message?.content || "",
    usage: res.usage,
    model: res.model,
    latencyMs
  };
}

// Confirm this reads from process.env.HVPE_OPENAI_API_KEY or process.env.OPENAI_API_KEY
