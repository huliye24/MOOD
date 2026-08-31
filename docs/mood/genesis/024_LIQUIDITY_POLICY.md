# 024 — Liquidity Policy

**Date:** 2026-08-30

## Liquidity Philosophy

024 freezes the philosophy:

```text
- Liquidity provision is launch-dependent.
- LP tokens custody is publicly disclosed.
- LP tokens are NOT moved silently.
- LP lock / burn is the recommended protection.
- LP withdrawal requires governance basis.
```

## Liquidity Seed

024 freezes the policy:

```text
- Source: UNFROZEN (must be explicit human-controlled funding plan)
- Amount: UNFROZEN
- Currency: UNFROZEN (BSC native BNB or stablecoin)
- Authority: Maintainer (NOT AI, NOT cron)
```

## LP Token Custody

024 recommends:

```text
v1 (single-operator custody, honestly documented):
  - LP tokens held by Maintainer address
  - Multi-sig migration requires MIP
  - Withdrawal requires Emergency Pause + post-hoc MIP
```

## LP Lock / Burn Policy

024 freezes (RECOMMENDED):

```text
- LP locked for minimum 6-12 months
- OR LP burned (sent to 0x000...dead)
- Lock / Burn recorded in deployment evidence
- Public disclosure of lock duration / burn status
```

024 does NOT yet freeze the specific lock duration or burn decision. 025 must.

## LP Withdrawal

024 freezes:

```text
- No silent LP withdrawal.
- Emergency withdrawal requires:
  - Maintainer decision + reason
  - Recorded in audit log
  - Post-hoc MIP ratification
  - Public disclosure
```

## LP Migration

If LP needs to migrate to a new venue:

```text
- MIP required (category = treasury or economics)
- Maintainer approval
- Public disclosure before migration
- Time-locked if possible
```

## What 024 Does NOT Decide

024 does NOT decide:
- LP lock duration
- Burn vs lock choice
- Initial LP seed amount
- LP seed currency

These remain UNFROZEN for 025 with Maintainer approval.

## Reference

- `024_TREASURY_LIQUIDITY_POLICY.md`
- `024_ADMIN_RIGHTS_REVIEW.md`
- `024_PUBLIC_DISCLOSURE.md`