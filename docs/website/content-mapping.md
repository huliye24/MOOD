# MOOD Website Content Mapping

**Status:** Canonical — Website Layer
**Source:** [`MOOD_CANON.md`](../../MOOD_CANON.md) §7, [`docs/website/website-principles.md`](./website-principles.md)
**Pack Origin:** MOOD Website Renaissance Pack 001 (refined)
**Version:** 0.1

---

## Purpose

Map GitHub Canonical documents to website routes so that:

1. The website renders existing Canon content rather than authoring new concepts.
2. Every website section has an authoritative source document.
3. No page may claim active systems, metrics, or numbers without a verifiable
   authority document.
4. Documentation drift between website and Canon is impossible by construction
   (Markdown is canonical memory, the website is a renderer).

---

## Public Hierarchy (from `MOOD_CANON.md` §7)

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

The home route renders `WORLD`. From `WORLD`, the visitor may descend into
`MANIFESTO`, `CANON`, `LIBRARY`, and `PROTOCOL`. The `PORTAL` is a separate
surface reserved for future participation.

---

## Section → Source → Route Mapping

### World

- **Website route:** `/vision` (alias `/world` recommended for canonical alignment; pending IA decision)
- **Source documents:**
  - [`MOOD_CANON.md`](../../MOOD_CANON.md) §2, §6.1 (World layer)
  - [`docs/manifesto/`](../../manifesto/) — social architecture, civilization vision, origin
  - Pending: [`docs/world/`](../../world/) — when populated (Phase Zero)
- **Website content:**
  - MOOD origin (Genesis framing)
  - Protocol Empire Theory
  - Civilization vision
  - Social architecture (permissionless generation, anti-gatekeeper economy)
- **Rule:** The World section renders existing Canon and Manifesto Markdown. It
  does not author new narratives.

### Manifesto

- **Website route:** `/manifesto`
- **Source documents:** [`docs/manifesto/`](../../manifesto/) (12 documents)
- **Website content:**
  - Permissionless Generation
  - Anti-Gatekeeper Economy
  - Contribution Over Status
  - From Gatekeeper to Protocol
  - Protocol Empire Theory
  - MOOD Is Not Moodify
  - Protocol vs. Application
  - Genesis Application
  - Digital Society
  - From Company to Network
  - Human AI Coexistence
  - Protocol vs. Platform
  - MOODism：贡献驱动的网络文明（中文思想文稿，Draft）
  - Proof of Intelligence：智能证明（中文概念提案，Draft）
  - MOOD Technical Architecture（中文技术架构概念稿，Draft）
  - MOOD Protocol Specification · Yellow Paper（中文非规范性草案，Draft）
  - MOOD Formal Specification（中文非规范性形式化草案，Draft）
  - MOOD Protocol Client Implementation（中文非规范性实现草案，Draft）
- **Rule:** Each sub-route renders the corresponding Markdown file via the shared
  `MoodDocument` component. No narrative may be added that lacks a source document.

### Canon

- **Website route:** `/canon`
- **Source document:** [`MOOD_CANON.md`](../../MOOD_CANON.md) (rendered live from disk)
- **Website content:** The full Canon text with table of contents and section anchors.
- **Rule:** Per `apps/web/app/canon/page.tsx`, the page reads `MOOD_CANON.md` at
  request time and fails open as visibly unverified if the file is missing.

### Library

- **Website route:** `/library`
- **Source documents:** [`docs/`](../../) (whole tree)
- **Website content:**
  - Manifestos
  - Research notes
  - Architecture documents
  - Canon documents
  - Operational records
- **Rule:** Library is a directory entry point. Each entry links to its source
  document in `docs/`. No document is summarised in a way that diverges from
  its source.

### Protocol

- **Website route:** `/protocol`
- **Source documents:** [`docs/protocol/`](../../protocol/) (12 documents)
- **Website content:**
  - Contribution Proof
  - Reputation Engine
  - Rights System
  - Treasury Design
  - Governance Process
  - State Machine
  - Identity, Passport, Verification, Node, Agent, Capital, Organization, Project, Settlement
- **Rule:** Protocol sub-routes render the corresponding Markdown. The
  `/protocol` index shows the architecture map. No protocol concept may appear
  in the website without a document in `docs/protocol/`.

### Portal (future participation)

- **Website route:** `/portal` (new route, pending implementation)
- **Source documents:** Pending — currently no `docs/portal/` exists.
- **Website content:**
  - Identity
  - Passport
  - Future participation surfaces (Draft)
- **Rule:** Until `docs/portal/` is populated with canonical documents, the
  `/portal` route must remain visibly Draft. It must not present:
  - Active participation flows
  - Live counters
  - Simulated or fake claim states
  - Active governance actions
  - On-chain transactions unless the source document authorises them

---

## Sections That Are NOT Website Surfaces

The following are operational records that live in `docs/mood/` and must not be
presented as website marketing material:

- `docs/mood/genesis/` (token genesis and activation policy)
- `docs/mood/treasury/` (treasury policy, allocation, transparency)
- `docs/mood/security/` (security model, threat model, findings)
- `docs/mood/staging/` (deployment, environment, test plans)
- `docs/mood/governance/` (MIP standard, authority model, lifecycle)
- `docs/mood/token/` (token launch policy, activation report)
- `docs/mood/audit/` (canon alignment audits)
- `docs/chronicle/` (canon amendment proposals — Draft)

These are evidence and operations. The website may reference them by link, but
must not surface their content as if it were public marketing.

---

## Narrative Pollution — Patterns to Remove

The following patterns have been observed on the website and are forbidden by
[`docs/website/website-principles.md`](./website-principles.md):

| Pattern | Where observed | Status |
|---------|----------------|--------|
| Fake claim flow with simulated block numbers | `/airdrop` page | Remove or relabel Draft |
| "OFFICIAL CONTRACT" without verifiable authority | `/token` home page | Add phase label and source link |
| Lifestyle chapters (café, road, leisure) presented as defining MOOD | `/token` home page | Relabel as illustrative or remove |
| Airdrop with active claim UI before token is launched | `/airdrop` page | Mark Draft until docs/protocol/AIRDROP.md is canonical |
| Generic "Earn MOOD" copy implying live rewards | `/contribute` page | Soften to "Pending allocation" (already partially done) |

---

## What This Document Does

This document does not change `MOOD_CANON.md` or any document under `docs/`.

It declares how the website layer of the repository shall render the Canon.

When a route is added or refactored, this document is the first place to record
the change. When a route is removed, its row is removed from this table.

> Markdown is canonical memory. The website is a renderer.
