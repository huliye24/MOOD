/**
 * /contributions routes — the contribution proof surface.
 *
 *   GET  /contributions         what this node recorded (events + proofs)
 *   POST /contributions/verify  verify a submitted ContributionProof
 *                               against the stored ContributionEvent
 *
 * A ContributionProof attests one thing: the contribution event existed
 * and was not modified after recording. Not a reward, not a score, not
 * token accounting — Phase Zero is unchanged.
 *
 * Security posture:
 *   - records are public by design (that is the point of a proof), but
 *     anything that trips the credential guard is never served: a
 *     hand-dropped file with secret-shaped content is refused, not echoed
 *   - a submitted proof is schema-bound (exact key set, pattern-checked
 *     fields) — nothing can ride along inside one
 *   - a failed verification is a result (200 + verified:false), not an
 *     API error; only malformed requests get the 400 envelope
 *
 * Like /connector, this layer is independent of node identity: it
 * answers whether work was recorded even before `mood init` exists.
 */

import { Router } from 'express';
import {
  containsSecret,
  findContribution,
  listContributions,
  validateProof,
  validateProofShape,
} from '@mood/contribution-proof';
import { fail } from '../errors.js';

const router = Router();

/**
 * One record, event + proof — or a refusal if it trips the credential
 * guard. Refusals keep the item visible (a gap is information) while
 * serving none of its content.
 */
function servableItem(item) {
  if (containsSecret(JSON.stringify(item))) {
    return {
      event: null,
      proof: null,
      refused: 'credential-shaped content — this record is not served',
    };
  }
  return item;
}

router.get('/', (req, res) => {
  const items = listContributions();
  res.json({ contributions: items.map(servableItem) });
});

router.post('/verify', (req, res) => {
  const proof = req.body;
  if (!proof || typeof proof !== 'object' || Array.isArray(proof)) {
    fail(res, 400, 'INVALID_REQUEST', 'Request body must be a ContributionProof object');
    return;
  }

  // The proof names its event; verifying "the event existed and was not
  // modified" needs that event. Shape errors travel with the answer so
  // an agent learns why, not just that, verification failed.
  const shape = validateProofShape(proof);
  const found = typeof proof.eventId === 'string'
    ? findContribution({ eventId: proof.eventId })
    : null;
  const event = found && found.event ? found.event : null;

  if (!event) {
    res.json({
      verified: false,
      errors: [
        ...shape.errors,
        `no ContributionEvent stored on this node for ${proof.eventId || '(missing eventId)'}`,
      ],
    });
    return;
  }

  const { valid, errors } = validateProof(proof, event);
  res.json(valid ? { verified: true } : { verified: false, errors });
});

export default router;
