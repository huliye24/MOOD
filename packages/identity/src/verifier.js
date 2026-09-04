/**
 * MOOD Protocol Identity Alpha 002-B — verification.
 *
 * Verification is a predicate: malformed input returns false, never a
 * throw. Any node can verify a signature with nothing but the signer's
 * public identity — no issuer contact, no central server. That is the
 * verification flow the accepted Alpha 002-A design froze.
 *
 * Two-mode rule (identity-layer.md): unsigned Alpha 001 objects stay
 * valid forever — absence of a signature is not an error. This module
 * only answers, for objects that DO carry a signature: is it genuine?
 */

import { verify as cryptoVerify } from 'crypto';
import { normalizeObjectHash } from './serializer.js';
import { publicKeyObject } from './key-manager.js';

/**
 * Verify a signature over a canonical object hash.
 *
 * @param {string} objectHash  'sha256:<64hex>' or a bare 64-hex digest
 * @param {string} signature   base64 64-byte Ed25519 signature
 * @param {string} publicKey   base64 raw 32-byte Ed25519 public key
 * @returns {boolean}          true only for a genuine signature
 */
export function verifyObjectSignature(objectHash, signature, publicKey) {
  try {
    const hex = normalizeObjectHash(objectHash);
    const digest = Buffer.from(hex, 'hex');
    const sig = Buffer.from(signature, 'base64');
    if (sig.length !== 64) return false;
    const key = publicKeyObject(publicKey);
    return cryptoVerify(null, digest, key, sig);
  } catch {
    return false;
  }
}
