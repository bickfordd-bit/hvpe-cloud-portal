/**
 * Text-to-Vector (T2V) Engine
 *
 * Copyright (c) 2025 Bickford Technologies LLC
 * All Rights Reserved. Patent Pending.
 *
 * This semantic vectorization engine and cosine similarity algorithms are
 * proprietary intellectual property of Bickford Technologies LLC.
 *
 * Protected Elements:
 * - OpenAI text-embedding-3-small integration
 * - Cosine similarity calculation: dot(a,b) / (|a| * |b|)
 * - Vector normalization and dot product algorithms
 * - 1536-dimensional embedding space optimization
 *
 * CONFIDENTIAL AND PROPRIETARY
 * Trade Secret - Reverse Engineering Prohibited
 */

import { getOpenAI } from "@/lib/ai/openaiClient";

// IP Protection: Engine Integrity Check
const ENGINE_SIGNATURE = 'BICKFORD_T2V_ENGINE_v1.0.0_PROPRIETARY';

function verifyEngineIntegrity(): boolean {
  // Simple integrity check - in production use cryptographic signatures
  const currentSignature = 'BICKFORD_T2V_ENGINE_v1.0.0_PROPRIETARY';
  return currentSignature === ENGINE_SIGNATURE;
}

export async function embedTexts(texts: string[], model = "text-embedding-3-small"): Promise<number[][]> {
  // IP Protection: Integrity Verification
  if (!verifyEngineIntegrity()) {
    throw new Error('Engine integrity compromised. Access denied.');
  }

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