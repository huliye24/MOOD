# 021 — Revenue Model

**Date:** 2026-08-30

## Revenue Source Categories

```text
Protocol Service Revenue
Application Revenue
API Revenue
Node Fees
Donations
Grants
Future Trading Tax         (launch-gated)
Future Holder Reward Pool  (launch-gated)
Future Liquidity Yield     (launch-gated)
Other Governance-approved Sources
```

---

## Status Labels

| Status | Meaning |
|---|---|
| `ACTIVE` | Currently generating revenue |
| `PLANNED` | Designed but not yet operational |
| `FUTURE / LAUNCH-GATED` | Blocked until Launch Gate (024/025) |

---

## Current Status (v1)

| Source | Status | Notes |
|---|---|---|
| Protocol Service Revenue | PLANNED | No production traffic yet |
| Application Revenue | PLANNED | Application shell exists; no paid features |
| API Revenue | PLANNED | Read-only public APIs; no paid tier |
| Node Fees | PLANNED | Node registry exists; fees not collected |
| Donations | PLANNED | Support intents exist (`supportIntents` table); no settlement yet |
| Grants | PLANNED | Contribution reward system exists; rewards not token-distributed |
| Future Trading Tax | FUTURE / LAUNCH-GATED | Blocked until 024/025 |
| Future Holder Reward Pool | FUTURE / LAUNCH-GATED | Blocked until 024/025 |
| Future Liquidity Yield | FUTURE / LAUNCH-GATED | Blocked until 024/025 |

---

## Hard Rules

- 021 must NOT show any revenue figure that has no real source.
- 021 must NOT mark `FUTURE / LAUNCH-GATED` revenue as ACTIVE.
- If RPC, accounting system, or pricing source is unavailable, status becomes `unavailable`, NOT zero.
- Revenue data is read-only; no execution hooks.

---

## What 021 Does Not Implement

- Token tax collection logic.
- Holder reward distribution.
- Liquidity fee harvesting.
- AI-driven revenue allocation.
- Auto-conversion between revenue categories.

These belong to separate packages with higher safety requirements.

---

## Reporting

Monthly treasury reports will record:

```text
Revenue Category | Status | Realized (if any) | Notes
```

If no realized revenue in a category, the row is present but value is `Not realized this period`.

021 does NOT generate revenue figures from thin air.
