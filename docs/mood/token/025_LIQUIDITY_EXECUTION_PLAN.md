# 025 — Liquidity Execution Plan (TEMPLATE)

**Status:** `025_TOKEN_ACTIVATION_BLOCKED_BY_024`
**Last updated:** 2026-08-30

---

## 024 Frozen Position

```text
024_LIQUIDITY_POLICY.md says: liquidity is NOT provisioned at launch.
024_TREASURY_LIQUIDITY_POLICY.md says: liquidity seed source UNFROZEN.
```

So by default, **025 has no liquidity to execute**. This file is a **template** in case Maintainer chooses to override that freeze via a 024 re-freeze.

Until then: **this plan is dormant.**

---

## When This Plan Activates

Only after:

1. Maintainer requests LP.
2. 024 is re-frozen with: source, amount, venue, LP recipient, LP lock policy, custody policy.
3. A new Liquidity Human Signature Sheet is generated (see `025_HUMAN_SIGNATURE_PLAN.md`).

---

## Plan Outline (template)

### Pre-flight

- [ ] LP source is human-controlled (verified address).
- [ ] LP source has been funded with the agreed BNB amount.
- [ ] Token balance is confirmed in the LP-source wallet.
- [ ] Venue chosen (PancakeSwap v2 / v3 / 4-inch / etc.) with rationale.
- [ ] Quote asset (BNB / USDT / USDC) chosen with rationale.
- [ ] LP recipient (multi-sig or documented custody) chosen.
- [ ] LP lock / custody plan documented (lock duration, custodian, on-chain lock contract address if applicable).

### Tx Preparation

- Route: PancakeSwap v2 `addLiquidityETH` (or v3 position manager).
- Token amount: _PENDING_.
- BNB amount: _PENDING_.
- Min LP tokens (slippage floor): _PENDING_.
- Recipient of LP tokens: _PENDING_.
- Deadline (block timestamp): _PENDING_.

### Signature Sheet

Use the Liquidity Human Signature Sheet from `025_HUMAN_SIGNATURE_PLAN.md`.

### Execution

- Maintainer signs and broadcasts.
- Capture: tx hash, block, LP token ID / amount, recipient, lock evidence.

### Verification

- LP balance of recipient matches expected.
- If lock intended, lock contract / custody shows locked position.
- Public UI shows LP only after real evidence.

---

## Forbidden

- Wash trading.
- Fake volume.
- LP that is not actually locked / custodied while claiming it is.
- Coordinated buys to simulate demand.
- AI / cron automatically adding or removing LP.
- Insider pre-positioning not disclosed.

Any of the above → ABORT + governance escalation per `025_INCIDENT_PAUSE_PLAN.md`.
