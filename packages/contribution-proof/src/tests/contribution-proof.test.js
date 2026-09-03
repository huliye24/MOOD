/**
 * @mood/contribution-proof test suite.
 *
 * Covered per the Contribution Proof Alpha 001 spec:
 *
 *   1. Event creation   — exact v0.1 shape, actor types, content-derived IDs
 *   2. Actor validation — unknown actor types and malformed actors rejected
 *   3. Determinism      — same content + timestamp → same event, same ID,
 *                         same hash, twice and in every key order
 *   4. Hash sensitivity — any field changed → different hash (tamper evidence)
 *   5. Proof            — creation shape, proof-ID determinism
 *   6. Verification     — valid pair passes; tampered event, tampered proof,
 *                         missing fields, wrong algorithm all fail with errors
 *   7. Schema strictness— unknown keys rejected at every level
 *   8. Secret guard     — API keys, private key blocks, password assignments
 *                         rejected at creation AND at verification
 *   9. Actor derivation — human/ai_agent/organization prefixes, stability,
 *                         type-namespace separation
 *  10. Storage          — round-trip, filenames, listing order, orphan
 *                         visibility, find by event/proof ID
 *  11. On-disk tamper   — a stored event edited on disk fails the sweep
 *
 * Run: npm test   (from packages/contribution-proof)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createContributionEvent,
  createProof,
  deriveActorId,
  hashEvent,
  canonicalize,
  validateEvent,
  validateProof,
  validateProofShape,
  containsSecret,
  contributionPaths,
  initContributionStorage,
  saveContribution,
  listContributions,
  findContribution,
  verifyStoredContributions,
  EVENT_TYPE,
  ACTOR_TYPES,
} from '../index.js';

const TIMESTAMP = '2026-09-03T08:00:00.000Z';
const PROOF_AT = '2026-09-03T08:00:01.000Z';

/** 'event:mood:<hex>' → its on-disk filename 'event-mood-<hex>.json'. */
const eventFileName = (event) => 'event-mood-' + event.id.slice('event:mood:'.length) + '.json';

function validContent(overrides = {}) {
  return {
    actor: { id: 'agent:mood:9f8e7d6c5b4a3928', type: 'ai_agent', name: 'Claude Code' },
    action: { type: 'code_change', description: 'Updated node API' },
    timestamp: TIMESTAMP,
    source: { connector: 'connector:mood:abc123', node: 'mood:node:63aa9414' },
    ...overrides,
  };
}

function sandbox() {
  const root = mkdtempSync(join(tmpdir(), 'mood-contribution-proof-test-'));
  const env = { MOOD_HOME: join(root, '.mood'), USERPROFILE: root, HOME: root };
  return { root, env };
}

// ── 1. Event creation ────────────────────────────────────────────────────────

test('event: created with the exact v0.1 shape', () => {
  const event = createContributionEvent(validContent());
  assert.deepEqual(Object.keys(event).sort(), ['action', 'actor', 'id', 'source', 'timestamp', 'type']);
  assert.equal(event.type, EVENT_TYPE);
  assert.match(event.id, /^event:mood:[0-9a-f]{24}$/);
  assert.deepEqual(Object.keys(event.actor).sort(), ['id', 'name', 'type']);
  assert.deepEqual(Object.keys(event.action).sort(), ['description', 'type']);
  assert.deepEqual(Object.keys(event.source).sort(), ['connector', 'node']);
  assert.equal(event.timestamp, TIMESTAMP);
  assert.ok(validateEvent(event).valid, 'a created event passes its own validation');
});

test('event: all three actor types are accepted', () => {
  for (const type of ACTOR_TYPES) {
    const event = createContributionEvent(
      validContent({ actor: { id: deriveActorId(type, 'someone'), type } })
    );
    assert.equal(event.actor.type, type);
  }
});

test('event: actor name is optional and omitted when empty', () => {
  const withName = createContributionEvent(
    validContent({ actor: { id: 'agent:mood:9f8e7d6c5b4a3928', type: 'ai_agent', name: 'X' } })
  );
  assert.equal(withName.actor.name, 'X');
  const withoutName = createContributionEvent(
    validContent({ actor: { id: 'agent:mood:9f8e7d6c5b4a3928', type: 'ai_agent', name: '' } })
  );
  assert.equal('name' in withoutName.actor, false, 'empty name is dropped, not stored as ""');
});

// ── 2. Actor validation ──────────────────────────────────────────────────────

test('event: unknown actor type is rejected with INVALID_CONTRIBUTION_EVENT', () => {
  assert.throws(
    () => createContributionEvent(validContent({ actor: { id: 'agent:mood:x', type: 'robot' } })),
    (err) => err.code === 'INVALID_CONTRIBUTION_EVENT' && /actor\.type/.test(err.message)
  );
});

test('event: missing actor and malformed action are rejected', () => {
  assert.throws(
    () => createContributionEvent(validContent({ actor: undefined })),
    /actor must be an object/
  );
  assert.throws(
    () => createContributionEvent(validContent({ action: { type: 'Code Change' } })),
    /action\.type/
  );
  assert.throws(
    () => createContributionEvent(validContent({ timestamp: '2026-09-03 08:00:00' })),
    /timestamp/
  );
});

// ── 3. Determinism ───────────────────────────────────────────────────────────

test('hash: same event → same hash; key order is irrelevant', () => {
  const a = createContributionEvent(validContent());
  const b = createContributionEvent(validContent());
  assert.equal(a.id, b.id, 'content-derived event IDs are identical');
  assert.equal(hashEvent(a), hashEvent(b));

  // Same content built in a different insertion order canonicalizes identically.
  const reordered = {
    type: EVENT_TYPE,
    source: { node: 'mood:node:63aa9414', connector: 'connector:mood:abc123' },
    timestamp: TIMESTAMP,
    action: { description: 'Updated node API', type: 'code_change' },
    actor: { type: 'ai_agent', name: 'Claude Code', id: 'agent:mood:9f8e7d6c5b4a3928' },
    id: a.id,
  };
  assert.equal(hashEvent(reordered), hashEvent(a), 'canonicalization sorts keys at every depth');
});

test('hash: canonicalize is recursive and whitespace-free', () => {
  assert.equal(canonicalize({ b: 2, a: { d: 4, c: 3 } }), '{"a":{"c":3,"d":4},"b":2}');
  assert.equal(canonicalize([2, 1]), '[2,1]', 'array order is meaning, preserved');
});

// ── 4. Hash sensitivity ──────────────────────────────────────────────────────

test('hash: any change to the event changes the hash', () => {
  const event = createContributionEvent(validContent());
  const original = hashEvent(event);

  const variants = [
    { ...event, actor: { ...event.actor, name: 'Claude Code 2' } },
    { ...event, action: { ...event.action, description: 'Updated node API again' } },
    { ...event, timestamp: '2026-09-03T09:00:00.000Z' },
    { ...event, source: { ...event.source, connector: 'connector:mood:other' } },
  ];
  for (const variant of variants) {
    assert.notEqual(hashEvent(variant), original);
  }
  assert.equal(hashEvent(event), original, 'untouched event still hashes the same');
});

// ── 5. Proof ─────────────────────────────────────────────────────────────────

test('proof: created with the exact v0.1 shape and deterministic ID', () => {
  const event = createContributionEvent(validContent());
  const proof = createProof(event, PROOF_AT);
  assert.deepEqual(Object.keys(proof), ['proofId', 'eventId', 'eventHash', 'createdAt', 'algorithm', 'verified']);
  assert.match(proof.proofId, /^proof:mood:[0-9a-f]{24}$/);
  assert.equal(proof.eventId, event.id);
  assert.equal(proof.eventHash, hashEvent(event));
  assert.equal(proof.algorithm, 'SHA-256');
  assert.equal(proof.verified, true);

  const again = createProof(event, PROOF_AT);
  assert.equal(again.proofId, proof.proofId, 'same inputs → same proof ID');
  assert.ok(validateProofShape(proof).valid);
});

// ── 6. Verification ──────────────────────────────────────────────────────────

test('verify: a valid event + proof pair passes', () => {
  const event = createContributionEvent(validContent());
  const proof = createProof(event, PROOF_AT);
  const result = validateProof(proof, event);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('verify: a modified event fails with a hash mismatch', () => {
  const event = createContributionEvent(validContent());
  const proof = createProof(event, PROOF_AT);
  const tampered = { ...event, action: { ...event.action, description: 'quietly rewritten' } };
  const result = validateProof(proof, tampered);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('hash mismatch')), result.errors.join('; '));
});

test('verify: a tampered proof hash fails', () => {
  const event = createContributionEvent(validContent());
  const proof = createProof(event, PROOF_AT);
  const badHash = { ...proof, eventHash: 'sha256:' + '0'.repeat(64) };
  assert.equal(validateProof(badHash, event).valid, false);
});

test('verify: proof bound to a different event fails', () => {
  const eventA = createContributionEvent(validContent());
  const eventB = createContributionEvent(
    validContent({ action: { type: 'code_change', description: 'A different contribution' } })
  );
  const proofForA = createProof(eventA, PROOF_AT);
  const result = validateProof(proofForA, eventB);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('does not match') || e.includes('hash mismatch')));
});

test('verify: missing fields and wrong algorithm fail shape checks', () => {
  const event = createContributionEvent(validContent());
  const proof = createProof(event, PROOF_AT);
  const { proofId, createdAt, ...missing } = proof;
  assert.equal(validateProofShape(missing).valid, false);
  assert.equal(validateProofShape({ ...proof, algorithm: 'SHA-512' }).valid, false);
  assert.equal(validateProofShape({ ...proof, extra: true }).valid, false, 'unknown keys rejected');
  assert.equal(validateProof(proof, event).valid, true, 'control: original still valid');
});

// ── 7. Schema strictness ─────────────────────────────────────────────────────

test('schema: unknown keys are rejected at every level', () => {
  const event = createContributionEvent(validContent());
  assert.equal(validateEvent({ ...event, score: 100 }).valid, false, 'no reputation sneaks in');
  assert.equal(validateEvent({ ...event, actor: { ...event.actor, wallet: 'x' } }).valid, false);
  assert.equal(validateEvent({ ...event, action: { ...event.action, reward: 5 } }).valid, false, 'no reward sneaks in');
  assert.equal(validateEvent({ ...event, type: 'contribution_event_v2' }).valid, false);
  assert.equal(validateEvent({ ...event, id: 'event:mood:zzz' }).valid, false);
});

// ── 8. Secret guard ──────────────────────────────────────────────────────────

test('security: credential-shaped content is rejected at creation', () => {
  const secretCases = [
    'ran with sk-ant-api03-FAKE-KEY-MUST-NEVER-LEAK-000000',
    'key: -----BEGIN RSA PRIVATE KEY-----\nMIIE...',
    'password=hunter2-login',
    'auth via api_key=abc123',
  ];
  for (const description of secretCases) {
    assert.throws(
      () => createContributionEvent(validContent({ action: { type: 'code_change', description } })),
      (err) => err.code === 'INVALID_CONTRIBUTION_EVENT' && /credential/.test(err.message),
      `must reject: ${description.slice(0, 30)}…`
    );
  }
  assert.throws(
    () => createContributionEvent(validContent({ actor: { id: 'agent:mood:9f8e7d6c5b4a3928', type: 'ai_agent', name: 'sk-ant-api03-FAKE-KEY-LEAK-000000000' } })),
    /credential/
  );
});

test('security: a secret planted after creation fails verification', () => {
  const event = createContributionEvent(validContent());
  const proof = createProof(event, PROOF_AT);
  const planted = {
    ...event,
    action: { ...event.action, description: 'updated; password=topsecret value' },
  };
  const result = validateProof(proof, planted);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('credential')), 'guard fires on the verify path too');
});

test('security: containsSecret names the pattern, passes clean text', () => {
  assert.equal(containsSecret('sk-ant-api03-aaaaaaaaaaaaaaaaaaaa'), 'api key');
  assert.equal(containsSecret('-----BEGIN PRIVATE KEY-----'), 'private key block');
  assert.equal(containsSecret('access_token=abc'), 'credential assignment');
  assert.equal(containsSecret('auth token: eyJhbGciOi...'), 'credential assignment');
  // Plain words that merely look related must NOT trip the guard:
  assert.equal(containsSecret('Updated the node API and fixed tests'), null);
  assert.equal(containsSecret('raised the token limit: 4096'), null, 'plain "token" is ordinary dev text');
});

// ── 9. Actor derivation ──────────────────────────────────────────────────────

test('deriveActorId: stable, type-namespaced, case-insensitive on reference', () => {
  const agent = deriveActorId('ai_agent', 'claude-code');
  assert.match(agent, /^agent:mood:[0-9a-f]{16}$/);
  assert.equal(agent, deriveActorId('ai_agent', 'Claude-Code'), 'reference is lowercased');

  assert.match(deriveActorId('human', 'yu@example.org'), /^human:mood:[0-9a-f]{16}$/);
  assert.match(deriveActorId('organization', 'mood-labs'), /^org:mood:[0-9a-f]{16}$/);
  assert.notEqual(agent, deriveActorId('human', 'claude-code'), 'types are separate namespaces');
  assert.notEqual(agent, deriveActorId('ai_agent', 'codex'), 'references are separate actors');

  assert.throws(() => deriveActorId('robot', 'x'), /actorType/);
  assert.throws(() => deriveActorId('human', '  '), /reference/);
});

// ── 10. Storage ──────────────────────────────────────────────────────────────

test('storage: round-trip through ~/.mood/contributions (MOOD_HOME-aware)', () => {
  const s = sandbox();
  try {
    const event = createContributionEvent(validContent());
    const proof = createProof(event, PROOF_AT);
    const { eventFile, proofFile } = saveContribution({ event, proof, env: s.env });

    assert.ok(existsSync(eventFile) && existsSync(proofFile));
    assert.equal(eventFile, join(contributionPaths(s.env).eventsDir, eventFileName(event)));
    assert.deepEqual(JSON.parse(readFileSync(eventFile, 'utf8')), event);
    assert.deepEqual(JSON.parse(readFileSync(proofFile, 'utf8')), proof);

    const listed = listContributions(s.env);
    assert.equal(listed.length, 1);
    assert.deepEqual(listed[0].event, event);
    assert.deepEqual(listed[0].proof, proof);

    assert.deepEqual(findContribution({ eventId: event.id, env: s.env }).proof, proof);
    assert.deepEqual(findContribution({ proofId: proof.proofId, env: s.env }).event, event);
    assert.equal(findContribution({ eventId: 'event:mood:' + '0'.repeat(24), env: s.env }), null);
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});

test('storage: init is idempotent and empty listing is empty', () => {
  const s = sandbox();
  try {
    const paths = initContributionStorage(s.env);
    assert.ok(existsSync(paths.eventsDir) && existsSync(paths.proofsDir));
    initContributionStorage(s.env);
    assert.deepEqual(listContributions(s.env), []);
    assert.deepEqual(verifyStoredContributions(s.env), { total: 0, passed: 0, failed: 0, results: [] });
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});

test('storage: newest first, and orphans are surfaced not hidden', () => {
  const s = sandbox();
  try {
    const older = createContributionEvent(validContent());
    const newer = createContributionEvent(
      validContent({ timestamp: '2026-09-03T10:00:00.000Z', action: { type: 'code_change', description: 'Second contribution' } })
    );
    saveContribution({ event: older, proof: createProof(older, PROOF_AT), env: s.env });
    saveContribution({ event: newer, proof: createProof(newer, PROOF_AT), env: s.env });
    const listed = listContributions(s.env);
    assert.equal(listed[0].event.id, newer.id, 'newest first');

    // Delete one event file on disk → its proof must appear as an orphan.
    rmSync(join(contributionPaths(s.env).eventsDir, eventFileName(older)));
    const afterLoss = listContributions(s.env);
    const orphan = afterLoss.find((item) => item.event === null);
    assert.ok(orphan, 'orphan proof is listed');
    assert.equal(orphan.proof.eventId, older.id);
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});

// ── 11. On-disk tamper detection ─────────────────────────────────────────────

test('verify sweep: a stored event edited on disk fails', () => {
  const s = sandbox();
  try {
    const event = createContributionEvent(validContent());
    const proof = createProof(event, PROOF_AT);
    saveContribution({ event, proof, env: s.env });

    const sweep = verifyStoredContributions(s.env);
    assert.equal(sweep.total, 1);
    assert.equal(sweep.passed, 1);
    assert.equal(sweep.results[0].valid, true);

    const eventFile = join(contributionPaths(s.env).eventsDir, eventFileName(event));
    const stored = JSON.parse(readFileSync(eventFile, 'utf8'));
    stored.action.description = 'rewritten after the fact';
    writeFileSync(eventFile, JSON.stringify(stored, null, 2) + '\n', 'utf8');

    const afterTamper = verifyStoredContributions(s.env);
    assert.equal(afterTamper.failed, 1, 'tampered contribution fails the sweep');
    assert.equal(afterTamper.results[0].valid, false);
    assert.ok(afterTamper.results[0].errors.some((e) => e.includes('hash mismatch')));
    assert.equal(afterTamper.results[0].recomputed, hashEvent(stored), 'recomputed hash is reported');
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});
