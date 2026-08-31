# 022 — Findings Register

**Date:** 2026-08-30

## Severity Model

```text
P0  Critical
P1  High
P2  Medium
P3  Low
Info
```

## Findings

### F-001 — Single-Maintainer Custody (Treasury)

- **Severity:** P0 (per Trust Boundary H-06, but acceptable because Treasury is currently inactive)
- **Status:** Open (Acknowledged)
- **Affected:** 021 Treasury
- **Mitigation (v1):** Treasury inactive; no execution authority available
- **Mitigation (planned):** Multi-sig migration via MIP with category=treasury
- **Reference:** `docs/mood/treasury/021_TREASURY_POLICY.md`, `021_HANDOFF_022.md`

### F-002 — No MFA on Maintainer Class

- **Severity:** P1
- **Status:** Open (Acknowledged)
- **Affected:** 020 Governance, 021 Treasury
- **Mitigation:** Out-of-scope for v1; deferred to post-launch Maintainer hardening
- **Reference:** `022_PERMISSION_MATRIX.md` §v1 Honest Limitations

### F-003 — No Multi-Sig on Treasury

- **Severity:** P1
- **Status:** Open (Deferred)
- **Affected:** 021 Treasury
- **Mitigation:** Multi-sig requires MIP; not implemented in v1

### F-004 — Public Mutation Endpoints Require Manual Auth Audit

- **Severity:** P1
- **Status:** Open
- **Affected:** cross-package
- **Mitigation (planned):** 023 staging requires manual review of every POST/PATCH/DELETE route
- **Reference:** `022_TRUST_BOUNDARIES.md` H-01, H-02

### F-005 — No Rate Limiting on Public Mutation Endpoints

- **Severity:** P1
- **Status:** Open
- **Affected:** cross-package
- **Mitigation (planned):** Edge / middleware rate limit for 023
- **Reference:** `022_STAGING_SECURITY_GATE.md` SG5

### F-006 — Markdown Rendering Without Strict Sanitization

- **Severity:** P1
- **Status:** Open
- **Affected:** 016 Contribution, 020 Governance (MIP body)
- **Mitigation:** Sanitize Markdown → safe HTML; avoid raw HTML pass-through
- **Reference:** Threat T20

### F-007 — CSP Not Configured

- **Severity:** P1
- **Status:** Open
- **Affected:** web app
- **Mitigation (planned):** Add CSP via `next.config.js` headers; start in report-only
- **Reference:** `022_STAGING_SECURITY_GATE.md` SG6

### F-008 — Node Public API May Expose Internal Hostname (Unverified)

- **Severity:** P1
- **Status:** Open (Unverified in this session)
- **Affected:** 019 Nodes
- **Mitigation:** Review `apps/web/app/nodes/api/[id]/route.ts`; strip internal hostnames; deny SSH exposure
- **Reference:** `022_PERMISSION_MATRIX.md` §Node Operator

### F-009 — Agent Could Inherit Transfer Authority If Mis-Configured

- **Severity:** P0 (potential)
- **Status:** Mitigated by absence
- **Affected:** 018 Agents
- **Mitigation:** No agent capability includes `transfer`, `sign`, `approve`. Verified by code grep.

### F-010 — MIP Author Cannot Self-Accept (Hard Rule)

- **Severity:** Info
- **Status:** Mitigated by code rule
- **Affected:** 020 Governance
- **Mitigation:** API rejects `mipId where authorId === acceptorId`

### F-011 — Public API Errors May Include Stack Trace

- **Severity:** P2
- **Status:** Partially Mitigated
- **Affected:** cross-package
- **Mitigation:** Existing routes return sanitized `{ error: "..." }` JSON. Some ad-hoc routes may still leak.
- **Reference:** `022_STAGING_SECURITY_GATE.md` SG8

### F-012 — No Automated Secret Rotation

- **Severity:** P2
- **Status:** Open (Deferred)
- **Mitigation:** Manual rotation; documented in `022_INCIDENT_RESPONSE.md`

### F-013 — No Third-Party Audit Completed

- **Severity:** Info
- **Status:** Acknowledged
- **Mitigation:** 022 explicitly states "Independent third-party audit: Not completed" on `/security`

### F-014 — No Webhook Signature Verification (Future Integrations)

- **Severity:** P3
- **Status:** Open
- **Mitigation:** Add HMAC verification when webhooks are introduced

---

## P0 / P1 Status for 023 Staging

```text
P0 Open:           F-001 (Acknowledged; Treasury inactive mitigates)
P1 Open:           F-002, F-003, F-004, F-005, F-006, F-007, F-008
P1 Internet-exploitable:  None confirmed at this stage
```

Per Staging Gate SG0/SG1:

- F-001 does NOT block because Treasury is inactive (no funds at risk).
- F-002 / F-003 do NOT block because no execution authority exists for v1.
- F-004..F-008 MUST be addressed before 023 staging promotion OR explicitly accepted by Maintainer as known-with-mitigation.

Recommended path: address F-005 (rate limit), F-007 (CSP), F-011 (error sanitization) before 023; defer F-002/F-003/F-008 to post-023 hardening pass.

---

## Resolution Path

Each finding follows:

```text
Open → Mitigated → Verified → Closed
```

A finding is CLOSED only when:

1. Mitigation implemented
2. Evidence recorded (test / config / review note)
3. Maintainer accepted

022 keeps findings OPEN if mitigation is partial or deferred.
