/**
 * `mood identity [show]` — display the PUBLIC side of the node identity.
 *
 * The private key is never displayed, never logged, never exported by
 * this command. It lives in ~/.mood/identity/private.json and is read
 * only by the local daemon and invitation signing.
 */

import { emit, renderIdentityScreen } from '../ui/terminal.js';
import { isInitialized, readIdentity } from '../state.js';

export function run(args, flags) {
  const sub = (args[0] || 'show').toLowerCase();

  if (sub !== 'show') {
    throw new Error(`unknown identity subcommand: ${sub} (try \`mood identity show\`)`);
  }

  if (!isInitialized()) {
    throw new Error('Node not initialized — run `mood init` first');
  }

  const id = readIdentity();

  if (flags.json) {
    emit({
      nodeId: id.nodeId,
      publicKey: id.publicKey,
      algorithm: id.algorithm,
      networkId: id.networkId,
      organizationId: id.organizationId,
      createdAt: id.createdAt,
      clientVersion: id.clientVersion,
    }, '', flags);
    return;
  }

  process.stdout.write(renderIdentityScreen(id));
}

export default { run };
