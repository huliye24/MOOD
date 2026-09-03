# MOOD Node v0.2.0-alpha.2

**Release Date:** 2026-09-03
**Release Type:** Pre-release, experimental alpha
**Tag:** `node-v0.2.0-alpha.2`
**Package:** `apps/mood-cli` (`@mood/cli`)
**Network:** `mood-testnet-001` (unchanged)

---

## Overview

MOOD Node v0.2.0-alpha.2 transforms the MOOD node into an **AI-native
command line client**.

MOOD's core has always been that it is a network node that anyone — any
person, any organization, any AI Agent — can run, the same way anyone can
run a Bitcoin full node or a geth node. Alpha 001 delivered that node
inside an Electron window. Alpha 002 delivers it where it always belonged:
**in the terminal.**

```text
        ███╗   ███╗ ██████╗  ██████╗ ██████╗
        ████╗ ████║██╔═══██╗██╔═══██╗██╔══██╗
        ██╔████╔██║██║   ██║██║   ██║██║  ██║
        ██║╚██╔╝██║██║   ██║██║   ██║██║  ██║
        ██║ ╚═╝ ██║╚██████╔╝╚██████╔╝██████╔╝
        ╚═╝     ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝

        ~ MOOD ~

        Contribution Network

        Protocol:  v0.1
        Network:   MOOD Alpha Testnet
        Node:      mood:node:63aa9414f8293f9f...
        Status:    Running

        "Contribution creates consensus."
```

Three things change in this release:

1. **CLI-first architecture.** The CLI is the primary MOOD interface.
   The desktop client is retained but marked Experimental GUI.
2. **Terminal identity.** A MOOD node greets you with one screen —
   logo, network, node ID, status. No chrome. This is what the node *is*.
3. **AI Agent compatible interface.** Every command emits a stable JSON
   envelope. An agent that can run a shell and parse JSON can operate a
   MOOD node — no separate API, no scraping screens, no second protocol.

This is still phase zero. No token. No wallet. No economy. The node's
job is unchanged: identity, relay synchronization, and snapshot
agreement. The release changes *how you hold the node*, not what the
node does.

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

Unchanged from Alpha 001: this is **NOT mainnet**, **NOT** a token
launch, **NOT** a financial product. Running a MOOD node earns nothing,
mines nothing, votes on nothing, holds nothing.

---

## What's new in Alpha 002

### 1. CLI-first architecture

`apps/mood-cli` is a new first-class workspace package:

```text
apps/mood-cli/
├── bin/mood.js               # `mood` command entry point
├── src/
│   ├── cli.js                # argv router (zero third-party deps)
│   ├── state.js              # ~/.mood tree: identity, config, state
│   ├── daemon.js             # background node runtime loop
│   ├── commands/             # init start stop status
│   │                         # identity invite peers snapshot protocol
│   ├── ui/logo.js            # the ASCII terminal identity
│   ├── ui/terminal.js        # human screens + JSON envelopes
│   └── config/defaults.js    # display constants, single source
└── tests/cli.test.js         # 12 end-to-end tests
```

The full command surface:

| Command | What it does |
|---------|--------------|
| `mood` | Terminal identity screen |
| `mood init` | Create `~/.mood/` + Ed25519 identity (idempotent) |
| `mood start` | Run the node runtime as a background daemon |
| `mood stop` | Stop the daemon (data preserved) |
| `mood status` | Node ID, network, status, epoch, digest, agreement |
| `mood identity show` | Public identity — **never the private key** |
| `mood invite create --email <addr>` | Issue a signed `.moodinvite` |
| `mood peers` | Connected + bootstrap peers |
| `mood snapshot verify` | Recompute and verify the epoch digest |
| `mood protocol` | Active protocol info + Phase Zero scope flags |

### 2. Terminal identity

Running `mood` is the ritual: the ASCII logo, `~ MOOD ~`, the network,
the node ID, the status. It is the same one-glance identity a Bitcoin
node has in its debug console. The logo is deliberately frozen — changing
it requires a protocol-version bump.

### 3. AI Agent compatible interface

Every command supports `--json` and answers with one stable envelope:

```json
{"ok":true,"nodeId":"mood:node:63aa...","network":"MOOD Alpha Testnet","networkId":"mood-testnet-001","protocol":"0.1","status":"Running","peers":2,"epoch":1,"digest":"36ae...","agreement":"Verified"}
```

- Success: `{ "ok": true, ... }`, exit 0
- Failure: `{ "ok": false, "error": "..." }`, exit 1
- `MOOD_JSON=1` forces JSON globally for agent wrappers

The human screen and the agent envelope are produced from the **same
data object** — there is no information a human sees that an agent
cannot read, and nothing hidden behind the JSON flag.

### 4. Protocol runtime integration

The CLI contains **zero protocol logic**. It reuses
`packages/node-runtime` for everything:

- **Identity** — `generateKeypair`, `generateNodeId`, manifest creation
- **Invitation** — `createInvitation`, `verifyInvitationSignature`
  (the exact `.moodinvite` machinery from Alpha 001; no new identity
  system)
- **Storage / Sync / Snapshot** — `StorageManager`, `SyncManager`,
  `SnapshotManager`, `signSnapshot`, `verifySnapshotDigest`,
  `verifyAttestation`

The layering is unchanged and the protocol layer (`protocol/*`) is
untouched:

```text
apps/mood-cli  ──▶  packages/node-runtime  ──▶  protocol/*  ──▶  Snapshot Agreement
 (screens,JSON,     (all node logic)          (unchanged)      (SHA-256 canonical)
  daemon)
```

### 5. Desktop client repositioned

`apps/node-client` moved to `apps/mood-desktop` and is now marked
**Experimental GUI**. Nothing was deleted: the Electron client still
builds and runs, on the same shared runtime. But it is no longer the
reference interface — its own README now says so:

> **Status: Experimental.** The CLI is the primary MOOD interface.

---

## Architecture

```text
User / AI Agent
       │
       ▼
┌─────────────────────────────────┐
│  mood CLI (apps/mood-cli)       │  ← primary interface
│  screens · JSON · daemon        │
└───────────────┬─────────────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│ mood-desktop │  │ node-runtime     │  ← all node logic
│ (Electron,   │  │ identity · invi- │     (shared by both
│  experimental│  │ tation · storage │      shells)
│  GUI)        │  │ sync · snapshot  │
└──────────────┘  └────────┬─────────┘
                           ▼
                ┌────────────────────┐
                │ protocol/*         │  ← unchanged
                └─────────┬──────────┘
                          ▼
                ┌────────────────────┐
                │ Snapshot Agreement │
                │ SHA-256 canonical  │
                └────────────────────┘
```

| Layer | Responsibility | What it does NOT do |
|-------|----------------|---------------------|
| CLI / Desktop | Presentation, process control | Hold protocol logic, re-implement signing |
| Node Runtime | Identity, invitation, storage, sync, snapshot | Reach the network without relay |
| Protocol | Validate contributions, manage state | Issue tokens, hold custody |
| Snapshot | Compute deterministic digests | Validate economic value |

---

## Identity & Invitation (unchanged semantics)

Everything Alpha 001 established is preserved:

- **Node ID** = `mood:node:<sha256-hex>` derived from
  `1|networkId|publicKey` — deterministic, no email needed
- Private key stored in `~/.mood/identity/private.json`, **never
  displayed, never transmitted** (the test suite asserts this on both
  human and JSON output)
- `.moodinvite` files: signed by the node's admin key, bound to one
  email, 72-hour expiry, one-time use — created by the **same**
  `createInvitation` code the desktop client uses
- Snapshot attestations signed with the same keypair; `mood snapshot
  verify` recomputes the digest and verifies every attestation it has a
  public key for

---

## Tests

`apps/mood-cli/tests/cli.test.js` — 12 end-to-end tests, each spawning
the real `bin/mood.js` binary in an isolated `MOOD_HOME` sandbox:

1. Home screen renders the terminal identity
2. `mood init` creates the `~/.mood` tree + a valid node ID
3. `init` is idempotent (identity preserved)
4. `identity show` never leaks the private key (human + JSON)
5. `status` before any snapshot
6. `status --json` matches the spec envelope exactly
7. Every command answers an `ok` envelope
8. `MOOD_JSON=1` switches output without a flag
9. Unknown command → `{ok:false}`, exit 1
10. `invite create` writes a signature-valid `.moodinvite`
11. `invite create` rejects an invalid email
12. Full lifecycle: `start` → daemon produces snapshot → `snapshot
    verify` (digest agreement, self-attestation verified) → `stop`

All existing suites (protocol, relay, three-node testnet, web) remain
passing.

---

## Limitations (please read)

- **No production relay.** Sync targets `ws://localhost:8080`; the
  relay ships as source only. Cross-internet operation requires separate
  deployment and explicit human approval.
- **Single keypair per node.** Multi-device is not implemented.
- **Self-attestation only (single node).** Multi-node attestation
  collection arrives with broader testnet federation; the verification
  path already handles peer attestations.
- **`mood` is not yet on npm.** Install from the repository (see
  `docs/node/CLI.md`).
- **Windows, macOS, Linux** — tested on Windows; the CLI is pure
  Node.js and platform-independent by construction.

### Scope (still NOT in this alpha)

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

---

## For Developers

Read in order:

1. `MOOD_CANON.md` — the highest authority in the repository
2. [`docs/node/CLI.md`](../node/CLI.md) — the CLI reference
3. `docs/node-release-audit.md` — what Alpha 001 built
4. `genesis/MOOD_NODE_GENESIS_RECORD.md` — the genesis of the alpha
5. `packages/node-runtime/src/` — all node logic
6. `testnet/three-node/README.md` — the three-node agreement test

Run everything:

```bash
npm install
npm run test:cli          # the 12 CLI tests
npm run test:protocol     # contribution protocol
npm run test:relay        # relay
npm run test:three-node   # three-node digest agreement
```

---

## Final Word

Alpha 001 proved a MOOD node can exist. Alpha 002 puts it where nodes
live: in a terminal, scriptable by humans, operable by agents, one
command away from anyone who wants to run the network.

A node that anyone can run is a network no one has to ask permission
to join.

> *"Contribution creates consensus."*

---

*Document version 1.0.0 — 2026-09-03*
