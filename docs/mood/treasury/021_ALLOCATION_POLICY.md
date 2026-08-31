# 021 — Allocation Policy

**Date:** 2026-08-30

## Allocation Categories

```text
Protocol Development
Infrastructure
Security
Research
Community
Grants
Liquidity          (disabled pre-launch)
Holder Rewards     (disabled pre-launch)
Token Reserve      (disabled pre-launch)
Legal / Compliance
Operations
Reserve
```

---

## Category Status (v1)

| Category | Status | Notes |
|---|---|---|
| Protocol Development | ENABLED | Subject to MIP / Policy |
| Infrastructure | ENABLED | Subject to MIP / Policy |
| Security | ENABLED | Audits, bug bounties, threat modeling |
| Research | ENABLED | Moodify-aligned research |
| Community | ENABLED | Community initiatives |
| Grants | ENABLED | Subject to Grants MIP |
| Liquidity | DISABLED | Launch-gated (024/025) |
| Holder Rewards | DISABLED | Launch-gated (024/025) |
| Token Reserve | DISABLED | Launch-gated (024/025) |
| Legal / Compliance | ENABLED | Subject to Policy |
| Operations | ENABLED | Day-to-day operational costs |
| Reserve | ENABLED | Long-term reserve maintenance |

---

## Allocation %

021 does NOT pre-define allocation percentages.

Allocation percentages are determined by:

```text
1. Accepted MIP, OR
2. Emergency Action with post-hoc ratification
```

Until then, allocations are made on a per-decision basis with documented rationale.

---

## Disabled Categories (hard block)

- `liquidity`, `holder-rewards`, `token-reserve` MUST remain `disabled` until:
  - Token Launch Gate (024) is passed.
  - Token Activation (025) is completed.
  - A specific MIP with category `economics` or `treasury` accepts the activation.

If any of these conditions is not met, the public page MUST show:

```text
Status: Launch-gated
Activation: Pending Token Launch Gate
```

NOT a fake percentage or zero placeholder.

---

## Approval Flow

```text
Allocation Request
  ↓ (Proposer)
Maintainer Review
  ↓ (Approver / Co-reviewer if available)
MIP or Policy Match
  ├── Routine under Policy → Execute
  └── Non-routine        → MIP path
                         ↓
                      Accepted
                         ↓
                      Execute (with tx evidence)
```

Every step is audited. No allocation moves without a record.

---

## What 021 Does NOT Do

- Distribute tokens on a schedule.
- Auto-allocate based on revenue.
- Allocate based on reputation scores.
- Move funds to/from disabled categories.
- Allow AI to propose allocations.

---

## Reference

- `021_TREASURY_POLICY.md` (overarching rules)
- `docs/mood/governance/020_MIP_STANDARD.md` (MIP process)
