# 021 — Test Plan

**Date:** 2026-08-30

## INV-021-01
Treasury 默认不是 active，除非真实授权。

**Test**: `getTreasurySnapshot()` returns `treasuryStatus = "inactive"` when config is empty.

## INV-021-02
Candidate wallet 不会自动变 Treasury。

**Test**: Adding an account with `status: "observed"` does NOT change `treasuryStatus` to active.

## INV-021-03
Public API 不泄露 private keys / credentials。

**Test**: `GET /api/protocol/treasury` response contains no `privateKey`, `seed`, `mnemonic`, `process.env.*` reference.

## INV-021-04
Executed action 必须有真实 execution evidence。

**Test**: Any execution with `status: "executed"` MUST have `txHash`, `executedAt`, `actorIds[]`.

## INV-021-05
AI 无资金执行权限。

**Test**: API routes contain no `transfer`, `execute`, `approve`, or `autoAllocate` POST endpoints.

## INV-021-06
Launch-gated Token revenue 不显示为 active。

**Test**: `Future Trading Tax`, `Future Holder Reward Pool`, `Future Liquidity Yield` all return `status: "FUTURE / LAUNCH-GATED"`.

## INV-021-07
Unknown valuation 不伪造 USD value。

**Test**: When `verificationState = "unavailable"`, `valuationUsd` MUST be `null`.

## INV-021-08
Balance mismatch 显式显示。

**Test**: When config and RPC differ, reconciliation returns `mismatch > 0` with both values.

## INV-021-09
Treasury policy change 可关联 MIP。

**Test**: Each allocation entry has `governanceRef` field; non-routine allocations reference MIP ID.

## INV-021-10
Public page 在没有 Treasury 时仍可正常渲染。

**Test**: `/treasury` page renders with `treasuryStatus: "inactive"` without crashing.

## INV-021-11
No automatic payout / LP / Holder Reward execution.

**Test**: API grep returns no `setInterval`, `setTimeout`, `cron`, `auto-transfer` in treasury code.

## INV-021-12
021 不依赖未来 MOOD Token。

**Test**: Treasury snapshot can be generated with `treasuryStatus: "inactive"` and no `future-mood` assets present.

---

## Manual Test Scenarios

### Scenario 1: Empty State

```bash
# 1. /treasury page renders without errors.
# 2. Hero shows "Treasury Status: Not Activated".
# 3. /api/protocol/treasury returns 200 with empty accounts.
# 4. /api/protocol/treasury/status returns treasuryStatus: "inactive".
```

### Scenario 2: No RPC Available

```bash
# 1. RPC endpoint offline.
# 2. /api/protocol/treasury returns 200 with verificationState: "unavailable".
# 3. Page shows "RPC unavailable, balance hidden".
# 4. No crash.
```

### Scenario 3: Forbidden Route Attempt

```bash
# 1. POST /api/protocol/treasury/transfer → 404 / 405.
# 2. POST /api/protocol/treasury/execute → 404 / 405.
# 3. POST /api/protocol/treasury/auto-allocate → 404.
```

### Scenario 4: Network Integration

```bash
# 1. /network page renders without errors.
# 2. Treasury module shows "Not Activated".
# 3. "View Treasury →" link works.
```

---

## Commands

```bash
# TypeScript check (if tsconfig exists for the new files)
cd apps/web && npx tsc --noEmit

# Build check
cd apps/web && npm run build

# API smoke test
curl -s http://localhost:3000/api/protocol/treasury | jq .
curl -s http://localhost:3000/api/protocol/treasury/status | jq .

# Page render check
curl -s http://localhost:3000/treasury | head -50
```

> Note: Some commands may not run in current sandboxed environment without npm install / DB.
> The invariants are verified through code review + manual API inspection.
