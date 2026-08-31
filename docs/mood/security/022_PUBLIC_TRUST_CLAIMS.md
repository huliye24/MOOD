# 022 — Public Trust Claims

**Date:** 2026-08-30

> Every Trust Claim must have Evidence. No evidence → no claim.

## Claim Registry

### TC-001 — Treasury is Not Yet Activated

- **Claim:** "MOOD's protocol Treasury is currently inactive. No real protocol-controlled funds exist."
- **Evidence:** `docs/mood/treasury/021_FINAL_REPORT.md` §4; `apps/web/lib/treasury/model.ts` `DEFAULT_TREASURY_STATUS = "inactive"`; `/treasury` page hero.
- **Scope:** Public.
- **Status:** ✅ Verified.
- **Last Verified:** 2026-08-30.

### TC-002 — AI Cannot Move Treasury Funds

- **Claim:** "AI Agents cannot move Treasury funds or sign on-chain transactions."
- **Evidence:** `022_PERMISSION_MATRIX.md` §AI/Agent Authority (Hard Rule); absence of `transfer`, `sign`, `approve` tools in agent capabilities; `lib/treasury/model.ts` does not export signer functions.
- **Scope:** Public.
- **Status:** ✅ Verified (by code absence + permission matrix).
- **Last Verified:** 2026-08-30.

### TC-003 — Passport Login Does Not Require Token Transaction

- **Claim:** "Resident login uses wallet signature only; no token transfer or approval is requested."
- **Evidence:** `apps/web/lib/genesis-message.ts` (SIWE-like message; no `value` or `approve` fields); `/api/genesis/register` does not call any transfer method.
- **Scope:** Public.
- **Status:** ✅ Verified.
- **Last Verified:** 2026-08-30.

### TC-004 — Governance Is Not Token-Voting

- **Claim:** "MOOD Governance uses maintainer-reviewed governance, not token-weighted voting."
- **Evidence:** `docs/mood/governance/020_FINAL_REPORT.md` §16; `022_PERMISSION_MATRIX.md`; `future-token-vote` interface is disabled.
- **Scope:** Public.
- **Status:** ✅ Verified.
- **Last Verified:** 2026-08-30.

### TC-005 — No Private Keys, Seeds, or Mnemonics in Repository

- **Claim:** "The Moodify repository contains no private keys, seeds, mnemonics, or signing material."
- **Evidence:** `022_SECRET_INVENTORY.md` §Inventory Findings; all secrets env-backed.
- **Scope:** Public.
- **Status:** ✅ Verified (source-level).
- **Last Verified:** 2026-08-30.

### TC-006 — Public API Responses Do Not Leak Stack Traces or Secrets

- **Claim:** "Public API routes return sanitized error messages; no stack trace or secret is exposed."
- **Evidence:** Code review of `/api/protocol/transparency`, `/api/protocol/treasury*`, `/api/network/*`, `/api/protocol/genesis/*`. All return `{ error: "..." }` JSON on failure.
- **Scope:** Public.
- **Status:** ⚠️ Partial (some ad-hoc routes may not yet be reviewed; see F-011).
- **Last Verified:** 2026-08-30.

### TC-007 — Future Token Economics Are Launch-Gated

- **Claim:** "Token trading tax, holder rewards, and liquidity yield are launch-gated; they are NOT active in v1."
- **Evidence:** `lib/treasury/model.ts` `DEFAULT_DISABLED_SLOTS`; `021_ALLOCATION_POLICY.md`; `/treasury` page shows "DISABLED — Launch-gated".
- **Scope:** Public.
- **Status:** ✅ Verified.
- **Last Verified:** 2026-08-30.

### TC-008 — Independent Third-Party Security Audit

- **Claim:** "Independent third-party security audit: Not completed."
- **Evidence:** No audit report exists. `/security` page states this explicitly.
- **Scope:** Public.
- **Status:** ✅ Verified (by absence — explicitly acknowledged).
- **Last Verified:** 2026-08-30.

### TC-009 — Single-Operator Custody Risk Acknowledged

- **Claim:** "v1 Treasury custody is single-operator. Multi-sig requires an accepted MIP."
- **Evidence:** `021_TREASURY_POLICY.md` §v1 Signer Model; `/treasury` Risks section.
- **Scope:** Public.
- **Status:** ✅ Verified.
- **Last Verified:** 2026-08-30.

### TC-010 — No AI Auto-Payout, LP, or Holder Reward Distribution

- **Claim:** "MOOD has no AI-driven auto-payout, LP, or holder reward distribution."
- **Evidence:** `apps/web/lib/treasury/model.ts` (no executor functions); 021 explicitly forbids auto-execution; no `setInterval`, `setTimeout`, or `cron` in treasury code.
- **Scope:** Public.
- **Status:** ✅ Verified.
- **Last Verified:** 2026-08-30.

---

## Forbidden Claims (must NOT appear in public copy)

The following phrases are FORBIDDEN without evidence:

```text
100% secure
fully decentralized
audited by industry leaders
zero-risk
production-ready
immutable
trustless
non-custodial   (unless signed-key custody is genuinely absent)
```

If any marketing copy uses these phrases, escalate to Maintainer for correction.

---

## Re-Verification Cadence

- TC-001, TC-002, TC-007, TC-010: every release.
- TC-003, TC-004, TC-005, TC-006: per code review.
- TC-008: when audit completes (currently N/A).
- TC-009: when multi-sig migration completes (currently N/A).

---

## Reference

- `022_CONTROL_MATRIX.md`
- `022_FINDINGS.md`
- `/security` page (`apps/web/app/security/page.tsx`)
