/**
 * Identity Alpha 002-B tests — the signature engine.
 *
 * Areas covered (Alpha 002-B task, PART 8):
 *   3. signature creation
 *   4. signature verification
 *   5. tampered signature rejection
 *   6. tampered hash rejection
 *   7. private key leakage scan
 * plus: Alpha 001 compatibility (PART 7) and cross-implementation
 * interop with the deployed tweetnacl node runtime.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import nacl from 'tweetnacl';
import {
  signObjectHash,
  verifyObjectSignature,
  contentDigest,
  createIdentity,
  exportPublicIdentity,
  identityPaths,
} from '../index.js';
import { readPrivateFile } from '../key-manager.js';
import {
  createProtocolObject,
  validateProtocolObject,
  objectContent,
  deriveObjectId,
} from '@mood/protocol-object';

const tempEnv = () => ({ env: { MOOD_HOME: mkdtempSync(join(tmpdir(), 'mood-sig-')) } });

const nodeWithIdentity = () => {
  const { env } = tempEnv();
  const { identity } = createIdentity(env);
  const privateKey = readPrivateFile(env).privateKey;
  return { env, identity, privateKey };
};

// a real 256-bit content digest, via the shared hash engine
const sampleDigest = () => contentDigest({ type: 'contribution', payload: { n: 1 } });

test('creation: signs a 256-bit digest, deterministic, both accepted forms', () => {
  const { privateKey } = nodeWithIdentity();
  const digest = sampleDigest();

  const signature = signObjectHash(digest, privateKey);
  assert.equal(signature.length, 88, 'base64 of 64 bytes');
  assert.equal(Buffer.from(signature, 'base64').length, 64);

  // RFC 8032: same key + same digest → identical bytes, every machine
  assert.equal(signObjectHash(digest, privateKey), signature, 'deterministic');

  // bare 64-hex form signs the same digest
  const bare = digest.slice('sha256:'.length);
  assert.equal(signObjectHash(bare, privateKey), signature, 'bare hex accepted');
});

test('creation: refuses anything that is not a 256-bit digest', () => {
  const { privateKey } = nodeWithIdentity();
  assert.throws(() => signObjectHash('database-row-42', privateKey), /256-bit canonical object digest/);
  assert.throws(() => signObjectHash('SELECT * FROM objects', privateKey), /256-bit canonical object digest/);
  // the truncated 24-hex object ID is not a signable digest
  assert.throws(() => signObjectHash('object:mood:abcdef0123456789abcdef01', privateKey), /256-bit/);
  assert.throws(() => signObjectHash('abcdef0123456789', privateKey), /256-bit/);
});

test('verification: genuine signature verifies with the public key alone', () => {
  const { identity, privateKey } = nodeWithIdentity();
  const digest = sampleDigest();
  const signature = signObjectHash(digest, privateKey);

  assert.equal(verifyObjectSignature(digest, signature, identity.publicKey), true);
  // bare hex form verifies too
  assert.equal(verifyObjectSignature(digest.slice(7), signature, identity.publicKey), true);
});

test('tampered signature rejection', () => {
  const { identity, privateKey } = nodeWithIdentity();
  const digest = sampleDigest();
  const signature = signObjectHash(digest, privateKey);

  // flip one byte
  const bytes = Buffer.from(signature, 'base64');
  bytes[0] ^= 1;
  assert.equal(verifyObjectSignature(digest, bytes.toString('base64'), identity.publicKey), false);

  // truncated / garbage signatures: false, never a throw
  assert.equal(verifyObjectSignature(digest, 'AAAA', identity.publicKey), false);
  assert.equal(verifyObjectSignature(digest, 'garbage', identity.publicKey), false);
  assert.equal(verifyObjectSignature(digest, '', identity.publicKey), false);
});

test('tampered hash rejection', () => {
  const { identity, privateKey } = nodeWithIdentity();
  const digest = sampleDigest();
  const signature = signObjectHash(digest, privateKey);

  // a different digest under the same signature
  const other = contentDigest({ type: 'contribution', payload: { n: 2 } });
  assert.equal(verifyObjectSignature(other, signature, identity.publicKey), false);

  // one changed hex char in the digest
  const mutated = digest.slice(0, -2) + (digest.endsWith('00') ? '11' : '00');
  assert.equal(verifyObjectSignature(mutated, signature, identity.publicKey), false);

  // wrong public key
  const { identity: otherIdentity } = nodeWithIdentity();
  assert.equal(verifyObjectSignature(digest, signature, otherIdentity.publicKey), false);

  // malformed inputs: the predicate answers false, it never throws
  assert.equal(verifyObjectSignature('garbage', signature, identity.publicKey), false);
  assert.equal(verifyObjectSignature(digest, signature, 'garbage'), false);
});

test('leakage scan: private material appears in no public artifact', () => {
  const { env, identity, privateKey } = nodeWithIdentity();
  const privateRecord = readPrivateFile(env);
  const secretBytes = Buffer.from(privateKey, 'base64');

  const artifacts = {
    'public.json': readFileSync(identityPaths(env).publicFile, 'utf8'),
    'exportPublicIdentity': JSON.stringify(exportPublicIdentity(identity)),
    'signature output': signObjectHash(sampleDigest(), privateKey),
  };

  for (const [name, text] of Object.entries(artifacts)) {
    assert.ok(!text.includes(privateKey), `${name} leaks the secret key`);
    assert.ok(!text.includes(secretBytes.toString('hex')), `${name} leaks secret bytes as hex`);
    assert.ok(!text.includes(secretKeysSubarray()), `${name} leaks the seed`);
  }

  // the seed (first 32 bytes of the secret) must not appear anywhere public
  function secretKeysSubarray() {
    return secretBytes.subarray(0, 32).toString('base64');
  }
});

test('Alpha 001 compatibility: objects stay valid, signature attaches outside', () => {
  const { identity, privateKey } = nodeWithIdentity();

  // mint a real Alpha 001 v0.1 object
  const object = createProtocolObject({
    nodeId: identity.nodeId,
    payload: {
      eventId: 'event:mood:' + 'a1b2c3d4e5f6a7b8c9d0e1f2'.slice(0, 24),
      proofId: 'proof:mood:' + 'b2c3d4e5f6a7b8c9d0e1f2a3'.slice(0, 24),
      eventHash: 'sha256:' + 'ab'.repeat(32),
      algorithm: 'SHA-256',
    },
  });

  // unsigned mode: the object validates exactly as Alpha 001 froze it
  assert.equal(validateProtocolObject(object).valid, true, 'old object still verified=true');

  // the full digest the ID is derived from — same engine, same preimage
  const digest = contentDigest(objectContent(object));
  assert.equal(
    object.id,
    'object:mood:' + digest.slice('sha256:'.length).slice(0, 24),
    'the signed digest is the same preimage the 24-hex ID truncates'
  );

  // sign it; the signature attaches OUTSIDE the frozen envelope
  const signature = signObjectHash(digest, privateKey);
  const signed = { object, signature };

  // the object itself is byte-identical — Alpha 001 remains history
  assert.deepEqual(signed.object, object);
  assert.equal(validateProtocolObject(signed.object).valid, true, 'object unchanged by signing');

  // two-mode verification: unsigned passes, signed verifies against the issuer
  assert.equal(verifyObjectSignature(digest, signature, identity.publicKey), true);
  assert.equal(verifyObjectSignature(contentDigest(objectContent(signed.object)), signed.signature, identity.publicKey), true);
});

test('interop: tweetnacl (deployed node runtime) verifies protocol signatures, both ways', () => {
  const { identity, privateKey } = nodeWithIdentity();
  const digest = sampleDigest();
  const digestBytes = Buffer.from(digest.slice('sha256:'.length), 'hex');

  // node-runtime's library verifies a @mood/identity signature
  const protocolSignature = Buffer.from(signObjectHash(digest, privateKey), 'base64');
  assert.equal(
    nacl.sign.detached.verify(digestBytes, protocolSignature, Buffer.from(identity.publicKey, 'base64')),
    true,
    'tweetnacl verifies the protocol signature'
  );

  // and @mood/identity verifies a tweetnacl signature over the same digest
  // (tweetnacl returns a plain Uint8Array — wrap before encoding)
  const secret = Buffer.from(privateKey, 'base64');
  const naclSignature = Buffer.from(nacl.sign.detached(digestBytes, secret));
  assert.equal(
    verifyObjectSignature(digest, naclSignature.toString('base64'), identity.publicKey),
    true,
    'protocol verifier accepts a tweetnacl signature'
  );
});
