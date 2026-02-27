---
name: mobile-and-pwa
description: >
  Work on PWA features and Capacitor native integration. Use when implementing
  offline support, service workers, native APIs, platform detection, safe areas,
  immersive mode, haptics, keep-awake, install prompts, Android/iOS builds,
  Capacitor plugins, or any mobile/PWA-specific feature.
---

# PWA & Native Integration — VolleyScore-Pro

## Decision Tree

```
Mobile/PWA need → What type?
    ├─ Offline support → Service Worker + IndexedDB section below
    ├─ Install prompt → usePWAInstallPrompt + InstallReminder
    ├─ Native API (haptics, share, etc.) → Capacitor Plugins table below
    ├─ Platform detection → deviceDetection.ts + usePlatform
    ├─ Safe area / notch → useSafeAreaInsets
    ├─ Screen lock prevention → useKeepAwake
    ├─ Android/iOS build → Build & Deploy section below
    └─ New native feature → Adding New Native Features workflow below
```

## Stack
- **PWA**: vite-plugin-pwa + Workbox (service worker caching)
- **Native**: Capacitor 6 (iOS + Android wrappers)
- **App ID**: `com.volleyscore.pro2`

## PWA Features

### Service Worker (vite-plugin-pwa)
- Auto-registration and update detection
- Workbox caching strategies:
  - Runtime cache for Google Fonts
  - Precache for app shell assets
- Update prompt via `ReloadPrompt.tsx`

### Offline Support
- IndexedDB for game data (via `idb-keyval`)
- Service worker caches static assets
- `useOnlineStatus` hook for connectivity detection

### Install Prompt
- `usePWAInstallPrompt` — captures `beforeinstallprompt` event
- `InstallReminder.tsx` — shows install banner
- Tracks dismissals to avoid spam

## Capacitor Native Plugins

| Plugin | Import | Purpose |
|--------|--------|---------|
| `@capacitor/core` | `Capacitor` | Platform detection |
| `@capacitor-community/speech-recognition` | Voice input |
| `@capacitor-community/text-to-speech` | Voice output |
| `@capacitor-community/keep-awake` | Prevent screen lock |
| `@capacitor-firebase/authentication` | Google Auth |
| `@capacitor/haptics` | Vibration feedback |
| `@capacitor/share` | Native share dialog |
| `@capacitor/status-bar` | Status bar control |
| `@capacitor/screen-orientation` | Lock orientation |
| `@capacitor-community/admob` | Ads |

## Platform Detection (deviceDetection.ts)
```typescript
// Detects: platform, device brand, model, CPU cores, RAM, GPU
// Maps to performance profile (LOW_END → PERFORMANCE)
const device = detectDevice();
// { platform: 'android', brand: 'Samsung', cores: 8, ram: 6 }
```

## Platform Hooks

### useKeepAwake
Prevents screen from sleeping during matches:
```tsx
useKeepAwake({ isActive: isMatchInProgress });
```

### useImmersiveMode
Full-screen Android immersive mode:
```tsx
useImmersiveMode({ enabled: isFullscreen });
```

### useSafeAreaInsets
Handles notch/cutout areas:
```tsx
const { top, bottom, left, right } = useSafeAreaInsets();
```

### useHaptics
Haptic vibration feedback:
```tsx
const { impact, notification } = useHaptics();
impact('medium'); // On point scored
notification('success'); // On set win
```

### usePlatform
Platform-aware branching:
```tsx
const { isNative, isAndroid, isIOS, isWeb } = usePlatform();
```

## Build & Deploy

### Web (PWA)
```bash
npm run build          # Build to dist/
npm run deploy:hosting # Deploy to Firebase Hosting
```

### Android
```bash
npm run cap:sync       # Build + sync to Android
npm run cap:open:android  # Open Android Studio
# Build APK/AAB from Android Studio
```

### iOS
```bash
npm run cap:sync       # Build + sync to iOS
npm run cap:open:ios   # Open Xcode
# Build from Xcode
```

## Capacitor Config (capacitor.config.ts)
```typescript
{
  appId: 'com.volleyscore.pro2',
  appName: 'VolleyScore Pro',
  webDir: 'dist',
  plugins: {
    SplashScreen: { launchShowDuration: 2000, backgroundColor: '#111827' },
    Keyboard: { resize: 'body', style: 'dark' },
    FirebaseAuthentication: { providers: ['google.com'] }
  }
}
```

## Adding New Native Features
1. Install Capacitor plugin: `npm install @capacitor/plugin-name`
2. Sync: `npx cap sync`
3. Create hook in `src/lib/platform/use{Feature}.ts`
4. Handle web fallback (native APIs unavailable in browser)
5. Add platform guard:
   ```tsx
   import { Capacitor } from '@capacitor/core';
   if (Capacitor.isNativePlatform()) { /* native code */ }
   ```
6. Test on both web and native

## Key Files
- `capacitor.config.ts` — Capacitor settings
- `vite.config.ts` — PWA plugin config
- `src/lib/platform/` — All native hooks
- `src/lib/pwa/` — PWA hooks
- `src/ui/ReloadPrompt.tsx` — SW update UI
- `src/ui/InstallReminder.tsx` — Install banner
- `src/ui/SplashScreen.tsx` — Splash screen
- `android/` — Android native project
