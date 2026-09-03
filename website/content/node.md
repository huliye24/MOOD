---
title: "MOOD Node"
slug: node
section: Participation
status: alpha
layout: participation
audience: developers, participants
canonical: true
---

# MOOD Node

## Run The Network.

A node is a participant in the MOOD network.

Not a server. Not a customer. Not a user.

A **participant**.

Nodes run on the computers of people who choose to participate. Each
node holds a private key, signs protocol objects locally, and computes
snapshots independently.

The network does not exist in a cloud. It exists on the computers of
the people who decided to run it.

---

## What is a MOOD Node?

A MOOD Node is **one specific piece of software** that performs
**one specific job**:

> Hold an identity, verify signatures, and produce snapshots that
> agree with other nodes.

Concretely, a MOOD Node can:

- Create a **node identity** (Ed25519)
- Establish **peer communication** (via a federated relay)
- Synchronize **protocol objects** (contributions, snapshots)
- Compute and verify **snapshot digests** (epoch agreement)

That is the entire job of a MOOD Node in this version.

A node does **not**:

- ❌ Hold custody of any value
- ❌ Sign transactions
- ❌ Process payments
- ❌ Vote on anything
- ❌ Earn anything

A node **proves** that a network can exist. That is the proof this
release exists to provide.

---

## Download

MOOD Node v0.1.0-alpha.1 is available as a desktop client for:

```text
Windows    →  .exe installer  +  .zip
macOS      →  .dmg package
Linux      →  .AppImage  +  .tar.gz
```

Release assets include the installers, `SHA256SUMS`,
`THREE_NODE_TEST_GUIDE.md`, and `SOURCE_COMMIT.txt`.

> **Expected warning:** This is an unsigned internal alpha. Your
> operating system will display a security warning the first time you
> open it. Click "More info" → "Run anyway".

---

## Status

```text
Network:    Experimental Federated Testnet
            mood-testnet-001

Status:     Alpha — Pre-release
            Not Mainnet
            Not Production

Version:    v0.1.0-alpha.1
Protocol:   v0.2 candidate

Trust:      None from the network to the user.
            None from the user to the network.
            Same code, same input, same output.
```

---

## What Nodes Contribute

```text
Computation
   ↓
Verification
   ↓
Availability
```

In this version, **computation** means re-computing the same digest as
everyone else and confirming that it matches. **Verification** means
rejecting every object whose signature does not check. **Availability**
means keeping a node online long enough to be reachable.

A node that does these three things is a complete MOOD Node. It needs
nothing else.

---

## Warning

```text
⚠ MOOD Node Alpha is not a financial product.

No token exists.
No rewards exist.
No mining exists.
No governance exists.
No stake exists.
No airdrop exists.
```

If you were told this software "earns" anything, **that person or page
is lying**. This software does not earn. It does not mine. It does
not pay. It is a node in an experimental network that has not yet
been defined to have an economy.

Running a MOOD Node in this alpha provides:

- ✅ Memory of a network that has run
- ✅ Participation in an experiment
- ❌ Nothing else

---

## What this release DOES provide

- A working Ed25519 node identity
- A working WebSocket relay (local)
- A working `.moodinvite` enrollment primitive
- A working three-node snapshot agreement test
- A documented security boundary
- Reproducible deterministic builds

---

## What this release does NOT provide

- A token
- A wallet
- A stake
- A reward
- A vote
- An airdrop
- A node sale
- A production relay
- A public network
- A mainnet

These will only exist when the Canon and the protocol say they may
exist. They do not say so yet.

---

## For More Detail

```text
docs/releases/MOOD_NODE_v0.1.0-alpha.1.md
   Full release notes

docs/node-release-audit.md
   What was built and what was not

genesis/MOOD_NODE_GENESIS_RECORD.md
   First experimental network state

testnet/three-node/README.md
   Reproduce the three-node test
```

---

## Phase Zero

> *"Build the network before the economy."*

This release is the moment after which a network has actually run.
Before this release, MOOD was a world in documents. After this release,
MOOD is a network that has memory.

A network that has memory can grow. That is the entire point.

Welcome.

---

*MOOD Node v0.1.0-alpha.1 — 2026-09-03 — Experimental Federated Testnet*
