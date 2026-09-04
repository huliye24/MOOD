# ADR-001: Freeze Alpha 001 Protocol Object Model

**Status:** Accepted
**Date:** 2026-09-04

## Decision

Freeze Protocol Object Alpha 001.

## Reason

A protocol requires stable historical primitives. Future evolution must
extend the protocol, not rewrite previous milestones.

## Consequences

Positive:

- reproducible history
- stable references
- easier network compatibility

Negative:

- future changes require new alpha versions

## Scope of the freeze

Frozen as-is, per the [Alpha 001 boundary](../history/alpha-001/boundary.md):

- the v0.1 object envelope — six keys, closed payload schema
- the ID derivation — SHA-256 over canonical content, first 24 hex
  characters
- the hash engine — all hashing and canonicalization live in
  `@mood/contribution-proof`, imported by the object layer
- the verification model — recomputation, not trust

Archive: [`docs/history/alpha-001/`](../history/alpha-001/README.md)
