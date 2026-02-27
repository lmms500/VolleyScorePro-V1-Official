---
name: dev
description: Universal skill router for VolleyScore-Pro. Use this ALWAYS as the first step for any development request. Analyzes the user's request, identifies the best matching skill(s), loads them, and executes the task with full project context.
---

# VolleyScore-Pro — Universal Dev Agent

You are the lead developer agent for **VolleyScore-Pro**, a premium volleyball PWA (React 19 + Vite + Tailwind CSS v3.4 + Framer Motion v11 + Capacitor).

## Your Role

When the user makes ANY development request, you MUST:

1. **Analyze** the request to understand what is being asked
2. **Classify** it into one or more skill domains
3. **Load** the relevant skill(s) before writing any code
4. **Execute** the task following the loaded skill's patterns and rules

## Step 1 — Analyze the Request

Read the user's request carefully and identify:
- **What** they want (new feature, bug fix, refactor, UI change, etc.)
- **Where** in the codebase it affects (which features, files, layers)
- **Scope** (single component, full feature, cross-cutting concern)

## Step 2 — Classify into Skill Domain(s)

Map the request to one or more of these skills. Read the matching file from `.claude/skills/{folder}/{FILE}.md` BEFORE writing any code:

### UI & Visual
| Trigger Keywords | Skill | File |
|-----------------|-------|------|
| shadow, glass, ring, color, theme, dark mode, token, visual, design, style | **ui-visual-patterns** | `.claude/skills/ui-visual-patterns/UI-VISUAL-PATTERNS.md` |
| animation, transition, motion, spring, variant, framer, effect, shimmer | **animations** | `.claude/skills/animations/ANIMATIONS.md` |
| component, modal, screen, page, UI, button, card, form, layout | **react-components** | `.claude/skills/react-components/REACT-COMPONENTS.md` |
| accessible, ARIA, screen reader, reduced motion, contrast, WCAG | **accessibility-a11y** | `.claude/skills/accessibility-a11y/ACCESSIBILITY-A11Y.md` |

### Game & Features
| Trigger Keywords | Skill | File |
|-----------------|-------|------|
| score, point, set, match, serve, rotation, deuce, game mode, rules | **scoring-and-rules** | `.claude/skills/scoring-and-rules/SCORING-AND-RULES.md` |
| voice, speech, recognition, TTS, command, microphone, Gemini parser | **voice-and-speech** | `.claude/skills/voice-and-speech/VOICE-AND-SPEECH.md` |
| team, player, roster, profile, substitute, bench, balance, drag | **players-and-rosters** | `.claude/skills/players-and-rosters/PLAYERS-AND-ROSTERS.md` |
| court, position, zone, sand, beach, formation | **court-layout** | `.claude/skills/court-layout/COURT-LAYOUT.md` |
| broadcast, OBS, stream, sync, spectator, overlay, live | **live-broadcast** | `.claude/skills/live-broadcast/LIVE-BROADCAST.md` |
| history, stats, analytics, chart, graph, momentum, PDF, analysis | **stats-and-history** | `.claude/skills/stats-and-history/STATS-AND-HISTORY.md` |
| share, leaderboard, social, result card, friends | **social-and-sharing** | `.claude/skills/social-and-sharing/SOCIAL-AND-SHARING.md` |

### Infrastructure
| Trigger Keywords | Skill | File |
|-----------------|-------|------|
| state, context, reducer, zustand, store, dispatch, action | **state-and-stores** | `.claude/skills/state-and-stores/STATE-AND-STORES.md` |
| Firebase, auth, Firestore, rules, deploy, cloud, sync | **firebase-and-auth** | `.claude/skills/firebase-and-auth/FIREBASE-AND-AUTH.md` |
| PWA, Capacitor, native, Android, iOS, plugin, install, offline | **mobile-and-pwa** | `.claude/skills/mobile-and-pwa/MOBILE-AND-PWA.md` |
| translation, i18n, language, locale, t(), Portuguese, English, Spanish | **translations** | `.claude/skills/translations/TRANSLATIONS.md` |
| test, vitest, unit test, coverage, mock, assertion, reducer test | **testing** | `.claude/skills/testing/TESTING.md` |
| performance, optimize, re-render, memo, lazy, bundle, FPS, low-end | **performance** | `.claude/skills/performance/PERFORMANCE.md` |
| responsive, breakpoint, grid, flex, layout, container, typography, tailwind config | **tailwind-advanced** | `.claude/skills/tailwind-advanced/TAILWIND-ADVANCED.md` |

### Quality & DevOps
| Trigger Keywords | Skill | File |
|-----------------|-------|------|
| review, PR, audit, quality, checklist, code review | **code-review** | `.claude/skills/code-review/CODE-REVIEW.md` |
| security, OWASP, vulnerability, XSS, injection, secrets, auth audit | **security-audit** | `.claude/skills/security-audit/SECURITY-AUDIT.md` |
| playwright, E2E, screenshot, browser test, UI test, visual regression, webapp test | **webapp-testing** | `.claude/skills/webapp-testing/WEBAPP-TESTING.md` |
| deploy, build, release, CI/CD, Firebase hosting, Play Store, App Store | **deployment-automation** | `.claude/skills/deployment-automation/DEPLOYMENT-AUTOMATION.md` |
| Firestore optimize, query, index, denormalize, cost, reads, writes | **database-optimizer** | `.claude/skills/database-optimizer/DATABASE-OPTIMIZER.md` |
| architecture, ADR, design, system design, data flow, feature design | **architecture** | `.claude/skills/architecture/ARCHITECTURE.md` |
| create skill, new skill, SKILL.md, skill trigger, skill format | **skill-creator** | `.claude/skills/skill-creator/SKILL-CREATOR.md` |

### Future Features
| Trigger Keywords | Skill | File |
|-----------------|-------|------|
| XP, level, achievement, badge, streak, challenge, gamification | **xp-and-achievements** | `.claude/skills/xp-and-achievements/XP-AND-ACHIEVEMENTS.md` |
| AI coach, advice, training, real-time suggestion, tactical | **ai-coaching-gemini** | `.claude/skills/ai-coaching-gemini/AI-COACHING-GEMINI.md` |
| tournament, bracket, round-robin, pool, elimination, king of court | **tournaments** | `.claude/skills/tournaments/TOURNAMENTS.md` |

## Step 3 — Load Skills

After classification, READ the matching file(s):

```
Read .claude/skills/{folder}/{FILENAME}.md
```

If the request spans multiple domains (e.g., "add a new game mode with voice commands"), load ALL relevant skills:
- `SCORING-AND-RULES.md` + `VOICE-AND-SPEECH.md` + `TRANSLATIONS.md`

**Always load `UI-VISUAL-PATTERNS.md` if the task involves ANY visual/UI changes.**
**Always load `TRANSLATIONS.md` if the task adds ANY user-facing strings.**
**Always load `STATE-AND-STORES.md` if the task modifies ANY state logic.**

## Step 4 — Execute

With the skill(s) loaded, execute the task following:

1. **Read before writing** — Always read existing files before modifying
2. **Follow skill patterns** — Use the exact patterns documented in the loaded skill(s)
3. **Respect the design system** — Shadow merging, ring-inset, GlassSurface, responsive units
4. **Performance-gate effects** — Check PerformanceContext before adding visual effects
5. **Add translations** — All user-facing strings via `t()` in all 3 locale files
6. **Use path aliases** — `@ui/`, `@features/`, `@lib/`, `@contexts/`, `@config/`
7. **Type everything** — No `any`, proper TypeScript interfaces
8. **Test** — Write or update tests for logic changes

## Quick Reference — Project Structure

```
src/
├── @types/          → TypeScript types (domain.ts, services.ts, ui.ts)
├── config/          → Constants, game modes, feature flags, perf modes
├── contexts/        → Global React contexts (11 contexts)
├── features/        → Feature modules (game, voice, teams, court, history, social, broadcast, tutorial, settings, ads)
│   └── {feature}/
│       ├── components/
│       ├── hooks/
│       ├── modals/
│       ├── services/
│       ├── store/
│       ├── reducers/
│       └── utils/
├── hooks/           → Global hooks
├── layouts/         → Layout components
├── lib/             → Utilities & services (firebase, audio, haptics, image, platform, pwa, storage, utils)
├── locales/         → i18n (en.json, es.json, pt.json)
├── pages/           → Route pages
├── ui/              → Shared UI components (GlassSurface, Modal, Button, designTokens, etc.)
└── theme/           → Theme definitions
```

## Decision Matrix

| Request Type | Primary Skill | Also Load |
|-------------|---------------|-----------|
| New screen/page | react-components | ui-visual-patterns, state-and-stores |
| New game feature | scoring-and-rules | state-and-stores, translations |
| UI bug fix | ui-visual-patterns | react-components |
| New voice command | voice-and-speech | scoring-and-rules, translations |
| Add translations | translations | — |
| Firebase feature | firebase-and-auth | state-and-stores |
| Mobile bug | mobile-and-pwa | — |
| Performance issue | performance | animations |
| New modal | react-components | ui-visual-patterns, animations |
| Team feature | players-and-rosters | state-and-stores, translations |
| Stats/charts | stats-and-history | react-components |
| Share feature | social-and-sharing | mobile-and-pwa |
| Court change | court-layout | animations |
| Broadcast feature | live-broadcast | firebase-and-auth |
| Write tests | testing | (depends on feature) |
| Full new feature | react-components | ui-visual-patterns + state-and-stores + translations + testing |
| Code review/PR | code-review | security-audit (if auth/input) |
| Security audit | security-audit | firebase-and-auth |
| E2E/browser test | webapp-testing | testing |
| Deploy/release | deployment-automation | mobile-and-pwa |
| Firestore optimization | database-optimizer | firebase-and-auth |
| Feature architecture | architecture | state-and-stores + react-components |
| Responsive layout | tailwind-advanced | ui-visual-patterns |
| Create new skill | skill-creator | — |
