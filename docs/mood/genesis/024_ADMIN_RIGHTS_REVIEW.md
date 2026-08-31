# 024 — Admin / Ownership Review

**Date:** 2026-08-30

## Admin Functions (potential, platform-dependent)

For Flap-generated contracts, the following admin functions MAY exist:

```text
1. mint            — issue new tokens
2. burn            — destroy tokens from circulation
3. tax update      — change buy/sell/transfer tax
4. excludeFromFee  — whitelist addresses
5. blacklist       — block specific addresses
6. pause           — pause trading
7. ownershipTransfer — transfer ownership
8. liquidityManagement — withdraw LP
9. rewardConfig    — change reward parameters
```

## 024 Freeze (per function)

| Function | v1 Setting | Owner | Can Renounce? | Multi-sig? | Emergency Use? | Risk |
|---|---|---|---|---|---|---|
| mint | DISABLED | n/a | n/a | n/a | n/a | LOW |
| burn | DISABLED | n/a | n/a | n/a | n/a | LOW |
| tax update | n/a (tax = 0) | n/a | n/a | n/a | n/a | LOW |
| excludeFromFee | n/a (no whitelist) | n/a | n/a | n/a | n/a | LOW |
| blacklist | n/a (no whitelist) | n/a | n/a | n/a | n/a | LOW |
| pause | n/a (no pause) | n/a | n/a | n/a | n/a | LOW |
| ownershipTransfer | TBD | UNFROZEN | TBD | TBD | TBD | MEDIUM |
| liquidityManagement | n/a (no LP) | n/a | n/a | n/a | n/a | LOW |
| rewardConfig | n/a (no reward) | n/a | n/a | n/a | n/a | LOW |

## v1 Honest State

```text
Since tax = 0, mint = off, burn = off, whitelist = off, pause = off, reward = off:
  → Most admin functions are NOT USED in v1.
  → If Flap-generated contract has these functions, they exist but are NOT EXERCISED.
```

This is HONESTLY DOCUMENTED. We are NOT pretending to be renounced.

## Recommendation (UNFROZEN)

024 recommends (for 025 to consider):

```text
- Renounce ownership if Flap supports it cleanly.
- If not, transfer ownership to multi-sig Safe post-launch.
- Document owner address publicly.
- Emergency pause: ONLY via accepted MIP + post-hoc ratification.
```

## Goal

```text
Do NOT hide centralization.
Do NOT pretend renouncement that hasn't happened.
Do NOT auto-execute admin functions.
```

## Reference

- `024_SECURITY_REVIEW.md`
- `024_CONTRACT_DEPLOYMENT_PLAN.md`
- `docs/mood/security/022_PERMISSION_MATRIX.md`