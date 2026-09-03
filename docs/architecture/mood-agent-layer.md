# MOOD Agent Layer Architecture — Alpha 001

> **Status:** Engineering architecture, v0.1 (Alpha 001)
> **Applies to:** `services/node-api`, `mood api` commands
> **Authority:** Subordinate to the MOOD Canon; Phase Zero scope enforced

MOOD is designed for a network whose operators are not only humans:

```text
   Human users ──▶ AI Agents ──▶ Network Nodes
```

The Agent Layer is the middle term made real. It is a small, local HTTP
service that lets an AI Agent operate a MOOD node without a shell, while
the CLI remains the human's instrument.

> **CLI 是人类入口，API 是 AI 入口。**
> The CLI is the human entry; the API is the AI entry.

---

## 1. The layering

```text
        Human operator                    AI Agent
        │                                │
        │  mood start / status / stop    │  GET /node/status · POST /node/start
        │  (terminal screens, --json)    │  (HTTP, deterministic JSON)
        │                                │
        └────────────┬───────────────────┘
                     │
        ┌────────────▼─────────────────────────────────┐
        │  The two entries                              │
        │  apps/mood-cli          services/node-api     │
        │  human door             agent door (local)    │
        └────────────┬───────────────────┬──────────────┘
                     │                   │
                     └───────┬───────────┘
                             ▼
        ┌─────────────────────────────────┐
        │  packages/node-runtime          │
        │  identity · storage · snapshot  │  ← one node, one state
        └───────────────┬─────────────────┘
                        ▼
        ┌─────────────────────────────────┐
        │  protocol/*                     │
        │  contribution · registry        │  ← unchanged protocol rules
        └───────────────┬─────────────────┘
                        ▼
             Snapshot Agreement (SHA-256
             over canonical epoch JSON)
```

### The rules

1. **Two doors, one node.** The API is not a wrapper around the CLI and
   the CLI is not a wrapper around the API. Both read the same
   `~/.mood/` tree and drive the same `@mood/node-runtime`. A status
   read through the API and a status read through `mood status` can
   never disagree, because they come from the same files and the same
   verification code.
2. **No duplicated logic.** The API owns HTTP concerns only — routing,
   authentication, error envelopes. Identity, snapshots, verification,
   and lifecycle semantics all come from the node runtime and the
   canonical CLI. Architecture: **API → node-runtime → protocol**.
3. **Lifecycle through the front door.** `POST /node/start` does not
   re-implement the daemon; it runs the same canonical `mood start`
   (with `MOOD_JSON=1`) a human would run. Agents and humans share one
   code path by construction.
4. **Determinism is a contract.** Every response is stable JSON with a
   fixed key set and no timestamps, no locale text, no prose. Agents can
   diff two responses byte-for-byte; two identical reads are identical
   bytes.

---

## 2. The API surface (Alpha 001)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/health` | `{"status":"ok","service":"mood-api"}` |
| GET | `/node/status` | `{"nodeId","network","protocol","status","epoch"}` |
| GET | `/identity` | `{"nodeId","publicKey","organization"}` |
| GET | `/peers` | `{"peers":[]}` |
| GET | `/snapshot` | `{"epoch","digest","agreement"}` |
| POST | `/node/start` | `{"status":"running"}` |
| POST | `/node/stop` | `{"status":"stopped"}` |

Errors use one envelope with stable machine codes — never a stack trace,
never human-only prose:

```json
{"ok": false, "error": {"code": "NO_SNAPSHOT", "message": "..."}}
```

| Code | HTTP | Meaning |
|---|---|---|
| `NOT_INITIALIZED` | 409 | `~/.mood` has no identity — run `mood init` |
| `NO_SNAPSHOT` | 404 | no epoch snapshot exists yet |
| `UNAUTHORIZED` | 401 | missing or wrong Bearer key (when a key is set) |
| `FORBIDDEN_HOST` | 403 | Host header is not loopback (DNS-rebinding defense) |
| `NOT_FOUND` | 404 | unknown endpoint |
| `START_FAILED` / `STOP_FAILED` / `INTERNAL` | 500 | lifecycle or internal failure |

---

## 3. Security model

The Agent Layer's security posture is **structural before it is
procedural** — the dangerous things are not hidden; they are absent.

### Local-only by default

- Binds `127.0.0.1` (override with `--bind` at the human's explicit
  choice; the log warns on any non-loopback bind).
- The server refuses requests whose `Host` header is not
  `127.0.0.1`, `localhost`, or `[::1]` — closing the DNS-rebinding
  route by which a browser page could otherwise reach a local service.

### The private key is never read

The API's state layer reads `identity/node.json` (public) and never
opens `identity/private.json`. No endpoint, no log line, no error path
can leak a private key because the file is never loaded into the
process. The tests scan every response and every artifact (logs, state
files) for the key material and assert zero appearances.

### Optional bearer key

- Off by default (loopback is already private).
- Enabled via `mood api start --key <secret>` or `MOOD_API_KEY`.
- Comparison is timing-safe; the key is never written to disk — the
  API state file records only `"key":"enabled"`.
- `/health` stays open for liveness probes.

### Nothing sensitive is stored

`~/.mood/api-state.json` holds only: status, pid, port, bind, startedAt,
key-mode. No private keys, no emails, no credentials — ever.

### Scope enforcement (Phase Zero)

The API **allows**: reading node status, inspecting public identity,
inspecting peers, verifying snapshots, controlling node lifecycle.

The API **never**: exposes private keys, exposes secrets, creates
tokens, performs financial operations, or bypasses protocol rules. There
is no endpoint for any of these things — the surface itself is the
boundary.

---

## 4. Process model

The API daemon mirrors the node daemon's pattern — one command, one
state file, one log:

```text
~/.mood/
├── api-state.json      # written by the server in its listen callback
├── api-stop            # cooperative stop flag (transient)
└── logs/api.log        # the only output channel
```

- `mood api start` spawns the server detached, waits for
  `api-state.json` to say `Running`, then health-checks `/health`
  before announcing readiness.
- `mood api stop` writes the stop flag, signals the process, and
  reconciles the state file if the process died before it could.
- Stopping the API never stops the node — the two lifecycles are
  independent.

---

## 5. Position and trajectory

MOOD's operator model is deliberately wider than a blockchain client's:

```text
   blockchain node client          MOOD
   ─────────────────────          ──────────────────────────────
   human runs a node              human runs a node
                                  AI Agent runs/operates a node
                                  through the same protocol
```

The long shape is:

```text
   人 Human ──▶ AI Agent ──▶ MOOD API ──▶ Node ──▶ Network
```

Alpha 001 implements the `AI Agent ──▶ MOOD API` hop: read status,
inspect identity and peers, verify snapshots, control the lifecycle.
Later alphas will extend what the agent door can reach — but through
the same rules: no new node logic in the API layer, no scope beyond
Phase Zero, no secret ever crossing the door.

---

*See also: [`services/node-api`](../../services/node-api) — the
implementation · [`docs/agent/api-demo.md`](../agent/api-demo.md) — the
demo transcript · [`docs/node/CLI.md`](../node/CLI.md) — the human
door.*
