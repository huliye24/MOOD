/**
 * `mood init` — initialize the local MOOD node.
 *
 * Creates ~/.mood/ (identity/, config/, snapshots/, logs/) and generates
 * an Ed25519 node identity via the shared runtime. Idempotent: running
 * it again never regenerates an existing identity.
 */

import { emit, renderKeyValue, green, dim } from '../ui/terminal.js';
import { initIdentity, isInitialized, readIdentity } from '../state.js';
import { NETWORK_NAME } from '../config/defaults.js';

export function run(args, flags) {
  const result = initIdentity({
    organizationId: flags.org || undefined,
    organizationName: flags.orgName || undefined,
    organizationDomain: flags.orgDomain || undefined,
  });

  if (flags.json) {
    emit({
      created: result.created,
      nodeId: result.identity.nodeId,
      organizationId: result.identity.organizationId,
      home: result.paths.root,
    }, '', flags);
    return;
  }

  if (!result.created) {
    process.stdout.write(renderKeyValue('MOOD identity already exists.', [
      ['Node ID:', green(result.identity.nodeId)],
      ['Home:', dim(result.paths.root)],
      ['', ''],
      ['Note:', 'Run `mood status` to inspect the node.'],
    ]));
    return;
  }

  process.stdout.write(renderKeyValue('MOOD identity created.', [
    ['Node ID:', green(result.identity.nodeId)],
    ['Network:', NETWORK_NAME],
    ['Home:', dim(result.paths.root)],
  ]));

  process.stdout.write('\n  Your node is ready.\n\n');
  process.stdout.write(dim('  Next: `mood start` to run the node, `mood invite create --email <addr>`\n'));
  process.stdout.write(dim('        to invite a peer, or `mood status --json` for machines.\n\n'));
}

export default { run };
