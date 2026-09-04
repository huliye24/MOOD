# Alpha 002-B Scope Boundary

**Status:** FROZEN

---

## Implemented in Alpha 002-B

### YES — Implemented and Tested

| Feature | Status |
|---------|--------|
| Identity creation | ✓ Complete |
| Key storage (local) | ✓ Complete |
| Public identity export | ✓ Complete |
| Object hash signing | ✓ Complete |
| Signature verification | ✓ Complete |
| CLI (`mood identity create` / `show`) | ✓ Complete |
| API (`GET /identity`) | ✓ Complete |
| Ed25519 algorithm | ✓ Complete (ADR-004) |
| Node ID derivation | ✓ Complete (ADR-003) |

---

## NOT Implemented in Alpha 002-B

### Alpha 002-C — Object Signature Integration

**Status:** PLANNING
**Milestone:** Next step

**Scope:**
- Sign Protocol Objects at creation
- Attach signature to object envelope
- Verify signature chain on object load

**Note:** Alpha 002-C is **integration only**. Signature format is already frozen in Alpha 002-B.

---

### Alpha 003 — Synchronization

**Status:** FUTURE
**Scope:**
- P2P identity propagation
- Multi-node synchronization
- Identity registry

---

### Alpha 004 — State Machine

**Status:** FUTURE
**Scope:**
- Network state with attribution
- Reputation aggregation
- State transitions

---

### Other Features (Out of Scope)

The following are **explicitly NOT** part of Alpha 002-B:

- [ ] Governance system
- [ ] Reputation system
- [ ] Token or economy
- [ ] P2P networking
- [ ] Consensus mechanism
- [ ] Treasury or rewards
- [ ] Staking or delegation
- [ ] Airdrops or distributions

---

## Boundary Enforcement

### Prohibited Actions

The following actions **MUST NOT** be done in Alpha 002-B scope:

1. **Modifying Alpha 001 frozen surface** — `packages/protocol-object/`, `packages/contribution-proof/`
2. **Modifying Alpha 002-B frozen surface** — `packages/identity/`, identity CLI/API
3. **Implementing Alpha 002-C** in Alpha 002-B commits
4. **Implementing future features** in Alpha 002-B commits
5. **Changing signature format** without ADR

### Future Pollution Prevention

When extending Alpha 002-B:

- Create new milestone (Alpha 002-C, Alpha 003, etc.)
- Build **on top** of Alpha 002-B surface
- Do **not** rewrite Alpha 002-B
- Document new behavior in new archive

---

## Boundary Diagram

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   ALPHA 002-B FROZEN SURFACE                     │
│                                                 │
│   ✓ Identity creation                            │
│   ✓ Local key storage                            │
│   ✓ Public identity export                       │
│   ✓ Object hash signing                          │
│   ✓ Signature verification                       │
│                                                 │
└─────────────────────────────────────────────────┘
                       │
                       │ (extension point)
                       ↓
┌─────────────────────────────────────────────────┐
│                                                 │
│   ALPHA 002-C (PLANNING)                         │
│                                                 │
│   → Object signature integration                │
│                                                 │
└─────────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────┐
│                                                 │
│   ALPHA 003 (FUTURE)                             │
│                                                 │
│   → Synchronization                             │
│                                                 │
└─────────────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────┐
│                                                 │
│   ALPHA 004 (FUTURE)                             │
│                                                 │
│   → State machine                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Test Coverage Boundary

Alpha 002-B's test coverage is bounded by what is implemented:

| Domain | Covered |
|--------|---------|
| Local identity creation | ✓ |
| Local key management | ✓ |
| Signing local object hashes | ✓ |
| Verifying local signatures | ✓ |
| CLI local operations | ✓ |
| API public identity | ✓ |
| Network identity sync | ✗ (Alpha 003) |
| Object envelope signing | ✗ (Alpha 002-C) |

---

*Boundary preserved as protocol history. Future development extends this scope.*
