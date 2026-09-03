/**
 * MOOD Node Runtime
 *
 * Core runtime for MOOD Protocol v0.2 node client.
 * Provides identity, organization, invitation, storage, synchronization,
 * and snapshot capabilities.
 *
 * @module @mood/node-runtime
 */

// Re-export all modules (imported, not `export … from`, so the class
// identifiers are also bound locally for the default export below).
import { NodeIdentityManager } from './identity/index.js';
import { OrganizationManager } from './organization/index.js';
import { StorageManager } from './storage/index.js';
import { SyncManager } from './synchronization/index.js';
import { SnapshotManager } from './snapshot/index.js';
import { ProtocolAdapter } from './protocol-adapter/index.js';

export {
  NodeIdentityManager,
  OrganizationManager,
  StorageManager,
  SyncManager,
  SnapshotManager,
  ProtocolAdapter
};

// Identity exports
export {
  NODE_TYPES,
  NETWORK_IDS,
  generateKeypair,
  generateNodeId,
  generateMemberSubjectId,
  createNodeManifest,
  isValidNodeId,
  isValidMemberSubjectId,
  sign,
  verify,
  createSignedEnvelope,
  verifySignedEnvelope
} from './identity/index.js';

// Organization exports
export {
  MEMBER_ROLES,
  ORG_STATUS,
  generateOrganizationId,
  generateOrganizationKeypair,
  createOrganization,
  isValidDomain,
  validateEmailDomain
} from './organization/index.js';

// Invitation exports
export {
  INVITATION_STATUS,
  generateNonce,
  createInvitationPayload,
  signInvitation,
  verifyInvitationSignature,
  checkInvitationExpiry,
  checkInvitationUsable,
  createInvitation,
  saveInvitationFile,
  loadInvitationFile,
  validateInvitationForEnrollment,
  generateCredentialDigest,
  markInvitationUsed,
  createEnrollment,
  generateEnrollmentProof,
  exportInvitation
} from './invitation/index.js';

// Storage exports
export {
  STORAGE_COLLECTIONS
} from './storage/index.js';

// Synchronization exports
export {
  MESSAGE_TYPES,
  CONNECTION_STATE,
  createMessageEnvelope,
  signMessage
} from './synchronization/index.js';

// Snapshot exports
export {
  SNAPSHOT_TYPES,
  generateEpochId,
  parseEpochId,
  computeSnapshotDigest,
  verifySnapshotDigest,
  createSnapshot,
  createSnapshotAttestation,
  verifyAttestation,
  signSnapshot
} from './snapshot/index.js';

/**
 * Create a complete node instance
 * @param {object} options - Node options
 * @returns {object} Node instance
 */
export async function createNode(options = {}) {
  const {
    dataDir = './data/node',
    networkId = 'mood-testnet-001',
    relayUrl = 'ws://localhost:8080',
    existingIdentity = null,
    existingOrganization = null
  } = options;

  // Initialize managers
  const identityManager = new (require('./identity/index.js').NodeIdentityManager)({
    dataDir,
    networkId
  });

  const orgManager = new (require('./organization/index.js').OrganizationManager)({
    dataDir
  });

  const storageManager = new (require('./storage/index.js').StorageManager)({
    dataDir,
    nodeId: identityManager.nodeId
  }).initialize();

  const syncManager = new (require('./synchronization/index.js').SyncManager)({
    relayUrl,
    identity: identityManager.getIdentity()
  });

  const snapshotManager = new (require('./snapshot/index.js').SnapshotManager)({
    dataDir,
    networkId
  }).initialize();

  const protocolAdapter = new (require('./protocol-adapter/index.js').ProtocolAdapter)({
    dataDir,
    networkId
  });

  // Initialize identity
  identityManager.initialize(existingIdentity);

  // Load or create organization
  if (existingOrganization) {
    orgManager.load();
  }

  // Initialize protocol
  await protocolAdapter.initialize();

  return {
    identity: identityManager,
    organization: orgManager,
    storage: storageManager,
    sync: syncManager,
    snapshot: snapshotManager,
    protocol: protocolAdapter,

    // Convenience methods
    getNodeId: () => identityManager.nodeId,
    getStatus: () => ({
      nodeId: identityManager.nodeId,
      manifest: identityManager.manifest,
      networkId,
      storage: storageManager.getStats(),
      snapshot: snapshotManager.getStats(),
      protocol: protocolAdapter.getStatus(),
      sync: syncManager.getStatus()
    }),

    // Lifecycle methods
    async start() {
      await syncManager.connect();
      syncManager.broadcastManifest(identityManager.manifest);
      identityManager.heartbeat();
    },

    stop() {
      syncManager.disconnect();
    }
  };
}

export default {
  createNode,
  NodeIdentityManager,
  OrganizationManager,
  StorageManager,
  SyncManager,
  SnapshotManager,
  ProtocolAdapter
};
// Note: the invitation module exposes functions only (no manager class).
