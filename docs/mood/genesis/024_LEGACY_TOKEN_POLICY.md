# 024 — Legacy Token Policy

**Date:** 2026-08-30

## Definition

A "Legacy Token" is any token that was previously named / symbolized / associated with Moodify / MOOD but is NOT the future canonical token.

## Inventory

| Asset | Status | Notes |
|---|---|---|
| `lib/mood-token.ts` placeholder address (`0x1BB3115D43E397f7bb586F090831B02cA639e73E`) | **NOT YET OFFICIAL** | Cannot be shown as Official until 025 verifies live deployment |
| `MoodGenesisDistributor.sol` (compiled) | **NOT DEPLOYED** | Local artifact; no mainnet deployment recorded |
| Template PancakeSwap URL in `lib/mood-token.ts` | **TEMPLATE** | Cannot be shown as live trading pair |
| `GENESIS_AIRDROP.md` / `GENESIS_DISTRIBUTION.md` | **DESIGN DOCS** | No execution recorded |

## Policy Classification (024)

For each potential legacy asset, 024 freezes:

```text
- NOT YET OFFICIAL: This address is NOT the official CA until 025 verifies live deployment.
- NOT DEPLOYED: This contract is compiled locally only; not deployed on BSC mainnet.
- TEMPLATE: This URL is a template; not a live trading pair.
- DESIGN DOCS: These documents are design-only; no execution recorded.
```

## Public UI Policy (FROZEN)

In 024/025 transition window, `/token` and `/transparency` pages MUST:

1. **NOT** display the placeholder address as "Official Contract" before 025 verification.
2. **NOT** display PancakeSwap URL as "Live Trading" before 025 verification.
3. **MUST** show a banner: "Token is not yet live. Status: pre-launch."
4. **MUST** display a clear "Official CA Verification Rule" link to `024_CA_PUBLICATION_PROTOCOL.md`.

## Migration Policy

024 freezes:

```text
NO legacy migration is planned.
The placeholder address is NOT a "legacy" token in the holder-migration sense.
It is a NOT-YET-DEPLOYED future canonical address.
```

This avoids confusion between:
- A truly legacy token with holders (which would need snapshot / migration policy)
- A pre-launch placeholder address

If in the future a real prior MOOD token with holders is discovered, 024 MUST be reopened.

## Forbidden Claims (024 hard rule)

024 forbids the following claims:

```text
- "MOOD is now live"
- "MOOD is tradable"
- "MOOD has X holders"
- "MOOD has Y liquidity"
- "MOOD has Z volume"
- "The legacy token migrated to MOOD"

(Unless verifiable at 025 launch time.)
```

## Reference

- `024_CA_PUBLICATION_PROTOCOL.md`
- `024_TOKENOMICS_FREEZE.md`
- `024_PUBLIC_DISCLOSURE.md`