/**
 * /peers — the peers this node currently sees.
 *
 * Read from the daemon's heartbeat state (~/.mood/state.json,
 * connectedPeers). An empty list is an honest answer: the node runs
 * (and snapshots) even with zero peers, like a full node offline.
 */

import { Router } from 'express';
import { readIdentity, readState } from '../state.js';
import { fail } from '../errors.js';

const router = Router();

router.get('/', (req, res) => {
  const identity = readIdentity();
  if (!identity) {
    fail(res, 409, 'NOT_INITIALIZED', 'Node not initialized — run `mood init` on this machine first');
    return;
  }

  const state = readState();
  const peers = Array.isArray(state.connectedPeers) ? state.connectedPeers : [];
  res.json({ peers });
});

export default router;
