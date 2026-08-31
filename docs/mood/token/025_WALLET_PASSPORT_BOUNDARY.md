# 025 — Wallet / Passport Boundary (TEMPLATE)

**Status:** `025_TOKEN_ACTIVATION_BLOCKED_BY_024`
**Last updated:** 2026-08-30

---

## Canon Position

```text
Resident     ≠ Holder
Reputation   ≠ Balance
Governance   ≠ Token weight
```

Token activation does **not** collapse these surfaces. Each remains an independent axis.

---

## Wallet Behavior (post-activation)

Allowed:

- Display real `MOOD balance` from on-chain reads.
- Show `token-active` badge once Official CA is in Canon.
- Render historical MOOD transactions.
- Link to explorer for any address.

Forbidden:

- Show "your voting power" based on balance (Token-weighted governance is OFF until a separate MIP).
- Show "reputation score" derived from balance.
- Show "achievement" badges tied to balance thresholds.
- Show APY / yield tied to holding.

---

## Passport Behavior

Passport identity continues to operate independently:

- Resident ID remains identity-anchored, not token-anchored.
- Role badges (`RoleBadgePolicy` per 015) remain governance / contribution based, not token based.
- Reputation from Contribution (`016`) remains reputation, not balance.

A resident can be:

- a Holder (has MOOD),
- a non-Holder resident,
- a Holder who is not a resident.

All three are valid. The UI must not collapse them.

---

## Contribution Reward

`016` Pending Reward Units remain reputation accounting until **separately** decided via a future MIP. 025 does **not** auto-convert Pending Rewards into Token claims. The frozen 024 position is:

> Pending Reward Units do not automatically create a legal or on-chain claim.

---

## Governance Boundary

`020` Governance v1 continues. Token activation does not:

- enable staking-to-vote,
- enable on-chain Governor,
- enable delegation,
- enable quorum by balance.

These require a separate MIP, drafted after the Token is live and observed in the wild.

---

## What This Means for 025

025 ships a Token surface that is intentionally **narrow**:

- show balance if you have MOOD,
- do not reinterpret balance as reputation / governance / role.

The narrowness is a feature, not a deficiency. It keeps Token, Identity, Reputation, and Governance from collapsing into one signal.
