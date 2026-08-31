# 021 — Asset Model

**Date:** 2026-08-30

## Asset Categories

```text
Native Asset       — Chain native (e.g., BNB)
Stable Asset       — Stablecoin (USDC, USDT)
Future MOOD Token  — Protocol token (post-launch-gate)
LP Position        — DEX LP (post-launch-gate)
Other Protocol     — Tokens from other protocols (audited case-by-case)
```

## Position Model

```ts
type AssetVerificationState =
  | "verified"      // On-chain read succeeded, source trusted
  | "unverified"    // Read attempted but stale/unreliable
  | "unavailable";  // RPC / source not reachable

interface TreasuryAssetPosition {
  accountId: string;
  assetId: string;          // "BNB" | "USDC" | contract address
  assetType: "native" | "stable" | "future-mood" | "lp" | "other";
  chain?: string;
  contractAddress?: `0x${string}`;
  quantity?: string;        // Raw chain quantity
  valuationUsd?: string | null;  // null = unknown
  valuationSource?: string; // "coingecko", "pancakeswap", "rpc"
  observedAt: string;
  verificationState: AssetVerificationState;
}
```

---

## Valuation Rules (hard)

1. **If no reliable price source → `valuationUsd = null`.**
   - Do not show "$0.00" as a placeholder.
   - Show "Valuation not available".

2. **No fake USD values.**
   - Stale cached prices must be marked `isStale = true`.
   - 24-hour freshness window recommended.

3. **No future-token price assumptions.**
   - Pre-launch MOOD has no market price; do not invent one.

4. **LP valuation requires both sides read.**
   - Single-side read → `verificationState = "unverified"`.

---

## Display

- `quantity` — shown if `verificationState = "verified"`.
- `valuationUsd` — shown only if not null AND source is fresh.
- `observedAt` — always shown.
- Stale data — labeled "Stale (last read N minutes ago)".
- Unavailable — labeled "RPC unavailable, value hidden".

---

## What 021 Does NOT Track

- Private balances (CEO, founder personal).
- Anonymous wallets.
- Wallets without classification.
- Wallets with `public: false`.
- LP positions pre-launch-gate.

---

## Future Token Activation Boundary

```text
Future MOOD Token
├── Pre-launch:    status = launch-gated, no quantity, no valuation
├── Post-launch:   quantity = on-chain read; valuation per approved oracle
└── Liquidity:     LP positions only after LP-MIP accepted
```

021 does NOT pre-fill any future token economics.
