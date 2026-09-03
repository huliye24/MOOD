/**
 * Protocol Object Alpha 001 — the ID engine.
 *
 * Object IDs are content-addressed: the ID is derived from the object's
 * own content (everything except the ID itself), canonicalized and hashed
 * with the SAME engine the proof layer uses. This package adds no hashing
 * of its own — it imports canonicalize / sha256OfValue from
 * @mood/contribution-proof, so there is exactly one canonicalization and
 * one hash algorithm in the protocol.
 *
 * The contract (same as events and proofs):
 *   - same content (any key order, any machine) → same object ID
 *   - one changed character anywhere → a different object ID
 *
 * Because `createdAt` is part of the preimage, minting the "same" object
 * at two different times yields two IDs — an object is one issuance at
 * one moment, not a class of copies.
 */

import { canonicalize, sha256OfValue } from '@mood/contribution-proof';

/** The content an object ID is derived over — the object minus its own id. */
export function objectContent({ type, version, createdAt, issuer, payload }) {
  return { type, version, createdAt, issuer, payload };
}

/**
 * Derive the content-addressed object ID.
 *
 * @param {object} content  {type, version, createdAt, issuer, payload}
 * @returns {string}        `object:mood:<24 hex>`
 */
export function deriveObjectId(content) {
  return 'object:mood:' + sha256OfValue(objectContent(content)).slice(0, 24);
}

/** Canonical JSON of an object (or any value) — the shared wire format. */
export function canonicalObject(value) {
  return canonicalize(value);
}
