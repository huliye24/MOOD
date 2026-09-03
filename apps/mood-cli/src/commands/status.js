/**
 * `mood status` — node status snapshot.
 *
 * Aggregates identity, config, runtime state, and the latest snapshot
 * pointer into one screen (or one JSON envelope).
 */

import { emit, renderStatusScreen } from '../ui/terminal.js';
import { loadState } from '../state.js';

export function run(args, flags) {
  const s = loadState();

  if (flags.json) {
    emit({
      nodeId: s.nodeId,
      network: s.network,
      networkId: s.networkId,
      protocol: s.protocolVersion,
      status: s.status,
      peers: s.peers,
      epoch: s.epoch,
      digest: s.digest,
      agreement: s.agreement,
      startedAt: s.startedAt,
      pid: s.pid,
    }, '', flags);
    return;
  }

  process.stdout.write(renderStatusScreen(s));
}

export default { run };
