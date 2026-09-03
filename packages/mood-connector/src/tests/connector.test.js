/**
 * @mood/connector test suite.
 *
 * Covered per the Connector Alpha 001 spec:
 *
 *   1. Detection      — command/config/install-path sources, all from a
 *                       fully faked environment (no dependence on what is
 *                       installed on this machine)
 *   2. No execution    — a booby-trapped fake `claude` command: if the
 *                       detector EVER spawned it, a marker file appears.
 *                       It must not.
 *   3. Identity        — connector-id + agent-record.json shape, idempotent
 *   4. Registration    — deterministic agent IDs, idempotent, generic
 *                       fallback, NOT_INITIALIZED before init
 *   5. Privacy         — a fake API key planted in a fake agent config is
 *                       NEVER written into connector storage
 *   6. Contribution    — Contribution Object v0.1 exact shape + validation
 *
 * Run: npm test   (from packages/mood-connector)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  detectAgents,
  detectedAgents,
  initConnector,
  readConnectorRecord,
  isConnectorInitialized,
  registerAgent,
  registerAgents,
  connectorPaths,
  createContributionRecord,
  validateContributionRecord,
  resolveAdapter,
} from '../index.js';

const FAKE_API_KEY = 'sk-ant-api03-FAKE-KEY-MUST-NEVER-LEAK-000000';

/** Build a fully faked machine: fake home, fake PATH bin, fake LOCALAPPDATA. */
function fakeMachine() {
  const root = mkdtempSync(join(tmpdir(), 'mood-connector-test-'));
  const home = join(root, 'home');
  const bin = join(root, 'bin');
  const localAppData = join(root, 'localappdata');
  mkdirSync(home);
  mkdirSync(bin);
  mkdirSync(localAppData);

  const env = {
    // Only the fake bin is on PATH — detection results are deterministic
    // regardless of what is actually installed on this machine.
    PATH: bin,
    USERPROFILE: home,
    HOME: home,
    LOCALAPPDATA: localAppData,
  };
  return { root, home, bin, localAppData, env };
}

/** A fake "command" on PATH. On Windows npm writes .cmd shims. */
function fakeCommand(bin, name) {
  const file = join(bin, process.platform === 'win32' ? `${name}.cmd` : name);
  writeFileSync(file, `# fake ${name} — never executed\n`);
  return file;
}

// ── 1. Detection ─────────────────────────────────────────────────────────────

test('detection: command, config, and install-path sources', () => {
  const m = fakeMachine();
  try {
    // Claude Code: command + config. Codex: config only. Cursor: command.
    fakeCommand(m.bin, 'claude');
    mkdirSync(join(m.home, '.claude'));
    writeFileSync(join(m.home, '.claude', 'settings.json'), `{"apiKey":"${FAKE_API_KEY}"}`);
    mkdirSync(join(m.home, '.codex'));
    fakeCommand(m.bin, 'cursor');

    const agents = detectAgents({ env: m.env });
    assert.equal(agents.length, 3, 'three detectable adapters');
    assert.deepEqual(agents.map((a) => a.key), ['claude-code', 'codex', 'cursor']);

    const claude = agents.find((a) => a.key === 'claude-code');
    assert.equal(claude.detected, true);
    assert.ok(claude.sources.includes('command'), 'claude via command');
    assert.ok(claude.sources.includes('config'), 'claude via config');

    const codex = agents.find((a) => a.key === 'codex');
    assert.equal(codex.detected, true);
    assert.deepEqual(codex.sources, ['config'], 'codex via config only');

    const cursor = agents.find((a) => a.key === 'cursor');
    assert.equal(cursor.detected, true);
    assert.ok(cursor.sources.includes('command'), 'cursor via command');

    assert.equal(detectedAgents({ env: m.env }).length, 3);
  } finally {
    rmSync(m.root, { recursive: true, force: true });
  }
});

test('detection: nothing installed → nothing detected', () => {
  const m = fakeMachine();
  try {
    const agents = detectAgents({ env: m.env });
    assert.ok(agents.every((a) => a.detected === false));
    assert.ok(agents.every((a) => a.sources.length === 0));
    assert.equal(detectedAgents({ env: m.env }).length, 0);
  } finally {
    rmSync(m.root, { recursive: true, force: true });
  }
});

test('detection: install-path source on Windows (Cursor in LOCALAPPDATA)', () => {
  if (process.platform !== 'win32') return; // platform-specific marker
  const m = fakeMachine();
  try {
    mkdirSync(join(m.localAppData, 'Programs', 'cursor'), { recursive: true });
    const cursor = detectAgents({ env: m.env }).find((a) => a.key === 'cursor');
    assert.equal(cursor.detected, true);
    assert.ok(cursor.sources.includes('install-path'), 'cursor via install-path');
  } finally {
    rmSync(m.root, { recursive: true, force: true });
  }
});

// ── 2. No execution — the detector never calls the tools it detects ─────────

test('privacy/no-execution: a booby-trapped `claude` command is never spawned', () => {
  const m = fakeMachine();
  const marker = join(m.root, 'SPAWNED-PROOF.txt');
  try {
    // If ANYTHING executes this file, the marker appears.
    const shim = join(m.bin, process.platform === 'win32' ? 'claude.cmd' : 'claude');
    if (process.platform === 'win32') {
      writeFileSync(shim, `@echo spawned > "${marker}"\n`);
    } else {
      writeFileSync(shim, `#!/bin/sh\necho spawned > "${marker}"\n`);
    }

    const agents = detectAgents({ env: m.env });
    assert.equal(agents.find((a) => a.key === 'claude-code').detected, true);
    assert.equal(existsSync(marker), false, 'detector must never spawn the tools it detects');
  } finally {
    rmSync(m.root, { recursive: true, force: true });
  }
});

// ── 3. Identity ──────────────────────────────────────────────────────────────

test('identity: initConnector creates the connector record; idempotent', () => {
  const m = fakeMachine();
  const env = { ...m.env, MOOD_HOME: join(m.root, 'moodhome') };
  try {
    assert.equal(isConnectorInitialized({ env }), false);
    assert.equal(readConnectorRecord({ env }), null);

    const first = initConnector({ env });
    assert.equal(first.created, true);
    assert.match(first.connectorId, /^connector:mood:[0-9a-f]{32}$/);

    const paths = connectorPaths({ env });
    assert.equal(readFileSync(paths.connectorIdFile, 'utf8').trim(), first.connectorId);

    const record = JSON.parse(readFileSync(paths.agentRecordFile, 'utf8'));
    assert.equal(record.connectorId, first.connectorId);
    assert.ok(record.createdAt, 'createdAt present');
    assert.deepEqual(record.agents, []);

    const second = initConnector({ env });
    assert.equal(second.created, false);
    assert.equal(second.connectorId, first.connectorId, 'init never regenerates the ID');
  } finally {
    rmSync(m.root, { recursive: true, force: true });
  }
});

// ── 4. Registration ──────────────────────────────────────────────────────────

test('registration: deterministic agent IDs, idempotent, generic fallback', () => {
  const m = fakeMachine();
  const env = { ...m.env, MOOD_HOME: join(m.root, 'moodhome') };
  try {
    assert.throws(
      () => registerAgent({ agent: 'claude-code', env }),
      (err) => err.code === 'NOT_INITIALIZED',
      'register before init must fail with NOT_INITIALIZED',
    );

    initConnector({ env });

    const r1 = registerAgent({ agent: 'claude-code', env });
    assert.equal(r1.registered, true);
    assert.match(r1.agentId, /^agent:mood:[0-9a-f]{16}$/);
    assert.equal(r1.name, 'Claude Code');
    assert.equal(r1.type, 'coding-agent');

    // Same agent by display name → same ID, no duplicate entry.
    const r2 = registerAgent({ agent: 'Claude Code', env });
    assert.equal(r2.registered, false);
    assert.equal(r2.agentId, r1.agentId, 'agent IDs are deterministic');

    const record = readConnectorRecord({ env });
    assert.equal(record.agents.length, 1, 'no duplicate agents on the record');

    // Unknown agents register through the generic adapter.
    const r3 = registerAgent({ agent: 'Aider', env });
    assert.equal(r3.type, 'generic-agent');
    assert.equal(r3.name, 'Aider');

    // Batch registration.
    const batch = registerAgents({ agents: ['codex', 'cursor'], env });
    assert.deepEqual(batch.map((b) => b.registered), [true, true]);
    assert.equal(readConnectorRecord({ env }).agents.length, 4);
  } finally {
    rmSync(m.root, { recursive: true, force: true });
  }
});

test('adapters: resolveAdapter maps keys and names, falls back to generic', () => {
  assert.equal(resolveAdapter('claude-code').name, 'Claude Code');
  assert.equal(resolveAdapter('Claude Code').key, 'claude-code');
  assert.equal(resolveAdapter('Something New').type, 'generic-agent');
  assert.equal(resolveAdapter(''), null);
});

// ── 5. Privacy — no credentials ever stored ─────────────────────────────────

test('privacy: a fake API key in agent config never reaches connector storage', () => {
  const m = fakeMachine();
  const env = { ...m.env, MOOD_HOME: join(m.root, 'moodhome') };
  try {
    // Plant the key everywhere detection could conceivably look INSIDE.
    mkdirSync(join(m.home, '.claude'));
    writeFileSync(join(m.home, '.claude', 'settings.json'), `{"apiKey":"${FAKE_API_KEY}"`);
    writeFileSync(join(m.home, '.claude.json'), `{"primaryApiKey":"${FAKE_API_KEY}"`);
    mkdirSync(join(m.home, '.codex'));
    writeFileSync(join(m.home, '.codex', 'auth.json'), `{"OPENAI_API_KEY":"${FAKE_API_KEY}"`);
    fakeCommand(m.bin, 'claude');

    // Run the full connector flow over this machine.
    const detected = detectAgents({ env });
    initConnector({ env });
    registerAgent({ agent: 'claude-code', env });
    registerAgent({ agent: 'codex', env });

    // The detection result itself must not carry the key...
    assert.ok(!JSON.stringify(detected).includes(FAKE_API_KEY));

    // ...and neither may ANY file the connector wrote.
    const connectorDir = connectorPaths({ env }).connectorDir;
    const files = readdirSync(connectorDir).map((f) => join(connectorDir, f));
    assert.ok(files.length >= 2, 'connector wrote its two files');
    for (const file of files) {
      assert.ok(statSync(file).isFile(), `${file} is a regular file`);
      const content = readFileSync(file, 'utf8');
      assert.ok(!content.includes(FAKE_API_KEY), `${file} must not contain credentials`);
      assert.ok(!content.includes('sk-ant'), `${file} must not contain anything key-shaped`);
      assert.ok(!content.includes('apiKey'), `${file} must not contain key field names`);
    }

    // The stored record contains only identity metadata.
    const record = readConnectorRecord({ env });
    for (const agent of record.agents) {
      assert.deepEqual(
        Object.keys(agent).sort(),
        ['agentId', 'connectorId', 'key', 'name', 'registeredAt', 'type'],
        'agent entries hold identity metadata only',
      );
    }
  } finally {
    rmSync(m.root, { recursive: true, force: true });
  }
});

// ── 6. Contribution Object v0.1 ──────────────────────────────────────────────

test('contribution: exact v0.1 shape — metadata, never reward', () => {
  const agent = 'agent:mood:0123456789abcdef';
  const connector = 'connector:mood:0123456789abcdef0123456789abcdef';
  const timestamp = '2026-09-03T12:00:00.000Z';

  const c = createContributionRecord({ agent, connector, timestamp });
  assert.deepEqual(Object.keys(c).sort(),
    ['agent', 'connector', 'id', 'proof', 'timestamp', 'type']);
  assert.equal(c.type, 'agent_contribution');
  assert.equal(c.proof, 'pending');
  assert.equal(c.agent, agent);
  assert.equal(c.connector, connector);
  assert.match(c.id, /^contribution:mood:[0-9a-f]{24}$/);

  // Same inputs → same ID (verifiable, replayable metadata).
  const again = createContributionRecord({ agent, connector, timestamp });
  assert.equal(again.id, c.id);

  assert.deepEqual(validateContributionRecord(c), { valid: true, errors: [] });
  assert.throws(() => createContributionRecord({ agent, connector: '' }),
    /requires an agent id and a connector id/);
});

test('contribution: validation rejects malformed records', () => {
  const bad = validateContributionRecord({ type: 'agent_contribution', proof: 'paid' });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.includes('missing field: id'));
  assert.ok(bad.errors.some((e) => e.includes('only allows "pending"')),
    'proof states beyond "pending" belong to a later version');

  const wrongType = validateContributionRecord({
    id: 'contribution:mood:x', type: 'reward', agent: 'a', connector: 'c',
    timestamp: 't', proof: 'pending',
  });
  assert.equal(wrongType.valid, false);
  assert.ok(wrongType.errors.some((e) => e.includes('agent_contribution')));

  assert.equal(validateContributionRecord(null).valid, false);
});
