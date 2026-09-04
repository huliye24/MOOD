# ADR-002: Introduce Identity Layer in Alpha 002

**Status:** Proposed
**Date:** 2026-09-04
**Specification:** [`docs/protocol/identity-layer.md`](../protocol/identity-layer.md)

## Decision

MOOD will introduce cryptographic node identity as the foundation for
issuer verification.

## Reason

Alpha 001 proves object integrity — *what* the object says, verified by
hash recomputation.

Alpha 002 proves object authorship — *who* minted it, verified by
signature.

Without identity, `issuer.nodeId` is a name, not a proof. With it, every
signed object carries attributable authorship that any node can verify
without a central authority.

## Consequences

Positive:

- stronger trust model — authorship is verifiable, not declared
- verifiable authorship — every signed object names a proven minting node
- decentralized identity — no registrar, no issuer of record; identity
  is key possession verified by cryptography

Negative:

- key management complexity — nodes must generate, store, and eventually
  rotate keys; lost keys, stolen keys, and multi-device use all become
  live concerns
- larger verification surface — signature format, key formats, and
  identity objects must be specified, implemented, and reviewed before
  they can be trusted

## Scope

This ADR authorizes the **specification** of the Identity Layer. It does
not authorize implementation. Implementation begins only after
specification review, per the
[Alpha 002 roadmap](../history/alpha-002-roadmap.md).
