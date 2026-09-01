# MOOD Website Information Architecture

**Status:** Draft / Navigation Reference
**Source:** [`MOOD_CANON.md`](../../../MOOD_CANON.md) §7, [`docs/website/content-mapping.md`](../content-mapping.md), [`docs/website/website-principles.md`](../website-principles.md), [`../portal-architecture.md`](./portal-architecture.md)
**Pack Origin:** MOOD_Website_Portal_Architecture_Pack_005 (`MOOD_WEBSITE_INFORMATION_ARCHITECTURE.md`, refined)
**Version:** 0.1

---

## Navigation Map

This document groups the **existing website routes** into the conceptual
layers defined in [`portal-architecture.md`](./portal-architecture.md). It is
a navigation reference, not a new canonical hierarchy.

```text
MOOD WEBSITE

├── World
│   ├── /world              (canonical home of World layer)
│   ├── /vision             (legacy alias — kept for compatibility)
│   └── /manifesto/*
│       ├── /manifesto/why-mood
│       ├── /manifesto/future-of-work
│       ├── /manifesto/future-of-capital
│       ├── /manifesto/protocol-vs-platform
│       ├── /manifesto/from-company-to-network
│       ├── /manifesto/digital-society
│       ├── /manifesto/human-ai-coexistence
│       └── (rendered from docs/manifesto/ Markdown)
│
├── Protocol
│   ├── /protocol           (index)
│   └── /protocol/*
│       ├── agent
│       ├── capital
│       ├── contribution-proof
│       ├── governance
│       ├── node
│       ├── organization
│       ├── passport
│       ├── reputation
│       ├── rights
│       ├── state-machine
│       ├── treasury
│       └── verification
│
├── Network  (Draft)
│   ├── /network            (Draft — no canonical source yet)
│   └── /nodes/*            (Draft operator dashboard)
│
├── Blockchain  (Draft)
│   ├── /token              (Draft — must be Phase-labelled)
│   ├── /treasury           (Draft)
│   ├── /transparency       (Draft)
│   └── /genesis            (Draft)
│
├── Portal  (Future participation — Draft)
│   └── /portal             (Draft — no canonical source yet)
│
└── Docs
    ├── /canon              (renders MOOD_CANON.md live)
    ├── /library            (directory entry into docs/)
    ├── /security           (Draft)
    └── /offline            (Draft)
```

---

## Layer Descriptions

### World

**Function:** Culture and philosophy.

**Question answered:** *Why should this network exist?*

**Authoritative source:**

- [`MOOD_CANON.md`](../../../MOOD_CANON.md) §2, §6
- [`docs/manifesto/`](../../../manifesto/)
- [`docs/world/`](../../../world/) (when populated)

**Rendering rule:** Render source Markdown directly. Do not paraphrase Canon.

### Protocol

**Function:** Rules and mechanisms.

**Question answered:** *How does this network coordinate?*

**Authoritative source:** [`docs/protocol/`](../../../protocol/)

**Rendering rule:** Each sub-route renders its source Markdown. No protocol
concept appears without a corresponding `docs/protocol/` document.

### Network  *(Draft)*

**Function:** Living ecosystem.

**Question answered:** *Who is building inside MOOD?*

**Authoritative source:** None yet (`docs/network/` does not exist).

**Rendering rule:** All pages visibly Draft. No live counts. No active
operator statuses unless backed by a canonical node registry.

### Blockchain  *(Draft)*

**Function:** Economic infrastructure.

**Question answered:** *How does economic settlement work?*

**Authoritative source:** None yet (`docs/blockchain/` does not exist).
Adjacent: [`docs/protocol/treasury.md`](../../../protocol/treasury.md),
[`docs/protocol/capital.md`](../../../protocol/capital.md).

**Rendering rule:** All pages visibly Draft. No fake contracts. No live
balances that are not verifiable. No simulated transactions.

### Portal  *(Draft)*

**Function:** Future application entrance.

**Question answered:** *How does someone participate?*

**Authoritative source:** None yet (`docs/portal/` does not exist).

**Rendering rule:** The `/portal` route must remain visibly Draft. No active
identity, passport, contribution, or governance flows may appear.

### Docs

**Function:** Knowledge foundation.

**Question answered:** *What is true about MOOD?*

**Authoritative source:** [`docs/`](../../../) tree.

**Rendering rule:** `/canon` renders `MOOD_CANON.md` directly from disk.
`/library` is a directory entry point; it links to source documents, not
paraphrases.

---

## Cross-Layer Routes

Some routes belong to multiple layers conceptually. The **canonical source
document** wins.

| Route | Primary layer | Also relevant to | Source of truth |
|-------|---------------|------------------|-----------------|
| `/protocol/treasury` | Protocol | Blockchain | `docs/protocol/treasury.md` |
| `/protocol/capital` | Protocol | Blockchain | `docs/protocol/capital.md` |
| `/protocol/governance` | Protocol | Portal | `docs/protocol/governance-process.md` |
| `/protocol/passport` | Protocol | Portal | `docs/protocol/passport.md` |
| `/protocol/verification` | Protocol | Network, Portal | `docs/protocol/verification.md` |
| `/protocol/node` | Protocol | Network | `docs/protocol/node.md` |
| `/protocol/agent` | Protocol | Network | `docs/protocol/agent.md` |
| `/treasury` | Blockchain (Draft) | Protocol | `docs/protocol/treasury.md` (canonical) |
| `/token` | Blockchain (Draft) | Portal | Phase label required |
| `/nodes/dashboard` | Network (Draft) | Portal | Draft — no source yet |

When two layers overlap, render the canonical source. Do not invent
duplicated content.

---

## Routes That Are Not In Any Layer

The following routes exist in the repository but are **not part of the
public MOOD website layer model**:

- `/admin/*` — internal admin
- `/api/*` — internal API
- `/airdrop` — Draft; subject to separate cleanup per `content-mapping.md`

These are operations, not public surface. They must not be presented as part
of the public navigation.

---

## What This Document Does

This document does not change `MOOD_CANON.md`, `content-mapping.md`, or
`website-principles.md`.

It declares how the **navigation clusters** of the website map to existing
canonical sources.

When a route is added or removed, this document and
[`content-mapping.md`](../content-mapping.md) are updated together.

> Navigation reflects Canon. Canon does not reflect navigation.
