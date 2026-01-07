import { Artifact } from "./types";
import { v4 as uuid } from "uuid";

/**
 * Store an artifact produced during execution.
 * 
 * In production, this would:
 * - Upload large files to S3/R2
 * - Store metadata in database
 * - Emit event for SSE stream
 */
export async function storeArtifact(opts: {
  execution_id: string;
  tenant_id: string;
  filename: string;
  mime_type: string;
  content: Buffer;
  metadata?: Record<string, any>;
}): Promise<Artifact> {
  const artifact: Artifact = {
    id: uuid(),
    execution_id: opts.execution_id,
    tenant_id: opts.tenant_id,
    type: inferArtifactType(opts.filename),
    filename: opts.filename,
    mime_type: opts.mime_type,
    size_bytes: opts.content.length,
    content_base64: opts.content.toString("base64"),
    created_at: new Date().toISOString(),
    metadata: opts.metadata,
  };

  // TODO: Implement actual storage
  if (process.env.NODE_ENV === "development") {
    console.log("[ARTIFACT]", artifact.filename, `(${artifact.size_bytes} bytes)`);
  }

  return artifact;
}

/**
 * Retrieve artifacts for an execution.
 */
export async function getArtifacts(_execution_id: string): Promise<Artifact[]> {
  // TODO: Implement actual retrieval
  return [];
}

/**
 * Infer artifact type from filename.
 */
function inferArtifactType(filename: string): Artifact["type"] {
  const ext = filename.split(".").pop()?.toLowerCase();
  
  const typeMap: Record<string, Artifact["type"]> = {
    pdf: "report.pdf",
    csv: "data.csv",
    json: "config.json",
    txt: "log.txt",
    patch: "diff.patch",
    zip: "bundle.zip",
    png: "screenshot.png",
    jpg: "screenshot.png",
    jpeg: "screenshot.png",
    mp3: "audio.mp3",
    mp4: "video.mp4",
    docx: "contract.docx",
    eml: "email.eml",
  };

  return typeMap[ext || ""] || "other";
}
