# MOOD AI Cognitive Map

**This file is the AI world model for MOOD.**

It summarizes what AI agents should know about MOOD's current state.

---

## MOOD Identity

### What MOOD IS

- An **open coordination protocol**
- A **digital world** for human and machine agency
- An **independent project** (not Moodify)
- In **Phase Zero: Worldbuilding**

### What MOOD is NOT

- A product
- A token
- A website
- A Moodify subsystem
- A finished system

---

## Worldbuilding Priority Order

```
WORLD
  ↓
CANON
  ↓
CULTURE
  ↓
PROTOCOL
  ↓
SOFTWARE
```

**Software is replaceable. The Canon is not.**

---

## Protocol Timeline

```
Phase Zero — Worldbuilding (CURRENT)
    │
    ├─→ Alpha 001: Protocol Object     [FROZEN]
    │       └── v0.1 envelope, SHA-256 ID, hash engine
    │
    ├─→ Alpha 002: Identity Layer       [ACCEPTED]
    │       └── Specification only, not implemented
    │
    ├─→ Alpha 002-A: Crypto Design      [ACCEPTED]
    │       └── Key model, threat model, lifecycle
    │
    ├─→ Alpha 002-B: Identity Runtime     [ACCEPTED + FROZEN]
    │       └── Ed25519, key management, signing (ADR-004)
    │       └── Frozen as immutable protocol history
    │       └── Authority: ADR-006-alpha002b-freeze
    │
    ├─→ Alpha 002-C: Object Signature Int  [NEXT]
    │       └── Sign Protocol Objects at creation
    │       └── Verify signature chain on object load
    │       └── Integration only — signature format frozen in 002-B
    │
    ├─→ Alpha 003: Synchronization      [FUTURE]
    │
    └─→ Alpha 004: State Machine        [FUTURE]
```

## Frozen Surface (Protocol Object)

The Protocol Object (Alpha 001) is frozen. Future changes require new alpha versions.

---

## Key Decisions Made

| ADR | Decision | Status |
|-----|----------|--------|
| ADR-001 | Alpha 001 Protocol Object Freeze | Accepted |
| ADR-002 | Alpha 002 Identity Layer Specification | Accepted |
| ADR-003 | Alpha 002-A Cryptographic Design | Accepted |
| ADR-004 | Ed25519 Algorithm Selection | Accepted |
| ADR-005 | Alpha 002-B Identity Runtime Freeze | Accepted |

---

## Key Concepts (Fixed Terminology)

| Term | Definition | Forbidden Alternative |
|------|------------|---------------------|
| Protocol Object | The canonical data structure for contributions | Application Record, Database Object |
| Contribution Proof | The single hash engine for verification | Proof Record |
| Node ID | `hash(public key)` — identity derived from key | Legacy ID |
| Signature | Ed25519 over canonical object digest | Any other algorithm |

---

## Verification Model

**Always recompute, never trust stored flags.**

```
Create Object → Canonicalize → Hash → ID
                               ↓
                          Store Proof

Verify Object → Canonicalize → Hash → Compare
                               ↓
                          Result: VALID/INVALID
```

---

## Trust Model (Alpha 002)

- **Identity ≠ Reputation**
- Identity enables attribution only
- Avoid identity-power solidification
- No trust in stored `verified` flags

---

## Documentation Governance Layer

MOOD maintains not only protocol evolution but also **knowledge evolution**.

The Documentation Governance Layer ensures that documents, decisions, and references remain:

1. **Discovered** — via registry
2. **Traceable** — via change protocol
3. **Consistent** — via cognitive sync

### Governance Files

| File | Purpose |
|------|---------|
| `.ai/ADR_REGISTRY.md` | Single navigation index for all ADRs |
| `.ai/DOCUMENT_STATUS.md` | Document lifecycle states |
| `.ai/CHANGE_PROTOCOL.md` | How changes flow through MOOD |

### Governance Principles

```
ADR document  >  ADR registry
Canon         >  Specification
Authority     >  Implementation
Explicit      >  Implicit
```

### Lifecycle Loop

```
Acceptance
    ↓
Archive (docs/history/)
    ↓
Cognitive Sync (.ai/)
    ↓
Registry Update
```

Every milestone must complete this loop.

---

## Forbidden Claims

Do NOT claim:

- Any contract is deployed
- Any treasury exists
- Any governance is active
- Any node is running
- Any token is live
- Any P2P network exists

These are **NOT IMPLEMENTED**.

---

## AI Agent Behavior

Before coding:

```
1. Read MOOD_CANON.md
2. Read AGENTS.md
3. Read MOOD_AI_COGNITIVE_MAP.md
4. Find authority document for your task
5. Implement meaning that is already defined
```

---

## Three-Layer Principle

```
Canon (defines truth)
    ↓
AGENTS (defines behavior)
    ↓
Cognitive Map (defines current state)
    ↓
Code (implements)
```

**The Cognitive Map does not own the truth. It is the navigation layer.**

---

## Maintenance

This file is updated when:

- A milestone is accepted
- A milestone is frozen
- An ADR decision is made

**Update must happen in the same commit as the decision.**
