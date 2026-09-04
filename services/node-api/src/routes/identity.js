/**
 * /identity — the PUBLIC side of the node identity.
 *
 * Serves the Alpha 002 protocol identity (identity/public.json) when
 * active, falling back to the legacy runtime record (identity/node.json)
 * for nodes not yet upgraded. Either way the response carries public
 * material only: nodeId, publicKey, algorithm, networkId, createdAt,
 * organization.
 *
 * The private key is not "hidden" here — it is never read. The API
 * process does not open identity/private.json at all (see src/state.js
 * and @mood/identity's public surface), so no bug in this layer can
 * leak what it never holds.
 */

import { Router } from 'express';
import { loadPublicIdentity } from '@mood/identity';
import { readIdentity } from '../state.js';
import { fail } from '../errors.js';

const router = Router();

router.get('/', (req, res) => {
  // Protocol identity of record — validates nodeId↔publicKey consistency
  // and rejects tampered records instead of serving them.
  let protocol = null;
  try {
    protocol = loadPublicIdentity();
  } catch (err) {
    fail(res, 500, 'IDENTITY_INVALID', `identity/public.json is not a valid public identity: ${err.message}`);
    return;
  }

  const legacy = readIdentity();
  const record = protocol || legacy;
  if (!record) {
    fail(res, 409, 'NOT_INITIALIZED', 'Node not initialized — run `mood init` on this machine first');
    return;
  }

  res.json({
    nodeId: record.nodeId,
    publicKey: record.publicKey,
    algorithm: record.algorithm,
    networkId: record.networkId,
    createdAt: record.createdAt,
    ...(protocol ? { identityVersion: protocol.identityVersion } : {}),
    organization: legacy ? (legacy.organizationId || null) : null,
  });
});

export default router;
