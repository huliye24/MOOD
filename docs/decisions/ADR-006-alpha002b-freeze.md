# ADR-006: Freeze Alpha 002-B Identity Runtime

**Status:** Accepted
**Date:** 2026-09-04

---

## Context

MOOD Protocol Alpha 002-B Identity Runtime has been:

1. **Implemented** — commit `0af6f83` (`feat(identity): implement alpha 002 cryptographic identity runtime`)
2. **Accepted** — independent verification passed (WorkBuddy acceptance report)
3. **Validated** — 26/26 identity tests passing
4. **Secured** — security boundary verified, no private key leakage

The implementation has reached the milestone of "independently verified and stable".

---

## Decision

**Freeze the Alpha 002-B Identity Runtime as immutable protocol history.**

The following components transition from `ACTIVE` to `FROZEN`:

| Component | Location | Frozen |
|-----------|----------|--------|
| Identity package | `packages/identity/` | ✓ |
| Identity CLI | `apps/mood-cli/src/commands/identity.js` | ✓ |
| Identity API | `services/node-api/src/routes/identity.js` | ✓ |
| Identity spec | `docs/protocol/identity-runtime.md` | ✓ |
| Implementation report | `docs/history/MOOD_ALPHA002B_IMPLEMENTATION_REPORT.md` | ✓ |
| Acceptance report | `docs/history/alpha-002-b/MOOD_ALPHA002B_IDENTITY_RUNTIME_ACCEPTANCE.md` | ✓ |

---

## Reason

### Why Freeze Now

1. **Independent verification passed** — Acceptance agent confirms correctness
2. **All tests pass** — 26/26 identity tests
3. **Security boundary proven** — Private key never leaves local storage
4. **Alpha 001 compatibility preserved** — Frozen surface unchanged
5. **Future milestones ready** — Alpha 002-C and beyond have stable foundation

### Why Freeze at All

A protocol without frozen milestones becomes:

- Hard to reference (no stable anchor)
- Prone to silent breakage
- Difficult to evolve consistently
- Unclear what is authoritative

Freezing creates **stable references** that future development builds upon.

---

## Consequences

### Positive

- **Stable identity reference** — Future code can rely on Alpha 002-B behavior
- **Reproducible implementation** — Same code can be re-deployed
- **Future compatibility** — Alpha 002-C and Alpha 003 build on this surface
- **Clear authority** — When in doubt, this is the truth
- **Reduced ambiguity** — AI agents have a clear "done" point

### Negative

- **Future changes require new protocol versions** — Cannot modify frozen surface
- **Bug fixes need new milestones** — Even critical fixes require ADR
- **Storage cost** — Archive must be preserved permanently

### Mitigations

- Bug fixes are handled via new ADR and new alpha version
- Archive structure preserves both frozen and live paths
- AI navigation layer points to frozen surface for clarity

---

## Frozen Surface

### What is Frozen

```
@Mood/identity package
├── src/identity.js          (FROZEN)
├── src/key-manager.js       (FROZEN)
├── src/signer.js            (FROZEN)
├── src/verifier.js          (FROZEN)
├── src/serializer.js        (FROZEN)
└── src/index.js             (FROZEN - root API)

apps/mood-cli
└── src/commands/identity.js (FROZEN API contract)

services/node-api
└── src/routes/identity.js   (FROZEN API contract)

docs/protocol
└── identity-runtime.md      (FROZEN spec)
```

### What Remains Active

```
- packages/identity/src/tests/        (can add tests, not modify frozen impl)
- Identity spec can be EXTENDED (not modified)
- New milestones build on top
```

---

## Relationship to Other ADRs

| ADR | Relationship |
|-----|--------------|
| ADR-001 (Alpha 001 Freeze) | Sibling freeze — defines object layer |
| ADR-002 (Identity Layer) | Predecessor — defines identity concept |
| ADR-003 (Crypto Design) | Predecessor — defines key model |
| ADR-004 (Ed25519 Selection) | Predecessor — defines algorithm |
| ADR-005 (Cognitive Map) | Sibling — AI navigation layer |
| **ADR-006 (Alpha 002-B Freeze)** | **This ADR** — defines executable identity |
| ADR-(future) (Alpha 002-C Plan) | Successor — will build on this freeze |

---

## Forbidden Actions

After this freeze, the following actions **require a new ADR**:

1. Modifying any file under `packages/identity/src/` (except tests)
2. Changing the identity CLI command interface
3. Changing the `GET /identity` API response
4. Changing the signature format
5. Changing the key derivation algorithm
6. Changing the Node ID derivation

---

## Allowed Actions (Future)

Future milestones may:

1. Add new tests to `packages/identity/src/tests/`
2. Build on top of the public API
3. Create new identity-related packages
4. Extend the spec with new layers
5. Create Alpha 002-C implementation

---

## Related Documents

| Document | Location |
|----------|----------|
| Freeze Audit | `docs/engineering-log/alpha-002-b-freeze-audit.md` |
| Archive | `docs/history/alpha-002-b/` |
| Implementation Report | `docs/history/MOOD_ALPHA002B_IMPLEMENTATION_REPORT.md` |
| Acceptance Report | `docs/history/alpha-002-b/MOOD_ALPHA002B_IDENTITY_RUNTIME_ACCEPTANCE.md` |

---

## Decision Record

This ADR establishes:

> Alpha 002-B Identity Runtime is the **frozen cryptographic identity foundation** of MOOD Protocol.

Future milestones extend this. None rewrite it.

---

**Accepted:** 2026-09-04
**Authority:** MOOD Protocol Release Architect
