/**
 * `mood protocol` — show the active MOOD protocol description.
 *
 * Static information: version, network mode, and consensus rule of the
 * alpha. This command is the protocol's "machine-readable face" for
 * agents that want to know what network they are talking to.
 */

import { emit, renderProtocolScreen } from '../ui/terminal.js';
import {
  PROTOCOL_VERSION,
  CLI_VERSION,
  NETWORK_MODE,
  CONSENSUS_MODE,
  NETWORK_ID,
} from '../config/defaults.js';

export function run(args, flags) {
  const data = {
    version: PROTOCOL_VERSION,
    mode: NETWORK_MODE,
    consensus: CONSENSUS_MODE,
    networkId: NETWORK_ID,
    clientVersion: CLI_VERSION,
    phase: 'zero',
    scope: {
      token: false,
      wallet: false,
      financial: false,
      mining: false,
      staking: false,
      governance: false,
    },
  };

  if (flags.json) {
    emit(data, '', flags);
    return;
  }

  process.stdout.write(renderProtocolScreen(data));
}

export default { run };
