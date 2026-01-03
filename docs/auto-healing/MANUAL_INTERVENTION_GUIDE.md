# Manual Intervention Guide

When automation can't fix an issue, this guide provides exact steps for manual intervention.

## When Manual Intervention is Required

Automation will create an issue labeled `needs-review` or `manual-intervention-required` when:

1. **High-risk changes** detected
2. **Complex errors** requiring human judgment
3. **Multiple conflicting fixes** possible
4. **Automation confidence low** (<70%)
5. **Breaking changes** that can't be auto-resolved

---

## Table of Contents

- [Critical Production Issues](#critical-production-issues)
- [Build Failures](#build-failures)
- [Database Issues](#database-issues)
- [Security Vulnerabilities](#security-vulnerabilities)
- [Type System Errors](#type-system-errors)
- [Test Failures](#test-failures)
- [Merge Conflicts](#merge-conflicts)
- [Performance Degradation](#performance-degradation)

---

## Critical Production Issues

### Symptom: API Returning 500 Errors

**Detection:**
- Health check workflow fails
- Issue created: "🚨 Production Health Check Failed"

**Immediate Actions:**

1. **Check Vercel logs:**
   ```bash
   vercel logs https://hvpe-cloud-portal.vercel.app
   ```

2. **Review recent deployments:**
   ```bash
   gh run list --workflow=ci-cd.yml --limit 5
   ```

3. **If needed, rollback immediately:**
   - Go to Vercel dashboard
   - Find previous successful deployment
   - Click "Promote to Production"
   - **ETA to rollback: ~30 seconds**

4. **Identify the issue:**
   - Check error logs for stack trace
   - Review recent commits
   - Check database connectivity

5. **Apply hot fix:**
   ```bash
   git checkout -b hotfix/production-issue
   # Make minimal fix
   git commit -m "fix: resolve production 500 errors"
   git push origin hotfix/production-issue
   gh pr create --title "🚨 HOTFIX: Production 500 errors" --label critical
   ```

6. **Verify fix:**
   ```bash
   # Wait for CI to pass
   # Check health endpoint
   curl -I https://hvpe-cloud-portal.vercel.app/api/health
   ```

**Expected Resolution Time:** 5-10 minutes

---

### Symptom: Database Connection Failures

**Detection:**
- API routes timeout
- Prisma client errors in logs

**Immediate Actions:**

1. **Verify DATABASE_URL:**
   ```bash
   # In Vercel dashboard, check environment variables
   # Ensure DATABASE_URL is set correctly
   ```

2. **Test connection locally:**
   ```bash
   npx prisma db pull --preview-feature
   ```

3. **Check database health:**
   ```bash
   # Connect to database
   psql $DATABASE_URL
   \l  # List databases
   \dt # List tables
   ```

4. **If connection pool exhausted:**
   ```typescript
   // Increase pool size in prisma.ts
   const prisma = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL,
       },
     },
     log: ['error', 'warn'],
     // Add connection pooling
     __internal: {
       engine: {
         connectionPoolTimeout: 60,
       },
     },
   });
   ```

5. **Deploy fix:**
   ```bash
   git commit -am "fix: increase database connection pool"
   git push
   ```

**Expected Resolution Time:** 10-15 minutes

---

## Build Failures

### Symptom: TypeScript Compilation Errors

**Detection:**
- CI/CD pipeline fails at "Run TypeScript check"
- Issue created: "🔧 TypeScript Errors Detected"

**Manual Steps:**

1. **Reproduce locally:**
   ```bash
   git pull origin mobile
   npm install
   npx tsc --noEmit
   ```

2. **Review error output:**
   ```bash
   # Common patterns:
   # - error TS2339: Property 'X' does not exist
   # - error TS2322: Type 'X' is not assignable to 'Y'
   # - error TS7006: Parameter implicitly has 'any' type
   ```

3. **Fix type errors systematically:**

   **For missing properties:**
   ```typescript
   // Before (error)
   const name = user.name;
   
   // After (fixed)
   const name = user.name ?? 'Unknown';
   // Or update interface
   interface User {
     name: string; // Add missing property
   }
   ```

   **For type mismatches:**
   ```typescript
   // Before (error)
   const id: string = userId;
   
   // After (fixed)
   const id: string = String(userId);
   // Or change type
   const id: number = userId;
   ```

   **For implicit any:**
   ```typescript
   // Before (error)
   function process(data) { }
   
   // After (fixed)
   function process(data: MyDataType) { }
   ```

4. **Verify fixes:**
   ```bash
   npx tsc --noEmit
   npm run build
   ```

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix(types): resolve TypeScript compilation errors"
   git push
   ```

**Expected Resolution Time:** 15-30 minutes depending on error count

---

### Symptom: Module Resolution Failures

**Detection:**
- Build fails with "Cannot find module"
- Import paths not resolved

**Manual Steps:**

1. **Check missing package:**
   ```bash
   # If error is about external package
   npm install <package-name>
   ```

2. **Verify path aliases:**
   ```typescript
   // Check tsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

3. **Fix import paths:**
   ```typescript
   // Before (error)
   import { utils } from '@/lib/utils';
   
   // After (fixed) - verify file exists
   import { utils } from '@/lib/utils/index';
   ```

4. **Check file case sensitivity:**
   ```bash
   # Linux is case-sensitive, macOS is not
   # Ensure import matches exact file name
   
   # Wrong
   import Component from './component';  // File is Component.tsx
   
   # Correct
   import Component from './Component';
   ```

5. **Verify and commit:**
   ```bash
   npm run build
   git commit -am "fix: resolve module import errors"
   git push
   ```

**Expected Resolution Time:** 10-15 minutes

---

## Database Issues

### Symptom: Migration Failures

**Detection:**
- Database migration workflow fails
- Prisma migration errors

**Manual Steps:**

1. **Review migration error:**
   ```bash
   npx prisma migrate status
   ```

2. **Check migration SQL:**
   ```bash
   # Review generated migration
   cat prisma/migrations/TIMESTAMP_migration_name/migration.sql
   ```

3. **Common issues and fixes:**

   **Conflict with existing data:**
   ```sql
   -- Issue: Adding NOT NULL column with existing rows
   
   -- Solution: Use default value or backfill first
   ALTER TABLE "User" ADD COLUMN "email" TEXT;
   UPDATE "User" SET "email" = 'default@example.com' WHERE "email" IS NULL;
   ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
   ```

   **Foreign key constraint violation:**
   ```sql
   -- Issue: Referenced records don't exist
   
   -- Solution: Create referenced records first or use CASCADE
   ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_userId_fkey";
   ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" 
     FOREIGN KEY ("userId") REFERENCES "User"("id") 
     ON DELETE CASCADE;
   ```

4. **Manual migration if needed:**
   ```bash
   # Mark migration as applied without running
   npx prisma migrate resolve --applied migration_name
   
   # Or rollback and fix
   npx prisma migrate resolve --rolled-back migration_name
   ```

5. **Create corrected migration:**
   ```bash
   # Fix schema.prisma
   npx prisma migrate dev --name fix_migration_issue
   ```

6. **Verify:**
   ```bash
   npx prisma migrate status
   npx prisma db pull # Verify schema matches
   ```

**Expected Resolution Time:** 20-45 minutes

---

## Security Vulnerabilities

### Symptom: Critical CVE in Dependencies

**Detection:**
- npm audit reports critical vulnerabilities
- Auto-heal unable to fix (breaking changes)

**Manual Steps:**

1. **Identify vulnerability:**
   ```bash
   npm audit
   npm audit --json | jq '.vulnerabilities'
   ```

2. **Research the CVE:**
   ```bash
   # Check CVE database
   # Review GitHub security advisories
   # Check package changelogs
   ```

3. **Evaluate fix options:**

   **Option A: Update dependency (preferred):**
   ```bash
   npm update <package-name>
   # Test thoroughly
   npm test
   npm run build
   ```

   **Option B: Update parent dependency:**
   ```bash
   # If vulnerability is in transitive dependency
   npm list <package-name>  # Find what requires it
   npm update <parent-package>
   ```

   **Option C: Use overrides (last resort):**
   ```json
   // package.json
   {
     "overrides": {
       "vulnerable-package": "^2.0.0"
     }
   }
   ```

4. **Verify fix:**
   ```bash
   npm audit --audit-level=high
   npm test
   ```

5. **Document and deploy:**
   ```bash
   git commit -am "fix(security): resolve critical CVE-XXXX"
   gh pr create --title "🔒 Security: Fix CVE-XXXX" --label security,critical
   ```

**Expected Resolution Time:** 30-60 minutes

---

## Type System Errors

### Symptom: Complex Type Inference Failures

**Detection:**
- Automated type fixes insufficient
- Multiple conflicting type requirements

**Manual Steps:**

1. **Understand the type requirement:**
   ```typescript
   // Read error message carefully
   // Type 'X' is not assignable to type 'Y'
   //   Types of property 'prop' are incompatible
   ```

2. **Common complex scenarios:**

   **Generic constraints:**
   ```typescript
   // Problem
   function process<T>(item: T): T {
     return item.value; // Error: Property 'value' doesn't exist on T
   }
   
   // Solution
   function process<T extends { value: any }>(item: T): T['value'] {
     return item.value;
   }
   ```

   **Union type narrowing:**
   ```typescript
   // Problem
   type Result = Success | Error;
   const result: Result = getResult();
   console.log(result.data); // Error: Property 'data' may not exist
   
   // Solution
   if ('data' in result) {
     console.log(result.data);
   }
   ```

   **Async return types:**
   ```typescript
   // Problem
   async function fetchData(): Promise<Data> {
     const response = await fetch('/api/data');
     return response.json(); // Error: Type may not match
   }
   
   // Solution
   async function fetchData(): Promise<Data> {
     const response = await fetch('/api/data');
     const json = await response.json();
     return json as Data; // Or validate runtime
   }
   ```

3. **Test type changes:**
   ```bash
   npx tsc --noEmit
   npm test
   ```

**Expected Resolution Time:** 15-45 minutes depending on complexity

---

## Test Failures

### Symptom: Flaky or Consistently Failing Tests

**Detection:**
- Pre-commit hook blocks commit
- CI test job fails

**Manual Steps:**

1. **Run tests locally:**
   ```bash
   npm test -- --verbose
   npm test -- path/to/failing-test.test.ts
   ```

2. **Common test issues:**

   **Async timing:**
   ```typescript
   // Problem
   test('async operation', async () => {
     const result = await asyncFunction();
     expect(result).toBe(expected);
   });
   
   // Solution: Add proper waits
   test('async operation', async () => {
     const result = await asyncFunction();
     await waitFor(() => {
       expect(result).toBe(expected);
     });
   }, 10000); // Increase timeout if needed
   ```

   **Mock not updated:**
   ```typescript
   // Problem: API changed but mock didn't
   jest.mock('@/lib/api', () => ({
     fetchData: jest.fn().mockResolvedValue({ oldStructure })
   }));
   
   // Solution: Update mock structure
   jest.mock('@/lib/api', () => ({
     fetchData: jest.fn().mockResolvedValue({ newStructure })
   }));
   ```

   **Environment variables:**
   ```typescript
   // Problem: Missing env vars in test
   // Solution: Add to jest.setup.ts
   process.env.DATABASE_URL = 'postgresql://test';
   process.env.OPENAI_API_KEY = 'test-key';
   ```

3. **Fix and verify:**
   ```bash
   npm test
   npm test -- --coverage
   ```

**Expected Resolution Time:** 20-40 minutes

---

## Merge Conflicts

### Symptom: PR Has Conflicts with Base Branch

**Detection:**
- PR orchestrator creates "⚠️ Merge Conflicts" comment
- GitHub shows conflict indicator

**Manual Steps:**

1. **Update local branch:**
   ```bash
   git checkout <pr-branch>
   git fetch origin
   git merge origin/mobile
   # Or
   git rebase origin/mobile
   ```

2. **Resolve conflicts:**
   ```bash
   # Edit conflicted files
   # Look for conflict markers:
   <<<<<<< HEAD
   your changes
   =======
   their changes
   >>>>>>> origin/mobile
   ```

3. **Choose resolution strategy:**
   ```bash
   # Keep your changes
   git checkout --ours <file>
   
   # Keep their changes
   git checkout --theirs <file>
   
   # Or manually merge
   # Edit file to combine both
   ```

4. **Complete merge:**
   ```bash
   git add .
   git commit -m "fix: resolve merge conflicts"
   git push
   ```

5. **Verify build still works:**
   ```bash
   npm run build
   npm test
   ```

**Expected Resolution Time:** 10-30 minutes

---

## Performance Degradation

### Symptom: Slow Page Loads or API Responses

**Detection:**
- Health check reports high response times
- User complaints about performance

**Manual Steps:**

1. **Profile the application:**
   ```bash
   # Use Next.js built-in profiling
   npm run build
   # Check build output for large bundles
   ```

2. **Check bundle size:**
   ```bash
   # Review .next/static folder
   du -sh .next/static
   
   # Find large chunks
   find .next/static -type f -size +500k
   ```

3. **Optimize imports:**
   ```typescript
   // Problem: Import entire library
   import _ from 'lodash';
   
   // Solution: Import only what's needed
   import { debounce } from 'lodash';
   // Or use lodash-es
   import debounce from 'lodash-es/debounce';
   ```

4. **Add dynamic imports:**
   ```typescript
   // Problem: Large component imported upfront
   import HeavyComponent from '@/components/HeavyComponent';
   
   // Solution: Dynamic import
   const HeavyComponent = dynamic(() => 
     import('@/components/HeavyComponent')
   );
   ```

5. **Optimize database queries:**
   ```typescript
   // Problem: N+1 queries
   const users = await prisma.user.findMany();
   for (const user of users) {
     const posts = await prisma.post.findMany({
       where: { userId: user.id }
     });
   }
   
   // Solution: Use include
   const users = await prisma.user.findMany({
     include: { posts: true }
   });
   ```

6. **Measure improvement:**
   ```bash
   npm run build
   # Compare bundle sizes before/after
   ```

**Expected Resolution Time:** 1-2 hours

---

## Escalation Path

If manual intervention doesn't resolve the issue:

1. **Document what you tried** in the GitHub issue
2. **Tag senior developers** for review
3. **Consider temporary workaround** if blocking production
4. **Update automation** to prevent recurrence

---

## After Resolution

Always:

1. **Document the fix** in ERROR_PLAYBOOK.md
2. **Update PATTERN_RECOGNITION.md** if recurring pattern
3. **Improve automation** to prevent similar issues
4. **Add test case** to prevent regression

---

**Last Updated:** 2026-01-03  
**Maintainer:** Development Team
