/**
 * MOOD Protocol Identity Alpha 002-B — the signature engine.
 *
 * One rule, inherited from the accepted design:
 *
 *   Sign the object content. Never sign a database record.
 *
 * signObjectHash() signs a 256-bit canonical object digest — the same
 * digest an Alpha 001 object ID is derived from (the ID is its first 24
 * hex chars; the signature covers all 64). Anything that is not a
 * 256-bit digest is rejected before any cryptographic operation: the
 * API cannot be repurposed to sign arbitrary documents, rows, or
 * payloads.
 *
 * Ed25519 (RFC 8032) is deterministic — same key, same digest, same
 * signature bytes on every machine. Signatures are base64, 64 bytes.
 */

import { sign as cryptoSign } from 'crypto';
import { normalizeObjectHash } from './serializer.js';
import { privateKeyObject } from './key-manager.js';

/**
 * Sign a canonical object hash with this node's private key.
 *
 * @param {string} objectHash  'sha256:<64hex>' or a bare 64-hex digest
 * @param {string} privateKey  base64 64-byte secret key (seed ‖ public)
 * @returns {string}           base64 64-byte Ed25519 signature
 */
export function signObjectHash(objectHash, privateKey) {
  const hex = normalizeObjectHash(objectHash);
  const digest = Buffer.from(hex, 'hex');
  const key = privateKeyObject(privateKey);
  const signature = cryptoSign(null, digest, key); // Ed25519: no pre-hash
  return signature.toString('base64');
}
