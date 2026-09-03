/**
 * /objects routes — the protocol object surface.
 *
 *   GET  /objects          the protocol objects stored on this node
 *   GET  /objects/:id      one object, with its verification status
 *   POST /objects/verify   verify a submitted ProtocolObject — ANY node's
 *                          object, local or remote: this is network
 *                          verification minus the transport, because an
 *                          object's ID recomputes identically everywhere
 *
 * A protocol object is how the network stores a contribution: the ID is
 * the SHA-256 of the object's own content, so the same object is the
 * same ID on every node. Not a token, not a score — Phase Zero is
 * unchanged.
 *
 * Verification has two independent levels, and the answer reports both:
 *   integrity  the ID matches the content (validateProtocolObject)
 *   linkage    the referenced ContributionProof is stored HERE with the
 *              same ID and hash; absent is a note (other nodes hold
 *              other nodes' objects), contradiction is a failure
 *
 * Creation stays in the CLI (`mood object create`): the API serves and
 * verifies, exactly like /contributions.
 *
 * Security posture mirrors /contributions:
 *   - objects are public by design, but anything that trips the
 *     credential guard is refused, not echoed
 *   - a submitted object is schema-bound (exact key set, pattern-checked
 *     fields, recomputed ID) — nothing can ride along inside one
 *   - a failed verification is a result (200 + verified:false), not an
 *     API error; only malformed requests get the 400 envelope
 */

import { Router } from 'express';
import { containsSecret } from '@mood/contribution-proof';
import {
  listObjects,
  findObject,
  validateProtocolObject,
  verifyObjectLinkage,
} from '@mood/protocol-object';
import { fail } from '../errors.js';

const router = Router();

/**
 * One object as a summary — or a refusal if it trips the credential
 * guard. Refusals keep the item visible while serving none of it.
 */
function servableObject(object) {
  if (containsSecret(JSON.stringify(object))) {
    return {
      id: object && typeof object.id === 'string' ? object.id : null,
      type: null,
      verified: false,
      refused: 'credential-shaped content — this object is not served',
    };
  }
  return {
    id: object.id,
    type: object.type,
    verified: validateProtocolObject(object).valid,
  };
}

router.get('/', (req, res) => {
  res.json({ objects: listObjects().map(servableObject) });
});

router.get('/:id', (req, res) => {
  const object = findObject({ id: req.params.id });
  if (!object) {
    fail(res, 404, 'NOT_FOUND', `No protocol object stored for ${req.params.id}`);
    return;
  }
  if (containsSecret(JSON.stringify(object))) {
    fail(res, 404, 'NOT_FOUND', 'This object is not served (credential-shaped content)');
    return;
  }
  const integrity = validateProtocolObject(object);
  res.json({
    id: object.id,
    type: object.type,
    verified: integrity.valid,
    object,
  });
});

router.post('/verify', (req, res) => {
  const object = req.body;
  if (!object || typeof object !== 'object' || Array.isArray(object)) {
    fail(res, 400, 'INVALID_REQUEST', 'Request body must be a ProtocolObject');
    return;
  }

  const integrity = validateProtocolObject(object);
  const linkage = verifyObjectLinkage(object);
  const verified = integrity.valid && linkage.valid;

  res.json(verified
    ? { verified: true }
    : { verified: false, errors: [...integrity.errors, ...linkage.errors] });
});

export default router;
