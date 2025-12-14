import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { runChat } from "@/lib/ai/openaiClient";
import { prisma } from "@/lib/prisma";

type Body = { text: string; apply?: boolean };

export async function POST(req: Request) {
  const body: Body = await req.json();
  const { text } = body;

  if (!text) return NextResponse.json({ error: "missing text" }, { status: 400 });

  // Simple secret gate: if AI_WEBHOOK_SECRET is set, require header
  const secret = process.env.AI_WEBHOOK_SECRET;
  if (secret) {
    const h = req.headers.get("x-ai-webhook-secret") || req.headers.get("x-webhook-secret");
    if (h !== secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Instruct model to return a unified diff patch only
  const system = `You are an expert developer assistant. The user will give a natural-language instruction to change the repository. Respond ONLY with a git-style unified diff patch (the exact output of 'git diff' or 'git apply' format). Do NOT include any commentary, explanations, or markdown. If no changes are required, return an empty string.`;

  const user = `Instruction: ${text}\n\nProduce a unified diff patch that implements the requested change. Ensure new files include their file paths and contents in the patch so 'git apply' can apply them.`;

  const { content } = await runChat({ messages: [{ role: "system", content: system }, { role: "user", content: user }] });

  const patch = content.trim();
  if (!patch) return NextResponse.json({ preview: true, patch: "" });

  // persist the patch for audit / approval
  const log = await prisma.aIPatchLog.create({ data: { instruction: text, patch, applied: false } });

  // record usage in AiUsageLog (best-effort)
  try {
    await prisma.aiUsageLog.create({ data: { mode: "ai-code", taskType: "patch-generate", model: "openai", success: true } });
  } catch (e) {
    console.warn("failed to write ai usage log", e);
  }

  // Always return preview only. Applying must be performed via the approval UI which enforces admin checks.
  return NextResponse.json({ preview: true, patch, id: log.id });
}
