# Document Status Registry

**Purpose:** Single navigation index for document lifecycle states.

This file is an index, not an authority. Individual documents remain authoritative for their own status.

---

## Purpose

Let AI agents and human contributors quickly answer:

- "What is the lifecycle state of this document type?"
- "Where does this file fit in the governance hierarchy?"
- "What rules apply to documents at this level?"
- "Can I modify this file freely?"

---

## Lifecycle States

| State | Meaning | Modification Rule |
|-------|---------|-------------------|
| **Immutable** | Highest authority. Defines what MOOD is. Cannot be modified. | New Canon version required |
| **Frozen** | Settled. Cannot be modified without new ADR. | Requires new ADR |
| **Controlled** | Stable. May change but follows change protocol. | Requires update + registry entry |
| **Living** | Active. Evolves with project. | Update in place + sync |
| **Archive** | Historical. Never updated. | Read-only |
| **Reference** | Informational. May evolve. | Light review |
| **Legacy** | Deprecated. Not active protocol. | Do not extend |

---

## Canonical Documents

**MOOD_CANON.md**

- **Authority:** Highest
- **Status:** Immutable (in v0.2)
- **Layer:** 0 — Canon
- **Modification:** Requires new Canon version
- **Location:** repository root

**AGENTS.md**

- **Authority:** High
- **Status:** Controlled
- **Layer:** 0.5 — Agent Behavior
- **Modification:** Requires contributor agreement
- **Location:** repository root

---

## Agent Documents

**`.ai/`**

- **Authority:** Navigation
- **Status:** Living
- **Layer:** 0.AI — AI Cognitive Layer
- **Modification:** Updated with each milestone
- **Sub-files:**
  - `COGNITIVE_MAP.md` — World model (Living)
  - `PROJECT_STATE.md` — Current milestone (Living)
  - `STATUS.md` — Protocol status (Living)
  - `FILE_INDEX.md` — File mapping (Living)
  - `DECISION_INDEX.md` — ADR summary (Living)
  - `AI_RULES.md` — AI behavior rules (Living)
  - `ARCHITECTURE_INDEX.md` — Layer model (Living)
  - `START_HERE.md` — Agent entry point (Living)
  - `ADR_REGISTRY.md` — ADR navigation (Living)
  - `DOCUMENT_STATUS.md` — This file (Living)
  - `CHANGE_PROTOCOL.md` — Change governance (Living)

---

## Protocol Specifications

**`docs/protocol/`**

- **Authority:** Specification
- **Status:** Controlled
- **Layer:** 1 — Protocol Specifications
- **Modification:** Requires spec update + ADR for protocol-breaking changes

| Spec | Status | Authority |
|------|--------|-----------|
| `protocol-object.md` | **Frozen** | ADR-001 |
| `contribution-proof.md` | **Frozen** | ADR-001 |
| `identity-layer.md` | Accepted | ADR-002 |
| `identity-cryptography.md` | Accepted | ADR-003 |
| `identity-runtime.md` | **Frozen** | ADR-006 |

---

## Architecture Decision Records

**`docs/decisions/`**

- **Authority:** Decision
- **Status:** Controlled
- **Layer:** 1.5 — Decision Layer
- **Modification:** New ADR for new decisions, supersede for changes

See `.ai/ADR_REGISTRY.md` for complete list.

---

## Architecture Documents

**`protocol/architecture/`**

- **Authority:** Architecture
- **Status:** Reference
- **Layer:** 1.8 — Architecture
- **Modification:** Light review

---

## History & Archives

**`docs/history/`**

- **Authority:** Historical record
- **Status:** Archive
- **Layer:** A — Archive
- **Modification:** Read-only (never modify)
- **Organization:** Subdirectories per alpha version

**`docs/engineering-log/`**

- **Authority:** Engineering records
- **Status:** Archive (append-only)
- **Layer:** A.E — Engineering Archive
- **Modification:** New entries append, existing entries are frozen

---

## World Layer

**`docs/world/`**

- **Authority:** Conceptual (Canon-aligned)
- **Status:** Reference / Draft
- **Layer:** 0.7 — World
- **Modification:** Canon-first review

---

## Implementation

**`packages/`, `apps/`, `services/`**

- **Authority:** Code
- **Status:** Active (per component)
- **Layer:** 2 — Implementation
- **Modification:** Subject to change protocol

| Component | Status | Frozen By |
|-----------|--------|-----------|
| `packages/protocol-object/` | **Frozen** | ADR-001 |
| `packages/contribution-proof/` | **Frozen** | ADR-001 |
| `packages/identity/` | **Frozen** | ADR-006 |

---

## Legacy Directories

| Directory | Status | Reason |
|-----------|--------|--------|
| `proof-engine/` | **Legacy** | Tier-B simulated verifier, replaced by `@mood/contribution-proof` |
| `reputation-engine/` | **Legacy** | v0.1 reputation, replaced by future alpha |
| `contracts/` | **Legacy** | Earliest blockchain-era artifacts |
| `frontend/` | **Legacy** | Old frontend |
| `backend/` | **Legacy** | Old backend |
| `archive/` | **Legacy** | Historical artifacts (read-only) |

Each legacy directory MUST contain a `LEGACY.md` marker explaining its status.

---

## Temporary / Working

**`tmp/`, `output/`**

- **Authority:** None
- **Status:** Working
- **Modification:** Free
- **Note:** Should be ignored by tooling, not committed in most cases

---

## Quick Lookup by Authority

| Authority | Documents |
|-----------|-----------|
| **Highest** | `MOOD_CANON.md` |
| **High** | `AGENTS.md` |
| **Decision** | `docs/decisions/ADR-*.md` |
| **Specification** | `docs/protocol/*.md` |
| **Architecture** | `protocol/architecture/*.md` |
| **Navigation** | `.ai/*.md` |
| **Implementation** | `packages/`, `apps/`, `services/` |
| **Historical** | `docs/history/`, `docs/engineering-log/` |
| **Reference** | `docs/world/` |
| **Legacy** | `proof-engine/`, `reputation-engine/`, `contracts/`, etc. |

---

## Maintenance

This registry is updated when:

- A new document type is introduced
- A document type's lifecycle changes
- A new layer is added
- Legacy directories gain or lose their marker

Updates happen in the same commit as the document type change.
