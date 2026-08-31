# 024 — Reward Policy

**Date:** 2026-08-30

## Hard Rule (FROZEN)

```text
Pending Reward Units from 016 Contribution Network do NOT automatically create a legal or on-chain Token claim.
```

## Mapping Decision (024 Freeze)

024 freezes the POLICY of how Pending Reward Units relate to the future Token:

| Option | Status |
|---|---|
| 1. Convert to Token allocation | UNFROZEN (requires specific snapshot policy) |
| 2. Use only as reputation-weighted eligibility | UNFROZEN |
| 3. Remain independent accounting | UNFROZEN |
| 4. Partly convert | UNFROZEN |

024 does NOT pre-commit to any mapping. 025 must specify and freeze.

## Snapshot Policy (if option 1 or 4 chosen)

024 freezes the required elements:

```text
snapshot_query:        TBD (must be defined before 025)
snapshot_timestamp:    TBD (must be defined before 025)
inclusion_rules:       TBD
exclusion_rules:       TBD
appeal_process:        TBD
```

024 does NOT execute any snapshot. 024 only documents what MUST be specified before 025.

## Anti-Sybil / Manipulation Review

If a future Token allocation uses Contribution Reputation, 024 requires:

```text
- Sybil detection policy
- Multi-account exclusion policy
- Wash-trade / collusion exclusion
- Reporting channel for manipulation
```

024 does NOT freeze these yet. 025 must.

## Public Disclosure

024 requires the following to be in `024_PUBLIC_DISCLOSURE.md`:

```text
"Pending Reward Units do not automatically create a legal or on-chain Token claim.
Conversion to Token (if any) requires explicit snapshot policy and Human Approval.
No guaranteed value."
```

## Reference

- `024_TOKENOMICS_FREEZE.md`
- `024_LEGACY_TOKEN_POLICY.md`
- `docs/mood/contribution/016_FINAL_REPORT.md` (where present)