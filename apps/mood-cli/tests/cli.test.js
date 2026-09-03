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
 *   7. Connector         — detect/init/register/status over a faked machine
 *   8. Contribution proof — create/list/verify, tamper detection, secret
 *                           rejection, registered-agent chain
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
  writeFileSync,
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

// ── 7. AI Agent connector ──────────────────────────────────────────────────

/** A fully faked machine for connector detection: fake home, fake PATH,
 * fake LOCALAPPDATA — results never depend on the real host. */
function fakeAgentMachine(box) {
  const agentRoot = join(box.root, 'agent-env');
  const home = join(agentRoot, 'home');
  const bin = join(agentRoot, 'bin');
  mkdirSync(home, { recursive: true });
  mkdirSync(bin, { recursive: true });

  // Claude Code: command + config (the config carries a planted fake key —
  // it must never leak into connector storage).
  writeFileSync(join(bin, process.platform === 'win32' ? 'claude.cmd' : 'claude'), '# fake\n');
  mkdirSync(join(home, '.claude'));
  writeFileSync(join(home, '.claude', 'settings.json'),
    '{"apiKey":"sk-ant-api03-FAKE-KEY-MUST-NEVER-LEAK"}');
  // Codex: config only. Cursor: absent → "not detected".
  mkdirSync(join(home, '.codex'));

  return {
    env: {
      PATH: bin,
      USERPROFILE: home,
      HOME: home,
      LOCALAPPDATA: join(agentRoot, 'localappdata'),
    },
    connectorDir: join(box.home, 'connector'),
  };
}

test('connector: detect → init → register → status on a faked machine', () => {
  const box = sandbox();
  try {
    const fake = fakeAgentMachine(box);

    // detect — human wording per the spec.
    const detectOut = moodOk(box, ['connector', 'detect'], fake.env);
    assert.match(detectOut, /Claude Code\s+installed/);
    assert.match(detectOut, /Codex\s+installed/);
    assert.match(detectOut, /Cursor\s+not detected/);
    assert.match(detectOut, /Ready for connection\./);
    assert.match(detectOut, /Detection only\. Do not call these tools\./);

    // detect — JSON envelope for AI Agents.
    const detected = moodJson(box, ['connector', 'detect'], fake.env);
    assert.equal(detected.ready, true);
    const claude = detected.agents.find((a) => a.key === 'claude-code');
    assert.equal(claude.detected, true);
    assert.deepEqual(claude.sources, ['command', 'config']);
    assert.equal(detected.agents.find((a) => a.key === 'cursor').detected, false);

    // status before init — inactive.
    const before = moodJson(box, ['connector', 'status'], fake.env);
    assert.equal(before.connector, 'inactive');
    assert.deepEqual(before.agents, []);

    // register before init — clean failure.
    const early = mood(box, ['connector', 'register', '--json'], fake.env);
    assert.equal(early.status, 1);
    assert.equal(JSON.parse(early.stdout).ok, false);

    // init — creates the connector identity; idempotent.
    const init1 = moodJson(box, ['connector', 'init'], fake.env);
    assert.equal(init1.created, true);
    assert.match(init1.connectorId, /^connector:mood:[0-9a-f]{32}$/);
    const init2 = moodJson(box, ['connector', 'init'], fake.env);
    assert.equal(init2.created, false);
    assert.equal(init2.connectorId, init1.connectorId);

    // register (batch) — every detected agent gets a contribution identity.
    const reg = moodJson(box, ['connector', 'register'], fake.env);
    assert.deepEqual(reg.registered.map((r) => r.name), ['Claude Code', 'Codex']);
    for (const r of reg.registered) {
      assert.match(r.agentId, /^agent:mood:[0-9a-f]{16}$/);
      assert.equal(r.registered, true);
    }

    // register again — same IDs, no duplicates.
    const reg2 = moodJson(box, ['connector', 'register'], fake.env);
    assert.deepEqual(
      reg2.registered.map((r) => r.agentId),
      reg.registered.map((r) => r.agentId),
    );

    // register --agent with a generic (unknown) agent.
    const reg3 = moodJson(box, ['connector', 'register', '--agent', 'Aider'], fake.env);
    assert.equal(reg3.registered[0].type, 'generic-agent');

    // status — the spec's one-screen summary.
    const statusOut = moodOk(box, ['connector', 'status'], fake.env);
    assert.match(statusOut, /Connector:\s+active/);
    assert.match(statusOut, /Agents:\s+Claude Code, Codex, Aider/);
    assert.match(statusOut, /Network:\s+Ready/);
    const status = moodJson(box, ['connector', 'status'], fake.env);
    assert.equal(status.connector, 'active');
    assert.equal(status.agents.length, 3);
    assert.equal(status.network, 'Ready');

    // storage: exactly two files, and no credentials in either.
    const files = readdirSync(fake.connectorDir).sort();
    assert.deepEqual(files, ['agent-record.json', 'connector-id']);
    for (const f of files) {
      const content = readFileSync(join(fake.connectorDir, f), 'utf8');
      assert.ok(!content.includes('sk-ant'), `${f} must not contain API keys`);
      assert.ok(!content.includes('apiKey'), `${f} must not contain key fields`);
    }
  } finally {
    box.cleanup();
  }
});

// ── 8. Contribution proof layer ────────────────────────────────────────────

const EVENT_ID_RE = /^event:mood:[0-9a-f]{24}$/;
const PROOF_ID_RE = /^proof:mood:[0-9a-f]{24}$/;
const HASH_RE = /^sha256:[0-9a-f]{64}$/;

test('contribution: create → list → verify without init or connector', () => {
  const box = sandbox();
  try {
    // create — no `mood init`, no connector: the actor derives deterministically.
    const created = moodJson(box, [
      'contribution', 'create',
      '--actor', 'claude-code',
      '--type', 'code_change',
      '--description', 'Updated node API',
    ]);
    assert.match(created.event.id, EVENT_ID_RE);
    assert.equal(created.event.type, 'contribution_event');
    assert.equal(created.event.actor.type, 'ai_agent');
    assert.match(created.event.actor.id, /^agent:mood:[0-9a-f]{16}$/);
    assert.equal(created.event.action.type, 'code_change');
    assert.equal(created.event.action.description, 'Updated node API');
    assert.equal(created.event.source.connector, '');
    assert.match(created.proof.proofId, PROOF_ID_RE);
    assert.equal(created.proof.eventId, created.event.id);
    assert.match(created.proof.eventHash, HASH_RE);
    assert.equal(created.proof.algorithm, 'SHA-256');
    assert.equal(created.proof.verified, true);

    // both files on disk under ~/.mood/contributions/
    assert.ok(existsSync(join(box.home, 'contributions', 'events', `event-mood-${created.event.id.slice('event:mood:'.length)}.json`)));
    assert.ok(existsSync(join(box.home, 'contributions', 'proofs', `proof-mood-${created.proof.proofId.slice('proof:mood:'.length)}.json`)));

    // human output carries the spec's four facts.
    const human = moodOk(box, [
      'contribution', 'create',
      '--actor', 'codex',
      '--description', 'Second contribution',
    ]);
    assert.match(human, /Contribution created\./);
    assert.match(human, /Event:\s+event:mood:[0-9a-f]{24}/);
    assert.match(human, /Proof:\s+sha256:[0-9a-f]{64}/);
    assert.match(human, /Verified:\s+true/);

    // list — human + JSON
    const listHuman = moodOk(box, ['contribution', 'list']);
    assert.match(listHuman, /MOOD Contributions/);
    assert.match(listHuman, /1\.\s+Agent:\s+codex/); // newest first
    assert.match(listHuman, /2\.\s+Agent:\s+claude-code/);
    assert.match(listHuman, /Type:\s+code_change/);
    assert.match(listHuman, /Proof:\s+Verified/);
    const listed = moodJson(box, ['contribution', 'list']);
    assert.equal(listed.contributions.length, 2);
    assert.equal(listed.contributions[0].event.actor.name, 'codex');
    assert.equal(listed.contributions[1].event.id, created.event.id);

    // verify — PASS + hash + summary, exit 0
    const verifyHuman = moodOk(box, ['contribution', 'verify']);
    assert.match(verifyHuman, /Proof verification/);
    assert.match(verifyHuman, /PASS/);
    assert.match(verifyHuman, /Hash:\s+sha256:[0-9a-f]{64}/);
    assert.match(verifyHuman, /Summary:\s+2\/2 verified/);
    const verified = moodJson(box, ['contribution', 'verify']);
    assert.equal(verified.total, 2);
    assert.equal(verified.passed, 2);
    assert.equal(verified.failed, 0);
    for (const r of verified.results) {
      assert.equal(r.valid, true);
      assert.equal(r.eventHash, r.recomputed);
    }

    // single contribution verify by event id
    const single = moodJson(box, ['contribution', 'verify', created.event.id]);
    assert.equal(single.total, 1);
    assert.equal(single.passed, 1);

    // unknown id → clean failure
    const missing = mood(box, ['contribution', 'verify', 'event:mood:' + '0'.repeat(24), '--json']);
    assert.equal(missing.status, 1);
    assert.equal(JSON.parse(missing.stdout).ok, false);
  } finally {
    box.cleanup();
  }
});

test('contribution: a tampered event file fails verification with exit 1', () => {
  const box = sandbox();
  try {
    const created = moodJson(box, [
      'contribution', 'create',
      '--actor', 'claude-code',
      '--description', 'Alpha contribution',
    ]);

    // Rewrite the stored event — the classic after-the-fact edit.
    const eventFile = join(
      box.home, 'contributions', 'events',
      `event-mood-${created.event.id.slice('event:mood:'.length)}.json`,
    );
    const stored = JSON.parse(readFileSync(eventFile, 'utf8'));
    stored.action.description = 'rewritten after the fact';
    writeFileSync(eventFile, JSON.stringify(stored, null, 2) + '\n', 'utf8');

    const r = mood(box, ['contribution', 'verify']);
    assert.equal(r.status, 1, 'tampered contribution must exit 1');
    assert.match(r.stdout, /FAIL/);
    assert.match(r.stdout, /hash mismatch/);
    assert.match(r.stdout, /1 FAILED/);

    const asJson = mood(box, ['contribution', 'verify', '--json']);
    assert.equal(asJson.status, 1);
    const envelope = JSON.parse(asJson.stdout);
    assert.equal(envelope.ok, true, 'a failed verification is a result, not an API error');
    assert.equal(envelope.failed, 1);
    assert.equal(envelope.results[0].valid, false);
    assert.notEqual(envelope.results[0].eventHash, envelope.results[0].recomputed);
  } finally {
    box.cleanup();
  }
});

test('contribution: credential-shaped descriptions are refused', () => {
  const box = sandbox();
  try {
    for (const bad of [
      'key sk-ant-api03-FAKE-LEAK-000000000000',
      'password=hunter2',
    ]) {
      const r = mood(box, ['contribution', 'create', '--actor', 'claude-code', '--description', bad, '--json']);
      assert.equal(r.status, 1);
      const envelope = JSON.parse(r.stdout);
      assert.equal(envelope.ok, false);
      assert.match(envelope.error, /credential/);
    }
    // nothing was written
    assert.equal(moodJson(box, ['contribution', 'list']).contributions.length, 0);

    // --actor is required
    const noActor = mood(box, ['contribution', 'create', '--json']);
    assert.equal(noActor.status, 1);
    assert.match(JSON.parse(noActor.stdout).error, /--actor is required/);

    // unknown actor type
    const badType = mood(box, ['contribution', 'create', '--actor', 'x', '--actor-type', 'robot', '--json']);
    assert.equal(badType.status, 1);
  } finally {
    box.cleanup();
  }
});

test('contribution: a registered connector agent records provenance', () => {
  const box = sandbox();
  try {
    const fake = fakeAgentMachine(box);
    moodOk(box, ['connector', 'init'], fake.env);
    const reg = moodJson(box, ['connector', 'register', '--agent', 'claude-code'], fake.env);
    const registered = reg.registered[0];

    const created = moodJson(box, [
      'contribution', 'create',
      '--actor', 'claude-code',
      '--description', 'Chain test',
    ], fake.env);

    // the registered identity is used, not a derived one
    assert.equal(created.event.actor.id, registered.agentId);
    assert.equal(created.event.actor.name, 'Claude Code');
    assert.equal(created.event.actor.type, 'ai_agent');
    assert.match(created.event.source.connector, /^connector:mood:[0-9a-f]{32}$/);

    // and it verifies
    const verified = moodJson(box, ['contribution', 'verify'], fake.env);
    assert.equal(verified.passed, 1);
  } finally {
    box.cleanup();
  }
});
