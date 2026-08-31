# 023 — Staging Environment Contract

**Date:** 2026-08-30

## Gate 0 Result

Reading `docs/mood/security/022_FINAL_REPORT.md`:

```text
SG0: ✅
SG1: ⚠️ Open
SG5: ❌ (must close)
SG6: ❌ (must close)
SG10: ✅
Overall: CONDITIONAL
```

Per 022 FINAL_REPORT §Handoff to 023:

> Maintainer must accept SG1/SG5/SG6/SG7 as open OR mandate closure before 023.

This document is the staging FRAMEWORK, prepared for Maintainer acceptance of the conditional status. Actual deployment is contingent on Maintainer acceptance.

## Staging Environment Identifier

```text
MOOD_ENV=staging
MOOD_LAUNCH_STATE=staging
NODE_ENV=production   (Next.js)
```

## Banner

Every staging page MUST show:

```text
MOOD STAGING — Not Production — Token Economy Disabled
```

Plus per-footer version block:

```text
Environment: Staging
Build Commit: <sha>
Build Time:   <iso>
Launch State: staging
Protocol Version: 023-staging
```

## Allowed Features (in staging)

- Wallet login (Resident signature)
- MOOD Passport
- Contribution Network submit / review
- Network Observatory
- Agents Registry (read-only public + Maintainer-managed)
- Nodes Registry (read-only public + Maintainer-managed)
- Governance / MIP (read-only public + Maintainer-managed)
- Treasury transparency (`/treasury` shows inactive state)
- `/security` page
- Health endpoints

## Disabled Features (in staging)

- Token deployment
- Token Claim
- DEX / PancakeSwap
- Holder Rewards
- Liquidity Provision
- Treasury fund execution (no transfer API)
- Auto-payout cron
- Token Tax configuration
- AI signer authority
- Real on-chain signing

Any unknown launch state MUST fail closed (return error, do NOT execute).

## Environment Variables (required)

```text
MOOD_ENV=staging
MOOD_LAUNCH_STATE=staging
DATABASE_URL=                       # staging DB, isolated
SESSION_SECRET=                     # staging-specific
BSC_RPC_URL=                        # public BSC RPC OK
```

`.env.example` (placeholder only, NO real secrets):

```text
MOOD_ENV=staging
MOOD_LAUNCH_STATE=staging
DATABASE_URL=sqlite://./staging.db
SESSION_SECRET=replace-me-with-staging-only-secret
BSC_RPC_URL=https://bsc-dataseed.binance.org
```

## Verification at Boot

A staging instance MUST refuse to boot if:

- `MOOD_ENV !== "staging"` AND no override flag set
- `MOOD_LAUNCH_STATE !== "staging"` AND no override flag set
- `DATABASE_URL` points to a known production DB
- Real `SESSION_SECRET` from production is detected (must be staging-specific)

## Database Isolation

- Staging DB is SEPARATE from production.
- Seeded with synthetic data only.
- No real Treasury / Genesis data migrated.
- Reset / cleanup is environment-guarded.

## noindex / SEO

```html
<meta name="robots" content="noindex, nofollow">
```

Staging MUST NOT be indexed by search engines.

## Reference

- `023_DEPLOYMENT_PLAN.md`
- `023_DATA_POLICY.md`
- `023_ROLLBACK_PLAN.md`
- `docs/mood/security/022_STAGING_SECURITY_GATE.md`