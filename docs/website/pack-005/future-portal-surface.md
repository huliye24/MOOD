# Future Portal Surface — Draft Notes

**Status:** Draft / Future Participation Notes
**Source:** [`MOOD_CANON.md`](../../../MOOD_CANON.md) §7, [`../portal-architecture.md`](./portal-architecture.md), [`../README.md`](./README.md)
**Pack Origin:** MOOD_Website_Portal_Architecture_Pack_005 (`MOOD_BUILDER_PORTAL_DESIGN.md`, `MOOD_NETWORK_DASHBOARD.md`, `MOOD_DOCS_SYSTEM.md`, refined)
**Version:** 0.1

---

## Purpose

This document collects **three short notes** that were packaged together in
Pack 005 and reframes them as **Draft future surfaces** under the Portal
Layer (see [`portal-architecture.md`](./portal-architecture.md) §5).

Each section below restates a source note from Pack 005 and adds:

1. Its current **Draft** status,
2. The **canonical authority gap** that must be filled before it becomes a
   public surface,
3. The **safety boundaries** that apply.

No surface in this document is active. No code, contract, dashboard, or flow
described here may be deployed without a canonical source document.

---

## 1. Builder Portal (Draft)

### Source Note (From Pack 005)

> Builder Portal connects contributors with the network.
>
> Potential features:
>
> - Developer identity
> - GitHub connection
> - Contribution history
> - Reputation display
> - Open tasks
> - Project discovery
>
> Goal: Make contribution visible.

### Status: Draft

No public Builder Portal exists. The current `/contribute` and `/portal`
routes are explicitly Draft and labelled as such. The features listed above
are **potential**, not implemented.

### Canonical Authority Gap

For the Builder Portal to become a real public surface, the following must
exist as canonical documents under `docs/portal/` (or the relevant
subsystem directory):

| Feature | Required source document |
|---------|--------------------------|
| Developer identity | `docs/portal/identity.md` (does not exist) |
| GitHub connection | `docs/portal/github-binding.md` (does not exist) |
| Contribution history | `docs/portal/contribution-history.md` (does not exist) |
| Reputation display | `docs/protocol/reputation-engine.md` (Draft — verify) |
| Open tasks | `docs/portal/tasks.md` (does not exist) |
| Project discovery | `docs/portal/projects.md` (does not exist) |

Until each required source document exists, the corresponding feature must
not appear on the website.

### Safety Boundaries

- No live developer counts.
- No live GitHub-bound identities unless the canonical identity document
  authorises them.
- No live reputation scores unless the canonical reputation document
  authorises them.
- No live task counts unless the canonical tasks document authorises them.
- No live project counts unless the canonical projects document authorises
  them.

The Builder Portal is a **future surface**. The website must not present
it as if it were live.

---

## 2. Network Dashboard (Draft)

### Source Note (From Pack 005)

> Future dashboard concept.
>
> Possible metrics:
>
> - Active builders
> - Projects
> - Agents
> - Nodes
> - Contributions
> - Treasury activity
>
> The dashboard represents network health.

### Status: Draft

No public Network Dashboard exists. The existing `/network` and
`/nodes/dashboard` routes are Draft and must remain so.

### Canonical Authority Gap

| Metric | Required source document |
|--------|--------------------------|
| Active builders | `docs/network/builders.md` (does not exist) |
| Projects | `docs/network/projects.md` (does not exist) |
| Agents | `docs/protocol/agent.md` (verify canonical status) |
| Nodes | `docs/network/nodes.md` (does not exist) + canonical node registry |
| Contributions | `docs/protocol/contribution-proof.md` (Draft — verify) |
| Treasury activity | `docs/protocol/treasury.md` (Draft — verify) |

Until each metric has a canonical source, that metric **must not** appear on
the website as a live number.

### Safety Boundaries (Per `website-principles.md` §"The Website Must Not Pretend")

The dashboard **must not** display:

- Users
- Treasury balances that are not verifiable
- Activity counts that are not verifiable
- Governance outcomes that are not verifiable
- Contract deployments that are not verifiable
- Node counts that are not verifiable
- Participant numbers that are not verifiable

If a number is not yet verifiable on-chain or in `docs/`, it does not appear
as a production figure. It may appear as `Coming soon`, `Draft`, or
`Unverified`.

This applies to **every metric** in the list above. The dashboard is a
**future** dashboard. The website must not pretend otherwise.

---

## 3. Docs System (Draft)

### Source Note (From Pack 005)

> Documentation hierarchy:
>
> ```
> README
>   ↓
> Manifesto
>   ↓
> Constitution
>   ↓
> Architecture
>   ↓
> Protocol
>   ↓
> Technical Documentation
>   ↓
> Implementation
> ```
>
> The documentation system is the knowledge foundation of MOOD.

### Status: Draft — Restated Against The Actual Repository

The Pack 005 hierarchy describes **one possible reading order**. The actual
canonical hierarchy is defined in `MOOD_CANON.md` §7 and reflected in the
existing `docs/` tree:

```text
MOOD_CANON.md            (highest authority)
  ↓
docs/manifesto/          (12 documents)
  ↓
docs/protocol/           (12 documents)
  ↓
docs/mood/               (operations — not public surface)
  ↓
docs/chronicle/          (canon amendment proposals — Draft)
  ↓
docs/website/            (website layer)
```

Pack 005's "Constitution" maps to `MOOD_CANON.md`. Pack 005's "Architecture"
is split between `docs/protocol/` and `docs/website/portal-architecture.md`.
Pack 005's "Implementation" maps to `apps/`, `packages/`, `contracts/`, and
other software surfaces.

### Canonical Authority Gap

The actual docs system is **mostly in place**. The remaining gaps are:

| Gap | Where |
|-----|-------|
| `docs/world/` | Not yet populated (Phase Zero) |
| `docs/network/` | Not yet populated |
| `docs/blockchain/` | Not yet populated |
| `docs/portal/` | Not yet populated |

These directories are reserved for Phase Zero / Phase One documents. They
must not be filled with non-canonical content.

### Safety Boundaries

- The documentation system **is** the canonical knowledge layer. It is not a
  marketing surface.
- Pack 005's reading order is a **descriptive** restatement. It does not
  redefine the canonical hierarchy in `MOOD_CANON.md` §7.
- Where Pack 005's hierarchy and the Canon disagree, the Canon wins.
- The website renders this system; it does not author it.

---

## Summary

| Surface | Status | Required source | Forbidden on website |
|---------|--------|-----------------|----------------------|
| Builder Portal | Draft | `docs/portal/*` (missing) | Live identity, reputation, tasks, projects |
| Network Dashboard | Draft | `docs/network/*` (missing) | Live counts of any kind |
| Docs System | Draft (mostly in place) | Already exists; new dirs reserved | Non-canonical docs in reserved dirs |

All three surfaces are **future** until their canonical sources exist and
the Canon authorises them. The website must remain visibly Draft.

---

## What This Document Does

This document does not change `MOOD_CANON.md`, `portal-architecture.md`, or
any route implementation.

It restates three short Pack 005 notes as **Draft future surfaces** with
explicit canonical gaps and safety boundaries.

When a surface becomes active, a corresponding canonical source document
must exist first, and this document must be updated to remove the Draft
status.

> Draft is honest. Live is a claim. The website only claims what the Canon
> authorises.
