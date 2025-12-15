#!/usr/bin/env node
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { computeBick } from "./model/compute.js";
import { collectSignals } from "./signals/collect.js";
import { renderMarkdownReport } from "./ui/report.js";

const ArgsSchema = z.object({
  cmd: z.string().default("score"),
});

function parseArgs(argv: string[]) {
  const cmd = argv[2] ?? "score";
  return ArgsSchema.parse({ cmd });
}

function readConfig(repoRoot: string) {
  const p = path.join(repoRoot, "bick.config.json");
  if (!existsSync(p)) {
    throw new Error(`Missing bick.config.json at repo root: ${p}`);
  }
  return JSON.parse(readFileSync(p, "utf8"));
}

function repoRootCwd() {
  return process.cwd();
}

async function main() {
  const { cmd } = parseArgs(process.argv);
  const root = repoRootCwd();
  const config = readConfig(root);

  if (cmd === "init") {
    const dir = path.join(root, ".bick");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "README.md"), "# BICK Ledger\n");
    console.log("✅ Initialized .bick/");
    return;
  }

  // 1) Collect real repo signals (issues/prs if gh exists; otherwise git-only)
  const signals = await collectSignals({ repoRoot: root });

  // 2) Compute BICK score + components
  const result = computeBick({ signals, config });

  // 3) Write ledger snapshot
  const ledgerDir = path.join(root, ".bick");
  if (!existsSync(ledgerDir)) mkdirSync(ledgerDir, { recursive: true });

  const ts = new Date().toISOString();
  const snapshotPath = path.join(ledgerDir, `snapshot-${ts.replace(/[:.]/g, "-")}.json`);
  writeFileSync(snapshotPath, JSON.stringify({ ts, signals, result }, null, 2));

  // 4) Print human + machine outputs
  if (cmd === "score") {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (cmd === "report") {
    const md = renderMarkdownReport({ ts, result, signals });
    const reportPath = path.join(ledgerDir, "BICK_REPORT.md");
    writeFileSync(reportPath, md);
    console.log(`✅ Wrote ${reportPath}`);
    return;
  }

  if (cmd === "tick") {
    // "Get smarter" loop = create next-best-actions list from bottlenecks
    const actions = result.nextBestActions;
    const outPath = path.join(ledgerDir, "NEXT_BEST_ACTIONS.json");
    writeFileSync(outPath, JSON.stringify({ ts, actions }, null, 2));
    console.log(JSON.stringify({ ts, actions }, null, 2));
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exit(1);
}

main().catch((e) => {
  console.error("bick failed:", e?.message ?? e);
  process.exit(1);
});
