# MOOD Node Release Audit

**Audit Date:** 2026-09-03
**Auditor:** Codex implementation team
**Branch:** `codex/mood-node-alpha-001`
**Commit:** `4ef0cc170cad76ecb151d941883ce487e65ba0bd`
**Target Release:** `MOOD Node v0.1.0-alpha.1`

> **Post-release note (Alpha 002):** this audit is a point-in-time record of
> commit `4ef0cc1`. Since then, the desktop client moved from
> `apps/node-client` to [`apps/mood-desktop`](../apps/mood-desktop)
> (Experimental GUI), and the CLI at [`apps/mood-cli`](../apps/mood-cli)
> became the primary MOOD interface. Path references below are historical.

---

## Purpose

This document audits the current state of the MOOD Node implementation before
the first public experimental release. It is intended to make explicit what
exists, what is tested, and what is deliberately not yet built.

This audit does not modify any protocol source. It only inspects.

---

## 1. Repository Architecture

The MOOD repository was not restructured. New components were added next to
existing protocol modules.

### Existing protocol modules (untouched)

```
protocol/
├── contribution/        # MPF-002 Contribution Core (canonical module)
├── node-registry/       # MPF-004 Node Registry
├── reputation/          # MPF-006 Reputation Core
├── protocol-api/        # MPF-005 Protocol API
├── specification/       # Protocol specs (markdown)
└── ...
```

### New components (added for Node Alpha)

```
apps/
└── node-client/                        # Electron desktop client
    ├── desktop/main.js                 # Main process, IPC handlers
    ├── preload/preload.js              # Minimal contextIsolated API
    ├── renderer/index.html             # 7-page UI
    └── package.json

packages/
└── node-runtime/                       # Reusable node logic
    ├── src/
    │   ├── identity/                   # Ed25519, Node ID, signing
    │   ├── organization/               # Org identity + enrollment
    │   ├── invitation/                 # .moodinvite creation + verification
    │   ├── storage/                    # Local JSON storage
    │   ├── synchronization/            # WebSocket client
    │   ├── snapshot/                   # Epoch snapshots + attestations
    │   ├── protocol-adapter/           # Bridge to existing modules
    │   └── index.js                    # Factory + re-exports
    └── package.json

services/
└── relay/                              # Minimal WebSocket relay (local-only)
    ├── src/relay.js
    ├── tests/relay.test.js
    ├── Dockerfile
    └── README.md

testnet/
└── three-node/                         # Automated three-node test
    ├── create-testnet.mjs
    ├── run-three-node-test.mjs
    └── README.md

.github/
└── workflows/
    ├── node-ci.yml                     # PR / push CI
    └── node-release.yml                # Tag-triggered release
```

### Why this structure

- `packages/node-runtime` is shared between the Electron client and the
  three-node test. Single source of truth for node logic.
- `apps/node-client` is the platform-specific shell. It only does UI and IPC.
- `services/relay` is independently deployable, but currently NOT deployed.
- `testnet/three-node` is a self-contained executable that exercises
  three nodes end-to-end without requiring the relay to be online.

---

## 2. Existing Tests

### 2.1 Protocol tests (unchanged from baseline)

**File:** `protocol/contribution/tests/suite.test.js`

**Result on commit `4ef0cc1`:**

```
PASSED: 27 | FAILED: 0 | TOTAL: 27
✅ All 27 tests passed.
```

Coverage:
- T1 Schema validation
- T2 Canonical normalization
- T3/T4 Fingerprint determinism and sensitivity
- T5/T6 Duplicate prevention (intra- and cross-contributor)
- T7 State transition guards (allow + reject)
- T8/T9 Score / evidence guards
- T10 Policy pinning
- T11 Finalization immutability
- T12 Reputation evidence determinism
- T13 Economic-field prohibition (4 sub-tests)
- T14 No chain writes (static scan)
- T15 Offline operation (static scan)
- T16 Fixture coverage
- T17 Full service lifecycle (integration)
- T18 Self-review guard

### 2.2 Three-node test (new)

**File:** `testnet/three-node/run-three-node-test.mjs`

**Result on commit `4ef0cc1`:**

```
Three independent Ed25519 keypairs
Three independent data directories
One contribution created on Node A
Identical contribution set propagated to Nodes B and C
Epoch 0001 snapshot created on all three

Node A: sha256:36ae53614c343d9b401b1c9ecf4f6188bfce0e2837557f0b640a1b41524b551a
Node B: sha256:36ae53614c343d9b401b1c9ecf4f6188bfce0e2837557f0b640a1b41524b551a
Node C: sha256:36ae53614c343d9b401b1c9ecf4f6188bfce0e2837557f0b640a1b41524b551a
✅ ALL THREE NODES COMPUTED IDENTICAL SNAPSHOT DIGEST
```

### 2.3 Tests NOT yet written

| Test | Where | Reason |
|------|-------|--------|
| Relay integration test | `services/relay/tests/` | Test file exists but requires running relay |
| Live three-node + relay end-to-end | `testnet/three-node/integration/` | Requires relay infrastructure |
| Multi-organization digest consistency | `testnet/cross-org/` | Requires second organization |

---

## 3. Known Limitations

These limitations are honest. They are not bugs. They are boundaries
of the alpha.

### 3.1 Cryptographic boundaries

- **Identity is alpha-enrollment only.** A `.moodinvite` proves that the
  organization admin signed a file with that email address. It does not
  prove the receiver controls the email inbox (production identity would
  require SMTP round-trip or web-domain verification).
- **No cross-organization consensus.** Three nodes from one organization
  is a technical test, not a decentralized network.
- **Single keypair per node.** Multi-key / multi-device is not implemented.

### 3.2 Infrastructure boundaries

- **No production relay deployed.** The relay code exists and is local-only
  tested. Cross-internet multi-node testing requires explicit human
  approval and a separate deployment decision.
- **No public network.** There is no public bootstrap, no public relay,
  no public name service.
- **No CI runners run the three-node test in real-time.** CI runs the
  protocol tests; cross-platform Electron builds do not run.

### 3.3 Build / packaging boundaries

- **No code signing certificate.** Installers are unsigned alpha.
  Operating systems will display security warnings.
- **Windows installer not signed.** First-time Windows users will see
  "Microsoft Defender SmartScreen prevented an unrecognized app from
  starting". This is expected and labeled in release notes.
- **Apple notarization not done.** macOS users will see Gatekeeper warnings.
- **Linux packages are `.AppImage` and `.tar.gz`.** No `.deb`, no `.rpm`
  (deferred to a later release).

### 3.4 Functional boundaries

- **No contribution editing UI.** Users can create and finalize
  contributions, but cannot edit them in the UI (state machine forbids
  editing finalized records).
- **No snapshot visual explorer.** Only JSON export and download.
- **No invitation management UI for non-admin members.** Only the
  recipient can accept; the admin creates invitations out-of-band.
- **No backup import.** Backups can be exported (encrypted with a password)
  but restoring from a backup file is not yet implemented in the UI.
- **No Windows / macOS / Linux UI testing.** Electron builds are configured,
  but only manual launch has been verified on Windows during development.

### 3.5 Out-of-scope (alpha does not claim to do these)

- No token, no wallet, no staking, no rewards, no governance
- No on-chain settlement
- No production authentication
- No production-grade key recovery
- No production-grade relay SLA
- No payment integration
- No airdrop mechanisms
- No node sale mechanics

These are explicitly NOT in the alpha roadmap. They remain downstream
of the Canon and require canonical amendments before they can be added.

---

## 4. What this alpha DOES prove

This is the positive record.

### 4.1 Determinism works

Three independent Ed25519 keypairs, three independent data directories,
three independent "computers" (in this run, three processes), all
derived from the same contribution set and the same deterministic
snapshot hash function:

```
sha256:36ae53614c343d9b401b1c9ecf4f6188bfce0e2837557f0b640a1b41524b551a
```

This is not consensus. This is "three computers can compute the
exact same digest from the same input without trusting each other."

That property is a prerequisite for any future consensus.

### 4.2 The build pipeline is reproducible

- `node testnet/three-node/run-three-node-test.mjs` produces identical
  digests run after run.
- The protocol test suite passes run after run.
- No timing-dependent, no hostname-dependent, no environment-dependent
  state leaks into the digest.

### 4.3 The security boundary holds

- No wallet library imports in node-runtime source.
- No `coinbase`, `sendTransaction`, `wallet_client` references.
- Renderer cannot read filesystem directly.
- Private keys only flow through the main-process IPC, and only the user
  triggers the export.
- Three real email addresses never appear in committed source, fixtures,
  node manifests, snapshots, or workflows.

### 4.4 The invitation primitive is correct

A `.moodinvite` file:
- Is signed by the org admin key
- Is bound to one specific email
- Is bound to one specific organization ID
- Has a high-entropy nonce
- Has an issuedAt and expiresAt
- Is single-use by default
- Does not contain the admin private key
- Can be verified independently offline

This is the smallest useful enrollment primitive. It is deliberately
not more than that.

---

## 5. Missing Production Features (acknowledged, not built)

The following are intentionally not yet in this release. They are listed
so future contributors know what to prioritize.

| Feature | Reason not built |
|---------|------------------|
| Production relay deployment | Requires operational decision and human approval |
| Production identity provider (SMTP / WebAuthn / domain-verified email) | Requires canonical amendment |
| Code signing certificate | Requires legal/purchasing decision |
| Multi-device key sync | Requires canonical amendment |
| Snapshot visual explorer | Cosmetic, deferred |
| Long-term local storage (SQLite) | Current JSON files sufficient for alpha |
| Auto-update of node client | Requires signing infra |
| Audit logging UI | Deferred |
| Production invitation UI for non-admin | Will follow once second org joins |
| Public Relay bootstrap | Requires operational decision |

---

## 6. Files in this audit's scope

All files listed below are part of the alpha release.

### 6.1 New runtime files

```
packages/node-runtime/package.json
packages/node-runtime/src/index.js
packages/node-runtime/src/identity/index.js
packages/node-runtime/src/organization/index.js
packages/node-runtime/src/invitation/index.js
packages/node-runtime/src/storage/index.js
packages/node-runtime/src/synchronization/index.js
packages/node-runtime/src/snapshot/index.js
packages/node-runtime/src/protocol-adapter/index.js
```

### 6.2 Desktop client

```
apps/node-client/package.json
apps/node-client/desktop/main.js
apps/node-client/preload/preload.js
apps/node-client/renderer/index.html
```

### 6.3 Relay

```
services/relay/package.json
services/relay/src/relay.js
services/relay/tests/relay.test.js
services/relay/Dockerfile
services/relay/README.md
```

### 6.4 Three-node test

```
testnet/three-node/README.md
testnet/three-node/create-testnet.mjs
testnet/three-node/run-three-node-test.mjs
```

### 6.5 GitHub automation

```
.github/workflows/node-ci.yml
.github/workflows/node-release.yml
```

### 6.6 Files NOT modified

- `protocol/contribution/**` (canonical module, untouched)
- `protocol/node-registry/**`
- `protocol/reputation/**`
- `protocol/protocol-api/**`
- `protocol/specification/**`
- `genesis/**` (existing Genesis is the chain-level genesis, separate from
  this Node-Alpha genesis record; see Part 3 of release prep)

---

## 7. Audit verdict

**Verdict:** Ready for `node-v0.1.0-alpha.1` prerelease **IF** the human
release owner accepts the documented limitations.

Required remaining manual actions are listed in Part 9 of the release
prep output report.

**Quality bar:**

- Existing tests pass: ✅
- New three-node test passes: ✅
- Three-node digests identical: ✅
- No real emails anywhere in committed source: ✅
- No private keys in any committed artifact: ✅
- No production deployment claimed: ✅
- No token / wallet / staking references: ✅
- AGPL-3.0 license preserved: ✅
- Code signing bypassed (not faked): ✅

**Phase Zero compatibility:**

- No Canon violation detected
- No Website-as-Canon violation
- No Sacred Secret violation (no production claim made)
- The "Money before World" trap is avoided

---

*Audit prepared as part of `MOOD NODE RELEASE PACK 001`.*
