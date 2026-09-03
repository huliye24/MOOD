/**
 * /connector routes — the AI Agent contribution connector surface.
 *
 *   GET  /connector/status   connector state + registered agents
 *
 * The connector is the bridge between AI Agent environments (Claude
 * Code, Codex, Cursor, …) and the MOOD network. This route reports
 * only what the connector records locally: agent names and types.
 *
 * Do not expose: credentials, API keys, private information — and by
 * construction we cannot: @mood/connector never stores them.
 *
 * This route is independent of node identity: it answers whether the
 * connector layer is active even before `mood init` exists.
 */

import { Router } from 'express';
import { readConnectorRecord } from '@mood/connector';

const router = Router();

router.get('/status', (req, res) => {
  const record = readConnectorRecord();
  if (!record) {
    res.json({ connector: 'inactive', agents: [] });
    return;
  }
  res.json({
    connector: 'active',
    agents: (record.agents || []).map((a) => ({ name: a.name, type: a.type })),
  });
});

export default router;
