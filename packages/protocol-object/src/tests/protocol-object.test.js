/**
 * @mood/protocol-object test suite.
 *
 * Covered per the Protocol Object Alpha 001 spec:
 *
 *   1. Object creation  — exact v0.1 shape, deterministic content-derived
 *                         ID, issuer binding, creation-time rejection
 *   2. ID determinism   — same content → same object ID, in any key
 *                         order; one changed character → different ID
 *   3. Payload type     — contribution payload built from a REAL proof
 *                         (reference, not duplication); malformed proofs
 *                         and payloads rejected
 *   4. Validation       — every field family checked; unknown keys,
 *                         wrong version, bad timestamp, bad issuer all
 *                         fail with reasons
 *   5. Integrity        — an object edited after the fact fails ID
 *                         recomputation (the network check)
 *   6. Secret guard     — credential-shaped content rejected at creation
 *                         AND at verification
 *   7. Linkage          — cross-check against stored proofs: match passes,
 *                         contradiction fails, absent record is a note
 *   8. Storage          — round-trip, filenames, index rebuild, listing
 *                         order, find by ID, metadata, idempotent store
 *   9. On-disk tamper   — a stored object edited on disk fails the sweep
 *  10. Sync adapter     — verifyRemoteObject is concrete; syncObject is
 *                         an honest refusal, not a silent no-op
 *
 * Run: npm test   (from packages/protocol-object)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createContributionEvent,
  createProof,
  saveContribution,
  findContribution,
  canonicalize,
} from '@mood/contribution-proof';
import {
  OBJECT_TYPES,
  OBJECT_VERSION,
  OBJECT_KEYS,
  CONTRIBUTION_PAYLOAD_KEYS,
  DEFAULT_OBJECT_TYPE,
  objectContent,
  deriveObjectId,
  canonicalObject,
  createProtocolObject,
  buildContributionPayload,
  validateContributionPayload,
  validateProtocolObject,
  verifyObjectLinkage,
  filenameFor,
  objectPaths,
  initObjectStorage,
  storeObject,
  rebuildIndex,
  listObjects,
  findObject,
  readObjectMetadata,
  verifyStoredObjects,
  ObjectSyncAdapter,
} from '../index.js';

const EVENT_AT = '2026-09-03T08:00:00.000Z';
const PROOF_AT = '2026-09-03T08:00:01.000Z';
const OBJECT_AT = '2026-09-03T08:00:02.000Z';
const NODE_ID = 'mood:node:' + '3feb3570'.repeat(8); // 64 hex, the real shape

/** 'object:mood:<hex>' → its on-disk filename 'object-mood-<hex>.json'. */
const objectFileName = (object) =>
  'object-mood-' + object.id.slice('object:mood:'.length) + '.json';

function validContent(overrides = {}) {
  return {
    actor: { id: 'agent:mood:9f8e7d6c5b4a3928', type: 'ai_agent', name: 'Claude Code' },
    action: { type: 'code_change', description: 'Protocol object test' },
    timestamp: EVENT_AT,
    source: { connector: 'connector:mood:abc123', node: NODE_ID },
    ...overrides,
  };
}

/** A real event + proof pair, exactly as the proof layer mints them. */
function realProof() {
  const event = createContributionEvent(validContent());
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
  const root = mkdtempSync(join(tmpdir(), 'mood-protocol-object-test-'));
  const env = { MOOD_HOME: join(root, '.mood'), USERPROFILE: root, HOME: root };
  return { root, env };
}

// ── 1. Object creation ──────────────────────────────────────────────────────

test('object: created with the exact v0.1 shape', () => {
  const object = realObject();
  assert.deepEqual(Object.keys(object).sort(), [...OBJECT_KEYS].sort());
  assert.equal(object.type, 'contribution');
  assert.equal(object.version, OBJECT_VERSION);
  assert.equal(object.createdAt, OBJECT_AT);
  assert.deepEqual(object.issuer, { nodeId: NODE_ID });
  assert.match(object.id, /^object:mood:[0-9a-f]{24}$/);
  assert.ok(validateProtocolObject(object).valid, 'a created object passes its own validation');
});

test('object: the payload references the proof — it never copies it', () => {
  const proof = realProof();
  const object = createProtocolObject({
    payload: buildContributionPayload(proof),
    nodeId: NODE_ID,
    now: OBJECT_AT,
  });
  assert.deepEqual(Object.keys(object.payload).sort(), [...CONTRIBUTION_PAYLOAD_KEYS].sort());
  assert.deepEqual(object.payload, {
    eventId: proof.eventId,
    proofId: proof.proofId,
    eventHash: proof.eventHash,
    algorithm: proof.algorithm,
  });
  // No event content rides along — no actor, no description, no source.
  assert.equal('actor' in object.payload, false);
  assert.equal('description' in object.payload, false);
});

test('object: default type is contribution, and creation rejects bad input', () => {
  const proof = realProof();
  assert.equal(DEFAULT_OBJECT_TYPE, 'contribution');
  assert.deepEqual(OBJECT_TYPES, ['contribution'], 'exactly one type in Alpha 001');

  // Unknown type.
  assert.throws(
    () => createProtocolObject({ type: 'reward', payload: buildContributionPayload(proof), nodeId: NODE_ID }),
    (err) => err.code === 'INVALID_PROTOCOL_OBJECT' && /type/.test(err.message)
  );
  // Issuer is mandatory — an object is issued BY a node.
  assert.throws(
    () => createProtocolObject({ payload: buildContributionPayload(proof) }),
    (err) => err.code === 'INVALID_PROTOCOL_OBJECT' && /nodeId/.test(err.message)
  );
  assert.throws(
    () => createProtocolObject({ payload: buildContributionPayload(proof), nodeId: 'node-7' }),
    /nodeId must match/
  );
  // Malformed payload.
  assert.throws(
    () => createProtocolObject({ payload: { eventId: 'x' }, nodeId: NODE_ID }),
    (err) => err.code === 'INVALID_PROTOCOL_OBJECT' && /payload/.test(err.message)
  );
});

// ── 2. ID determinism ───────────────────────────────────────────────────────

test('id: same content → same object ID, in any key order', () => {
  const a = realObject();
  const b = realObject();
  assert.equal(a.id, b.id, 'content-derived object IDs are identical');

  // The same content assembled in a different insertion order canonicalizes
  // identically — this is what makes an ID mean the same thing on every node.
  const reordered = {
    payload: { ...a.payload },
    issuer: { nodeId: a.issuer.nodeId },
    createdAt: a.createdAt,
    version: a.version,
    type: a.type,
  };
  assert.equal(deriveObjectId(objectContent(reordered)), a.id);
  // One canonicalization, imported from the proof layer — and the object's
  // own id is never part of its preimage.
  assert.equal(canonicalObject(reordered), canonicalize(objectContent(a)));
});

test('id: any change to the content changes the ID', () => {
  const object = realObject();
  const original = object.id;

  const variants = [
    { ...object, createdAt: '2026-09-03T09:00:00.000Z' }, // a different issuance moment
    { ...object, issuer: { nodeId: 'mood:node:' + 'ff'.repeat(32) } }, // a different issuer
    { ...object, payload: { ...object.payload, proofId: 'proof:mood:' + '1'.repeat(24) } },
    { ...object, payload: { ...object.payload, eventHash: 'sha256:' + '2'.repeat(64) } },
  ];
  for (const variant of variants) {
    assert.notEqual(deriveObjectId(objectContent(variant)), original);
  }
  assert.equal(deriveObjectId(objectContent(object)), original, 'untouched content still derives the same ID');
});

// ── 3. The contribution payload type ────────────────────────────────────────

test('payload: built from a real proof, and only from a valid one', () => {
  const proof = realProof();
  const payload = buildContributionPayload(proof);
  assert.ok(validateContributionPayload(payload).valid);

  // A malformed proof must never be wrapped.
  const broken = { ...proof, proofId: 'not-a-proof-id' };
  assert.throws(
    () => buildContributionPayload(broken),
    (err) => err.code === 'INVALID_CONTRIBUTION_PROOF'
  );
  assert.throws(() => buildContributionPayload(null), /invalid ContributionProof/);
});

test('payload: the schema is exact — unknown keys and bad patterns rejected', () => {
  const proof = realProof();
  const payload = buildContributionPayload(proof);

  assert.equal(validateContributionPayload({ ...payload, score: 100 }).valid, false, 'no reputation sneaks in');
  assert.equal(validateContributionPayload({ ...payload, reward: 5 }).valid, false, 'no reward sneaks in');
  assert.equal(validateContributionPayload({ eventId: 'x', proofId: 'y', eventHash: 'z', algorithm: 'SHA-256' }).valid, false);
  assert.equal(validateContributionPayload({ ...payload, algorithm: 'SHA-512' }).valid, false, 'the algorithm is pinned');
  assert.equal(validateContributionPayload([payload]).valid, false, 'an array is not a payload');
});

// ── 4. Validation ───────────────────────────────────────────────────────────

test('validate: every field family is checked, with reasons', () => {
  const object = realObject();

  // Unknown key at the top level.
  assert.equal(validateProtocolObject({ ...object, extra: true }).valid, false);
  // Missing key.
  const { createdAt, ...missing } = object;
  assert.equal(validateProtocolObject(missing).valid, false);
  // Wrong version — new versions cannot silently replace 0.1.
  assert.equal(validateProtocolObject({ ...object, version: '0.2' }).valid, false);
  // Non-UTC timestamp.
  assert.equal(validateProtocolObject({ ...object, createdAt: '2026-09-03 08:00:02' }).valid, false);
  // Issuer shape.
  assert.equal(validateProtocolObject({ ...object, issuer: { nodeId: 'node-7' } }).valid, false);
  assert.equal(validateProtocolObject({ ...object, issuer: { nodeId: NODE_ID, extra: 1 } }).valid, false);
  assert.equal(validateProtocolObject({ ...object, issuer: null }).valid, false);
  // Not an object at all.
  assert.equal(validateProtocolObject('object').valid, false);
  assert.equal(validateProtocolObject([object]).valid, false);
  // Control.
  assert.deepEqual(validateProtocolObject(object), { valid: true, errors: [] });
});

test('validate: errors are collected, not thrown — a failed check is a result', () => {
  const broken = { ...realObject(), type: 'reward', version: '9.9' };
  const check = validateProtocolObject(broken);
  assert.equal(check.valid, false);
  assert.ok(check.errors.length >= 2, 'every defect is named');
  assert.ok(check.errors.some((e) => e.includes('type')));
  assert.ok(check.errors.some((e) => e.includes('version')));
});

// ── 5. Integrity — the network check ────────────────────────────────────────

test('integrity: an object edited after the fact fails ID recomputation', () => {
  const object = realObject();

  // Rewrite history: swap in a different proof reference, keep the old ID.
  const edited = {
    ...object,
    payload: { ...object.payload, proofId: 'proof:mood:' + 'e'.repeat(24) },
  };
  const check = validateProtocolObject(edited);
  assert.equal(check.valid, false);
  assert.ok(check.errors.some((e) => e.includes('id mismatch')), check.errors.join('; '));

  // A well-formed but wrong-length ID fails the pattern before recomputation.
  assert.ok(validateProtocolObject({ ...object, id: 'object:mood:zzz' }).errors.some((e) => e.includes('id must match')));
});

// ── 6. Secret guard ─────────────────────────────────────────────────────────

test('security: credential-shaped content is rejected at creation and verification', () => {
  const proof = realProof();
  const payload = buildContributionPayload(proof);

  // At creation — a credential planted into a payload field.
  assert.throws(
    () => createProtocolObject({
      payload: { ...payload, eventId: 'sk-ant-api03-FAKE-KEY-MUST-NEVER-LEAK' },
      nodeId: NODE_ID,
    }),
    (err) => err.code === 'INVALID_PROTOCOL_OBJECT'
  );

  // At verification — an object that was never created through this package.
  const planted = { ...realObject(), payload: { ...payload, eventHash: 'password=hunter2-login' } };
  const check = validateProtocolObject(planted);
  assert.equal(check.valid, false);
  assert.ok(check.errors.some((e) => e.includes('credential')), 'the guard fires on the verify path too');
});

// ── 7. Linkage — the local cross-check ──────────────────────────────────────

test('linkage: stored proof match passes; contradiction fails; absence is a note', () => {
  const s = sandbox();
  try {
    const event = createContributionEvent(validContent());
    const proof = createProof(event, PROOF_AT);
    saveContribution({ event, proof, env: s.env });

    const object = createProtocolObject({
      payload: buildContributionPayload(proof),
      nodeId: NODE_ID,
      now: OBJECT_AT,
    });

    // The referenced proof is stored here and agrees → linked and valid.
    const good = verifyObjectLinkage(object, { env: s.env });
    assert.equal(good.linked, true);
    assert.equal(good.valid, true);

    // An object that contradicts the stored proof → a failure with reasons.
    const contradictory = {
      ...object,
      payload: { ...object.payload, eventHash: 'sha256:' + '0'.repeat(64) },
    };
    const bad = verifyObjectLinkage(contradictory, { env: s.env });
    assert.equal(bad.linked, true, 'the record exists, so it was checked');
    assert.equal(bad.valid, false);
    assert.ok(bad.errors.some((e) => e.includes('eventHash mismatch')));

    // A stranger's object — no local record → a note, never a failure:
    // other nodes hold other nodes' objects.
    const strangerProof = createProof(
      createContributionEvent(validContent({
        action: { type: 'code_change', description: 'Somewhere else entirely' },
      })),
      PROOF_AT
    );
    const stranger = createProtocolObject({
      payload: buildContributionPayload(strangerProof),
      nodeId: NODE_ID,
      now: OBJECT_AT,
    });
    const absent = verifyObjectLinkage(stranger, { env: s.env });
    assert.equal(absent.linked, false);
    assert.equal(absent.valid, true, 'absence is not a contradiction');
    assert.ok(absent.note.includes('no ContributionProof stored'));

    // Sanity: the fixture really is stored.
    assert.ok(findContribution({ eventId: event.id, env: s.env }));
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});

// ── 8. Storage ──────────────────────────────────────────────────────────────

test('storage: round-trip through ~/.mood/objects (MOOD_HOME-aware)', () => {
  const s = sandbox();
  try {
    const object = realObject();
    const { objectFile, indexFile, metadataFile, created } = storeObject(object, { env: s.env });

    assert.equal(created, true);
    assert.ok(existsSync(objectFile) && existsSync(indexFile) && existsSync(metadataFile));
    // MOOD_HOME wins over USERPROFILE/HOME — an isolated home stays isolated.
    assert.equal(objectPaths(s.env).root, join(s.env.MOOD_HOME, 'objects'));
    assert.equal(objectFile, join(objectPaths(s.env).types.contribution, objectFileName(object)));
    assert.deepEqual(JSON.parse(readFileSync(objectFile, 'utf8')), object, 'the file IS the object');

    // The derived index catalogs the ID.
    assert.deepEqual(JSON.parse(readFileSync(indexFile, 'utf8')), { contribution: [object.id] });

    // The metadata is local state, never part of the object.
    assert.deepEqual(JSON.parse(readFileSync(metadataFile, 'utf8')), {
      id: object.id,
      type: 'contribution',
      origin: 'local',
      syncStatus: 'unsynchronized',
    });

    // List + find round-trip.
    assert.deepEqual(listObjects(s.env), [object]);
    assert.deepEqual(findObject({ id: object.id, env: s.env }), object);
    assert.equal(findObject({ id: 'object:mood:' + '0'.repeat(24), env: s.env }), null);
    assert.deepEqual(readObjectMetadata({ id: object.id, env: s.env }).syncStatus, 'unsynchronized');

    // Idempotent: storing the same object again succeeds, created: false.
    const again = storeObject(object, { env: s.env });
    assert.equal(again.created, false);
    assert.equal(listObjects(s.env).length, 1);
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});

test('storage: init is idempotent; the index rebuilds from the files', () => {
  const s = sandbox();
  try {
    const paths = initObjectStorage(s.env);
    assert.ok(existsSync(paths.types.contribution));
    assert.ok(existsSync(paths.indexDir) && existsSync(paths.metadataDir));
    initObjectStorage(s.env);
    assert.deepEqual(listObjects(s.env), []);
    assert.deepEqual(verifyStoredObjects(s.env), { total: 0, passed: 0, failed: 0, results: [] });

    // Store two objects, delete the index (it is only a cache), rebuild.
    const first = realObject();
    const secondProof = createProof(
      createContributionEvent(validContent({
        action: { type: 'code_change', description: 'A second contribution' },
        timestamp: '2026-09-03T09:00:00.000Z',
      })),
      PROOF_AT
    );
    const second = createProtocolObject({
      payload: buildContributionPayload(secondProof),
      nodeId: NODE_ID,
      now: '2026-09-03T09:00:01.000Z',
    });
    storeObject(first, { env: s.env });
    storeObject(second, { env: s.env });

    rmSync(join(paths.indexDir, 'by-type.json'));
    rebuildIndex(s.env);
    assert.deepEqual(
      JSON.parse(readFileSync(join(paths.indexDir, 'by-type.json'), 'utf8')).contribution.sort(),
      [first.id, second.id].sort()
    );

    // Newest first.
    assert.equal(listObjects(s.env)[0].id, second.id);

    // The metadata survives a rebuild — it is not derived.
    assert.equal(readObjectMetadata({ id: first.id, env: s.env }).origin, 'local');
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});

test('storage: an invalid object never touches disk', () => {
  const s = sandbox();
  try {
    const object = realObject();
    const edited = { ...object, createdAt: '2026-09-03T10:00:00.000Z' }; // same ID, new content
    assert.throws(
      () => storeObject(edited, { env: s.env }),
      (err) => err.code === 'INVALID_PROTOCOL_OBJECT'
    );
    assert.deepEqual(listObjects(s.env), []);
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});

// ── 9. On-disk tamper detection ─────────────────────────────────────────────

test('verify sweep: a stored object edited on disk fails', () => {
  const s = sandbox();
  try {
    const object = realObject();
    const { objectFile } = storeObject(object, { env: s.env });

    const sweep = verifyStoredObjects(s.env);
    assert.equal(sweep.total, 1);
    assert.equal(sweep.passed, 1);
    assert.equal(sweep.results[0].valid, true);

    const stored = JSON.parse(readFileSync(objectFile, 'utf8'));
    stored.issuer.nodeId = 'mood:node:' + 'ab'.repeat(32); // rewritten after the fact
    writeFileSync(objectFile, JSON.stringify(stored, null, 2) + '\n', 'utf8');

    const afterTamper = verifyStoredObjects(s.env);
    assert.equal(afterTamper.failed, 1, 'the tampered object fails the sweep');
    assert.ok(afterTamper.results[0].errors.some((e) => e.includes('id mismatch')));
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});

// ── 10. Sync adapter — the fixed interface ──────────────────────────────────

test('sync: verifyRemoteObject is concrete — any node\'s object verifies here', async () => {
  const adapter = new ObjectSyncAdapter({ nodeId: NODE_ID });
  assert.equal(adapter.transport, null, 'no transport exists in Alpha 001');

  // An object minted "elsewhere" (never stored here) still verifies.
  const foreign = realObject();
  const check = await adapter.verifyRemoteObject(foreign);
  assert.deepEqual(check, { valid: true, errors: [] });

  // A tampered one does not.
  const tampered = { ...foreign, payload: { ...foreign.payload, eventHash: 'sha256:' + '9'.repeat(64) } };
  const bad = await adapter.verifyRemoteObject(tampered);
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.length > 0);
});

test('sync: syncObject is an honest refusal, not a silent no-op', async () => {
  const adapter = new ObjectSyncAdapter();

  // An invalid object is refused for being invalid.
  await assert.rejects(
    () => adapter.syncObject({ id: 'nope' }),
    (err) => err.code === 'INVALID_PROTOCOL_OBJECT'
  );

  // A VALID object is refused because the transport does not exist yet —
  // loudly, so no caller believes a sync happened.
  const object = realObject();
  await assert.rejects(
    () => adapter.syncObject(object),
    (err) => /interface in Alpha 001/.test(err.message)
  );
});
