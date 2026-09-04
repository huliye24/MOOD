# Reputation Engine — LEGACY

**Status:** DEPRECATED — Not Alpha 004 Design

---

## What This Is

This directory contains the **v0.1 reputation system** — a legacy implementation from early MOOD development.

**This is NOT the Alpha 004 reputation design.**

---

## Current Protocol

Reputation is not yet designed. The Alpha 004 milestone (State Machine) will address:

- Reputation scoring model
- Evidence aggregation
- Identity ↔ Reputation interaction

**See:** `docs/protocol/reputation.md` for conceptual design notes.

---

## Why This Exists

The reputation-engine was created during early experimentation with reputation approaches.

It represents one early model that:
- Does not match the Alpha 004 design direction
- Is not integrated with the Protocol Object model
- Is not compatible with the Identity Layer

---

## Do Not Use

**This code is deprecated.** Do not:

- Build new features on this code
- Use this as the reputation system
- Assume this is part of the planned protocol

---

## Future Reputation (Alpha 004)

The reputation system will be designed as part of Alpha 004:

```
Current:     Alpha 001 (Object) → Alpha 002 (Identity) → Alpha 003 (Sync) → Alpha 004 (State)
                                                                          ↓
                                                                    Reputation
```

---

## For AI Agents

Do not implement reputation features based on this code.

Instead:
1. Wait for Alpha 004 specification
2. Design with Identity Layer (Alpha 002) in mind
3. Reference `docs/protocol/reputation.md` for early concepts

---

## History

- Created: Early development phase (pre-Alpha 001)
- Deprecated: 2026-09-04
- Replacement: Alpha 004 (future)

---

## Archive Note

This directory is preserved for:
- Historical reference
- Potential migration of concepts
- Understanding early MOOD decisions
