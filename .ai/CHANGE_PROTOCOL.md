# MOOD Change Protocol

**Purpose:** Define how changes flow through MOOD's documentation and implementation layers.

This protocol prevents silent changes, cognitive debt, and architectural drift.

---

## Principle

**No silent changes.**

Every meaningful change must:

1. Be recorded as a decision
2. Be communicated to AI agents
3. Be traced through the document lifecycle

The protocol exists to preserve the **reproducibility** and **understandability** of MOOD across time and across AI agents.

---

## Change Flow

### Layer 1: New Design

```
Idea
    ↓
Specification (docs/protocol/)
    ↓
ADR (docs/decisions/)
    ↓
Review
    ↓
Accepted
```

**Steps:**

1. **Idea** — captured as discussion or proposal
2. **Specification** — formalized in `docs/protocol/<topic>.md`
3. **ADR** — created in `docs/decisions/ADR-XXX-title.md` referencing the spec
4. **Review** — by human + AI cognitive layer
5. **Accepted** — ADR marked Accepted, registry updated

### Layer 2: Implementation

```
Specification Accepted
    ↓
Code (packages/, apps/, services/)
    ↓
Test (alongside code)
    ↓
Acceptance (independent verification)
    ↓
Frozen (if milestone complete)
```

**Steps:**

1. **Specification Accepted** — ADR is the gate
2. **Code** — written against frozen specifications
3. **Test** — unit + integration tests written before acceptance
4. **Acceptance** — independent verification (e.g., WorkBuddy)
5. **Frozen** — ADR documents the freeze

### Layer 3: Historical Update

```
Acceptance
    ↓
Archive (docs/history/<alpha>/)
    ↓
Cognitive Sync (.ai/)
    ↓
Registry Update
```

**Steps:**

1. **Acceptance** — milestone accepted
2. **Archive** — milestone history preserved in `docs/history/<alpha>/`
3. **Cognitive Sync** — `.ai/` updated to reflect reality
4. **Registry Update** — `.ai/ADR_REGISTRY.md` and `.ai/DOCUMENT_STATUS.md` updated

---

## Document-Specific Rules

### Canonical Documents (MOOD_CANON.md)

**Rule:** Cannot be modified directly.

**Process:**
1. Propose Canon amendment
2. Discuss at Canon level
3. New Canon version released (e.g., v0.3)
4. All downstream layers sync

### ADR Documents

**Rule:** One ADR per decision.

**Process:**
1. Use next available ADR number (check `.ai/ADR_REGISTRY.md`)
2. Create file in `docs/decisions/ADR-XXX-title.md`
3. Update registry in same commit
4. Update COGNITIVE_MAP, STATUS, DECISION_INDEX

### Protocol Specifications

**Rule:** Spec changes require ADR for protocol-breaking changes.

**Process:**
1. Edit `docs/protocol/<topic>.md`
2. If protocol-breaking: create ADR first
3. If protocol-compatible: edit + update FILE_INDEX status

### Cognitive Layer (`.ai/`)

**Rule:** Living documents, updated with each milestone.

**Process:**
1. After acceptance/freeze, update relevant `.ai/` files
2. Update ADR_REGISTRY and DOCUMENT_STATUS if needed
3. Commit with message: `docs(cognition): ...`

### Implementation (packages/, apps/, services/)

**Rule:** Modifications require ADR if they affect frozen surface.

**Process:**
1. Check if component is frozen (see `.ai/STATUS.md`)
2. If frozen: create new ADR or new alpha version
3. If active: code + test + acceptance flow

---

## Numbering Rules

### ADR Numbers

- Sequential, never reused
- Each ADR claims one number
- Registry is the source of truth for "next available number"
- Collision: renumber later ADR (see `.ai/ADR_REGISTRY.md` Renumbering Rule)

### Version Numbers

- Alpha versions: 001, 002, 002-A, 002-B, 002-C, 003...
- Document versions: v0.1, v0.2, v0.3...
- Cannot skip, cannot go backward

---

## Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` — new feature
- `docs` — documentation only
- `fix` — bug fix
- `refactor` — code restructure
- `test` — test only
- `chore` — tooling, dependencies

**Scopes:**
- `protocol` — protocol spec changes
- `identity` — identity layer
- `cognition` — AI navigation layer
- `decision` — ADR creation
- `governance` — documentation governance

---

## Forbidden Patterns

### Forbidden: Silent Changes

```
❌ Modify code without updating spec
❌ Modify spec without updating ADR
❌ Create ADR without updating registry
❌ Update registry without updating cognitive layer
```

### Forbidden: Duplicate Systems

```
❌ Create new concept for an existing one
❌ Re-derive a settled conclusion (check COGNITIVE_MAP first)
❌ Rename core concept without ADR
```

### Forbidden: Untracked Decisions

```
❌ Make a decision in a comment without ADR
❌ Make a decision in code without spec
❌ Make a decision in spec without ADR
```

---

## Cognitive Debt Prevention

**Cognitive debt** accumulates when the cognitive layer (`.ai/`) drifts from reality.

### Detection

Run cognitive drift audit:

```bash
# Find PLANNING markers on completed work
grep -r "PLANNING\|NOT STARTED" .ai/

# Find references to non-existent files
grep -r "ADR-005-alpha002b" .
```

### Resolution

If drift detected:

1. Sync `.ai/` files with repository reality
2. Update ADR_REGISTRY and DOCUMENT_STATUS
3. Run cognitive simulation test (5/5 must pass)
4. Commit as `docs(cognition): sync alpha-XXX`

### Prevention

After every milestone:

```
Acceptance → Archive → Cognitive Sync → Registry Update
```

This is the **MOOD lifecycle loop**. Skipping any step creates cognitive debt.

---

## Quick Reference

| Need to... | Follow... |
|------------|-----------|
| Propose new feature | Layer 1: Design |
| Add new ADR | `.ai/ADR_REGISTRY.md` Next-Available + Layer 1 |
| Modify frozen code | New ADR + new alpha |
| Update cognitive layer | Cognitive Sync flow |
| Resolve number collision | Renumber later ADR |
| Document legacy system | `LEGACY.md` marker |

---

*This protocol is the standard for all MOOD contributions. Violations are recorded as cognitive debt and corrected.*
