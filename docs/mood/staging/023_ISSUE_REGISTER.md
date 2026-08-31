# 023 — Issue Register

**Date:** 2026-08-30

## Format

```text
ID
Severity
Area
Steps to Reproduce
Expected
Actual
Owner
Status
Blocker for 024?
```

## Pre-Registered Known Issues

### ISS-001 — Sandbox Cannot Run Build/Deploy

- **Severity:** P3 (process limitation, not product defect)
- **Area:** Deployment
- **Steps:** Run `npm install` / `npm run build` in this sandbox.
- **Expected:** Build succeeds.
- **Actual:** Sandbox lacks network/install permissions for npm operations.
- **Owner:** Maintainer
- **Status:** Open
- **Blocker for 024:** No (Maintainer runs build/deploy outside sandbox).

### ISS-002 — 022 Staging Gate CONDITIONAL

- **Severity:** P1 (security gate status)
- **Area:** Security
- **Steps:** Read `docs/mood/security/022_FINAL_REPORT.md`.
- **Expected:** STAGING_ALLOWED.
- **Actual:** SG1/SG5/SG6/SG7 are open.
- **Owner:** Maintainer
- **Status:** Open (Conditional accepted by 022 final report handoff).
- **Blocker for 024:** No (documented in handoff).

### ISS-003 — Prior FINAL_REPORTs (015-019) Not in Main Worktree

- **Severity:** P3
- **Area:** Documentation
- **Steps:** Check `docs/mood/{passport,contribution,network,agents,nodes}/*_FINAL_REPORT.md`.
- **Expected:** All present.
- **Actual:** Only `treasury/021_FINAL_REPORT.md` and `governance/020_FINAL_REPORT.md` exist in main worktree.
- **Owner:** Maintainer
- **Status:** Open
- **Blocker for 024:** No (code-level review used for 022).

## Issues to Add On-Demand

```text
### ISS-NNN — <title>

- Severity:
- Area:
- Steps to Reproduce:
- Expected:
- Actual:
- Owner:
- Status:
- Blocker for 024:
```

## Reference

- `docs/mood/security/022_FINDINGS.md`
- `023_E2E_JOURNEYS.md`