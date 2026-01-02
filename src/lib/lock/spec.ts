import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { LockSpec } from "./types";

let cached: { spec: LockSpec; hash: string } | null = null;

/**
 * Load LOCK_SPEC.json from filesystem.
 * NOTE: This is Node.js only - NOT compatible with Edge Runtime (middleware).
 * For use in API routes and server components only.
 */
export function loadLockSpec(): { spec: LockSpec; hash: string } {
  // Guard: This function cannot be called from edge runtime
  if (typeof process === "undefined" || !process.cwd) {
    throw new Error("loadLockSpec() is Node.js only. Use loadLockSpecStatic() in middleware/edge.");
  }

  if (cached) return cached;

  const p = path.join(process.cwd(), "config", "LOCK_SPEC.json");
  const raw = fs.readFileSync(p, "utf8");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const spec = JSON.parse(raw) as LockSpec;

  cached = { spec, hash };
  return cached;
}
