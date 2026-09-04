# Document Governance Audit

**Date:** 2026-09-04
**Author:** MOOD Protocol Documentation Architect

---

## Purpose

Establish baseline understanding of current document state before introducing the Documentation Governance Layer.

---

## ADR Inventory

### All ADR Files

| File | Created | Status | Subject |
|-------|---------|--------|---------|
| `ADR-001-alpha001-freeze.md` | 2026-09-04 10:25 | Accepted | Freeze Alpha 001 Protocol Object |
| `ADR-002-identity-layer.md` | 2026-09-04 10:42 | Accepted | Identity Layer specification |
| `ADR-003-cryptographic-identity-design.md` | 2026-09-04 10:56 | Accepted | Crypto design |
| `ADR-004-identity-algorithm-selection.md` | 2026-09-04 11:36 | Accepted | Ed25519 selection |
| `ADR-005-cognitive-map.md` | 2026-09-04 12:31 | Accepted | AI Cognitive Map navigation layer |
| `ADR-005-alpha002b-freeze.md` | 2026-09-04 13:08 | **CONFLICT** | Alpha 002-B Identity Runtime freeze |

**Total ADRs:** 6
**Unique numbers:** 5 (collision at ADR-005)

---

## Critical Finding: ADR-005 Collision

### Two decisions claim ADR-005:

**ADR-005 (earlier, 12:31):**
- File: `docs/decisions/ADR-005-cognitive-map.md`
- Subject: AI Cognitive Map as Navigation Layer
- Created: 2026-09-04 12:31

**ADR-005 (later, 13:08):**
- File: `docs/decisions/ADR-005-alpha002b-freeze.md`
- Subject: Freeze Alpha 002-B Identity Runtime
- Created: 2026-09-04 13:08

### Resolution

**Keep earlier (cognitive-map) as ADR-005.**

**Rename later (alpha002b-freeze) to ADR-006.**

This preserves both decisions without destroying history.

### Files to update for rename:
- `docs/decisions/ADR-005-alpha002b-freeze.md` → `docs/decisions/ADR-006-alpha002b-freeze.md`
- Internal title: `# ADR-005` → `# ADR-006`
- References in `.ai/DECISION_INDEX.md`
- References in `.ai/COGNITIVE_MAP.md`
- References in `.ai/FILE_INDEX.md`
- References in `.ai/STATUS.md`

---

## Document Status Distribution

### By Authority Layer

| Layer | Files | Status Control |
|-------|-------|----------------|
| Canon | `MOOD_CANON.md` | Immutable |
| Agent Behavior | `AGENTS.md` | Controlled |
| AI Navigation | `.ai/*.md` | Living |
| Protocol Specs | `docs/protocol/*.md` | Controlled |
| ADRs | `docs/decisions/*.md` | Controlled |
| History | `docs/history/**` | Frozen |
| Engineering Logs | `docs/engineering-log/*.md` | Archive |

### Problems Identified

1. **ADR Collision:** Two ADR-005 (critical — fixing in this task)
2. **No ADR Registry:** AI agents must search manually
3. **No Document Status Registry:** No single source of truth for document lifecycle
4. **No Change Protocol:** Unclear how to make and record decisions
5. **Cognitive Layer Drift:** AI layer became stale after Alpha 002-B (fixed in cognitive sync task)

---

## Governance Gap Analysis

| Gap | Severity | Resolution |
|-----|----------|------------|
| No ADR registry | High | Create `.ai/ADR_REGISTRY.md` |
| ADR collision | Critical | Rename ADR-005 → ADR-006 |
| No document status registry | Medium | Create `.ai/DOCUMENT_STATUS.md` |
| No change protocol | Medium | Create `.ai/CHANGE_PROTOCOL.md` |
| No documentation rules for AI | Medium | Update `.ai/AI_RULES.md` |
| Legacy files unmarked | Low | Create `contracts/LEGACY.md` (done in cognitive sync) |

---

## Recommended Governance Structure

```
Canon (Layer 0)
    ↓
Governance Layer (Layer G)
    ├── ADR Registry
    ├── Document Status Registry
    └── Change Protocol
    ↓
AI Cognitive Layer (Layer AI)
    ├── Cognitive Map
    ├── Project State
    ├── Status
    └── File Index
    ↓
Protocol Specifications (Layer 1)
    ↓
Implementation (Layer 2)
    ↓
Archives (Layer A)
```

---

*Audit complete. Action items defined.*
