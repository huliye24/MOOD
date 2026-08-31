# 023 — Test Plan

**Date:** 2026-08-30

## Test Layers

1. **Smoke** — `curl` against core routes
2. **API E2E** — Playwright `request` against API endpoints
3. **UI E2E** — Playwright `page` against browser-rendered pages
4. **Failure E2E** — Explicit negative cases
5. **Mobile** — Viewport tests
6. **Token regression** — Site-wide phrase scan

## Test Files

```text
e2e/staging/
├── 01-anonymous-browse.spec.ts
├── 02-identity-flow.spec.ts
├── 03-treasury-read.spec.ts
├── 04-security-status.spec.ts
├── 05-token-regression.spec.ts
└── 06-mobile-responsive.spec.ts
```

## Run Commands

```bash
# Set staging URL
export STAGING_URL=https://staging.<domain>

# Run all E2E
npx playwright test e2e/staging/

# Run specific layer
npx playwright test e2e/staging/01-anonymous-browse.spec.ts

# Run with browser visible
npx playwright test --headed

# Generate report
npx playwright show-report
```

## Pass Criteria

- All 6 spec files: 0 failures
- Exit code 0

## Failure → BLOCKED

Any test failure requires:

- Open issue in `023_ISSUE_REGISTER.md`
- Severity P0/P1 → re-verify security gate SG0/SG1
- If security regression: revert to `BLOCKED_BY_MOOD_SECURITY_022`

## Coverage Matrix

| Journey | Spec File |
|---|---|
| Anonymous Browse | 01-anonymous-browse.spec.ts |
| Wallet Connect | 02-identity-flow.spec.ts |
| Contribution | (TBD — requires authenticated test wallet) |
| Governance | 02-identity-flow.spec.ts (partial) |
| Treasury Read | 03-treasury-read.spec.ts |
| Security | 04-security-status.spec.ts |
| Mobile | 06-mobile-responsive.spec.ts |
| Token Regression | 05-token-regression.spec.ts |

## Reference

- `023_E2E_JOURNEYS.md`
- `023_DEPLOYMENT_PLAN.md`
- `023_ISSUE_REGISTER.md`