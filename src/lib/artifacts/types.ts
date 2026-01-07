/**
 * Universal Artifact Access System (UAAS-A)
 * 
 * Artifacts are portable, immutable proof objects.
 * Every execution can produce artifacts as evidence.
 */

export type ArtifactType =
  | "report.pdf"
  | "data.csv"
  | "config.json"
  | "receipt.txt"
  | "diff.patch"
  | "bundle.zip"
  | "diagram.png"
  | "audio.mp3"
  | "video.mp4"
  | "contract.docx"
  | "email.eml"
  | "screenshot.png"
  | "log.txt"
  | "other";

export interface Artifact {
  id: string;
  execution_id: string;
  tenant_id: string;
  type: ArtifactType;
  filename: string;
  mime_type: string;
  size_bytes: number;
  content_base64?: string;  // For small files
  storage_url?: string;      // For large files (S3, etc.)
  created_at: string;
  metadata?: Record<string, any>;
}
