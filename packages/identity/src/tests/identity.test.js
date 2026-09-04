/**
 * Identity Alpha 002-B tests — generation, separation, adoption.
 *
 * Areas covered (Alpha 002-B task, PART 8):
 *   1. identity generation
 *   2. public/private separation
 * plus: refuse-to-rekey, adoption of an existing `mood init` key,
 * loading, and format validation.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createIdentity,
  loadPublicIdentity,
  exportPublicIdentity,
  identityPaths,
  deriveNodeId,
  isValidNodeId,
  isValidPublicKey,
  validatePublicIdentity,
  IDENTITY_VERSION,
} from '../index.js';
import { readPrivateFile, generateKeypair } from '../key-manager.js';
import { isValidPrivateKey } from '../serializer.js';

const tempEnv = () => {
  const home = mkdtempSync(join(tmpdir(), 'mood-identity-'));
  return { env: { MOOD_HOME: home }, home };
};

test('generation: fresh identity creates both records with valid formats', () => {
  const { env, home } = tempEnv();
  const result = createIdentity(env);

  assert.equal(result.status, 'created');
  const { identity } = result;
  assert.ok(isValidNodeId(identity.nodeId), 'nodeId matches mood:node:<64hex>');
  assert.ok(isValidPublicKey(identity.publicKey), 'publicKey is base64 32 bytes');
  assert.equal(identity.algorithm, 'ed25519');
  assert.equal(identity.networkId, 'mood-testnet-001');
  assert.equal(identity.identityVersion, IDENTITY_VERSION);
  assert.ok(!Number.isNaN(Date.parse(identity.createdAt)));

  // nodeId is the deployed derivation over the public key
  assert.equal(identity.nodeId, deriveNodeId(identity.publicKey, identity.networkId));

  // both records exist in ~/.mood/identity/
  const paths = identityPaths(env);
  assert.ok(existsSync(paths.publicFile), 'public.json written');
  assert.ok(existsSync(paths.privateFile), 'private.json written');
  assert.equal(paths.root, home);
});

test('generation: private record stores a valid 64-byte secret key', () => {
  const { env } = tempEnv();
  createIdentity(env);
  const privateRecord = readPrivateFile(env);
  assert.ok(privateRecord, 'private record readable locally');
  assert.ok(isValidPrivateKey(privateRecord.privateKey), '64-byte seed‖public key');
  assert.equal(privateRecord.algorithm, 'ed25519');
});

test('separation: public.json carries no private material', () => {
  const { env } = tempEnv();
  const { identity } = createIdentity(env);
  const privateRecord = readPrivateFile(env);

  const paths = identityPaths(env);
  const publicJson = readFileSync(paths.publicFile, 'utf8');
  assert.ok(!publicJson.includes('privateKey'), 'no privateKey key in public.json');
  assert.ok(!publicJson.includes(privateRecord.privateKey), 'no secret bytes in public.json');

  // the exported public identity is the strict four-field projection
  const exported = exportPublicIdentity(identity);
  assert.deepEqual(
    Object.keys(exported).sort(),
    ['algorithm', 'createdAt', 'nodeId', 'publicKey']
  );
  const exportedJson = JSON.stringify(exported);
  assert.ok(!exportedJson.includes('private'), 'no private material in export');
  assert.ok(!exportedJson.includes(privateRecord.privateKey));
});

test('no rekey: createIdentity refuses when public.json already exists', () => {
  const { env } = tempEnv();
  const first = createIdentity(env);
  assert.throws(
    () => createIdentity(env),
    /protocol identity already exists.*refusing to rekey/
  );
  // and the original identity is untouched
  assert.equal(loadPublicIdentity(env).nodeId, first.identity.nodeId);
});

test('adoption: an existing mood-init key is adopted, node ID preserved', () => {
  const { env } = tempEnv();
  const legacyDir = join(env.MOOD_HOME, 'identity');
  mkdirSync(legacyDir, { recursive: true });

  // simulate exactly what `mood init` writes (tweetnacl-shaped keypair)
  const keypair = generateKeypair();
  const legacyNodeId = deriveNodeId(keypair.publicKey, 'mood-testnet-001');
  const legacyPrivate = {
    nodeId: legacyNodeId,
    privateKey: keypair.privateKey,
    algorithm: 'ed25519',
    createdAt: '2026-09-01T00:00:00.000Z',
    warning: 'KEEP LOCAL. Never share this file. Never commit it.',
  };
  const legacyFile = join(legacyDir, 'private.json');
  writeFileSync(legacyFile, JSON.stringify(legacyPrivate, null, 2));

  const result = createIdentity(env);

  assert.equal(result.status, 'adopted');
  assert.equal(result.identity.nodeId, legacyNodeId, 'same node ID — continuity');
  assert.equal(result.identity.publicKey, keypair.publicKey, 'same public key');
  assert.equal(result.identity.createdAt, '2026-09-01T00:00:00.000Z', 'createdAt preserved');

  // adoption writes ONLY public.json — the private record is untouched
  assert.equal(
    readFileSync(legacyFile, 'utf8'),
    JSON.stringify(legacyPrivate, null, 2),
    'private.json byte-identical after adoption'
  );

  // a stored node ID that does not derive from the key is ground-truthed
  // away: the key, not the claim, decides the node ID
  const { env: env2 } = tempEnv();
  const mismatchDir = join(env2.MOOD_HOME, 'identity');
  mkdirSync(mismatchDir, { recursive: true });
  const mismatched = {
    ...legacyPrivate,
    nodeId: deriveNodeId(generateKeypair().publicKey, 'mood-testnet-001'),
    privateKey: keypair.privateKey,
  };
  writeFileSync(join(mismatchDir, 'private.json'), JSON.stringify(mismatched, null, 2));
  assert.equal(
    createIdentity(env2).identity.nodeId,
    legacyNodeId,
    'node ID always derives from the adopted key'
  );
});

test('loading: null when absent, validated record when present, tamper rejected', () => {
  const { env } = tempEnv();
  assert.equal(loadPublicIdentity(env), null);

  const { identity } = createIdentity(env);
  const loaded = loadPublicIdentity(env);
  assert.equal(loaded.nodeId, identity.nodeId);

  // a tampered public identity must not load: a swapped public key
  // wearing the original node ID (both individually well-formed) is
  // rejected by the nodeId-derivation consistency check
  const paths = identityPaths(env);
  const otherKey = generateKeypair().publicKey;
  const tampered = { ...loaded, publicKey: otherKey };
  writeFileSync(paths.publicFile, JSON.stringify(tampered, null, 2));
  assert.throws(() => loadPublicIdentity(env), /invalid public identity: .*nodeId does not derive/);

  // a structurally broken record is rejected too
  writeFileSync(paths.publicFile, JSON.stringify({ ...loaded, publicKey: 'AAAA' }, null, 2));
  assert.throws(() => loadPublicIdentity(env), /invalid public identity/);
});

test('formats: validators reject wrong shapes', () => {
  assert.ok(!isValidNodeId('mood:node:short'));
  assert.ok(!isValidNodeId('object:mood:abcdef0123456789abcdef01'));
  assert.ok(!isValidNodeId(42));
  assert.ok(!isValidPublicKey('not-base64-32-bytes'));
  assert.ok(!isValidPublicKey(Buffer.alloc(16).toString('base64')));
  assert.ok(!isValidPrivateKey('short'));

  assert.throws(() => validatePublicIdentity(null), /identity record is required/);
  assert.throws(
    () => validatePublicIdentity({ nodeId: 'x', publicKey: 'y', algorithm: 'rsa', createdAt: 'nope' }),
    /invalid public identity: .*nodeId.*publicKey.*algorithm.*createdAt/
  );
});
