import { getOpenAI } from "@/lib/ai/openaiClient";

export async function embedTexts(texts: string[], model = "text-embedding-3-small"): Promise<number[][]> {
  if (!texts.length) return [];
  const client = getOpenAI();
  const res = await client.embeddings.create({ model, input: texts });
  return res.data.map((d) => d.embedding as number[]);
}

export function dot(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
}

export function norm(a: number[]): number {
  return Math.sqrt(a.reduce((s, v) => s + v * v, 0));
}

export function cosine(a: number[], b: number[]): number {
  const n = norm(a) * norm(b);
  if (n === 0) return 0;
  return dot(a, b) / n;
}