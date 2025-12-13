import { prisma } from "@/lib/prisma";
import type { Opportunity, RunResult, Requirement, Trace } from "./types";
import { embedTexts, cosine } from "./t2v";
import { JsonValue } from "@prisma/client/runtime/library";

async function fetchLinkText(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return "";
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return JSON.stringify(await res.json());
    return await res.text();
  } catch {
    return "";
  }
}

export async function runOptr(oppty: Opportunity, requirements?: Requirement[]): Promise<RunResult> {
  // Build plain-text corpus for each document: prefer fetching first link if present
  const docTexts: { id: string; text: string }[] = [];

  for (const d of oppty.documents || []) {
    let text = `Document: ${d.filename} (${d.type})`;
    // try to fetch a link that looks like it references this document
    if (oppty.links && oppty.links.length) {
      const first = oppty.links[0];
      const fetched = await fetchLinkText(first).catch(() => "");
      if (fetched) text += `\n\n${fetched.slice(0, 20_000)}`; // cap
    }
    docTexts.push({ id: d.id, text });
  }

  // If no documents, create a small corpus using opportunity title + links
  if (!docTexts.length) {
    const fallbackText = `${oppty.title}\n${(oppty.links || []).join("\n")}`;
    docTexts.push({ id: `oppty:${oppty.id}`, text: fallbackText });
  }

  const texts = docTexts.map((d) => d.text);

  // try to load existing embeddings from DB for this opportunity
  let embeddings: number[][] = [];
  try {
    const rows = await prisma.embedding.findMany({ where: { optrId: oppty.id } });
    if (rows && rows.length >= docTexts.length) {
      // assume order may differ; map by docId
      const map = new Map(rows.map((r) => [r.docId, r.vector as number[]]));
      embeddings = docTexts.map((d) => (map.get(d.id) as number[]) || []);
    }
  } catch (e) {
    console.warn("failed to load embeddings", e);
  }

  // if no embeddings found, compute and persist
  if (!embeddings.length || embeddings.every((v) => !v || v.length === 0)) {
    const computed = await embedTexts(texts);
    embeddings = computed;

    // persist embeddings to DB (as JSON) for later retrieval
    try {
      for (let i = 0; i < docTexts.length; i++) {
        const doc = docTexts[i];
        const vec = computed[i] || [];
        await prisma.embedding.create({
          data: {
            docId: doc.id,
            optrId: oppty.id,
            vector: vec as JsonValue,
            snippet: (doc.text || "").slice(0, 1000)
          }
        });
      }
    } catch (e) {
      // non-fatal
      console.warn("failed to persist embeddings", e);
    }

    // Best-effort: also insert into a pgvector-backed table if available.
    try {
      for (let i = 0; i < docTexts.length; i++) {
        const doc = docTexts[i];
        const vec = computed[i] || [];
        const id = `${oppty.id}:${doc.id}:${Date.now()}:${i}`;
        const vecStr = (vec || []).map((v) => Number(v).toPrecision(12)).join(",");
        const snippet = (doc.text || "").slice(0, 1000).replace(/'/g, "''");
        const docIdEsc = String(doc.id).replace(/'/g, "''");
        const optrIdEsc = String(oppty.id).replace(/'/g, "''");
        const sql = `INSERT INTO pg_embeddings (id, doc_id, optr_id, vec, snippet) VALUES ('${id}', '${docIdEsc}', '${optrIdEsc}', 'vector[${vecStr}]'::vector, '${snippet}') ON CONFLICT (id) DO NOTHING;`;
        try {
          await prisma.$executeRawUnsafe(sql);
        } catch (error) {
          console.warn("failed to write pgvector embeddings (non-fatal)", error);
        }
      }
    } catch (e) {
      console.warn("failed to write pgvector embeddings (non-fatal)", e);
    }
  }

  // default requirements if none provided (keeps compatibility with UI)
  const reqs: Requirement[] = requirements && requirements.length
    ? requirements
    : [
        { id: "REQ-001", section: "C.1", text: "Provide AI-enabled threat detection with 24/7 monitoring.", kind: "shall", priority: 1 },
        { id: "REQ-002", section: "C.2", text: "Deliver mission dashboards accessible via classified enclaves.", kind: "must", priority: 2 }
      ];

  // embed requirements in batch
  const reqTexts = reqs.map((r) => r.text);
  const reqEmbeds = await embedTexts(reqTexts);

  const traces: Trace[] = reqs.map((r, i) => {
    const re = reqEmbeds[i];
    let bestSim = 0;
    let bestIdx = 0;
    for (let j = 0; j < embeddings.length; j++) {
      const s = cosine(re, embeddings[j]);
      if (s > bestSim) {
        bestSim = s;
        bestIdx = j;
      }
    }

    const confidence = Math.max(0, Math.min(1, bestSim));
    const gaps: string[] = [];
    if (confidence < 0.5) gaps.push("Low semantic match; verify evidence manually.");

    const snippet = (docTexts[bestIdx]?.text || "").replace(/\s+/g, " ").slice(0, 300);

    return {
      req_id: r.id,
      response_id: `RESP-${i + 1}`,
      evidence_doc_ids: [docTexts[bestIdx].id],
      evidence_snippets: snippet ? [snippet] : [],
      confidence,
      gaps
    } as Trace;
  });

  // Simple scoring: coverage = fraction of reqs with confidence >= 0.5
  const covered = traces.filter((t) => t.confidence >= 0.5).length;
  const coverage = reqs.length ? covered / reqs.length : 0;

  // Win prob heuristic + ECV placeholder
  const win_prob = Math.max(0, Math.min(1, 0.25 + coverage * 0.5));
  const ecv = Math.floor((win_prob * 1_000_000) || 0);

  return {
    state: { phase: "V", blocked: false, blockers: [], coverage, win_prob, ecv },
    requirements: reqs,
    traces,
    package: { id: `pkg_${oppty.id}`, url: `https://example.com/optr-${oppty.id}.zip`, filename: `optr-${oppty.id}.zip` }
  };
}

const processor = { runOptr };

export default processor;
