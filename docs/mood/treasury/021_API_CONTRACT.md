# 021 — API Contract

**Date:** 2026-08-30

## Public Routes

```text
GET /api/protocol/treasury            — full treasury snapshot
GET /api/protocol/treasury/status     — minimal status payload (for /network)
```

## Maintainer Routes (NOT IMPLEMENTED in 021)

```text
POST   /api/protocol/treasury/accounts             — add account (Maintainer)
PATCH  /api/protocol/treasury/accounts/[id]        — update account (Maintainer)
POST   /api/protocol/treasury/accounts/[id]/pause  — pause account
POST   /api/protocol/treasury/executions/propose   — propose execution (Maintainer)
POST   /api/protocol/treasury/executions/[id]/approve — approve execution
POST   /api/protocol/treasury/executions/[id]/execute — execute (manual, off-API)
```

> ⚠️ 021 implements ONLY the public read routes.
> Maintainer write routes are explicitly OUT OF SCOPE for 021.

---

## GET /api/protocol/treasury

### Response (200)

```json
{
  "schema": "moodify-treasury-v1",
  "generatedAt": "2026-08-30T...",
  "treasuryStatus": "inactive",
  "accounts": [],
  "assets": [],
  "revenue": [
    { "source": "Protocol Service Revenue", "status": "PLANNED", "realizedThisPeriod": null },
    { "source": "Future Trading Tax", "status": "FUTURE / LAUNCH-GATED", "realizedThisPeriod": null }
  ],
  "allocations": [
    { "category": "Protocol Development", "status": "ENABLED" },
    { "category": "Liquidity", "status": "DISABLED", "reason": "Launch-gated" }
  ],
  "executions": [],
  "reconciliation": {
    "verified": 0,
    "mismatch": 0,
    "unavailable": 0,
    "stale": 0,
    "mismatches": []
  },
  "risks": [
    "Single-operator custody",
    "No valuation oracle",
    "Circulating supply methodology not yet published"
  ],
  "governanceRefs": ["docs/mood/governance/020_FINAL_REPORT.md"],
  "notes": "Treasury is currently in inactive state. No real protocol-controlled funds exist."
}
```

### Response (500)

```json
{
  "error": "Failed to generate treasury data",
  "schema": "moodify-treasury-v1",
  "generatedAt": "..."
}
```

---

## GET /api/protocol/treasury/status

Minimal payload for `/network` integration.

### Response (200)

```json
{
  "schema": "moodify-treasury-status-v1",
  "generatedAt": "...",
  "treasuryStatus": "inactive",
  "verifiedAccounts": 0,
  "lastReport": null,
  "lastActivity": null,
  "economics": "Launch-Gated",
  "disabledSlots": ["liquidity", "holder-rewards", "token-reserve"]
}
```

### Response (500)

```json
{
  "error": "...",
  "schema": "moodify-treasury-status-v1",
  "treasuryStatus": "unavailable",
  "verifiedAccounts": 0,
  "lastReport": null,
  "lastActivity": null,
  "economics": "Unknown"
}
```

---

## Forbidden Routes (must NOT exist)

```text
POST  /api/protocol/treasury/transfer            — NO auto-transfer
POST  /api/protocol/treasury/execute             — NO auto-execute
POST  /api/protocol/treasury/auto-allocate       — NO auto-allocation
POST  /api/protocol/treasury/tax-configure       — NO token tax config
POST  /api/protocol/treasury/lp                  — NO LP automation
POST  /api/protocol/treasury/holder-rewards      — NO holder rewards
```

---

## Caching

- `GET /api/protocol/treasury`: `s-maxage=60, stale-while-revalidate=300`.
- `GET /api/protocol/treasury/status`: `s-maxage=30, stale-while-revalidate=120`.

---

## Security Headers

- All responses: `Content-Type: application/json`.
- No CORS credentials.
- No third-party cookies.
