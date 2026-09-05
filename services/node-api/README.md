# @mood/node-api — MOOD AI Agent Layer (Alpha 001)

> CLI 是人类入口，API 是 AI 入口。
> The CLI is the human entry; the API is the AI entry.

A local HTTP API that lets an AI Agent inspect and control a MOOD Node on
this machine — without reimplementing any node logic.

```
Human   →  mood CLI  ─┐
                      ├→  MOOD Node (~/.mood)  →  MOOD Protocol Network
Agent   →  MOOD API  ─┘
```

## Endpoints

Agent-facing reads are deterministic JSON — fixed key sets, no
timestamps, so an agent can diff two responses byte-for-byte. Every error
is the same envelope:

```json
{ "ok": false, "error": { "code": "NOT_INITIALIZED", "message": "..." } }
```

| Method | Path         | Response |
|--------|--------------|----------|
| GET    | `/health`    | `{"status":"ok","service":"mood-api","version":"…","nodeId":"mood:node:…\|null","uptimeSeconds":n,"lastHeartbeat":"…\|null"}` — liveness, open before auth (Node Deployment Alpha 001); `nodeId` is public by design |
| GET    | `/node/status` | `{"nodeId":"mood:node:xxxx","network":"MOOD Alpha Testnet","protocol":"v0.1","status":"running","epoch":"001"}` |
| GET    | `/node`        | same as `/node/status` — the dashboard-facing alias |
| POST   | `/node/start`  | `{"status":"running"}` (idempotent) |
| POST   | `/node/stop`   | `{"status":"stopped"}` (idempotent) |
| GET    | `/identity`    | `{"nodeId":"...","publicKey":"...","organization":null}` — public side only |
| GET    | `/peers`       | `{"peers":[],"status":"running"}` |
| GET    | `/snapshot`    | `{"epoch":"001","digest":"sha256:...","agreement":"verified"}` — digest re-verified on every request |
| GET    | `/connector/status` | `{"connector":"active","agents":[{"name":"Claude Code","type":"coding-agent"}]}` — inactive before `mood connector init`; independent of node identity |
| GET    | `/contributions` | `{"contributions":[{"event":{…},"proof":{…}}]}` — the contribution records on this node; a record that trips the credential guard is served as `{"refused":"…"}` with all content stripped |
| POST   | `/contributions/verify` | `{"verified":true}` — verifies a submitted ContributionProof against the stored ContributionEvent; a failed check is 200 + `{"verified":false,"errors":[…]}`, not an error |

### Deployment dashboard (Node Deployment Alpha 001)

Operational monitoring views over the same `~/.mood/` files the daemon
writes — read-only, no node logic. Unlike the agent surface above, these
are **live reads**: `uptimeSeconds`, `lastHeartbeat`, metrics and event
tails change between requests by design.

| Method | Path | Response |
|--------|------|----------|
| GET | `/status` | one-screen node summary: `nodeId`, `network`, `protocol`, `status`, `uptimeSeconds`, `epoch`, `connectedPeers`, `knownObjects`, `contributions`, `snapshots`, `relay`, `lastHeartbeat`, `simulation`, `timeScale` |
| GET | `/metrics` | `{"node":{…counters…}\|null,"api":{pid,uptimeSeconds,memoryRssBytes,version}}` — daemon counters from `state.json.metrics`; `node` is `null` until the daemon has run once |
| GET | `/events?source=node\|error\|heartbeat&limit=n` | tail of the daemon's JSON logs (default `node`, last 50, max 1000); each record is the raw log line `{timestamp,level,node_id,event,status,…}`; unparseable or credential-shaped lines are refused entries |
| GET | `/contribution` | `{"events":n,"proofs":n,"verified":n\|null,"invalid":n\|null,"reputation":"not_implemented"}` — reputation/tokens do not exist in Phase Zero; this is the only honest answer |

`/status` and `/metrics` require an initialized node (409
`NOT_INITIALIZED` otherwise); `/events` and `/contribution` answer
without one — logs and contributions precede identity.

Stable error codes: `NOT_INITIALIZED` (409), `NO_SNAPSHOT` (404),
`UNAUTHORIZED` (401), `FORBIDDEN_HOST` (403), `NOT_FOUND` (404),
`INVALID_REQUEST` (400 — malformed body), `START_FAILED` / `STOP_FAILED` /
`INTERNAL` (500).

## Design rules

- **No duplicated node logic.** Reads go straight to the `~/.mood/` files
  (the documented on-disk contract shared with the CLI); snapshot
  verification calls `@mood/node-runtime`; lifecycle (`/node/start`,
  `/node/stop`) runs the canonical `mood start` / `mood stop` commands, so
  agents and humans drive the exact same path.
- **Architecture:** API → node-runtime → protocol. Never API → protocol.
- **Deterministic output.** No timestamps, no random IDs, no
  human-formatted tables. An agent can diff two responses byte-for-byte.
  (The deployment dashboard routes below are the documented exception:
  they are live operational reads.)
- **What the API allows:** read node status, inspect public identity,
  inspect peers, verify snapshots, start/stop the node, list contribution
  records, verify contribution proofs.
- **What the API never does:** expose private keys or secrets, create
  tokens, perform financial operations, bypass protocol rules. Phase Zero
  is unchanged — no token, no wallet, no mining, no staking.

## Security model

- **Local-only by default.** Binds `127.0.0.1` (override with
  `MOOD_API_BIND` — the server logs a warning if you bind beyond loopback).
- **The private key is structurally absent.** This codebase never opens
  `~/.mood/identity/private.json`. No bug in this layer can leak a key it
  never holds.
- **Optional API key.** Start with `mood api start --key <secret>`; then
  every endpoint except `/health` requires
  `Authorization: Bearer <secret>`. The key lives only in process memory
  and is compared in constant time.
- **Host-header validation.** Requests whose `Host` is not
  `127.0.0.1` / `localhost` / `[::1]` (optionally with port) are refused —
  a DNS-rebinding page in a browser cannot reach this API. Operators
  extending the API beyond loopback (a compose network, a monitoring
  container) add hostnames with `MOOD_API_ALLOWED_HOSTS` (comma-separated,
  matched after the port suffix is stripped).
- **Nothing sensitive is stored.** No private keys, no email, no
  credentials — anywhere.
- **Contribution records are public by design — but guarded.** A proof
  exists to be verified by third parties, so `/contributions` serves the
  full record. Anything that trips the credential guard (a hand-edited
  file with key/password-shaped content) is refused with its content
  stripped — creation refuses such content outright, and serving defends
  the read side the same way.

## Running

```bash
# via the CLI (recommended — same experience as `mood start`)
mood api start           # default port 8788
mood api status
mood api stop

# standalone
MOOD_API_PORT=8788 node services/node-api/src/server.js
```

State lives in `~/.mood/api-state.json`; logs in `~/.mood/logs/api.log`.

## Tests

```bash
npm test --prefix services/node-api
```

See `docs/agent/api-demo.md` for the human ↔ agent dialogue this enables,
and `docs/architecture/mood-agent-layer.md` for the layering.
