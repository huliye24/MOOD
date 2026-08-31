# 021 — Transparency Policy

**Date:** 2026-08-30

## Public Routes

```text
/treasury          — Treasury-focused transparency (NEW in 021)
/transparency      — Protocol-level transparency (existing, MOOD-GENESIS-007)
```

### Page Division

| Page | Scope |
|---|---|
| `/treasury` | Financial transparency: accounts, assets, revenue, allocations, executions |
| `/transparency` | Protocol transparency: versions, policies, provenance, network facts, public evidence |

The two pages do NOT duplicate hard-coded data.

---

## `/treasury` Page Layout

```text
MOOD TREASURY

Hero
  └── Treasury Status (Not Activated / Observed / Policy-Ready / Active / Paused)

Sections
  ├── Policy        — links to 021_TREASURY_POLICY.md
  ├── Accounts      — public, classified, status-labeled
  ├── Assets        — quantity + verification status (no fake USD)
  ├── Revenue       — ACTIVE / PLANNED / FUTURE-LAUNCH-GATED
  ├── Allocations   — enabled / disabled categories
  ├── Executions    — proposed / approved / executed (real tx evidence only)
  ├── Governance    — MIP references
  ├── Reports       — monthly snapshots
  └── Risks         — custody / signer / pricing / methodology
```

---

## Hero Default Content

### When Treasury is `inactive`

```text
Treasury Status: Not Activated

MOOD is building its treasury policy and transparency layer
before activating protocol-controlled funds.

No real treasury balance exists. This page will display
verified balances once an account is activated through
governance and human approval.
```

This is HONEST and BETTER than fake zeros or speculative numbers.

### When Treasury is `observed` (candidate wallet discovered)

```text
Treasury Status: Observed (Candidate)

The following addresses have been identified as candidates
but are NOT yet authorized as protocol Treasury:

[list of candidate addresses]

Activation requires an accepted MIP and explicit human approval.
```

### When Treasury is `policy-ready`

```text
Treasury Status: Policy-Ready

Policy and controls are in place. Activation pending
governance decision (MIP) and human approval.
```

### When Treasury is `active`

```text
Treasury Status: Active

Activated by [MIP-XXX] on [date]. Last sync: [timestamp].
```

---

## Data Freshness

Each displayed value MUST show:

```text
source      — rpc / config / db / unavailable
updatedAt   — ISO timestamp
isStale     — true if older than 24h
```

---

## Reconciliation Status

Always show:

```text
Verified    — on-chain reads match config
Mismatch    — discrepancy; show both values
Unavailable — RPC failure; value hidden
Stale       — read older than threshold; show warning
```

Do NOT auto-correct mismatches. Show both, label both, defer to maintainer review.

---

## What Is Public

- Account address + explorer link (only for `public: true` accounts).
- Category and purpose.
- Quantity (if `verificationState = verified`).
- Last sync timestamp.

## What Is NOT Public

- Private keys, seeds, mnemonics.
- Internal maintainer notes.
- Non-public account addresses.
- Personal wallet labels.
- Proposed / unapproved allocations.
- Failed execution attempts with sensitive details.

---

## Honest Limitations

Public page explicitly acknowledges:

```text
- RPC may be temporarily unavailable.
- Some balances may be stale.
- USD valuation requires reliable pricing source.
- Methodology is evolving.
- Not all categories are populated.
- Future token economics are launch-gated.
```

This is BETTER than fake precision.

---

## Reference

- See `apps/web/app/treasury/page.tsx` for the public page.
- See `apps/web/app/api/protocol/treasury/route.ts` for the API.
- See `021_RECONCILIATION_POLICY.md` for status semantics.
