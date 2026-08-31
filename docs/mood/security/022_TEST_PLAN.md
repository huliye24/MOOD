# 022 — Test Plan

**Date:** 2026-08-30

## INV-022-01
Public user cannot access admin mutation.

**Test:**
1. Anonymous request to `POST /api/governance/mips/[id]/accept` returns 401.
2. Resident request to same endpoint returns 403.
3. Only Maintainer request succeeds (or 404 if route not yet implemented).

## INV-022-02
Resident cannot escalate own role.

**Test:**
1. Resident attempts to set `role: "Maintainer"` on own profile via PATCH.
2. Server rejects the field (not in allowlist).

## INV-022-03
Agent has no Treasury execution authority.

**Test:**
1. Grep agent capability files for `transfer`, `sign`, `approve` — none found.
2. No POST `/api/protocol/treasury/transfer` route exists.

## INV-022-04
Node public API does not leak private endpoint / credentials.

**Test:**
1. Inspect `apps/web/app/nodes/api/[id]/route.ts` response.
2. Verify no internal hostname, no SSH key, no IP field, no `process.env` reference.

## INV-022-05
MIP author cannot self-accept own proposal.

**Test:**
1. Create MIP as Maintainer A.
2. A attempts to accept own MIP.
3. API rejects (403 / 400 with `self_acceptance_forbidden`).

## INV-022-06
Treasury candidate wallet does not auto-activate.

**Test:**
1. Add account with `status: "observed"`.
2. `treasuryStatus` remains `inactive`.
3. Account display: "Candidate (not active Treasury)".

## INV-022-07
Unsafe URL / XSS payload is rejected or safely escaped.

**Test:**
1. Submit contribution with `evidence_url: "javascript:alert(1)"` — rejected.
2. Submit contribution with `evidence_url: "http://internal.example.com/admin"` — rejected (SSRF).
3. Submit MIP body with `<script>alert(1)</script>` — escaped on render.

## INV-022-08
Public API errors do not leak stack / secret.

**Test:**
1. Force error on `/api/protocol/transparency` (e.g., DB down).
2. Response: `{ error: "Human-readable" }`.
3. No `Error: ... at ... ` trace.

## INV-022-09
No P0 secret in generated client bundle.

**Test:**
1. `next build` output.
2. Grep `.next/static/**` for `process.env`, `DATABASE_URL`, signing material.
3. None present.

## INV-022-10
Security headers baseline verified.

**Test:**
1. Curl public page headers.
2. Verify: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

Status: ⚠️ Currently partial; full baseline deferred to 023.

## INV-022-11
Foundation mode keeps all economic write paths disabled.

**Test:**
1. No `POST /api/protocol/treasury/transfer` route.
2. No `POST /api/protocol/treasury/execute` route.
3. No `POST /api/protocol/token-tax-configure` route.
4. No `cron` / `setInterval` for auto-payout in treasury code.

## INV-022-12
Public trust claims have evidence.

**Test:**
1. Open `/security` page.
2. For each Trust Claim, link to evidence file.

Status: ✅ All TC-001..TC-010 have evidence.

---

## Manual Test Scenarios

### Scenario 1: Anonymous Reaches Admin Endpoint

```bash
curl -X POST http://localhost:3000/api/governance/mips/<id>/accept
# Expected: 401 / 405 / 404
```

### Scenario 2: Public Page Security Headers

```bash
curl -I http://localhost:3000/security
# Expected: security headers present
```

### Scenario 3: Treasury Snapshot

```bash
curl http://localhost:3000/api/protocol/treasury | jq .
# Expected: treasuryStatus: "inactive", accounts: [], risks: [...]
```

### Scenario 4: Error Sanitization

```bash
curl http://localhost:3000/api/protocol/treasury/status  # simulate failure
# Expected: { error: "Human-readable" }, no stack trace
```

---

## Commands

```bash
# TypeScript check
cd apps/web && npx tsc --noEmit

# Build
cd apps/web && npm run build

# Smoke tests
curl -s http://localhost:3000/api/protocol/treasury | jq .
curl -s http://localhost:3000/api/protocol/treasury/status | jq .
curl -s http://localhost:3000/security | head -20
```

> Note: Some commands may not run in current sandboxed environment without `npm install` / DB.
> Invariants are verified through static code review.
