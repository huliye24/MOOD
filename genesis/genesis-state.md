# MOOD Network Genesis State

**Status:** Canonical record
**Phase:** Genesis Phase
**Version:** 0.1.0

---

## Overview

The Genesis State is the first verifiable state of the MOOD Network. It represents the moment when MOOD's foundational systems — contribution, proof, and reputation — first become legible as a coherent record.

MOOD does not begin with a token.
MOOD begins with contribution.

---

## The Genesis Principle

> A network is born not when its code is deployed, but when its first meaningful state is recorded and can be independently verified.

Bitcoin began with the Genesis Block.
Ethereum began with the Genesis State.
MOOD begins with the Genesis Contribution.

---

## What the Genesis State Is

The Genesis State is a collection of canonical records that describe:

1. **Who** made the first contribution
2. **What** the contribution was
3. **How** it was verified
4. **What** standing the contributor earned

These records are stored in the `genesis/` directory:

```
genesis/
├── genesis.json          # Network-level genesis metadata
├── contributors.json    # Genesis contributor identities
├── contributions.json    # Genesis contribution records
├── proofs.json          # Genesis proof records
├── reputation.json      # Genesis reputation records
└── genesis-hash.txt     # Cryptographic hash for verification
```

---

## What the Genesis State Is NOT

The Genesis State is **not**:

- ❌ A token distribution record
- ❌ A financial instrument
- ❌ A governance document
- ❌ A treasury record
- ❌ A claim of production operation

It is a **witness record** — a timestamped, verifiable declaration that the MOOD Protocol's core systems existed and had a defined initial state at a specific moment.

---

## The First Genesis Contribution

The first recorded contribution in MOOD is:

```
Title:    MOOD Protocol Architecture
Type:     Protocol Creation
Status:   Verified
```

This contribution represents the creation of:

- The conceptual model for contribution, proof, and reputation
- The initial protocol architecture
- The canonical documents that define MOOD's world

**Author:** Genesis Contributor (see `contributors.json`)

---

## The First Genesis Proof

Every contribution in MOOD requires verification. The first proof anchors the genesis contribution to a verifiable record:

```
Proof ID:       proof_genesis_001
Type:           Documentation Hash
Method:         SHA256
Status:         Verified
Evidence:       Source document timestamp
```

---

## The First Genesis Reputation

Verified contributions produce reputation. The first reputation record:

```
Contributor:    Genesis Contributor
Score:          10
Level:          Genesis
Reason:         Created initial MOOD Protocol architecture
```

This score is calculated by the Reputation Engine:

```
Score = Type Weight (Protocol = 10)
      × Proof Quality (Core Verification = 1.0)
      × Impact Factor (1.0)
      = 10
```

See `reputation-engine/rules/contribution-weight.md` for the full weight table.

---

## The Verification Chain

The genesis state forms a complete, traceable chain:

```
Contribution (genesis_001)
        ↓
Proof (proof_genesis_001)
        ↓
Reputation (score: 10, level: Genesis)
```

Each step depends on the previous:

- A contribution must exist before it can be proven.
- A proof must be verified before reputation can be calculated.
- Reputation accumulates as verified contributions grow.

---

## Settlement Layer Status

The canonical settlement layer specification (`protocol/architecture/SETTLEMENT_LAYER.md`) is currently in draft.

If ratified, the Genesis State will be anchored to a public testnet, producing:

- A verified on-chain commitment for each genesis record
- A contract address recording the initial state
- A block number marking the moment of commitment

**Current status:** Settlement layer is pending canonical ratification. The Genesis State exists as an off-chain canonical record. On-chain anchoring will follow once the settlement layer specification is ratified.

---

## Genesis Hash

A cryptographic hash of the genesis state is recorded in `genesis-hash.txt`. This hash allows any party to verify that the genesis state has not been modified.

The hash covers the canonical genesis records:

- `genesis.json`
- `contributors.json`
- `contributions.json`
- `genesis-proofs.json`
- `genesis-reputation.json`

If any file changes, the hash will change, making tampering detectable.

---

## Version History

| Date | Phase | Status |
|------|-------|--------|
| 2026-09-02 | Genesis | Initial state recorded |

---

## References

- Canon: `MOOD_CANON.md`
- Protocol: `protocol/README.md`
- Architecture: `protocol/architecture/SETTLEMENT_LAYER.md`
- Contribution Registry: `protocol/specification/contribution-registry.md`
- Reputation Engine: `reputation-engine/README.md`
- Proof Engine: `proof-engine/README.md`
