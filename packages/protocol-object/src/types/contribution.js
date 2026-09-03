/**
 * Protocol Object Alpha 001 — the contribution payload type.
 *
 * A contribution ProtocolObject answers "how does the network store and
 * verify this contribution?" — it WRAPS a ContributionProof, it never
 * re-implements one. The payload is four references into the proof layer:
 *
 *   eventId    which ContributionEvent the contribution was
 *   proofId    which ContributionProof attests it
 *   eventHash  the hash the proof binds (the object's tamper anchor)
 *   algorithm  which algorithm produced that hash (SHA-256, unchanged)
 *
 * No event content is copied. No hashing is redone. If the proof layer
 * changes how it proves, this payload still points at whatever it
 * produced — reference, not duplication.
 */

import {
  PROOF_ALGORITHM,
  EVENT_ID_PATTERN,
  PROOF_ID_PATTERN,
  EVENT_HASH_PATTERN,
  validateProofShape,
} from '@mood/contribution-proof';
import {
  CONTRIBUTION_PAYLOAD_KEYS,
} from '../schema.js';

const fail = (errors, message) => {
  errors.push(message);
  return errors;
};

/**
 * Build a contribution payload from a stored ContributionProof.
 *
 * Accepts only a structurally valid proof (validateProofShape — the proof
 * layer's own shape check, imported, not re-implemented) and extracts
 * exactly the four reference fields.
 *
 * @throws {Error} code INVALID_CONTRIBUTION_PROOF when the proof's shape
 *                 is invalid — an object must never wrap a malformed proof.
 */
export function buildContributionPayload(proof) {
  const shape = validateProofShape(proof);
  if (!shape.valid) {
    const err = new Error(
      `cannot build a contribution object from an invalid ContributionProof: ${shape.errors.join('; ')}`
    );
    err.code = 'INVALID_CONTRIBUTION_PROOF';
    err.errors = shape.errors;
    throw err;
  }
  return {
    eventId: proof.eventId,
    proofId: proof.proofId,
    eventHash: proof.eventHash,
    algorithm: proof.algorithm,
  };
}

/**
 * Validate a contribution payload against the v0.1 payload schema:
 * exact key set, exact ID/hash patterns, exact algorithm.
 *
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateContributionPayload(payload) {
  const errors = [];
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, errors: fail(errors, 'payload must be an object') };
  }

  const keys = Object.keys(payload).sort();
  const expected = [...CONTRIBUTION_PAYLOAD_KEYS].sort();
  if (keys.length !== expected.length || keys.some((k, i) => k !== expected[i])) {
    return {
      valid: false,
      errors: fail(
        errors,
        `payload must contain exactly ${expected.join(', ')} — got ${keys.join(', ') || '(empty)'}`
      ),
    };
  }

  if (!EVENT_ID_PATTERN.test(payload.eventId)) {
    fail(errors, `payload.eventId must match event:mood:<24 hex> — got ${payload.eventId}`);
  }
  if (!PROOF_ID_PATTERN.test(payload.proofId)) {
    fail(errors, `payload.proofId must match proof:mood:<24 hex> — got ${payload.proofId}`);
  }
  if (!EVENT_HASH_PATTERN.test(payload.eventHash)) {
    fail(errors, `payload.eventHash must match sha256:<64 hex> — got ${payload.eventHash}`);
  }
  if (payload.algorithm !== PROOF_ALGORITHM) {
    fail(errors, `payload.algorithm must be ${PROOF_ALGORITHM} — got ${payload.algorithm}`);
  }

  return { valid: errors.length === 0, errors };
}
