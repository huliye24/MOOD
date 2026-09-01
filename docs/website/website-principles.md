# MOOD Website Principles

**Status:** Canonical — Website Layer
**Source:** [`MOOD_CANON.md`](../../MOOD_CANON.md) §7 (Website as Entrance), AGENTS.md (Product Identity)
**Pack Origin:** MOOD Website Renaissance Pack 001
**Version:** 0.1

---

## Website Is A Portal

The website is not the source of truth.

[`MOOD_CANON.md`](../../MOOD_CANON.md) is the source of truth.

The website renders Canon. The website does not author Canon.

Per `MOOD_CANON.md` §7:

> The MOOD website must not be treated as the product itself.
> The website is an interface into the world.

---

## The Website Shows Civilization

The website should communicate:

- World
- Constitution
- Culture
- Protocol
- Future direction

The canonical public hierarchy is:

```text
MOOD
  ↓
WORLD
  ↓
MANIFESTO
  ↓
CANON
  ↓
LIBRARY
  ↓
PROTOCOL
```

The website routes shall mirror this hierarchy. The home route shall not introduce
new vocabulary that does not appear in the Canon.

---

## The Website Must Not Pretend

Unimplemented systems remain:

- Draft
- Planned
- Future

The website **must not** invent:

- metrics
- users
- treasury
- activity
- governance actions
- contract deployments
- node counts
- participant numbers

If a number is not yet verifiable on-chain or in `docs/`, it does not appear as a
production figure. It may appear as `Coming soon`, `Draft`, or `Unverified`.

Per `MOOD_CANON.md` §14:

> A deployed system should not be claimed without evidence.
> Uncertainty should be written as uncertainty.

Per AGENTS.md:

> Never claim a contract, treasury, node, governance action, deployment, token
> distribution, or production service is active without verifiable evidence.
> Unverified or unresolved states must remain visibly unverified or unresolved.

---

## Relationship Between Layers

| Layer | Source | Role |
|-------|--------|------|
| GitHub `MOOD_CANON.md` | Repository root | Knowledge layer — world, principles, actors |
| `docs/protocol/` | Repository | Rule layer — identity, contribution, proof, reputation, rights, governance |
| Website (`apps/web/`) | Repository | Presentation layer — renders Canon and Protocol Markdown |

The website may add navigation, typography, illustrations, and progressive
disclosure. It must not silently rewrite Canon concepts.

---

## Forbidden Patterns on the Website

The website **must not** present:

- A simulated or staged token claim as if it were real (e.g. fake block numbers,
  fake transaction receipts, fake "claimed" states without on-chain evidence).
- A fake user count, contributor count, treasury balance, or governance outcome.
- An "OFFICIAL CONTRACT" label without a corresponding verifiable authority document.
- "Earn MOOD" language that implies an active rewards system when the contribution
  network is in Draft.
- A lifestyle or mood-board narrative that is unrelated to the Canon (e.g. cafés,
  road trips, leisure chapters) presented as if it defined MOOD.

If a page previously used any of these patterns, it must either:

1. Be removed; or
2. Be relabelled visibly as Draft / Planned / Future with the canonical source
   document linked.

---

## How the Website Renders Canon

Pages under `/canon` shall render `MOOD_CANON.md` directly from disk at request
time (per `apps/web/app/canon/page.tsx`). This is the only acceptable pattern for
the Canon page — Markdown is canonical memory and the page is a renderer.

Pages under `/manifesto`, `/library`, `/protocol` should follow the same
rendering-from-source pattern wherever the content is canonical.

Pages under `/portal` are reserved for future participation surfaces. Until a
canonical portal document exists in `docs/portal/`, the page must remain visibly
Draft and shall not display fake participation flows.

---

## What This Document Does

This document does not change `MOOD_CANON.md`.

This document declares how the website layer of the repository shall behave with
respect to the Canon.

If a website change conflicts with this document, this document wins, and the
Canon wins above all.

> World before system. Meaning before mechanism. Canon before code.
