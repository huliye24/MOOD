# MOOD Node Runtime Architecture — Alpha 001

**Status:** Design (Phase 1 deliverable of Node Deployment Alpha 001)
**Date:** 2026-09-05
**Principle:** Protocol Layer and Deployment Layer are strictly separated.
This design adds **infrastructure only** — no protocol logic changes, no new
business features. Frozen surfaces (Alpha 001 envelope/ID/hash engine,
Alpha 002-B identity runtime) are untouched.

---

## 1. Layer model

| Layer | Contents | Repo location | Changed by this deployment? |
|---|---|---|---|
| **Protocol** (frozen) | envelope, ID derivation, hash engine, Ed25519 identity, signing | `packages/protocol-object`, `packages/contribution-proof`, `packages/identity` | **No — untouched** |
| **Runtime** (node core) | storage, sync, snapshot managers; daemon loop | `packages/node-runtime`, `apps/mood-cli/src/daemon.js` | daemon **shell** only (logging, scheduler, metrics); manager wiring identical |
| **Storage** | on-disk node state under one root | `MOOD_HOME` (default `~/.mood`) → `/data` in container | layout unchanged; new `reports/`, `logs/*.json`-adjacent files |
| **API** | HTTP surface for agents/operators | `services/node-api` | extended (health fields + dashboard routes); read-only of identity/state |
| **Monitoring** | JSON logs, metrics, hourly runtime reports | `apps/mood-cli/src/logging.js`, `scheduler.js`, daemon | **new** |
| **Deployment** | image, entrypoint, compose, systemd | `deployment/` (new) | **new** |

The dependency direction is one-way: Deployment → API/Runtime → Protocol.
Nothing in `packages/*` learns about Docker, systemd, or the API.

## 2. Process model

Two long-running processes per node (plus one shared relay):

```text
┌─ docker compose (mood-node) ─────────────────────────────────┐
│  entrypoint (PID 1, node)                                     │
│   ├─ mood daemon          node core: identity, snapshots,     │
│   │                       sync, heartbeat, reports            │
│   └─ node-api (Express)   /health, dashboard — never reads    │
│                           identity/private.json               │
│  volume /data ← MOOD_HOME (identity, config, state, logs,     │
│                 snapshots, contributions, reports)            │
└───────────────────────────────────────────────────────────────┘
┌─ docker compose (mood-relay) ── WebSocket fan-out, stateless ─┐
```

- The entrypoint runs `mood init` (idempotent — first boot generates the
  node identity), starts the daemon via the canonical `mood start`, runs
  the API in the foreground, forwards SIGTERM/SIGINT to both, and exits 0
  only after a clean stop.
- The daemon and API are **separate processes** on purpose: the API can
  restart without the node key being resident in the API process, and the
  daemon keeps running if the API crashes.
- Restart policy `unless-stopped` (compose) + systemd `docker compose up`
  on boot (Phase 8) give 24/7 uptime without changing process code.

## 3. Storage contract (`MOOD_HOME=/data`)

```text
/data/
  identity/node.json       public identity          (existing)
  identity/private.json    Ed25519 key, mode 600    (existing; daemon-only)
  config/node.json         network/relay config     (existing)
  contributions/{events,proofs}/                    (existing)
  snapshots/                                          (existing)
  state.json               runtime state + metrics  (extended)
  logs/node.log            JSON lines — all events  (new format)
  logs/error.log           JSON lines — errors only (new)
  logs/heartbeat.log       JSON lines — heartbeats  (new)
  reports/runtime-report-<utc>.json   hourly report (new; keep last 24)
```

Record shape (one JSON object per line):
`{ timestamp, level, node_id, event, status, ...fields }`.

## 4. Scheduler (configurable, simulation-capable)

Resolved once at daemon start from environment (`apps/mood-cli/src/scheduler.js`):

| Cycle | Default | Env override |
|---|---|---|
| Heartbeat | 60 s | `MOOD_HEARTBEAT_INTERVAL_MS` |
| Maintenance (collect events → verify proofs → update state → snapshot) | 5 min | `MOOD_MAINTENANCE_INTERVAL_MS` |
| Runtime report | 1 h | `MOOD_REPORT_INTERVAL_MS` |
| Relay retry | 60 s | `MOOD_RELAY_RETRY_INTERVAL_MS` |
| Stop-flag poll | 1 s | — |

`MOOD_TIME_SCALE=N` divides all intervals by N (simulation mode:
`N=60` → 1 real minute ≈ 1 simulated hour; 24 simulated hours ≈ 24 real
minutes). `MOOD_SIMULATION=1` stamps state/logs/reports so simulation runs
are never mistaken for production evidence.

Maintenance cycle = the existing snapshot-maintenance behavior plus
`verifyStoredContributions` from `@mood/contribution-proof` (recomputation,
never a stored flag — S14). **Protocol behavior of snapshotting is
unchanged**; only its cadence becomes configurable.

## 5. Metrics & reporting

The daemon accumulates counters in memory and persists them in
`state.json.metrics` on every state write (heartbeats, events collected,
proofs verified/invalid, errors, snapshots, reports, uptime, rss/cpu).
The hourly report freezes a full point-in-time sample to
`reports/runtime-report-*.json` (pruned to the latest 24).

## 6. API surface (Phase 6–7)

Auth model unchanged: Host-header allowlist (loopback default, extendable
via `MOOD_API_ALLOWED_HOSTS`), optional Bearer `MOOD_API_KEY`; `/health`
stays before auth (liveness). New/extended routes — all read-only:

| Route | Purpose |
|---|---|
| `GET /health` | status, node_id, uptime, version, last_heartbeat (liveness + identity) |
| `GET /status` | dashboard summary: node, uptime, epoch, peers, counts |
| `GET /node` | full node status (existing `/node/status` semantics) |
| `GET /metrics` | counters from `state.json.metrics` + API process metrics |
| `GET /events` | tail of JSON logs (`?limit=`), for operational inspection |
| `GET /contribution` | contribution/proof counts + last verification result; `reputation: "not_implemented"` — honest per canon |

No token/staking/wallet data exists anywhere in this API.

## 7. Deployment artifacts (Phase 2, 8)

| Artifact | Role |
|---|---|
| `deployment/Dockerfile` | node image: `node:22-bookworm-slim`, non-root `mooduser`, deps pinned by root `package-lock.json` via workspace-filtered `npm ci --omit=dev -w apps/mood-cli -w services/node-api` (verified: installs no web/electron deps), `HEALTHCHECK` hitting `/health` |
| `deployment/docker-entrypoint.mjs` | PID-1 supervisor: init → start daemon → run API foreground → signal forwarding |
| `docker-compose.yml` (root) | `mood-node` + `mood-relay`, restart policy, named volume, loopback-published ports by default |
| `deployment/mood-node.service` | systemd unit → `docker compose up -d` on boot, `down` on stop |

Port plan (target host audited 2026-09-05): relay `8080` (free), API
`8788` published on loopback; no conflicts with the existing
crestwave/moodify services.

## 8. Security posture (detail in Phase 11 report)

- Private key: read **only** by the daemon process; API and entrypoint never
  load it; file mode 600 inside the volume.
- Container: non-root user, no capabilities added, read-only image layers,
  writable state confined to the `/data` volume.
- API: default loopback-only binding + Host allowlist; remote exposure is a
  deliberate operator action (bind + allowlist + API key).
- Secrets never enter the repository (per `ops/deploy/README.md` rule).

## 9. What this design deliberately does NOT do

- No new protocol messages, no changes to snapshot/identity/sync semantics.
- No frontend, no token/reputation dashboards (forbidden by Phase Zero scope).
- No second daemon implementation: `mood-node` is an operator wrapper that
  delegates to the canonical `mood` commands.
- No database: the file contract under `MOOD_HOME` remains the only state.
