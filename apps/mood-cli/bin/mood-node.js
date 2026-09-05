#!/usr/bin/env node
/**
 * mood-node — the node operator entry (Node Deployment Alpha 001).
 *
 * Thin dispatcher over the canonical `mood` lifecycle commands. It owns
 * no daemon logic: start/status/stop/restart are exactly
 * `mood start|status|stop|restart`, so there is one implementation of
 * node lifecycle, one state file, one log directory.
 *
 * Usage:
 *   mood-node start      start the node daemon
 *   mood-node status     show node status
 *   mood-node stop       stop the node daemon
 *   mood-node restart    stop then start
 *
 * Flags pass through verbatim (e.g. `mood-node status --json`).
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MOOD_BIN = resolve(__dirname, 'mood.js');
const COMMANDS = new Set(['start', 'status', 'stop', 'restart']);

const argv = process.argv.slice(2);
const command = argv[0];

function usage() {
  return [
    'mood-node — MOOD Protocol node operator entry',
    '',
    'Usage: mood-node <command> [flags]',
    '',
    'Commands:',
    '  start      start the node daemon',
    '  status     show node status',
    '  stop       stop the node daemon',
    '  restart    stop then start',
    '',
    'Flags pass through to the underlying `mood` command (e.g. --json).',
    '',
  ].join('\n');
}

if (!command || !COMMANDS.has(command)) {
  process.stdout.write(usage());
  process.exit(command ? 1 : 0);
}

const child = spawn(process.execPath, [MOOD_BIN, ...argv], {
  stdio: 'inherit',
  windowsHide: true,
});

child.on('exit', (code, signal) => {
  if (signal) {
    try {
      process.kill(process.pid, signal);
    } catch {
      process.exit(1);
    }
    return;
  }
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  process.stderr.write(`mood-node: ${err.message}\n`);
  process.exit(1);
});
