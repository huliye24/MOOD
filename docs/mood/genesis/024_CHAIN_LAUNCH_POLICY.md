# 024 — Chain Launch Policy

**Date:** 2026-08-30

## Chain Selection

```text
Chain:           BNB Smart Chain (BSC)
Chain ID:        56
Explorer:        https://bscscan.com
RPC Strategy:    public BSC RPC (e.g., https://bsc-dataseed.binance.org)
DEX / Trading:   Flap (primary), PancakeSwap (template URL — NOT live)
```

**Status: FROZEN** for the chain identity only. The DEX / Trading venue is **FROZEN at "Flap primary"** with a fallback template to PancakeSwap, but **NO live trading pair exists** until 025.

## Why BSC

- Existing tokenomics docs reference BSC chain (chain ID 56).
- Existing `lib/mood-token.ts` configures BSC.
- Existing `MoodGenesisDistributor.sol` targets BSC.
- Public RPC available.

## Why Flap

Per Maintainer direction: "我们最后会通过bnb公链，在flap上发行" (final launch on BNB via Flap).

Flap is the deployment / launch platform. 024 freezes the chain selection (BSC) and the launch platform (Flap) but does NOT execute any live platform verification.

## Verification Requirement

024 cannot execute live Flap API calls. Therefore:

```text
Live Flap platform verification: PENDING
Marking: REQUIRES_LIVE_PLATFORM_VERIFICATION
Reference: 024_FLAP_INTEGRATION_REVIEW.md
```

024 does NOT freeze any Flap-specific contract behavior, tax structure, or reward mechanism until 025 verifies against the live platform.

## What 024 Freezes

```text
✅ Chain: BSC (chain ID 56)
✅ Explorer: bscscan.com
✅ RPC: public BSC RPC
✅ Primary launch platform: Flap
```

## What 024 Does NOT Freeze

```text
- Contract source code (depends on Flap platform)
- Tokenomics parameters (depends on Flap features)
- Tax / Reward mechanism (depends on Flap config)
- Initial supply allocation (depends on Flap tokenomics flow)
- Liquidity seed (depends on human funding plan)
```

## Reference

- `024_FLAP_INTEGRATION_REVIEW.md`
- `024_TOKENOMICS_FREEZE.md`
- `024_CONTRACT_DEPLOYMENT_PLAN.md`