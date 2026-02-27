---
name: deployment-automation
description: Build, deploy, and release automation for VolleyScore-Pro. Covers Firebase Hosting deployment, Capacitor Android/iOS builds, PWA manifest validation, service worker updates, and Play Store/App Store release preparation. Use when deploying, building for production, configuring CI/CD, or preparing app store releases.
---

# Deployment & Automation

## Decision Tree

```
Deploy target → Where?
    ├─ Web (Firebase Hosting) → Firebase deploy flow
    ├─ Android (Play Store) → Capacitor + Android build
    ├─ iOS (App Store) → Capacitor + Xcode build
    ├─ Preview/staging → Firebase preview channel
    └─ CI/CD setup → GitHub Actions workflow
```

## Pre-Deploy Checklist

- [ ] All tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console.log/debug statements in production code
- [ ] Environment variables set correctly (`.env.production`)
- [ ] Firebase security rules reviewed
- [ ] PWA manifest valid (`manifest.json`)
- [ ] Service worker updated with correct cache version
- [ ] Bundle size within budget (<500KB gzipped)
- [ ] Translations complete for all 3 locales

## Firebase Hosting Deploy

```bash
# Build production bundle
npm run build

# Preview deploy (shareable URL, doesn't affect production)
firebase hosting:channel:deploy preview --expires 7d

# Production deploy
firebase deploy --only hosting

# Deploy with security rules
firebase deploy --only hosting,firestore:rules
```

## Capacitor Android Build

```bash
# Sync web build to native
npx cap sync android

# Open in Android Studio
npx cap open android

# Build APK (from Android Studio or CLI)
cd android && ./gradlew assembleRelease

# Build AAB for Play Store
cd android && ./gradlew bundleRelease
```

### Android Release Checklist
- [ ] Version code incremented in `android/app/build.gradle`
- [ ] Signing key configured
- [ ] ProGuard/R8 enabled
- [ ] App icons at all densities (mdpi through xxxhdpi)
- [ ] Play Store listing screenshots updated
- [ ] Privacy policy URL valid

## Capacitor iOS Build

```bash
# Sync web build to native
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### iOS Release Checklist
- [ ] Version/build number incremented
- [ ] Signing certificate and provisioning profile valid
- [ ] App icons at all required sizes
- [ ] Launch screen configured
- [ ] App Store Connect listing updated

## PWA Validation

```bash
# Lighthouse PWA audit
npx lighthouse http://localhost:5173 --only-categories=pwa --output=json

# Validate manifest
cat public/manifest.json | python3 -m json.tool
```

### PWA Manifest Checklist
- [ ] `name` and `short_name` set
- [ ] `start_url` correct
- [ ] `display: standalone`
- [ ] Icons at 192x192 and 512x512 (maskable)
- [ ] `theme_color` and `background_color` set
- [ ] `scope` defined

## Service Worker Update Strategy

```typescript
// Vite PWA plugin handles SW generation
// For manual cache busting, update the cache version:
const CACHE_VERSION = 'v2.1.0';
```

## Bundle Size Budget

| Asset | Budget | Check |
|-------|--------|-------|
| JS (gzipped) | <300KB | `npx vite-bundle-analyzer` |
| CSS (gzipped) | <50KB | Build output |
| Total initial | <500KB | Lighthouse |
| Largest chunk | <150KB | Build output |

## GitHub Actions CI/CD Template

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
```

## Rollback

```bash
# List recent deploys
firebase hosting:channel:list

# Rollback to previous version (Firebase console)
# Go to Firebase Console → Hosting → Release History → Rollback

# Or redeploy a previous commit
git checkout <previous-commit>
npm run build && firebase deploy --only hosting
```

## Environment Variables

| Variable | Dev | Production |
|----------|-----|------------|
| `VITE_FIREBASE_*` | Dev project | Prod project |
| `VITE_APP_ENV` | development | production |
| `VITE_ENABLE_ANALYTICS` | false | true |
| `VITE_ENABLE_ADS` | false | true |
