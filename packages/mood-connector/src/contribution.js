/**
 * Contribution Object v0.1.
 *
 * This is the connector's ONLY output toward the network: metadata that
 * says "this agent, through this connector, made a contribution at this
 * time."
 *
 * What it is NOT — by design:
 *   - NOT reward
 *   - NOT token accounting
 *   - NOT a claim of quality or value
 *
 * It is only: verifiable contribution metadata. `proof` is "pending"
 * until the MOOD network's snapshot agreement says otherwise. The
 * connector never signs, never scores, and never pays anything.
 */

import { createHash } from 'crypto';

export const CONTRIBUTION_TYPE = 'agent_contribution';
export const PROOF_PENDING = 'pending';

/**
 * Build a Contribution Object v0.1 for an agent acting through a
 * connector. `agent` and `connector` are ID strings
 * ("agent:mood:...", "connector:mood:..."); `timestamp` defaults to
 * now (ISO 8601) and may be injected for deterministic records.
 */
export function createContributionRecord({
  agent,
  connector,
  timestamp = new Date().toISOString(),
}) {
  if (!agent || !connector) {
    throw new Error('a contribution requires an agent id and a connector id');
  }
  const id = 'contribution:mood:' + createHash('sha256')
    .update(`${agent}|${connector}|${timestamp}`)
    .digest('hex')
    .slice(0, 24);
  return {
    id,
    type: CONTRIBUTION_TYPE,
    agent,
    connector,
    timestamp,
    proof: PROOF_PENDING,
  };
}

/** Required fields and their expected kinds, for validateContributionRecord. */
const REQUIRED_FIELDS = [
  ['id', 'string'],
  ['type', 'string'],
  ['agent', 'string'],
  ['connector', 'string'],
  ['timestamp', 'string'],
  ['proof', 'string'],
];

/**
 * Structural validation of a Contribution Object v0.1.
 * Returns { valid: boolean, errors: string[] } — never throws.
 */
export function validateContributionRecord(record) {
  const errors = [];
  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['record must be an object'] };
  }
  for (const [field, kind] of REQUIRED_FIELDS) {
    const value = record[field];
    if (value === undefined || value === null || value === '') {
      errors.push(`missing field: ${field}`);
    } else if (typeof value !== kind) {
      errors.push(`field ${field} must be a ${kind}`);
    }
  }
  if (record.type !== undefined && record.type !== CONTRIBUTION_TYPE) {
    errors.push(`field type must be "${CONTRIBUTION_TYPE}"`);
  }
  if (record.proof !== undefined && typeof record.proof === 'string'
      && record.proof !== PROOF_PENDING) {
    // v0.1 only knows "pending"; anything else belongs to a later version.
    errors.push(`unknown proof state "${record.proof}" — v0.1 only allows "${PROOF_PENDING}"`);
  }
  return { valid: errors.length === 0, errors };
}
