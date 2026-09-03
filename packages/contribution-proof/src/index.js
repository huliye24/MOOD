/**
 * @mood/contribution-proof — MOOD Contribution Proof Alpha 001
 *
 * The chain this package completes:
 *
 *   actor (human | ai_agent | organization)
 *     → ContributionEvent   "this happened"
 *     → ContributionProof   "and here is its hash"
 *     → node storage        ~/.mood/contributions/{events,proofs}/
 *     → (later) protocol object stream
 *
 * It is the recording layer of MOOD — the thing every future economic
 * model must stand on. It is not, and must not become, a reward system.
 */

// schema
export {
  EVENT_TYPE,
  ACTOR_TYPES,
  PROOF_ALGORITHM,
  EVENT_ID_PATTERN,
  PROOF_ID_PATTERN,
  EVENT_HASH_PATTERN,
  SECRET_PATTERNS,
} from './schema.js';

// hash engine
export { canonicalize, sha256Hex, sha256OfValue, hashEvent } from './hash.js';

// event + actor
export { createContributionEvent, deriveActorId } from './event.js';

// proof
export { createProof } from './proof.js';

// validation
export {
  validateEventContent,
  validateEvent,
  validateProofShape,
  validateProof,
  containsSecret,
} from './validator.js';

// node-local storage
export {
  resolveUserHome,
  contributionPaths,
  initContributionStorage,
  saveContribution,
  listContributions,
  findContribution,
  verifyStoredContributions,
} from './storage.js';
