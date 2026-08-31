# 025 — Legacy Activation Policy (CROSS-REF to 024)

**Status:** `025_TOKEN_ACTIVATION_BLOCKED_BY_024`
**Last updated:** 2026-08-30

---

## Source of Truth

This 025 file is **not** the policy. The policy is frozen at:

```text
docs/mood/genesis/024_LEGACY_TOKEN_POLICY.md
sha256:  ________________________________________  (fill at execution time)
```

025 only applies the policy at execution time. It does **not** redefine legacy categories, eligibility, or UI handling.

---

## Frozen Position (per 024)

| Aspect | Position |
|---|---|
| Legacy migration | none |
| Snapshot eligibility | none |
| Claim portal | none |
| Legacy contract address disclosure | only if 024 marked one |
| UI banner | required: "Current Official MOOD Contract is not yet live" until Phase T |
| Old / placeholder CA on `apps/web/app/token/page.tsx` | placeholder only, must not be published as Official |

---

## Public UI Enforcement (when 025 reaches Phase T)

The token page must show, **before** any Official CA is published:

```text
[ ] Token is not yet live.
[ ] No Official Contract Address.
[ ] No buy / trade / claim CTAs.
[ ] No price / market cap / holder count.
[ ] Risk disclosure link present.
[ ] Legacy notice present (per 024 legacy policy).
```

And **after** Official CA is published:

```text
[ ] Official MOOD Contract = 0x...  (with explorer link)
[ ] Chain = BNB Smart Chain (chain ID 56)
[ ] Verification link present
[ ] Legacy Contracts section (empty unless 024 marked any)
[ ] Risk disclosure
[ ] No guaranteed return / no fixed yield language
```

---

## What 025 Will NOT Do

- It will **not** open a claim portal.
- It will **not** run a snapshot payout.
- It will **not** reclassify any old address as Official.
- It will **not** suppress the legacy notice.
- It will **not** auto-mint to legacy holders.

These are decisions for a future MIP, not 025.

---

## HUMAN_DECISION_REQUIRED

If any legacy address needs treatment different from "no migration, no claim", Maintainer must:

1. Return to 024.
2. Re-freeze legacy policy.
3. Re-review.
4. Re-issue 025.
