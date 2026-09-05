/**
 * `mood start` — start the node runtime as a background daemon.
 *
 * Spawns `mood daemon` detached, waits for it to mark itself Running in
 * ~/.mood/state.json, then reports. The daemon keeps running after this
 * command exits (like `dockerd` started from a login shell).
 *
 * The work lives in startNode() so `mood restart` can compose it without
 * double-emitting envelopes.
 */

import { spawn } from 'child_process';
import { openSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { emit, renderKeyValue, green, yellow, dim } from '../ui/terminal.js';
import {
  isInitialized,
  readState,
  writeState,
  effectiveStatus,
  isProcessAlive,
  loadState,
  moodPaths,
} from '../state.js';
import { NETWORK_NAME, PROTOCOL_VERSION, RELAY_URL } from '../config/defaults.js';

const __filename = fileURLToPath(import.meta.url);
const BIN = resolve(__filename, '..', '..', '..', 'bin', 'mood.js');
const STARTUP_TIMEOUT_MS = 10_000;
const POLL_MS = 100;

function waitForRunning() {
  return new Promise((resolvePromise) => {
    const started = Date.now();
    const timer = setInterval(() => {
      const st = readState();
      if (st.status === 'Running' && isProcessAlive(st.pid)) {
        clearInterval(timer);
        resolvePromise(true);
      } else if (Date.now() - started > STARTUP_TIMEOUT_MS) {
        clearInterval(timer);
        resolvePromise(false);
      }
    }, POLL_MS);
  });
}

export async function startNode() {
  if (!isInitialized()) {
    throw new Error('Node not initialized — run `mood init` first');
  }

  if (effectiveStatus() === 'Running') {
    const st = readState();
    return {
      started: false,
      alreadyRunning: true,
      pid: st.pid,
      nodeId: loadState().nodeId,
      status: 'Running',
    };
  }

  const paths = moodPaths();

  // Clear any stale stop flag from a previous shutdown.
  writeState({ status: 'Starting', startedAt: null, pid: null, connectedPeers: [] });

  const logFd = openSync(paths.logFile, 'a');
  const child = spawn(process.execPath, [BIN, 'daemon'], {
    detached: true,
    stdio: ['ignore', logFd, logFd],
    windowsHide: true,
    env: { ...process.env },
  });
  child.unref();

  const ok = await waitForRunning();
  const st = readState();

  if (!ok) {
    writeState({ status: 'Stopped', pid: null });
    throw new Error(`Node failed to start within ${STARTUP_TIMEOUT_MS / 1000}s — see ${paths.logFile}`);
  }

  return {
    started: true,
    nodeId: loadState().nodeId,
    network: NETWORK_NAME,
    protocol: PROTOCOL_VERSION,
    relay: RELAY_URL,
    status: 'Running',
    pid: st.pid,
    log: paths.logFile,
  };
}

export async function run(args, flags) {
  if (!flags.json && effectiveStatus() !== 'Running') {
    process.stdout.write('\n  Starting MOOD Node...\n');
  }

  const result = await startNode();

  if (flags.json) {
    emit(result, '', flags);
    return;
  }

  process.stdout.write('\n');
  const rows = [
    ['Protocol:', yellow('v' + PROTOCOL_VERSION)],
    ['Network:', yellow(NETWORK_NAME)],
    ['Status:', green('Running')],
    ['PID:', String(result.pid)],
    ['Log:', dim(result.log)],
  ];
  for (const [k, v] of rows) {
    process.stdout.write(`  ${k.padEnd(12, ' ')} ${v}\n`);
  }
  process.stdout.write('\n');
  process.stdout.write(dim('  Peers synchronize when a relay is reachable (npm run dev:relay).\n\n'));
}

export default { run };
