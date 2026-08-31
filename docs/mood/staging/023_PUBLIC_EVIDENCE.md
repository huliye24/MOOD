# 023 — Public Evidence Template

**Date:** 2026-08-30

> This template is the minimum evidence 023 must produce on staging promotion.

## Required Evidence

### 1. Deployment Provenance

```text
- staging_url:            <url>
- build_commit:           <sha>
- build_time:             <iso>
- environment:            staging
- launch_state:           staging
- deployer:               <name or bot>
- deployment_id:          <id>
- previous_known_good:    <sha>
```

### 2. Health Snapshot

```text
GET /api/health            → 200, status: ok, environment: staging
GET /api/network/health    → 200, status: operational
GET /api/security/status   → 200, schema: moodify-security-status-v1
GET /api/protocol/treasury → 200, treasuryStatus: inactive
GET /api/protocol/treasury/status → 200, economics: Launch-Gated
```

### 3. E2E Run Evidence

```text
- spec:        01-anonymous-browse.spec.ts
- result:      PASS / FAIL
- duration:    <seconds>
- exit_code:   0 / 1

(repeat for each spec)
```

### 4. Token Regression Evidence

```text
- scan_pages:    7 routes
- forbidden_phrases: 9 patterns
- matches_found: 0
- exit_code: 0
```

### 5. Failure Case Evidence

```text
F-01 invalid signature       → 401 (expected)
F-02 expired nonce           → 401 (expected)
F-03 unauth contribution     → 401 (expected)
F-04 self-review             → 403 (expected)
F-05 non-reviewer accept     → 403 (expected)
F-06 MIP author self-accept  → 403 (expected)
F-07 treasury transfer POST  → 404 (expected)
F-08 token regression scan   → 0 matches (expected)
```

### 6. Mobile Evidence

```text
390x844  → 0 horizontal overflow across 6 routes
768x1024 → 0 horizontal overflow across 6 routes
1280x720 → 0 horizontal overflow across 6 routes
```

### 7. Environment Banner

```text
Staging page contains:
  - "MOOD STAGING"
  - "Not Production"
  - "Token Economy Disabled"
  - meta robots: noindex, nofollow
```

---

## Honest Reporting

023 must NOT claim PASS if any of the above is missing or fails.

If a test cannot run in the sandbox (e.g., `npm install` not available), document this explicitly and return PARTIAL.

---

## Reference

- `023_FINAL_REPORT.md`
- `023_E2E_JOURNEYS.md`
- `023_TEST_PLAN.md`
- `023_ISSUE_REGISTER.md`