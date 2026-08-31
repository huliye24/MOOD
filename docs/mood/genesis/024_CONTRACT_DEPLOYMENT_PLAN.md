# 024 — Contract Deployment Plan

**Date:** 2026-08-30

> ⚠️ 024 prepares the deployment PLAN, not the deployment itself.
> 024 explicitly forbids executing any production Token creation.

## Plan Structure

### Preflight

```text
- Verify Flap live integration (per 024_FLAP_INTEGRATION_REVIEW.md)
- Verify Maintainer approval recorded
- Verify all Tokenomics parameters FROZEN
- Verify public disclosure prepared
- Verify Treasury / Liquidity policy frozen
- Verify legacy token policy frozen
```

### Compiler

```text
- Solidity: 0.8.x (recommended)
- Optimizer: enabled (per Flap default)
- Source verified
```

### Constructor Args

```text
- Name: UNFROZEN
- Symbol: UNFROZEN
- Decimals: UNFROZEN
- Total Supply: UNFROZEN
- Owner / Admin: Maintainer-controlled (single operator in v1, transparent custody)
- Treasury destination: UNFROZEN
- Reward wallet: UNFROZEN
- Liquidity wallet: UNFROZEN
```

### Deploy

```text
- Via Flap platform
- Deployment account: Maintainer (NOT AI, NOT cron)
- Chain: BSC (chain ID 56)
- Block: confirmed
```

### Verify

```text
- Source code submitted to bscscan.com
- Bytecode matches expected
- Constructor args verified
- Verified badge obtained
```

### Smoke Test

```text
- Minimal transfer test (Maintainer → test wallet)
- Verify owner controls (mint disabled / blacklist test)
- Verify tax = 0 (no tax in v1)
- Verify holder reward = 0 (no reward in v1)
```

### Publish CA

```text
- Only after source verification + Maintainer approval + Canon update
- Per 024_CA_PUBLICATION_PROTOCOL.md
```

### Update Portal

```text
- /token page: "Official CA" section populated (only after CA verified)
- /transparency page: tokenomics disclosed
- /security page: launch status updated
```

## What 024 Does NOT Execute

024 EXPLICITLY DOES NOT:

```text
- Call Flap production deployment
- Sign any production transaction
- Transfer any real asset
- Publish any Official CA
- Update /token or /transparency with live data
- Open Claim
- Add LP
```

024 produces the PLAN; 025 executes with explicit human approval at each step.

## Required Artifacts for 025

025 must produce and record:

```text
- deployment_tx_hash
- block_number
- deployment_timestamp
- deployment_account_address (truncated/hashed in public docs)
- contract_address
- bscscan_verification_link
- source_verification_link
- constructor_args_recorded
- canonical_contract_source (Flap-generated)
- compiled_bytecode_hash
```

## Reference

- `024_CA_PUBLICATION_PROTOCOL.md`
- `024_FLAP_INTEGRATION_REVIEW.md`
- `024_TOKENOMICS_FREEZE.md`