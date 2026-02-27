---
name: security-audit
description: Security audit with OWASP top 10 checklist, Firebase rules review, secrets detection, input validation, and XSS/injection prevention. Use when auditing code security, reviewing Firebase rules, handling user input, checking auth flows, or hardening the application.
---

# Security Audit

## Decision Tree

```
Security concern → What type?
    ├─ Reviewing code changes → OWASP checklist below
    ├─ Handling user input → Where does it go?
    │   ├─ Firestore query → Validate + sanitize before write
    │   ├─ HTML output → Framework escaping (React handles this)
    │   ├─ URL/redirect → Allowlist or relative paths only
    │   └─ localStorage → No secrets, validate on read
    ├─ Firebase rules → Security rules checklist
    ├─ Auth flow → Auth checklist
    └─ Full security audit → All phases below
```

## Phases

```
Phase 1: Scan → Phase 2: Analyze → Phase 3: Report
```

## OWASP Top 10 Checklist (adapted for PWA + Firebase)

| # | Vulnerability | Check |
|---|--------------|-------|
| A01 | Broken Access Control | Firebase rules enforce auth, no client-side only auth checks |
| A02 | Cryptographic Failures | TLS everywhere, secrets in env vars not code, no sensitive data in localStorage |
| A03 | Injection | No string concat for queries, React auto-escapes JSX, no `dangerouslySetInnerHTML` |
| A04 | Insecure Design | Rate limiting on Firebase functions, input size limits |
| A05 | Security Misconfiguration | Firebase rules not open (`allow read, write: if true`), CORS restricted |
| A06 | Vulnerable Components | Dependencies updated, no known CVEs, lockfile committed |
| A07 | Auth Failures | Firebase Auth with proper session handling, no custom auth tokens in localStorage |
| A08 | Data Integrity | Service worker integrity, no untrusted deserialization |
| A09 | Logging Failures | Auth events logged, no sensitive data in console.log |
| A10 | SSRF | URL validation for any external API calls |

## Firebase Security Rules Checklist

- [ ] All collections require authentication (`request.auth != null`)
- [ ] Users can only read/write their own data (`request.auth.uid == resource.data.userId`)
- [ ] No wildcard write access on sensitive collections
- [ ] Data validation rules on writes (type, size, required fields)
- [ ] Rate limiting rules where applicable
- [ ] No test/development rules in production

## Input Validation

| Input | Validate |
|-------|----------|
| Team names | Max length (50), allowed characters, trim whitespace |
| Player names | Max length (50), no HTML/script tags |
| Score values | Integer, non-negative, within game rules |
| Game settings | Enum validation (valid game modes, point limits) |
| Voice input | Sanitize transcription before processing |
| URLs (share links) | Validate format, no javascript: protocol |

## PWA-Specific Security

- [ ] Service worker only caches from allowed origins
- [ ] No sensitive data in Cache API
- [ ] CSP headers configured for the app
- [ ] No inline scripts (CSP violation)
- [ ] Manifest file doesn't expose internal URLs

## Scanning Commands

```bash
# Dependency vulnerabilities
npm audit

# Secret detection in codebase
grep -r "apiKey\|secret\|password\|token" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"

# Check for dangerouslySetInnerHTML
grep -r "dangerouslySetInnerHTML" src/

# Check for console.log in production code
grep -r "console\.\(log\|debug\|info\)" src/ --include="*.ts" --include="*.tsx" | grep -v "// debug" | grep -v ".test."
```

## Response Headers (for production)

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Output Format

```
[CRITICAL|HIGH|MEDIUM|LOW] Category - Finding
  Location: file:line
  Impact: What an attacker could do
  Fix: Specific remediation
```
