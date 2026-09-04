/**
 * MOOD Protocol Identity Alpha 002-B — the identity runtime.
 *
 * createIdentity() follows one rule: one node, one key.
 *   - public.json already exists → refuse. Rekeying is a deliberate
 *     human act; no API ever destroys an identity by accident.
 *   - private.json already exists (e.g. from `mood init`) → ADOPT that
 *     keypair and write only public.json. The node keeps the node ID it
 *     already has — identity continuity, nothing destroyed.
 *   - nothing exists → generate a fresh keypair, write both records.
 *
 * The public identity record (public.json) is propagatable:
 *   { nodeId, publicKey, algorithm, networkId, createdAt, identityVersion }
 * exportPublicIdentity() projects it to the strict protocol surface:
 *   { nodeId, publicKey, algorithm, createdAt }
 *
 * The private key exists only in private.json, node-local. It is never
 * part of any return value of this module.
 */

import {
  ALGORITHM,
  DEFAULT_NETWORK_ID,
  IDENTITY_VERSION,
  deriveNodeId,
  validatePublicIdentity,
} from './serializer.js';
import {
  generateKeypair,
  identityPaths,
  readPrivateFile,
  readPublicFile,
  writePrivateFile,
  writePublicFile,
} from './key-manager.js';

/**
 * Create (or adopt) this node's protocol identity.
 *
 * @param {object} env    environment for path resolution (process.env by default)
 * @param {object} [options]  { networkId } — defaults to the alpha testnet
 * @returns {{status: 'created'|'adopted', identity: object, privateFile: string}}
 */
export function createIdentity(env = process.env, options = {}) {
  const networkId = options.networkId || DEFAULT_NETWORK_ID;
  const paths = identityPaths(env);

  const existingPublic = readPublicFile(env);
  if (existingPublic) {
    throw new Error(
      `protocol identity already exists (${paths.publicFile}) — refusing to rekey. ` +
        'Replacing an identity is a deliberate act; this API never does it for you.'
    );
  }

  const existingPrivate = readPrivateFile(env);
  if (existingPrivate) {
    const identity = adoptExistingKey(existingPrivate, networkId);
    writePublicFile(env, identity);
    return { status: 'adopted', identity, privateFile: paths.privateFile };
  }

  const keypair = generateKeypair();
  const createdAt = new Date().toISOString();
  const identity = {
    nodeId: deriveNodeId(keypair.publicKey, networkId),
    publicKey: keypair.publicKey,
    algorithm: ALGORITHM,
    networkId,
    createdAt,
    identityVersion: IDENTITY_VERSION,
  };
  validatePublicIdentity(identity);
  writePublicFile(env, identity);
  writePrivateFile(env, {
    nodeId: identity.nodeId,
    privateKey: keypair.privateKey,
    algorithm: ALGORITHM,
    createdAt,
    warning: 'KEEP LOCAL. Never share this file. Never commit it.',
  });
  return { status: 'created', identity, privateFile: paths.privateFile };
}

/**
 * Adopt a keypair that already exists on this node (written by `mood
 * init` or an earlier client). Derives the protocol public identity
 * from the same key material — the node ID is preserved.
 */
function adoptExistingKey(privateRecord, networkId) {
  const { privateKey, nodeId, createdAt } = privateRecord;
  if (typeof privateKey !== 'string') {
    throw new Error(
      'existing private.json carries no privateKey field — cannot adopt'
    );
  }
  const secret = Buffer.from(privateKey, 'base64');
  if (secret.length !== 64) {
    throw new Error(
      'existing private.json privateKey is not a 64-byte Ed25519 secret key — cannot adopt'
    );
  }
  const publicKey = secret.subarray(32).toString('base64');
  const derivedNodeId = deriveNodeId(publicKey, networkId);
  const identity = {
    // keep the stored node ID only when it is the one this key actually
    // derives to — anything else is a mismatched or tampered record
    nodeId: nodeId === derivedNodeId ? nodeId : derivedNodeId,
    publicKey,
    algorithm: ALGORITHM,
    networkId,
    createdAt: createdAt || new Date().toISOString(),
    identityVersion: IDENTITY_VERSION,
  };
  validatePublicIdentity(identity);
  return identity;
}

/** Load this node's public identity. Returns null when not created yet. */
export function loadPublicIdentity(env = process.env) {
  const record = readPublicFile(env);
  if (!record) return null;
  validatePublicIdentity(record);
  return record;
}

/**
 * The propagatable projection of a public identity — exactly the four
 * protocol fields. Deliberately excludes networkId and identityVersion
 * (local metadata) and can never include private material.
 */
export function exportPublicIdentity(identity) {
  validatePublicIdentity(identity);
  return {
    nodeId: identity.nodeId,
    publicKey: identity.publicKey,
    algorithm: identity.algorithm,
    createdAt: identity.createdAt,
  };
}
