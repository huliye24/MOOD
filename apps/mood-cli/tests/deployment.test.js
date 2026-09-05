/**
 * Node Deployment Alpha 001 test suite.
 *
 * Covers the deployment-grade operational shell added on top of the
 * existing CLI (protocol behavior unchanged):
 *
 *   1. scheduler    — resolveSchedule defaults, env overrides, time scale
 *   2. logging      — JSON records in node.log / error.log / heartbeat.log
 *   3. daemon       — JSON log trail, metrics in state.json, runtime
 *                     reports, simulation stamping (compressed schedule)
 *   3b. relay env   — MOOD_RELAY_URL overrides the config-file relay
 *   4. restart      — stop + start composition
 *   5. mood-node    — the operator entry delegates to `mood` verbatim
 *
 * Run: npm test   (from apps/mood-cli)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  existsSync,
  readFileSync,
  readdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveSchedule, DEFAULT_SCHEDULE } from '../src/scheduler.js';
import { createNodeLogger } from '../src/logging.js';

const __filename = fileURLToPath(import.meta.url);
const BIN = resolve(__filename, '..', '..', 'bin', 'mood.js');
const NODE_BIN = resolve(__filename, '..', '..', 'bin', 'mood-node.js');

/** Fresh sandbox: its own MOOD_HOME and its own working directory. */
function sandbox() {
  const root = mkdtempSync(join(tmpdir(), 'mood-deploy-test-'));
  const home = join(root, 'home');
  const cwd = join(root, 'cwd');
  mkdirSync(home);
  mkdirSync(cwd);
  return {
    home,
    cwd,
    root,
    cleanup() {
      rmSync(root, { recursive: true, force: true });
    },
  };
}

/** Run the CLI as a subprocess. */
function mood(box, args, extraEnv = {}) {
  return spawnSync(process.execPath, [BIN, ...args], {
    cwd: box.cwd,
    encoding: 'utf8',
    env: { ...process.env, MOOD_HOME: box.home, ...extraEnv },
  });
}

/** Run and assert exit code 0. */
function moodOk(box, args, extraEnv = {}) {
  const r = mood(box, args, extraEnv);
  assert.equal(r.status, 0, `mood ${args.join(' ')} failed:\n${r.stderr}`);
  return r.stdout;
}

/** Parse the JSON envelope of a --json invocation. */
function moodJson(box, args, extraEnv = {}) {
  const out = moodOk(box, [...args, '--json'], extraEnv);
  const envelope = JSON.parse(out);
  assert.equal(envelope.ok, true, `envelope not ok: ${out}`);
  return envelope;
}

/** Read a JSON-lines log file into parsed records. */
function readJsonLines(file) {
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

// ── 1. Scheduler ───────────────────────────────────────────────────────────

test('scheduler: defaults match the deployment contract', () => {
  const s = resolveSchedule({});
  assert.equal(s.heartbeatMs, 60_000);
  assert.equal(s.maintenanceMs, 300_000);
  assert.equal(s.reportMs, 3_600_000);
  assert.equal(s.relayRetryMs, 60_000);
  assert.equal(s.stopPollMs, 1_000);
  assert.equal(s.timeScale, 1);
  assert.equal(s.simulation, false);
  assert.deepEqual(
    [DEFAULT_SCHEDULE.heartbeatMs, DEFAULT_SCHEDULE.maintenanceMs, DEFAULT_SCHEDULE.reportMs],
    [60_000, 300_000, 3_600_000]
  );
});

test('scheduler: environment variables override intervals', () => {
  const s = resolveSchedule({
    MOOD_HEARTBEAT_INTERVAL_MS: '5000',
    MOOD_MAINTENANCE_INTERVAL_MS: '15000',
    MOOD_REPORT_INTERVAL_MS: '90000',
    MOOD_RELAY_RETRY_INTERVAL_MS: '7000',
  });
  assert.equal(s.heartbeatMs, 5_000);
  assert.equal(s.maintenanceMs, 15_000);
  assert.equal(s.reportMs, 90_000);
  assert.equal(s.relayRetryMs, 7_000);
  assert.equal(s.simulation, false);
});

test('scheduler: MOOD_TIME_SCALE divides intervals (simulation mode)', () => {
  const s = resolveSchedule({ MOOD_TIME_SCALE: '60' });
  assert.equal(s.heartbeatMs, 1_000);        // 60s / 60 → 1 real second
  assert.equal(s.maintenanceMs, 5_000);      // 5min / 60
  assert.equal(s.reportMs, 60_000);          // 1h / 60 → 1 real minute
  assert.equal(s.relayRetryMs, 1_000);
  assert.equal(s.stopPollMs, 1_000);         // never scaled
  assert.equal(s.timeScale, 60);
  assert.equal(s.simulation, true);
});

test('scheduler: MOOD_SIMULATION marks a run without scaling', () => {
  const s = resolveSchedule({ MOOD_SIMULATION: '1' });
  assert.equal(s.timeScale, 1);
  assert.equal(s.simulation, true);
});

test('scheduler: invalid values fall back to defaults, never crash', () => {
  const s = resolveSchedule({
    MOOD_HEARTBEAT_INTERVAL_MS: 'not-a-number',
    MOOD_MAINTENANCE_INTERVAL_MS: '-5',
    MOOD_REPORT_INTERVAL_MS: '',
    MOOD_TIME_SCALE: 'zero',
  });
  assert.equal(s.heartbeatMs, DEFAULT_SCHEDULE.heartbeatMs);
  assert.equal(s.maintenanceMs, DEFAULT_SCHEDULE.maintenanceMs);
  assert.equal(s.reportMs, DEFAULT_SCHEDULE.reportMs);
  assert.equal(s.timeScale, 1);
});

// ── 2. JSON logging ────────────────────────────────────────────────────────

test('logging: records carry the deployment shape across three sinks', () => {
  const root = mkdtempSync(join(tmpdir(), 'mood-log-test-'));
  try {
    const nodeId = 'mood:node:' + 'a'.repeat(64);
    const logger = createNodeLogger({ logsDir: join(root, 'logs'), nodeId });

    logger.info('node_boot', { pid: 123 });
    logger.warn('relay_unreachable', { error: 'refused' });
    logger.error('snapshot_maintenance_failed', { error: 'boom' });
    logger.heartbeat({ heartbeat_count: 1, connected_peers: 0 });

    const all = readJsonLines(join(root, 'logs', 'node.log'));
    assert.equal(all.length, 4);

    for (const record of all) {
      assert.ok(record.timestamp, 'timestamp present');
      assert.ok(record.level, 'level present');
      assert.equal(record.node_id, nodeId);
      assert.ok(record.event, 'event present');
      assert.ok(record.status, 'status present');
    }

    const errors = readJsonLines(join(root, 'logs', 'error.log'));
    assert.equal(errors.length, 1);
    assert.equal(errors[0].event, 'snapshot_maintenance_failed');
    assert.equal(errors[0].level, 'error');
    assert.equal(errors[0].status, 'error');

    const beats = readJsonLines(join(root, 'logs', 'heartbeat.log'));
    assert.equal(beats.length, 1);
    assert.equal(beats[0].event, 'heartbeat');
    assert.equal(beats[0].status, 'ok');
    assert.equal(beats[0].heartbeat_count, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ── 3. Daemon: JSON trail, metrics, reports, simulation ────────────────────

// A compressed schedule that exercises both env overrides and the time
// scale: scale 60 + heartbeat 60000 → 1s beats, maintenance 24000 → 400ms,
// report 36000 → 600ms. Three simulated "hours" of reporting per ~2s real.
const SIM_ENV = {
  MOOD_TIME_SCALE: '60',
  MOOD_HEARTBEAT_INTERVAL_MS: '60000',
  MOOD_MAINTENANCE_INTERVAL_MS: '24000',
  MOOD_REPORT_INTERVAL_MS: '36000',
};

test('daemon: JSON logs, metrics, reports under a compressed simulated schedule', { timeout: 60_000 }, () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);
    const started = moodJson(box, ['start'], SIM_ENV);
    assert.equal(started.started, true);

    try {
      // Wait for the daemon to accumulate heartbeats, maintenance cycles,
      // and at least one runtime report (max ~15s).
      let state = null;
      for (let i = 0; i < 75; i++) {
        if (i > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
        state = JSON.parse(readFileSync(join(box.home, 'state.json'), 'utf8'));
        if (state.metrics && state.metrics.heartbeats >= 2 && state.metrics.reports >= 1) break;
      }

      assert.ok(state.metrics, 'metrics persisted into state.json');
      assert.ok(state.metrics.heartbeats >= 2, `heartbeats: ${state.metrics?.heartbeats}`);
      assert.ok(state.metrics.snapshots >= 1, 'genesis snapshot counted');
      assert.ok(state.metrics.reports >= 1, 'runtime report written');
      assert.ok(state.metrics.uptimeSeconds >= 0);
      assert.ok(state.metrics.memoryRssBytes > 0);
      assert.ok(state.lastHeartbeat, 'lastHeartbeat set');
      assert.ok(state.lastMaintenanceAt, 'lastMaintenanceAt set');
      assert.equal(state.simulation, true, 'simulation stamped into state');
      assert.equal(state.timeScale, 60);

      // The JSON log trail.
      const records = readJsonLines(join(box.home, 'logs', 'node.log'));
      const events = new Set(records.map((r) => r.event));
      for (const expected of [
        'node_boot', 'config_loaded', 'identity_loaded', 'state_updated',
        'scheduler_started', 'maintenance_cycle', 'heartbeat',
        'snapshot_created', 'runtime_report',
      ]) {
        assert.ok(events.has(expected), `log trail missing event ${expected}`);
      }
      const scheduler = records.find((r) => r.event === 'scheduler_started');
      assert.equal(scheduler.simulation, true);
      assert.equal(scheduler.time_scale, 60);
      assert.equal(scheduler.heartbeat_ms, 1_000);

      // Heartbeat log is heartbeat-only.
      const beats = readJsonLines(join(box.home, 'logs', 'heartbeat.log'));
      assert.ok(beats.length >= 2);
      assert.ok(beats.every((r) => r.event === 'heartbeat'));

      // Runtime report files exist, are JSON, and carry simulation markers.
      const reportFiles = readdirSync(join(box.home, 'reports'))
        .filter((f) => f.startsWith('runtime-report-') && f.endsWith('.json'));
      assert.ok(reportFiles.length >= 1, 'at least one runtime report file');
      const report = JSON.parse(
        readFileSync(join(box.home, 'reports', reportFiles[0]), 'utf8')
      );
      assert.ok(report.generatedAt);
      assert.ok(report.nodeId.startsWith('mood:node:'));
      assert.equal(report.simulation, true);
      assert.equal(report.timeScale, 60);
      assert.ok(report.metrics.heartbeats >= 1);
      assert.ok(report.epoch, 'report carries the latest epoch');
    } finally {
      const stopped = moodJson(box, ['stop']);
      assert.equal(stopped.stopped, true);
    }

    const after = JSON.parse(readFileSync(join(box.home, 'state.json'), 'utf8'));
    assert.equal(after.status, 'Stopped');
    assert.ok(after.metrics.heartbeats >= 2, 'metrics survive shutdown');
  } finally {
    box.cleanup();
  }
});

// ── 3b. Deployment override: MOOD_RELAY_URL ────────────────────────────────

test('daemon: MOOD_RELAY_URL overrides the config-file relay address', { timeout: 60_000 }, () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);
    const RELAY = 'ws://relay.mood.internal:8080';
    const started = moodJson(box, ['start'], { MOOD_RELAY_URL: RELAY });
    assert.equal(started.started, true);

    try {
      // config_loaded is logged right after the Running state lands — poll
      // the log trail until the boot trail is on disk (max ~15s).
      let config = null;
      for (let i = 0; i < 75; i++) {
        if (i > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
        try {
          config = readJsonLines(join(box.home, 'logs', 'node.log'))
            .find((r) => r.event === 'config_loaded');
          if (config) break;
        } catch {
          // log file not written yet
        }
      }

      assert.ok(config, 'config_loaded record exists');
      assert.equal(config.relay_url, RELAY,
        'the env override wins over the config-file default');
    } finally {
      const stopped = moodJson(box, ['stop']);
      assert.equal(stopped.stopped, true);
    }
  } finally {
    box.cleanup();
  }
});

// ── 4. restart ─────────────────────────────────────────────────────────────

test('restart: composes stop + start with a single envelope', { timeout: 60_000 }, () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);
    const started = moodJson(box, ['start']);
    assert.equal(started.started, true);
    const pidBefore = started.pid;

    const restarted = moodJson(box, ['restart']);
    assert.equal(restarted.restarted, true);
    assert.equal(restarted.wasRunning, true);
    assert.ok(restarted.cleanStop !== false, 'stop reported clean or n/a');
    assert.ok(restarted.pid, 'new pid reported');
    assert.notEqual(restarted.pid, pidBefore, 'a new daemon process owns the node');

    const status = moodJson(box, ['status']);
    assert.equal(status.status, 'Running');

    const stopped = moodJson(box, ['stop']);
    assert.equal(stopped.stopped, true);
  } finally {
    box.cleanup();
  }
});

// ── 5. mood-node operator entry ────────────────────────────────────────────

function moodNode(box, args) {
  return spawnSync(process.execPath, [NODE_BIN, ...args], {
    cwd: box.cwd,
    encoding: 'utf8',
    env: { ...process.env, MOOD_HOME: box.home },
  });
}

test('mood-node: usage screens and unknown commands', () => {
  const box = sandbox();
  try {
    const noArgs = moodNode(box, []);
    assert.equal(noArgs.status, 0);
    assert.match(noArgs.stdout, /mood-node/);
    assert.match(noArgs.stdout, /start/);
    assert.match(noArgs.stdout, /restart/);

    const bogus = moodNode(box, ['bogus']);
    assert.equal(bogus.status, 1);
  } finally {
    box.cleanup();
  }
});

test('mood-node: start/status/stop delegate to the canonical mood commands', { timeout: 60_000 }, () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);

    const started = moodNode(box, ['start', '--json']);
    assert.equal(started.status, 0, started.stderr);
    const startEnvelope = JSON.parse(started.stdout);
    assert.equal(startEnvelope.ok, true);
    assert.equal(startEnvelope.started, true);

    const status = moodNode(box, ['status', '--json']);
    assert.equal(status.status, 0, status.stderr);
    assert.equal(JSON.parse(status.stdout).status, 'Running');

    const stopped = moodNode(box, ['stop', '--json']);
    assert.equal(stopped.status, 0, stopped.stderr);
    assert.equal(JSON.parse(stopped.stdout).stopped, true);
  } finally {
    box.cleanup();
  }
});
