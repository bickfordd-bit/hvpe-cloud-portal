# GitHub Workflows Documentation

## Overview

This document explains the automated GitHub Actions workflows used in the HVPE Cloud Portal repository, with particular focus on the auto-approval and auto-merge systems that enable Bickford's zero-approval workflow philosophy.

## Table of Contents

- [Auto-Approve Owner PRs](#auto-approve-owner-prs)
- [Auto-Merge Owner PRs](#auto-merge-owner-prs)
- [Security Model](#security-model)
- [Configuration](#configuration)
- [Disabling Auto-Approval](#disabling-auto-approval)

---

## Auto-Approve Owner PRs

**File**: `.github/workflows/auto-approve-owner-prs.yml`

### Purpose

Automatically approves pull requests created by the repository owner (`bickfordd-bit`) to enable zero-approval workflow. This aligns with the Bickford operating principle: **"Execution First"** with **"NO PROOF ⇒ NO EXISTENCE"** - automated approval enables faster proof generation and iteration.

### How It Works

1. **Trigger**: Runs when a PR is opened, reopened, or synchronized (new commits pushed)
2. **Condition**: Only executes if the PR author is `bickfordd-bit` (repository owner)
3. **Action**: Auto-approves the PR using `hmarr/auto-approve-action@v3`
4. **Permissions**: Requires only `pull-requests: write` (scoped, minimal access)

### Workflow Definition

```yaml
name: Auto-approve Owner PRs

on:
  pull_request_target:
    types: [opened, reopened, synchronize]

permissions:
  pull-requests: write

jobs:
  auto-approve:
    name: Auto-approve owner PRs
    if: github.event.pull_request.user.login == 'bickfordd-bit'
    runs-on: ubuntu-latest
    steps:
      - name: Auto-approve PR
        uses: hmarr/auto-approve-action@v3
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Key Features

- ✅ **Owner-only**: Strict condition ensures only `bickfordd-bit` PRs are approved
- ✅ **Secure trigger**: Uses `pull_request_target` to run in base branch context (prevents privilege escalation from forks)
- ✅ **Minimal permissions**: Only requests `pull-requests: write` (no code/contents access)
- ✅ **Fast iteration**: Enables immediate PR approval for rapid development cycles

### Alignment with Bickford Philosophy

From `docs/BICKFORD_CANON.md`:

> **T2V** = t(proof) − t(intent)  
> **Objective**: Maximize realizable sale value while keeping d/dt(BICK_$) > 0

Auto-approval reduces T2V (time-to-value) by eliminating manual approval overhead for owner PRs, accelerating the proof generation cycle. This directly supports the **"Execution First"** principle.

---

## Auto-Merge Owner PRs

**File**: `.github/workflows/auto-merge.yml`

### Purpose

A more comprehensive workflow that waits for CI checks to pass, then both approves AND auto-merges owner PRs. This workflow provides end-to-end automation from PR creation to merge.

### Differences from Auto-Approve

| Feature | Auto-Approve Owner PRs | Auto-Merge Owner PRs |
|---------|------------------------|----------------------|
| **Purpose** | Simple approval only | Approval + merge |
| **CI Checks** | Not required | Waits for checks |
| **Merge** | No | Yes (squash + delete branch) |
| **Comments** | No | Yes (status updates) |
| **Complexity** | Minimal | Full automation |

### When Each Workflow Runs

Both workflows can coexist:

1. **Auto-Approve Owner PRs** (`auto-approve-owner-prs.yml`):
   - Runs immediately when PR is opened/updated
   - Provides instant approval
   - Useful when you want approval without automatic merge

2. **Auto-Merge Owner PRs** (`auto-merge.yml`):
   - Waits for CI checks (quality, test, build)
   - Approves after checks pass
   - Enables auto-merge with squash strategy
   - Full end-to-end automation

### Recommended Usage

- **Development branches**: Let both run (instant approval + automatic merge after checks)
- **Production branches**: Disable auto-merge if you want manual merge control
- **Draft PRs**: Auto-merge skips draft PRs automatically

---

## Security Model

### Why These Workflows Are Safe

#### 1. **Owner-Only Execution**

Both workflows use strict conditions:

```yaml
if: github.event.pull_request.user.login == 'bickfordd-bit'
```

This ensures:
- ❌ External contributor PRs are NOT auto-approved
- ❌ Dependabot PRs are NOT auto-approved (handled by separate workflow)
- ❌ Copilot bot PRs are NOT auto-approved
- ✅ Only owner PRs receive automatic approval

#### 2. **pull_request_target Security**

Using `pull_request_target` instead of `pull_request`:

- ✅ Workflow runs in the context of the **base branch** (main/mobile)
- ✅ Prevents attackers from modifying workflow via fork PR
- ✅ Secrets are only accessible when condition passes (owner check)
- ❌ Cannot be exploited by external contributors

#### 3. **Scoped Permissions**

```yaml
permissions:
  pull-requests: write  # Only PR approval/comments
```

The workflow:
- ✅ Can approve/comment on PRs
- ❌ Cannot modify code
- ❌ Cannot access repository secrets (except GITHUB_TOKEN)
- ❌ Cannot push commits

#### 4. **No Code Checkout**

Neither workflow checks out the PR code, eliminating risks of:
- Running malicious scripts from PR
- Exposing secrets to untrusted code
- Code injection attacks

### Threat Model Coverage

| Attack Vector | Mitigation |
|---------------|------------|
| Fork PR attempting to get auto-approved | Owner check fails, workflow exits |
| Malicious contributor impersonating owner | GitHub authentication prevents this |
| Modified workflow in PR | `pull_request_target` runs base branch version |
| Secret exfiltration | No secrets exposed, owner-only condition |
| Privilege escalation | Scoped permissions prevent escalation |

---

## Configuration

### Enabling Auto-Merge (Repository Setting)

For the auto-merge workflow to complete merging:

1. Go to **Repository Settings** → **General**
2. Scroll to **"Pull Requests"** section
3. Enable **"Allow auto-merge"** checkbox
4. Save changes

Without this setting:
- Auto-approval still works
- Auto-merge will fail (PR stays approved but not merged)

### Branch Protection Rules

Recommended branch protection for `main`:

- ✅ Require pull request reviews (satisfied by auto-approval)
- ✅ Require status checks to pass (CI/CD workflows)
- ✅ Require branches to be up to date (optional)
- ❌ Do NOT require review from code owners (blocks auto-approval)

---

## Disabling Auto-Approval

### Method 1: Disable Per-PR

Add `[no-auto-merge]` to the PR title:

```
feat: Add new feature [no-auto-merge]
```

The `auto-merge.yml` workflow respects this flag. For `auto-approve-owner-prs.yml`, you would need to add the same check or manually close/reopen.

### Method 2: Disable Workflow Temporarily

Go to **Actions** → **Workflows** → **Auto-approve Owner PRs** → **⋯ menu** → **Disable workflow**

This stops the workflow until re-enabled.

### Method 3: Modify Workflow

Edit `.github/workflows/auto-approve-owner-prs.yml`:

```yaml
# Option A: Add additional condition
if: |
  github.event.pull_request.user.login == 'bickfordd-bit' &&
  !contains(github.event.pull_request.title, '[no-auto-approve]')

# Option B: Add label requirement
if: |
  github.event.pull_request.user.login == 'bickfordd-bit' &&
  contains(github.event.pull_request.labels.*.name, 'auto-approve')
```

### Method 4: Delete Workflow

```bash
git rm .github/workflows/auto-approve-owner-prs.yml
git commit -m "chore: disable auto-approve workflow"
git push
```

---

## Optional Enhancements

### Enhancement 1: Label-Based Filtering

Only auto-approve PRs with specific label:

```yaml
if: |
  github.event.pull_request.user.login == 'bickfordd-bit' &&
  contains(github.event.pull_request.labels.*.name, 'auto-approve')
```

### Enhancement 2: Skip Breaking Changes

Prevent auto-approval for breaking changes:

```yaml
if: |
  github.event.pull_request.user.login == 'bickfordd-bit' &&
  !contains(github.event.pull_request.labels.*.name, 'breaking-change')
```

### Enhancement 3: Notification Comments

Add comment when PR is auto-approved:

```yaml
steps:
  - name: Auto-approve PR
    uses: hmarr/auto-approve-action@v3
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
  
  - name: Comment on approval
    uses: actions/github-script@v7
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      script: |
        await github.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: context.issue.number,
          body: '✅ Auto-approved by owner workflow'
        });
```

---

## Related Workflows

### Other Automation Workflows

1. **Auto Merge Dependabot** (`.github/workflows/auto-merge-dependabot.yml`)
   - Auto-approves and merges Dependabot PRs (patch/minor updates only)
   - Separate from owner workflow for security isolation

2. **PR Checks** (`.github/workflows/pr-checks.yml`)
   - Runs quality, test, and build checks
   - Required to pass before auto-merge completes

3. **CI/CD** (`.github/workflows/ci-cd.yml`, `ci-deploy.yml`)
   - Continuous integration and deployment pipelines

---

## Troubleshooting

### Auto-Approve Doesn't Run

**Check**:
1. Is PR author exactly `bickfordd-bit`? (case-sensitive)
2. Is workflow enabled in Actions tab?
3. Check workflow run logs: **Actions** → **Auto-approve Owner PRs**

### Auto-Merge Fails After Approval

**Check**:
1. Is "Allow auto-merge" enabled in repository settings?
2. Did all required checks pass?
3. Are branch protection rules satisfied?
4. Check `auto-merge.yml` workflow logs for errors

### PR Approved But Not Merged

This is expected behavior for `auto-approve-owner-prs.yml` - it only approves, doesn't merge. Use `auto-merge.yml` for full automation, or manually merge after approval.

---

## Monitoring

### Workflow Success Rate

Check workflow runs: **Actions** → **Auto-approve Owner PRs**

Green checkmarks = successful auto-approvals
Red X = failures (check logs)

### Audit Trail

All auto-approvals are logged:
- GitHub audit log shows approval events
- Workflow run logs show timestamp and PR number
- PR timeline shows "approved by github-actions bot"

---

## Related Documentation

- `docs/BICKFORD_CANON.md` - Operating principles and philosophy
- `.github/workflows/auto-merge.yml` - Full auto-merge implementation
- `AUTOMATION.md` - Repository automation overview
- `CONTRIBUTING.md` - Contribution guidelines

---

## Questions?

For issues or feature requests related to auto-approval workflows:

1. Check workflow logs in **Actions** tab
2. Review this documentation
3. Open an issue with `workflow` label
4. Contact repository owner: `bickfordd-bit`
