/**
 * MOOD Node Identity Module
 *
 * Generates and manages node identities using Ed25519 keys.
 * Node IDs are deterministically derived from identity components.
 *
 * @module identity
 */

import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from '../internal/nacl-util.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Constants
const NODE_ID_PREFIX = 'mood:node:';
const MEMBER_SUBJECT_PREFIX = 'mood:member:';
const KEYPAIR_VERSION = '1';

/**
 * Node types supported in alpha
 */
export const NODE_TYPES = ['compute', 'developer', 'gateway'];

/**
 * Network IDs for different environments
 */
export const NETWORK_IDS = {
  TESTNET_001: 'mood-testnet-001',
  LOCAL: 'mood-local'
};

/**
 * Generate a new keypair for node identity
 * @returns {object} Keypair with public and secret keys
 */
export function generateKeypair() {
  const keypair = nacl.sign.keyPair();
  return {
    publicKey: encodeBase64(keypair.publicKey),
    secretKey: encodeBase64(keypair.secretKey),
    createdAt: new Date().toISOString()
  };
}

/**
 * Generate a stable Node ID from public key
 * @param {string} publicKey - Base64 encoded public key
 * @param {string} networkId - Network identifier
 * @returns {string} Deterministic node ID
 */
export function generateNodeId(publicKey, networkId = NETWORK_IDS.TESTNET_001) {
  if (!publicKey) {
    throw new Error('publicKey is required');
  }

  // Create deterministic input for hashing
  const input = [
    KEYPAIR_VERSION,
    networkId,
    publicKey
  ].join('|');

  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return `${NODE_ID_PREFIX}${hash}`;
}

/**
 * Generate a Member Subject ID
 * @param {string} publicKey - Base64 encoded public key
 * @param {string} organizationId - Organization ID
 * @returns {string} Deterministic member subject ID
 */
export function generateMemberSubjectId(publicKey, organizationId) {
  if (!publicKey || !organizationId) {
    throw new Error('publicKey and organizationId are required');
  }

  const input = [MEMBER_SUBJECT_PREFIX, organizationId, publicKey].join('|');
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return `${MEMBER_SUBJECT_PREFIX}${hash}`;
}

/**
 * Create a Node Manifest
 * @param {object} options - Manifest options
 * @returns {object} Node manifest
 */
export function createNodeManifest(options) {
  const {
    nodeId,
    memberSubjectId,
    publicKey,
    networkId,
    nodeType,
    clientVersion,
    protocolVersion,
    relayUrl
  } = options;

  return {
    manifestVersion: '1.0.0',
    nodeId,
    memberSubjectId,
    publicKey,
    networkId,
    nodeType,
    clientVersion: clientVersion || '0.1.0-alpha.1',
    protocolVersion: protocolVersion || '0.2.0',
    createdAt: new Date().toISOString(),
    lastHeartbeat: new Date().toISOString(),
    relayUrl: relayUrl || null,
    status: 'active'
  };
}

/**
 * Validate Node ID format
 * @param {string} nodeId - Node ID to validate
 * @returns {boolean} Whether valid
 */
export function isValidNodeId(nodeId) {
  if (!nodeId || typeof nodeId !== 'string') {
    return false;
  }
  const pattern = /^mood:node:[0-9a-f]{64}$/;
  return pattern.test(nodeId);
}

/**
 * Validate Member Subject ID format
 * @param {string} subjectId - Subject ID to validate
 * @returns {boolean} Whether valid
 */
export function isValidMemberSubjectId(subjectId) {
  if (!subjectId || typeof subjectId !== 'string') {
    return false;
  }
  const pattern = /^mood:member:[0-9a-f]{64}$/;
  return pattern.test(subjectId);
}

/**
 * Sign a message using node secret key
 * @param {string} message - Message to sign (will be encoded as UTF-8)
 * @param {string} secretKey - Base64 encoded secret key
 * @returns {string} Base64 encoded signature
 */
export function sign(message, secretKey) {
  if (!message || !secretKey) {
    throw new Error('message and secretKey are required');
  }

  const messageBytes = decodeUTF8(message);
  const secretKeyBytes = decodeBase64(secretKey);

  const signature = nacl.sign.detached(messageBytes, secretKeyBytes);
  return encodeBase64(signature);
}

/**
 * Verify a signature using node public key
 * @param {string} message - Original message
 * @param {string} signature - Base64 encoded signature
 * @param {string} publicKey - Base64 encoded public key
 * @returns {boolean} Whether signature is valid
 */
export function verify(message, signature, publicKey) {
  if (!message || !signature || !publicKey) {
    return false;
  }

  try {
    const messageBytes = decodeUTF8(message);
    const signatureBytes = decodeBase64(signature);
    const publicKeyBytes = decodeBase64(publicKey);

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (e) {
    return false;
  }
}

/**
 * Create a signed envelope for protocol objects
 * @param {object} payload - Object to sign
 * @param {string} secretKey - Base64 encoded secret key
 * @param {object} meta - Metadata for envelope
 * @returns {object} Signed envelope
 */
export function createSignedEnvelope(payload, secretKey, meta = {}) {
  const timestamp = new Date().toISOString();
  const nonce = uuidv4();

  // Canonical JSON representation
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const signature = sign(canonical, secretKey);

  return {
    schemaVersion: '1.0.0',
    payload,
    payloadCanonical: canonical,
    signature,
    timestamp,
    nonce,
    ...meta
  };
}

/**
 * Verify a signed envelope
 * @param {object} envelope - Signed envelope
 * @param {string} publicKey - Base64 encoded public key
 * @returns {object} Verification result
 */
export function verifySignedEnvelope(envelope, publicKey) {
  try {
    if (!envelope.payloadCanonical || !envelope.signature) {
      return { valid: false, error: 'Missing signature or payload' };
    }

    const isValid = verify(envelope.payloadCanonical, envelope.signature, publicKey);
    return {
      valid: isValid,
      error: isValid ? null : 'Invalid signature'
    };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

/**
 * Node Identity Manager
 * Handles key storage and identity operations
 */
export class NodeIdentityManager {
  /**
   * @param {object} options
   * @param {string} [options.dataDir] - Directory for storing identity data
   * @param {string} [options.networkId] - Network ID
   */
  constructor(options = {}) {
    this.dataDir = options.dataDir || './data/node';
    this.networkId = options.networkId || NETWORK_IDS.TESTNET_001;
    this.keypair = null;
    this.nodeId = null;
    this.memberSubjectId = null;
    this.manifest = null;
  }

  /**
   * Initialize or load existing identity
   * @param {object} [existingKeypair] - Existing keypair to load
   * @returns {object} Identity data
   */
  initialize(existingKeypair = null) {
    // Ensure data directory exists
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }

    const identityPath = join(this.dataDir, 'identity.json');

    // Load existing identity if available
    if (existsSync(identityPath) && !existingKeypair) {
      return this.load();
    }

    // Create new identity
    if (existingKeypair) {
      this.keypair = existingKeypair;
    } else {
      this.keypair = generateKeypair();
    }

    this.nodeId = generateNodeId(this.keypair.publicKey, this.networkId);
    this.manifest = createNodeManifest({
      nodeId: this.nodeId,
      memberSubjectId: this.memberSubjectId,
      publicKey: this.keypair.publicKey,
      networkId: this.networkId,
      nodeType: 'compute',
      clientVersion: '0.1.0-alpha.1',
      protocolVersion: '0.2.0'
    });

    this.save();
    return this.getIdentity();
  }

  /**
   * Load identity from disk
   * @returns {object} Identity data
   */
  load() {
    const identityPath = join(this.dataDir, 'identity.json');
    if (!existsSync(identityPath)) {
      throw new Error('No existing identity found');
    }

    const data = JSON.parse(readFileSync(identityPath, 'utf8'));
    this.keypair = data.keypair;
    this.nodeId = data.nodeId;
    this.memberSubjectId = data.memberSubjectId;
    this.manifest = data.manifest;
    this.networkId = data.networkId;

    return this.getIdentity();
  }

  /**
   * Save identity to disk
   */
  save() {
    const identityPath = join(this.dataDir, 'identity.json');
    const data = {
      keypair: this.keypair,
      nodeId: this.nodeId,
      memberSubjectId: this.memberSubjectId,
      manifest: this.manifest,
      networkId: this.networkId,
      savedAt: new Date().toISOString()
    };
    writeFileSync(identityPath, JSON.stringify(data, null, 2));
  }

  /**
   * Get public identity data (safe to share)
   * @returns {object} Public identity
   */
  getIdentity() {
    return {
      publicKey: this.keypair?.publicKey || null,
      nodeId: this.nodeId,
      memberSubjectId: this.memberSubjectId,
      manifest: this.manifest,
      networkId: this.networkId
    };
  }

  /**
   * Set organization membership
   * @param {string} organizationId - Organization ID
   */
  setOrganization(organizationId) {
    if (!this.keypair) {
      throw new Error('Identity not initialized');
    }

    this.memberSubjectId = generateMemberSubjectId(
      this.keypair.publicKey,
      organizationId
    );

    this.manifest = createNodeManifest({
      nodeId: this.nodeId,
      memberSubjectId: this.memberSubjectId,
      publicKey: this.keypair.publicKey,
      networkId: this.networkId,
      nodeType: 'compute',
      clientVersion: '0.1.0-alpha.1',
      protocolVersion: '0.2.0',
      organizationId
    });

    this.save();
  }

  /**
   * Sign data using node secret key
   * @param {string} data - Data to sign
   * @returns {string} Signature
   */
  sign(data) {
    if (!this.keypair) {
      throw new Error('Identity not initialized');
    }
    return sign(data, this.keypair.secretKey);
  }

  /**
   * Export encrypted backup
   * @param {string} password - Encryption password
   * @returns {string} Encrypted backup
   */
  exportEncryptedBackup(password) {
    if (!this.keypair) {
      throw new Error('Identity not initialized');
    }

    const data = JSON.stringify({
      keypair: this.keypair,
      nodeId: this.nodeId,
      exportedAt: new Date().toISOString()
    });

    // Simple XOR encryption for alpha - should use proper encryption in production
    const key = crypto.createHash('sha256').update(password).digest();
    const encrypted = Buffer.from(data).map((byte, i) => byte ^ key[i % key.length]);

    return Buffer.from(encrypted).toString('base64');
  }

  /**
   * Delete local identity data
   * @returns {boolean} Success
   */
  delete() {
    try {
      const identityPath = join(this.dataDir, 'identity.json');
      if (existsSync(identityPath)) {
        // Overwrite with zeros before deletion for security
        const data = readFileSync(identityPath);
        writeFileSync(identityPath, Buffer.alloc(data.length, 0));
        const fs = require('fs');
        fs.unlinkSync(identityPath);
      }
      this.keypair = null;
      this.nodeId = null;
      this.memberSubjectId = null;
      this.manifest = null;
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Update heartbeat timestamp
   */
  heartbeat() {
    if (this.manifest) {
      this.manifest.lastHeartbeat = new Date().toISOString();
      this.save();
    }
  }
}

export default {
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
  verifySignedEnvelope,
  NodeIdentityManager
};
