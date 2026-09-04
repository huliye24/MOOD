/**
 * MOOD Protocol Identity Alpha 002-B — serialization and format rules.
 *
 * The identity layer adds no hash engine and no canonicalization of its
 * own: canonicalize / sha256OfValue come from @mood/contribution-proof,
 * exactly like the object layer. One engine, one canonical form.
 *
 * Node ID format (reconciled with the deployed node runtime):
 *   mood:node:<64 hex>  =  sha256('1|' + networkId + '|' + publicKey)
 * The protocol keeps the deployed derivation — identity continuity beats
 * reinvention. A node that already ran `mood init` keeps its node ID.
 *
 * Public key encoding: base64, raw 32-byte Ed25519 key (the deployed
 * encoding — the same key renders identically in the node manifest and
 * in the protocol identity).
 *
 * Object hash format accepted by the signature engine:
 *   'sha256:<64 hex>'  (hashEvent form)  or a bare 64-hex string.
 * The digest an Alpha 001 object ID is derived from is 64 hex chars; the
 * ID is its first 24. Signatures cover all 64 — never the truncation.
 */

import { canonicalize, sha256Hex, sha256OfValue } from '@mood/contribution-proof';

export const IDENTITY_VERSION = 'alpha-002';
export const ALGORITHM = 'ed25519';
export const KEYPAIR_VERSION = '1';
export const DEFAULT_NETWORK_ID = 'mood-testnet-001';

const NODE_ID_PATTERN = /^mood:node:[0-9a-f]{64}$/;
const DIGEST_PATTERN = /^[0-9a-f]{64}$/;

/** Derive the node ID from a base64 raw public key — the deployed formula. */
export function deriveNodeId(publicKey, networkId = DEFAULT_NETWORK_ID) {
  if (typeof publicKey !== 'string' || publicKey.length === 0) {
    throw new TypeError('publicKey is required');
  }
  const input = [KEYPAIR_VERSION, networkId, publicKey].join('|');
  return 'mood:node:' + sha256Hex(input);
}

export function isValidNodeId(nodeId) {
  return typeof nodeId === 'string' && NODE_ID_PATTERN.test(nodeId);
}

export function isValidPublicKey(publicKey) {
  return isValidBase64Bytes(publicKey, 32);
}

/**
 * The private record stores 64 bytes: 32-byte seed ‖ 32-byte public key
 * (the shape every MOOD client since alpha writes — tweetnacl-compatible).
 */
export function isValidPrivateKey(privateKey) {
  return isValidBase64Bytes(privateKey, 64);
}

function isValidBase64Bytes(value, byteLength) {
  if (typeof value !== 'string') return false;
  const bytes = Buffer.from(value, 'base64');
  return bytes.length === byteLength && bytes.toString('base64') === value;
}

/**
 * Normalize an object hash to a bare 64-hex digest.
 * Accepts 'sha256:<64hex>' (hashEvent form) or a bare 64-hex string.
 * Rejects everything else — including the truncated 24-hex object ID.
 */
export function normalizeObjectHash(objectHash) {
  if (typeof objectHash !== 'string') {
    throw new TypeError('objectHash must be a string');
  }
  const hex = objectHash.startsWith('sha256:')
    ? objectHash.slice('sha256:'.length)
    : objectHash;
  if (!DIGEST_PATTERN.test(hex)) {
    throw new Error(
      "expected a 256-bit canonical object digest ('sha256:<64hex>' or 64 hex chars) — " +
        `got '${objectHash.slice(0, 40)}'. ` +
        'Sign the object content digest, never a database record, and never the truncated object ID.'
    );
  }
  return hex;
}

/**
 * The full 256-bit digest of any canonical value — the same engine and
 * preimage style the object layer uses for object IDs. A signer calls
 * this with the object's content (protocol-object's objectContent());
 * the object ID is the first 24 hex chars of the same digest.
 */
export function contentDigest(value) {
  return 'sha256:' + sha256OfValue(value);
}

/** Canonical JSON of an identity (or any value) — the shared wire format. */
export function canonicalIdentity(value) {
  return canonicalize(value);
}

/**
 * Validate a public identity record — the propagatable shape.
 * Throws with every reason on failure; returns true on success.
 */
export function validatePublicIdentity(identity) {
  if (!identity || typeof identity !== 'object') {
    throw new TypeError('identity record is required');
  }
  const errors = [];
  if (!isValidNodeId(identity.nodeId)) {
    errors.push('nodeId must match mood:node:<64 hex>');
  }
  if (!isValidPublicKey(identity.publicKey)) {
    errors.push('publicKey must be base64 encoding exactly 32 bytes');
  }
  if (identity.algorithm !== ALGORITHM) {
    errors.push(`algorithm must be '${ALGORITHM}'`);
  }
  if (
    typeof identity.createdAt !== 'string' ||
    Number.isNaN(Date.parse(identity.createdAt))
  ) {
    errors.push('createdAt must be an ISO-8601 timestamp string');
  }
  // When the record names its network, the node ID must actually derive
  // from the public key — a swapped key wearing a stolen node ID is
  // tampering, caught at load time.
  if (
    !errors.length &&
    typeof identity.networkId === 'string' &&
    identity.nodeId !== deriveNodeId(identity.publicKey, identity.networkId)
  ) {
    errors.push('nodeId does not derive from publicKey under networkId');
  }
  if (errors.length > 0) {
    throw new Error('invalid public identity: ' + errors.join('; '));
  }
  return true;
}
