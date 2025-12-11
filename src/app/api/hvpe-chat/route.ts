import OpenAI from "openai";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  const client = getClient();
  if (!client) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY is not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const messages = body?.messages;

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages must be an array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-5.1-mini",
      messages,
      temperature: 0.3
    });

    const reply = completion.choices[0]?.message;

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("hvpe-chat error:", err);
    return new Response(
      JSON.stringify({ error: "Chat request failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
