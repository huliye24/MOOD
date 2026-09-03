/**
 * MOOD Synchronization Module
 *
 * Handles P2P communication via centralized relay.
 * Nodes connect to relay and exchange signed protocol objects.
 *
 * @module synchronization
 */

import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { EventEmitter } from 'events';

// Message types
export const MESSAGE_TYPES = {
  // Connection
  HELLO: 'hello',
  HELLO_ACK: 'hello_ack',
  HEARTBEAT: 'heartbeat',

  // Object exchange
  BROADCAST_OBJECT: 'broadcast_object',
  REQUEST_OBJECT: 'request_object',
  OBJECT_RESPONSE: 'object_response',

  // Inventory
  BROADCAST_INVENTORY: 'broadcast_inventory',
  SYNC_REQUEST: 'sync_request',
  SYNC_RESPONSE: 'sync_response',

  // Manifests
  BROADCAST_MANIFEST: 'broadcast_manifest',

  // Snapshot
  BROADCAST_SNAPSHOT_ATTESTATION: 'broadcast_snapshot_attestation',

  // Errors
  ERROR: 'error'
};

// Connection states
export const CONNECTION_STATE = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error'
};

/**
 * Create relay message envelope
 * @param {string} type - Message type
 * @param {object} payload - Message payload
 * @param {string} senderId - Sender node ID
 * @param {string} signature - Message signature
 * @returns {object} Envelope
 */
export function createMessageEnvelope(type, payload, senderId, signature = null) {
  return {
    messageId: uuidv4(),
    type,
    senderId,
    timestamp: new Date().toISOString(),
    payload,
    signature
  };
}

/**
 * Sign message for relay transmission
 * @param {object} envelope - Message envelope
 * @param {string} secretKey - Node secret key
 * @returns {string} Signature
 */
export function signMessage(envelope, secretKey) {
  const { signature, ...rest } = envelope;
  const canonical = JSON.stringify(rest, Object.keys(rest).sort());
  const nacl = require('tweetnacl');
  const { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } = require('tweetnacl-util');

  const messageBytes = decodeUTF8(canonical);
  const secretKeyBytes = decodeBase64(secretKey);
  const sig = nacl.sign.detached(messageBytes, secretKeyBytes);
  return encodeBase64(sig);
}

/**
 * Synchronization Manager
 * Manages connection to relay and object exchange
 */
export class SyncManager extends EventEmitter {
  /**
   * @param {object} options
   * @param {string} [options.relayUrl] - Relay WebSocket URL
   * @param {object} [options.identity] - Node identity
   * @param {number} [options.reconnectInterval] - Reconnect interval in ms
   */
  constructor(options = {}) {
    super();

    this.relayUrl = options.relayUrl || 'ws://localhost:8080';
    this.identity = options.identity;
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;

    this.ws = null;
    this.state = CONNECTION_STATE.DISCONNECTED;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.pendingRequests = new Map();
    this.connectedPeers = new Set();
    this.knownObjects = new Map();
  }

  /**
   * Connect to relay
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.state === CONNECTION_STATE.CONNECTED ||
        this.state === CONNECTION_STATE.AUTHENTICATED) {
      return;
    }

    this.state = CONNECTION_STATE.CONNECTING;
    this.emit('connecting', { relayUrl: this.relayUrl });

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.relayUrl);

        this.ws.on('open', () => {
          this._sendHello();
        });

        this.ws.on('message', (data) => {
          this._handleMessage(data);
        });

        this.ws.on('close', () => {
          this._handleDisconnect();
          resolve(); // Don't reject on close
        });

        this.ws.on('error', (error) => {
          this.state = CONNECTION_STATE.ERROR;
          this.emit('error', error);
          reject(error);
        });

      } catch (error) {
        this.state = CONNECTION_STATE.ERROR;
        reject(error);
      }
    });
  }

  /**
   * Send hello message to relay
   */
  _sendHello() {
    if (!this.identity || !this.identity.nodeId) {
      throw new Error('Identity not set');
    }

    const payload = {
      nodeId: this.identity.nodeId,
      manifest: this.identity.manifest,
      supportedMessageTypes: Object.values(MESSAGE_TYPES)
    };

    const envelope = createMessageEnvelope(
      MESSAGE_TYPES.HELLO,
      payload,
      this.identity.nodeId
    );

    // Sign the message
    if (this.identity.secretKey) {
      envelope.signature = signMessage(envelope, this.identity.secretKey);
    }

    this._send(envelope);
  }

  /**
   * Handle incoming message
   * @param {Buffer} data - Raw message data
   */
  _handleMessage(data) {
    try {
      const message = JSON.parse(data.toString());
      this._processMessage(message);
    } catch (e) {
      this.emit('error', new Error(`Failed to parse message: ${e.message}`));
    }
  }

  /**
   * Process a valid message
   * @param {object} message - Parsed message
   */
  _processMessage(message) {
    switch (message.type) {
      case MESSAGE_TYPES.HELLO_ACK:
        this._handleHelloAck(message);
        break;

      case MESSAGE_TYPES.HEARTBEAT:
        this._handleHeartbeat(message);
        break;

      case MESSAGE_TYPES.BROADCAST_OBJECT:
        this._handleBroadcastObject(message);
        break;

      case MESSAGE_TYPES.OBJECT_RESPONSE:
        this._handleObjectResponse(message);
        break;

      case MESSAGE_TYPES.BROADCAST_INVENTORY:
        this._handleBroadcastInventory(message);
        break;

      case MESSAGE_TYPES.BROADCAST_MANIFEST:
        this._handleBroadcastManifest(message);
        break;

      case MESSAGE_TYPES.BROADCAST_SNAPSHOT_ATTESTATION:
        this._handleBroadcastSnapshotAttestation(message);
        break;

      case MESSAGE_TYPES.ERROR:
        this._handleError(message);
        break;

      default:
        this.emit('unknown_message', message);
    }
  }

  /**
   * Handle hello acknowledgment
   * @param {object} message - Hello ack message
   */
  _handleHelloAck(message) {
    this.state = CONNECTION_STATE.AUTHENTICATED;
    this.reconnectAttempts = 0;
    this.connectedPeers = new Set(message.payload.peers || []);

    this.emit('connected', {
      peers: this.connectedPeers,
      relayInfo: message.payload
    });

    // Start heartbeat
    this._startHeartbeat();
  }

  /**
   * Handle heartbeat from relay
   * @param {object} message - Heartbeat message
   */
  _handleHeartbeat(message) {
    this.emit('heartbeat', message.payload);

    // Respond with our own heartbeat
    if (this.state === CONNECTION_STATE.AUTHENTICATED) {
      const response = createMessageEnvelope(
        MESSAGE_TYPES.HEARTBEAT,
        {
          nodeId: this.identity?.nodeId,
          timestamp: new Date().toISOString()
        },
        this.identity?.nodeId
      );

      if (this.identity?.secretKey) {
        response.signature = signMessage(response, this.identity.secretKey);
      }

      this._send(response);
    }
  }

  /**
   * Handle broadcast object
   * @param {object} message - Broadcast message
   */
  _handleBroadcastObject(message) {
    const { object } = message.payload;

    if (object) {
      this.knownObjects.set(object.id || object.objectId, {
        object,
        senderId: message.senderId,
        receivedAt: new Date().toISOString()
      });

      this.emit('object', {
        object,
        senderId: message.senderId,
        messageId: message.messageId
      });
    }
  }

  /**
   * Handle object response
   * @param {object} message - Object response message
   */
  _handleObjectResponse(message) {
    const { requestId, object } = message.payload;

    if (this.pendingRequests.has(requestId)) {
      const { resolve } = this.pendingRequests.get(requestId);
      this.pendingRequests.delete(requestId);
      resolve(object);
    }

    this.emit('object_response', { object, requestId });
  }

  /**
   * Handle inventory broadcast
   * @param {object} message - Inventory message
   */
  _handleBroadcastInventory(message) {
    const { inventory, senderId } = message.payload;

    this.emit('inventory', {
      inventory,
      senderId
    });
  }

  /**
   * Handle manifest broadcast
   * @param {object} message - Manifest message
   */
  _handleBroadcastManifest(message) {
    this.emit('manifest', {
      manifest: message.payload.manifest,
      senderId: message.senderId
    });
  }

  /**
   * Handle snapshot attestation broadcast
   * @param {object} message - Snapshot attestation message
   */
  _handleBroadcastSnapshotAttestation(message) {
    this.emit('snapshot_attestation', {
      attestation: message.payload,
      senderId: message.senderId
    });
  }

  /**
   * Handle error message
   * @param {object} message - Error message
   */
  _handleError(message) {
    this.emit('relay_error', message.payload);
  }

  /**
   * Handle disconnection
   */
  _handleDisconnect() {
    this.state = CONNECTION_STATE.DISCONNECTED;
    this._stopHeartbeat();

    this.emit('disconnected', {
      attempts: this.reconnectAttempts,
      willRetry: this.reconnectAttempts < this.maxReconnectAttempts
    });

    // Attempt reconnection
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(() => {});
      }, this.reconnectInterval);
    }
  }

  /**
   * Start heartbeat timer
   */
  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.state === CONNECTION_STATE.AUTHENTICATED) {
        const payload = {
          nodeId: this.identity?.nodeId,
          manifest: this.identity?.manifest,
          timestamp: new Date().toISOString()
        };

        const envelope = createMessageEnvelope(
          MESSAGE_TYPES.HEARTBEAT,
          payload,
          this.identity?.nodeId
        );

        if (this.identity?.secretKey) {
          envelope.signature = signMessage(envelope, this.identity.secretKey);
        }

        this._send(envelope);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat timer
   */
  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Send raw message to relay
   * @param {object} message - Message to send
   */
  _send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast a protocol object
   * @param {object} object - Protocol object to broadcast
   * @returns {boolean} Success
   */
  broadcastObject(object) {
    if (this.state !== CONNECTION_STATE.AUTHENTICATED) {
      return false;
    }

    const envelope = createMessageEnvelope(
      MESSAGE_TYPES.BROADCAST_OBJECT,
      { object },
      this.identity?.nodeId
    );

    if (this.identity?.secretKey) {
      envelope.signature = signMessage(envelope, this.identity.secretKey);
    }

    this._send(envelope);
    return true;
  }

  /**
   * Request an object from relay or peers
   * @param {string} objectId - Object ID to request
   * @param {number} [timeout] - Request timeout in ms
   * @returns {Promise<object|null>} Object or null
   */
  async requestObject(objectId, timeout = 10000) {
    if (this.state !== CONNECTION_STATE.AUTHENTICATED) {
      return null;
    }

    const requestId = uuidv4();

    const envelope = createMessageEnvelope(
      MESSAGE_TYPES.REQUEST_OBJECT,
      { objectId, requestId },
      this.identity?.nodeId
    );

    if (this.identity?.secretKey) {
      envelope.signature = signMessage(envelope, this.identity.secretKey);
    }

    this._send(envelope);

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        resolve(null);
      }, timeout);

      this.pendingRequests.set(requestId, {
        resolve: (obj) => {
          clearTimeout(timer);
          resolve(obj);
        }
      });
    });
  }

  /**
   * Broadcast node manifest
   * @param {object} manifest - Node manifest
   * @returns {boolean} Success
   */
  broadcastManifest(manifest) {
    if (this.state !== CONNECTION_STATE.AUTHENTICATED) {
      return false;
    }

    const envelope = createMessageEnvelope(
      MESSAGE_TYPES.BROADCAST_MANIFEST,
      { manifest },
      this.identity?.nodeId
    );

    if (this.identity?.secretKey) {
      envelope.signature = signMessage(envelope, this.identity.secretKey);
    }

    this._send(envelope);
    return true;
  }

  /**
   * Broadcast inventory
   * @param {Array<string>} objectIds - List of known object IDs
   * @returns {boolean} Success
   */
  broadcastInventory(objectIds) {
    if (this.state !== CONNECTION_STATE.AUTHENTICATED) {
      return false;
    }

    const envelope = createMessageEnvelope(
      MESSAGE_TYPES.BROADCAST_INVENTORY,
      {
        inventory: objectIds,
        nodeId: this.identity?.nodeId
      },
      this.identity?.nodeId
    );

    if (this.identity?.secretKey) {
      envelope.signature = signMessage(envelope, this.identity.secretKey);
    }

    this._send(envelope);
    return true;
  }

  /**
   * Broadcast snapshot attestation
   * @param {object} attestation - Snapshot attestation
   * @returns {boolean} Success
   */
  broadcastSnapshotAttestation(attestation) {
    if (this.state !== CONNECTION_STATE.AUTHENTICATED) {
      return false;
    }

    const envelope = createMessageEnvelope(
      MESSAGE_TYPES.BROADCAST_SNAPSHOT_ATTESTATION,
      attestation,
      this.identity?.nodeId
    );

    if (this.identity?.secretKey) {
      envelope.signature = signMessage(envelope, this.identity.secretKey);
    }

    this._send(envelope);
    return true;
  }

  /**
   * Disconnect from relay
   */
  disconnect() {
    this._stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.maxReconnectAttempts = 0; // Prevent reconnection

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.state = CONNECTION_STATE.DISCONNECTED;
    this.connectedPeers.clear();
  }

  /**
   * Get connection status
   * @returns {object} Status
   */
  getStatus() {
    return {
      state: this.state,
      relayUrl: this.relayUrl,
      connectedPeers: [...this.connectedPeers],
      knownObjects: this.knownObjects.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export default {
  MESSAGE_TYPES,
  CONNECTION_STATE,
  createMessageEnvelope,
  signMessage,
  SyncManager
};
