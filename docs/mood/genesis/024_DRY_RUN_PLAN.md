# 024 — Dry Run Plan

**Date:** 2026-08-30

> ⚠️ 024 dry run is PLANNED, not executed. 024 forbids production deployment.

## Allowed Environments

```text
- Local (no network)
- Forked test environment
- BSC testnet (chain ID 97)
- Flap testnet / sandbox (if available)
- Unsigned transaction preparation
- Simulation scripts
```

## Forbidden in Dry Run

```text
- Production BSC deployment
- Real Token creation on mainnet
- Real LP
- Real Treasury fund movement
- Real Holder Reward distribution
- Real Airdrop execution
```

## Dry Run Steps (planned)

### Step 1 — Local Compilation

```text
- Clone repo
- Install dependencies
- Compile MoodGenesisDistributor.sol (test only)
- Verify no warnings
```

### Step 2 — BSC Testnet Deployment (if available)

```text
- Deploy MoodGenesisDistributor to BSC testnet
- Capture test tx hash + block
- Verify source on testnet explorer
- Run minimal transfer test
- Burn test
```

### Step 3 — Flap Sandbox Test (if available)

```text
- Use Flap sandbox if it exists
- Test token creation flow
- Test liquidity provision flow
- Document any unexpected behavior
```

### Step 4 — Behavior Verification

```text
- Transfer test: 1 MOOD from A to B (should succeed, no tax)
- Owner test: verify owner functions are NOT callable in v1 (tax = 0, mint = off)
- Pause test: verify no pause function
- Reward test: verify no reward distribution
- Blacklist test: verify no blacklist
```

### Step 5 — Documentation

```text
- Record dry run results
- Note any discrepancies
- Update 024_FINAL_REPORT.md if needed
- Pass to 025 if results acceptable
```

## Required Output

Dry run must record:

```text
- environment:           testnet / sandbox
- artifact:              <contract name>
- expected contract:     <address>
- expected params:       <parameter set>
- verification result:   PASS / FAIL
- discrepancies:          <list if any>
- timestamp:             <iso>
```

## What If Dry Run Fails

```text
If dry run reveals unexpected behavior:
  → 024_GENESIS_NOT_READY
  → Return to refreeze parameters / platform selection
  → Do NOT proceed to 025
```

## Reference

- `024_FLAP_INTEGRATION_REVIEW.md`
- `024_CONTRACT_DEPLOYMENT_PLAN.md`