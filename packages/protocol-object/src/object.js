/**
 * Protocol Object Alpha 001 — creation.
 *
 * `createProtocolObject` mints one object:
 *
 *   { id, type, version, createdAt, issuer, payload }
 *     id         object:mood:<24 hex> — derived from the content below
 *     type       'contribution' (the only type in Alpha 001)
 *     version    '0.1'
 *     createdAt  when this object was issued, UTC ISO 8601
 *     issuer     { nodeId } — WHICH node issued the object
 *     payload    the type's payload (contribution: four references into
 *                the proof layer — eventId, proofId, eventHash, algorithm)
 *
 * The object does not duplicate proof logic: hashing comes from
 * @mood/contribution-proof, the payload is built by ./types/contribution.js
 * from a real ContributionProof, and the issuer is a reference to the
 * node identity minted by @mood/node-runtime (used by the CLI).
 *
 * Creation validates before it mints — an invalid object can never exist.
 */

import {
  OBJECT_TYPES,
  OBJECT_VERSION,
  NODE_ID_PATTERN,
  DEFAULT_OBJECT_TYPE,
} from './schema.js';
import { deriveObjectId } from './serializer.js';
import { validateContributionPayload } from './types/contribution.js';
import { validateProtocolObject } from './validator.js';

/**
 * Create a ProtocolObject.
 *
 * @param {object} input
 * @param {string} input.type      object type (default: 'contribution')
 * @param {object} input.payload   the type's payload — for contributions,
 *                                 built by buildContributionPayload(proof)
 * @param {string} input.nodeId    issuer node ID (mood:node:<hex>)
 * @param {string} [input.now]     issuance time (UTC ISO 8601); default: now
 * @returns {object}               the validated ProtocolObject
 * @throws {Error} code INVALID_PROTOCOL_OBJECT with .errors when the input
 *                 cannot become a valid object
 */
export function createProtocolObject({ type = DEFAULT_OBJECT_TYPE, payload, nodeId, now } = {}) {
  const errors = [];

  if (!OBJECT_TYPES.includes(type)) {
    errors.push(`type must be one of ${OBJECT_TYPES.join(', ')} — got ${type}`);
  }
  if (typeof nodeId !== 'string' || !NODE_ID_PATTERN.test(nodeId)) {
    errors.push(`nodeId must match mood:node:<hex> — got ${nodeId}`);
  }

  const createdAt = now || new Date().toISOString();

  if (payload !== null && typeof payload === 'object' && !Array.isArray(payload)) {
    if (type === 'contribution') {
      const payloadCheck = validateContributionPayload(payload);
      if (!payloadCheck.valid) errors.push(...payloadCheck.errors);
    }
  } else {
    errors.push('payload must be an object');
  }

  if (errors.length > 0) {
    const err = new Error(`invalid protocol object input: ${errors.join('; ')}`);
    err.code = 'INVALID_PROTOCOL_OBJECT';
    err.errors = errors;
    throw err;
  }

  const content = {
    type,
    version: OBJECT_VERSION,
    createdAt,
    issuer: { nodeId },
    payload,
  };
  const object = { id: deriveObjectId(content), ...content };

  // The final gate: what was minted must itself validate — this is where
  // the credential guard fires on creation (and it can never be bypassed
  // by passing a pre-built payload, because validation is total).
  const check = validateProtocolObject(object);
  if (!check.valid) {
    const err = new Error(`invalid protocol object: ${check.errors.join('; ')}`);
    err.code = 'INVALID_PROTOCOL_OBJECT';
    err.errors = check.errors;
    throw err;
  }

  return object;
}
