# MOOD Node v0.1.0-alpha.1

**Release Date:** 2026-09-03
**Release Type:** Pre-release, experimental alpha
**Tag:** `node-v0.1.0-alpha.1`
**Branch:** `codex/mood-node-alpha-001`
**Commit:** `4ef0cc170cad76ecb151d941883ce487e65ba0bd`

---

## Overview

MOOD Node is the first experimental implementation of the **MOOD Protocol**.

It is not a product launch. It is a **proof of existence**: a working
artifact that demonstrates that a network can be defined, identified,
synchronized, and remembered before any economic layer exists.

A MOOD Node is software that runs on a participant's computer. It:

- Creates a **node identity** (Ed25519)
- Establishes **peer communication** (via federated relay)
- Synchronizes **protocol objects** (contributions, snapshots)
- Computes and verifies **snapshot digests** (epoch agreement)

That is the entire job of a MOOD Node in this version.

It is the same job a Bitcoin full node performs, minus the chain and
minus the money. It exists to prove that the architecture works.

---

## Network Status

```text
Network:
Experimental Federated Testnet

Status:
Alpha

Token:        NONE
Mining:       NONE
Rewards:      NONE
Governance:   NONE
Mainnet:      NONE
```

This is **NOT mainnet**. This is **NOT** a token launch. This is
**NOT** a financial product. Running MOOD Node does not earn anything,
mine anything, vote on anything, or hold any value.

It is **phase zero**: building the network before the economy exists.

> "Build the network before the economy."

That is the entire commercial promise of this release.

---

## Architecture

A MOOD Node is layered. Each layer has one job and one job only.

```text
User Computer
       │
       │
       ▼
┌─────────────────────────────────┐
│  MOOD Node Client (Electron)    │  ← Window, UI, IPC
│  Welcome / Status / Identity    │
│  Peers / Snapshots / Invitation │
└─────────────────────────────────┘
       │
       │
       ▼
┌─────────────────────────────────┐
│  Node Runtime                   │
│  Identity, Organization,        │
│  Invitation, Storage,           │
│  Synchronization, Snapshot      │
└─────────────────────────────────┘
       │
       │
       ▼
┌─────────────────────────────────┐
│  Protocol Layer                 │
│  Contribution / Node Registry / │
│  Reputation (existing modules)  │
└─────────────────────────────────┘
       │
       │
       ▼
┌─────────────────────────────────┐
│  Snapshot Agreement             │
│  SHA-256 over canonical JSON    │
└─────────────────────────────────┘
```

### Layer responsibilities

| Layer | Responsibility | What it does NOT do |
|-------|----------------|---------------------|
| Client | Show status, accept invitations, control node | Hold keys, write filesystem, sign objects |
| Runtime | Identity, invitation flow, snapshot creation | Reach the network without relay |
| Protocol | Validate contributions, manage state | Issue tokens, hold custody |
| Snapshot | Compute deterministic digests | Validate economic value |

Each layer is replaceable. The architecture is composed of small,
auditable modules, not a monolith.

---

## Identity System

A MOOD Node identity is **two numbers**:

1. An **Ed25519 keypair** (private + public)
2. A **Node ID** deterministically derived from the public key + network ID

```text
Node ID = mood:node:<sha256-256-hex>
```

The private key never leaves the user's computer. It is generated on
first run and stored locally under the OS user-data directory. It is
never transmitted. It is never seen by the network.

### Member Subject ID

When a node joins an organization, it derives a **Member Subject ID**:

```text
Member Subject ID = sha256(organization_id || public_key)
```

This is also deterministic. It also never requires the email address
to compute.

### Signature verification

Every protocol object exchanged between nodes is signed:

- Invitations are signed by the organization admin
- Contributions are signed by the contributor
- Snapshot attestations are signed by the node that produced them
- Anything unsigned is rejected locally

No node trusts another node's word. Every claim is verified locally.

---

## Invitation System

Joining the network requires a **`.moodinvite`** file, signed by the
organization administrator.

```text
+---------------------------------+
|     .moodinvite  (signed JSON)  |
+---------------------------------+
  - invitationId
  - organizationId          // bound to one org
  - organizationName
  - organizationDomain      // example.com
  - memberEmail             // bound to one person
  - emailDomain             // example.com
  - networkId               // mood-testnet-001
  - adminPublicKey          // for signature verification
  - issuedAt                // 2026-09-03T...
  - expiresAt               // 72 hours later
  - nonce                   // 256-bit random
  - maxUses                 // 1 = one-time
  - metadata
    { enrollmentType: "Alpha Enrollment" }

  - signature               // Ed25519(admin secret key)
  - fileVersion             // 1.0.0
```

### Properties guaranteed by this design

| Property | How it is guaranteed |
|----------|----------------------|
| Only the invited email can enroll | Local email-match check |
| Email domain matches org domain | Local domain-match check |
| Invitation is fresh | Local expiresAt check |
| Invitation is unique | Local nonce + usedCount check |
| Sender is the claimed admin | Ed25519 signature verification |
| Admin private key never leaks | The file contains only the public key |
| One-time use | maxUses = 1, usedCount enforced locally |

This is the **smallest** useful enrollment primitive. It is deliberately
not more than that. Production identity (verified email control, SMS,
WebAuthn, domain ownership) is downstream of the Canon and will require
amendment before implementation.

---

## Three-Node Test

The three-node test is a deterministic experiment. It proves that
**three independent computers can agree on the same digest without
trusting each other.**

### What the test does

1. Generate **3 Ed25519 keypairs** with seeds A, B, C
2. Create **3 separate data directories** on the same machine
3. **Node A** creates a test contribution
4. The contribution is **propagated** to Node B and Node C
5. All **3 nodes independently** validate the schema, fingerprint, and status
6. All **3 nodes compute Epoch 0001** snapshot digest independently
7. The test compares the three digests

### Result

```text
Node A: sha256:36ae53614c343d9b401b1c9ecf4f6188bfce0e2837557f0b640a1b41524b551a
Node B: sha256:36ae53614c343d9b401b1c9ecf4f6188bfce0e2837557f0b640a1b41524b551a
Node C: sha256:36ae53614c343d9b401b1c9ecf4f6188bfce0e2837557f0b640a1b41524b551a
```

Three independent processes, with three independent keys and three
independent storage locations, all produced the **same digest from the
same contribution set**.

### What this proves

- Snapshots are deterministic.
- The epoch hash function is stable across implementations.
- The protocol does not rely on hidden state (timestamps, random IDs,
  environment variables) to compute digests.
- Three independent computers can replay the same computation and
  get the same answer.

### What this does NOT prove

- This is **not global consensus**. Three nodes from one organization
  is a technical test, not a decentralized network.
- This is **not mainnet**. Mainnet does not exist.
- This is **not security**. Three trusted computers with the same
  software running on the same host.

The three-node test is a **determinism test**. It is the prerequisite
for any future consensus. It is not consensus itself.

---

## Limitations (please read before installing)

This alpha has explicit limits. They are not bugs. They are the
boundary of what can honestly be claimed in this release.

### Build / packaging

- Installers are **unsigned** internal alpha builds
- Windows: first launch will show **Microsoft Defender SmartScreen**
  warnings; click "More info" → "Run anyway"
- macOS: Gatekeeper may block the app; right-click → Open
- Linux: AppImage needs execute permission
- **No code signing certificate** is held by the project
- **No Apple notarization** has been performed
- No `.deb`, no `.rpm` (deferred to a later release)

### Infrastructure

- **No production relay deployed.** The relay exists in source but
  is **local-only**. Cross-internet testing requires separate
  deployment and explicit human approval.
- **No public network.** No public bootstrap, no public relay, no
  public name service.
- **No SLA, no uptime guarantee.** This is a federation of friends,
  not a cloud service.

### Functional

- **Single keypair per node.** Multi-device is not implemented.
- **No backup restore UI.** Encrypted backups can be exported but
  not yet re-imported.
- **No contribution editing UI.** Finalized records are immutable.
- **No snapshot explorer.** Only JSON export.
- **No invitation UI for non-admin members.** Only the recipient can
  accept invitations.

### Scope (these are NOT in this alpha)

- ❌ No token
- ❌ No wallet
- ❌ No staking
- ❌ No rewards
- ❌ No financial mechanism
- ❌ No mining
- ❌ No governance voting
- ❌ No airdrop
- ❌ No on-chain settlement
- ❌ No node sale mechanics

These remain downstream of the Canon and are not in the alpha roadmap.

---

## What this alpha DOES provide

- ✅ A working Ed25519 node identity system
- ✅ A working WebSocket relay (for local testing)
- ✅ A working `.moodinvite` enrollment primitive
- ✅ A working three-node snapshot agreement test
- ✅ A working Electron desktop client (Windows / macOS / Linux)
- ✅ A working proof bundle export (SHA256SUMS, TEST_REPORT.md)
- ✅ A documented security boundary
- ✅ A reproducible deterministic build pipeline

---

## For Developers

Read these in order:

1. `MOOD_CANON.md` — the highest authority in the repository
2. `AGENTS.md` — how this repository is maintained
3. `docs/world/README.md` — the MOOD world model
4. `docs/node-release-audit.md` — what was built and what was not
5. `genesis/MOOD_NODE_GENESIS_RECORD.md` — the genesis of this alpha
6. `protocol/contribution/` — the underlying contribution module
7. `packages/node-runtime/src/` — the new node logic
8. `testnet/three-node/README.md` — how to run the three-node test

---

## For Participants

If you were sent a `.moodinvite` file:

1. Download the installer for your platform from the GitHub release
2. Install (expect a security warning — that is expected, it is unsigned)
3. Launch **MOOD Node**
4. Click **"Import Invitation"** and select the `.moodinvite` file
5. Enter the email address the invitation was sent to
6. Click **"Start Node"**
7. Wait until the status reads **"Synchronized"**

You are now running a MOOD Node. Welcome.

---

## Final Word

This release is a **beginning**. It is the moment after which the
network has memory. Before this release, MOOD existed only as documents.
After this release, MOOD exists as a network that has run.

A network that has run once can run again.

That is the milestone.

> *"The Canon is where MOOD begins."*
> *— MOOD Canon, §18*

This release is the first moment after that beginning.

---

*Document version 1.0.0 — 2026-09-03*
