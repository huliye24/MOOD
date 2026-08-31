# 024 — Tokenomics Template (Placeholder)

**Date:** 2026-08-30

> ⚠️ This is a TEMPLATE only. 024 freezes the FRAMEWORK for Tokenomics; the actual VALUES are UNFROZEN and require 025 + Maintainer approval.

## Template Schema

```ts
type TokenomicsFreeze = {
  identity: {
    name: string;          // UNFROZEN
    symbol: string;        // UNFROZEN
    decimals: number;      // UNFROZEN (recommended: 18)
  };
  supply: {
    total: string;         // UNFROZEN (e.g., "33000000")
    mintable: false;       // FROZEN in v1
    burnable: false;       // FROZEN in v1
    upgradeable: false;    // FROZEN in v1
  };
  distribution: {
    initial: number;       // UNFROZEN (must sum to 100%)
    reserved: number;      // UNFROZEN
    treasury: number;      // UNFROZEN
    liquidity: number;     // UNFROZEN
    contributor: number;   // UNFROZEN
    community: number;     // UNFROZEN
    team: number;          // UNFROZEN
  };
  tax: {
    buy: number;           // FROZEN: 0 / disabled
    sell: number;          // FROZEN: 0 / disabled
    transfer: number;      // FROZEN: 0 / disabled
  };
  rewards: {
    holder: number;        // FROZEN: 0 / disabled in v1
    liquidity: number;     // FROZEN: 0 / disabled in v1
    burn: number;          // FROZEN: 0 / disabled in v1
  };
  limits: {
    maxWallet: number;     // FROZEN: 0 / disabled in v1
    maxTx: number;         // FROZEN: 0 / disabled in v1
  };
  governance: {
    ownerModel: "single-operator" | "multi-sig" | "renounced";
    multiSigThreshold?: number;
    renouncePlan: "yes" | "no" | "post-launch";
  };
};
```

## Frozen vs Unfrozen

```text
FROZEN in v1:
- mintable: false
- burnable: false
- upgradeable: false
- tax.buy: 0
- tax.sell: 0
- tax.transfer: 0
- rewards.holder: 0
- rewards.liquidity: 0
- rewards.burn: 0
- limits.maxWallet: 0
- limits.maxTx: 0

UNFROZEN (requires 025):
- identity.name
- identity.symbol
- identity.decimals (recommend 18)
- supply.total
- distribution.* (must = 100% when frozen)
- governance.ownerModel
- governance.multiSigThreshold (if applicable)
```

## Example Frozen Snapshot (placeholder, NOT 025 values)

```json
{
  "identity": {
    "name": "MOOD",
    "symbol": "MOOD",
    "decimals": 18
  },
  "supply": {
    "total": "33000000",
    "mintable": false,
    "burnable": false,
    "upgradeable": false
  },
  "distribution": {
    "initial": 0,
    "reserved": 0,
    "treasury": 0,
    "liquidity": 0,
    "contributor": 0,
    "community": 0,
    "team": 0
  },
  "tax": {
    "buy": 0,
    "sell": 0,
    "transfer": 0
  },
  "rewards": {
    "holder": 0,
    "liquidity": 0,
    "burn": 0
  },
  "limits": {
    "maxWallet": 0,
    "maxTx": 0
  },
  "governance": {
    "ownerModel": "single-operator",
    "renouncePlan": "post-launch"
  }
}
```

> This snapshot is a PLACEHOLDER. The actual values for 025 require explicit Maintainer approval.

## Reference

- `024_TOKENOMICS_FREEZE.md`
- `024_CONTRACT_DEPLOYMENT_PLAN.md`
- `024_GO_NO_GO.md`