/**
 * @mood/node-runtime smoke tests.
 *
 * The CLI (apps/mood-cli) is the first consumer of this package's root
 * export — these tests guard that surface so the barrel, the CJS/ESM
 * interop shims, and the snapshot attestation round-trip cannot silently
 * break again.
 *
 * Run: npm test   (from packages/node-runtime)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  // managers (barrel fix: these must all be importable from the root)
  NodeIdentityManager,
  OrganizationManager,
  StorageManager,
  SyncManager,
  SnapshotManager,
  ProtocolAdapter,
  // identity
  generateKeypair,
  generateNodeId,
  isValidNodeId,
  sign,
  verify,
  // organization
  generateOrganizationId,
  // invitation
  createInvitation,
  verifyInvitationSignature,
  // snapshot
  computeSnapshotDigest,
  verifySnapshotDigest,
  createSnapshot,
  createSnapshotAttestation,
  verifyAttestation,
  signSnapshot,
} from '../index.js';

const NETWORK_ID = 'mood-testnet-001';

// ── Package surface ─────────────────────────────────────────────────────────

test('root export: all manager classes and functions import cleanly', () => {
  for (const C of [NodeIdentityManager, OrganizationManager, StorageManager, SyncManager, SnapshotManager, ProtocolAdapter]) {
    assert.equal(typeof C, 'function', `${C?.name} is exported as a class`);
  }
  for (const f of [generateKeypair, generateNodeId, sign, verify, createInvitation, verifyInvitationSignature, createSnapshot, signSnapshot, verifyAttestation]) {
    assert.equal(typeof f, 'function', `${f.name} is exported`);
  }
});

// ── Identity ────────────────────────────────────────────────────────────────

test('identity: keypair + deterministic node ID', () => {
  const kp = generateKeypair();
  assert.ok(kp.publicKey && kp.secretKey, 'keypair has both keys');
  assert.notEqual(kp.publicKey, kp.secretKey);

  const nodeId = generateNodeId(kp.publicKey, NETWORK_ID);
  assert.match(nodeId, /^mood:node:[0-9a-f]{64}$/, 'node ID format');
  assert.ok(isValidNodeId(nodeId), 'node ID validates');

  // Deterministic: same inputs → same ID; different network → different ID.
  assert.equal(generateNodeId(kp.publicKey, NETWORK_ID), nodeId);
  assert.notEqual(generateNodeId(kp.publicKey, 'mood-testnet-999'), nodeId);
});

test('identity: sign/verify round-trip rejects tampering', () => {
  const kp = generateKeypair();
  const message = JSON.stringify({ hello: 'mood' });
  const signature = sign(message, kp.secretKey);

  assert.equal(verify(message, signature, kp.publicKey), true);
  assert.equal(verify(message + 'x', signature, kp.publicKey), false, 'tampered message rejected');

  const other = generateKeypair();
  assert.equal(verify(message, signature, other.publicKey), false, 'wrong key rejected');
});

// ── Organization ────────────────────────────────────────────────────────────

test('organization: ID derivation is deterministic and domain-bound', () => {
  const a = generateOrganizationId('MOOD Alpha', 'alpha.mood.example');
  const b = generateOrganizationId('mood alpha', 'ALPHA.mood.example'); // case-insensitive
  assert.equal(a, b, 'name/domain normalized');
  assert.notEqual(a, generateOrganizationId('MOOD Alpha', 'other.example'), 'different domain → different org');
});

// ── Invitation ──────────────────────────────────────────────────────────────

test('invitation: create → verify signature round-trip', () => {
  const admin = generateKeypair();
  const invitation = createInvitation(
    {
      organizationId: generateOrganizationId('MOOD Alpha', 'alpha.mood.example'),
      organizationName: 'MOOD Alpha',
      organizationDomain: 'alpha.mood.example',
      memberEmail: 'alice@example.com',
      networkId: NETWORK_ID,
      issuedBy: generateNodeId(admin.publicKey, NETWORK_ID),
      adminPublicKey: admin.publicKey,
    },
    admin.secretKey
  );

  assert.equal(invitation.payload.memberEmail, 'alice@example.com');
  assert.equal(invitation.payload.maxUses, 1);
  assert.ok(invitation.signature, 'invitation is signed');

  const good = verifyInvitationSignature(invitation);
  assert.equal(good.valid, true, `signature verifies: ${good.error || 'ok'}`);

  // Tampering with the payload must break the signature.
  const tampered = { ...invitation, payload: { ...invitation.payload, memberEmail: 'mallory@example.com' } };
  assert.equal(verifyInvitationSignature(tampered).valid, false, 'tampered invitation rejected');
});

// ── Snapshot agreement ──────────────────────────────────────────────────────

const CONTRIBUTIONS = [
  {
    contributionId: 'contrib-002',
    contentFingerprint: 'sha256:' + 'b'.repeat(64),
    status: 'finalized',
    contributor: { id: 'mood:node:' + '2'.repeat(64) },
  },
  {
    contributionId: 'contrib-001',
    contentFingerprint: 'sha256:' + 'a'.repeat(64),
    status: 'finalized',
    contributor: { id: 'mood:node:' + '1'.repeat(64) },
  },
];

test('snapshot: digest is deterministic regardless of contribution order', () => {
  const meta = { epochId: 'epoch-0001', epochNumber: 1, memberCount: 3, timestamp: '2026-09-03T00:00:00.000Z' };
  const a = computeSnapshotDigest(CONTRIBUTIONS, meta);
  const b = computeSnapshotDigest([...CONTRIBUTIONS].reverse(), meta);
  assert.equal(a, b, 'order-independent canonicalization');
  assert.match(a, /^sha256:[0-9a-f]{64}$/);
});

test('snapshot: createSnapshot self-verifies and detects tampering', () => {
  const kp = generateKeypair();
  const snapshot = createSnapshot({
    epochNumber: 1,
    contributions: CONTRIBUTIONS,
    networkId: NETWORK_ID,
    policyVersion: 'alpha-002',
    memberCount: 3,
    issuerNodeId: generateNodeId(kp.publicKey, NETWORK_ID),
  });

  assert.equal(verifySnapshotDigest(snapshot), true, 'digest agreement holds');

  const forged = { ...snapshot, digest: 'sha256:' + '0'.repeat(64) };
  assert.equal(verifySnapshotDigest(forged), false, 'forged digest rejected');
});

test('snapshot: signSnapshot → attestation → verifyAttestation round-trip', () => {
  const kp = generateKeypair();
  const nodeId = generateNodeId(kp.publicKey, NETWORK_ID);
  const snapshot = createSnapshot({
    epochNumber: 1,
    contributions: CONTRIBUTIONS,
    networkId: NETWORK_ID,
    policyVersion: 'alpha-002',
    memberCount: 3,
    issuerNodeId: nodeId,
  });

  const signature = signSnapshot(snapshot, kp.secretKey);
  const attestation = createSnapshotAttestation({
    snapshotId: snapshot.snapshotId,
    digest: snapshot.digest,
    epochId: snapshot.epochId,
    nodeId,
    signature,
  });

  const ok = verifyAttestation(attestation, kp.publicKey);
  assert.equal(ok.valid, true, `self-attestation verifies: ${ok.error || 'ok'}`);

  // A different node's key must not verify this attestation.
  const other = generateKeypair();
  assert.equal(verifyAttestation(attestation, other.publicKey).valid, false, 'foreign key rejected');
});
