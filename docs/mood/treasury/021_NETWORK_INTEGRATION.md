# 021 — Network Integration

**Date:** 2026-08-30

## Goal

Surface treasury status in `/network` (017 Observatory) WITHOUT exposing sensitive data.

---

## Metrics Exposed

```text
Treasury Status               (inactive | observed | policy-ready | active | paused)
Verified Treasury Accounts    (count of accounts with status=active and verified)
Last Treasury Report          (ISO timestamp; null if no report yet)
Last Treasury Activity        (ISO timestamp; null if no execution yet)
Disabled Launch-Gated Slots   (count: liquidity + holder-rewards + token-reserve)
Future Economics Status       (Launch-Gated / Not Activated)
```

These metrics MUST come from real queries of the registry. No hard-coded values.

---

## When Treasury is `inactive`

```text
Treasury Status:    Not Activated
Verified Accounts:  0
Last Report:        —
Last Activity:      —
Economics:          Launch-Gated
```

This is HONEST and aligns with the actual empty state.

---

## Implementation

`/network` page (`apps/web/app/network/page.tsx`) consumes `/api/network/overview` (and a treasury status subroute when present).

For 021, we expose treasury status via:

```text
GET /api/protocol/treasury   → main treasury data
GET /api/protocol/treasury/status  → minimal status payload for /network
```

The network aggregator reads treasury status (if available) and merges into the overview payload.

If no treasury status route exists yet, `/network` shows:

```text
Treasury Status:    Not Activated
```

without crashing.

---

## Display

In `/network` page:

```text
Treasury Module
  ├── Status: Not Activated
  ├── Verified Accounts: 0
  ├── Last Report: —
  ├── Economics: Launch-Gated
  └── [View Treasury →]   (link to /treasury)
```

---

## What 021 Does NOT Expose to /network

- Account addresses.
- Individual balances.
- Execution list.
- Allocation categories.
- Maintainer identity.

These belong on `/treasury`, not on `/network`.

---

## Failure Modes

If `/api/protocol/treasury/status` is unreachable:

- `/network` shows "Treasury status unavailable" with last-known timestamp.
- Does NOT crash.
- Does NOT show fake data.

---

## Reference

- `apps/web/app/network/page.tsx`
- `apps/web/components/network-health-monitor.tsx`
- `apps/web/components/network-activity-feed.tsx`
