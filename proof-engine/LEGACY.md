# Proof Engine — LEGACY

**Status:** DEPRECATED — Not current MOOD Protocol

---

## What This Is

This directory contains the **Tier-B simulated verifier** — a legacy implementation from early MOOD development.

**This is NOT the current contribution verification system.**

---

## Current Protocol

The current contribution verification system is:

| Component | Location | Status |
|-----------|----------|--------|
| Hash Engine | `packages/contribution-proof/` | FROZEN (Alpha 001) |
| Object Layer | `packages/protocol-object/` | FROZEN (Alpha 001) |

---

## Why This Exists

The proof-engine was created during early experimentation with contribution verification approaches.

It represents one approach that was superseded by:
1. The Protocol Object model (Alpha 001)
2. The Contribution Proof hash engine (Alpha 001)

---

## Do Not Use

**This code is deprecated.** Do not:

- Build new features on this code
- Use this as a reference for verification logic
- Assume this is part of the current protocol

---

## Relationship to Current Protocol

```
proof-engine/          → Legacy Tier-B verifier (DEPRECATED)
    ↓ superseded by
packages/contribution-proof/  → Current hash engine (FROZEN)
packages/protocol-object/      → Current object layer (FROZEN)
```

---

## History

- Created: Early development phase (pre-Alpha 001)
- Superseded: 2026-09-03 (Alpha 001 acceptance)
- Deprecated: 2026-09-04

---

## For AI Agents

When looking for contribution verification logic, use:

```
1. packages/contribution-proof/  ← Hash engine
2. packages/protocol-object/      ← Object layer
```

Not this directory.
