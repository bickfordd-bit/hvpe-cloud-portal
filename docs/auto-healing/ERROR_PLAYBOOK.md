# Error Playbook

This playbook documents common errors encountered in the HVPE Cloud Portal and their automated/manual fixes.

## Table of Contents
- [Build Errors](#build-errors)
- [Type Errors](#type-errors)
- [Import Errors](#import-errors)
- [Test Failures](#test-failures)
- [Dependency Issues](#dependency-issues)
- [Runtime Errors](#runtime-errors)

---

## Build Errors

### Next.js Build Failures

**Symptoms:**
- Build fails with `Error: Failed to compile`
- Missing `.next` directory after build

**Automated Fix:**
- Auto-heal workflow detects build failures and creates issue
- Breaking change detection triggers rollback if critical

**Manual Fix:**
```bash
# Clean build cache
rm -rf .next node_modules
npm install
npm run build
```

**Prevention:**
- Pre-commit hooks run TypeScript checks
- PR orchestrator validates builds before merge

---

### TypeScript Compilation Errors

**Symptoms:**
- `error TS2339: Property does not exist`
- `error TS2322: Type X is not assignable to type Y`

**Automated Fix:**
- Error triage workflow categorizes type errors
- Auto-fix PR created for safe type assertions

**Manual Fix:**
```typescript
// Add explicit types
const myVar: MyType = someValue;

// Use type assertions carefully
const element = document.getElementById('id') as HTMLElement;

// Add undefined checks
if (myVar) {
  // Use myVar safely
}
```

**Prevention:**
- Enable strict mode in tsconfig.json
- Use `noImplicitAny` and `strictNullChecks`
- Pre-commit hook blocks commits with type errors

---

## Type Errors

### Missing Type Annotations

**Pattern:**
```
error TS7006: Parameter 'x' implicitly has an 'any' type
```

**Automated Fix:**
- Error triage adds explicit types where possible
- Creates PR with type annotations

**Manual Fix:**
```typescript
// Before
function processData(data) {
  return data.map(item => item.value);
}

// After
interface DataItem {
  value: number;
}

function processData(data: DataItem[]): number[] {
  return data.map(item => item.value);
}
```

---

### Type Mismatches

**Pattern:**
```
error TS2322: Type 'string | undefined' is not assignable to type 'string'
```

**Automated Fix:**
- Add nullish coalescing operator
- Add optional chaining

**Manual Fix:**
```typescript
// Before
const name: string = user.name;

// After - with default
const name: string = user.name ?? 'Unknown';

// After - optional type
const name: string | undefined = user.name;
```

---

## Import Errors

### Module Not Found

**Pattern:**
```
Cannot find module '@/lib/utils'
Module not found: Can't resolve 'react-icons'
```

**Automated Fix:**
- Auto-heal checks for missing dependencies
- Creates PR with `npm install` updates

**Manual Fix:**
```bash
# Install missing package
npm install react-icons

# For path alias issues, check tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### Circular Dependencies

**Pattern:**
```
Warning: Circular dependency detected
```

**Automated Fix:**
- Dead code detection identifies circular imports
- Creates issue for manual review

**Manual Fix:**
- Restructure imports to break the cycle
- Extract shared code to separate module
- Use dependency injection

---

## Test Failures

### Test Timeouts

**Pattern:**
```
Test suite failed to run
Timeout - Async callback was not invoked within 5000ms
```

**Automated Fix:**
- Pre-commit hook blocks commits with failing tests
- Creates issue for investigation

**Manual Fix:**
```typescript
// Increase timeout for specific test
test('slow operation', async () => {
  // test code
}, 10000); // 10 second timeout

// Or use done callback properly
test('async test', (done) => {
  asyncFunction().then(() => {
    expect(true).toBe(true);
    done();
  });
});
```

---

### Mock Issues

**Pattern:**
```
Cannot find module 'module-name' from 'test-file.test.ts'
```

**Manual Fix:**
```typescript
// Add to jest.setup.ts or test file
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn()
    }
  }
}));
```

---

## Dependency Issues

### Security Vulnerabilities

**Pattern:**
```
found 3 high severity vulnerabilities
```

**Automated Fix:**
- Auto-heal runs `npm audit fix` daily at 6 AM
- Creates PR with security updates
- Auto-merges if tests pass

**Manual Fix:**
```bash
# Fix automatically
npm audit fix

# Fix with breaking changes
npm audit fix --force

# Check specific vulnerability
npm audit
```

---

### Outdated Dependencies

**Pattern:**
- Dependabot PRs for version updates

**Automated Fix:**
- Auto-merge workflow approves and merges minor/patch updates
- Major updates require manual review

**Manual Fix:**
```bash
# Check outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all to latest
npm update
```

---

## Runtime Errors

### API Route Errors

**Pattern:**
```
Error: API route failed
500 Internal Server Error
```

**Automated Fix:**
- Health checks detect failing endpoints
- Creates critical issue for investigation

**Manual Fix:**
1. Check Vercel logs
2. Add error boundaries
3. Implement proper error handling

```typescript
// Proper error handling
export async function GET(req: NextRequest) {
  try {
    const result = await someOperation();
    return NextResponse.json(apiSuccess(result));
  } catch (error: any) {
    logger.error('Operation failed', { error: error.message });
    return NextResponse.json(apiError(error), { status: 500 });
  }
}
```

---

### Environment Variable Issues

**Pattern:**
```
Error: Environment variable not set
```

**Manual Fix:**
1. Check `.env.local` exists
2. Add required variables
3. Restart dev server

```bash
# Create .env.local
cat > .env.local << EOF
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
EOF

# Restart
npm run dev
```

---

## Common Patterns

### Console.log Statements

**Pattern:**
- Console statements in production code

**Automated Fix:**
- Pre-commit hook removes console.log statements
- lint-staged applies ESLint fixes

**Manual Fix:**
```bash
# Run ESLint fix
npm run lint -- --fix

# Or use logger instead
import { logger } from '@/lib/logger';
logger.info('Message', { metadata });
```

---

### Unused Exports

**Pattern:**
- Dead code bloating bundle

**Automated Fix:**
- Auto-heal runs ts-prune to detect unused exports
- Creates issue with list of unused code

**Manual Fix:**
```bash
# Find unused exports
npx ts-prune

# Remove unused code
# Delete the unused exports from files
```

---

## Emergency Procedures

### Critical Production Failure

1. **Immediate Rollback:**
   ```bash
   # Via Vercel dashboard
   # Find previous deployment → Promote to Production
   ```

2. **Local Testing:**
   ```bash
   git checkout previous-good-commit
   npm install
   npm run build
   npm start
   ```

3. **Hot Fix:**
   - Create fix branch
   - Test locally
   - Create PR with `critical` label
   - Merge immediately after CI passes

---

### Database Migration Failure

1. **Stop Application:**
   - Prevent further damage

2. **Rollback Migration:**
   ```bash
   # Via Prisma
   npx prisma migrate resolve --rolled-back migration-name
   ```

3. **Fix Schema:**
   - Correct schema.prisma
   - Create new migration
   - Test thoroughly

---

## Automation Status

✅ **Automated:**
- Dependency security fixes
- Dead code detection
- Type error reporting
- Breaking change detection
- Import error fixes
- Unused variable removal
- Console.log removal

⚠️ **Semi-Automated:**
- Type assertion fixes (requires review)
- Circular dependency resolution
- Test mock setup

❌ **Manual Only:**
- Complex refactoring
- Architecture changes
- Performance optimization
- Database schema design

---

## Contributing

When you encounter a new error pattern:

1. Document it in this playbook
2. Add automated detection if possible
3. Create fix PR template
4. Update error triage workflow

---

**Last Updated:** 2026-01-03
**Maintained by:** Auto-healing system + Development team
