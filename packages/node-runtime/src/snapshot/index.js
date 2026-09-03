/**
 * MOOD Snapshot Module
 *
 * Generates and manages epoch snapshots.
 * Snapshots capture the state of contributions and member enrollments.
 *
 * @module snapshot
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Snapshot constants
const SNAPSHOT_SCHEMA_VERSION = '1.0.0';
const EPOCH_FORMAT = 'epoch-{number:04d}';

/**
 * Snapshot types
 */
export const SNAPSHOT_TYPES = {
  EPOCH: 'epoch',
  MEMBER: 'member',
  CONTRIBUTION: 'contribution'
};

/**
 * Generate epoch ID
 * @param {number} epochNumber - Epoch number
 * @returns {string} Epoch ID
 */
export function generateEpochId(epochNumber) {
  return EPOCH_FORMAT.replace('{number:04d}', epochNumber.toString().padStart(4, '0'));
}

/**
 * Parse epoch ID
 * @param {string} epochId - Epoch ID
 * @returns {number|null} Epoch number or null
 */
export function parseEpochId(epochId) {
  const match = epochId.match(/^epoch-(\d{4})$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Compute snapshot digest from contributions
 * @param {Array} contributions - Array of contribution objects
 * @param {object} meta - Snapshot metadata
 * @returns {string} SHA-256 digest
 */
export function computeSnapshotDigest(contributions, meta = {}) {
  // Sort contributions by ID for determinism
  const sorted = [...contributions].sort((a, b) => {
    const idA = a.contributionId || a.id;
    const idB = b.contributionId || b.id;
    return idA.localeCompare(idB);
  });

  // Create canonical representation
  const canonical = {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    epochId: meta.epochId,
    epochNumber: meta.epochNumber,
    protocolVersion: meta.protocolVersion || '0.2.0',
    policyVersion: meta.policyVersion,
    contributions: sorted.map(c => ({
      id: c.contributionId || c.id,
      fingerprint: c.contentFingerprint || c.fingerprint,
      status: c.status,
      contributorId: c.contributor?.id || c.contributorId
    })),
    memberCount: meta.memberCount || 0,
    timestamp: meta.timestamp
  };

  const canonicalString = JSON.stringify(canonical, Object.keys(canonical).sort());
  return `sha256:${crypto.createHash('sha256').update(canonicalString).digest('hex')}`;
}

/**
 * Verify snapshot digest
 * @param {object} snapshot - Snapshot object
 * @returns {boolean} Whether digest matches
 */
export function verifySnapshotDigest(snapshot) {
  const computed = computeSnapshotDigest(
    snapshot.contributions || [],
    {
      epochId: snapshot.epochId,
      epochNumber: snapshot.epochNumber,
      protocolVersion: snapshot.protocolVersion,
      policyVersion: snapshot.policyVersion,
      memberCount: snapshot.memberCount,
      timestamp: snapshot.timestamp
    }
  );

  return computed === snapshot.digest;
}

/**
 * Create snapshot
 * @param {object} options - Snapshot options
 * @returns {object} Snapshot object
 */
export function createSnapshot(options) {
  const {
    epochNumber,
    contributions,
    networkId,
    protocolVersion,
    policyVersion,
    memberCount,
    issuerNodeId
  } = options;

  const epochId = generateEpochId(epochNumber);
  const timestamp = new Date().toISOString();

  const snapshot = {
    snapshotVersion: SNAPSHOT_SCHEMA_VERSION,
    snapshotId: `snapshot-${uuidv4()}`,
    epochId,
    epochNumber,
    networkId,
    protocolVersion: protocolVersion || '0.2.0',
    policyVersion: policyVersion,
    snapshotType: SNAPSHOT_TYPES.EPOCH,
    contributions: contributions || [],
    contributionCount: (contributions || []).length,
    memberCount: memberCount || 0,
    digest: '', // Will be computed
    timestamp,
    issuerNodeId,
    previousSnapshotId: options.previousSnapshotId || null,
    attestations: []
  };

  // Compute digest
  snapshot.digest = computeSnapshotDigest(snapshot.contributions, {
    epochId,
    epochNumber,
    protocolVersion: snapshot.protocolVersion,
    policyVersion: snapshot.policyVersion,
    memberCount: snapshot.memberCount,
    timestamp
  });

  return snapshot;
}

/**
 * Create snapshot attestation
 * @param {object} options - Attestation options
 * @returns {object} Attestation object
 */
export function createSnapshotAttestation(options) {
  const {
    snapshotId,
    digest,
    epochId,
    nodeId,
    nodeManifest,
    signature
  } = options;

  return {
    attestationVersion: SNAPSHOT_SCHEMA_VERSION,
    attestationId: `attest-${uuidv4()}`,
    snapshotId,
    digest,
    epochId,
    nodeId,
    nodeManifest,
    signedAt: new Date().toISOString(),
    signature,
    attestationType: 'epoch_snapshot'
  };
}

/**
 * Verify attestation
 * @param {object} attestation - Attestation object
 * @param {string} nodePublicKey - Node's public key
 * @returns {object} Verification result
 */
export function verifyAttestation(attestation, nodePublicKey) {
  try {
    // Verify digest matches
    if (!attestation.digest) {
      return { valid: false, error: 'Missing digest' };
    }

    // Verify signature
    if (attestation.signature && nodePublicKey) {
      const nacl = require('tweetnacl');
      const { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } = require('tweetnacl-util');

      // Create canonical payload for verification
      const payload = {
        snapshotId: attestation.snapshotId,
        digest: attestation.digest,
        epochId: attestation.epochId,
        nodeId: attestation.nodeId,
        signedAt: attestation.signedAt
      };

      const canonical = JSON.stringify(payload, Object.keys(payload).sort());
      const messageBytes = decodeUTF8(canonical);
      const signatureBytes = decodeBase64(attestation.signature);
      const publicKeyBytes = decodeBase64(nodePublicKey);

      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

      return {
        valid: isValid,
        error: isValid ? null : 'Invalid signature'
      };
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

/**
 * Sign snapshot with node key
 * @param {object} snapshot - Snapshot object
 * @param {string} secretKey - Node secret key (base64)
 * @returns {string} Signature
 */
export function signSnapshot(snapshot, secretKey) {
  const nacl = require('tweetnacl');
  const { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } = require('tweetnacl-util');

  const payload = {
    snapshotId: snapshot.snapshotId,
    digest: snapshot.digest,
    epochId: snapshot.epochId,
    epochNumber: snapshot.epochNumber,
    timestamp: snapshot.timestamp
  };

  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const messageBytes = decodeUTF8(canonical);
  const secretKeyBytes = decodeBase64(secretKey);

  const signature = nacl.sign.detached(messageBytes, secretKeyBytes);
  return encodeBase64(signature);
}

/**
 * Snapshot Manager
 * Handles snapshot storage and epoch management
 */
export class SnapshotManager {
  /**
   * @param {object} options
   * @param {string} [options.dataDir] - Data directory
   * @param {string} [options.networkId] - Network ID
   */
  constructor(options = {}) {
    this.dataDir = options.dataDir || './data/node';
    this.networkId = options.networkId || 'mood-testnet-001';
    this.currentEpoch = 0;
    this.snapshots = new Map();
    this.attestations = new Map();
  }

  /**
   * Initialize snapshot manager
   */
  initialize() {
    const snapshotsDir = join(this.dataDir, 'snapshots');
    if (!existsSync(snapshotsDir)) {
      mkdirSync(snapshotsDir, { recursive: true });
    }

    // Load existing snapshots
    this._loadSnapshots();
  }

  /**
   * Load existing snapshots from disk
   */
  _loadSnapshots() {
    const snapshotsDir = join(this.dataDir, 'snapshots');
    if (!existsSync(snapshotsDir)) {
      return;
    }

    const fs = require('fs');
    const files = fs.readdirSync(snapshotsDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const path = join(snapshotsDir, file);
      const data = JSON.parse(readFileSync(path, 'utf8'));
      this.snapshots.set(data.snapshotId, data);

      // Track highest epoch number
      if (data.epochNumber > this.currentEpoch) {
        this.currentEpoch = data.epochNumber;
      }
    }
  }

  /**
   * Create new epoch snapshot
   * @param {object} options - Snapshot options
   * @returns {object} Created snapshot
   */
  createEpochSnapshot(options) {
    const {
      contributions,
      memberCount,
      policyVersion,
      nodeId
    } = options;

    const nextEpoch = this.currentEpoch + 1;

    // Get previous snapshot ID
    let previousSnapshotId = null;
    if (this.currentEpoch > 0) {
      const prevEpochId = generateEpochId(this.currentEpoch);
      for (const snapshot of this.snapshots.values()) {
        if (snapshot.epochId === prevEpochId) {
          previousSnapshotId = snapshot.snapshotId;
          break;
        }
      }
    }

    const snapshot = createSnapshot({
      epochNumber: nextEpoch,
      contributions,
      networkId: this.networkId,
      protocolVersion: '0.2.0',
      policyVersion,
      memberCount,
      issuerNodeId: nodeId,
      previousSnapshotId
    });

    // Store snapshot
    this.snapshots.set(snapshot.snapshotId, snapshot);
    this.currentEpoch = nextEpoch;

    // Save to disk
    this._saveSnapshot(snapshot);

    return snapshot;
  }

  /**
   * Add attestation to snapshot
   * @param {object} snapshot - Snapshot to attest
   * @param {object} attestation - Attestation
   * @returns {object} Updated snapshot
   */
  addAttestation(snapshot, attestation) {
    snapshot.attestations = snapshot.attestations || [];
    snapshot.attestations.push(attestation);
    this._saveSnapshot(snapshot);
    return snapshot;
  }

  /**
   * Get snapshot by ID
   * @param {string} snapshotId - Snapshot ID
   * @returns {object|null} Snapshot or null
   */
  getSnapshot(snapshotId) {
    return this.snapshots.get(snapshotId) || null;
  }

  /**
   * Get snapshot by epoch
   * @param {number} epochNumber - Epoch number
   * @returns {object|null} Snapshot or null
   */
  getSnapshotByEpoch(epochNumber) {
    const epochId = generateEpochId(epochNumber);
    for (const snapshot of this.snapshots.values()) {
      if (snapshot.epochId === epochId) {
        return snapshot;
      }
    }
    return null;
  }

  /**
   * Get all snapshots
   * @returns {Array} All snapshots
   */
  getAllSnapshots() {
    return Array.from(this.snapshots.values())
      .sort((a, b) => a.epochNumber - b.epochNumber);
  }

  /**
   * Get latest snapshot
   * @returns {object|null} Latest snapshot or null
   */
  getLatestSnapshot() {
    if (this.currentEpoch === 0) {
      return null;
    }
    return this.getSnapshotByEpoch(this.currentEpoch);
  }

  /**
   * Save snapshot to disk
   * @param {object} snapshot - Snapshot to save
   */
  _saveSnapshot(snapshot) {
    const snapshotsDir = join(this.dataDir, 'snapshots');
    const path = join(snapshotsDir, `${snapshot.snapshotId}.json`);
    writeFileSync(path, JSON.stringify(snapshot, null, 2));
  }

  /**
   * Export proof bundle
   * @param {object} options - Export options
   * @returns {object} Proof bundle
   */
  exportProofBundle(options) {
    const {
      snapshot,
      manifests,
      contributions,
      verificationDecisions,
      attestations,
      outputDir
    } = options;

    const bundle = {
      bundleVersion: SNAPSHOT_SCHEMA_VERSION,
      bundleId: `bundle-${uuidv4()}`,
      networkId: this.networkId,
      createdAt: new Date().toISOString(),
      snapshot,
      manifests: manifests || [],
      contributions: contributions || [],
      verificationDecisions: verificationDecisions || [],
      attestations: attestations || [],
      metadata: {
        clientVersion: '0.1.0-alpha.1',
        protocolVersion: '0.2.0',
        bundleType: 'alpha_testnet_proof'
      }
    };

    // Calculate bundle hash
    const bundleCanonical = JSON.stringify({
      snapshot: bundle.snapshot,
      manifests: bundle.manifests,
      contributions: bundle.contributions,
      attestations: bundle.attestations
    }, Object.keys(bundle).sort());

    bundle.bundleHash = `sha256:${crypto.createHash('sha256').update(bundleCanonical).digest('hex')}`;

    // Save bundle
    if (outputDir) {
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      const bundlePath = join(outputDir, 'proof-bundle.json');
      writeFileSync(bundlePath, JSON.stringify(bundle, null, 2));

      // Also save individual files for verification
      if (snapshot) {
        writeFileSync(join(outputDir, `epoch-${snapshot.epochId}.snapshot.json`), JSON.stringify(snapshot, null, 2));
      }
      if (manifests) {
        manifests.forEach((m, i) => {
          writeFileSync(join(outputDir, `node-${i + 1}-manifest.json`), JSON.stringify(m, null, 2));
        });
      }
      if (contributions && contributions.length > 0) {
        writeFileSync(join(outputDir, 'contribution.json'), JSON.stringify(contributions, null, 2));
      }
      if (verificationDecisions) {
        writeFileSync(join(outputDir, 'verification-decisions.json'), JSON.stringify(verificationDecisions, null, 2));
      }
      if (attestations) {
        writeFileSync(join(outputDir, 'snapshot-attestations.json'), JSON.stringify(attestations, null, 2));
      }
    }

    return bundle;
  }

  /**
   * Get snapshot statistics
   * @returns {object} Statistics
   */
  getStats() {
    return {
      totalSnapshots: this.snapshots.size,
      currentEpoch: this.currentEpoch,
      latestSnapshot: this.getLatestSnapshot()?.snapshotId || null,
      latestDigest: this.getLatestSnapshot()?.digest || null,
      totalAttestations: Array.from(this.snapshots.values())
        .reduce((sum, s) => sum + (s.attestations?.length || 0), 0)
    };
  }
}

export default {
  SNAPSHOT_TYPES,
  generateEpochId,
  parseEpochId,
  computeSnapshotDigest,
  verifySnapshotDigest,
  createSnapshot,
  createSnapshotAttestation,
  verifyAttestation,
  signSnapshot,
  SnapshotManager
};
