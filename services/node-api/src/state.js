/**
 * Read-only access to the local MOOD node state (~/.mood/).
 *
 * The ~/.mood/ tree is a documented on-disk contract (see
 * docs/node/CLI.md) shared by every MOOD face. This module reads it for
 * the API; it contains no node logic of its own — identity, snapshot and
 * verification logic live in @mood/node-runtime.
 *
 * SECURITY INVARIANT: this module NEVER reads identity/private.json.
 * The API process therefore never holds the node's private key in
 * memory. The private key stays between the local daemon and the disk.
 *
 * All reads are local-only. The protocol layer remains unchanged.
 */

import {
  existsSync,
  readFileSync,
  readdirSync,
} from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { containsSecret } from '@mood/contribution-proof';

// Mirror of NETWORK_NAME in apps/mood-cli/src/config/defaults.js — used
// only as a fallback when config/node.json is absent. The config file
// written by `mood init` is the primary source.
const DEFAULT_NETWORK_NAME = 'MOOD Alpha Testnet';

// ── Paths ───────────────────────────────────────────────────────────────────

export function moodHome() {
  return process.env.MOOD_HOME || join(homedir(), '.mood');
}

export function moodPaths() {
  const root = moodHome();
  return {
    root,
    identityFile: join(root, 'identity', 'node.json'),
    configFile: join(root, 'config', 'node.json'),
    snapshotsDir: join(root, 'snapshots'),
    latestSnapshotFile: join(root, 'snapshots', 'latest.json'),
    stateFile: join(root, 'state.json'),
    apiStateFile: join(root, 'api-state.json'),
    logsDir: join(root, 'logs'),
    reportsDir: join(root, 'reports'),
  };
}

// ── Readers (all null-safe) ─────────────────────────────────────────────────

function readJson(file) {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Public identity record (identity/node.json) — nodeId, publicKey, org.
 * Never the private side. Null when the node is not initialized.
 */
export function readIdentity() {
  return readJson(moodPaths().identityFile);
}

/**
 * Runtime config (config/node.json) — network, protocol, peers. Null
 * when the node is not initialized.
 */
export function readConfig() {
  return readJson(moodPaths().configFile);
}

/**
 * Ephemeral daemon state (state.json) — status, pid, connectedPeers.
 */
export function readState() {
  return readJson(moodPaths().stateFile) || { status: 'Stopped' };
}

/**
 * Is a process with this pid alive? (pid 0/null → false)
 * Same probe semantics as the CLI state layer.
 */
export function isProcessAlive(pid) {
  if (!pid || typeof pid !== 'number') return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM' ? true : false;
  }
}

/**
 * Effective daemon status: reconciles the on-disk claim with process
 * reality. Read-only variant of the CLI's effectiveStatus() — the API
 * never rewrites state.json; it reports what is true. `mood start` /
 * `mood stop` / the daemon own that file.
 */
export function effectiveStatus() {
  const st = readState();
  if (st.status === 'Running') {
    return isProcessAlive(st.pid) ? 'Running' : 'Stopped';
  }
  return st.status || 'Stopped';
}

/**
 * The latest snapshot pointer (snapshots/latest.json), or null.
 */
export function readLatestSnapshot() {
  return readJson(moodPaths().latestSnapshotFile);
}

/**
 * The full latest snapshot OBJECT — pointer first, then the highest-epoch
 * snapshot file on disk as fallback. Null when the node has no snapshot.
 */
export function readLatestSnapshotObject() {
  const p = moodPaths();
  const pointer = readLatestSnapshot();
  if (pointer && pointer.snapshotFile) {
    const snap = readJson(join(p.snapshotsDir, pointer.snapshotFile));
    if (snap) return snap;
  }

  if (!existsSync(p.snapshotsDir)) return null;
  let best = null;
  for (const f of readdirSync(p.snapshotsDir)) {
    if (!f.endsWith('.json') || f === 'latest.json') continue;
    const snap = readJson(join(p.snapshotsDir, f));
    if (snap && (!best || (snap.epochNumber || 0) > (best.epochNumber || 0))) {
      best = snap;
    }
  }
  return best;
}

/**
 * Everything /node/status needs, in one read. Returns null when the
 * node is not initialized (identity record absent).
 */
export function loadNodeStatus() {
  const identity = readIdentity();
  if (!identity) return null;

  const config = readConfig() || {};
  const state = readState();
  const pointer = readLatestSnapshot();

  const epochNumber = (pointer && pointer.epochNumber)
    || config.epoch
    || 1;

  return {
    nodeId: identity.nodeId,
    network: config.network || DEFAULT_NETWORK_NAME,
    networkId: config.networkId || identity.networkId,
    protocolVersion: config.protocolVersion || identity.protocolVersion || '0.1',
    status: effectiveStatus(),
    startedAt: state.startedAt || null,
    pid: state.pid || null,
    connectedPeers: state.connectedPeers || [],
    epochNumber,
    snapshot: pointer || null,
  };
}

/**
 * Pad an epoch number the way the protocol displays epochs: "001".
 */
export function formatEpoch(n) {
  return String(n).padStart(3, '0');
}

// ── Deployment dashboard readers (Node Deployment Alpha 001) ────────────────

/** The JSON log sinks the daemon writes (see apps/mood-cli/src/logging.js). */
const LOG_SOURCES = new Set(['node', 'error', 'heartbeat']);

/**
 * Tail of a daemon JSON log. Returns the last `limit` parsed records in
 * chronological order. Malformed lines are skipped, never fatal; a record
 * that trips the credential guard is refused — present but stripped, the
 * same read-side defense as /contributions. Unknown sources return null.
 */
export function readLogTail({ source = 'node', limit = 50 } = {}) {
  if (!LOG_SOURCES.has(source)) return null;
  const file = join(moodPaths().logsDir, `${source}.log`);
  let lines;
  try {
    lines = readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());
  } catch {
    return []; // absent log = empty tail (the daemon has not run yet)
  }

  const tail = lines.slice(-Math.max(1, Math.min(limit, 1000)));
  return tail.map((line) => {
    let record = null;
    try {
      record = JSON.parse(line);
    } catch {
      record = null;
    }
    if (record === null) {
      return { event: null, refused: 'unparseable log record' };
    }
    if (containsSecret(line)) {
      return { event: null, refused: 'credential-shaped content — this record is not served' };
    }
    return record;
  });
}

/**
 * Number of epoch snapshot files on disk (latest.json excluded — it is a
 * pointer, not a snapshot).
 */
export function countSnapshots() {
  const dir = moodPaths().snapshotsDir;
  if (!existsSync(dir)) return 0;
  try {
    return readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'latest.json').length;
  } catch {
    return 0;
  }
}
