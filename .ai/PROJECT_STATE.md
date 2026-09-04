# Current Project State

**Snapshot as of:** 2026-09-04

---

## Current Milestone

**MOOD Protocol Alpha 002-B** — Identity Runtime Implementation (Planning)

The protocol has completed:
- Alpha 001 (Protocol Object) — FROZEN
- Alpha 002 (Identity Layer spec) — ACCEPTED
- Alpha 002-A (Crypto Design) — ACCEPTED
- Alpha 002-B (Implementation) — PLANNING, not started

---

## Completed Milestones

### Alpha 001: Protocol Object
- **Status:** FROZEN
- **Date:** 2026-09-03
- **Frozen surface:**
  - v0.1 envelope (6 keys)
  - ID derivation: SHA-256 → 24 hex
  - Hash engine: `@mood/contribution-proof`
- **Authority:** ADR-001

### Alpha 002: Identity Layer
- **Status:** ACCEPTED (spec only)
- **Date:** 2026-09-04
- **Key decision:** Signature is an extension alongside the object, never inside ID-derived content
- **Authority:** ADR-002

### Alpha 002-A: Cryptographic Design
- **Status:** ACCEPTED
- **Date:** 2026-09-04
- **Key decisions:**
  - Key model: `Node ID = hash(public key)`
  - Content-signing model
  - Threat model defined
  - Key lifecycle defined
- **Authority:** ADR-003

### Alpha 002-B: Identity Runtime Implementation
- **Status:** PLANNING
- **Algorithm:** Ed25519 (ADR-004)
- **Implementation:** Not started
- **Authority:** ADR-004

---

## Frozen Components

These components **must not be modified** without an ADR:

| Component | Location | Status |
|-----------|----------|--------|
| Protocol Object | `packages/protocol-object/` | FROZEN |
| Contribution Proof | `packages/contribution-proof/` | FROZEN |
| Alpha 001 Archive | `docs/history/alpha-001/` | FROZEN |

---

## Open Questions

The following are **NOT decided** and remain open:

### Key Management
- **Key rotation** — stable-ID vs key-history indirection unresolved
- **Key recovery** — self-sovereignty vs social recovery undecided
- **Multi-device identity** — one node across multiple devices

### Identity Integration
- **Alpha 002-C** — Object Signature Integration (not designed)
- **Identity ↔ Reputation** — interaction not designed (Alpha 004 concern)

### Network
- **Alpha 003** — Synchronization (future scope)
- **Alpha 004** — Network state machine (future scope)

---

## Do NOT Assume

The following features are **NOT implemented**:

- [ ] Governance system
- [ ] Reputation system (Alpha 004 design)
- [ ] Token or economy
- [ ] P2P network
- [ ] Consensus mechanism
- [ ] Treasury
- [ ] Staking
- [ ] Airdrops

**These exist only as ideas in the Canon or early experiments.**

---

## What to Work On

### Active Development
- **Alpha 002-B implementation** — Identity runtime with Ed25519
  - Key generation and storage
  - Signing and verification
  - Node ID derivation

### Planning
- Alpha 002-C integration design

### Research
- Key rotation mechanisms
- Key recovery approaches
- Multi-device identity patterns

---

## Next Milestone

**Alpha 002-B Acceptance Gate**

Required for acceptance:
1. All tests passing
2. Key generation working
3. Signing/verification working
4. Node ID derivation matching spec
5. Documentation updated

---

## Historical Context

```
2026-09-03: Alpha 001 FROZEN
2026-09-04: Alpha 002 ACCEPTED
2026-09-04: Alpha 002-A ACCEPTED
2026-09-04: Alpha 002-B PLANNING
```

The protocol is in early stages. Focus is on:
1. Stable identity model
2. Minimal, correct implementation
3. Documentation over features
