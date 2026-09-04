/**
 * MOOD Protocol Identity Alpha 002-B — public API.
 *
 * Identity answers the Alpha 002 question — WHO created the object —
 * on top of the frozen Alpha 001 object layer, which answers WHAT the
 * object is. This package adds trust; it does not modify history.
 *
 * Public surface (top level):
 *   createIdentity(env, options)   adopt-or-generate this node's identity
 *   loadPublicIdentity(env)        read public.json (null when absent)
 *   exportPublicIdentity(identity) the 4-field propagatable projection
 *   signObjectHash(hash, priv)     sign a 256-bit canonical object digest
 *   verifyObjectSignature(...)     verify such a signature (predicate)
 *   contentDigest(value)           full 256-bit digest, shared hash engine
 *   deriveNodeId(publicKey, net)   the deployed mood:node:<64hex> formula
 *
 * Key-material accessors (generateKeypair, readPrivateFile,
 * writePrivateFile, privateKeyObject) live on the './key-manager'
 * subpath — for the local signing process only, never for re-export
 * through APIs.
 */

export {
  createIdentity,
  loadPublicIdentity,
  exportPublicIdentity,
} from './identity.js';
export { signObjectHash } from './signer.js';
export { verifyObjectSignature } from './verifier.js';
export {
  IDENTITY_VERSION,
  ALGORITHM,
  DEFAULT_NETWORK_ID,
  deriveNodeId,
  isValidNodeId,
  isValidPublicKey,
  normalizeObjectHash,
  contentDigest,
  canonicalIdentity,
  validatePublicIdentity,
} from './serializer.js';
export { identityPaths } from './key-manager.js';
