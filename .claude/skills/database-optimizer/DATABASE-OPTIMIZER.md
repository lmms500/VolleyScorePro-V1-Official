---
name: database-optimizer
description: Firestore/Firebase database optimization covering query patterns, indexing, data denormalization, cost reduction, and offline sync. Use when optimizing Firestore queries, designing data structures, reducing Firebase costs, or troubleshooting slow reads/writes.
---

# Database Optimizer (Firestore)

## Decision Tree

```
Database concern → What type?
    ├─ Slow queries → Check indexing + query structure
    ├─ High costs → Review read/write patterns + denormalization
    ├─ Data modeling → Design document structure
    ├─ Offline sync → Configure persistence + conflict resolution
    └─ Full audit → All sections below
```

## Firestore Data Modeling Principles

### VolleyScore-Pro Collections

| Collection | Purpose | Key Considerations |
|-----------|---------|-------------------|
| `users` | User profiles, preferences | Read-heavy, cache locally |
| `matches` | Game records, scores | Write during game, read for history |
| `teams` | Team profiles, rosters | Moderate read/write |
| `stats` | Player/team statistics | Aggregate data, denormalize |

### Document Structure Rules

1. **Optimize for reads** — Firestore charges per read, denormalize to avoid JOINs
2. **Keep documents small** — Max 1MB, aim for <100KB
3. **Use subcollections for arrays > 20 items** — Arrays don't scale
4. **Store computed fields** — Pre-compute stats instead of querying
5. **Use batch writes** — Group related writes (score + stats update)

## Query Optimization

### Indexing Strategy

```
Always index:
├─ Fields used in where() clauses
├─ Fields used in orderBy()
├─ Composite indexes for multi-field queries
└─ Collection group queries (if querying across subcollections)
```

### Common Patterns

| Pattern | Bad | Good |
|---------|-----|------|
| Get user's matches | Query all matches, filter client-side | `where('userId', '==', uid)` with index |
| Recent matches | Fetch all, sort client-side | `orderBy('createdAt', 'desc').limit(20)` |
| Match stats | Calculate from raw data each time | Store pre-computed stats in document |
| Team roster | Deep nested array in team doc | Subcollection `teams/{id}/players` |
| Leaderboard | Query all users, sort | Maintain denormalized leaderboard collection |

### Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Fetching all documents | Exploding costs at scale | Pagination with `startAfter` + `limit` |
| Deep nesting (>3 levels) | Complex queries, hard to secure | Flatten with reference IDs |
| Large arrays in documents | 1MB limit, full doc rewrite on update | Subcollections |
| No offline persistence | Poor UX when offline | Enable Firestore persistence |
| Reading on every mount | Unnecessary reads/costs | Cache with React state/context |
| Missing composite indexes | Query failures | Define in `firestore.indexes.json` |

## Cost Reduction

### Read Optimization
- **Cache aggressively** — Use React context/state to avoid re-reads
- **Use `getDocFromCache()` first** — Fall back to server only if stale
- **Snapshot listeners** — Use for real-time data, avoid polling
- **Pagination** — Never fetch unbounded collections

### Write Optimization
- **Batch writes** — Group related operations (max 500 ops per batch)
- **Throttle updates** — Don't write on every keystroke, debounce
- **Increment counters** — Use `FieldValue.increment()` instead of read-then-write

### Storage
- **Delete old data** — Implement TTL for temporary data
- **Compress before storing** — For large text fields
- **Use Cloud Storage for files** — Not Firestore for images/PDFs

## Offline Support

```typescript
// Enable offline persistence
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, only works in one
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support
  }
});
```

## Firestore Security Rules Performance

- Keep rules simple — complex rules increase latency
- Avoid `get()` calls in rules when possible (each adds a read)
- Use custom claims for role-based access instead of document lookups

## Output Format

```
[IMPACT: HIGH|MEDIUM|LOW] Category - Finding
  Current: Description of current pattern
  Optimized: Recommended approach
  Savings: Estimated read/write/cost reduction
```
