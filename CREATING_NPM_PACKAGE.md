# Creating Your First NPM Package

## Quick Start (5 Steps)

### 1. Choose Package Type

**Options:**
- **Library** - Reusable functions/utilities
- **React Components** - UI components for other apps
- **CLI Tool** - Command-line application
- **Plugin/Middleware** - Extends other tools

### 2. Create Package Structure

```bash
# Create package directory
mkdir my-package-name
cd my-package-name

# Initialize package.json
npm init -y

# Create source structure
mkdir src
touch src/index.ts
touch README.md
```

### 3. Configure package.json

```json
{
  "name": "@your-username/package-name",
  "version": "1.0.0",
  "description": "What your package does",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["keyword1", "keyword2"],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo"
  }
}
```

### 4. Add TypeScript Support

```bash
# Install dev dependencies
npm install -D typescript @types/node

# Create tsconfig.json
npx tsc --init
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 5. Write Your Code

**src/index.ts:**
```typescript
export function hello(name: string): string {
  return `Hello, ${name}!`;
}

export class MyClass {
  greet(name: string) {
    return `Greetings, ${name}!`;
  }
}
```

---

## Publishing to NPM

### A. Create NPM Account

```bash
# Sign up at https://www.npmjs.com/signup
# Then login via CLI:
npm login
```

### B. Build & Publish

```bash
# Build the package
npm run build

# Test it works
npm pack
# Creates .tgz file you can test locally

# Publish to NPM
npm publish --access public
```

### C. Update Versions

```bash
# Patch (1.0.0 → 1.0.1) - bug fixes
npm version patch

# Minor (1.0.0 → 1.1.0) - new features
npm version minor

# Major (1.0.0 → 2.0.0) - breaking changes
npm version major

# Then publish
npm publish
```

---

## Testing Your Package Locally

### Option 1: npm link

```bash
# In your package directory
npm link

# In another project
npm link @your-username/package-name
```

### Option 2: Local Install

```bash
# In another project
npm install /path/to/your/package
```

### Option 3: Pack & Install

```bash
# In your package
npm pack
# Creates: your-package-1.0.0.tgz

# In another project
npm install /path/to/your-package-1.0.0.tgz
```

---

## Common Package Types

### 1. Utility Library

```typescript
// src/index.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

### 2. React Component Library

```bash
npm install -D react react-dom @types/react @types/react-dom
```

```typescript
// src/Button.tsx
import React from 'react';

export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};

// src/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

### 3. CLI Tool

```json
// package.json
{
  "bin": {
    "my-cli": "./dist/cli.js"
  }
}
```

```typescript
// src/cli.ts
#!/usr/bin/env node

import { program } from 'commander';

program
  .name('my-cli')
  .description('CLI to do something')
  .version('1.0.0');

program
  .command('hello <name>')
  .description('Say hello')
  .action((name: string) => {
    console.log(`Hello, ${name}!`);
  });

program.parse();
```

---

## Best Practices

### 1. Add README.md

```markdown
# My Package

Brief description of what it does.

## Installation

\`\`\`bash
npm install @username/my-package
\`\`\`

## Usage

\`\`\`typescript
import { hello } from '@username/my-package';

console.log(hello('World')); // "Hello, World!"
\`\`\`

## API

### hello(name: string): string
Returns a greeting message.

## License
MIT
```

### 2. Add .npmignore

```
src/
*.test.ts
*.test.js
tsconfig.json
.git
node_modules/
coverage/
```

### 3. Add Tests

```bash
npm install -D jest ts-jest @types/jest
```

```typescript
// src/__tests__/index.test.ts
import { hello } from '../index';

describe('hello', () => {
  it('should greet by name', () => {
    expect(hello('World')).toBe('Hello, World!');
  });
});
```

### 4. Add CI/CD

**.github/workflows/publish.yml:**
```yaml
name: Publish Package

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Scoped Packages (Recommended)

Use scoped packages for better organization:

```json
{
  "name": "@bickfordd-bit/linkedin-client",
  "version": "1.0.0"
}
```

**Benefits:**
- No name conflicts
- Professional appearance
- Can make private packages

---

## Checklist Before Publishing

- [ ] Clear README with usage examples
- [ ] License file (MIT, Apache, etc.)
- [ ] Tests passing
- [ ] Build succeeds (`npm run build`)
- [ ] Version bumped appropriately
- [ ] Keywords added to package.json
- [ ] Repository URL set
- [ ] .npmignore configured
- [ ] Local test successful (`npm pack` → install)

---

## Common Issues

### "Package name already exists"
- Use scoped package: `@username/package-name`
- Check on npmjs.com if name is taken
- Choose a unique, descriptive name

### "Cannot publish, not authenticated"
```bash
npm login
# Or use access token:
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN
```

### "Prepublish script failed"
- Fix build errors
- Ensure TypeScript compiles
- Check all dependencies installed

---

## Next Steps

1. **Tell me what you want to package:**
   - LinkedIn client?
   - Bickford utilities?
   - OPTR tools?
   - UI components?

2. **I'll create the complete structure for you**

3. **We'll test locally**

4. **Publish to NPM**

---

**What do you want to turn into a package?**
