/**
 * @mood/protocol-object — MOOD Protocol Object Alpha 001
 *
 * The chain this package completes:
 *
 *   ContributionProof   "why this contribution happened"  (@mood/contribution-proof)
 *     → ProtocolObject  "how the network stores and verifies it"  (this package)
 *       → node storage  ~/.mood/objects/<type>/
 *       → (next phase)  Node A → Relay → Node B, re-verified on arrival
 *
 * A protocol object is content-addressed: its ID is the SHA-256 of its
 * own content, so the same object is the same ID on every node — the
 * first MOOD primitive built to be understood by the NETWORK, not only
 * by the node that created it.
 *
 * It is not, and must not become, a token, a reward, a reputation score,
 * or a governance instrument. Phase Zero is unchanged.
 */

// schema
export {
  OBJECT_TYPES,
  OBJECT_VERSION,
  OBJECT_KEYS,
  OBJECT_ID_PATTERN,
  ISSUER_KEYS,
  NODE_ID_PATTERN,
  ISO_TIMESTAMP_PATTERN,
  CONTRIBUTION_PAYLOAD_KEYS,
  DEFAULT_OBJECT_TYPE,
} from './schema.js';

// ID engine (hashing itself lives in @mood/contribution-proof)
export { objectContent, deriveObjectId, canonicalObject } from './serializer.js';

// creation
export { createProtocolObject } from './object.js';

// the contribution payload type
export { buildContributionPayload, validateContributionPayload } from './types/contribution.js';

// validation
export { validateProtocolObject } from './validator.js';

// contribution linkage (integrity's local cross-check)
export { verifyObjectLinkage } from './linkage.js';

// node-local storage
export {
  filenameFor,
  objectPaths,
  initObjectStorage,
  storeObject,
  rebuildIndex,
  listObjects,
  findObject,
  readObjectMetadata,
  verifyStoredObjects,
} from './storage.js';

// synchronization interface (transport is next phase)
export { ObjectSyncAdapter, SYNC_TRANSPORT } from './sync.js';
