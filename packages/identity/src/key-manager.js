/**
 * MOOD Protocol Identity Alpha 002-B — key management.
 *
 * Responsibilities:
 *   - generate Ed25519 keypairs (Node native crypto, zero dependencies)
 *   - resolve the node identity directory (MOOD_HOME or ~/.mood/identity)
 *   - read/write the public record (public.json — propagatable) and the
 *     private record (private.json — node-local, mode 0600 where the
 *     filesystem supports it)
 *
 * Encodings stay compatible with the deployed node runtime so one node
 * keeps one key across layers:
 *   publicKey  — base64, raw 32-byte Ed25519 public key
 *   privateKey — base64, 64 bytes: 32-byte seed ‖ 32-byte public key
 *
 * SECURITY: the private record never leaves this directory. The
 * readPrivateFile() accessor exists for the local signing process only
 * (CLI daemon, invitation signing) — it is deliberately not re-exported
 * from the package's top-level index.
 */

import {
  generateKeyPairSync,
  createPublicKey,
  createPrivateKey,
} from 'crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  chmodSync,
} from 'fs';
import { join } from 'path';
import { resolveUserHome } from '@mood/contribution-proof';
import { ALGORITHM } from './serializer.js';

/**
 * Resolve the node identity directory. Mirrors the object layer's
 * storage resolution: MOOD_HOME wins, then ~/.mood.
 */
export function identityPaths(env = process.env) {
  const root = env.MOOD_HOME || join(resolveUserHome(env), '.mood');
  const identityDir = join(root, 'identity');
  return {
    root,
    identityDir,
    publicFile: join(identityDir, 'public.json'),
    privateFile: join(identityDir, 'private.json'),
  };
}

/**
 * Generate a fresh Ed25519 keypair via Node native crypto (RFC 8032,
 * deterministic). Returns the deployed encoding: base64 raw keys.
 *
 * DER layout notes (standard single-seed Ed25519):
 *   SPKI  is 44 bytes — the raw 32-byte public key is the trailing 32.
 *   PKCS8 is 48 bytes — the raw 32-byte seed is the trailing 32.
 * The lengths are asserted so a nonstandard DER shape fails loudly
 * instead of producing wrong key bytes.
 */
export function generateKeypair() {
  const { publicKey, privateKey } = generateKeyPairSync(ALGORITHM);
  const publicDer = publicKey.export({ type: 'spki', format: 'der' });
  const privateDer = privateKey.export({ type: 'pkcs8', format: 'der' });
  if (publicDer.length !== 44 || privateDer.length !== 48) {
    throw new Error(
      `unexpected Ed25519 DER lengths (spki ${publicDer.length}, pkcs8 ${privateDer.length}) — refusing to derive raw keys`
    );
  }
  const rawPublic = publicDer.subarray(-32);
  const seed = privateDer.subarray(-32);
  const secretKey = Buffer.concat([seed, rawPublic]);
  return {
    publicKey: rawPublic.toString('base64'),
    privateKey: secretKey.toString('base64'),
    algorithm: ALGORITHM,
  };
}

/** Build a Node KeyObject from the base64 raw public key. */
export function publicKeyObject(publicKey) {
  const raw = Buffer.from(publicKey, 'base64');
  if (raw.length !== 32) {
    throw new Error('publicKey must be base64 encoding exactly 32 bytes');
  }
  return createPublicKey({
    key: { kty: 'OKP', crv: 'Ed25519', x: raw.toString('base64url') },
    format: 'jwk',
  });
}

/** Build a Node KeyObject from the base64 seed‖public secret key. */
export function privateKeyObject(privateKey) {
  const secret = Buffer.from(privateKey, 'base64');
  if (secret.length !== 64) {
    throw new Error(
      'privateKey must be base64 encoding exactly 64 bytes (seed ‖ publicKey)'
    );
  }
  const seed = secret.subarray(0, 32);
  const pub = secret.subarray(32);
  return createPrivateKey({
    key: {
      kty: 'OKP',
      crv: 'Ed25519',
      d: seed.toString('base64url'),
      x: pub.toString('base64url'),
    },
    format: 'jwk',
  });
}

/** Read the public identity record. Returns null when absent. */
export function readPublicFile(env = process.env) {
  const { publicFile } = identityPaths(env);
  if (!existsSync(publicFile)) return null;
  return JSON.parse(readFileSync(publicFile, 'utf8'));
}

/**
 * Read the private identity record — LOCAL SIGNING ONLY.
 * Returns null when absent. Never expose through a command or API.
 */
export function readPrivateFile(env = process.env) {
  const { privateFile } = identityPaths(env);
  if (!existsSync(privateFile)) return null;
  return JSON.parse(readFileSync(privateFile, 'utf8'));
}

export function writePublicFile(env, publicIdentity) {
  const { identityDir, publicFile } = identityPaths(env);
  mkdirSync(identityDir, { recursive: true });
  writeFileSync(publicFile, JSON.stringify(publicIdentity, null, 2));
  return publicFile;
}

export function writePrivateFile(env, privateRecord) {
  const { identityDir, privateFile } = identityPaths(env);
  mkdirSync(identityDir, { recursive: true });
  writeFileSync(privateFile, JSON.stringify(privateRecord, null, 2));
  try {
    chmodSync(privateFile, 0o600); // POSIX only; harmless on Windows
  } catch {
    // chmod unsupported on some filesystems — file stays private by
    // user-profile isolation.
  }
  return privateFile;
}
