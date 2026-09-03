/**
 * /identity — the PUBLIC side of the node identity.
 *
 * Returns exactly: nodeId, publicKey, organization.
 *
 * The private key is not "hidden" here — it is never read. The API
 * process does not open identity/private.json at all (see src/state.js),
 * so no bug in this layer can leak what it never holds.
 */

import { Router } from 'express';
import { readIdentity } from '../state.js';
import { fail } from '../errors.js';

const router = Router();

router.get('/', (req, res) => {
  const identity = readIdentity();
  if (!identity) {
    fail(res, 409, 'NOT_INITIALIZED', 'Node not initialized — run `mood init` on this machine first');
    return;
  }
  res.json({
    nodeId: identity.nodeId,
    publicKey: identity.publicKey,
    organization: identity.organizationId || null,
  });
});

export default router;
