# Repository Settings Checklist for Full PR Automation

**Complete these steps to enable zero-touch PR automation**  
**Estimated time: 5 minutes**

---

## ✅ Step-by-Step Configuration

### 1. Enable Auto-Merge (Required)

**Path:** `Settings` → `General` → Scroll to "Pull Requests" section

**Actions:**
- [x] Check: **Allow auto-merge**
- [x] Check: **Automatically delete head branches**
- [x] Select merge method: **Allow squash merging** (primary)
- [x] Optional: **Allow merge commits** (alternative)
- [x] Optional: **Allow rebase merging** (alternative)

**Why:** Without auto-merge enabled, the workflow can approve PRs but cannot enable auto-merge.

**Screenshot location:** Settings → General → Pull Requests section

---

### 2. Configure Actions Permissions (Critical)

**Path:** `Settings` → `Actions` → `General`

#### Workflow Permissions

**Actions:**
- [x] Select: **Read and write permissions**  
  ❌ NOT "Read repository contents and packages permissions"

- [x] Check: **Allow GitHub Actions to create and approve pull requests**

**Why:** Without these permissions, GitHub Actions cannot:
- Approve pull requests
- Enable auto-merge
- Create notification issues
- Update PR comments

**Screenshot location:** Settings → Actions → General → Workflow permissions

---

### 3. Branch Protection Rules (Required for Safety)

Complete this section **for each target branch**: `main`, `mobile`, `ui-redesign-v1`

**Path:** `Settings` → `Branches` → Click "Add rule"

#### Rule 1: For branch `main`

**Branch name pattern:** `main`

**Settings:**

##### Pull Request Requirements
- [x] **Require a pull request before merging**
  - **Required number of approvals:** Set to `0` or `1`
    - `0` = Bot approval is sufficient (recommended for full automation)
    - `1` = Bot approval counts as the required one
    - ❌ **DO NOT set to 2+** (blocks auto-merge - requires manual human approval)
  
  - [x] **Dismiss stale pull request approvals when new commits are pushed** (optional but recommended)
  
  - [ ] **Require review from Code Owners** (optional - may block auto-merge if CODEOWNERS defined)

##### Status Check Requirements  
- [x] **Require status checks to pass before merging**
  - [x] **Require branches to be up to date before merging**
  
  **Required status checks to add** (search and select each):
  - [x] `Code Quality` (from ci-cd.yml)
  - [x] `Run Tests` (from ci-cd.yml)
  - [x] `Build Verification` (from ci-cd.yml)
  - [ ] `Security Audit` (optional - continues on error in workflow)

##### Additional Settings
- [x] **Require conversation resolution before merging** (optional - good practice)
- [x] **Require linear history** (recommended - keeps history clean)
- [ ] **Require deployments to succeed before merging** (optional)

##### What NOT to Check
- [ ] ❌ **Require approval from specific reviewers** (blocks automation)
- [ ] ❌ **Restrict who can push to matching branches** (blocks bot)
- [ ] ❌ **Lock branch** (prevents merges)
- [ ] ❌ **Do not allow bypassing the above settings** (blocks admin auto-merge)

**Save:** Click "Create" or "Save changes"

#### Rule 2: For branch `mobile`

**Repeat all settings above with branch name pattern:** `mobile`

#### Rule 3: For branch `ui-redesign-v1`

**Repeat all settings above with branch name pattern:** `ui-redesign-v1`

---

### 4. Create Issue Labels (Required for Notifications)

**Path:** `Issues` → `Labels` → Click "New label"

Create each label:

#### Label 1: auto-merge
- **Name:** `auto-merge`
- **Description:** `Automated merge notifications`
- **Color:** `#0E8A16` (green)

#### Label 2: notification
- **Name:** `notification`
- **Description:** `Automated notification issue`
- **Color:** `#0075CA` (blue)

#### Label 3: success
- **Name:** `success`
- **Description:** `Successful operation`
- **Color:** `#28A745` (bright green)

#### Label 4: failure
- **Name:** `failure`
- **Description:** `Operation failed`
- **Color:** `#D73A4A` (red)

#### Label 5: ci-failure
- **Name:** `ci-failure`
- **Description:** `CI checks failed`
- **Color:** `#CB2431` (dark red)

**Why:** Workflow uses these labels to categorize notification issues.

---

### 5. Verify Required Secrets (Should Already Exist)

**Path:** `Settings` → `Secrets and variables` → `Actions`

**Check that these secrets exist:**
- [x] `VERCEL_TOKEN` - For Vercel deployments
- [x] `CODEX_WEBHOOK_SECRET` - For Codex integration
- [ ] `SNYK_TOKEN` (optional) - For security scanning

**Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions.

**If missing:**
```bash
# Create Vercel token
vercel login
vercel tokens create "GitHub Actions" --scope hvpe-cloud-portal

# Add to GitHub: Settings → Secrets → New repository secret
```

---

### 6. Verify Existing Workflows

**Path:** `Actions` → `Workflows`

**Ensure these are enabled:**
- [x] `CI/CD Pipeline` (ci-cd.yml) - Core CI checks
- [x] `Universal Auto-Merge All PRs` (auto-merge-all-prs.yml) - NEW
- [x] `PR Status Dashboard` (pr-status-dashboard.yml) - NEW
- [x] `Auto Merge Dependabot` (auto-merge-dependabot.yml) - Existing

**If disabled:** Click workflow → Click "Enable workflow"

---

### 7. Configure Vercel Integration (Optional but Recommended)

**Path:** Vercel Dashboard → Project Settings → Git

**Settings:**
- [x] **Production Branch:** `mobile`
- [x] **Preview Deployments:** `All non-production branches`
- [x] **Automatic deployments:** Enabled
- [x] **Comments on Pull Requests:** Enabled
- [x] **Deploy Hooks:** Not needed (uses GitHub integration)

**Why:** Ensures preview deployments appear in PR status dashboard.

---

## 🧪 Testing the Configuration

### Quick Test Checklist

After completing the setup above, test with a simple PR:

```bash
# 1. Create test branch
git checkout -b test-automation-setup
echo "# Automation test" > AUTOMATION_TEST.md
git add AUTOMATION_TEST.md
git commit -m "test: verify automation setup"
git push origin test-automation-setup

# 2. Create PR
gh pr create \
  --title "Test: Automation System Setup" \
  --body "Testing full PR automation after configuration" \
  --base mobile

# 3. Watch the magic happen
gh pr view --web
```

### Expected Results (Within 10 Minutes)

**Immediately (< 30 seconds):**
- [x] PR appears in GitHub
- [x] Bot approves PR with comment
- [x] "Auto-merge enabled" comment appears
- [x] Status dashboard comment appears

**After CI runs (5-8 minutes):**
- [x] Code Quality check passes
- [x] Run Tests check passes
- [x] Build Verification check passes
- [x] Security Audit completes

**After all checks pass:**
- [x] PR merges automatically (no manual click needed)
- [x] Branch deleted automatically
- [x] Success notification issue created
- [x] Vercel deploys preview (if configured)

**Check status:**
```bash
# View PR status
gh pr view [number]

# View workflow runs
gh run list --workflow="auto-merge-all-prs.yml"

# View notifications
gh issue list --label auto-merge
```

---

## 🚨 Troubleshooting

### Problem: Bot approved but auto-merge not enabled

**Likely cause:** Auto-merge not enabled in repository settings

**Fix:**
1. Go to Settings → General → Pull Requests
2. Check "Allow auto-merge"
3. Save changes
4. Re-run workflow: `gh run rerun [run-id]`

---

### Problem: Auto-merge enabled but not merging

**Likely cause:** Branch protection rules too strict

**Check:**
1. Settings → Branches → Edit rule
2. Is "Required approvals" set to 2 or more? → Change to 0 or 1
3. Are all required status checks listed? → Add missing checks
4. Is branch up to date? → Merge main into PR branch

**Fix:**
```bash
# Update branch
gh pr merge [number] --auto --squash

# Or manually update
git checkout test-automation-setup
git merge mobile
git push
```

---

### Problem: Workflow not running

**Likely cause:** Workflow permissions insufficient

**Fix:**
1. Settings → Actions → General
2. Select "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"
4. Save
5. Close and reopen PR to trigger workflows

---

### Problem: Status checks not appearing in branch protection

**Likely cause:** Checks haven't run yet on this branch

**Fix:**
1. Push a commit to the branch first
2. Wait for CI to run
3. Go back to branch protection settings
4. Status checks should now appear in search
5. Select required checks

**Alternative:** Manually type check names:
- `Code Quality`
- `Run Tests`
- `Build Verification`

---

### Problem: Notification issues not created

**Likely cause:** Labels don't exist

**Fix:**
1. Go to Issues → Labels
2. Create missing labels (see step 4 above)
3. Re-run workflow or merge another PR

---

## 📊 Validation Checklist

Before closing this checklist, verify:

**Repository Settings:**
- [x] Auto-merge enabled
- [x] Actions have read/write permissions
- [x] Actions can create and approve PRs

**Branch Protection (for each target branch):**
- [x] PR required before merging
- [x] Required approvals = 0 or 1 (not 2+)
- [x] Required status checks configured
- [x] Branches must be up to date

**Labels:**
- [x] All 5 labels created (auto-merge, notification, success, failure, ci-failure)

**Workflows:**
- [x] CI/CD Pipeline enabled
- [x] Universal Auto-Merge enabled
- [x] PR Status Dashboard enabled

**Integration:**
- [x] Vercel connected (optional)
- [x] Required secrets exist

**Testing:**
- [x] Test PR created and auto-merged successfully
- [x] Notification issue created
- [x] Status dashboard updated

---

## 📝 Post-Setup Actions

### Document Current Configuration

Create a record of your settings:

```bash
# Save current branch protection rules
gh api repos/:owner/:repo/branches/main/protection > branch-protection-main.json
gh api repos/:owner/:repo/branches/mobile/protection > branch-protection-mobile.json

# Save to .github/settings-backup/
mkdir -p .github/settings-backup
mv branch-protection-*.json .github/settings-backup/

# Commit for reference
git add .github/settings-backup/
git commit -m "docs: backup branch protection settings"
git push
```

### Set Up Monitoring (Optional)

**Watch for automation issues:**
```bash
# Add to crontab or monitoring system
gh issue list --label ci-failure --json number,title,createdAt

# Or create custom webhook alert
curl -X POST https://your-webhook-url.com \
  -H "Content-Type: application/json" \
  -d '{"message": "Check auto-merge notifications"}'
```

### Schedule Periodic Review

**Weekly:**
- Review auto-merge notification issues
- Check for repeated CI failures
- Verify automation still working

**Monthly:**
- Review Actions usage (shouldn't exceed free tier)
- Update documentation if process changed
- Audit merged PRs for quality

---

## 🔄 Rollback Instructions

If you need to disable automation:

### Quick Disable (Keeps Workflows)

1. Settings → Branches → Edit each rule
2. Change "Required approvals" from 0 to 1 or 2
3. Uncheck "Allow auto-merge" in General settings
4. PRs will now require manual approval and merge

### Full Removal

```bash
# Disable workflows
gh workflow disable auto-merge-all-prs.yml
gh workflow disable pr-status-dashboard.yml

# Or delete them
git rm .github/workflows/auto-merge-all-prs.yml
git rm .github/workflows/pr-status-dashboard.yml
git commit -m "chore: remove auto-merge automation"
git push
```

### Restore Manual Process

1. Settings → General → Pull Requests → Uncheck "Allow auto-merge"
2. Settings → Branches → Edit rules → Increase required approvals to 2
3. Merge PRs manually via GitHub UI

---

## 📚 Additional Resources

**Documentation:**
- [Full Automation Guide](../docs/AUTOMATION.md) - Complete system documentation
- [GitHub Auto-Merge Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request)
- [Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

**Support:**
- Create issue with `automation` label
- Check Actions logs: `gh run list`
- Review workflow files in `.github/workflows/`

---

## ✅ Completion Verification

**Sign off when complete:**

- [ ] All repository settings configured
- [ ] Branch protection rules set for all target branches
- [ ] Issue labels created
- [ ] Workflows enabled
- [ ] Test PR successfully auto-merged
- [ ] Notification issue created
- [ ] Team notified of new automation
- [ ] Documentation reviewed and understood

**Completed by:** _________________  
**Date:** _________________  
**Time taken:** _________ minutes

---

**Expected outcome:** Zero manual clicks needed for PR approval and merge. All PRs auto-merge when CI passes. 🚀

**System status after completion:** ✅ Fully automated
