# ADR-005: AI Cognitive Map as Navigation Layer

**Status:** Accepted
**Date:** 2026-09-04

## Decision

Establish `MOOD_AI_COGNITIVE_MAP.md` as the AI Agent Navigation Layer between
the Canon and implementation.

## Context

Future AI agents working in this repository need a fast, machine-readable
snapshot of the current cognitive state without re-deriving settled conclusions
or misunderstanding open/forbidden boundaries. Reading the full Canon and all
authority documents for every task is expensive and unnecessary for routine work.

The Cognitive Map solves this by providing a single entry point that maps:

- what is **settled** (do not re-derive)
- what is **open** (spend budget here)
- what is **forbidden** (do not touch)
- how code maps to concepts
- the current protocol timeline

## Principle

```
Canon (defines truth)
    ↓
AGENTS (defines behavior)
    ↓
Cognitive Map (defines current state)
    ↓
Code (implements)
```

The Cognitive Map does **not** own the truth. It is the navigation layer that
helps agents reach the protocol truth efficiently.

## Purpose

- Faster agent onboarding
- Reduced context loss
- Consistent development direction
- Prevention of concept pollution (e.g., "Application Record" instead of
  "Protocol Object")
- Clear separation between settled/open/forbidden

## Maintenance Rule

This file is a **snapshot, not a source of truth**. It is updated only after:

1. A milestone is **accepted**
2. A milestone is **frozen**
3. An **ADR decision** is made

The update must happen in the **same commit** as the milestone/decision.

## Consequences

Positive:

- agents spend budget on the unknown, not re-deriving the known
- consistent terminology enforcement across all contributors
- clear protocol timeline visibility
- faster navigation to authority documents

Negative:

- requires active maintenance after milestones
- risk of the map becoming stale if not kept in sync
- agents must verify stale maps are flagged, not silently corrected

## File Location

```
MOOD_AI_COGNITIVE_MAP.md   (root — quick access for agents)
```

## Related Documents

- [`MOOD_CANON.md`](../MOOD_CANON.md) — highest authority
- [`AGENTS.md`](../AGENTS.md) — agent behavior rules
- [`docs/README.md`](README.md) — documentation index
