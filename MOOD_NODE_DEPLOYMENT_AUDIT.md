# MOOD Node Deployment Audit — Alpha 001

**Status:** Audit report (read-only; no code was modified for this document)
**Date:** 2026-09-05
**Scope:** `https://github.com/huliye24/MOOD` @ branch `codex/mood-node-alpha-001`
**Purpose:** Determine what exists today, what can run long-term, and what
must be added to turn the repository into a continuously running node
(**Node Deployment Alpha 001**), without touching protocol core logic.

---

## 1. Repository facts

| Item | Finding |
|---|---|
| Language | Pure JavaScript (ESM), Node.js ≥ 22.13 (root `engines`); no native addons |
| Package manager | npm workspaces monorepo (root `package.json`, `package-lock.json`) |
| Build | None required for node software (no transpile step); the website (`apps/web`) builds separately with its own lockfile |
| Test runner | Node built-in `node --test` (per-package `npm test` scripts); Jest only for `apps/web` |
| License | AGPL-3.0 |

### Runtime-relevant workspace packages

| Package | Role | Long-running? |
|---|---|---|
| `packages/node-runtime` (`@mood/node-runtime`) | Core node logic: identity (Ed25519 via tweetnacl), storage, sync (ws), snapshot, protocol adapter | library (no main loop) |
| `apps/mood-cli` (`@mood/cli`) | Primary human face: `mood init/start/status/stop`, **contains the node daemon** | yes — `mood daemon` |
| `services/node-api` (`@mood/node-api`) | HTTP face for AI agents (Express, default `127.0.0.1:8788`) | yes — `node src/server.js` |
| `services/relay` (`@mood/relay`) | WebSocket relay for federated sync (port 8080); **already has a Dockerfile** | yes — `node src/relay.js` |
| `packages/protocol-object`, `packages/contribution-proof`, `packages/identity`, `packages/mood-connector` | Frozen/accepted protocol layers (Alpha 001 / 002) | library |

Non-runtime code: `apps/web` (Next.js site), `apps/mood-desktop` (Electron client),
legacy `proof-engine/`, `reputation-engine/`, `contracts/`, `frontend/`, `backend/`.

---

## 2. Audit questions

### Q1 — How is MOOD started today?

The canonical lifecycle (documented in `docs/node/CLI.md`):

```bash
mood init      # create ~/.mood/, generate Ed25519 identity, write config
mood start     # spawn the detached background daemon, wait for state.json = Running
mood status    # read ~/.mood/state.json + identity + latest snapshot
mood stop      # write stop flag + signal pid; daemon exits gracefully
mood api start # (optional) start services/node-api on 127.0.0.1:8788
npm run dev:relay  # (optional) start the WebSocket relay on :8080
```

`mood start` spawns `apps/mood-cli/bin/mood.js daemon` detached
(`apps/mood-cli/src/commands/start.js`), which runs
`runDaemon()` in `apps/mood-cli/src/daemon.js`:

```text
init check → StorageManager/SnapshotManager/SyncManager → state.json=Running
→ relay connect (retry 60s, local mode if unreachable)
→ snapshot maintenance (every 60s)
→ heartbeat (every 30s) → stop flag / SIGTERM / SIGINT → clean exit
```

There is also a scripted three-node testnet (`testnet/three-node/`) used for
federated digest-agreement tests.

### Q2 — Does a daemon/node mode already exist?

**Yes.** `mood daemon` (apps/mood-cli/src/daemon.js) is a real, continuously
running node process: it holds the node key, connects to a relay, maintains
epoch snapshots, heartbeats state, and shuts down cooperatively. The gap is
not "does a daemon exist" but "is it deployment-grade":

| Deployment gap | Current state |
|---|---|
| Log format | Plain text lines `[ts] [LEVEL] msg` in `~/.mood/logs/node.log` — not JSON, no `error.log`/`heartbeat.log` separation |
| Scheduler | Intervals **hardcoded** (heartbeat 30s, snapshot check 60s); no hourly runtime report; not configurable |
| Metrics | None aggregated (no event/proof/error counters, no uptime tracking) |
| `restart` command | Missing (`mood restart` does not exist) |
| Server packaging | None: requires a user home, interactive `mood init`, no Docker/systemd entrypoint |
| Health endpoint | `node-api` `/health` returns `{status:'ok'}` only — no node_id/uptime/version/last_heartbeat |
| Dashboard API | Partial: `/node/status`, `/contributions`, `/objects`, `/identity`, `/peers`, `/snapshot` exist; no `/status`, `/metrics`, `/events`, `/contribution` summary |

### Q3 — Which code can run long-term?

All three runtime processes are pure-JS, dependency-light (express, ws,
tweetnacl, uuid), signal-aware, and already designed for indefinite running:

1. **node daemon** — the core (identity, storage, snapshots, sync)
2. **node-api** — read-only HTTP surface; never touches the private key
3. **relay** — stateless WebSocket fan-out

### Q4 — Which runtime wrappers must be added?

1. A JSON structured logger (`node.log` / `error.log` / `heartbeat.log`) with
   `{timestamp, node_id, event, status, …}` records.
2. A configurable scheduler (heartbeat / maintenance cycle / hourly report),
   overridable by environment variables for both production and simulation.
3. A metrics + runtime-report writer (feeds `/metrics` and the runtime test).
4. Dashboard routes on `node-api`: `/status`, `/metrics`, `/events`,
   `/contribution`, plus an extended `/health` (node_id, uptime, version,
   last_heartbeat).
5. A `mood-node` operator entry (`start|status|stop|restart`) that delegates
   to the canonical `mood` commands (no duplicated daemon logic).
6. A Docker entrypoint: `MOOD_HOME=/data`, auto-`init` on first boot, run
   daemon + API in one supervised foreground process.
7. `Dockerfile` + `docker-compose.yml` (node + relay) and
   `deployment/mood-node.service` (systemd).
8. A simulation mode (compressed intervals) to test "24 hours" of runtime
   without waiting 24 hours.

### Q5 — What should the Docker entrypoint be?

A Node supervisor script (PID 1 friendly, signal-forwarding):

```text
entrypoint
  ├─ MOOD_HOME=/data (volume) — identity/config/state live here
  ├─ mood init            (idempotent; first boot generates the node identity)
  ├─ mood start           (daemon, background, logs to /data/logs/*.log)
  ├─ node-api             (foreground child; MOOD_API_PORT=8080, 0.0.0.0 in-container)
  └─ trap SIGTERM/SIGINT → mood stop + api shutdown → exit 0
```

Healthcheck: `GET /health` on the API port (node-based probe; `curl` is not
present in slim images).

---

## 3. State, config, environment

**On-disk contract** (`~/.mood/`, overridable via `MOOD_HOME`; documented in
`docs/node/CLI.md` and mirrored by `services/node-api/src/state.js`):

```text
~/.mood/
  identity/node.json      public identity (nodeId, publicKey)
  identity/private.json   Ed25519 private key (chmod 600) — daemon-only
  config/node.json        network, protocolVersion, relayUrl, peers, epoch
  contributions/events/   ContributionEvents
  contributions/proofs/   ContributionProofs
  snapshots/              epoch snapshots + latest.json pointer
  logs/node.log           daemon log (text today → JSON in this deployment)
  state.json              ephemeral: status, pid, startedAt, lastHeartbeat, peers
```

**Environment variables already honored:**

| Variable | Effect |
|---|---|
| `MOOD_HOME` | relocate the whole state root (this is what makes containerization clean) |
| `MOOD_API_PORT` / `MOOD_API_BIND` | node-api port (8788) / bind (127.0.0.1) |
| `MOOD_API_KEY` | Bearer auth for the API (constant-time check) |
| `MOOD_JSON=1` / `--json` | machine envelope from the CLI |
| `MOOD_BIN` | override path to the `mood` binary (used by node-api control) |
| `RELAY_PORT`, `NETWORK_ID` | relay container settings |

**Identity/private-key handling (security-relevant):** the API process never
reads `identity/private.json`; only the daemon and invitation signing do.
The key is Ed25519 (Alpha 002-B, ADR-004); Node ID =
`sha256('1|' + networkId + '|' + publicKey)`.

---

## 4. Existing deployment surface

- `services/relay/Dockerfile` — node:22-bookworm-slim, non-root user,
  HEALTHCHECK, `npm ci --omit=dev`. The pattern to follow for the node image.
- `ops/deploy/` — website auto-deploy service for the production origin
  (`crestwavecoin.com`, Ubuntu 22.04, polls `main` every minute). Deployed
  website build runs from `main`; node deployment work must not disturb it.
- `.github/workflows/node-ci.yml`, `node-release.yml` — CI installs and runs
  the per-package tests on Node 22.

### Deployment target inventory (audited 2026-09-05, via SSH)

| Item | Value |
|---|---|
| Host | Ubuntu 22.04.2 LTS, 4 vCPU, 7.7 GiB RAM, 55 GiB free disk |
| Docker | 29.1.3 + Compose 2.40.3 (already installed) |
| Node.js (host) | v20.19.4 (not used — the node runs in Docker on node:22) |
| Existing services | `crestwave-web3.service` (MOOD website), `mood-auto-deploy.timer`, nginx, cloudflared tunnel, Moodify product services — **must not be disturbed** |
| Listening ports | 22, 80 public; 8000/8100/3100/3200/18080/20241 loopback only. **8080 is free** for the relay; a node API port must be chosen to avoid collisions |

(Credentials are intentionally not recorded here; they stay outside the
repository, per the rule stated in `ops/deploy/README.md`.)

---

## 5. Constraints from the governance layer

From `MOOD_CANON.md` / `AGENTS.md` / `MOOD_AI_COGNITIVE_MAP.md`:

- Phase Zero: code is secondary; do **not** add protocol features. This
  deployment adds **infrastructure only** — no protocol logic changes.
- Do not claim a production network is live without evidence. All reports
  must state exactly what was run, where, and for how long.
- No token dashboards / staking / wallets. The "dashboard API" here is
  **node operational status only** (uptime, heartbeats, events, proofs);
  reputation/tokens remain `NOT IMPLEMENTED` and are reported as such.
- Frozen surfaces (Alpha 001 envelope/hash engine, identity runtime) are not
  modified.

---

## 6. Conclusion

The repository already contains a genuine node daemon, an agent API, and a
relay — deployment readiness is a packaging problem, not a rewrite. Node
Deployment Alpha 001 should:

1. keep `@mood/node-runtime` and the protocol packages untouched;
2. upgrade the daemon's **operational shell** (JSON logs, configurable
   scheduler, metrics, reports) without changing protocol behavior;
3. extend `node-api` with the dashboard/health surface;
4. add `deployment/` (Dockerfile, compose, systemd, entrypoint) plus a
   simulation-mode runtime test;
5. deploy to the audited Ubuntu 22.04 host alongside (never in place of)
   the existing website deployment.

The phases that follow implement exactly this.
