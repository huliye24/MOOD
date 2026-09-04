# ADR-003: Cryptographic Identity Design

**Status:** Proposed
**Date:** 2026-09-04
**Specification:** [`docs/protocol/identity-cryptography.md`](../protocol/identity-cryptography.md)

## Decision

Define cryptographic identity before implementation.

## Reason

Protocol security requires a stable trust model. If the cryptographic
assumptions are still moving, every layer built on top of them —
signing, verification, storage, synchronization — inherits the
instability. Alpha 002-A fixes the trust model on paper first; Alpha
002-B implements against a frozen target.

## Consequences

Positive:

- clear security assumptions — the threat model, key model, and
  signature architecture are stated before code exists
- implementation guidance — Alpha 002-B codes against this document,
  not against improvisation
- future compatibility — algorithm evaluation and lifecycle design
  surface the rotation and versioning problems before they are
  load-bearing

Negative:

- more design time before coding — the protocol advances through
  review steps, not commits

## Scope

This ADR records the design decision only. The algorithm choice itself
stays **Recommendation Pending** until the [Alpha 002-A
roadmap](../history/alpha-002-a-roadmap.md) step 1 (Algorithm Review)
completes. No keys are generated, no signature code exists, and the
frozen Alpha 001 surface remains untouched.
