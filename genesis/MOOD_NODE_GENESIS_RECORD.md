# MOOD Node Genesis Record

**Network:** MOOD Alpha Network
**Version:** 0.1.0-alpha.1
**Date:** 2026-09-03
**Status:** First experimental network state — alpha

---

## Purpose

This document records the **first experimental network state** of the
MOOD Node alpha. It is not a chain-level genesis. It is a record that
this day, in this repository, in this commit, three computers computed
the same digest from the same input for the first time.

Before this release, MOOD existed only as documents. After this
release, MOOD has a history. This file is part of that history.

---

## Genesis State

```text
Network ID:        mood-testnet-001
Protocol:          v0.2 candidate
Client:            v0.1.0-alpha.1
Network Type:      Federated Testnet
Genesis Commit:    4ef0cc170cad76ecb151d941883ce487e65ba0bd
Branch:            codex/mood-node-alpha-001
Genesis Date:      2026-09-03
```

---

## Initial Nodes

Three independent nodes ran together for the first time in this
repository's history. Each had its own keypair and its own data
directory.

### Node A

```text
Node ID:     mood:node:63aa9414f8293f9f08edafb33199a037c55521b81719c8400080bf3487d7e122
Role:        genesis contributor
Epoch:       0001
Status:      active
```

### Node B

```text
Node ID:     mood:node:7d5d1801a2f874554ac518992e0f6ad3f91340860eb5ee5a884b462c1f238536
Role:        genesis contributor
Epoch:       0001
Status:      active
```

### Node C

```text
Node ID:     mood:node:e9093c2500f484903a8be3dcba2713de2609bff3391bdafd6da087132f4636d1
Role:        genesis contributor
Epoch:       0001
Status:      active
```

These three Node IDs are derived deterministically from the test seeds
`node-a-seed-001`, `node-b-seed-002`, `node-c-seed-003`. The seeds are
test fixtures. They are not secret material. They are not credentials.
They are not real identity.

---

## Genesis Snapshot

```text
Epoch ID:             epoch-0001
Network ID:           mood-testnet-001
Protocol Version:     0.2.0
Policy Version:       002-draft-1
Contribution Count:   1
Member Count:         1
```

### Epoch 0001 Snapshot Digest

```text
sha256:36ae53614c343d9b401b1c9ecf4f6188bfce0e2837557f0b640a1b41524b551a
```

This is the same digest computed independently by Node A, Node B, and
Node C. The agreement is recorded in this genesis, in
`docs/releases/MOOD_NODE_v0.1.0-alpha.1.md`, and in the per-node proof
bundles in the three-node test output.

The same digest across three independent processes is the **first
artifact** of the MOOD Node alpha.

---

## Initial Contribution

One test contribution was created during the genesis three-node run.

```text
Schema:        contribution v1.0.0
Category:      infrastructure
Status:        submitted
Issuer:        Node A
Recipient:    Node B, Node C (via network propagation)
Content:       three-node technical test contribution
```

The contribution is **a test artifact**. It is not a real human action.
It exists to prove that the propagation layer works.

---

## What this genesis IS

- A record that **three computers agreed** on a digest at a specific
  commit, on a specific date.
- A canonical reference for the first Epoch 0001 snapshot.
- A reference for what the alpha is and what it is not.
- A pointer to the proof bundle artifacts in the three-node test output.

## What this genesis IS NOT

- It is **not** a token allocation.
- It is **not** an airdrop.
- It is **not** a stake record.
- It is **not** a governance proposal.
- It is **not** a registration of real humans with real rights.
- It is **not** a chain. There is no chain in this alpha.

---

## What's deliberately absent

This genesis record contains **no**:

- Real email addresses
- Real names
- Real organization names
- Real domains
- Real public keys corresponding to real humans
- Private keys (of any kind)
- Credentials of any kind
- Passwords of any kind

The three test Node IDs above are derived from publicly documented test
seeds. They are not associated with any real participant.

---

## How to reproduce this genesis

Any person can reproduce the genesis state by running:

```bash
node testnet/three-node/run-three-node-test.mjs
```

The output will include the same Epoch 0001 digest:

```text
sha256:36ae53614c343d9b401b1c9ecf4f6188bfce0e2837557f0b640a1b41524b551a
```

(Because the timestamp is fixed at `2026-09-03T12:00:00.000Z` for
deterministic test reproducibility.)

If a future contributor can reproduce that digest from a clean clone
of this repository at the genesis commit, the network is correctly
remembered.

---

## After genesis

Future alpha releases will add new commits with their own snapshots.
Each release will be a **page in this history**, not a replacement.
The genesis commit and this genesis record remain canonical.

---

## Closing

> "The Canon is where MOOD begins."
> — MOOD Canon, §18

This file is the moment after that beginning, when the world had a
network that had actually run.

The first milestone is reached:

✅ A computer downloaded the client.
✅ A human created identity.
✅ A node joined the network.
✅ The network remembers its first participants.

This is the beginning of MOOD.

---

*Genesis recorded: 2026-09-03*
*Genesis commit: 4ef0cc170cad76ecb151d941883ce487e65ba0bd*
