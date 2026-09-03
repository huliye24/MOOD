/**
 * Protocol Object Alpha 001 — REGRESSION LOCK.
 *
 * This file is not coverage; the main suite covers the implementation.
 * This file locks the Alpha 001 CONTRACT. If a future alpha breaks a
 * test in here, the change did not merely add code — it changed the
 * protocol — and must be made consciously, spec first, with this file
 * updated in the same commit.
 *
 * The four invariants locked (per the Alpha 001 finalization spec):
 *
 *   1. Object hash determinism   — same content → same ID, any key
 *                                  order, any machine; one changed
 *                                  character → different ID
 *   2. Tamper detection          — an edited object fails validation,
 *                                  is refused by storage, and fails the
 *                                  on-disk sweep. Never silently passes.
 *   3. Schema validation         — the envelope and the payload are
 *                                  exact, closed key sets; unknown
 *                                  types and wrong versions do not
 *                                  validate
 *   4. External verification     — a FOREIGN object (never stored here,
 *                                  unknown issuer) verifies by content
 *                                  alone; linkage absence is a note,
 *                                  not a failure
 *
 * Naming note: the finalization spec asked for a `.ts` file; this
 * workspace is pure ESM JavaScript under `node --test`, so a `.ts`
 * file would never execute. The lock lives here, where it runs.
 *
 * Run: npm test   (from packages/protocol-object)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createContributionEvent, createProof } from '@mood/contribution-proof';
import {
  OBJECT_KEYS,
  CONTRIBUTION_PAYLOAD_KEYS,
  objectContent,
  deriveObjectId,
  createProtocolObject,
  buildContributionPayload,
  validateContributionPayload,
  validateProtocolObject,
  verifyObjectLinkage,
  objectPaths,
  storeObject,
  verifyStoredObjects,
  filenameFor,
  ObjectSyncAdapter,
} from '../index.js';

const EVENT_AT = '2026-09-03T08:00:00.000Z';
const PROOF_AT = '2026-09-03T08:00:01.000Z';
const OBJECT_AT = '2026-09-03T08:00:02.000Z';
const NODE_ID = 'mood:node:' + '3feb3570'.repeat(8); // 64 hex, the real shape
const OTHER_AT = '2026-09-03T09:00:00.000Z'; // one hour later — a different object

/** A real event + proof pair, exactly as the proof layer mints them. */
function realProof() {
  const event = createContributionEvent({
    actor: { id: 'agent:mood:9f8e7d6c5b4a3928', type: 'ai_agent', name: 'Claude Code' },
    action: { type: 'code_change', description: 'Alpha 001 regression lock' },
    timestamp: EVENT_AT,
    source: { connector: 'connector:mood:abc123', node: NODE_ID },
  });
  return createProof(event, PROOF_AT);
}

/** A contribution object over a real proof, at a fixed moment. */
function realObject(proof = realProof()) {
  return createProtocolObject({
    type: 'contribution',
    payload: buildContributionPayload(proof),
    nodeId: NODE_ID,
    now: OBJECT_AT,
  });
}

function sandbox() {
  const root = mkdtempSync(join(tmpdir(), 'mood-alpha001-regression-'));
  const env = { MOOD_HOME: join(root, '.mood'), USERPROFILE: root, HOME: root };
  return { root, env };
}

// ── 1. Object hash determinism ──────────────────────────────────────────────

test('alpha001 regression: same content is the same ID — any key order, any mint', () => {
  const proof = realProof();
  const a = realObject(proof);
  const b = realObject(realProof()); // independently minted, identical content

  assert.deepEqual(a, b, 'two mints of the same content are the same object');
  assert.match(a.id, /^object:mood:[0-9a-f]{24}$/, 'the documented ID form');

  // Key order in memory is irrelevant: the canonical form sorts it out.
  const reordered = {
    payload: {
      algorithm: a.payload.algorithm,
      eventHash: a.payload.eventHash,
      proofId: a.payload.proofId,
      eventId: a.payload.eventId,
    },
    issuer: { nodeId: a.issuer.nodeId },
    createdAt: a.createdAt,
    version: a.version,
    type: a.type,
  };
  assert.equal(deriveObjectId(objectContent(reordered)), a.id);

  // One changed character — the timestamp — is a different object.
  const later = { ...objectContent(a), createdAt: OTHER_AT };
  assert.notEqual(deriveObjectId(later), a.id);

  // One changed character in the payload — the event hash — is a
  // different object.
  const reproofed = {
    ...objectContent(a),
    payload: { ...a.payload, eventHash: 'sha256:' + '0'.repeat(64) },
  };
  assert.notEqual(deriveObjectId(reproofed), a.id);
});

// ── 2. Tamper detection ─────────────────────────────────────────────────────

test('alpha001 regression: an edited object fails everywhere it is checked', () => {
  const object = realObject();

  // The classic after-the-fact edit: rewrite the referenced hash.
  const tampered = {
    ...object,
    payload: { ...object.payload, eventHash: 'sha256:' + '0'.repeat(64) },
  };
  const check = validateProtocolObject(tampered);
  assert.equal(check.valid, false, 'an edited object does not validate');
  assert.ok(check.errors.some((e) => e.includes('id mismatch')), 'the failure names the ID mismatch');

  // Storage refuses it — an invalid object never touches disk.
  const s = sandbox();
  try {
    assert.throws(
      () => storeObject(tampered, { env: s.env }),
      (err) => err.code === 'INVALID_PROTOCOL_OBJECT',
    );

    // The honest object stores, under MOOD_HOME (never the real home —
    // the path regression fixed during Alpha 001).
    assert.equal(objectPaths(s.env).root, join(s.env.MOOD_HOME, 'objects'));
    storeObject(object, { env: s.env });

    // What is on disk is exactly the protocol object — no injected
    // bookkeeping fields, no metadata merged in.
    const onDisk = JSON.parse(
      readFileSync(join(objectPaths(s.env).types[object.type], filenameFor(object.id)), 'utf8'),
    );
    assert.deepEqual(onDisk, object);

    // Tamper with the file itself: the sweep catches it.
    const file = join(objectPaths(s.env).types[object.type], filenameFor(object.id));
    writeFileSync(file, JSON.stringify({ ...onDisk, createdAt: OTHER_AT }, null, 2) + '\n', 'utf8');
    const sweep = verifyStoredObjects(s.env);
    assert.equal(sweep.total, 1);
    assert.equal(sweep.failed, 1);
    assert.equal(sweep.results[0].valid, false);
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});

// ── 3. Schema validation ────────────────────────────────────────────────────

test('alpha001 regression: the envelope and the payload are exact, closed key sets', () => {
  const object = realObject();

  // The honest shape validates.
  assert.ok(validateProtocolObject(object).valid);
  assert.deepEqual(Object.keys(object).sort(), [...OBJECT_KEYS].sort());
  assert.deepEqual(Object.keys(object.payload).sort(), [...CONTRIBUTION_PAYLOAD_KEYS].sort());

  // The payload is closed on its own terms — an extra key fails the
  // payload schema directly, before any ID recomputation.
  const extraPayload = validateContributionPayload({
    ...object.payload,
    reward: '1 MOOD', // tokens never ride inside a protocol object
  });
  assert.equal(extraPayload.valid, false);

  // The envelope is closed: nothing extra rides along.
  assert.equal(validateProtocolObject({ ...object, score: 1 }).valid, false);

  // Unknown types do not validate.
  assert.equal(validateProtocolObject({ ...object, type: 'reputation' }).valid, false);

  // A different version string does not silently validate. When
  // Alpha 002 bumps the version, it must do so by spec — this line
  // failing is the alarm, not the bug.
  assert.equal(validateProtocolObject({ ...object, version: '0.2' }).valid, false);
});

// ── 4. External verification ────────────────────────────────────────────────

test('alpha001 regression: a foreign object verifies without any local record', async () => {
  const s = sandbox();
  try {
    // An object issued by a node this sandbox has never heard of,
    // referencing an event this sandbox has never stored.
    const foreign = createProtocolObject({
      type: 'contribution',
      payload: {
        eventId: 'event:mood:' + 'a'.repeat(24),
        proofId: 'proof:mood:' + 'b'.repeat(24),
        eventHash: 'sha256:' + 'c'.repeat(64),
        algorithm: 'SHA-256',
      },
      nodeId: 'mood:node:' + 'ab'.repeat(32),
      now: OBJECT_AT,
    });

    // Integrity: the ID recomputes from the content — this is the
    // check every node on the network will run, and it needs nothing
    // local.
    assert.ok(validateProtocolObject(foreign).valid, 'a foreign object passes integrity');

    // Linkage: the record is absent HERE, and absence is a note, not
    // a failure — other nodes hold other nodes' objects.
    const linkage = verifyObjectLinkage(foreign, { env: s.env });
    assert.equal(linkage.valid, true);
    assert.equal(linkage.linked, false);
    assert.equal(typeof linkage.note, 'string');

    // The sync adapter — the fixed interface for the network layer —
    // verifies the foreign object today, transport or no transport.
    const adapter = new ObjectSyncAdapter({ nodeId: NODE_ID });
    const remote = await adapter.verifyRemoteObject(foreign);
    assert.deepEqual(remote, { valid: true, errors: [] });

    // And it still refuses, loudly, to pretend a transport exists.
    await assert.rejects(
      () => adapter.syncObject(foreign),
      /Alpha 001/,
      'no silent no-op sync',
    );
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});
