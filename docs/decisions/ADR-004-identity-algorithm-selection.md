# ADR-004: Identity Algorithm Selection

**Status:** Accepted
**Date:** 2026-09-04
**Task:** Alpha 002-B — Cryptographic Identity Implementation
**Resolves:** the *Recommendation Pending* held open by
[ADR-003](ADR-003-cryptographic-identity-design.md) and
[Alpha 002-A roadmap](../history/alpha-002-a-roadmap.md) step 1
(Algorithm Review)
**Specification:** [`docs/protocol/identity-cryptography.md`](../protocol/identity-cryptography.md)

## Decision

**Ed25519 is the Alpha 002 identity algorithm.**

## Context

The Alpha 002-A design evaluated three candidates and deliberately chose
none, waiting for implementation-level facts. Those facts are now on the
table: this repository already runs an Ed25519 identity (tweetnacl in
the node runtime, `mood init`, invitation signing), and Node ships
Ed25519 natively since v12/v18-stable.

## Evaluation

| Criterion | Ed25519 | secp256k1 | BLS (12-381) |
|---|---|---|---|
| Security assumptions | Schnorr over Curve25519, ~128-bit; conservative, deployment-hardened since 2011 (SSH, TLS 1.3, Signal, WireGuard, Solana, Fn) | ECDSA over secp256k1; ~128-bit; Bitcoin/Ethereum lineage | Pairing-based; youngest assumptions; smaller deployment base |
| Native Node support | **Yes — `crypto` module, zero dependencies** | No — requires a third-party library | No — requires a third-party library |
| Determinism | **Yes — RFC 8032 mandates deterministic nonces** | Not natively — requires RFC 6979 discipline to avoid nonce-reuse key leakage | Yes (typically) |
| Signature size / speed | 64 bytes; fastest verification of the three; fixed-size, malleability-free | ~70–72 bytes DER (variable); ECDSA is malleable without extra care | 96 bytes; slowest (pairing); enables aggregation |
| Ecosystem for a protocol | Ubiquitous in modern protocol work; every language has a conformant implementation | Strong in blockchain tooling specifically | Niche; standardization still maturing (IETF BLS drafts) |
| Implementation complexity here | **Lowest — `generateKeyPairSync` / `sign` / `verify`, no supply chain added** | Medium — new dependency, DER handling, recovery unused | Highest — new dependency, pairing math, aggregation unused |

### Why not secp256k1

Its one differentiator — recoverable signatures (public-key recovery
from a signature) and the Bitcoin/Ethereum lineage — solves problems
MOOD does not have in Alpha 002: we always know the claimed issuer
(verification loads the issuer's public identity). It lacks native Node
support, and plain ECDSA brings malleability and nonce-reuse hazards
that Ed25519 eliminates by construction.

### Why not BLS

Its differentiator — signature aggregation — is a network-layer
concern (many signatures → one, for sync and consensus), which belongs
to Alpha 003+ if it ever becomes load-bearing. Paying a third-party
dependency and the youngest cryptographic assumptions today for a
capability we cannot use yet would be premature.

### Why Ed25519

1. **Zero new cryptographic dependencies** — Node native `crypto`. The
   smallest possible supply-chain surface for the first implementation
   of the trust layer.
2. **Deterministic (RFC 8032)** — same key + same digest → identical
   signature bytes on every machine. Necessary for a protocol where
   third parties re-verify.
3. **Already the deployed algorithm** — the node runtime, `mood init`,
   and invitation signing all use Ed25519 today. Selecting Ed25519 lets
   the protocol identity **adopt existing node keys** instead of
   forcing a rekey of every live node.
4. **Fast, small, hard to misuse** — 64-byte fixed-size signatures,
   fastest verification, no malleability, no nonce management.

## Consequences

Positive:

- implementation lands with no new dependency and no rekey for
  existing nodes (adoption preserves node IDs)
- deterministic signatures make verification reproducible anywhere
- the choice matches the broader protocol ecosystem

Negative:

- no signature aggregation now or later without a second algorithm
  (acceptable — aggregation is not an Alpha 002 requirement)
- key recovery (secp256k1-style) is unavailable — irrelevant, since
  MOOD verification always knows the claimed issuer

## Frozen alongside this decision (implementation format)

Recorded here so Alpha 002-C integrates against a stable target:

- **Key encoding:** publicKey = base64 raw 32 bytes; stored privateKey =
  base64 64 bytes (`seed ‖ publicKey`) — the deployed encoding, so one
  node keeps one key across every layer.
- **Node ID:** `mood:node:<64 hex>` = `sha256('1|' + networkId + '|' +
  publicKey)`, computed with the shared hash engine
  (`@mood/contribution-proof`). The deployed derivation wins over the
  spec's speculative example — identity continuity beats reinvention.
  This resolves identity-cryptography.md open question 2.
- **Signature target:** the full 256-bit canonical object digest (64
  hex chars) — never the truncated 24-hex object ID, never a database
  record. `signObjectHash` rejects any non-digest input.
- **Signature encoding:** base64, 64 bytes, over the 32 digest bytes.
- **Interop:** signatures are byte-identical with any conformant
  Ed25519 implementation — verified bidirectionally against the node
  runtime's tweetnacl in the Alpha 002-B test suite.

## Scope

This ADR selects the algorithm and freezes the wire formats. It does
not modify the frozen Alpha 001 surface — object schema, ID derivation,
and the hash engine location remain exactly as ADR-001 froze them.
