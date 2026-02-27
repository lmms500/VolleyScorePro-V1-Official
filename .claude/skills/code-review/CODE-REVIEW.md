---
name: code-review
description: Systematic code review covering correctness, security, performance, and maintainability. Use when reviewing pull requests, auditing changes, checking code quality, or when the user asks to review code. Also use proactively before merging significant changes.
---

# Code Review

## Decision Tree

```
Review request → What scope?
    ├─ Full PR review → Follow all 6 steps below
    ├─ Security-focused → Steps 1, 3 + security-audit skill
    ├─ Quick sanity check → Steps 1, 2, 6 only
    └─ Performance review → Steps 1, 4 + performance skill
```

## Process

1. **Context** — Read changed files, understand intent from PR description or commit messages
2. **Correctness** — Logic errors, edge cases, off-by-ones, null/undefined handling
3. **Security** — Injection, auth bypass, data exposure, OWASP top 10
4. **Performance** — Unnecessary re-renders, missing memoization, bundle size impact
5. **Maintainability** — Naming, structure, DRY, single responsibility
6. **Tests** — Coverage of changed code, edge cases, assertion quality

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **CRITICAL** | Security vulnerability, data loss, crash | Must fix before merge |
| **MAJOR** | Logic error, missing error handling, perf issue | Should fix before merge |
| **MINOR** | Style, naming, documentation gap | Fix or acknowledge |
| **NITPICK** | Preference, alternative approach | Optional |

## Output Format

For each finding:
```
[SEVERITY] file:line - Description
  Why: Impact explanation
  Fix: Suggested code change
```

## VolleyScore-Pro Specific Checks

### Design System Compliance
- [ ] Shadow utilities use merged custom values (no separate `shadow-X` + `shadow-[inset...]`)
- [ ] All ring utilities include `ring-inset` (`ring-1 ring-inset ring-white/10`)
- [ ] GlassSurface used for glass effects (not custom backdrop-blur)
- [ ] Visual effects gated by PerformanceContext
- [ ] Animations use `scoutSpring` / `scoutSlideVariants` from `@lib/utils/animations`

### React & State
- [ ] No `any` types — proper TypeScript interfaces
- [ ] Path aliases used (`@ui/`, `@features/`, `@lib/`, `@contexts/`, `@config/`)
- [ ] State changes use reducers/stores correctly (no prop drilling for shared state)
- [ ] Components properly memoized where needed
- [ ] No inline object/array creation in JSX props (causes re-renders)

### i18n
- [ ] All user-facing strings use `t()` function
- [ ] Translations added to all 3 locale files (en, es, pt)

### General Checklist
- [ ] No hardcoded secrets, tokens, or credentials
- [ ] Error paths handled (not just happy path)
- [ ] No unvalidated user input reaches DB/shell/HTML
- [ ] New dependencies justified and audited
- [ ] Breaking changes documented
- [ ] Tests cover the changed behavior
- [ ] No commented-out code committed
- [ ] No debug logging left in (`console.log`, etc.)

## Anti-Patterns to Flag

- **Rubber-stamping** — Approving without reading
- **Style wars** — Debating formatting that a linter should handle
- **Rewrite requests** — Asking for total rewrite in review (that's a design discussion)
- **Scope creep** — Requesting unrelated improvements (file separate issues)
- **Shadow/ring violations** — Tailwind CSS var collision patterns (see MEMORY.md)
