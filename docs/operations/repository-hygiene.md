# MOOD Repository Hygiene Protocol

**Status:** Operational Draft
**Category:** Engineering Governance
**Source:** [`archive/staging-origin-20260901/MOOD_Repository_Hygiene_Pack_001/`](../../../archive/staging-origin-20260901/MOOD_Repository_Hygiene_Pack_001/MOOD_Repository_Hygiene_Pack_001/docs/operations/repository-hygiene.md)
**Authority:** Per [`MOOD_CANON.md`](../../MOOD_CANON.md) §1 and [`AGENTS.md`](../../AGENTS.md)
**Version:** 0.1

---

## Purpose

The GitHub repository is the long-term knowledge foundation of MOOD.

For AI-assisted development:

> The cleaner the repository, the more accurate the AI.

`docs/operations/` exists so that both human contributors and AI agents have a
shared reference for what a well-maintained MOOD repository looks like.

This document is **operational**, not canonical. It describes maintenance
practice. It does not author protocol concepts.

---

## Core Principles

### 1. Single Source of Truth

All core facts must trace to:

- Canon documents (`MOOD_CANON.md`, `docs/manifesto/`, `docs/protocol/`)
- Current status documents (`docs/chronicle/`)
- Operational records (`docs/mood/`)

Historical versions move to `archive/`. Multiple versions must not
simultaneously serve as sources of fact.

### 2. Repository Separation

MOOD Protocol surfaces:

- `docs/manifesto/` — culture
- `docs/protocol/` — rules
- `docs/chronicle/` — amendment proposals
- `docs/operations/` — engineering governance (this directory)

MOOD website:

- `apps/web/` — Next.js application
- `docs/website/` — website documentation

Moodify Application (if present):

- `apps/` — audio, AI engine, player, creator tools
- Stored data, schemas, and secrets must never mix with protocol surfaces

The two systems maintain a documented boundary.

### 3. Daily Cleaning Cycle

Check before every coding session:

```bash
git status
```

Clean before every commit:

- `node_modules/`
- `.next/`
- `dist/`
- `build/`
- `*.log`
- Temporary files
- Experimental datasets

Keep commit history clean and informative.

### 4. Archive Policy

Historical content is **not deleted**. It is moved, not erased.

Archive targets:

```
archive/
  └── [staging-origin-YYYYMMDD]/
        └── [pack-name]/
```

Archived items include:

- Old whitepapers
- Deprecated designs
- Experiments
- Old code that is no longer current

### 5. AI Agent Rules

**Read first (in order):**

1. `AGENTS.md` (root)
2. `docs/manifesto/` (relevant to task)
3. `docs/protocol/` (relevant to task)
4. `docs/operations/` (this directory)

**Avoid as active context:**

- `archive/`
- `deprecated/`
- `experiments/`

**Priority when sources conflict:**

```
Current Canon > Current Implementation > Historical Records
```

The AI must not treat archived content as authoritative.

---

## What This Document Does

This document does not change `MOOD_CANON.md`, `AGENTS.md`, or any
protocol document.

It establishes an **operational norm** for repository maintenance. When the
norm changes, this document is updated first.

---

## Goal

MOOD should be a repository that:

- can be maintained by humans,
- can be understood by AI agents,
- can be contributed to by global participants.

Clean repository. Clear Canon. Efficient collaboration.
