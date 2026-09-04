# MOOD File Index

**Maps important files to their purpose, authority, and status.**

---

## Root Authority Files

| File | Purpose | Authority | Status |
|------|---------|----------|--------|
| `MOOD_CANON.md` | Defines what MOOD is | **HIGHEST** | Authoritative |
| `AGENTS.md` | AI agent behavior rules | High | Authoritative |
| `MOOD_AI_COGNITIVE_MAP.md` | Cognitive state snapshot | Navigation | Living |

---

## AI Navigation Layer

| File | Purpose | Authority | Status |
|------|---------|----------|--------|
| `.ai/START_HERE.md` | Entry point for AI agents | Navigation | Required |
| `.ai/COGNITIVE_MAP.md` | World model | Navigation | Required |
| `.ai/PROJECT_STATE.md` | Current milestone | Navigation | Required |
| `.ai/ARCHITECTURE_INDEX.md` | Layer definitions | Navigation | Required |
| `.ai/FILE_INDEX.md` | This file | Navigation | Required |
| `.ai/DECISION_INDEX.md` | ADR decisions summary | Navigation | Required |
| `.ai/STATUS.md` | Protocol status | Navigation | Required |
| `.ai/AI_RULES.md` | AI-specific rules | Navigation | Required |
| `.ai/ADR_REGISTRY.md` | ADR navigation index | Index | Required |
| `.ai/DOCUMENT_STATUS.md` | Document lifecycle states | Index | Required |
| `.ai/CHANGE_PROTOCOL.md` | Change governance | Process rule | Required |

---

## Protocol Specifications

| File | Purpose | Authority | Status |
|------|---------|----------|--------|
| `docs/protocol/identity-layer.md` | Identity layer spec | ADR-002 | Accepted |
| `docs/protocol/identity-cryptography.md` | Crypto design | ADR-003 | Accepted |
| `docs/protocol/contribution-proof.md` | Proof verification | ADR-001 | Frozen |
| `docs/protocol/protocol-object.md` | Object structure | ADR-001 | Frozen |
| `docs/protocol/identity-runtime.md` | Runtime implementation spec | ADR-005 | **Frozen** |
| `docs/protocol/README.md` | Protocol docs index | — | Reference |

---

## Architecture Decisions

| File | Purpose | Authority | Status |
|------|---------|----------|--------|
| `docs/decisions/ADR-001-alpha001-freeze.md` | Alpha 001 freeze | ADR-001 | Accepted |
| `docs/decisions/ADR-002-identity-layer.md` | Identity layer spec | ADR-002 | Accepted |
| `docs/decisions/ADR-003-cryptographic-identity-design.md` | Crypto design | ADR-003 | Accepted |
| `docs/decisions/ADR-004-identity-algorithm-selection.md` | Ed25519 selection | ADR-004 | Accepted |
| `docs/decisions/ADR-005-cognitive-map.md` | AI navigation layer | — | Accepted |
| `docs/decisions/ADR-006-alpha002b-freeze.md` | Alpha 002-B freeze | ADR-006 | **Accepted** |

---

## Protocol History

| File | Purpose | Authority | Status |
|------|---------|----------|--------|
| `docs/history/MOOD_PROTOCOL_HISTORY.md` | Protocol evolution | — | Reference |
| `docs/history/MOOD_PROTOCOL_ROADMAP.md` | Future roadmap | — | Reference |
| `docs/history/alpha-001/` | Alpha 001 archive | ADR-001 | Frozen |
| `docs/history/alpha-002-a/` | Alpha 002-A archive | ADR-003 | Accepted |
| `docs/history/alpha-002-b/` | Alpha 002-B archive | ADR-005 | **Frozen** |
| `docs/history/ALPHA002B_IMPLEMENTATION_PLAN.md` | Alpha 002-B plan (superseded) | — | Historical |

---

## World Layer

| File | Purpose | Authority | Status |
|------|---------|----------|--------|
| `docs/world/00_GENESIS.md` | World genesis | Canon | Draft |
| `docs/world/01_THE_WORLD.md` | What is the world | Canon | Draft |
| `docs/world/02_HUMAN_AND_MACHINE.md` | Agency definition | Canon | Draft |
| `docs/world/03_AGENCY.md` | Agency concept | Canon | Draft |
| `docs/world/04_CONTRIBUTION.md` | Contribution theory | Canon | Draft |
| `docs/world/05_PROOF.md` | Proof concept | Canon | Draft |
| `docs/world/06_REPUTATION.md` | Reputation theory | Canon | Draft |
| `docs/world/07_AGENTS.md` | Agents concept | Canon | Draft |
| `docs/world/08_NODES.md` | Node concept | Canon | Draft |
| `docs/world/09_COMMONS.md` | Commons concept | Canon | Draft |
| `docs/world/10_GOVERNANCE.md` | Governance concept | Canon | Draft |
| `docs/world/11_THE_FUTURE.md` | Future vision | Canon | Draft |
| `docs/world/README.md` | World docs index | — | Reference |

---

## Implementation Packages

| Path | Purpose | Authority | Status |
|------|---------|----------|--------|
| `packages/protocol-object/` | Object layer | ADR-001 | **FROZEN** |
| `packages/contribution-proof/` | Hash engine | ADR-001 | **FROZEN** |
| `packages/identity/` | Identity runtime | ADR-005 | **FROZEN** |
| `packages/mood-connector/` | AI Agent connector | — | Active |
| `packages/node-runtime/` | Node runtime | — | Active |

**Identity package provides:**
- Node identity (`hash(public key)`)
- Ed25519 key management
- Object signing
- Signature verification

---

## Active Applications

| Path | Purpose | Authority | Status |
|------|---------|----------|--------|
| `apps/mood-cli/` | CLI tool | Alpha 001 surface | Active |
| `apps/web/` | Website | — | Active |
| `services/node-api/` | Network API | Alpha 001 surface | Active |

---

## Legacy Code (Not Current Protocol)

| Path | Purpose | Authority | Status |
|------|---------|----------|--------|
| `proof-engine/` | Simulated verifier | Legacy | **DEPRECATED** |
| `reputation-engine/` | v0.1 reputation | Legacy | **DEPRECATED** |
| `contracts/` | Historical contracts | Legacy | **DEPRECATED** |
| `frontend/` | Old frontend | Legacy | **DEPRECATED** |
| `backend/` | Old backend | Legacy | **DEPRECATED** |
| `archive/` | Historical artifacts | None | **READ ONLY** |

---

## Engineering Operations

| File | Purpose | Authority | Status |
|------|---------|----------|--------|
| `docs/engineering-log/README.md` | Engineering records | — | Reference |
| `docs/engineering-log/cognitive-audit-alpha001.md` | This audit | — | Archive |
| `docs/operations/repository-hygiene.md` | Repository rules | — | Active |
| `docs/operations/cleanup-checklist.md` | Cleanup procedures | — | Active |

---

## Terminology Reference

### Fixed Terms (Use These)

| Term | Definition |
|------|------------|
| Protocol Object | Canonical data structure |
| Contribution Proof | Hash verification system |
| Node ID | Identity derived from `hash(public key)` |
| Ed25519 | Selected signing algorithm |
| FROZEN | Cannot be modified without ADR |
| ACCEPTED | Specification complete, may be implemented |
| PLANNING | Implementation in planning |
| LEGACY | Historical, not current protocol |

### Forbidden Terms (Do Not Use)

| Term | Reason |
|------|--------|
| Application Record | Use "Protocol Object" |
| Database Object | Use "Protocol Object" |
| Proof Record | Use "Contribution Proof" |

---

## File Status Legend

| Status | Meaning |
|--------|---------|
| **Authoritative** | Highest authority, defines truth |
| **Frozen** | Cannot modify without ADR |
| **Accepted** | Approved for implementation |
| **Active** | Currently developing |
| **Planning** | In planning phase |
| **Legacy** | Historical, not current |
| **Deprecated** | Should not use |
| **Reference** | Informational only |
