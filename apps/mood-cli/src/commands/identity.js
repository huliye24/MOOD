/**
 * `mood identity <create|show>` — the Alpha 002 cryptographic identity.
 *
 * `create` activates this node's protocol identity: adopt an existing
 * key (`mood init` or an earlier `mood identity create`) or generate a
 * fresh one — one node, one key, never a silent rekey. It prints the
 * PUBLIC side only.
 * `show` displays the current identity (public side only), preferring
 * the protocol record (public.json) over the legacy runtime record
 * (node.json).
 *
 * The private key is never displayed, never logged, never exported by
 * this command. It lives in ~/.mood/identity/private.json and is read
 * only by the local daemon, invitation signing, and object signing.
 */

import { emit, renderIdentityScreen } from '../ui/terminal.js';
import { readIdentity } from '../state.js';
import {
  createIdentity,
  loadPublicIdentity,
  exportPublicIdentity,
} from '@mood/identity';

export function run(args, flags) {
  const sub = (args[0] || 'show').toLowerCase();

  if (sub === 'create') return create(flags);
  if (sub === 'show') return show(flags);

  throw new Error(`unknown identity subcommand: ${sub} (try \`mood identity create\` or \`mood identity show\`)`);
}

/**
 * Activate this node's protocol identity. The output is exactly the
 * propagatable public identity — no private material, ever.
 */
function create(flags) {
  const { status, identity, privateFile } = createIdentity();
  const exported = exportPublicIdentity(identity);

  if (flags.json) {
    // the public identity and nothing else — same shape any MOOD node
    // or third-party verifier consumes
    emit(exported, '', flags);
    return;
  }

  const lines = [
    '',
    status === 'adopted'
      ? '✓ Protocol identity activated (adopted the existing node key)'
      : '✓ Protocol identity created',
    '',
    `  Node ID:     ${exported.nodeId}`,
    `  Public Key:  ${exported.publicKey}`,
    `  Algorithm:   ${exported.algorithm}`,
    `  Created At:  ${exported.createdAt}`,
    '',
    `  Public identity:  ~/.mood/identity/public.json (safe to propagate)`,
    `  Private key:      ${privateFile} (node-local, never shared)`,
    '',
  ];
  process.stdout.write(lines.join('\n'));
}

/**
 * Show the current identity. The protocol record is the identity of
 * record; the legacy runtime record fills in organization info when
 * present. Errors when the node has no identity at all yet.
 */
function show(flags) {
  const protocol = loadPublicIdentity();
  const legacy = readIdentity();
  const record = protocol || legacy;

  if (!record) {
    throw new Error('No identity found — run `mood identity create` or `mood init` first');
  }

  if (flags.json) {
    emit(
      {
        nodeId: record.nodeId,
        publicKey: record.publicKey,
        algorithm: record.algorithm,
        networkId: record.networkId,
        identityVersion: protocol ? protocol.identityVersion : undefined,
        organizationId: legacy ? legacy.organizationId : undefined,
        createdAt: record.createdAt,
      },
      '',
      flags
    );
    return;
  }

  process.stdout.write(renderIdentityScreen({
    ...record,
    organizationId: legacy ? legacy.organizationId : record.organizationId,
  }));
}

export default { run };
