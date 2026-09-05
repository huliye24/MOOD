#!/usr/bin/env node
/**
 * MOOD node container entrypoint — the PID-1 supervisor.
 * Node Deployment Alpha 001, Phase 2.
 *
 * Infrastructure only. This file adds NO node logic: every node action
 * delegates to the canonical CLI (`mood init` / `mood start` / `mood stop`)
 * — there is no second daemon implementation (deployment/ARCHITECTURE.md §9).
 *
 *   entrypoint (PID 1, this process)
 *     ├─ mood daemon   spawned detached by canonical `mood start`
 *     └─ node-api      direct child, FOREGROUND, respawn on crash
 *
 * Why the API in the foreground: the container's lifetime is the API's
 * lifetime (operators poll /health). The daemon is lifecycle-managed
 * through the same state files as on a host — the API can crash and
 * respawn while the daemon keeps running, and the watchdog below re-runs
 * the idempotent `mood start` if the daemon process dies.
 *
 * Contract:
 *   - stdout is JSON lines, the same record shape as logs/node.log:
 *     {timestamp, level, node_id, event, status, …}
 *   - the process exits 0 only after SIGTERM/SIGINT → API child stopped →
 *     canonical `mood stop` completed → state.json says Stopped.
 *
 * MOOD_APP_ROOT (default /app) lets the supervisor run outside a
 * container — tests exercise it against the repository checkout.
 */

import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APP_ROOT = process.env.MOOD_APP_ROOT || '/app';
const MOOD_BIN = join(APP_ROOT, 'apps', 'mood-cli', 'bin', 'mood.js');
const API_SERVER = join(APP_ROOT, 'services', 'node-api', 'src', 'server.js');
const MOOD_HOME = process.env.MOOD_HOME || '';

const API_RESPAWN_MIN_MS = 1_000;
const API_RESPAWN_MAX_MS = 30_000;
const API_STABLE_MS = 60_000;       // uptime that resets the respawn backoff
const WATCHDOG_INTERVAL_MS = 30_000;
const CLI_TIMEOUT_MS = 20_000;
const SHUTDOWN_TIMEOUT_MS = 20_000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

if (!MOOD_HOME) {
  process.stderr.write('docker-entrypoint: MOOD_HOME is required (the image sets /data)\n');
  process.exit(1);
}

// ── JSON-line logging (same record shape as the daemon's node.log) ─────────

let cachedNodeId = null;

function nodeId() {
  if (cachedNodeId) return cachedNodeId;
  try {
    cachedNodeId = JSON.parse(
      readFileSync(join(MOOD_HOME, 'identity', 'node.json'), 'utf8'),
    ).nodeId || null;
  } catch {
    return null; // before `mood init` — honest null, like /health
  }
  return cachedNodeId;
}

function log(event, fields = {}) {
  const level = fields.level || 'info';
  const record = {
    timestamp: new Date().toISOString(),
    level,
    node_id: nodeId(),
    event,
    status: fields.status || (level === 'error' ? 'error' : 'ok'),
    ...fields,
  };
  process.stdout.write(JSON.stringify(record) + '\n');
}

// ── Canonical CLI + state helpers ──────────────────────────────────────────

/** Run a canonical `mood <args> --json` command synchronously. */
function cli(args, timeoutMs = CLI_TIMEOUT_MS) {
  return spawnSync(process.execPath, [MOOD_BIN, ...args, '--json'], {
    encoding: 'utf8',
    timeout: timeoutMs,
    env: process.env,
  });
}

/** Run a CLI command that MUST succeed; exit 1 on failure (restart policy
 *  then brings the container back — fail loud, never run half-booted). */
function cliOk(args, what) {
  const r = cli(args);
  if (r.status !== 0 || r.error) {
    log('entrypoint_failed', {
      level: 'error',
      what,
      code: r.status,
      error: r.error ? String(r.error) : undefined,
      stderr: (r.stderr || '').trim().slice(0, 2000),
      stdout: (r.stdout || '').trim().slice(0, 2000),
    });
    process.exit(1);
  }
  try {
    return JSON.parse(r.stdout);
  } catch {
    log('entrypoint_failed', {
      level: 'error',
      what,
      reason: 'stdout was not the JSON envelope',
      stdout: (r.stdout || '').trim().slice(0, 2000),
    });
    process.exit(1);
  }
}

function alive(pid) {
  if (!pid || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readState() {
  try {
    return JSON.parse(readFileSync(join(MOOD_HOME, 'state.json'), 'utf8'));
  } catch {
    return {};
  }
}

// ── Boot: init → start daemon ──────────────────────────────────────────────

log('entrypoint_started', {
  pid: process.pid,
  node_version: process.version,
  mood_home: MOOD_HOME,
  app_root: APP_ROOT,
});

// Idempotent: first boot mints the identity; later boots reuse it.
const init = cliOk(['init'], 'mood init');
log('identity_ready', { node_id: init.nodeId, created: init.created });

// Container-restart reconciliation. state.json lives in the /data volume
// and survives the container; a previous incarnation may have left it
// Running with a pid from a pid namespace that no longer exists. No
// daemon can have survived into this container — reconcile to Stopped
// (same write `mood stop` performs; metrics and history preserved) so
// the canonical `mood start` below boots a real daemon instead of
// trusting a pid that may collide with an unrelated process.
const staleState = readState();
if (staleState.status === 'Running') {
  writeFileSync(
    join(MOOD_HOME, 'state.json'),
    JSON.stringify({
      ...staleState,
      status: 'Stopped',
      pid: null,
      stoppedAt: new Date().toISOString(),
    }, null, 2) + '\n',
  );
  log('entrypoint_reconciled_stale_state', {
    level: 'warn',
    old_pid: staleState.pid || null,
  });
}

// Canonical daemon start — spawns the daemon detached (reparented here, to
// PID 1). A reparented daemon that dies leaves a zombie until this process
// exits; that is bounded (one process, and exit comes with the container)
// and the watchdog below repairs the runtime long before it matters.
const started = cliOk(['start'], 'mood start');
log('daemon_started', {
  started: started.started,
  already_running: started.alreadyRunning || false,
  pid: started.pid,
});

// ── API child: foreground, respawn on crash ────────────────────────────────

let apiChild = null;
let apiRespawnMs = API_RESPAWN_MIN_MS;
let apiStartedAt = 0;
let shuttingDown = false;

function spawnApi() {
  apiStartedAt = Date.now();
  apiChild = spawn(process.execPath, [API_SERVER], {
    stdio: 'inherit',
    env: process.env,
  });
  log('api_started', {
    pid: apiChild.pid,
    port: process.env.MOOD_API_PORT || '8788',
  });

  apiChild.on('exit', (code, signal) => {
    if (shuttingDown) return; // the supervisor is stopping — expected
    const uptimeMs = Date.now() - apiStartedAt;
    if (uptimeMs >= API_STABLE_MS) {
      apiRespawnMs = API_RESPAWN_MIN_MS; // it ran fine — forgive the backoff
    }
    log('api_exited', {
      level: 'warn',
      code,
      signal,
      uptime_ms: uptimeMs,
      respawn_in_ms: apiRespawnMs,
    });
    const delay = apiRespawnMs;
    apiRespawnMs = Math.min(apiRespawnMs * 2, API_RESPAWN_MAX_MS);
    setTimeout(spawnApi, delay); // capped backoff, forever — 24/7 by contract
  });
}

spawnApi();

// ── Daemon watchdog ────────────────────────────────────────────────────────
// state.json says Running but the pid is dead → the daemon crashed; re-run
// the idempotent `mood start`. A DELIBERATE stop (POST /node/stop, someone
// running `mood stop`) leaves status Stopped and is respected — the
// supervisor repairs crashes, it does not fight the operator.

const watchdog = setInterval(() => {
  const state = readState();
  if (state.status !== 'Running') return; // deliberate stop — respected
  if (alive(state.pid)) return;           // healthy

  log('daemon_dead', { level: 'warn', pid: state.pid });
  const again = cliOk(['start'], 'daemon watchdog restart');
  log('daemon_restarted', { reason: 'crash', pid: again.pid });
}, WATCHDOG_INTERVAL_MS);
watchdog.unref?.();

// ── Shutdown: SIGTERM/SIGINT → API stopped → mood stop → exit 0 ────────────

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  clearInterval(watchdog);

  log('entrypoint_stopping', { signal });

  // 1. Stop the API child (its own handlers drain and exit).
  if (apiChild && apiChild.exitCode === null) {
    apiChild.kill('SIGTERM');
  }

  // 2. Canonical daemon stop — blocks until state is reconciled.
  const stop = cli(['stop']);
  const stopEnvelope = (() => {
    try {
      return JSON.parse(stop.stdout);
    } catch {
      return { ok: false };
    }
  })();
  log('daemon_stop_result', {
    code: stop.status,
    stopped: stopEnvelope.stopped || false,
    clean: stopEnvelope.clean === true,
  });

  // 3. Wait (bounded) for state.json to say Stopped and the API to be gone.
  const deadline = Date.now() + SHUTDOWN_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const state = readState();
    const apiGone = !apiChild || apiChild.exitCode !== null;
    if (state.status === 'Stopped' && apiGone) break;
    await sleep(250);
  }

  const finalState = readState();
  if (finalState.status !== 'Stopped' || (apiChild && apiChild.exitCode === null)) {
    log('entrypoint_stop_timeout', {
      level: 'warn',
      daemon_status: finalState.status || 'unknown',
      api_still_running: apiChild ? apiChild.exitCode === null : false,
    });
  }

  log('entrypoint_stopped', { daemon_status: finalState.status || 'unknown' });
  process.exit(0);
}

process.on('SIGTERM', () => { shutdown('SIGTERM'); });
process.on('SIGINT', () => { shutdown('SIGINT'); });

// The API child and the watchdog keep the event loop alive; if every child
// is mid-backoff, the respawn timers do. PID 1 never exits on its own.
