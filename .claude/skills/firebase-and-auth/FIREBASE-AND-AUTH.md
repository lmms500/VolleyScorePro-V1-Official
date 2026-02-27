---
name: firebase-and-auth
description: >
  Work on Firebase integration including authentication, Firestore database, security
  rules, and cloud sync. Use when implementing auth flows, Google OAuth, database
  operations, Firestore collections, security rules, real-time sync, profile sync,
  cloud deployment, or any Firebase-related feature.
---

# Firebase Backend — VolleyScore-Pro

## Decision Tree

```
Firebase need → What type?
    ├─ Authentication flow → AuthContext + Capacitor/Web auth below
    ├─ Firestore read/write → Firestore Collections below
    ├─ Security rules → firestore.rules section below
    ├─ Profile sync → useProfileSync + ProfileSyncManager
    ├─ New collection → Adding New Firestore Collections workflow
    ├─ Deployment → Deployment section below
    └─ Database optimization → Use database-optimizer skill
```

## Services Used
- **Firebase Authentication** (Google OAuth)
- **Cloud Firestore** (NoSQL database)
- **Firebase Hosting** (web deployment)

## Configuration

### Environment Variables
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=volleyscore-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=volleyscore-pro
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

### Firebase Init (src/lib/firebase.ts)
```typescript
// Exports: auth, db (Firestore instance)
import { auth, db } from '@lib/firebase';
```

## Authentication (AuthContext.tsx)

### Flow
1. User taps "Sign in with Google"
2. Capacitor: `@capacitor-firebase/authentication` → native Google Sign-In
3. Web: Firebase `signInWithPopup` or `signInWithRedirect`
4. AuthContext stores user state
5. Profile linked to Firebase UID

### Usage
```tsx
const { user, isAuthenticated, signIn, signOut } = useAuth();
```

## Firestore Collections

### `/profiles/{uid}`
Player profile data synced to cloud:
```typescript
{
  name: string;
  skillLevel: number;
  stats: PlayerStats;
  avatar?: string;
  updatedAt: Timestamp;
}
```

### `/broadcasts/{matchId}`
Live broadcast state (real-time):
```typescript
{
  gameState: Partial<GameState>;
  timer: number;
  timeouts: { A: number, B: number };
  spectatorCount: number;
  updatedAt: Timestamp;
}
```

### `/leaderboard/{uid}`
Global leaderboard entries:
```typescript
{
  name: string;
  matches: number;
  wins: number;
  mvps: number;
  score: number;
}
```

## Security Rules (firestore.rules)
```
- Profiles: Owner read/write only (uid match)
- Broadcasts: Authenticated read, owner write
- Leaderboard: Public read, authenticated write (own entry)
```

## Profile Sync (useProfileSync.ts)
- Bidirectional sync between local IndexedDB and Firestore
- Conflict resolution: latest `updatedAt` wins
- Offline-first: works without connectivity
- `ProfileSyncManager.tsx` shows sync status UI

## Adding New Firestore Collections
1. Define data shape in `src/@types/services.ts`
2. Add read/write functions using Firestore SDK
3. Update `firestore.rules` with access control
4. Update `firestore.indexes.json` if queries need composite indexes
5. Add offline fallback (IndexedDB)
6. Test security rules with Firebase Emulator

## Deployment
```bash
npm run deploy              # Full deploy (hosting + rules)
firebase deploy --only firestore:rules  # Rules only
firebase deploy --only hosting          # Hosting only
```

## Key Files
- `src/lib/firebase.ts` — Firebase init
- `src/contexts/AuthContext.tsx` — Auth provider
- `src/features/teams/hooks/useProfileSync.ts` — Profile sync
- `src/features/broadcast/services/SyncEngine.ts` — Broadcast sync
- `firestore.rules` — Security rules
- `firestore.indexes.json` — Composite indexes
- `firebase.json` — Hosting config
- `.env` / `.env.production` — API keys
