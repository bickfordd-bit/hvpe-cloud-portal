# iOS TestFlight Fix - JS Bundle Missing

## Problem Diagnosed

**Root Cause:** JavaScript bundle (`main.jsbundle`) not packaged in TestFlight build

**Crash Type:** `EXC_CRASH (SIGABRT)` on launch - React Native JS thread cannot initialize

**Why it worked locally:** Metro bundler serves JS in dev, but TestFlight needs embedded bundle

## Fix Applied

### 1. Updated `eas.json` production profile

```json
"production": {
  "developmentClient": false,
  "distribution": "app-store",
  "autoIncrement": true,
  "ios": {
    "bundler": "metro",
    "buildConfiguration": "Release"
  }
}
```

### 2. Build Commands (Run These)

**Option A: EAS Build (Recommended)**
```bash
# Export JS bundle first
npx expo export --platform ios

# Build for production
eas build -p ios --profile production

# Submit to TestFlight when build completes
eas submit -p ios --latest
```

**Option B: Local Build**
```bash
# Export bundle
npx expo export --platform ios

# Build in Xcode (Release scheme)
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

### 3. Verification Checklist

Before uploading to TestFlight:

```bash
# Check bundle exists
ls -lh ios/main.jsbundle

# Verify bundle is in Xcode project
# Open in Xcode → BickfordApp → Build Phases → Copy Bundle Resources
# Should see: main.jsbundle

# Test locally first
npx expo start --no-dev --minify

# Build and increment version
# Current: 1.0.0 (10)
# Next: 1.0.0 (11)
```

### 4. Xcode Build Phases Check

Open `BickfordApp.xcodeproj` in Xcode:

1. Select target: **BickfordApp**
2. Go to: **Build Phases**
3. Expand: **Copy Bundle Resources**
4. Verify present: `main.jsbundle`

If missing, click **+** and add:
- `main.jsbundle` from project root

### 5. Test Before Submitting

```bash
# Install via TestFlight (internal testing first)
# Then test with airplane mode (no Metro)

# If crash persists, check:
cat ios/BrickfordApp/AppDelegate.mm

# Should have (for Expo):
jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];

# OR for bundled release:
jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
```

## Why This Happened

| Environment | JS Source | Status |
|-------------|-----------|--------|
| Dev/Simulator | Metro bundler (localhost:8081) | ✅ Works |
| TestFlight | Embedded main.jsbundle | ❌ Missing |

## Next Steps

1. ✅ `eas.json` fixed (production profile updated)
2. ⏳ Run `npx expo export --platform ios`
3. ⏳ Run `eas build -p ios --profile production`
4. ⏳ Wait for build completion (~15-20 min)
5. ⏳ Test via TestFlight internal
6. ⏳ Submit for external testing

## Expected Result

After fix:
- App launches successfully on TestFlight
- No SIGABRT crash
- JS bundle loads from embedded file
- Works offline (no Metro needed)

## If Still Crashes

Check these:

```bash
# 1. Verify Hermes is consistent
cat ios/Podfile | grep hermes
cat package.json | grep hermes

# 2. Check bundle was created
ls -lh dist/  # Should have assets/

# 3. Verify AppDelegate loads bundle
cat ios/BickfordApp/AppDelegate.mm | grep jsBundleURL

# 4. Check Xcode logs
# Product → Scheme → Edit Scheme → Run → Arguments
# Add: -FIRDebugEnabled
```

## Quick Reference

```bash
# Full rebuild sequence
npx expo export --platform ios
eas build -p ios --profile production --clear-cache
eas submit -p ios --latest

# Or local:
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
xcodebuild -workspace ios/BickfordApp.xcworkspace \
  -scheme BickfordApp \
  -configuration Release \
  archive
```

## Status

- [x] EAS production config fixed (corrected to distribution: "store")
- [x] EAS build started (Build #11, buildNumber incremented 10→11)
- [x] Build queued on EAS servers
- [ ] Build completion (~15-20 min)
- [ ] Upload to TestFlight (via eas submit)
- [ ] Test with airplane mode
- [ ] Submit for review

**Current Build:** https://expo.dev/accounts/bickfordd/projects/bickford-app/builds/ad4b0c06-ac1d-4397-b4cf-a03dec4f932c

---

**This is a packaging error only** - not a code issue, not an Apple policy issue. Once fixed, it never comes back.
