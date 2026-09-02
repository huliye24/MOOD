# MOOD Genesis

**Phase:** Genesis Phase
**Version:** 0.1.0

---

## What is the Genesis State?

The Genesis State is the first verifiable record of the MOOD Network. It answers the question:

> What did MOOD look like the moment it began?

MOOD does not begin with a token. It begins with a contribution.

---

## The Genesis Files

| File | Purpose |
|------|---------|
| `genesis.json` | Network-level metadata |
| `contributors.json` | Genesis contributor identities |
| `contributions.json` | Genesis contribution records |
| `genesis-proofs.json` | Genesis proof records |
| `genesis-reputation.json` | Genesis reputation records |
| `genesis-hash.txt` | Cryptographic hash of genesis state |
| `genesis-state.md` | This document — full genesis narrative |

---

## The First Genesis Contribution

```
ID:       contribution_genesis_001
Title:    MOOD Protocol Architecture
Type:     Protocol
Status:   Verified
```

The genesis contributor created the conceptual and architectural foundation of MOOD: the idea that contribution, proof, and reputation form a trust layer for decentralized coordination.

---

## The Genesis Verification Chain

```
Contribution (genesis_001)
        ↓
Proof (proof_genesis_001)
  Type: Documentation Hash
  Method: SHA256
  Status: Verified
        ↓
Reputation (score: 10, level: Genesis)
```

Each genesis record is linked. A contribution exists → it is proven → it produces standing. This chain is the first instance of MOOD's trust model.

---

## The Genesis Hash

The `genesis-hash.txt` file contains a SHA256 hash of the canonical genesis records. Any change to those records will produce a different hash, making unauthorized modification detectable.

This is the same principle as Bitcoin's Genesis Block hash — a verifiable anchor that anyone can check.

---

## Relationship to Other Modules

```
genesis/
  ├── contributions.json  ← Proof Engine input
  ├── proofs.json        ← Proof Engine output
  └── reputation.json     ← Reputation Engine input

reputation-engine/
  └── Calculates standing from verified proofs

proof-engine/
  └── Verifies that contributions are real
```

The Genesis State is the first point where all three modules — Contribution Registry, Proof Engine, Reputation Engine — have produced records simultaneously.

---

## Settlement Layer Note

The Genesis State currently exists as an off-chain canonical record. If the settlement layer specification (`protocol/architecture/SETTLEMENT_LAYER.md`) is ratified, the genesis records will be anchored to a public testnet, producing an immutable on-chain witness.

Current settlement status: **Pending canonical ratification.**

---

## Verification

To verify the genesis state:

```bash
cd genesis
node ../genesis/scripts/verify-genesis.js
```

This will:
1. Read all genesis JSON files
2. Compute the SHA256 hash
3. Compare against `genesis-hash.txt`
4. Report whether the state is intact

---

## Version

```
MOOD Genesis v0.1.0
Genesis Phase
```
