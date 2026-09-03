# MOOD CLI

**The primary MOOD interface.**

MOOD is not an application. MOOD is a protocol node. Anyone — any person,
any organization, any AI Agent — runs the same node software, the same way
a Bitcoin full node or an Ethereum geth node is run. The CLI is that node's
native face.

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

---

## Installation

**Requirements:** Node.js ≥ 22.13 (the same engine the rest of the
repository requires). No other dependency — the CLI is pure JavaScript
over the shared runtime.

### From the repository (monorepo)

```bash
git clone https://github.com/huliye24/MOOD.git
cd MOOD
npm install

# Run via the workspace (no global install needed)
npm --prefix apps/mood-cli start -- status

# Or link the `mood` command into your PATH
npm install -g apps/mood-cli
mood
```

### From npm (when published)

```bash
npm install -g mood
mood
```

### Verify the install

```bash
mood              # renders the home screen above
mood protocol     # reports the active protocol and network
```

---

## Usage

A MOOD node has a lifecycle of four commands. Everything else is
inspection.

```bash
mood init                           # 1. create ~/.mood/ and the node identity
mood start                          # 2. run the node runtime (background daemon)
mood status                         # 3. inspect: identity, snapshot, peers, epoch
mood stop                           # 4. stop the runtime (data is preserved)

mood api start                      # 5. (optional) open the AI Agent API
mood connector detect               # 6. (optional) connect installed AI Agent
mood connector register             #    tools (Claude Code, Codex, Cursor, …)
mood contribution create            # 7. record work + mint its proof
```

The first run is exactly three commands:

```bash
$ mood init
  MOOD identity created.

  Node ID:      mood:node:63aa9414f8293f9f08edafb33199a037c55521b81719c8400080bf3487d7e122
  Home:         ~/.mood

$ mood start
  Starting MOOD Node...

  Protocol      v0.1
  Network       MOOD Alpha Testnet
  Status        Running
  PID           31824
  Log           ~/.mood/logs/node.log

$ mood snapshot verify
  MOOD Snapshot Verification

  Epoch:       epoch-0001
  Digest:      sha256:36ae53614c343d9b...
  Recomputed:  sha256:36ae53614c343d9b...
  Agreement:   Verified
  Attestations: 1
```

### Where the data lives

`mood init` creates one tree and the CLI never writes outside it
(`MOOD_HOME` overrides the location — used by tests and agents):

```text
~/.mood/
├── identity/
│   ├── node.json          # public identity (node ID, public key)
│   └── private.json       # private key — never displayed, never sent
├── config/
│   └── node.json          # network, relay, organization, bootstrap peers
├── snapshots/             # epoch snapshots + latest.json pointer
├── connector/             # connector identity + registered AI Agents
├── contributions/         # contribution records (proof layer)
│   ├── events/            # ContributionEvents — one JSON file per event
│   └── proofs/            # ContributionProofs — SHA-256 over each event
├── logs/
│   ├── node.log           # daemon log
│   └── api.log            # Agent Layer API log
├── state.json             # runtime state (status, pid, connected peers)
├── api-state.json         # Agent Layer API state (status, pid, port, bind)
└── api-stop               # cooperative stop flag for the API (transient)
```

---

## Commands

### `mood` (no arguments)

The terminal identity: logo, network, node ID, status. This is what a
MOOD node *is* — one glance, no chrome.

### `mood init`

Creates `~/.mood/` and generates the Ed25519 node identity via the shared
runtime. **Idempotent** — a second `init` never regenerates an existing
identity.

| Flag | Meaning |
|------|---------|
| `--org <id>` | affiliate with an explicit organization ID |
| `--org-name <name>` | organization name (default: MOOD Alpha) |
| `--org-domain <domain>` | organization domain (default: alpha.mood.example) |

### `mood start`

Starts the node runtime as a background daemon: identity loaded, relay
synchronization armed, epoch snapshots created and self-attested on a
schedule. Prints the PID and log path. A second `start` on a running node
is a no-op that reports the existing PID.

### `mood stop`

Stops the daemon cleanly (flag file + signal, then state reconciliation).
Snapshots and identity are preserved; `mood status` keeps reporting the
last digest.

### `mood status`

```text
  Node ID:      mood:node:63aa...
  Network:      MOOD Alpha Testnet
  Protocol:     v0.1
  Status:       Running
  Peers:        2 connected
  Latest Epoch: 001
  Snapshot:     sha256:36ae5361...
  Agreement:    Verified
```

### `mood api start` / `mood api status` / `mood api stop`

Starts, inspects, and stops the **AI Agent Layer** — a local HTTP API
(services/node-api) that lets an AI Agent operate this node without a
shell. The CLI is the human entry; the API is the AI entry.

```bash
$ mood api start
  Starting MOOD API...

  Endpoint: http://127.0.0.1:8788
  Status:   Ready for AI Agents
  PID:      20020
  Key:      disabled (local-only default)
  Log:      ~/.mood/logs/api.log

$ curl http://127.0.0.1:8788/node/status
{"nodeId":"mood:node:63aa...","network":"MOOD Alpha Testnet","protocol":"v0.1","status":"running","epoch":"001"}
```

| Flag | Meaning |
|------|---------|
| `--port <n>` | port (default 8788; env `MOOD_API_PORT`) |
| `--bind <addr>` | bind address (default 127.0.0.1 — local-only; env `MOOD_API_BIND`) |
| `--key <secret>` | require `Authorization: Bearer <secret>` on every endpoint except `/health` |

Security posture: binds loopback only by default, never reads the private
key file, validates the Host header against DNS rebinding, and exposes
only public identity data. The API drives the node through the canonical
`mood start`/`mood stop` — agents and humans share one code path. Full
reference: [`services/node-api`](../../services/node-api) and
[`docs/agent/api-demo.md`](../agent/api-demo.md).

### `mood connector detect` / `init` / `register` / `status`

The **AI Agent contribution connector** (packages/mood-connector) — the
bridge between installed AI Agent tools (Claude Code, Codex, Cursor, any
other) and the MOOD network. MOOD does not compete with the engines and
does not control them; it detects them, gives them a contribution
identity, and records their work as Contribution Objects.

```bash
$ mood connector detect
  Claude Code    installed (command, config)
  Codex          installed (config)
  Cursor         installed (command, install-path)
  Ready for connection.
  Detection only. Do not call these tools. Do not control these tools.

$ mood connector init
  Connector ID:  connector:mood:3884d919...
  Storage:       ~/.mood/connector
  Never stored here: AI API keys, user credentials, private keys.

$ mood connector register [--agent <key|name>[,...]]   # default: all detected
  Agent ID: agent:mood:4a119129a31c1e72                # deterministic, idempotent

$ mood connector status
  Connector:     active
  Agents:        Claude Code, Codex, Cursor
  Network:       Ready
```

| Subcommand | Meaning |
|------|---------|
| `detect` | existence-only detection: PATH commands, config dirs, install paths — never executes or reads the tools |
| `init` | creates `~/.mood/connector/` (connector ID + agent record); idempotent |
| `register` | registers detected agents (or `--agent` for explicit/generic agents) |
| `status` | connector state, registered agents, network readiness |

Storage holds names, types, IDs, and timestamps — never API keys,
credentials, or private keys (config files are checked for existence
only, contents are never read). Agents read the same state via
`GET /connector/status` on the API. Full reference:
[`packages/mood-connector`](../../packages/mood-connector),
[`docs/agent/connector.md`](../agent/connector.md), and
[`docs/demo/agent-connection-demo.md`](../demo/agent-connection-demo.md).

### `mood contribution create` / `list` / `verify`

The **contribution proof layer** (packages/contribution-proof) — the
chain `AI Agent / human / organization → ContributionEvent →
ContributionProof → node storage`. A proof attests one thing: the
contribution event existed and was not modified after recording. Not a
reward, not a score, not token accounting.

```bash
$ mood contribution create --actor claude-code --type code_change \
                           --description "Updated node API"

  MOOD Contribution created.

  Event:         event:mood:c2307ceaa3259a8f56aac3fd
  Agent:         Claude Code
  Type:          code_change
  Proof:         sha256:5da66d0c407652fdc73d6e46cd93609b28bc428c748ea1c20e3ab8ce48bb08df
  Verified:      true

$ mood contribution list
$ mood contribution verify [event-id|proof-id]   # exit 1 when anything failed
```

| Subcommand | Meaning |
|------|---------|
| `create` | record a ContributionEvent and mint its SHA-256 proof (one command, both files) |
| `list` | the contributions recorded on this node, newest first, each with its proof status |
| `verify` | recompute every stored hash — tamper-evident; pass an ID to check one |

| Flag (create) | Meaning |
|------|---------|
| `--actor <ref>` | required — an agent key/name/ID (registered connector agents are resolved to their identity), or any human/organization reference |
| `--type <verb>` | action type, snake_case (default `code_change`) |
| `--description <text>` | what the work was (max 2000 chars) |
| `--actor-type <t>` | `ai_agent` (default) · `human` · `organization` |

Actor resolution: a registered connector agent wins for `ai_agent`
contributions — the record then carries the registered `agent:mood:…`
ID and the connector in `source`. Anything else derives a deterministic
ID from `(type, reference)`: same reference → same ID, on any node,
without registration. Descriptions and IDs are guarded against
credential-shaped content at creation **and** at verification. Records
live in `~/.mood/contributions/{events,proofs}/` — one JSON file per
object. Agents read the same records via `GET /contributions` and
`POST /contributions/verify` on the API. Full reference:
[`packages/contribution-proof`](../../packages/contribution-proof),
[`docs/protocol/contribution-proof.md`](../protocol/contribution-proof.md),
and [`docs/agent/contribution-demo.md`](../agent/contribution-demo.md).

### `mood identity show`

Public side of the identity only. **Never displays: private key.** The
private key exists on disk (the daemon needs it to sign) and never leaves
the machine.

### `mood invite create --email <address>`

Issues a signed `.moodinvite` file (72h expiry, one-time use, bound to one
email) using the **existing invitation logic** from the shared runtime.
The CLI adds no invitation machinery and no new identity system.

| Flag | Meaning |
|------|---------|
| `--email <addr>` | required — the invitation is bound to this address |
| `--org <id>` | issue under an explicit organization |
| `--org-name <name>` / `--org-domain <d>` | override organization fields |
| `--out <dir>` | output directory (default: current directory) |

### `mood peers`

Connected peers first (observed live via the relay), then the configured
bootstrap roster. A stopped node honestly reports
`(node not running — showing configured bootstrap peers only)`.

### `mood snapshot verify`

Digest agreement: reloads the latest epoch snapshot and recomputes the
SHA-256 over its canonical JSON. If `Recomputed == Digest`, any honest
node holding this snapshot derives the same value — that is the whole
alpha consensus ("Snapshot Agreement"). Also counts and verifies
attestation signatures.

### `mood protocol`

The protocol's machine-readable face: version `0.1`, mode `Federated
Alpha`, consensus `Snapshot Agreement`, and the Phase Zero scope flags
(token/wallet/financial/mining/staking/governance — all `false`).

### `mood --help` / `mood help`

Full command reference.

---

## Every command speaks JSON

Any command accepts `--json` and answers with a stable envelope:

```bash
$ mood status --json
{"ok":true,"nodeId":"mood:node:63aa...","network":"MOOD Alpha Testnet","networkId":"mood-testnet-001","protocol":"0.1","status":"Running","peers":2,"epoch":1,"digest":"36ae...","agreement":"Verified",...}
```

The envelope contract:

- **Success:** `{ "ok": true, ...fields }` on stdout, exit code 0
- **Failure:** `{ "ok": false, "error": "<message>" }` on stdout, exit code 1

Setting the environment variable `MOOD_JSON=1` switches every invocation
to JSON without adding a flag — for agents that cannot modify an existing
command line.

The JSON envelope is not a convenience; it is the guarantee that **the
human interface and the agent interface are the same interface.** The
command computes one data object; the human renderer and the JSON
renderer both consume it. Nothing is shown to humans that agents cannot
read, and nothing is exposed to agents that humans cannot see.

---

## Architecture

The CLI is a thin shell. It owns presentation (terminal screens, JSON
envelopes) and process management (the daemon) — nothing else.

```text
        ┌─────────────────────────────────┐
        │  apps/mood-cli                  │
        │  screens · JSON · daemon spawn  │  ← this package
        └───────────────┬─────────────────┘
                        │ imports
                        ▼
        ┌─────────────────────────────────┐
        │  packages/node-runtime          │
        │  identity · invitation ·        │
        │  storage · sync · snapshot      │  ← all node logic, shared
        └───────────────┬─────────────────┘
                        │ validates with
                        ▼
        ┌─────────────────────────────────┐
        │  protocol/*                     │
        │  contribution · registry · ...  │  ← unchanged protocol layer
        └───────────────┬─────────────────┘
                        │ commits to
                        ▼
        ┌─────────────────────────────────┐
        │  Snapshot Agreement             │
        │  SHA-256 over canonical JSON    │
        └─────────────────────────────────┘
```

**The rules:**

- The CLI **reuses** `packages/node-runtime` — identity, invitation,
  storage, synchronization, snapshot logic all come from the runtime.
- The CLI **duplicates nothing**: no second identity system, no second
  invitation system, no second snapshot verifier.
- The protocol layer (`protocol/*`) is **unchanged** by the CLI's
  introduction.
- The desktop client ([`apps/mood-desktop`](../../apps/mood-desktop),
  Experimental GUI) sits on the exact same runtime — GUI and CLI are two
  shells over one node.

### Layout

```text
apps/mood-cli/
├── bin/mood.js               # entry point
├── src/
│   ├── cli.js                # argv router (no third-party parser)
│   ├── state.js              # ~/.mood tree: identity, config, state
│   ├── daemon.js             # background runtime loop
│   ├── commands/             # one file per command
│   │   init · start · stop · status · api
│   │   identity · invite · peers · snapshot · protocol
│   │   connector · contribution
│   ├── ui/                   # logo + terminal renderers + JSON emit
│   └── config/defaults.js    # single source of display constants
└── tests/cli.test.js         # end-to-end: spawns the real binary
```

---

## AI Agent Integration

MOOD is designed so that an AI Agent is a **first-class node operator** —
not a tool user driving a human GUI. The agent runs the same commands a
human runs and reads the same output a human reads, but with `--json`
the output becomes a structured, stable contract.

```text
   Human operator                    AI Agent
   │                                │
   │  $ mood status                 │  $ mood status --json
   │  (terminal screens)            │  {"ok":true,"nodeId":...}
   │                                │
   └────────────┬───────────────────┴──────────────┬──────────────
                │                                  │
                ▼                                  ▼
        ┌──────────────────────────────────────────────┐
        │            apps/mood-cli                     │
        │   same commands · same data · same node      │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │            @mood/node-runtime                │
        │     identity · invitation · snapshot         │
        └──────────────────────────────────────────────┘
```

### The agent contract

1. **One binary, two audiences.** There is no separate agent API to
   version, secure, or drift. `mood status` and `mood status --json`
   come from the same code path.
2. **Stable envelope.** `ok: true|false` first, fields after. Failures
   are `{ok:false, error}` with exit code 1 — parseable, never a stack
   trace.
3. **No interactive prompts.** Every command completes without input.
   What a human reads as a screen, an agent reads as one JSON object.
4. **`MOOD_JSON=1`** forces JSON globally for agents that wrap the CLI
   and cannot inject flags.

### A complete agent session

```bash
mood init --json
# → {"ok":true,"created":true,"nodeId":"mood:node:...","home":"~/.mood"}

mood start --json
# → {"ok":true,"started":true,"status":"Running","pid":31824,...}

mood snapshot verify --json
# → {"ok":true,"valid":true,"agreement":"Verified","digest":"36ae...","recomputed":"36ae...","attestations":1}

mood status --json
# → {"ok":true,"nodeId":"mood:node:...","status":"Running","epoch":1,"digest":"36ae...","agreement":"Verified"}

mood invite create --email alice@example.com --json
# → {"ok":true,"inviteId":"...","path":"./mood-invite-....moodinvite",...}

mood stop --json
# → {"ok":true,"stopped":true,"clean":true,"status":"Stopped"}
```

An agent that can run a shell and parse JSON can operate a MOOD node —
join, observe, verify consensus, and invite the next node. That is the
entire integration surface, and it is deliberate.

Agents that speak HTTP have a second, protocol-native door: the local
API started by `mood api start`. It is not a wrapper around the CLI — it
reads the same `~/.mood/` tree and drives the same runtime, so both doors
always agree.

```text
   Human operator                    AI Agent
   │                                │
   │  $ mood status                 │  $ curl 127.0.0.1:8788/node/status
   │  (terminal screens)            │  {"nodeId":"mood:node:..."}
   │                                │
   └────────────┬───────────────────┴──────────────┬──────────────
                │                                  │
                ▼                                  ▼
        ┌──────────────────┐          ┌──────────────────────────┐
        │  apps/mood-cli   │          │  services/node-api       │
        │  human entry     │          │  AI entry (local HTTP)   │
        └────────┬─────────┘          └───────────┬──────────────┘
                 │                                │
                 └────────────┬───────────────────┘
                              ▼
                ┌──────────────────────────┐
                │  @mood/node-runtime      │
                │  one node, one state     │
                └──────────────────────────┘
```

---

## Phase Zero scope

The CLI — like everything in this repository — respects the Canon: there
is **no token, no wallet, no financial feature, no mining, no staking, no
governance**. `mood protocol` prints these scope flags explicitly so any
human or agent can confirm what network they are talking to.

> Build the network before the economy.

---

*See also: [MOOD Desktop (Experimental GUI)](../../apps/mood-desktop) ·
[Node Release Audit](../node-release-audit.md) ·
[Release: v0.2.0-alpha.2](../releases/MOOD_NODE_v0.2.0-alpha.2.md)*
