import { execa } from "execa";

async function hasGh(): Promise<boolean> {
  try {
    await execa("gh", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

async function collectGitOnly() {
  // Basic proxy: treat merged commits on main as "done items" with a default T2V guess.
  // You can upgrade this later to parse Conventional Commits / PR numbers.
  const { stdout } = await execa("git", ["log", "--since=30.days", "--pretty=%H|%ct|%s"]);
  const lines = stdout.split("\n").filter(Boolean);

  const workItems = lines.slice(0, 25).map((line, i) => {
    const [_sha, _ct, subject] = line.split("|");
    return {
      id: `git:${i}`,
      priority: subject.includes("P0") ? "P0" : subject.includes("P1") ? "P1" : subject.includes("P2") ? "P2" : "UNKNOWN",
      t2vDays: 3,     // proxy default
      ec: 0.6,        // proxy default
      valueUnits: 100,
      status: "done" as const
    };
  });

  return {
    workItems,
    cognitive: { K_openDecisions: 0, U_untriaged: 0, B_blocked: 0 }
  };
}

async function collectWithGh() {
  // Requires: gh auth login
  // Pull issues + PRs in a lightweight way.
  const issues = await execa("gh", ["issue", "list", "--limit", "100", "--json", "number,title,state,labels,createdAt,closedAt,assignees"]);
  const prs = await execa("gh", ["pr", "list", "--limit", "100", "--state", "merged", "--json", "number,title,createdAt,mergedAt,labels"]);

  const issueJson = JSON.parse(issues.stdout);
  const prJson = JSON.parse(prs.stdout);

  // Map merged PRs as "done work items"
  const workItems = prJson.map((pr: any) => {
    const created = new Date(pr.createdAt).getTime();
    const merged = new Date(pr.mergedAt).getTime();
    const t2vDays = Math.max(0.25, (merged - created) / (1000 * 60 * 60 * 24));

    const labels = (pr.labels ?? []).map((l: any) => l.name);
    const priority = labels.includes("priority/P0") ? "P0" : labels.includes("priority/P1") ? "P1" : labels.includes("priority/P2") ? "P2" : "UNKNOWN";

    // EC proxy: higher if it has tests/ci labels etc. (upgrade later)
    const ec = labels.includes("status/ready") ? 0.8 : 0.6;

    return {
      id: `pr:${pr.number}`,
      priority,
      t2vDays,
      ec,
      valueUnits: 100,
      status: "done" as const
    };
  });

  const openIssues = issueJson.filter((i: any) => i.state === "OPEN");
  const untriaged = openIssues.filter((i: any) => !i.assignees?.length && !(i.labels?.length));
  const blocked = openIssues.filter((i: any) => (i.labels ?? []).some((l: any) => l.name === "status/blocked"));

  return {
    workItems,
    cognitive: {
      K_openDecisions: 0,
      U_untriaged: untriaged.length,
      B_blocked: blocked.length
    }
  };
}

export async function collectSignals({ repoRoot }: { repoRoot: string }) {
  process.chdir(repoRoot);
  if (await hasGh()) {
    try {
      return await collectWithGh();
    } catch {
      return await collectGitOnly();
    }
  }
  return await collectGitOnly();
}
