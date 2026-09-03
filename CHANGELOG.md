# Changelog

All notable changes to MOOD will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
adapted for MOOD's phase-zero worldbuilding posture.

---

## v0.2.0-alpha.2 — 2026-09-03

**Tag:** `node-v0.2.0-alpha.2`
**Type:** Pre-release / Experimental Alpha
**Network:** `mood-testnet-001` (federated testnet, not mainnet)
**Protocol:** v0.1
**Status:** ⚠️ UNSIGNED INTERNAL ALPHA — NOT PRODUCTION

> MOOD Node becomes an AI-native command line client. The CLI is the
> primary MOOD interface. Still no token, no wallet, no staking, no
> rewards, no governance — phase zero.

### Features

#### CLI-first architecture

- New workspace package `apps/mood-cli` (`@mood/cli`)
- Zero third-party dependencies — pure Node.js over the shared runtime
- Full command surface: `mood init / start / stop / status`,
  `mood identity show`, `mood invite create`,
  `mood peers`, `mood snapshot verify`, `mood protocol`
- Background daemon with clean stop and state reconciliation
- `~/.mood/` data root (overridable via `MOOD_HOME`)

#### Terminal identity

- ASCII logo + `~ MOOD ~` home screen: network, node ID, status
- The logo is frozen — changing it requires a protocol-version bump

#### AI Agent compatible interface

- Every command supports `--json` → stable envelope
  `{ok:true, ...}` / `{ok:false, error}` with exit codes
- `MOOD_JSON=1` forces JSON globally for agent wrappers
- Human screens and agent envelopes render from the same data object

#### Protocol runtime integration

- CLI reuses `packages/node-runtime` for identity, invitation, storage,
  sync, and snapshot logic — duplicates nothing
- `.moodinvite` creation uses the existing invitation logic (no new
  identity system)
- Protocol layer (`protocol/*`) unchanged

#### Desktop client repositioned

- `apps/node-client` → `apps/mood-desktop` (`@mood/mood-desktop`)
- Marked **Experimental GUI**; README states the CLI is the primary
  interface
- Electron app preserved — not deleted

### Fixes

- `packages/node-runtime` root export repaired (it had never been
  imported end-to-end before the CLI): ESM/CJS interop shim for
  `tweetnacl-util`, duplicate/phantom exports removed, Windows-safe
  dynamic imports, `SnapshotManager.initialize()` chaining
- Snapshot self-attestation sign/verify payloads aligned
  (`{snapshotId, digest, epochId, nodeId}`) so the documented
  verification path actually verifies

### Tests

- `apps/mood-cli/tests/cli.test.js` — 12 end-to-end tests: startup
  screen, identity creation + idempotency, private-key non-disclosure,
  status, JSON envelopes, `MOOD_JSON=1`, error envelopes, invitation
  generation + signature validity, full daemon lifecycle
  (`start` → snapshot verified → `stop`)
- `npm run test:cli` added at the repository root
- All existing suites remain passing (protocol, relay, three-node,
  web)

### Documentation added

- `docs/node/CLI.md` — installation, usage, commands, architecture,
  AI Agent integration
- `docs/releases/MOOD_NODE_v0.2.0-alpha.2.md`
- `apps/mood-cli/README.md`, `apps/mood-desktop/README.md`

### What this release is NOT

- Not mainnet, not a token launch, not a financial product
- Not a governance vehicle, not a decentralization claim
- Not production-ready

---

## v0.1.0-alpha.1 — 2026-09-03

**Tag:** `node-v0.1.0-alpha.1`
**Type:** Pre-release / Experimental Alpha
**Network:** `mood-testnet-001` (federated testnet, not mainnet)
**Protocol:** v0.2 candidate
**Status:** ⚠️ UNSIGNED INTERNAL ALPHA — NOT PRODUCTION

> This is the first public experimental node release. It is a
> **proof of existence**, not a product launch. There is no token,
> no wallet, no staking, no rewards, no governance.

### Features

#### Node Client

- Electron desktop client (Windows / macOS / Linux)
- 7-page UI: Welcome, Status, Identity, Peers, Protocol Objects,
  Snapshot, Invitation
- One-click Start Node flow (`Start Node` → `Synchronized`)
- Encrypted backup export
- Local data deletion with explicit two-step confirmation
- `.moodinvite` import + acceptance flow

#### Node Runtime

- `packages/node-runtime` — shared node logic
- **Identity:** Ed25519 keypairs, deterministic Node ID, signing /
  verification
- **Organization:** Org ID derivation, admin keypair, member roster
- **Invitation:** `.moodinvite` create / sign / verify / accept
- **Storage:** Local JSON storage for contributions, manifests, snapshots
- **Synchronization:** WebSocket client with auto-reconnect, heartbeat,
  broadcast, request/response
- **Snapshot:** Epoch snapshot creation, deterministic SHA-256 digest,
  attestation signing
- **Protocol Adapter:** Bridge to existing `protocol/contribution` and
  adjacent modules

#### Snapshot Agreement

- Three-node deterministic digest test (Node A / B / C)
- Epoch 0001 snapshot:
  ```
  sha256:36ae53614c343d9b401b1c9ecf4f6188bfce0e2837557f0b640a1b41524b551a
  ```
- All three nodes compute identical digests from identical inputs
- Proof bundle export (`proof-bundle.json`, `SHA256SUMS`, `TEST_REPORT.md`)

#### Relay (local-only)

- `services/relay` — minimal WebSocket forwarder
- Forwards signed protocol objects
- No signing, no custody, no consensus role
- Provided as source + Dockerfile only; not deployed
- Local testing only

#### Testnet

- `testnet/three-node` — automated end-to-end test
- Reproducible from `node testnet/three-node/run-three-node-test.mjs`
- Outputs proof bundle in `tmp/three-node-test/output/`

### Security

- Private keys **never leave the local machine**
- Renderer cannot read filesystem or keys (Electron `contextIsolation: true`,
  `nodeIntegration: false`)
- Preload exposes a minimal named-method API only
- No wallet / signing / send-transaction modules imported anywhere
  in node-runtime
- No email addresses stored on public protocol objects (only SHA-256
  digests of emails if needed)
- Three real email addresses never appear in committed source,
  fixtures, manifests, snapshots, logs, GitHub workflows, or Release
  notes
- Local services (when present) bind `127.0.0.1` only
- All external connections are outbound to the relay
- No remote command execution, no SSH, no shell, no wallet operations

### Known Limitations (read before installing)

- ❌ **Unsigned installers** — operating systems will show security warnings
- ❌ **No production relay** — relay is local-only
- ❌ **No public network** — no public bootstrap, no public relay
- ❌ **No token, no wallet, no staking, no rewards, no governance**
- ❌ **Single keypair per node** — no multi-device support yet
- ❌ **No code signing certificate** — `electron-builder` will produce
  unsigned artifacts; not for production distribution

### Documentation added

- `docs/node-release-audit.md`
- `docs/releases/MOOD_NODE_v0.1.0-alpha.1.md`
- `genesis/MOOD_NODE_GENESIS_RECORD.md`
- `genesis/genesis-nodes.json`
- `genesis/genesis-snapshot.json`
- `services/relay/README.md`
- `testnet/three-node/README.md`

### GitHub Automation

- `.github/workflows/node-ci.yml` — protocol + node + three-node test on
  push / PR
- `.github/workflows/node-release.yml` — Windows / macOS / Linux build on
  tag `node-v*`, creates GitHub **prerelease**

### What this release is NOT

- Not mainnet
- Not a token launch
- Not a financial product
- Not a governance vehicle
- Not a decentralization claim
- Not production-ready

### Reproduction

```bash
git checkout 4ef0cc170cad76ecb151d941883ce487e65ba0bd
node testnet/three-node/run-three-node-test.mjs
```

The test will output the same Epoch 0001 digest recorded above.

---

## Versioning

MOOD Node releases follow a separate SemVer scheme from the Protocol:

```text
Protocol versions: v0.x       — protocol spec changes
Node versions:     vX.Y.Z-α.N — node client releases
```

These two tracks must never be conflated.

---

*Changelog maintained by the MOOD worldbuilding team.*
*Phase Zero: build the network before the economy.*
