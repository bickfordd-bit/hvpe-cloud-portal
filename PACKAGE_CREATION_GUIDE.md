# Package Creation Guide

## iOS App Package (IPA)

### Option 1: EAS Build (Recommended - Already Running)

```bash
# Production build for App Store/TestFlight
eas build -p ios --profile production

# Development build
eas build -p ios --profile development

# Preview/internal testing
eas build -p ios --profile preview
```

**Current build:** Already running at https://expo.dev/accounts/bickfordd/projects/bickford-app/builds/ad4b0c06-ac1d-4397-b4cf-a03dec4f932c

### Option 2: Local Xcode Build

```bash
# 1. Open project in Xcode
open ios/BickfordApp.xcworkspace

# 2. Select target: BickfordApp
# 3. Select scheme: Release
# 4. Product → Archive
# 5. Organizer opens → Distribute App → App Store Connect

# Or via command line:
xcodebuild -workspace ios/BickfordApp.xcworkspace \
  -scheme BickfordApp \
  -configuration Release \
  -archivePath build/BickfordApp.xcarchive \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/BickfordApp.xcarchive \
  -exportPath build \
  -exportOptionsPlist ios/ExportOptions.plist
```

### Submit to TestFlight

```bash
# After build completes
eas submit -p ios --latest

# Or specify build ID
eas submit -p ios --id <build-id>

# Or manually via Xcode
# Xcode → Window → Organizer → Archives → Distribute App
```

---

## Android App Package (APK/AAB)

### EAS Build

```bash
# Production AAB for Play Store
eas build -p android --profile production

# Development APK
eas build -p android --profile development

# Local install APK
eas build -p android --profile preview
```

### Local Build

```bash
# Navigate to android folder
cd android

# Build release AAB
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab

# Build release APK
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

---

## npm Package (Library/Module)

### 1. Setup package.json

```bash
# Initialize if needed
npm init

# Or edit existing package.json
```

**Key fields:**

```json
{
  "name": "@bickfordd/hvpe-cloud-portal",
  "version": "1.0.0",
  "description": "HVPE Cloud Portal - Intent to Reality",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["optr", "bickford", "trading"],
  "author": "Derek Bickford",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  }
}
```

### 2. Create Build Configuration

**tsconfig.build.json:**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/lib/**/*"],
  "exclude": ["**/*.test.ts", "**/__tests__/**"]
}
```

### 3. Build Package

```bash
# Build TypeScript to dist/
npx tsc -p tsconfig.build.json

# Or add to package.json scripts
npm run build
```

### 4. Test Locally

```bash
# Link locally
npm link

# In another project
npm link @bickfordd/hvpe-cloud-portal

# Or test with npm pack
npm pack
# Creates: bickfordd-hvpe-cloud-portal-1.0.0.tgz
npm install ./bickfordd-hvpe-cloud-portal-1.0.0.tgz
```

### 5. Publish to npm

```bash
# Login to npm
npm login

# Publish
npm publish

# Or scoped package
npm publish --access public
```

### 6. Publish to GitHub Packages

```bash
# Add to package.json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}

# Authenticate
echo "//npm.pkg.github.com/:_authToken=$GITHUB_TOKEN" >> ~/.npmrc

# Publish
npm publish
```

---

## Docker Package (Container)

### Build Docker Image

```bash
# Build
docker build -t hvpe-cloud-portal:latest .

# Tag for GHCR
docker tag hvpe-cloud-portal:latest ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest

# Push to GitHub Container Registry
docker push ghcr.io/bickfordd-bit/hvpe-cloud-portal:latest
```

### Docker Compose Package

```bash
# Build services
docker-compose build

# Export as tar
docker save hvpe-cloud-portal:latest -o hvpe-cloud-portal.tar

# Import elsewhere
docker load -i hvpe-cloud-portal.tar
```

---

## Current Project Packages

### Web App (Next.js) - Vercel

```bash
# Vercel automatically builds on git push
git push origin mobile

# Or manual deploy
vercel --prod
```

### iOS App - EAS (In Progress)

```bash
# Status check
eas build:list

# Current build
# https://expo.dev/accounts/bickfordd/projects/bickford-app/builds/ad4b0c06-ac1d-4397-b4cf-a03dec4f932c
```

### Android App - EAS

```bash
# Start build
eas build -p android --profile production

# Submit to Play Store
eas submit -p android
```

---

## Quick Commands Summary

```bash
# iOS package
eas build -p ios --profile production
eas submit -p ios --latest

# Android package
eas build -p android --profile production
eas submit -p android

# npm package
npm run build
npm publish

# Docker package
docker build -t app .
docker push ghcr.io/bickfordd-bit/app:latest

# Web deploy
git push origin mobile  # Auto-deploys to Vercel
```

---

## What's Already Running

✅ **iOS Build #11** - In progress on EAS  
✅ **Next.js Deploy** - Auto-deployed to Vercel on git push  
⏳ **TestFlight Submission** - Pending build completion  

**Next:** When iOS build finishes (~15 min), run:
```bash
eas submit -p ios --latest
```
