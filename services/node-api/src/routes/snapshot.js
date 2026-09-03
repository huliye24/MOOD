/**
 * /snapshot — the latest epoch snapshot, verified on read.
 *
 * Verification is not a cached flag: every request recomputes the digest
 * via @mood/node-runtime's verifySnapshotDigest. If the snapshot file on
 * disk were tampered with, this endpoint reports agreement:"unverified"
 * instead of lying. Agents can trust "verified" because it was checked
 * right now, not when the file was written.
 */

import { Router } from 'express';
import { readIdentity, readLatestSnapshotObject, formatEpoch } from '../state.js';
import { verifySnapshotDigest } from '@mood/node-runtime/snapshot';
import { fail } from '../errors.js';

const router = Router();

router.get('/', (req, res) => {
  const identity = readIdentity();
  if (!identity) {
    fail(res, 409, 'NOT_INITIALIZED', 'Node not initialized — run `mood init` on this machine first');
    return;
  }

  const snapshot = readLatestSnapshotObject();
  if (!snapshot) {
    fail(res, 404, 'NO_SNAPSHOT', 'No snapshot exists yet — start the node and wait for the first epoch');
    return;
  }

  const verified = verifySnapshotDigest(snapshot);

  res.json({
    epoch: formatEpoch(snapshot.epochNumber || 1),
    digest: snapshot.digest || null,
    agreement: verified ? 'verified' : 'unverified',
  });
});

export default router;
