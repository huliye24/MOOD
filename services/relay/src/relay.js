/**
 * MOOD Relay Service
 *
 * Minimal WebSocket relay for federated node communication.
 *
 * SECURITY: This relay does NOT:
 * - Hold node private keys
 * - Sign protocol objects
 * - Modify protocol objects
 * - Decide contribution validity
 * - Produce reputation
 * - Produce权益 (rights/interests)
 * - Execute remote commands
 * - Perform token or wallet operations
 *
 * @module relay
 */

import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

// ─── Constants ───────────────────────────────────────────────────────────────

const PORT = process.env.RELAY_PORT || 8080;
const NETWORK_ID = process.env.NETWORK_ID || 'mood-testnet-001';

// Message types (must match node-runtime)
const MESSAGE_TYPES = {
  HELLO: 'hello',
  HELLO_ACK: 'hello_ack',
  HEARTBEAT: 'heartbeat',
  BROADCAST_OBJECT: 'broadcast_object',
  REQUEST_OBJECT: 'request_object',
  OBJECT_RESPONSE: 'object_response',
  BROADCAST_INVENTORY: 'broadcast_inventory',
  SYNC_REQUEST: 'sync_request',
  SYNC_RESPONSE: 'sync_response',
  BROADCAST_MANIFEST: 'broadcast_manifest',
  BROADCAST_SNAPSHOT_ATTESTATION: 'broadcast_snapshot_attestation',
  ERROR: 'error'
};

// ─── State ───────────────────────────────────────────────────────────────────

const connectedNodes = new Map(); // nodeId -> { ws, manifest, lastSeen }
const objectStore = new Map();   // objectId -> { object, timestamp }
const manifestStore = new Map(); // nodeId -> manifest
const inventoryStore = new Map(); // nodeId -> Set of objectIds

// ─── Logging ─────────────────────────────────────────────────────────────────

function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    level,
    service: 'relay',
    message,
    ...data
  }));
}

// ─── Message Handlers ────────────────────────────────────────────────────────

/**
 * Handle incoming message from a node
 * @param {WebSocket} ws - WebSocket connection
 * @param {object} message - Parsed message
 */
function handleMessage(ws, message) {
  // Validate message structure
  if (!message || !message.type || !message.senderId) {
    sendError(ws, 'Invalid message structure');
    return;
  }

  // Route to appropriate handler
  switch (message.type) {
    case MESSAGE_TYPES.HELLO:
      handleHello(ws, message);
      break;

    case MESSAGE_TYPES.HEARTBEAT:
      handleHeartbeat(ws, message);
      break;

    case MESSAGE_TYPES.BROADCAST_OBJECT:
      handleBroadcastObject(ws, message);
      break;

    case MESSAGE_TYPES.REQUEST_OBJECT:
      handleRequestObject(ws, message);
      break;

    case MESSAGE_TYPES.BROADCAST_INVENTORY:
      handleBroadcastInventory(ws, message);
      break;

    case MESSAGE_TYPES.BROADCAST_MANIFEST:
      handleBroadcastManifest(ws, message);
      break;

    case MESSAGE_TYPES.BROADCAST_SNAPSHOT_ATTESTATION:
      handleBroadcastSnapshotAttestation(ws, message);
      break;

    default:
      log('warn', 'Unknown message type', { type: message.type, senderId: message.senderId });
      sendError(ws, `Unknown message type: ${message.type}`);
  }
}

/**
 * Handle HELLO message - node registration
 */
function handleHello(ws, message) {
  const { senderId, payload } = message;
  const { nodeId, manifest } = payload;

  if (!nodeId) {
    sendError(ws, 'Missing nodeId in HELLO');
    return;
  }

  // Check if already connected
  if (connectedNodes.has(nodeId)) {
    // Close old connection
    const old = connectedNodes.get(nodeId);
    if (old.ws !== ws) {
      old.ws.close(4001, 'Replaced by new connection');
    }
  }

  // Register node
  const nodeInfo = {
    ws,
    nodeId,
    manifest,
    connectedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  };

  connectedNodes.set(nodeId, nodeInfo);

  // Store manifest
  if (manifest) {
    manifestStore.set(nodeId, manifest);
  }

  // Initialize inventory
  if (!inventoryStore.has(nodeId)) {
    inventoryStore.set(nodeId, new Set());
  }

  log('info', 'Node connected', { nodeId, totalNodes: connectedNodes.size });

  // Send acknowledgment with peer list
  const peers = Array.from(connectedNodes.keys()).filter(id => id !== nodeId);

  const ack = {
    messageId: uuidv4(),
    type: MESSAGE_TYPES.HELLO_ACK,
    senderId: 'relay',
    timestamp: new Date().toISOString(),
    payload: {
      networkId: NETWORK_ID,
      relayVersion: '0.1.0-alpha.1',
      nodeId,
      peers,
      connectedPeers: peers.length,
      totalNodes: connectedNodes.size
    }
  };

  ws.send(JSON.stringify(ack));

  // Broadcast new node to other peers
  broadcastToPeers(nodeId, {
    messageId: uuidv4(),
    type: MESSAGE_TYPES.BROADCAST_MANIFEST,
    senderId: 'relay',
    timestamp: new Date().toISOString(),
    payload: { nodeId, manifest }
  });
}

/**
 * Handle HEARTBEAT message
 */
function handleHeartbeat(ws, message) {
  const { senderId } = message;

  const nodeInfo = connectedNodes.get(senderId);
  if (nodeInfo) {
    nodeInfo.lastSeen = new Date().toISOString();
  }
}

/**
 * Handle BROADCAST_OBJECT message
 */
function handleBroadcastObject(ws, message) {
  const { senderId, payload } = message;
  const { object } = payload;

  if (!object || (!object.id && !object.objectId)) {
    sendError(ws, 'Invalid object in broadcast');
    return;
  }

  const objectId = object.id || object.objectId;

  // Store object
  objectStore.set(objectId, {
    object,
    senderId,
    timestamp: new Date().toISOString()
  });

  // Update sender's inventory
  const senderInventory = inventoryStore.get(senderId);
  if (senderInventory) {
    senderInventory.add(objectId);
  }

  log('info', 'Object broadcast', { objectId, senderId });

  // Relay to all other peers
  broadcastToPeers(senderId, message);
}

/**
 * Handle REQUEST_OBJECT message
 */
function handleRequestObject(ws, message) {
  const { senderId, payload } = message;
  const { objectId, requestId } = payload;

  const stored = objectStore.get(objectId);

  const response = {
    messageId: uuidv4(),
    type: MESSAGE_TYPES.OBJECT_RESPONSE,
    senderId: 'relay',
    timestamp: new Date().toISOString(),
    payload: {
      requestId,
      objectId,
      object: stored?.object || null,
      found: !!stored
    }
  };

  ws.send(JSON.stringify(response));
}

/**
 * Handle BROADCAST_INVENTORY message
 */
function handleBroadcastInventory(ws, message) {
  const { senderId, payload } = message;
  const { inventory } = payload;

  if (!Array.isArray(inventory)) {
    sendError(ws, 'Invalid inventory format');
    return;
  }

  // Update inventory store
  const senderInventory = inventoryStore.get(senderId) || new Set();
  inventory.forEach(id => senderInventory.add(id));
  inventoryStore.set(senderId, senderInventory);

  // Relay to peers
  broadcastToPeers(senderId, message);
}

/**
 * Handle BROADCAST_MANIFEST message
 */
function handleBroadcastManifest(ws, message) {
  const { senderId, payload } = message;

  // Store manifest
  if (payload.manifest) {
    manifestStore.set(senderId, payload.manifest);
  }

  // Relay to peers
  broadcastToPeers(senderId, message);
}

/**
 * Handle BROADCAST_SNAPSHOT_ATTESTATION message
 */
function handleBroadcastSnapshotAttestation(ws, message) {
  const { senderId } = message;

  log('info', 'Snapshot attestation broadcast', { senderId });

  // Relay to peers
  broadcastToPeers(senderId, message);
}

/**
 * Send error message to a node
 */
function sendError(ws, errorMessage) {
  const message = {
    messageId: uuidv4(),
    type: MESSAGE_TYPES.ERROR,
    senderId: 'relay',
    timestamp: new Date().toISOString(),
    payload: {
      code: 'RELAY_ERROR',
      message: errorMessage
    }
  };

  ws.send(JSON.stringify(message));
}

/**
 * Broadcast message to all peers except sender
 */
function broadcastToPeers(excludeNodeId, message) {
  for (const [nodeId, nodeInfo] of connectedNodes) {
    if (nodeId !== excludeNodeId && nodeInfo.ws.readyState === WebSocket.OPEN) {
      try {
        nodeInfo.ws.send(JSON.stringify(message));
      } catch (e) {
        log('error', 'Failed to send to peer', { nodeId, error: e.message });
      }
    }
  }
}

// ─── Connection Handling ──────────────────────────────────────────────────────

/**
 * Handle new WebSocket connection
 */
function handleConnection(ws, req) {
  const clientId = uuidv4();
  log('info', 'New connection', { clientId, ip: req.socket.remoteAddress });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(ws, message);
    } catch (e) {
      log('error', 'Failed to parse message', { clientId, error: e.message });
      sendError(ws, 'Invalid JSON message');
    }
  });

  ws.on('close', (code, reason) => {
    // Find and remove node
    for (const [nodeId, nodeInfo] of connectedNodes) {
      if (nodeInfo.ws === ws) {
        connectedNodes.delete(nodeId);
        log('info', 'Node disconnected', { nodeId, code, reason: reason.toString() });

        // Notify peers
        broadcastToPeers(nodeId, {
          messageId: uuidv4(),
          type: MESSAGE_TYPES.BROADCAST_MANIFEST,
          senderId: 'relay',
          timestamp: new Date().toISOString(),
          payload: { nodeId, disconnected: true }
        });
        break;
      }
    }
  });

  ws.on('error', (error) => {
    log('error', 'WebSocket error', { clientId, error: error.message });
  });

  // Set timeout for hello
  const helloTimeout = setTimeout(() => {
    if (connectedNodes.size === 0 || ![...connectedNodes.values()].some(n => n.ws === ws)) {
      ws.close(4002, 'No hello received');
    }
  }, 30000);

  ws.on('message', () => clearTimeout(helloTimeout));
}

// ─── Stats Endpoint ──────────────────────────────────────────────────────────

function createStatsHandler(server) {
  return (req, res) => {
    if (req.url === '/stats') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        networkId: NETWORK_ID,
        relayVersion: '0.1.0-alpha.1',
        connectedNodes: connectedNodes.size,
        totalObjects: objectStore.size,
        uptime: process.uptime()
      }, null, 2));
      return true;
    }
    return false;
  };
}

// ─── Server Setup ────────────────────────────────────────────────────────────

async function main() {
  const server = new WebSocketServer({ port: PORT });

  log('info', 'MOOD Relay starting', { port: PORT, networkId: NETWORK_ID });

  server.on('connection', handleConnection);

  // Health check endpoint
  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/health') {
      socket.destroy();
      return;
    }
  });

  // Periodic cleanup of stale objects (older than 1 hour)
  setInterval(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    let cleaned = 0;

    for (const [objectId, data] of objectStore) {
      if (data.timestamp < oneHourAgo) {
        objectStore.delete(objectId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      log('info', 'Cleaned stale objects', { count: cleaned, remaining: objectStore.size });
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  // Periodic peer status log
  setInterval(() => {
    if (connectedNodes.size > 0) {
      log('info', 'Connected peers', {
        count: connectedNodes.size,
        nodes: Array.from(connectedNodes.keys())
      });
    }
  }, 60 * 1000); // Every minute

  log('info', 'MOOD Relay ready', { port: PORT, url: `ws://localhost:${PORT}` });

  // Handle shutdown
  process.on('SIGINT', () => {
    log('info', 'Shutting down relay');
    server.close(() => {
      log('info', 'Relay closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    log('info', 'Received SIGTERM, shutting down');
    server.close(() => {
      process.exit(0);
    });
  });
}

main().catch((error) => {
  log('error', 'Failed to start relay', { error: error.message });
  process.exit(1);
});

export const server = null; // Placeholder for potential HTTP server export
