/**
 * /node routes — node status and lifecycle.
 *
 *   GET  /node/status   identity · network · protocol · status · epoch
 *   POST /node/start    start the node daemon (idempotent)
 *   POST /node/stop     stop the node daemon (idempotent)
 *
 * Lifecycle goes through the canonical `mood start` / `mood stop` (see
 * src/control.js) — the API never reimplements daemon management.
 */

import { Router } from 'express';
import { loadNodeStatus, formatEpoch } from '../state.js';
import { startNode, stopNode } from '../control.js';
import { fail } from '../errors.js';

const router = Router();

router.get('/status', (req, res) => {
  const s = loadNodeStatus();
  if (!s) {
    fail(res, 409, 'NOT_INITIALIZED', 'Node not initialized — run `mood init` on this machine first');
    return;
  }
  res.json({
    nodeId: s.nodeId,
    network: s.network,
    protocol: 'v' + s.protocolVersion,
    status: s.status.toLowerCase(),
    epoch: formatEpoch(s.epochNumber),
  });
});

router.post('/start', async (req, res) => {
  try {
    const result = await startNode();
    res.json(result);
  } catch (err) {
    if (err.code === 'NOT_INITIALIZED') {
      fail(res, 409, 'NOT_INITIALIZED', 'Node not initialized — run `mood init` on this machine first');
      return;
    }
    fail(res, 500, 'START_FAILED', err.message);
  }
});

router.post('/stop', async (req, res) => {
  try {
    const result = await stopNode();
    res.json(result);
  } catch (err) {
    if (err.code === 'NOT_INITIALIZED') {
      fail(res, 409, 'NOT_INITIALIZED', 'Node not initialized — run `mood init` on this machine first');
      return;
    }
    fail(res, 500, 'STOP_FAILED', err.message);
  }
});

export default router;
