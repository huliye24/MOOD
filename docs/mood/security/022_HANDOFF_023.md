# HANDOFF — PACKAGE 023 PUBLIC STAGING & E2E

022 has left a staged security baseline for Public Staging.

---

## 1. Staging Gate Status

| Gate | Status | Action |
|---|---|---|
| SG0 | ✅ | — |
| SG1 | ⚠️ open | F-005/F-006/F-007 must close OR Maintainer accepts |
| SG2 | ⚠️ open | Code audit required |
| SG3 | ⚠️ open | Admin API audit required |
| SG4 | ✅ | — |
| SG5 | ❌ | Rate limit must be implemented |
| SG6 | ❌ | Security headers must be configured |
| SG7 | ⚠️ open | Node API serializer audit (F-008) |
| SG8 | ✅ | — |
| SG9 | ✅ | — |
| SG10 | ✅ | — |

---

## 2. Open P0 / P1 Findings

### F-001 — Single-Maintainer Custody

- **Severity:** P0
- **Status:** Open (Acknowledged)
- **Mitigation:** Treasury is inactive; no execution authority.
- **Risk for 023 staging:** None directly (no funds).
- **Reference:** `docs/mood/treasury/021_HANDOFF_022.md`

### F-005 — No Rate Limiting

- **Severity:** P1
- **Status:** Open
- **Required for 023:** Yes — Implement edge / middleware rate limit.
- **Recommended baseline:** 60 GET/min/IP, 10 mutation/min/IP, 60 mutation/hour/IP.

### F-006 — Markdown Sanitization

- **Severity:** P1
- **Status:** Open
- **Required for 023:** Yes — Strict sanitize Markdown renderers.
- **Affected:** 016 Contribution, 020 Governance (MIP body).

### F-007 — CSP Not Configured

- **Severity:** P1
- **Status:** Open
- **Required for 023:** Yes — Configure CSP via `next.config.js`.
- **Recommended:** Start report-only, observe, then enforce.

### F-008 — Node Public API May Expose Internal Hostname

- **Severity:** P1
- **Status:** Open
- **Required for 023:** Yes — Review `apps/web/app/nodes/api/[id]/route.ts`.
- **Reference:** `022_FINDINGS.md`

---

## 3. Required Environment Configuration

### Env Variables (must be set, never committed)

```text
DATABASE_URL              DB connection string
SESSION_SECRET            Session signing secret
BSC_RPC_URL               BSC RPC endpoint (or chain-specific)
OPENAI_API_KEY            AI provider key (if used)
ANTHROPIC_API_KEY         AI provider key (if used)
SENTRY_DSN                Error reporting (optional)
LOG_LEVEL                 info | warn | error
```

### Verification Before Promotion

- [ ] All env vars documented in `.env.example`.
- [ ] No real secrets in `.env.example`.
- [ ] Production deployment uses secret manager (not `.env` file).

---

## 4. Public-Safe Health Checks

These endpoints are safe for `/network` and external monitoring:

```text
GET /api/security/status       — security gate status (sanitized)
GET /api/protocol/treasury/status — treasury status (no secrets)
GET /api/protocol/transparency — protocol transparency (no secrets)
GET /api/network/overview      — network metrics (no secrets)
GET /api/network/health        — health check
GET /                           — public home page
GET /security                  — security page
GET /treasury                  — treasury page
GET /transparency              — transparency page
```

Endpoints that MUST NOT be exposed externally:

```text
ANY POST/PATCH/DELETE without authentication
ANY route exposing Maintainer-class data
ANY route returning env values
```

---

## 5. E2E Security Cases (023 must verify)

### EC-01 — Anonymous User

```text
Steps:
1. Open browser, no auth.
2. Visit /security, /treasury, /transparency, /network.
3. All render without errors.
4. No secrets visible.
Expected: All OK.
```

### EC-02 — Resident Attempts Maintainer Action

```text
Steps:
1. Sign in as Resident via wallet signature.
2. Attempt POST /api/governance/mips/<id>/accept.
3. Expect: 403 Forbidden.
```

### EC-03 — Maintainer Attempts Self-Accept

```text
Steps:
1. Sign in as Maintainer.
2. Create MIP.
3. Attempt accept on own MIP.
4. Expect: 403 self_acceptance_forbidden.
```

### EC-04 — Treasury Public Read

```text
Steps:
1. Anonymous visits /treasury.
2. Sees "Not Activated".
3. /api/protocol/treasury returns accounts: [], treasuryStatus: "inactive".
4. No real balances displayed.
Expected: All OK.
```

### EC-05 — XSS Attempt

```text
Steps:
1. Submit contribution with evidence_url: "javascript:alert(1)".
2. Expect: rejected or sanitized.
3. Submit MIP body with <script>alert(1)</script>.
4. Expect: escaped on render.
```

### EC-06 — API Error Sanitization

```text
Steps:
1. Trigger error on public API (e.g., bad request).
2. Inspect response.
3. Expect: { error: "Human-readable" } — no stack trace.
```

### EC-07 — CSP Enforcement

```text
Steps:
1. Configure CSP report-only.
2. Browse site; observe report log.
3. After observation, enforce CSP.
4. Verify no legitimate functionality broken.
```

### EC-08 — Rate Limit

```text
Steps:
1. Spam mutation endpoint > 10 / minute.
2. Expect: 429 with retry-after.
3. Spam GET endpoint > 60 / minute.
4. Expect: 429.
```

---

## 6. Deployment Blockers

### Hard Blockers (must close before staging)

- None — Treasury is inactive; no funds at risk.

### Conditional Blockers (Maintainer may accept with rationale)

- F-005 (rate limit) — Acceptable to defer if staging traffic is internal-only.
- F-006 (markdown sanitization) — Acceptable to defer if no user content rendered.
- F-007 (CSP) — Acceptable to start report-only and enforce in 024+.
- F-008 (Node API) — Acceptable if staging has no Node operators yet.

### Maintainer Decision Required

1. Accept F-005/F-006/F-007/F-008 as known-with-mitigation?
2. If yes, document expected mitigation date.
3. Update `docs/mood/security/022_FINDINGS.md` with acceptance record.

---

## 7. Files for 023 to Audit

### Critical (must review before staging promotion)

```text
apps/web/lib/genesis-message.ts        SIWE signature
apps/web/lib/genesis-distribution.ts  Registration flow
apps/web/lib/contribution-*.ts        Submission review
apps/web/lib/agents/                  Agent capabilities
apps/web/app/nodes/api/[id]/route.ts  Node API serializer (F-008)
apps/web/app/api/governance/mip-numbering/*  MIP state machine
apps/web/lib/treasury/model.ts        Treasury model
apps/web/lib/security/model.ts        Security status
```

### Reference

```text
docs/mood/security/022_FINDINGS.md
docs/mood/security/022_CONTROL_MATRIX.md
docs/mood/security/022_STAGING_SECURITY_GATE.md
docs/mood/security/022_PUBLIC_TRUST_CLAIMS.md
docs/mood/treasury/021_FINAL_REPORT.md
docs/mood/governance/020_FINAL_REPORT.md
```

---

## 8. Successor Package Notes

023 must NOT:

- Activate Treasury without an accepted MIP.
- Enable auto-payout / LP / Holder Reward distribution.
- Generate fake balances or USD values.
- Allow Maintainer class to bypass governance.
- Expose private keys, seeds, mnemonics.

023 SHOULD:

- Verify all public-safe health checks.
- Document E2E security cases.
- Verify staging gate status before promotion.
- Update /security page if any TC changes.

---

## 9. Final Note

022 closes with:

```text
Independent third-party security audit: Not completed
Single-operator custody acknowledged
v1 in process-transparent mode
022 establishes baseline; 023 continues hardening
```

This is HONEST, VERIFIABLE, and SAFE for 023 to proceed.
