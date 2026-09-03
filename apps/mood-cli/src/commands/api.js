/**
 * `mood api` — start/stop/status for the MOOD Agent Layer API.
 *
 * The CLI is the human entry; the API is the AI entry. This command
 * exists so a human turns the AI door on the same way they turn the node
 * on: one command, one state file, one log.
 *
 *   mood api start [--port <n>] [--bind <addr>] [--key <secret>]
 *   mood api status
 *   mood api stop
 *
 * The API server itself is services/node-api (a sibling workspace). We
 * only spawn it detached and watch ~/.mood/api-state.json — no API logic
 * lives in the CLI.
 */

import { spawn } from 'child_process';
import { createRequire } from 'module';
import { existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { emit, renderKeyValue, green, yellow, dim } from '../ui/terminal.js';
import {
  isInitialized,
  readState as readNodeState,
  isProcessAlive,
  moodPaths,
} from '../state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const DEFAULT_PORT = 8788;
const DEFAULT_BIND = '127.0.0.1';
const STARTUP_TIMEOUT_MS = 10_000;
const STOP_TIMEOUT_MS = 8_000;
const POLL_MS = 100;

/**
 * Resolve the Agent Layer server entry (services/node-api/src/server.js).
 * Same resolution order as the API uses for the mood binary:
 * env override → workspace package → repository layout.
 */
function resolveApiServer() {
  if (process.env.MOOD_API_SERVER && existsSync(process.env.MOOD_API_SERVER)) {
    return process.env.MOOD_API_SERVER;
  }
  try {
    const pkg = require.resolve('@mood/node-api/package.json');
    const entry = join(dirname(pkg), 'src', 'server.js');
    if (existsSync(entry)) return entry;
  } catch {
    // fall through to the repository layout
  }
  return resolve(__dirname, '..', '..', '..', '..', 'services', 'node-api', 'src', 'server.js');
}

function readApiState() {
  const p = moodPaths();
  if (!existsSync(p.apiStateFile)) return null;
  try {
    return JSON.parse(readFileSync(p.apiStateFile, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Is the API up? (state file claims Running AND the pid is alive)
 */
function apiEffectiveStatus() {
  const st = readApiState();
  if (!st) return { status: 'Stopped', st: null };
  if (st.status === 'Running' && isProcessAlive(st.pid)) {
    return { status: 'Running', st };
  }
  return { status: 'Stopped', st };
}

/**
 * Probe GET /health. Returns the parsed body or null.
 */
async function probeHealth(port, timeoutMs = 2_000) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── mood api start ───────────────────────────────────────────────────────────

async function startApi(sub, flags) {
  const paths = moodPaths();

  const current = apiEffectiveStatus();
  if (current.status === 'Running' && current.st) {
    const st = current.st;
    if (flags.json) {
      emit({ started: false, alreadyRunning: true, pid: st.pid, endpoint: `http://${st.bind}:${st.port}` }, '', flags);
      return;
    }
    process.stdout.write(renderKeyValue('MOOD API is already running.', [
      ['Endpoint:', `http://${st.bind}:${st.port}`],
      ['PID:', String(st.pid)],
    ]));
    return;
  }

  const port = Number(flags.port) || Number(process.env.MOOD_API_PORT) || DEFAULT_PORT;
  const bind = flags.bind || process.env.MOOD_API_BIND || DEFAULT_BIND;
  const key = flags.key || process.env.MOOD_API_KEY || null;

  if (!flags.json) {
    process.stdout.write('\n  Starting MOOD API...\n');
  }

  mkdirSync(paths.logsDir, { recursive: true });
  const logFd = openSync(paths.apiLogFile, 'a');

  const env = {
    ...process.env,
    MOOD_API_PORT: String(port),
    MOOD_API_BIND: bind,
  };
  if (key) env.MOOD_API_KEY = String(key);

  const child = spawn(process.execPath, [resolveApiServer()], {
    detached: true,
    stdio: ['ignore', logFd, logFd],
    windowsHide: true,
    env,
  });
  child.unref();

  // Wait for the server to mark itself Running (it writes api-state.json
  // in its listen callback — same self-registration as the node daemon).
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  let st = null;
  while (Date.now() < deadline) {
    st = readApiState();
    if (st && st.status === 'Running' && st.pid === child.pid) break;
    if (st && st.status === 'Running' && isProcessAlive(st.pid)) break;
    await sleep(POLL_MS);
  }

  const endpoint = `http://${bind}:${port}`;

  if (!st || st.status !== 'Running') {
    throw new Error(`MOOD API failed to start within ${STARTUP_TIMEOUT_MS / 1000}s — see ${paths.apiLogFile}`);
  }

  // Confirm the agent door actually answers before announcing readiness.
  const health = await probeHealth(st.port);

  if (flags.json) {
    emit({
      started: true,
      endpoint,
      port: st.port,
      bind: st.bind,
      status: health ? 'Ready for AI Agents' : 'Running (health check pending)',
      pid: st.pid,
      key: key ? 'enabled' : 'disabled',
      log: paths.apiLogFile,
    }, '', flags);
    return;
  }

  process.stdout.write('\n');
  process.stdout.write(`  Endpoint: ${green(endpoint)}\n`);
  process.stdout.write(`  Status:   ${health ? green('Ready for AI Agents') : yellow('Starting…')}\n`);
  process.stdout.write(dim(`  PID:      ${st.pid}\n`));
  if (key) process.stdout.write(dim(`  Key:      enabled (Authorization: Bearer <key>)\n`));
  else process.stdout.write(dim('  Key:      disabled (local-only default)\n'));
  process.stdout.write(dim(`  Log:      ${paths.apiLogFile}\n`));
  process.stdout.write('\n');
  process.stdout.write(dim('  The API is the AI Agent entry. Try: curl ' + endpoint + '/node/status\n\n'));
}

// ── mood api status ──────────────────────────────────────────────────────────

async function statusApi(sub, flags) {
  const paths = moodPaths();
  const { status, st } = apiEffectiveStatus();

  let health = null;
  if (status === 'Running' && st) {
    health = await probeHealth(st.port);
  }

  if (flags.json) {
    emit({
      status,
      endpoint: st ? `http://${st.bind}:${st.port}` : null,
      port: st?.port ?? null,
      bind: st?.bind ?? null,
      pid: st?.pid ?? null,
      key: st?.key ?? null,
      health: health ? 'ok' : (status === 'Running' ? 'unreachable' : null),
      log: paths.apiLogFile,
    }, '', flags);
    return;
  }

  const nodeSt = readNodeState();
  const rows = [
    ['Status:', status === 'Running' ? green('Running') : yellow(status)],
  ];
  if (st) {
    rows.push(['Endpoint:', `http://${st.bind}:${st.port}`]);
    rows.push(['Health:', status === 'Running' ? (health ? green('ok') : yellow('unreachable')) : '—']);
    rows.push(['Key:', st.key === 'enabled' ? green('enabled') : dim('disabled')]);
    rows.push(['PID:', String(st.pid)]);
  }
  rows.push(['Node:', nodeSt.status === 'Running' ? green('Running') : yellow(nodeSt.status || 'Stopped')]);
  process.stdout.write(renderKeyValue('MOOD API Status', rows));
  process.stdout.write(dim('  Agents read this API; humans read `mood status`.\n\n'));
}

// ── mood api stop ────────────────────────────────────────────────────────────

async function stopApi(sub, flags) {
  const paths = moodPaths();
  const { status, st } = apiEffectiveStatus();

  if (status !== 'Running' || !st) {
    if (flags.json) {
      emit({ stopped: false, wasRunning: false, status: 'Stopped' }, '', flags);
      return;
    }
    process.stdout.write(renderKeyValue('MOOD API is not running.', [
      ['Status:', 'Stopped'],
    ]));
    return;
  }

  const pid = st.pid;

  // Cooperative flag first, then the signal — whichever lands first wins
  // (same cross-platform pattern as `mood stop`).
  writeFileSync(paths.apiStopFlagFile, String(Date.now()));
  try {
    if (isProcessAlive(pid)) process.kill(pid);
  } catch {
    // already gone — fine
  }

  const deadline = Date.now() + STOP_TIMEOUT_MS;
  let exited = false;
  while (Date.now() < deadline) {
    if (!isProcessAlive(pid)) { exited = true; break; }
    await sleep(POLL_MS);
  }

  // Reconcile state if the server could not (killed hard on Windows).
  const after = readApiState();
  if (!after || after.status !== 'Stopped') {
    try {
      writeFileSync(paths.apiStateFile, JSON.stringify({
        status: 'Stopped',
        pid: null,
        port: st.port,
        bind: st.bind,
        stoppedAt: new Date().toISOString(),
      }, null, 2));
    } catch {
      // best effort
    }
  }
  try {
    if (existsSync(paths.apiStopFlagFile)) rmSync(paths.apiStopFlagFile);
  } catch {
    // best effort
  }

  if (flags.json) {
    emit({ stopped: true, wasRunning: true, clean: exited, pid, status: 'Stopped' }, '', flags);
    return;
  }

  process.stdout.write(renderKeyValue('MOOD API stopped.', [
    ['PID:', String(pid)],
    ['Exit:', exited ? 'clean' : 'forced'],
  ]));
  process.stdout.write(dim('  The node itself keeps running (`mood stop` stops it).\n\n'));
}

// ── router ───────────────────────────────────────────────────────────────────

export async function run(args, flags) {
  const sub = args[0] || 'status';

  switch (sub) {
    case 'start': return startApi(sub, flags);
    case 'status': return statusApi(sub, flags);
    case 'stop': return stopApi(sub, flags);
    default:
      throw new Error(`unknown subcommand: mood api ${sub} (try start, status, stop)`);
  }
}

export default { run };
