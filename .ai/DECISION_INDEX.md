# MOOD Decision Index

**Records all Architecture Decision Records (ADRs) and their status.**

---

## Decision Format

Each decision follows this format:

```markdown
## ADR-XXX: Title

**Status:** [Accepted/Rejected/Superseded]
**Date:** YYYY-MM-DD

### Decision
What was decided.

### Reason
Why this decision was made.

### Consequences
Positive and negative impacts.
```

---

## ADR-001: Freeze Alpha 001 Protocol Object Model

**Status:** Accepted
**Date:** 2026-09-04

### Decision
Freeze Protocol Object Alpha 001.

### Reason
A protocol requires stable historical primitives. Future evolution must extend the protocol, not rewrite previous milestones.

### Consequences
**Positive:**
- Reproducible history
- Stable references
- Easier network compatibility

**Negative:**
- Future changes require new alpha versions

### Scope
Frozen as-is:
- v0.1 object envelope (6 keys)
- ID derivation (SHA-256 → 24 hex)
- Hash engine location (`@mood/contribution-proof`)
- Verification model (recomputation, not trust)

**Archive:** `docs/history/alpha-001/`

---

## ADR-002: Introduce Identity Layer in Alpha 002

**Status:** Accepted
**Date:** 2026-09-04

### Decision
Introduce Identity Layer as Alpha 002, answering "who created the object."

### Reason
The Protocol Object (Alpha 001) provides content integrity but not attribution. Identity adds the "who" dimension.

### Key Decisions
1. Signature is an **extension alongside** the object, never inside the ID-derived content
2. Identity ≠ Reputation (identity enables attribution only)
3. Sign the canonical object content, never a database record

### Consequences
**Positive:**
- Clear attribution model
- Separation of identity and reputation
- Consistent with Canon

**Negative:**
- Key management complexity
- No aggregation yet (future concern)

**Spec:** `docs/protocol/identity-layer.md`

---

## ADR-003: Cryptographic Identity Design

**Status:** Accepted
**Date:** 2026-09-04

### Decision
Accept the Alpha 002-A cryptographic design with the following choices:

1. **Key Model:** `Node ID = hash(public key)`
2. **Signing Model:** Content-signing (sign the canonical object digest)
3. **Threat Model:** Defined attack vectors and mitigations
4. **Key Lifecycle:** Generation, usage, rotation, revocation

### Reason
A sound cryptographic design must precede implementation to avoid security mistakes.

### Consequences
**Positive:**
- Clear security boundaries
- Defined key management approach
- Algorithm selection deferred to implementation

**Negative:**
- Some design choices left open for ADR-004

**Spec:** `docs/protocol/identity-cryptography.md`

---

## ADR-004: Identity Algorithm Selection

**Status:** Accepted
**Date:** 2026-09-04

### Decision
**Ed25519 is the Alpha 002 identity algorithm.**

### Evaluation Criteria

| Criterion | Ed25519 | secp256k1 | BLS |
|-----------|---------|-----------|-----|
| Native Node support | ✓ Yes | ✗ No | ✗ No |
| Deterministic | ✓ RFC 8032 | ⚠ RFC 6979 | ✓ Yes |
| Signature size | 64 bytes | ~70-72 bytes | 96 bytes |
| Dependencies | None | Required | Required |

### Why Ed25519

1. **Zero new dependencies** — Node native `crypto` module
2. **Deterministic signatures** — Same key + digest = identical signature
3. **Already deployed** — Matches existing node runtime
4. **Fastest verification** — 64-byte fixed-size signatures

### Why Not secp256k1
- Recoverable signatures solve problems MOOD doesn't have
- Requires third-party library
- ECDSA malleability concerns

### Why Not BLS
- Signature aggregation is for Alpha 003+ (not needed now)
- Requires third-party library
- Youngest cryptographic assumptions

### Frozen Formats

```javascript
// Key encoding
publicKey = base64(raw 32 bytes)
privateKey = base64(64 bytes: seed ‖ publicKey)

// Node ID
mood:node:<64 hex> = sha256('1|' + networkId + '|' + publicKey)

// Signature
sign(sha256(canonicalObjectDigest)) → base64(64 bytes)
```

**Spec:** `docs/protocol/identity-cryptography.md`

---

## ADR-005: AI Cognitive Map as Navigation Layer

**Status:** Accepted
**Date:** 2026-09-04

### Decision
Establish `MOOD_AI_COGNITIVE_MAP.md` and `.ai/` as the AI Agent Navigation Layer between the Canon and implementation.

### Reason
Future AI agents need a fast, machine-readable snapshot of current cognitive state without re-deriving settled conclusions.

### Principle

```
Canon (defines truth)
    ↓
AGENTS (defines behavior)
    ↓
Cognitive Map (defines current state)
    ↓
Code (implements)
```

### Maintenance Rule
Updated only after:
1. Milestone accepted
2. Milestone frozen
3. ADR decision made

### Consequences
**Positive:**
- Faster agent onboarding
- Reduced context loss
- Consistent terminology
- Clear open/forbidden boundaries

**Negative:**
- Requires active maintenance
- Risk of stale maps

---

## ADR-006: Freeze Alpha 002-B Identity Runtime

**Status:** Accepted
**Date:** 2026-09-04
**Note:** Originally created as ADR-005-alpha002b-freeze.md, but a numbering collision with ADR-005-cognitive-map.md required renumbering. The decision content and acceptance are unchanged.

### Decision
Freeze the Alpha 002-B Identity Runtime as immutable protocol history.

### Reason
The identity runtime has been:
- Implemented (commit `0af6f83`)
- Accepted (WorkBuddy independent verification)
- Validated (26/26 identity tests passing)
- Secured (no private key leakage)

### Scope
| File | Purpose |
|------|---------|
| `docs/decisions/ADR-006-alpha002b-freeze.md` | The actual ADR document (renamed from ADR-005-alpha002b-freeze.md due to collision) |

**Implementation Report:** `docs/history/MOOD_ALPHA002B_IMPLEMENTATION_REPORT.md`
**Acceptance Report:** `docs/history/alpha-002-b/MOOD_ALPHA002B_IDENTITY_RUNTIME_ACCEPTANCE.md`

### Consequences
**Positive:**
- Stable identity reference
- Reproducible implementation
- Future compatibility for Alpha 002-C+

**Negative:**
- Bug fixes require new ADR
- Future changes require new protocol versions

### Forbidden Actions (Without New ADR)
- Modifying `packages/identity/src/` (except tests)
- Changing identity CLI/API interface
- Changing signature format
- Changing key derivation algorithm

---

## Pending Decisions

### Key Rotation
**Status:** OPEN
**Impact:** High

Core tension: if `Node ID = hash(public key)`, rotation changes the ID.

Options:
1. Stable ID + key history indirection
2. Accept ID change on rotation
3. Hierarchical key structure

### Key Recovery
**Status:** OPEN
**Impact:** High

Options:
1. Self-sovereignty: no recovery, new identity
2. Social recovery: threshold key sharing
3. Institutional recovery: trusted third party

### Multi-Device Identity
**Status:** OPEN
**Impact:** Medium

Question: Can one node identity span multiple devices?

---

## Superseded Decisions

None currently.

---

## Decision Index Summary

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| ADR-001 | Alpha 001 Freeze | ✓ Accepted | 2026-09-04 |
| ADR-002 | Identity Layer | ✓ Accepted | 2026-09-04 |
| ADR-003 | Crypto Design | ✓ Accepted | 2026-09-04 |
| ADR-004 | Algorithm Selection | ✓ Accepted | 2026-09-04 |
| ADR-005-cognitive-map | AI Navigation Layer | ✓ Accepted | 2026-09-04 |
| ADR-006-alpha002b-freeze | Alpha 002-B Freeze | ✓ Accepted | 2026-09-04 |
| — | Key Rotation | OPEN | — |
| — | Key Recovery | OPEN | — |
| — | Multi-Device Identity | OPEN | — |

---

## How to Add a Decision

1. Create `docs/decisions/ADR-XXX-title.md`
2. Follow the format above
3. Add to this index
4. Commit with message: `docs(decision): ADR-XXX title`
5. Update `MOOD_AI_COGNITIVE_MAP.md` if applicable
