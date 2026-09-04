# MOOD Protocol Alpha 002 Roadmap

**Status:** Specification phase — not implemented
**Date:** 2026-09-04
**Specification:** [`docs/protocol/identity-layer.md`](../protocol/identity-layer.md)
**Decision record:** [ADR-002](../decisions/ADR-002-identity-layer.md)

## Goal

Identity and Authenticity Layer.

Alpha 001 proved *what* an object says. Alpha 002 proves *who* minted it:

```text
Alpha 001 (FROZEN)         Alpha 002 (PLANNED)
Protocol Object            Identity Signature
"What is the object?"      "Who created the object?"
```

## Milestones

1. **Identity Object Specification** — final field set, ID derivation,
   and canonical form of the identity object
2. **Key Management Design** — generation, storage, rotation, and
   revocation of node key pairs
3. **Object Signature Design** — signature format, signing target
   (full content digest), and attachment structure
4. **Verification Rules** — the signed-mode verification path and its
   interaction with unsigned Alpha 001 objects
5. **Security Review** — threat model validation before any
   implementation is accepted

Each milestone gets its own review gate. No milestone may modify the
frozen Alpha 001 surface — the v0.1 envelope, the ID derivation, the
hash engine location, or the verification model.

## Not included

- P2P
- Consensus
- Governance
- Token

These remain future alpha scope, per the
[Alpha 001 boundary](alpha-001/boundary.md).
