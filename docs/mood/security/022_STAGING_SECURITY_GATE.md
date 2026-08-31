# 022 — Staging Security Gate

**Date:** 2026-08-30

## Purpose

Defines the SG0–SG10 gates that 023 Public Staging must satisfy before promotion.

## Gate Catalog

### SG0 — No P0 Open

- **Status:** ✅
- **Evidence:** `022_FINDINGS.md` §P0/P1 Status for 023 Staging; F-001 mitigated by Treasury inactive.

### SG1 — No Internet-Exploitable P1

- **Status:** ⚠️
- **Evidence:** F-005 (rate limit), F-006 (markdown sanitization), F-007 (CSP) — must close or be accepted before 023.
- **Recommendation:** Address F-005, F-006, F-007 before 023 promotion.

### SG2 — Auth/Session Controls Verified

- **Status:** ⚠️
- **Evidence:** Code review of `apps/web/lib/genesis-*.ts` and `apps/web/app/api/genesis/*` required.
- **Action:** 023 maintainer must perform and document review.

### SG3 — Admin/Reviewer/Operator APIs Fail Closed

- **Status:** ⚠️
- **Evidence:** All mutation routes (POST/PATCH/DELETE) must require explicit authentication. No anonymous mutation.
- **Action:** Code audit checklist required for 023.

### SG4 — No Secrets in Repository / Public Bundle

- **Status:** ✅
- **Evidence:** `022_SECRET_INVENTORY.md`; static review.
- **Recommendation:** Run `gitleaks` / `trufflehog` against full git history before staging.

### SG5 — Rate Limiting Strategy Active for Exposed Mutation Endpoints

- **Status:** ❌
- **Action:** Implement edge / middleware rate limit before 023 promotion.

### SG6 — Security Headers Baseline

- **Status:** ❌
- **Action:** Configure CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

### SG7 — Public Serializers Reviewed

- **Status:** �️
- **Evidence:** F-008 (Node API may expose internal hostname).
- **Action:** Review every public serializer; ensure no SSH / internal hostname / credential leaks.

### SG8 — Incident Response Published

- **Status:** ✅
- **Evidence:** `022_INCIDENT_RESPONSE.md` exists.

### SG9 — Security Page Honest

- **Status:** ✅
- **Evidence:** `/security` page (to be created) explicitly states audit-not-completed, single-operator custody, etc.

### SG10 — Treasury / Token Write Paths Remain Disabled

- **Status:** ✅
- **Evidence:** 021 has no transfer/execute API; no auto-payout; no AI signer.

---

## Promotion Decision

023 Public Staging is **READY** when:

```text
SG0 ✅
SG1 ✅ or accepted by Maintainer
SG2 ✅
SG3 ✅
SG4 ✅
SG5 ✅
SG6 ✅
SG7 ✅
SG8 ✅
SG9 ✅
SG10 ✅
```

If SG5, SG6, or SG7 are open at promotion time, staging is **CONDITIONAL**:

- Maintainer must record acceptance with rationale.
- Document expected mitigation date.
- Track in `022_FINDINGS.md`.

If SG0 is open at promotion time, promotion is **BLOCKED**:

```text
023_PUBLIC_STAGING_BLOCKED
```

---

## Reference

- `022_CONTROL_MATRIX.md`
- `022_FINDINGS.md`
- `022_SYSTEM_THREAT_MODEL.md`
