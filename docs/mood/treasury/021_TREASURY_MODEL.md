# 021 — Treasury Model (TypeScript)

**Date:** 2026-08-30

This is the canonical TypeScript model used by the 021 read-only API and `/treasury` page.

---

## Account Types

```ts
export type TreasuryAccountType =
  | "protocol"
  | "operations"
  | "grants"
  | "liquidity"
  | "rewards"
  | "reserve"
  | "legacy";

export type TreasuryAccountStatus =
  | "inactive"
  | "observed"
  | "policy-ready"
  | "active"
  | "paused"
  | "retired";

export type ControlModel = "EOA" | "Safe" | "Multisig" | "Contract" | "Unknown";

export interface TreasuryAccountRecord {
  id: string;
  name: string;
  type: TreasuryAccountType;
  chain?: string;
  address?: string;
  status: TreasuryAccountStatus;
  public: boolean;
  controlModel?: ControlModel;
  authorityPolicy?: string;   // MIP reference
  createdAt: string;
  updatedAt: string;
  notes?: string;
}
```

---

## Asset Model

```ts
export type AssetType = "native" | "stable" | "future-mood" | "lp" | "other";
export type AssetVerificationState = "verified" | "unverified" | "unavailable";

export interface TreasuryAssetPosition {
  accountId: string;
  assetId: string;
  assetType: AssetType;
  chain?: string;
  contractAddress?: `0x${string}`;
  quantity?: string;
  valuationUsd?: string | null;
  valuationSource?: string;
  observedAt: string;
  verificationState: AssetVerificationState;
}
```

---

## Revenue Model

```ts
export type RevenueSourceStatus = "ACTIVE" | "PLANNED" | "FUTURE / LAUNCH-GATED";

export interface RevenueSource {
  source: string;
  status: RevenueSourceStatus;
  realizedThisPeriod?: string | null;
  notes?: string;
}
```

---

## Allocation Model

```ts
export type AllocationStatus = "ENABLED" | "DISABLED";

export interface AllocationCategory {
  category: string;
  status: AllocationStatus;
  allocatedThisPeriod?: string | null;
  governanceRef?: string;
  reason?: string;
}
```

---

## Execution Model

```ts
export type ExecutionAction =
  | "transfer" | "receive" | "allocate" | "reconcile" | "pause";

export type ExecutionStatus =
  | "proposed" | "approved" | "executed" | "failed" | "cancelled";

export interface TreasuryExecution {
  id: string;
  accountId: string;
  action: ExecutionAction;
  assetId?: string;
  amount?: string;
  destination?: string;
  reason: string;
  governanceRef?: string;
  actorIds: string[];
  txHash?: string;
  status: ExecutionStatus;
  createdAt: string;
  executedAt?: string;
}
```

---

## Reconciliation Model

```ts
export type ReconciliationStatus = "verified" | "mismatch" | "unavailable" | "stale";

export interface ReconciliationReport {
  verified: number;
  mismatch: number;
  unavailable: number;
  stale: number;
  mismatches: Array<{
    accountId: string;
    config: string;
    rpc: string;
    cached: string;
    note?: string;
  }>;
}
```

---

## Snapshot Model

```ts
export type TreasuryActivationState =
  | "inactive" | "observed" | "policy-ready" | "active" | "paused";

export interface TreasurySnapshot {
  schema: "moodify-treasury-v1";
  generatedAt: string;
  treasuryStatus: TreasuryActivationState;
  accounts: TreasuryAccountRecord[];
  assets: TreasuryAssetPosition[];
  revenue: RevenueSource[];
  allocations: AllocationCategory[];
  executions: TreasuryExecution[];
  reconciliation: ReconciliationReport;
  risks: string[];
  governanceRefs: string[];
  notes?: string;
}
```

---

## Status Payload (for /network)

```ts
export interface TreasuryStatusPayload {
  schema: "moodify-treasury-status-v1";
  generatedAt: string;
  treasuryStatus: TreasuryActivationState | "unavailable";
  verifiedAccounts: number;
  lastReport: string | null;
  lastActivity: string | null;
  economics: "Launch-Gated" | "Not Activated" | "Active";
  disabledSlots: string[];
}
```

---

## Hard Defaults (v1)

```ts
export const DEFAULT_TREASURY_STATUS: TreasuryActivationState = "inactive";
export const DEFAULT_ECONOMICS: "Launch-Gated" = "Launch-Gated";
export const DEFAULT_DISABLED_SLOTS: string[] = [
  "liquidity",
  "holder-rewards",
  "token-reserve",
];
export const DEFAULT_RISKS: string[] = [
  "Single-operator custody",
  "No approved valuation oracle",
  "Circulating supply methodology not yet published",
  "Treasury inactive — no execution authority available",
];
```
