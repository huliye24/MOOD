# MOOD CLI

**The primary MOOD interface.**

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
```

MOOD is not an application. MOOD is a protocol node — software that any
person, any organization, or any AI Agent runs, the same way anyone runs
a Bitcoin full node or a geth node. This CLI is that node's native face.

## Quick start

```bash
mood init                        # create ~/.mood/ and your node identity
mood start                       # run the node (background daemon)
mood status                      # identity · epoch · digest · peers
mood snapshot verify             # verify digest agreement
mood stop                        # stop the daemon (data preserved)
```

## Install

From the repository root (npm workspaces):

```bash
npm install
npm install -g apps/mood-cli     # link the `mood` command
```

Requires Node.js ≥ 22.13. No other dependencies.

## Commands

| Command | What it does |
|---------|--------------|
| `mood` | Terminal identity screen |
| `mood init` | Create `~/.mood/` + Ed25519 identity (idempotent) |
| `mood start` / `mood stop` | Run / stop the node runtime |
| `mood status` | Node ID, network, status, epoch, digest, agreement |
| `mood api start` / `mood api stop` | Run / stop the AI Agent API (127.0.0.1:8788) |
| `mood api status` | API endpoint, key mode, health |
| `mood identity show` | Public identity — never the private key |
| `mood invite create --email <addr>` | Issue a signed `.moodinvite` |
| `mood peers` | Connected + bootstrap peers |
| `mood snapshot verify` | Recompute and verify the epoch digest |
| `mood protocol` | Protocol info + Phase Zero scope flags |

## AI Agent mode

Every command supports `--json` and answers a stable envelope:

```bash
$ mood status --json
{"ok":true,"nodeId":"mood:node:...","network":"MOOD Alpha Testnet","protocol":"0.1","status":"Running","epoch":1,"digest":"36ae...","agreement":"Verified"}
```

- Success: `{ok:true, ...}`, exit 0 — Failure: `{ok:false, error}`, exit 1
- `MOOD_JSON=1` forces JSON globally

An agent that can run a shell and parse JSON can operate a MOOD node.

Agents that speak HTTP have their own door — the local API:

```bash
mood api start                # 127.0.0.1:8788, local-only
mood api start --key <secret> # require Authorization: Bearer <secret>
curl http://127.0.0.1:8788/node/status
```

See [`services/node-api`](../../services/node-api) — the CLI is the human
entry; the API is the AI entry.

## Architecture

The CLI owns presentation and process management — nothing else. All
node logic (identity, invitation, storage, sync, snapshot) is reused
from [`@mood/node-runtime`](../../packages/node-runtime). The protocol
layer is unchanged.

```text
apps/mood-cli ──▶ packages/node-runtime ──▶ protocol/* ──▶ Snapshot Agreement
```

## Development

```bash
cd apps/mood-cli
npm test          # 12 end-to-end tests (spawns the real binary)
```

Full reference: [`docs/node/CLI.md`](../../docs/node/CLI.md)

## Phase Zero

No token. No wallet. No mining, staking, or governance. The CLI — like
every MOOD component — builds the network before the economy.
