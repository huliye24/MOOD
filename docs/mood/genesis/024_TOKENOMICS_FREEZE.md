# 024 — Tokenomics Freeze

**Date:** 2026-08-30

> ⚠️ **This document freezes the Tokenomics Freeze STATUS, NOT the actual Tokenomics values.**
> Because 023 is PARTIAL and Flap platform is unverified, all parameter values are UNFROZEN.
> Only their STATUS is frozen: UNFROZEN — pending 025.

## Status Legend

```text
FROZEN          — value approved, ready for 025
UNFROZEN        — value not yet approved; requires resolution before 025
DEFERRED        — value intentionally not decided in 024
NOT_APPLICABLE  — parameter not used
```

## Parameter Table (v1)

| Parameter | Value | Status | Source | Governance Ref |
|---|---|---|---|---|
| **Identity** | | | | |
| Name | UNFROZEN | UNFROZEN | pending 025 | — |
| Symbol | UNFROZEN | UNFROZEN | pending 025 | — |
| Decimals | UNFROZEN | UNFROZEN | standard 18 / platform default | — |
| **Supply** | | | | |
| Total Supply | UNFROZEN | UNFROZEN | config in `lib/mood-token.ts` | — |
| Mintability | UNFROZEN | UNFROZEN | Flap platform dependent | — |
| Burnability | UNFROZEN | UNFROZEN | Flap platform dependent | — |
| Upgradeability | UNFROZEN | UNFROZEN | Flap platform dependent | — |
| **Tax** | | | | |
| Buy Tax | 0 / disabled | DEFERRED | "No tax in v1" intent | — |
| Sell Tax | 0 / disabled | DEFERRED | "No tax in v1" intent | — |
| Transfer Tax | 0 / disabled | DEFERRED | "No tax in v1" intent | — |
| **Rewards** | | | | |
| Holder Reward % | 0 / disabled | DEFERRED | launch-gated | — |
| Liquidity % | 0 / disabled | DEFERRED | launch-gated | — |
| Burn % | 0 / disabled | DEFERRED | launch-gated | — |
| Contributor Pool | UNFROZEN | UNFROZEN | 016 Contribution | — |
| Genesis Allocation | UNFROZEN | UNFROZEN | Package 005 | — |
| Liquidity Seed | UNFROZEN | UNFROZEN | explicit human funding | — |
| **Limits** | | | | |
| Max Wallet | 0 / disabled | DEFERRED | no whitelist | — |
| Max Tx | 0 / disabled | DEFERRED | no whitelist | — |

---

## Frozen Decisions (only these)

```text
1. No tax in v1: Buy/Sell/Transfer Tax = 0 / disabled (DEFERRED for 025).
2. No Holder Reward / Liquidity / Burn % in v1 (DEFERRED for 025).
3. No Max Wallet / Max Tx in v1 (DEFERRED for 025).
4. Pending Reward Units ≠ automatic Token claim (per 024 §Contributor Reward Mapping).
```

These decisions are FROZEN regardless of 025 timing.

---

## Unfrozen Decisions (NOT yet approved)

```text
- Identity (Name / Symbol / Decimals)
- Total Supply
- Mintability / Burnability / Upgradeability
- Contributor Pool (mapping rule)
- Genesis Allocation (snapshot rule)
- Liquidity Seed (source / amount / custody)
- Admin / Owner control model
```

These require Maintainer approval during 025 execution, OR a return to 024 if any value changes.

---

## Allocation Sum Rule

024 cannot freeze allocation until parameters are FROZEN. Current status:

```text
Total Allocation: UNFROZEN
```

When frozen, must satisfy:

```text
SUM(Initial + Reserved + Treasury + Liquidity + Contributor + Community + Team) == 100%
```

---

## Reference

- `024_LEGACY_TOKEN_POLICY.md`
- `024_TREASURY_LIQUIDITY_POLICY.md`
- `024_REWARD_POLICY.md`
- `024_FLAP_INTEGRATION_REVIEW.md`
- `024_FINAL_REPORT.md`