/**
 * Node lifecycle control for the API layer.
 *
 * POST /node/start and /node/stop do NOT reimplement daemon lifecycle —
 * they drive the canonical `mood` binary with MOOD_JSON=1, the same
 * agent envelope any external agent would use. This guarantees the API
 * and a human at the terminal can never diverge: same binary, same
 * semantics, same state file.
 *
 * Architecture:
 *
 *   API  ──spawn──▶  mood start / mood stop  ──▶  node daemon
 *   (network face)     (canonical control)         (@mood/node-runtime)
 *
 * No shell is involved (argv array, never shell:true) and no endpoint
 * parameter ever reaches argv — the API starts and stops the node,
 * nothing else.
 */

import { spawn } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync } from 'fs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTROL_TIMEOUT_MS = 25_000; // `mood start` itself waits up to 10s

/**
 * Resolve the canonical `mood` CLI entry (bin/mood.js).
 *
 * 1. MOOD_BIN env override (explicit, for exotic installs)
 * 2. the @mood/cli workspace package (npm workspaces symlink)
 * 3. repository layout fallback (services/node-api/src → root)
 */
export function resolveMoodBin() {
  if (process.env.MOOD_BIN && existsSync(process.env.MOOD_BIN)) {
    return process.env.MOOD_BIN;
  }
  try {
    const pkgPath = require.resolve('@mood/cli/package.json');
    const bin = join(dirname(pkgPath), 'bin', 'mood.js');
    if (existsSync(bin)) return bin;
  } catch {
    // fall through to the layout fallback
  }
  return resolve(__dirname, '..', '..', '..', 'apps', 'mood-cli', 'bin', 'mood.js');
}

/**
 * Run `mood <command>` with the JSON envelope and return
 * { code, envelope } — envelope is the parsed {ok,...} object or null.
 */
function runMood(command) {
  return new Promise((resolvePromise) => {
    const bin = resolveMoodBin();
    const child = spawn(process.execPath, [bin, command], {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      env: { ...process.env, MOOD_JSON: '1' },
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });

    const timer = setTimeout(() => {
      child.kill();
      resolvePromise({ code: null, envelope: null, stderr: stderr || 'timeout' });
    }, CONTROL_TIMEOUT_MS);
    timer.unref?.();

    child.on('error', (err) => {
      clearTimeout(timer);
      resolvePromise({ code: null, envelope: null, stderr: err.message });
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      // The envelope is the last non-empty stdout line.
      let envelope = null;
      for (const line of stdout.split(/\r?\n/).reverse()) {
        const t = line.trim();
        if (t) {
          try {
            envelope = JSON.parse(t);
            break;
          } catch {
            envelope = null;
            break;
          }
        }
      }
      resolvePromise({ code, envelope, stderr });
    });
  });
}

/**
 * Start the node daemon. Returns { status: 'running' } on success.
 * Throws a ControlError with a machine code on failure.
 */
export async function startNode() {
  const { code, envelope, stderr } = await runMood('start');

  if (envelope && envelope.ok === true) {
    // started:true or alreadyRunning:true — both mean: the node runs.
    return { status: 'running' };
  }

  const message = envelope?.error || stderr?.trim() || `mood start exited with code ${code}`;
  if (/not initialized/i.test(message)) {
    const err = new Error(message);
    err.code = 'NOT_INITIALIZED';
    throw err;
  }
  const err = new Error(message);
  err.code = 'START_FAILED';
  throw err;
}

/**
 * Stop the node daemon. Idempotent: stopping a stopped node succeeds.
 */
export async function stopNode() {
  const { code, envelope, stderr } = await runMood('stop');

  if (envelope && envelope.ok === true) {
    return { status: 'stopped' };
  }

  const message = envelope?.error || stderr?.trim() || `mood stop exited with code ${code}`;
  if (/not initialized/i.test(message)) {
    const err = new Error(message);
    err.code = 'NOT_INITIALIZED';
    throw err;
  }
  const err = new Error(message);
  err.code = 'STOP_FAILED';
  throw err;
}
