/**
 * Protocol Object Alpha 001 — synchronization interface.
 *
 * The next phase of the protocol is object propagation:
 *
 *   Node A (issuer) ──▶ Relay ──▶ Node B ──▶ Node B re-verifies
 *
 * Alpha 001 deliberately does NOT implement that transport (no P2P, no
 * relay, no gossip). What it does is fix the TWO methods every future
 * transport must speak, so the network layer can be slotted in without
 * redefining what "sync" means:
 *
 *   syncObject(object)        send a local object toward the network
 *   verifyRemoteObject(object) verify an object received from the network
 *
 * verifyRemoteObject is CONCRETE today: it runs the full
 * validateProtocolObject check on a received object. That is the honest
 * "network verification, minus the transport" — any node's object can be
 * handed to any other node's adapter and verified right now, because an
 * object's ID recomputes identically everywhere.
 *
 * syncObject is an INTERFACE today: it validates its input and then
 * refuses, loudly, to pretend. When the transport arrives it starts
 * routing; until then it must never silently no-op.
 */

import { validateProtocolObject } from './validator.js';

export const SYNC_TRANSPORT = 'not-implemented-in-alpha-001';

export class ObjectSyncAdapter {
  /**
   * @param {object} [options]
   * @param {string} [options.nodeId]  this node's ID, for future handshakes
   */
  constructor(options = {}) {
    this.nodeId = options.nodeId || null;
  }

  /** The transport this adapter speaks. null until one exists. */
  get transport() {
    return null;
  }

  /**
   * Push a local object toward the network. Interface only in Alpha 001.
   *
   * @param {object} object  a validated ProtocolObject
   * @throws {Error} always, for now — an honest refusal, not a silent no-op
   */
  async syncObject(object) {
    const check = validateProtocolObject(object);
    if (!check.valid) {
      const err = new Error(`cannot sync an invalid object: ${check.errors.join('; ')}`);
      err.code = 'INVALID_PROTOCOL_OBJECT';
      err.errors = check.errors;
      throw err;
    }
    throw new Error(
      `ObjectSyncAdapter.syncObject is an interface in Alpha 001: no network transport exists yet (${SYNC_TRANSPORT}). ` +
        'Objects are stored and verified locally; synchronization is the next phase.'
    );
  }

  /**
   * Verify an object received from the network. Concrete today: the full
   * structural + content-addressing check, identical on every node.
   *
   * @param {object} object  the received ProtocolObject
   * @returns {{valid: boolean, errors: string[]}}
   */
  async verifyRemoteObject(object) {
    return validateProtocolObject(object);
  }
}
