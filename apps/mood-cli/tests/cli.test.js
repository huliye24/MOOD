/**
 * MOOD CLI test suite.
 *
 * These are end-to-end tests: every case spawns the real bin/mood.js as a
 * subprocess with an isolated MOOD_HOME, exactly like a human or an AI
 * agent would run it. Covered per the Alpha 002 spec:
 *
 *   1. CLI startup       — home screen renders, exit 0
 *   2. Identity creation — `mood init` builds ~/.mood, idempotent
 *   3. Status command    — reports node id / network / status
 *   4. JSON output       -- `--json` emits a stable envelope
 *   5. Invite generation — .moodinvite is written and verifiable
 *   6. Node lifecycle    — start → snapshot → verify → stop
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
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyInvitationSignature } from '@mood/node-runtime';

const __filename = fileURLToPath(import.meta.url);
const BIN = resolve(__filename, '..', '..', 'bin', 'mood.js');

const NODE_ID_RE = /^mood:node:[0-9a-f]{64}$/;

/** Fresh sandbox: its own MOOD_HOME and its own working directory. */
function sandbox() {
  const root = mkdtempSync(join(tmpdir(), 'mood-cli-test-'));
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

// ── 1. CLI startup ─────────────────────────────────────────────────────────

test('startup: `mood` renders the terminal identity screen', () => {
  const box = sandbox();
  try {
    const out = moodOk(box, []);
    assert.match(out, /~ MOOD ~/);
    assert.match(out, /Contribution Network/);
    assert.match(out, /Protocol:/);
    assert.match(out, /MOOD Alpha Testnet/);
    assert.match(out, /Status:/);
    assert.match(out, /not initialized/);
  } finally {
    box.cleanup();
  }
});

// ── 2. Identity creation ───────────────────────────────────────────────────

test('init: creates the ~/.mood tree and a valid node identity', () => {
  const box = sandbox();
  try {
    const out = moodOk(box, ['init']);
    assert.match(out, /MOOD identity created/);

    const identity = JSON.parse(readFileSync(join(box.home, 'identity', 'node.json'), 'utf8'));
    assert.match(identity.nodeId, NODE_ID_RE);
    assert.equal(identity.algorithm, 'ed25519');
    assert.equal(identity.networkId, 'mood-testnet-001');
    assert.ok(identity.publicKey, 'public key present');

    // Private material exists on disk (the daemon needs it) but is a
    // separate file, never part of the public record.
    const priv = JSON.parse(readFileSync(join(box.home, 'identity', 'private.json'), 'utf8'));
    assert.ok(priv.privateKey, 'private key stored');

    for (const f of ['config/node.json', 'snapshots', 'logs', 'state.json']) {
      assert.ok(existsSync(join(box.home, f)), `~/.mood/${f} exists`);
    }
  } finally {
    box.cleanup();
  }
});

test('init: is idempotent — second init keeps the same node', () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);
    const first = moodJson(box, ['identity', 'show']);
    const out = moodOk(box, ['init']);
    assert.match(out, /already exists/);
    const second = moodJson(box, ['identity', 'show']);
    assert.equal(second.nodeId, first.nodeId);
  } finally {
    box.cleanup();
  }
});

test('identity show: never displays the private key', () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);
    const priv = JSON.parse(readFileSync(join(box.home, 'identity', 'private.json'), 'utf8'));
    const human = moodOk(box, ['identity', 'show']);
    const asJson = moodJson(box, ['identity', 'show']);

    assert.ok(!human.includes(priv.privateKey), 'private key absent from human output');
    assert.ok(!JSON.stringify(asJson).includes(priv.privateKey), 'private key absent from JSON output');
    assert.match(human, /never leaves this machine/);
  } finally {
    box.cleanup();
  }
});

// ── 3. Status command ──────────────────────────────────────────────────────

test('status: reports the node before any snapshot exists', () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);
    const out = moodOk(box, ['status']);
    assert.match(out, /MOOD Node Status/);
    assert.match(out, /MOOD Alpha Testnet/);
    assert.match(out, /Stopped/);
    assert.match(out, /\(none\)/); // no snapshot yet
  } finally {
    box.cleanup();
  }
});

// ── 4. JSON output (AI Agent interface) ────────────────────────────────────

test('status --json: emits the machine envelope from the spec', () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);
    const data = moodJson(box, ['status']);

    assert.match(data.nodeId, NODE_ID_RE);
    assert.equal(data.network, 'MOOD Alpha Testnet');
    assert.equal(data.networkId, 'mood-testnet-001');
    assert.equal(data.protocol, '0.1');
    assert.equal(data.status, 'Stopped');
    assert.equal(typeof data.epoch, 'number');
    assert.equal(data.digest, null); // no snapshot yet
  } finally {
    box.cleanup();
  }
});

test('--json: every command answers with an ok envelope', () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);
    for (const args of [['protocol'], ['peers'], ['identity', 'show']]) {
      const data = moodJson(box, args);
      assert.equal(data.ok, true);
    }
  } finally {
    box.cleanup();
  }
});

test('MOOD_JSON=1: switches output to JSON without a flag', () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);
    const data = moodJson(box, ['status'], { MOOD_JSON: '1' });
    assert.match(data.nodeId, NODE_ID_RE);
  } finally {
    box.cleanup();
  }
});

test('errors: unknown command emits {ok:false} and exit 1', () => {
  const box = sandbox();
  try {
    const r = mood(box, ['definitely-not-a-command', '--json']);
    assert.equal(r.status, 1);
    const envelope = JSON.parse(r.stdout);
    assert.equal(envelope.ok, false);
    assert.match(envelope.error, /unknown command/);
  } finally {
    box.cleanup();
  }
});

// ── 5. Invite generation ───────────────────────────────────────────────────

test('invite create: writes a signature-valid .moodinvite bound to one email', () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);
    const out = moodOk(box, ['invite', 'create', '--email', 'alice@example.com']);
    assert.match(out, /MOOD Invitation Created/);

    // Exactly one invite file in the caller's cwd.
    const files = readdirSync(box.cwd).filter((f) => f.endsWith('.moodinvite'));
    assert.equal(files.length, 1);
    const invitation = JSON.parse(readFileSync(join(box.cwd, files[0]), 'utf8'));

    assert.equal(invitation.payload.memberEmail, 'alice@example.com');
    assert.equal(invitation.payload.maxUses, 1);
    assert.ok(invitation.payload.expiresAt > invitation.payload.issuedAt);

    // The invitation verifies with the SHARED runtime logic — the CLI
    // adds no invitation machinery of its own.
    const check = verifyInvitationSignature(invitation);
    assert.equal(check.valid, true, `invitation signature invalid: ${check.error}`);
  } finally {
    box.cleanup();
  }
});

test('invite create: rejects an invalid email', () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);
    const r = mood(box, ['invite', 'create', '--email', 'not-an-email', '--json']);
    assert.equal(r.status, 1);
    assert.equal(JSON.parse(r.stdout).ok, false);
  } finally {
    box.cleanup();
  }
});

// ── 6. Node lifecycle (daemon) ─────────────────────────────────────────────

test('lifecycle: start → snapshot verified → stop', { timeout: 60_000 }, () => {
  const box = sandbox();
  try {
    moodOk(box, ['init']);

    // start
    const started = moodJson(box, ['start']);
    assert.equal(started.started, true);
    assert.equal(started.status, 'Running');
    assert.ok(started.pid, 'daemon pid reported');

    try {
      // The daemon produces the first epoch snapshot within seconds.
      let data = null;
      for (let i = 0; i < 50 && !data; i++) {
        if (i > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
        const candidate = moodJson(box, ['snapshot', 'verify']);
        if (candidate.valid) data = candidate;
      }
      assert.ok(data, 'daemon produced a verifiable snapshot');

      assert.equal(data.valid, true);
      assert.equal(data.agreement, 'Verified');
      assert.match(data.digest, /^[0-9a-f]{64}$/);
      assert.equal(data.recomputed, data.digest); // digest agreement
      assert.ok(data.attestations >= 1, 'snapshot carries at least the self-attestation');
      assert.equal(data.verifiedAttestations >= 1, true);

      // status now reflects the running node and the snapshot.
      const status = moodJson(box, ['status']);
      assert.equal(status.status, 'Running');
      assert.equal(status.digest, data.digest);
      assert.equal(status.agreement, 'Verified');
    } finally {
      // stop — must run even if an assertion above failed.
      const stopped = moodJson(box, ['stop']);
      assert.equal(stopped.stopped, true);
    }

    const after = moodJson(box, ['status']);
    assert.equal(after.status, 'Stopped');
    assert.ok(after.digest, 'snapshot digest preserved after stop');
  } finally {
    box.cleanup();
  }
});
