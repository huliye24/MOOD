# 024 — Treasury & Liquidity Freeze

**Date:** 2026-08-30

## Treasury Status (024 Freeze)

```text
treasuryStatus:     inactive
realTreasuryBalance: 0
treasuryPolicy:      "Treasury activation requires accepted MIP + Human Approval"
governanceLink:      docs/mood/governance/020_FINAL_REPORT.md
```

024 does NOT activate Treasury. Activation requires an accepted MIP (category=treasury) + Maintainer approval, which is OUT OF SCOPE for 024.

## Liquidity Policy (024 Freeze)

```text
liquidityProvisioned:   false
lpTokensHeld:           0
lpCustodyModel:         UNFROZEN (depends on Flap + 025 plan)
lpLockPolicy:           UNFROZEN
lpBurnPolicy:           UNFROZEN
```

024 does NOT provision liquidity. The `lib/treasury/model.ts` keeps `Liquidity`, `Holder Rewards`, `Token Reserve` categories disabled.

## Liquidity Seed Source (024 Policy)

```text
Source:    UNFROZEN
Amount:    UNFROZEN
Currency:  UNFROZEN (BSC native BNB or USDC or other)
Authority: Maintainer (human-controlled, NOT AI / NOT cron)
```

024 explicitly forbids:

```text
- AI / cron auto-provisioning of liquidity
- Treasury auto-transfer for liquidity seed (no Treasury transfer API exists anyway)
- Undisclosed liquidity seed source
```

## LP Ownership / Custody (024 Policy)

```text
Initial LP custody: UNFROZEN
Recommended:        Multi-sig Safe (post-MIP)
v1 acceptable:      Single-operator custody (honestly documented)
Future:             Multi-sig via MIP
```

## LP Lock / Burn Policy (024 Policy)

```text
Lock policy:    UNFROZEN
Burn policy:    UNFROZEN
Recommendation: LP locked OR burned (per Flap platform best practice)
```

## Emergency Liquidity Policy (024 Policy)

If LP needs to be moved / paused:

```text
1. Emergency Pause by Maintainer
2. Recorded with reason + timestamp
3. Post-hoc MIP ratification
4. NO silent LP withdrawal
```

## Activation Gate

Treasury / Liquidity activation is gated by:

```text
024 Genesis Readiness Review = READY
+ Accepted MIP (category=treasury or economics)
+ Maintainer Human Approval
+ Live Flap verification
```

024 alone is NOT sufficient.

## Reference

- `docs/mood/treasury/021_FINAL_REPORT.md`
- `docs/mood/treasury/021_TREASURY_POLICY.md`
- `024_LEGACY_TOKEN_POLICY.md`
- `024_FLAP_INTEGRATION_REVIEW.md`