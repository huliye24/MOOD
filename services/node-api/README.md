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

All responses are deterministic JSON. Success responses match the shapes
below exactly; every error is the same envelope:

```json
{ "ok": false, "error": { "code": "NOT_INITIALIZED", "message": "..." } }
```

| Method | Path         | Response |
|--------|--------------|----------|
| GET    | `/health`    | `{"status":"ok","service":"mood-api"}` |
| GET    | `/node/status` | `{"nodeId":"mood:node:xxxx","network":"MOOD Alpha Testnet","protocol":"v0.1","status":"running","epoch":"001"}` |
| POST   | `/node/start`  | `{"status":"running"}` (idempotent) |
| POST   | `/node/stop`   | `{"status":"stopped"}` (idempotent) |
| GET    | `/identity`    | `{"nodeId":"...","publicKey":"...","organization":null}` — public side only |
| GET    | `/peers`       | `{"peers":[],"status":"running"}` |
| GET    | `/snapshot`    | `{"epoch":"001","digest":"sha256:...","agreement":"verified"}` — digest re-verified on every request |
| GET    | `/connector/status` | `{"connector":"active","agents":[{"name":"Claude Code","type":"coding-agent"}]}` — inactive before `mood connector init`; independent of node identity |

Stable error codes: `NOT_INITIALIZED` (409), `NO_SNAPSHOT` (404),
`UNAUTHORIZED` (401), `FORBIDDEN_HOST` (403), `NOT_FOUND` (404),
`START_FAILED` / `STOP_FAILED` / `INTERNAL` (500).

## Design rules

- **No duplicated node logic.** Reads go straight to the `~/.mood/` files
  (the documented on-disk contract shared with the CLI); snapshot
  verification calls `@mood/node-runtime`; lifecycle (`/node/start`,
  `/node/stop`) runs the canonical `mood start` / `mood stop` commands, so
  agents and humans drive the exact same path.
- **Architecture:** API → node-runtime → protocol. Never API → protocol.
- **Deterministic output.** No timestamps, no random IDs, no
  human-formatted tables. An agent can diff two responses byte-for-byte.
- **What the API allows:** read node status, inspect public identity,
  inspect peers, verify snapshots, start/stop the node.
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
  a DNS-rebinding page in a browser cannot reach this API.
- **Nothing sensitive is stored.** No private keys, no email, no
  credentials — anywhere.

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
