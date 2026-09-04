# Alpha 002-A Roadmap

**Status:** Design review phase — not implemented
**Date:** 2026-09-04
**Specification:** [`docs/protocol/identity-cryptography.md`](../protocol/identity-cryptography.md)
**Decision record:** [ADR-003](../decisions/ADR-003-cryptographic-identity-design.md)
**Predecessor:** [Alpha 002 Roadmap](alpha-002-roadmap.md) — Identity and Authenticity Layer

## Goal

Cryptographic Identity Foundation.

Freeze the trust model — key pairs, identifiers, signature format,
verification rules — before any implementation exists.

```text
Alpha 001    Object Integrity              FROZEN
Alpha 002    Identity Specification        ACCEPTED
Alpha 002-A  Cryptographic Design          ← this roadmap
Alpha 002-B  Implementation                future
```

## Steps

1. **Algorithm Review** — decide Ed25519 / secp256k1 / BLS against
   implementation-level benchmarks and library maturity; resolve the
   current *Recommendation Pending*
2. **Identity Format** — final Node ID derivation, length, and prefix
   convention (reconciled with the deployed `mood:node:<hex>`)
3. **Signature Format** — signature structure, algorithm field, key
   reference, and attachment layout alongside the frozen envelope
4. **Verification Rules** — signed-mode verification, replay defenses
   (timestamp / nonce / version), and the unsigned-object fallback path
5. **Security Review** — adversarial review of the full model before
   Alpha 002-B begins

Each step gets its own review gate. None may modify the frozen Alpha
001 surface — the v0.1 envelope, the ID derivation, the hash engine
location, or the verification model.

## Future

**Alpha 002-B: Implementation.**

Only after the five steps above complete. Code begins against a frozen
cryptographic target, never against a moving one.
