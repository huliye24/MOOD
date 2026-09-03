/**
 * `mood peers` — list the peers this node knows about.
 *
 * Two sources, clearly separated:
 *   - connected peers   (observed live by the daemon via the relay)
 *   - bootstrap peers   (static configuration from ~/.mood/config/)
 *
 * The alpha network has no peer discovery beyond the relay: a node that
 * is not running shows only its configured bootstrap peers.
 */

import { emit, renderPeersScreen, dim } from '../ui/terminal.js';
import { readConfig, readState, loadState } from '../state.js';
import { GENESIS_PEERS } from '../config/defaults.js';

export function run(args, flags) {
  const config = readConfig();
  const state = readState();
  const live = loadState();

  const connected = (state.connectedPeers || []).map((nodeId) => ({ nodeId, connected: true }));
  const bootstrap = (config?.bootstrapPeers || GENESIS_PEERS).map((p) => ({ ...p, connected: false }));

  // Connected peers first, then the bootstrap roster (deduped by nodeId).
  const seen = new Set(connected.map((p) => p.nodeId));
  const peers = [...connected, ...bootstrap.filter((p) => !seen.has(p.nodeId))];

  if (flags.json) {
    emit({
      connected: connected.length,
      peers: peers.map((p) => ({
        alias: p.alias || null,
        nodeId: p.nodeId,
        role: p.role || null,
        connected: Boolean(p.connected),
      })),
      running: live.status === 'Running',
    }, '', flags);
    return;
  }

  process.stdout.write(renderPeersScreen(peers));

  if (live.status !== 'Running') {
    process.stdout.write(dim('  (node not running — showing configured bootstrap peers only)\n\n'));
  } else if (connected.length === 0) {
    process.stdout.write(dim('  (daemon running but no peers observed on the relay yet)\n\n'));
  }
}

export default { run };
