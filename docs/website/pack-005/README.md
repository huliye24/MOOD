# Pack 005 — Website Portal Architecture

**Status:** Draft / Documentation Pack
**Source:** [`MOOD_CANON.md`](../../../MOOD_CANON.md) §7, [`docs/website/website-principles.md`](../website-principles.md), [`docs/website/content-mapping.md`](../content-mapping.md)
**Pack Origin:** MOOD_Website_Portal_Architecture_Pack_005
**Version:** 0.1
**Phase:** Zero — Worldbuilding

---

## Purpose

This pack adds a **portal-layer conceptual model** on top of the existing
canonical hierarchy. It does not replace `MOOD_CANON.md` §7.

The pack exists to:

1. Describe how the website behaves as a **public entrance** to the network,
   not as a marketing surface for a company.
2. Group existing website routes into a small number of **conceptual layers**
   (World, Protocol, Network, Blockchain, Portal, Docs).
3. Define **future portal surfaces** (builder portal, network dashboard, docs
   system) as Draft until the Canon authorises them.
4. Preserve the existing principles that no fake live data, fake claims, or
   active participation flows may appear on the website.

This pack **must not** be used to invent architecture that does not exist.
The Canon is still the source of truth. The website is a renderer.

---

## Files In This Pack

| File | Status | Role |
|------|--------|------|
| [`portal-architecture.md`](./portal-architecture.md) | Draft | Layer model for the public website |
| [`information-architecture.md`](./information-architecture.md) | Draft | Navigation grouping of existing routes |
| [`future-portal-surface.md`](./future-portal-surface.md) | Draft | Builder portal, network dashboard, docs system — all Draft |

---

## Canon Alignment

The public hierarchy in `MOOD_CANON.md` §7 is:

```text
MOOD → WORLD → MANIFESTO → CANON → LIBRARY → PROTOCOL
```

Pack 005 introduces a **different, broader** grouping (World, Protocol,
Network, Blockchain, Portal, Docs). These two views are not in conflict, but
they are not the same:

- §7 describes the **public reading order** a visitor follows.
- Pack 005 describes **conceptual surface clusters** the website exposes.

The Canon wins. Pack 005 only organises the website into clusters; it does
not redefine the canonical hierarchy.

If a route belongs to multiple clusters (e.g. `/treasury` belongs to both
Blockchain and Protocol), the **canonical source document** under `docs/protocol/`
or `docs/mood/treasury/` decides how the page must be presented. Cluster
labels are descriptive, not authoritative.

---

## Safety Boundaries (Carried Over From website-principles.md)

Pack 005 does not relax any of the following:

- **No fake claim flow.** No simulated block numbers, no fake "claimed" states.
- **No fake metrics.** No user counts, contributor counts, treasury balances,
  governance outcomes, or node counts that are not verifiable on-chain or
  in `docs/`.
- **No "OFFICIAL CONTRACT"** without a verifiable authority document.
- **No "Earn MOOD"** language implying active rewards while the contribution
  network is Draft.
- **No lifestyle narrative** unrelated to the Canon.
- **Unverified states remain visibly unverified.** Draft / Planned / Future.

The portal surface must remain Draft until `docs/portal/` exists and the
Canon authorises identity, passport, governance, or on-chain participation
flows.

---

## What This Pack Does NOT Do

- It does **not** create a new top-level domain or product surface.
- It does **not** author canonical concepts.
- It does **not** authorise any active system, contract, dashboard, or flow.
- It does **not** add token, treasury, or governance features.

---

## What Still Lives In The Canon

The following remain Canonical and unchanged:

- [``MOOD_CANON.md`](../../../MOOD_CANON.md) — highest authority
- [`docs/website/website-principles.md`](../website-principles.md) — website behaviour
- [`docs/website/content-mapping.md`](../content-mapping.md) — section → source → route

Any change to website behaviour must be made in those documents first; the
pack only adds conceptual organisation on top.

> Markdown is canonical memory. The website is a renderer. The pack is a guide.
