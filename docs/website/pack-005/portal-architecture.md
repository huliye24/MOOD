# MOOD Website Portal Architecture

**Status:** Draft / Conceptual Layer Model
**Source:** [`MOOD_CANON.md`](../../../MOOD_CANON.md) §7, [`docs/website/website-principles.md`](../website-principles.md), [`../README.md`](./README.md)
**Pack Origin:** MOOD_Website_Portal_Architecture_Pack_005 (`MOOD_WEBSITE_PORTAL_ARCHITECTURE.md`, refined)
**Version:** 0.1

---

## Public Entrance Of The MOOD Network

The MOOD website is the public interface between:

- Culture
- Protocol
- Network
- Blockchain
- Participants

Per `MOOD_CANON.md` §7 and `website-principles.md`, the website is **a portal
into the world**, not the world itself. This document organises the portal
into six conceptual layers. None of these layers is a product surface on its
own. Each one **renders existing canonical content** or remains visibly Draft.

> **Reminder:** Software is replaceable. The Canon is not. During Phase Zero,
> this conceptual model is secondary to canonical clarity.

---

## Layer Map

```text
                 MOOD WEBSITE
                       │
        ┌──────────────┼──────────────┐
        │              │              │
      WORLD        PROTOCOL       NETWORK
        │              │              │
        │              │              │
   Manifesto       Docs           Builders
   Vision          Rules          Projects
        │              │              │
        └──────┬───────┴──────┬───────┘
               │              │
           BLOCKCHAIN      PORTAL
               │              │
               │              │
        Token / Treasury   Wallet / Identity
        Explorer            Contribution
                            Dashboard
```

The boxes are **clusters of existing routes**, not new products. The arrows
denote conceptual depth, not data flow.

---

## 1. World Layer

**Purpose:** Explain why MOOD exists.

**Source documents (authoritative):**

- [`MOOD_CANON.md`](../../../MOOD_CANON.md) §2, §6
- [`docs/manifesto/`](../../../manifesto/) — 12 documents
- [`docs/world/`](../../../world/) — when populated (Phase Zero)

**Website routes:**

- `/world` (canonical home of the World layer)
- `/vision` (legacy alias)
- `/manifesto/*` (12 sub-routes)

**Question answered:** *Why should this network exist?*

**Draft surfaces (do not present as active):**

- Digital Silicon Valley narrative
- AI Native Society narrative
- Beyond Companies narrative

These may be authored under `docs/world/` once Phase Zero progresses. Until
then, the World layer must render **existing** Canon and Manifesto content
only. It does not invent new narratives.

---

## 2. Protocol Layer

**Purpose:** Explain how MOOD coordinates.

**Source documents (authoritative):**

- [`docs/protocol/`](../../../protocol/) — 12 documents

**Website routes:**

- `/protocol` (index)
- `/protocol/agent`, `/protocol/capital`, `/protocol/contribution-proof`,
  `/protocol/governance`, `/protocol/node`, `/protocol/organization`,
  `/protocol/passport`, `/protocol/reputation`, `/protocol/rights`,
  `/protocol/state-machine`, `/protocol/treasury`, `/protocol/verification`

**Question answered:** *How does this network coordinate?*

**Rule:** Every protocol sub-route renders its source Markdown. No protocol
concept may appear on the website without a corresponding `docs/protocol/`
document.

---

## 3. Network Layer

**Purpose:** Show the living ecosystem.

**Source documents (authoritative):**

- Pending — `docs/network/` does not yet exist.

**Website routes:**

- `/network` (existing route, currently Draft)
- `/nodes/*` (existing operator dashboard, Draft)

**Question answered:** *Who is building inside MOOD?*

**Draft / Future surfaces:**

- Builders directory
- AI Agents directory
- Compute Nodes directory
- Projects registry
- Contributors list

**Rule:** Until `docs/network/` is populated with canonical documents, all
Network-layer pages must remain visibly Draft. They must not display:

- Live participant counts
- Live node counts
- Live contribution counts
- Active operator statuses (unless verifiable from the canonical node
  registry once it exists)

---

## 4. Blockchain Layer

**Purpose:** Connect economic infrastructure.

**Source documents (authoritative):**

- Pending — `docs/blockchain/` does not yet exist.
- Adjacent (authoritative but not Blockchain-specific):
  [`docs/protocol/treasury/`](../../../protocol/treasury.md),
  [`docs/protocol/capital.md`](../../../protocol/capital.md).

**Website routes:**

- `/token` (existing route — must be Phase-labelled per
  [`content-mapping.md`](../content-mapping.md))
- `/treasury` (existing route — Draft)
- `/transparency` (existing route — Draft)
- `/genesis` (existing route — Draft)

**Question answered:** *How does economic settlement work?*

**Rule:** Until token activation is verifiable on-chain, the Blockchain layer
must remain visibly Draft. No:

- "OFFICIAL CONTRACT" label without an authority document
- Live treasury balances that are not verifiable
- Fake block numbers or simulated transactions
- Active claim / airdrop / staking flows

---

## 5. Portal Layer (Future Participation)

**Purpose:** Future application entrance.

**Source documents (authoritative):**

- **None yet.** `docs/portal/` does not exist.

**Website route:**

- `/portal` (existing route, must remain visibly Draft — see
  [`apps/web/app/portal/page.tsx`](../../../../apps/web/app/portal/page.tsx))

**Question answered:** *How does someone participate?*

**Draft / Future surfaces (none active):**

- Wallet connection
- Contributor profile
- Reputation dashboard
- Project registration
- Governance interface

**Rule:** The `/portal` route must remain visibly Draft until the Canon
authorises identity, passport, contribution, or governance flows. The current
implementation already enforces this with a "DRAFT · PHASE ZERO · NO ACTIVE
PARTICIPATION FLOWS" banner — preserve that contract.

---

## 6. Docs Layer

**Purpose:** Knowledge foundation.

**Source documents (authoritative):**

- [`docs/`](../../../) — full documentation tree
- [`MOOD_CANON.md`](../../../MOOD_CANON.md) — highest conceptual authority

**Website routes:**

- `/canon` (renders `MOOD_CANON.md` live from disk)
- `/library` (directory entry point into `docs/`)
- `/security` (Draft)
- `/offline` (Draft)

**Question answered:** *What is true about MOOD?*

**Rule:** `/canon` is the only acceptable pattern for rendering the Canon —
Markdown is canonical memory and the page is a renderer. `/library` links to
source documents; it does not summarise them in ways that diverge from source.

---

## GitHub Integration (Conceptual)

The relationship between layers is conceptual, not data-flow:

```text
GitHub Repository
  (Build Layer — canonical Markdown, schemas, contracts)
        ↓
Website (apps/web/)
  (Presentation Layer — renderer of Canon and Protocol Markdown)
        ↓
Blockchain
  (Settlement Layer — verifiable state once activated)
```

This is a **layering claim**, not an implementation directive. Implementation
details (CI, build pipeline, deployment topology) live in
[`docs/mood/staging/`](../../../mood/staging/) when populated, not in the
website layer.

---

## Design Principle

The website should feel like a **digital city entrance**, not a company
homepage. Visitors should discover:

- ideas (World)
- protocols (Protocol)
- projects (Network)
- contributors (Network)
- infrastructure (Blockchain, Draft)
- participation entry (Portal, Draft)

The website must not invent any of these. Each surface must trace back to a
canonical source document.

---

## What This Document Does

This document does not change `MOOD_CANON.md`, `website-principles.md`, or
`content-mapping.md`.

It declares how the **conceptual layer model** groups existing routes.

When a layer is added or removed, this document is updated first. When a
route is added inside a layer, [``content-mapping.md`](../content-mapping.md)
is updated to record the source.

> World before system. Meaning before mechanism. Canon before code.
