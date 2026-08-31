# 022 — Trust Boundaries

**Date:** 2026-08-30

## Layered Trust Model

```text
Browser
  ↓ (TLS, CSP, cookies)
Public Web (Next.js Pages)
  ↓ (server-side fetch)
Auth / Session Layer
  ↓ (resident signature verification, session cookie)
Application API (Next.js Route Handlers)
  ↓ (server-side ORM)
Database (SQLite via Drizzle)
  ↓ (RPC)
External RPC / Providers (BSC RPC, etc.)
  ↓ (Network)
Node / Agent Services
```

---

## Trust Boundaries (each must have: caller, callee, auth, authorization, data sensitivity, failure mode, audit, rate limit)

### TB-01: Browser → Public Web

- **Caller:** Browser
- **Callee:** Next.js page (RSC + client components)
- **Authentication:** None for public pages
- **Authorization:** Public-only content
- **Data sensitivity:** Public
- **Failure mode:** Render fails → show error page; do NOT leak DB
- **Audit:** Server logs only
- **Rate limit:** Implicit (CDN / Vercel edge)

### TB-02: Browser → Auth Layer

- **Caller:** Browser
- **Callee:** `/api/genesis/nonce`, `/api/genesis/register`, etc.
- **Authentication:** Wallet signature (SIWE-like)
- **Authorization:** Nonce single-use, domain-bound
- **Data sensitivity:** Wallet address; signature; nonce
- **Failure mode:** Invalid signature → reject; do NOT log full signature
- **Audit:** Auth event log with truncated address
- **Rate limit:** Per-IP + per-wallet; required for 023

### TB-03: Auth → Application API

- **Caller:** Session cookie (Resident identity)
- **Callee:** Application API routes
- **Authentication:** Session cookie + signature-derived identity
- **Authorization:** Role check on Resident class
- **Data sensitivity:** Resident PII (display name, email, etc.)
- **Failure mode:** Session expired → 401; do NOT auto-renew silently
- **Audit:** API access log; sensitive action audit
- **Rate limit:** Per-resident

### TB-04: Application API → Database

- **Caller:** Drizzle ORM
- **Callee:** SQLite / PolarDB
- **Authentication:** DB credentials (env)
- **Authorization:** SQL role (least privilege)
- **Data sensitivity:** All persistent data
- **Failure mode:** Connection drop → retry with backoff; do NOT silently lose audit
- **Audit:** DB connection logging
- **Rate limit:** N/A (in-process for SQLite)

### TB-05: Application API → External RPC

- **Caller:** Application API (read-only)
- **Callee:** BSC RPC endpoint
- **Authentication:** RPC URL (no auth for public RPC; key-based for private)
- **Authorization:** Read-only
- **Data sensitivity:** On-chain public state
- **Failure mode:** RPC unavailable → return `unavailable`; do NOT cache stale data silently
- **Audit:** Read log with timestamp
- **Rate limit:** Per-endpoint, per-RPC-provider

### TB-06: Public API → Internal Service

- **Caller:** Public route handler
- **Callee:** Internal service module
- **Authentication:** None (public) OR session-based
- **Authorization:** Role check inside service
- **Data sensitivity:** Returns only public-safe fields
- **Failure mode:** Service throws → return sanitized error
- **Audit:** Standard access log
- **Rate limit:** Per-IP, per-route

---

## High-Risk Internal Boundaries

### H-01: Resident � Admin

- **Risk:** Resident privilege escalation to Admin via client-side role hint
- **Mitigation:** Server-side role check; never trust client role
- **Required by:** 023 staging gate SG3

### H-02: Resident ↔ Reviewer

- **Risk:** Resident bypassing reviewer to self-approve
- **Mitigation:** Server-side role check; audit trail required
- **Required by:** 023 staging gate SG3

### H-03: Operator ↔ Agent

- **Risk:** Agent operator acquiring Treasury / wallet authority
- **Mitigation:** Permission matrix denies operator → Treasury signer
- **Required by:** 023 staging gate SG5

### H-04: Operator ↔ Node

- **Risk:** Node operator impersonating other nodes
- **Mitigation:** Public key + stable ID verification; no SSH/internal hostname exposure
- **Required by:** 023 staging gate SG3, SG7

### H-05: Governance ↔ Canon

- **Risk:** Accepted MIP automatically rewriting `CURRENT_CANON.md`
- **Mitigation:** Explicit Canon update PR; not auto-applied
- **Required by:** 023 staging gate SG3

### H-06: Governance ↔ Treasury

- **Risk:** Governance action moving Treasury funds without MIP
- **Mitigation:** Treasury executions require MIP reference + Maintainer actor
- **Required by:** 023 staging gate SG3, SG10

### H-07: AI ↔ Tools

- **Risk:** AI agent acquiring arbitrary transfer / signing tool
- **Mitigation:** Agent role has NO Treasury signer; permission matrix denies
- **Required by:** 023 staging gate SG5

### H-08: Public API � Internal Service

- **Risk:** Public API exposing internal hostname, stack trace, secrets
- **Mitigation:** Sanitized error responses; allowlist serializer
- **Required by:** 023 staging gate SG8

---

## Data Sensitivity Levels

```text
PUBLIC        — Pages, public APIs, anonymous-safe metrics
RESIDENT      — Profile data, contribution drafts, support intents
REVIEWER      — Reviewer notes, audit trail
MAINTAINER    — Configuration, MIP drafts
SECRET        — DB credentials, signing keys, session secrets
NEVER-EXPORT  — Private keys, seeds, mnemonics
```

022 ensures NO `NEVER-EXPORT` data appears in any API response.

---

## Failure Mode Defaults

| Boundary | Default Behavior on Failure |
|---|---|
| Auth fails | Reject; log truncated; never auto-grant |
| Authz fails | Reject; log; do NOT leak whether resource exists |
| DB fails | Sanitized error; retry on transient; circuit-break on persistent |
| RPC fails | `unavailable` status; do NOT use stale cache silently |
| Rate limit hit | 429 with retry-after; do NOT block all users |
| Internal service throws | Sanitized error; do NOT leak stack |
