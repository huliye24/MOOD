/**
 * Dashboard routes (Node Deployment Alpha 001, Phase 6–7).
 *
 *   GET  /status        dashboard summary: node, uptime, epoch, peers, counts
 *   GET  /metrics       daemon counters (state.json.metrics) + API process
 *   GET  /events        tail of the daemon JSON logs (?source= ?limit=)
 *   GET  /contribution  contribution/proof counts; reputation honestly
 *                       reported as "not_implemented"
 *
 * These are operational monitoring views over the same ~/.mood/ files the
 * daemon writes — read-only, no node logic. Unlike /node/status (the
 * deterministic agent surface), dashboard values are live reads: uptime,
 * lastHeartbeat and metrics change between requests by design.
 *
 * Phase Zero honesty: reputation, tokens, staking, wallets do not exist.
 * The dashboard reports `reputation: "not_implemented"` — the only honest
 * answer — and serves no token-like data anywhere.
 */

import { Router } from 'express';
import { listContributions } from '@mood/contribution-proof';
import {
  loadNodeStatus,
  formatEpoch,
  readState,
  readLogTail,
  countSnapshots,
} from '../state.js';
import { fail } from '../errors.js';

const LOG_SOURCES = new Set(['node', 'error', 'heartbeat']);

export function createDashboardRoutes({ apiStartedAtMs, version } = {}) {
  const router = Router();
  const startedAt = apiStartedAtMs || Date.now();

  const apiMetrics = () => ({
    pid: process.pid,
    uptimeSeconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
    memoryRssBytes: process.memoryUsage().rss,
    version: version || null,
  });

  // GET /status — the one-screen dashboard summary.
  router.get('/status', (req, res) => {
    const s = loadNodeStatus();
    if (!s) {
      fail(res, 409, 'NOT_INITIALIZED', 'Node not initialized — run `mood init` on this machine first');
      return;
    }
    const state = readState();
    const running = s.status === 'Running';
    const uptimeSeconds = running && state.startedAt
      ? Math.max(0, Math.round((Date.now() - new Date(state.startedAt).getTime()) / 1000))
      : null;

    res.json({
      nodeId: s.nodeId,
      network: s.network,
      protocol: 'v' + s.protocolVersion,
      status: s.status.toLowerCase(),
      uptimeSeconds,
      epoch: formatEpoch(s.epochNumber),
      connectedPeers: (state.connectedPeers || []).length,
      knownObjects: state.knownObjects || 0,
      contributions: contributionCount(),
      snapshots: countSnapshots(),
      relay: state.relay || 'Disconnected',
      lastHeartbeat: state.lastHeartbeat || null,
      simulation: state.simulation === true,
      timeScale: state.timeScale || 1,
    });
  });

  // GET /metrics — daemon counters + this API process.
  router.get('/metrics', (req, res) => {
    const s = loadNodeStatus();
    if (!s) {
      fail(res, 409, 'NOT_INITIALIZED', 'Node not initialized — run `mood init` on this machine first');
      return;
    }
    const state = readState();
    res.json({
      node: state.metrics || null, // null until the daemon has run once
      api: apiMetrics(),
    });
  });

  // GET /events — tail of a daemon JSON log.
  router.get('/events', (req, res) => {
    const source = typeof req.query.source === 'string' ? req.query.source : 'node';
    if (!LOG_SOURCES.has(source)) {
      fail(res, 400, 'INVALID_REQUEST', `Unknown source: ${source} — use node, error, or heartbeat`);
      return;
    }
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : 50;

    const events = readLogTail({ source, limit });
    res.json({ source, count: events.length, events });
  });

  // GET /contribution — contribution counts, honestly framed.
  router.get('/contribution', (req, res) => {
    const metrics = readState().metrics || {};
    const { events, proofs } = contributionCounts();
    res.json({
      events,
      proofs,
      verified: typeof metrics.proofsVerified === 'number' ? metrics.proofsVerified : null,
      invalid: typeof metrics.proofsInvalid === 'number' ? metrics.proofsInvalid : null,
      reputation: 'not_implemented',
    });
  });

  return router;
}

/** Contribution record count for /status (events are the unit). */
function contributionCount() {
  const { events } = contributionCounts();
  return events;
}

function contributionCounts() {
  try {
    const items = listContributions();
    return {
      events: items.filter((item) => item.event).length,
      proofs: items.filter((item) => item.proof).length,
    };
  } catch {
    return { events: 0, proofs: 0 };
  }
}

export default createDashboardRoutes;
