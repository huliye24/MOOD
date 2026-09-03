/**
 * Contribution Proof Alpha 001 — ContributionProof creation.
 *
 * A proof is one small, portable claim:
 *
 *   "At createdAt, the event with ID eventId had SHA-256 hash eventHash."
 *
 * Anyone who later holds both the event and the proof can recompute the
 * hash and answer a single question: was the event modified after it was
 * recorded? Nothing more — no value judgment, no reward, no score.
 */

import { PROOF_ALGORITHM } from './schema.js';
import { sha256OfValue, hashEvent } from './hash.js';

/**
 * Create a ContributionProof v0.1 for a valid event.
 *
 * The proof ID derives from {eventId, eventHash, createdAt} — the same
 * proof, regenerated on any machine, is the same proof.
 *
 * `verified: true` on creation states only that the proof matched the
 * event at the moment it was minted. Verification afterwards is always
 * a recomputation — never trust the stored flag alone.
 */
export function createProof(event, createdAt) {
  if (!event || typeof event !== 'object' || typeof event.id !== 'string') {
    throw new Error('createProof requires a contribution event with an id');
  }
  if (typeof createdAt !== 'string' || createdAt.length === 0) {
    throw new Error('createProof requires a createdAt timestamp (UTC ISO 8601)');
  }
  const eventHash = hashEvent(event);
  const seed = { eventId: event.id, eventHash, createdAt };
  return {
    proofId: 'proof:mood:' + sha256OfValue(seed).slice(0, 24),
    eventId: event.id,
    eventHash,
    createdAt,
    algorithm: PROOF_ALGORITHM,
    verified: true,
  };
}
