# 021 — Reconciliation Policy

**Date:** 2026-08-30

## Reconciliation Flow

```text
Configured Account Balance
        ↓
RPC / Explorer Read
        ↓
Compare
        ↓
Verified / Mismatch / Unavailable / Stale
```

---

## Status Semantics

| Status | Meaning | Action |
|---|---|---|
| `verified` | On-chain read matches configured + cached | Display with confidence |
| `mismatch` | On-chain differs from config OR cache | Display both, label, defer to maintainer |
| `unavailable` | RPC failed; no value | Hide value, show "RPC unavailable" |
| `stale` | Read older than 24h threshold | Show with warning |

---

## Read Sources

```text
1. Config (static, deploy-time)
2. RPC (live on-chain)
3. Cache (last successful read with timestamp)
```

Reconciliation compares the most recent cached read with the next live read.

---

## Mismatch Resolution

A mismatch is NEVER auto-corrected.

Steps:

```text
1. Show config value, RPC value, last-cached value, all with timestamps.
2. Log discrepancy event in audit trail.
3. Notify maintainer.
4. Do NOT silently overwrite config.
```

Manual correction requires:

- Maintainer action
- Recorded rationale
- Linked MIP if policy-related

---

## Staleness Threshold

- Default: 24 hours.
- Critical accounts (active Treasury): 1 hour.
- Observed / inactive: 7 days acceptable (rarely updated).

---

## Display Format

```text
Account:      [name]
Chain:        [chain]
Address:      [0x...]
Balance:      [verified quantity] [symbol]
Source:       rpc (updated YYYY-MM-DDTHH:MM:SSZ)
Status:       Verified
Stale:        No
```

For mismatch:

```text
Account:      [name]
Status:       MISMATCH
Config:       X
RPC:          Y
Cached:       Z
Last RPC:     YYYY-MM-DDTHH:MM:SSZ
Last Cache:   YYYY-MM-DDTHH:MM:SSZ
Action:       Pending Maintainer Review
```

For unavailable:

```text
Account:      [name]
Status:       Unavailable
Reason:       [RPC error]
Last Known:   YYYY-MM-DDTHH:MM:SSZ ([value])
```

---

## What 021 Does NOT Do

- Auto-correct discrepancies.
- Auto-failover to cached values.
- Re-classify accounts without audit.
- Re-attribute balances between categories.
