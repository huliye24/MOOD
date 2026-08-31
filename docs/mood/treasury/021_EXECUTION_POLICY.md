# 021 — Execution Policy

**Date:** 2026-08-30

## Execution Action Types

```text
transfer     — Move funds between accounts
receive      — Record inbound transaction
allocate     — Allocate funds to category
reconcile    — Mark account reconciliation status
pause        — Pause an account
```

---

## Execution Record Model

```ts
type ExecutionStatus =
  | "proposed"   // Initial creation, awaiting approval
  | "approved"   // Approved but not yet executed
  | "executed"   // Real on-chain evidence recorded
  | "failed"     // Execution attempted but failed
  | "cancelled"; // Cancelled before execution

interface TreasuryExecution {
  id: string;
  accountId: string;
  action: "transfer" | "receive" | "allocate" | "reconcile" | "pause";
  assetId?: string;
  amount?: string;            // Raw chain quantity
  destination?: string;
  reason: string;             // Required human-readable
  governanceRef?: string;     // MIP-XXX or Policy-XXX
  actorIds: string[];         // Proposer + Approver + Executor
  txHash?: string;            // Real on-chain hash if executed
  status: ExecutionStatus;
  createdAt: string;
  executedAt?: string;
  evidence?: {
    blockNumber?: string;
    blockExplorerUrl?: string;
    screenshotRef?: string;
  };
}
```

---

## Authority Model

| Role | Allowed Actions |
|---|---|
| Proposer | Create `proposed` |
| Approver | `proposed → approved` |
| Executor | `approved → executed` (with tx evidence) |
| Pauser | `any → paused` (emergency) |
| Auditor | Read-only |

---

## Evidence Requirements

For an execution to be marked `executed`:

```text
1. txHash present (from on-chain source)
2. blockNumber present
3. blockExplorerUrl constructed
4. executedAt ISO timestamp
5. actorIds includes Executor
6. governanceRef cites MIP or Policy
```

If any of the above is missing, status MUST be `proposed` or `approved`, NEVER `executed`.

---

## Hard Rules (no override)

- 021 does NOT implement auto-execution.
- 021 does NOT implement cron-based execution.
- 021 does NOT implement AI-driven transfer.
- 021 does NOT implement `transfer` API endpoint.
- All execution is MANUAL with documented human approval.

---

## Reconciliation Link

Every `transfer` execution MUST trigger a subsequent `reconcile` execution comparing:

```text
Expected post-balance (from account config)
  vs
Actual on-chain balance (from RPC)
  vs
Last-known balance (cached)
```

Status:

- `verified` — all match
- `mismatch` — discrepancy found
- `unavailable` — RPC failed
- `stale` — read older than 24h

---

## Display

For each execution, public view shows:

```text
Action:       transfer
Account:      protocol-treasury-001 (when active)
Amount:       1.5 BNB (or "Amount not displayed for privacy")
Destination:  0xAB...CD (or "Internal allocation")
Reason:       "Q3 Security Audit Engagement"
Governance:   MIP-TREASURY-007
Tx Hash:      0x... (BscScan link)
Status:       executed
Date:         2026-09-15T10:30:00Z
```

If status is `proposed`, `approved`, `failed`, or `cancelled`, the page shows the state but explicitly notes that funds have not moved.

---

## What 021 Does NOT Implement

- A real `POST /api/treasury/transfer` endpoint.
- A real `POST /api/treasury/execute` endpoint.
- A cron job that runs allocations.
- An AI trigger for payouts.

These belong to a future package with explicit safety review (likely 022 Security & Trust Layer).
