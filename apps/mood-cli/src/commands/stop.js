/**
 * `mood stop` — stop the node daemon.
 *
 * Writes the cooperative stop flag AND signals the pid; the daemon
 * reconciles state.json to Stopped on its way out. If the daemon is
 * already gone, the state file is repaired.
 */

import { writeFileSync, existsSync, rmSync } from 'fs';
import { emit, renderKeyValue, dim } from '../ui/terminal.js';
import {
  isInitialized,
  readState,
  writeState,
  effectiveStatus,
  isProcessAlive,
  moodPaths,
} from '../state.js';

const STOP_TIMEOUT_MS = 8_000;
const POLL_MS = 100;

function waitForExit(pid) {
  return new Promise((resolvePromise) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (!isProcessAlive(pid) || Date.now() - started > STOP_TIMEOUT_MS) {
        clearInterval(timer);
        resolvePromise(!isProcessAlive(pid));
      }
    }, POLL_MS);
  });
}

export async function run(args, flags) {
  if (!isInitialized()) {
    throw new Error('Node not initialized — run `mood init` first');
  }

  const paths = moodPaths();
  const status = effectiveStatus();

  if (status !== 'Running') {
    if (flags.json) {
      emit({ stopped: false, wasRunning: false, status: 'Stopped' }, '', flags);
      return;
    }
    process.stdout.write(renderKeyValue('MOOD Node is not running.', [
      ['Status:', 'Stopped'],
    ]));
    return;
  }

  const st = readState();
  const pid = st.pid;

  // Cooperative flag first, then the signal — whichever lands first wins.
  writeFileSync(paths.stopFlagFile, String(Date.now()));
  try {
    if (isProcessAlive(pid)) {
      process.kill(pid);
    }
  } catch {
    // already gone — fine
  }

  const exited = await waitForExit(pid);

  // Reconcile state if the daemon could not do it (killed hard).
  if (readState().status !== 'Stopped') {
    writeState({ ...readState(), status: 'Stopped', pid: null, stoppedAt: new Date().toISOString() });
  }
  try {
    if (existsSync(paths.stopFlagFile)) rmSync(paths.stopFlagFile);
  } catch {
    // best effort
  }

  if (flags.json) {
    emit({ stopped: true, wasRunning: true, clean: exited, pid, status: 'Stopped' }, '', flags);
    return;
  }

  process.stdout.write(renderKeyValue('MOOD Node stopped.', [
    ['PID:', String(pid)],
    ['Exit:', exited ? 'clean' : 'forced'],
  ]));
  process.stdout.write(dim('  The local identity and snapshots are preserved in ~/.mood/.\n\n'));
}

export default { run };
