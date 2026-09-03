/**
 * Protocol Object Alpha 001 — contribution linkage.
 *
 * Two independent levels of "verified", deliberately separate:
 *
 *   INTEGRITY  the object is well-formed and its ID still matches its
 *              content (validateProtocolObject — runs identically on
 *              every node, with or without any local data)
 *   LINKAGE    the contribution the object references really is stored
 *              on THIS node, with the same proof ID and hash
 *
 * Integrity is the protocol check. Linkage is a local cross-check: when
 * Node B receives an object from Node A it will NOT have Node A's
 * contribution records, so an absent record is a NOTE, not a failure —
 * the object still verifies on its own. A present record that CONTRADICTS
 * the object is a failure.
 */

import { findContribution } from '@mood/contribution-proof';

/**
 * Cross-check a contribution object against the contribution records
 * stored on this node.
 *
 * @param {object} object  a contribution ProtocolObject
 * @returns {{linked: boolean, valid: boolean, errors: string[], note: string|null}}
 */
export function verifyObjectLinkage(object, { env = process.env } = {}) {
  if (!object || object.type !== 'contribution' || !object.payload) {
    return {
      linked: false,
      valid: true,
      errors: [],
      note: 'not a contribution object — nothing to cross-check',
    };
  }

  const record = findContribution({ eventId: object.payload.eventId, env });
  if (!record || !record.proof) {
    return {
      linked: false,
      valid: true,
      errors: [],
      note: `no ContributionProof stored on this node for ${object.payload.eventId} — linkage not checked (the object still verifies on its own)`,
    };
  }

  const errors = [];
  if (record.proof.proofId !== object.payload.proofId) {
    errors.push(
      `payload.proofId mismatch: object records ${object.payload.proofId}, stored proof is ${record.proof.proofId}`
    );
  }
  if (record.proof.eventHash !== object.payload.eventHash) {
    errors.push(
      `payload.eventHash mismatch: object records ${object.payload.eventHash}, stored proof is ${record.proof.eventHash}`
    );
  }

  return { linked: true, valid: errors.length === 0, errors, note: null };
}
