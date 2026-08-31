# 022 — Web Hardening

**Date:** 2026-08-30

## Baseline Headers

The following security headers should be configured via `next.config.js` (or hosting provider):

```text
Content-Security-Policy: <policy>
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Frame-Options: DENY
```

## CSP Strategy

022 does NOT introduce strict CSP that breaks the app.

Recommended phased approach:

```text
Phase 1: report-only CSP
  ↓ (observe violations)
Phase 2: relax / tighten policy based on observation
  ↓
Phase 3: enforce
```

Initial report-only CSP (to be added):

```text
Content-Security-Policy-Report-Only:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://bsc-dataseed.binance.org;
  frame-ancestors 'none';
  report-uri /api/csp-report;
```

## Cookie Flags

For session cookies:

```text
Secure
HttpOnly
SameSite=Lax (or Strict for sensitive routes)
```

022 does NOT introduce new cookies; future session cookies MUST follow this.

## CORS

- Public APIs: same-origin only.
- External integrations (future): explicit allowlist; no wildcard.

## CSRF

- For state-changing requests, use CSRF token or same-site cookies.
- POST without CSRF token MUST be rejected.

022 does NOT yet implement explicit CSRF; recommended as P1 follow-up.

## Rate Limiting

Recommended baseline:

```text
GET requests:  60 / minute / IP
POST/PATCH/DELETE: 10 / minute / IP, 60 / hour / IP
```

022 recommends middleware-based rate limit. Implementation deferred to 023 / post-023.

## Input Validation

- All API routes accepting JSON should validate with Zod.
- URL fields: enforce http(s) scheme; deny `file:`, `javascript:`, `data:` (except images).
- Markdown body: sanitize HTML on render.

## Output Escaping

- React JSX auto-escapes; verify Markdown renderers do NOT pass raw HTML.
- Verify no `dangerouslySetInnerHTML` without sanitization.

## Error Sanitization

- Production errors return `{ error: "Human-readable" }` JSON.
- No stack trace; no env value; no internal hostname.

## Frame Protection

- `frame-ancestors 'none'` (via CSP) or `X-Frame-Options: DENY`.

---

## What 022 Does NOT Do

- Does NOT enforce CSP yet (report-only recommended).
- Does NOT configure rate limiting (deferred).
- Does NOT add CSRF tokens (deferred).
- Does NOT retrofit existing cookies.

These are explicit deferrals to 023 / post-023 hardening pass.

---

## Reference

- `022_STAGING_SECURITY_GATE.md` SG6
- `022_TRUST_BOUNDARIES.md`
