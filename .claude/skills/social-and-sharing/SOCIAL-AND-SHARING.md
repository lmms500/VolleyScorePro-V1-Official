---
name: social-and-sharing
description: >
  Work on social sharing, leaderboards, community features, and result cards. Use
  when implementing share functionality, screenshot cards, leaderboard systems,
  social interactions, friends system, match invitations, community feed, native
  share API, or any social/sharing-related feature.
---

# Social Features — VolleyScore-Pro

## Decision Tree

```
Social need → What type?
    ├─ Share match result → ResultCard + useSocialShare
    ├─ Leaderboard → GlobalLeaderboard + Firestore /leaderboard
    ├─ Profile sync → useProfileSync (see firebase-and-auth)
    ├─ Result card design → ResultCard Design section below
    ├─ Native share → Capacitor Share API (see mobile-and-pwa)
    └─ Future social feature → Friends/Invitations/Feed below
```

## Current Features
- Match result card screenshot (html-to-image)
- Native share via Capacitor Share API
- Global leaderboard (Firebase)
- Profile sync across devices

## Architecture

### Components (src/features/social/components/)
| Component | Purpose |
|-----------|---------|
| `GlobalLeaderboard` | Ranked player list |
| `ResultCard` | Social share card (screenshot-ready) |
| `SyncConfirmationModal` | Cloud sync consent |

### Services
- **SocialService.ts** — Share API wrapper, leaderboard operations
- **useSocialShare.ts** — Hook for sharing match results

### Share Flow
```
Match ends → Generate ResultCard screenshot
  → html-to-image (captures card as PNG)
  → Native: Capacitor Share API (Instagram, WhatsApp, etc.)
  → Web: Web Share API or download
```

## ResultCard Design
- Standalone visual card at `z-index: -50` (hidden from UI)
- Contains: teams, scores, winner, date, mode
- Branded with VolleyScore-Pro logo
- Optimized for Instagram Stories (9:16 ratio)
- Different design context than main app (shadow-2xl allowed)

## Leaderboard System

### Data Model (Firestore `/leaderboard/{uid}`)
```typescript
interface LeaderboardEntry {
  uid: string;
  name: string;
  avatar?: string;
  matches: number;
  wins: number;
  mvps: number;
  score: number;      // Composite ranking score
  updatedAt: Timestamp;
}

// Score formula:
// score = (wins * 3) + (matches * 1) + (mvps * 5)
```

### Firestore Rules
- Public read (anyone can view leaderboard)
- Authenticated write (own entry only)

## Future Social Features

### 1. Friends System
```typescript
interface FriendConnection {
  uid: string;
  friendUid: string;
  status: 'pending' | 'accepted';
  since: number;
}
// Friends leaderboard, challenge friends to matches
```

### 2. Match Invitations
- Deep link to join a match
- QR code for local match joining
- Push notification invites

### 3. Community Feed
- Public match results feed
- Like/react to results
- Comments on matches

### 4. Team Pages
- Public team profile
- Team statistics
- Match history
- Recruitment/join requests

## Implementation Notes
- Share images optimized for social platforms
- Respect privacy (opt-in for leaderboard)
- Rate-limit leaderboard writes
- Cache leaderboard data locally

## Key Files
- `src/features/social/components/ResultCard.tsx`
- `src/features/social/components/GlobalLeaderboard.tsx`
- `src/features/social/services/SocialService.ts`
- `src/features/social/hooks/useSocialShare.ts`
- `firestore.rules` — Leaderboard access rules
