# Current Project State

**Snapshot as of:** 2026-09-04

---

## Current Milestone

**MOOD Protocol Alpha 002-C** — Object Signature Integration (Planning)

The protocol has completed:
- Alpha 001 (Protocol Object) — FROZEN
- Alpha 002 (Identity Layer spec) — ACCEPTED
- Alpha 002-A (Crypto Design) — ACCEPTED
- Alpha 002-B (Identity Runtime) — **FROZEN**

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
- **Status:** **FROZEN** (2026-09-04)
- **Authority:** ADR-005
- **Frozen components:**
  - `packages/identity/` — Identity package
  - `apps/mood-cli/src/commands/identity.js` — CLI
  - `services/node-api/src/routes/identity.js` — API
- **Capabilities frozen:**
  - Ed25519 identity generation
  - Local private key storage
  - Public identity export
  - Object hash signing
  - Signature verification
- **Test results:** 26/26 identity tests passing

---

## Frozen Components

These components **must not be modified** without an ADR:

| Component | Location | Status |
|-----------|----------|--------|
| Protocol Object | `packages/protocol-object/` | FROZEN |
| Contribution Proof | `packages/contribution-proof/` | FROZEN |
| Identity Package | `packages/identity/` | **FROZEN (Alpha 002-B)** |
| Identity CLI | `apps/mood-cli/src/commands/identity.js` | **FROZEN (Alpha 002-B)** |
| Identity API | `services/node-api/src/routes/identity.js` | **FROZEN (Alpha 002-B)** |
| Alpha 001 Archive | `docs/history/alpha-001/` | FROZEN |
| Alpha 002-B Archive | `docs/history/alpha-002-b/` | **FROZEN** |

---

## Open Questions

The following are **NOT decided** and remain open:

### Key Management
- **Key rotation** — stable-ID vs key-history indirection unresolved
- **Key recovery** — self-sovereignty vs social recovery undecided
- **Multi-device identity** — one node across multiple devices

### Identity Integration
- **Alpha 002-C** — Object Signature Integration (planning)
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
- **Alpha 002-C** — Object Signature Integration (next)
  - Sign Protocol Objects at creation
  - Verify signature chain on load
  - Integration only (signature format is frozen in Alpha 002-B)

### Planning
- Alpha 003 synchronization design

### Research
- Key rotation mechanisms
- Key recovery approaches
- Multi-device identity patterns

---

## Next Milestone

**Alpha 002-C — Object Signature Integration**

Required for acceptance:
1. Sign Protocol Objects at creation (using frozen identity package)
2. Attach signature to object envelope
3. Verify signature chain on object load
4. Update tests
5. Documentation updated

**Note:** Alpha 002-C is **integration only**.
The signature format is already frozen in Alpha 002-B (ADR-005).

---

## Historical Context

```
2026-09-03: Alpha 001 FROZEN
2026-09-04: Alpha 002 ACCEPTED
2026-09-04: Alpha 002-A ACCEPTED
2026-09-04: Alpha 002-B IMPLEMENTED (commit 0af6f83)
2026-09-04: Alpha 002-B FROZEN (ADR-005)
```

The protocol is now built on:

```
Object (Alpha 001)
    +
Identity (Alpha 002-B)
    =
Cryptographic Protocol Foundation
```

Next: Alpha 002-C — Object Signature Integration
