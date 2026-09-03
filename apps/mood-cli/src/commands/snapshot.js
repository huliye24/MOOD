/**
 * `mood snapshot verify` — verify the latest snapshot's digest agreement.
 *
 * Loads the latest snapshot from ~/.mood/snapshots/ and recomputes its
 * digest with the shared runtime (verifySnapshotDigest). Digest
 * agreement means: the recorded contributions deterministically hash to
 * the recorded digest — any two honest nodes holding this snapshot
 * compute the same value.
 */

import { verifySnapshotDigest, verifyAttestation } from '@mood/node-runtime';
import { emit, renderSnapshotScreen, dim } from '../ui/terminal.js';
import { readLatestSnapshotObject, readIdentity } from '../state.js';

export function run(args, flags) {
  const sub = (args[0] || 'verify').toLowerCase();

  if (sub !== 'verify') {
    throw new Error(`unknown snapshot subcommand: ${sub} (try \`mood snapshot verify\`)`);
  }

  const snapshot = readLatestSnapshotObject();

  if (!snapshot) {
    throw new Error('No snapshot available yet — run `mood start` to let the node produce one');
  }

  // Digest agreement: recompute the canonical hash over the snapshot body.
  const valid = verifySnapshotDigest(snapshot);

  // Attestations: verify each signature we can check (our own key when
  // the attestation is ours; peers' keys arrive with their manifests).
  const identity = readIdentity();
  let attestations = (snapshot.attestations || []).length;
  let verifiedAttestations = 0;
  for (const a of snapshot.attestations || []) {
    const publicKey = a.nodeId === identity?.nodeId
      ? identity.publicKey
      : a.nodeManifest?.publicKey;
    if (publicKey) {
      const result = verifyAttestation(a, publicKey);
      if (result.valid) verifiedAttestations++;
    }
  }

  const recomputed = valid ? snapshot.digest.replace(/^sha256:/, '') : null;

  const data = {
    snapshotId: snapshot.snapshotId,
    epochId: snapshot.epochId,
    epoch: snapshot.epochNumber,
    digest: (snapshot.digest || '').replace(/^sha256:/, '') || null,
    recomputed,
    valid,
    agreement: valid ? 'Verified' : 'Failed',
    attestations,
    verifiedAttestations,
    contributions: snapshot.contributionCount ?? (snapshot.contributions || []).length,
  };

  if (flags.json) {
    emit(data, '', flags);
    return;
  }

  process.stdout.write(renderSnapshotScreen(data));
  if (valid) {
    process.stdout.write(dim('  The contributions deterministically hash to the recorded digest.\n'));
    process.stdout.write(dim('  Any honest node holding this snapshot computes the same value.\n\n'));
  }
}

export default { run };
