# MOOD ADR Registry

**This file is an index.**

Individual ADR files remain authoritative for their own decisions.

---

## Purpose

Single navigation index for all Architecture Decision Records.

This file exists so that AI agents and human contributors can:

1. **Locate** any ADR by number, subject, or status
2. **Audit** ADR coverage and gaps
3. **Detect** numbering collisions
4. **Track** decision lineage
5. **Resolve** references quickly

---

## Priority Order

```
ADR document
    > ADR registry
```

The registry is a **navigation aid**, not an authority.

If a registry entry disagrees with an ADR document, the document wins.

---

## Registry Format

Each entry follows:

```markdown
## ADR-XXX

**Title:** <decision title>
**Status:** Accepted | Frozen | Open | Superseded
**Date:** YYYY-MM-DD
**Authority:** <what makes this decision authoritative>
**File:** `docs/decisions/ADR-XXX-...`
**Summary:** <one-line summary>
```

---

## Registry Entries

## ADR-001

**Title:** Freeze Alpha 001 Protocol Object Model

**Status:** Accepted / Frozen

**Date:** 2026-09-04

**Authority:** First accepted milestone

**File:** `docs/decisions/ADR-001-alpha001-freeze.md`

**Summary:** Established immutable Alpha 001 object model (v0.1 envelope, SHA-256 ID, hash engine location).

---

## ADR-002

**Title:** Introduce Identity Layer in Alpha 002

**Status:** Accepted

**Date:** 2026-09-04

**Authority:** Specification-level decision

**File:** `docs/decisions/ADR-002-identity-layer.md`

**Summary:** Added "who" dimension to Protocol Object. Signature is extension alongside object, never inside ID-derived content.

---

## ADR-003

**Title:** Cryptographic Identity Design

**Status:** Accepted

**Date:** 2026-09-04

**Authority:** Design-level decision

**File:** `docs/decisions/ADR-003-cryptographic-identity-design.md`

**Summary:** Defined key model (Node ID = hash(public key)), content-signing model, threat model, key lifecycle.

---

## ADR-004

**Title:** Identity Algorithm Selection (Ed25519)

**Status:** Accepted

**Date:** 2026-09-04

**Authority:** Implementation-level decision

**File:** `docs/decisions/ADR-004-identity-algorithm-selection.md`

**Summary:** Selected Ed25519 for native Node crypto support, deterministic signatures, no dependencies.

---

## ADR-005

**Title:** AI Cognitive Map as Navigation Layer

**Status:** Accepted

**Date:** 2026-09-04

**Authority:** Process-level decision

**File:** `docs/decisions/ADR-005-cognitive-map.md`

**Summary:** Established `.ai/` and `MOOD_AI_COGNITIVE_MAP.md` as the AI Agent Navigation Layer between Canon and implementation.

**Note:** This is the original ADR-005. A naming collision occurred when a second ADR was filed under the same number. See ADR-006.

---

## ADR-006

**Title:** Freeze Alpha 002-B Identity Runtime

**Status:** Accepted / Frozen

**Date:** 2026-09-04

**Authority:** Implementation-level freeze decision

**File:** `docs/decisions/ADR-006-alpha002b-freeze.md`

**Summary:** Froze Alpha 002-B Identity Runtime (`packages/identity/`, CLI, API) as immutable protocol history.

**Note:** Originally created as `ADR-005-alpha002b-freeze.md`. Renumbered to ADR-006 due to collision with ADR-005-cognitive-map.md. Renumbering executed in Documentation Governance Alpha 001 task. Decision content and acceptance unchanged.

---

## Pending Decisions (No Number Yet)

| Subject | Tentative Number | Status |
|---------|------------------|--------|
| Object Signature Integration (Alpha 002-C) | ADR-007 | PLANNING |
| Key Rotation Strategy | ADR-008 (TBD) | OPEN |
| Key Recovery Mechanism | ADR-009 (TBD) | OPEN |
| Multi-Device Identity | ADR-010 (TBD) | OPEN |

---

## Superseded Decisions

None currently.

---

## Registry Maintenance

### When to Update

- New ADR accepted → add entry to registry
- ADR status changes → update entry
- File renamed → update entry path
- ADR becomes superseded → move to Superseded section

### Update Rule

```
1. Create/modify the ADR file in docs/decisions/
2. Update this registry in the SAME commit
3. Update other references (.ai/COGNITIVE_MAP.md, .ai/STATUS.md, etc.) in the SAME commit
4. Verify with grep audit
```

### Renumbering Rule (from PART 4)

If two ADRs claim the same number:

1. Keep the earliest-created ADR with the original number
2. Rename later ADR to next available number
3. Update the renamed file's internal title
4. Update all references in `.ai/`, `docs/`, and archives
5. Preserve Git history (use `git mv`, do not delete + recreate)
6. Add a renumbering note in the ADR's body

---

## Quick Lookup by Status

| Status | Count | ADRs |
|--------|-------|------|
| Accepted | 4 | ADR-002, ADR-003, ADR-004, ADR-005 |
| Accepted / Frozen | 2 | ADR-001, ADR-006 |
| Open | 0 | — |
| Superseded | 0 | — |

---

## Quick Lookup by Subject

| Subject | ADR |
|---------|-----|
| Protocol Object freeze | ADR-001 |
| Identity Layer | ADR-002 |
| Cryptographic Design | ADR-003 |
| Algorithm Selection | ADR-004 |
| AI Cognitive Layer | ADR-005 |
| Identity Runtime freeze | ADR-006 |

---

*This registry is a navigation index, not a source of truth. The individual ADR files are authoritative for their own decisions.*
