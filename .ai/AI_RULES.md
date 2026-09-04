# AI Agent Rules

**Rules specifically for AI agents working in this repository.**

---

## Core Rules

### Rule 1: Never Modify Frozen Protocol Without ADR

Frozen components **cannot be modified** without an Architecture Decision Record:

- `packages/protocol-object/` — FROZEN
- `packages/contribution-proof/` — FROZEN
- `docs/history/alpha-001/` — FROZEN

If you need to change a frozen component:
1. Propose the change
2. Create an ADR
3. Get acceptance
4. Then modify

### Rule 2: Never Treat Code as Authority Over Canon

Code has **no automatic authority**:

```
Canon > Specification > Implementation
```

If code and Canon disagree:
- The disagreement must be made explicit
- Canon is amended first
- System follows

### Rule 3: Never Claim Future Features Are Implemented

The following are **NOT implemented**:

- Governance system
- Reputation system (Alpha 004 design)
- Token or economy
- P2P networking
- Consensus mechanism
- Treasury or rewards

Do NOT write code that assumes these exist.

### Rule 4: Always Check Status Before Coding

Before implementing anything:

```
1. Read MOOD_CANON.md
2. Read AGENTS.md
3. Read MOOD_AI_COGNITIVE_MAP.md
4. Check .ai/STATUS.md for current milestone
5. Check .ai/DECISION_INDEX.md for relevant ADRs
6. Find the authority document for your task
```

### Rule 5: Prefer Specification Before Implementation

The order is:

```
1. Define in specification
2. Get approval if significant (ADR)
3. Then implement
```

Do not implement features without specification.

### Rule 6: Preserve Historical Decisions

When modifying files:

- Preserve existing decisions
- Add new decisions as ADRs
- Never silently overwrite history
- Keep commit messages clear

---

## Documentation Rules

### Rule 7: Never Create an ADR with an Existing Number

ADRs are numbered sequentially. Each number may be used only once.

Before creating an ADR:
1. Check `.ai/ADR_REGISTRY.md` for next available number
2. Never reuse a number, even for superseded decisions
3. Renumbering is allowed to resolve collisions (see Renumbering Rule)

### Rule 8: Always Update ADR Registry After ADR Creation

The ADR registry is the navigation index. Every ADR must be reflected.

When creating/modifying an ADR:
1. Create/modify file in `docs/decisions/`
2. Update `.ai/ADR_REGISTRY.md` in the SAME commit
3. Update `.ai/DECISION_INDEX.md` summary if applicable
4. Update `.ai/COGNITIVE_MAP.md` and `.ai/STATUS.md` if the decision changes protocol state

### Rule 9: Never Treat Registry as Authority

The registry is a navigation aid, not the source of truth.

```
ADR document  >  ADR registry
```

If a registry entry disagrees with an ADR document, the document wins.

### Rule 10: Always Distinguish Document Classes

Different document types have different modification rules:

| Class | Examples | Modification Rule |
|-------|----------|-------------------|
| **Canonical** | `MOOD_CANON.md` | Cannot modify. New version only. |
| **Agent** | `AGENTS.md`, `.ai/` | Controlled, follows change protocol |
| **Specification** | `docs/protocol/` | Spec change + ADR if protocol-breaking |
| **Decision** | `docs/decisions/ADR-*.md` | New ADR or supersede |
| **Architecture** | `protocol/architecture/` | Light review |
| **Implementation** | `packages/`, `apps/`, `services/` | Code + test + acceptance |
| **Archive** | `docs/history/`, `docs/engineering-log/` | Append-only |
| **Reference** | `docs/world/` | Canon-aligned review |
| **Legacy** | `proof-engine/`, `contracts/`, etc. | Do not extend |

### Rule 11: Never Make Silent Changes

Every meaningful change must be:

1. Recorded as a decision (ADR or spec change)
2. Reflected in the cognitive layer (`.ai/`)
3. Traced through the document lifecycle (see `.ai/CHANGE_PROTOCOL.md`)

Silent changes create cognitive debt.

### Rule 12: Always Follow the Lifecycle Loop

After every milestone:

```
Acceptance → Archive → Cognitive Sync → Registry Update
```

This loop is the **cognitive debt prevention protocol**.

---

## Terminology Rules

### Use These Terms

| Correct Term | Use For |
|--------------|---------|
| Protocol Object | The canonical data structure |
| Contribution Proof | Hash verification system |
| Node ID | Identity derived from `hash(public key)` |
| Ed25519 | The signing algorithm |
| FROZEN | Cannot modify without ADR |
| ACCEPTED | Specification complete |
| PLANNING | In planning phase |

### Do Not Use These Terms

| Incorrect | Correct | Reason |
|-----------|---------|--------|
| Application Record | Protocol Object | Terminology lock |
| Database Object | Protocol Object | Terminology lock |
| Proof Record | Contribution Proof | Terminology lock |
| Legacy ID | Node ID | Clarity |

---

## Reading Order Rules

When entering the repository:

```
1. .ai/START_HERE.md         ← Start here
2. MOOD_CANON.md              ← What is MOOD?
3. AGENTS.md                  ← How to behave
4. .ai/COGNITIVE_MAP.md      ← Current state
5. .ai/STATUS.md              ← What's implemented
6. [Authority doc]            ← Your specific task
7. [Implementation]           ← Code, if needed
```

---

## Working Rules

### Before Writing Code

1. **Understand the authority:** What document defines this feature?
2. **Check the status:** Is it frozen, accepted, planning, or open?
3. **Find the spec:** Is there a specification to implement?
4. **Check for ADRs:** Are there relevant decisions?

### While Writing Code

1. **Follow the spec:** Implementation must match specification
2. **Use fixed terminology:** See terminology rules above
3. **Add tests:** Every feature needs tests
4. **Update docs:** Update relevant documentation

### After Writing Code

1. **Verify frozen:** Did you modify any frozen components?
2. **Update cognitive map:** Move items from Open to Settled if applicable
3. **Create ADR if needed:** For significant changes
4. **Commit properly:** Clear commit messages

---

## Safety Rules

### Never Do These

- [ ] Claim a contract is deployed without evidence
- [ ] Claim treasury exists without evidence
- [ ] Claim governance is active without evidence
- [ ] Claim any system is live without evidence
- [ ] Modify frozen components without ADR
- [ ] Treat code as more authoritative than Canon
- [ ] Invent permanent architecture without specification

### Always Do These

- [ ] Read MOOD_CANON.md first
- [ ] Check MOOD_AI_COGNITIVE_MAP.md for settled items
- [ ] Create ADRs for significant decisions
- [ ] Update cognitive map when milestones complete
- [ ] Use fixed terminology
- [ ] Preserve historical decisions

---

## Anti-Patterns

### Anti-Pattern 1: Specification Bypass

```
❌ "The spec says X but I think Y is better, so I'll implement Y"
✓ "The spec says X. I propose changing it via ADR."
```

### Anti-Pattern 2: Code Authority

```
❌ "The code does X, so X must be correct"
✓ "The code does X. Does it match the spec? If not, fix the code."
```

### Anti-Pattern 3: Terminology Pollution

```
❌ "The Application Record should..."
✓ "The Protocol Object should..."
```

### Anti-Pattern 4: Claiming Future Features

```
❌ "Now that we have the governance module..."
✓ "The governance system (NOT YET IMPLEMENTED) would..."
```

### Anti-Pattern 5: Silent Canon Override

```
❌ [Code silently disagrees with Canon]
✓ [Code implements Canon; disagreement is explicit]
```

---

## Debugging Rules

If something seems wrong:

1. **Check the authority:** Is there a Canon or spec that defines this?
2. **Check the status:** Is this component frozen?
3. **Check the decisions:** Is there an ADR that applies?
4. **Check the terminology:** Am I using the right terms?
5. **Ask for clarification:** If in doubt, ask.

---

## Summary

```
✓ Read Canon first
✓ Follow specifications
✓ Use fixed terminology
✓ Create ADRs for changes
✓ Update cognitive map
✓ Preserve history
✗ Don't modify frozen components
✗ Don't treat code as authority
✗ Don't claim future features
```

---

**Remember:** Your job is to implement meaning that has already been defined.
Do not invent meaning.
