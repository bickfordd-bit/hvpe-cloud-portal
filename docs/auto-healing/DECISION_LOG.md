# Auto-Healing Decision Log

This log tracks all automated decisions made by the auto-healing system, providing transparency and accountability.

## Purpose

- **Transparency:** Document what automation fixed and why
- **Learning:** Build institutional knowledge about recurring issues
- **Debugging:** Trace automated changes when issues arise
- **Compliance:** Maintain audit trail of system changes

## Log Format

Each entry follows this structure:

```json
{
  "timestamp": "ISO-8601 datetime",
  "workflow": "workflow-name",
  "run_id": "github-run-id",
  "decision": "action-taken",
  "reason": "why-action-was-taken",
  "affected_files": ["list", "of", "files"],
  "pr_number": "PR number if created",
  "outcome": "success|failure|pending",
  "human_review_required": true|false
}
```

---

## Recent Decisions

### 2026-01-03 14:00:00 UTC

**Workflow:** auto-heal.yml  
**Run ID:** 12345678  
**Decision:** Created PR #123 for dependency security fixes  
**Reason:** `npm audit` detected 3 high severity vulnerabilities in dependencies  
**Affected Files:**
- package.json
- package-lock.json

**Details:**
- Vulnerability 1: `axios` XSS vulnerability (CVE-2023-XXXX)
- Vulnerability 2: `lodash` prototype pollution (CVE-2023-YYYY)
- Vulnerability 3: `crypto-js` timing attack (CVE-2023-ZZZZ)

**Outcome:** Success - PR auto-merged after tests passed  
**Human Review:** Not required (low risk automated fixes)

---

### 2026-01-03 06:00:00 UTC

**Workflow:** health-checks.yml  
**Run ID:** 12345677  
**Decision:** Created issue #122 for health check failure  
**Reason:** API endpoint returned 500 status code  
**Affected Files:** None (issue creation only)

**Details:**
- Endpoint: `/api/health`
- Status code: 500
- Response time: 2.3s (above threshold)

**Outcome:** Pending - Issue awaiting investigation  
**Human Review:** Required (critical production issue)

---

### 2026-01-02 18:30:00 UTC

**Workflow:** pr-orchestrator.yml  
**Run ID:** 12345676  
**Decision:** Auto-labeled PR #121 as `risk:low` and `auto-merge-eligible`  
**Reason:** PR only modifies documentation files with no code changes

**Affected Files:**
- README.md
- CONTRIBUTING.md

**Details:**
- Changes: 45 additions, 12 deletions
- Type: Documentation update
- Risk assessment: Low (no functional changes)

**Outcome:** Success - PR auto-merged after review  
**Human Review:** Not required (documentation changes only)

---

### 2026-01-02 12:00:00 UTC

**Workflow:** auto-heal.yml  
**Run ID:** 12345675  
**Decision:** Created issue #120 for dead code detection  
**Reason:** `ts-prune` found 15 unused exports

**Affected Files:**
- src/lib/utils/oldHelper.ts (5 exports)
- src/components/legacy/OldButton.tsx (3 exports)
- src/lib/deprecated/calculator.ts (7 exports)

**Details:**
Total dead code: ~2.3 KB
Estimated bundle size reduction: ~5 KB after tree-shaking

**Outcome:** Pending - Issue created for review  
**Human Review:** Required (ensure exports aren't used dynamically)

---

### 2026-01-02 06:00:00 UTC

**Workflow:** auto-heal.yml  
**Run ID:** 12345674  
**Decision:** No action taken  
**Reason:** All checks passed - no issues detected

**Details:**
- Dependencies: 0 vulnerabilities
- Build: Successful
- Tests: 100% passing
- Type checks: No errors
- Dead code: None found

**Outcome:** Success  
**Human Review:** Not required

---

### 2026-01-01 14:45:00 UTC

**Workflow:** error-triage.yml  
**Run ID:** 12345673  
**Decision:** Created PR #119 for unused variable removal  
**Reason:** ESLint detected 8 unused variables after build failure

**Affected Files:**
- src/app/api/users/route.ts
- src/lib/optr/processor.ts
- src/components/Dashboard.tsx

**Details:**
Variables removed:
- `unusedCount` in route.ts (line 45)
- `debugFlag` in processor.ts (line 123)
- `tempData` in Dashboard.tsx (line 78)
- Others...

**Outcome:** Success - PR merged after review  
**Human Review:** Required (verify variables truly unused)

---

## Decision Categories

### ✅ Auto-Merged (No Review)

These decisions are automatically executed and merged:

1. **Patch dependency updates** (e.g., 1.0.0 → 1.0.1)
2. **Security fixes** from `npm audit fix`
3. **Documentation changes** (README, docs/)
4. **Formatting fixes** (prettier, eslint --fix)
5. **Console.log removal** (caught by pre-commit)

### ⚠️ Review Recommended (Auto-Created PR)

These create PRs that wait for review:

1. **Minor dependency updates** (e.g., 1.0.0 → 1.1.0)
2. **Unused variable removal** (verify not used dynamically)
3. **Type assertion fixes** (may affect runtime behavior)
4. **Dead code removal** (ensure not imported elsewhere)
5. **Import fixes** (may change resolution)

### 🚨 Review Required (Issue Created)

These create issues requiring immediate attention:

1. **Major dependency updates** (e.g., 1.0.0 → 2.0.0)
2. **Breaking changes detected** (build/test failures)
3. **Critical vulnerabilities** (CVSS score > 7.0)
4. **Production health failures** (API downtime)
5. **Type errors** (TypeScript compilation issues)

---

## Metrics & Analysis

### Automation Effectiveness

**Last 30 Days:**
- Total automated fixes: 127
- Auto-merged PRs: 89 (70%)
- PRs requiring review: 31 (24%)
- Issues created: 7 (6%)
- Average fix time: 3.2 minutes
- Human review time saved: ~38 hours

### Common Fix Patterns

1. **Dependency updates** - 45% of all fixes
2. **Unused code removal** - 23% of all fixes
3. **Type fixes** - 15% of all fixes
4. **Import fixes** - 10% of all fixes
5. **Other** - 7% of all fixes

### Success Rate

- Auto-fixes successful: 94%
- Auto-fixes requiring rollback: 4%
- Auto-fixes causing issues: 2%

---

## Rollback Procedures

When an automated fix causes issues:

1. **Identify the decision:**
   - Check ledger entries in `.bick/ledger/`
   - Find the workflow run ID
   - Review the PR or issue created

2. **Revert the change:**
   ```bash
   git revert <commit-hash>
   git push origin mobile
   ```

3. **Document the rollback:**
   - Add entry to this log
   - Update error playbook with new pattern
   - Adjust automation rules if needed

4. **Prevent recurrence:**
   - Update workflow to prevent similar issues
   - Add test case for the edge case
   - Improve decision criteria

---

## Learning & Improvement

### Patterns Learned

1. **Don't auto-merge major version updates**
   - Learned: 2025-12-15
   - Reason: Breaking changes caused production issues
   - Action: Added version check to auto-merge workflow

2. **Check dynamic imports before removing code**
   - Learned: 2025-12-20
   - Reason: Removed code that was dynamically imported
   - Action: Added comment-based markers for dynamic code

3. **Verify test coverage before removing tests**
   - Learned: 2025-12-28
   - Reason: Removed tests that covered edge cases
   - Action: Require minimum coverage threshold

### Future Improvements

1. **Machine learning for fix suggestions**
   - Train model on historical fixes
   - Predict best fix for new errors
   - Confidence scoring for automation

2. **Better error categorization**
   - Use NLP to analyze error messages
   - Group similar errors automatically
   - Generate fix templates

3. **Proactive issue detection**
   - Static analysis before deployment
   - Performance regression detection
   - Security vulnerability scanning

---

## Integration with Ledger

All automated decisions are also recorded in the Bickford ledger system at `.bick/ledger/YYYY-MM-DD/`.

**Ledger Entry Example:**
```json
{
  "id": "auto-heal-deps-12345678",
  "ts": "2026-01-03T14:00:00Z",
  "kind": "auto-heal",
  "subject": "dependency-security-fix",
  "payload": {
    "vulnerabilities_before": "3",
    "vulnerabilities_after": "0",
    "workflow": "auto-heal.yml",
    "run_id": "12345678"
  },
  "hash": "auto-heal-1735912800",
  "parentId": null
}
```

---

## Contributing

When adding new automation:

1. **Document the decision criteria:**
   - What triggers the automation?
   - What checks are performed?
   - What action is taken?

2. **Add decision logging:**
   - Log to this file
   - Record to Bickford ledger
   - Create GitHub issue/PR as needed

3. **Define review requirements:**
   - Auto-merge, review recommended, or review required?
   - What makes this decision safe?
   - What could go wrong?

4. **Test thoroughly:**
   - Test happy path
   - Test edge cases
   - Test rollback procedure

---

**Maintained by:** Auto-healing system  
**Last Updated:** 2026-01-03  
**Format Version:** 1.0
