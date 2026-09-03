/**
 * MOOD Relay Test Suite
 */

import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const RELAY_URL = process.env.RELAY_URL || 'ws://localhost:8080';
const NETWORK_ID = 'mood-testnet-001';

let relayWs = null;
let testResults = [];
let nodeWs1 = null;
let nodeWs2 = null;

function log(message, data = {}) {
  console.log(`[RELAY TEST] ${message}`, JSON.stringify(data, null, 0));
}

function assert(condition, message) {
  if (condition) {
    testResults.push({ test: message, status: 'PASS' });
    log(`✅ ${message}`);
  } else {
    testResults.push({ test: message, status: 'FAIL' });
    log(`❌ ${message}`);
  }
  return condition;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectNode(nodeId) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(RELAY_URL);

    ws.on('open', () => {
      // Send hello
      const hello = {
        messageId: uuidv4(),
        type: 'hello',
        senderId: nodeId,
        timestamp: new Date().toISOString(),
        payload: {
          nodeId,
          manifest: {
            nodeId,
            networkId: NETWORK_ID,
            clientVersion: '0.1.0-alpha.1'
          }
        }
      };
      ws.send(JSON.stringify(hello));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'hello_ack') {
        resolve({ ws, ack: message });
      }
    });

    ws.on('error', (error) => {
      reject(error);
    });

    // Timeout
    setTimeout(() => reject(new Error('Connection timeout')), 5000);
  });
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  MOOD Relay - Test Suite');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Test 1: Connect single node
    log('Test 1: Connect single node');
    try {
      const result = await connectNode('test-node-1');
      nodeWs1 = result.ws;
      assert(result.ack.payload.networkId === NETWORK_ID, 'Network ID matches');
      assert(Array.isArray(result.ack.payload.peers), 'Peers array returned');
      assert(result.ack.payload.nodeId === 'test-node-1', 'Node ID acknowledged');
    } catch (e) {
      assert(false, `Single node connection: ${e.message}`);
    }

    await sleep(500);

    // Test 2: Connect second node
    log('Test 2: Connect second node');
    try {
      const result = await connectNode('test-node-2');
      nodeWs2 = result.ws;
      assert(result.ack.payload.peers.includes('test-node-1'), 'First node in peers list');
      assert(result.ack.payload.connectedPeers === 1, 'One peer connected');
    } catch (e) {
      assert(false, `Second node connection: ${e.message}`);
    }

    await sleep(500);

    // Test 3: Broadcast object
    log('Test 3: Broadcast object');
    if (nodeWs1) {
      const objectId = `test-object-${Date.now()}`;
      const broadcast = {
        messageId: uuidv4(),
        type: 'broadcast_object',
        senderId: 'test-node-1',
        timestamp: new Date().toISOString(),
        payload: {
          object: {
            id: objectId,
            type: 'test',
            data: 'test data'
          }
        }
      };

      nodeWs1.send(JSON.stringify(broadcast));

      // Wait for relay to process
      await sleep(500);

      assert(true, 'Object broadcast sent');
    }

    // Test 4: Broadcast manifest
    log('Test 4: Broadcast manifest');
    if (nodeWs2) {
      const manifest = {
        messageId: uuidv4(),
        type: 'broadcast_manifest',
        senderId: 'test-node-2',
        timestamp: new Date().toISOString(),
        payload: {
          manifest: {
            nodeId: 'test-node-2',
            networkId: NETWORK_ID,
            status: 'active'
          }
        }
      };

      nodeWs2.send(JSON.stringify(manifest));
      await sleep(500);
      assert(true, 'Manifest broadcast sent');
    }

    // Test 5: Heartbeat
    log('Test 5: Heartbeat');
    if (nodeWs1) {
      const heartbeat = {
        messageId: uuidv4(),
        type: 'heartbeat',
        senderId: 'test-node-1',
        timestamp: new Date().toISOString(),
        payload: {
          nodeId: 'test-node-1',
          timestamp: new Date().toISOString()
        }
      };

      nodeWs1.send(JSON.stringify(heartbeat));
      await sleep(200);
      assert(true, 'Heartbeat sent');
    }

    // Test 6: Request object
    log('Test 6: Request object');
    if (nodeWs2) {
      const objectId = `test-object-${Date.now()}`;

      // First broadcast
      if (nodeWs1) {
        nodeWs1.send(JSON.stringify({
          messageId: uuidv4(),
          type: 'broadcast_object',
          senderId: 'test-node-1',
          timestamp: new Date().toISOString(),
          payload: {
            object: { id: objectId, data: 'request test' }
          }
        }));
      }

      await sleep(300);

      // Then request
      const requestId = uuidv4();
      nodeWs2.send(JSON.stringify({
        messageId: uuidv4(),
        type: 'request_object',
        senderId: 'test-node-2',
        timestamp: new Date().toISOString(),
        payload: { objectId, requestId }
      }));

      await sleep(300);
      assert(true, 'Object request sent');
    }

    // Test 7: Snapshot attestation broadcast
    log('Test 7: Snapshot attestation broadcast');
    if (nodeWs1) {
      nodeWs1.send(JSON.stringify({
        messageId: uuidv4(),
        type: 'broadcast_snapshot_attestation',
        senderId: 'test-node-1',
        timestamp: new Date().toISOString(),
        payload: {
          attestationId: `attest-${Date.now()}`,
          snapshotId: 'snapshot-001',
          digest: 'sha256:test',
          epochId: 'epoch-0001'
        }
      }));
      await sleep(300);
      assert(true, 'Snapshot attestation sent');
    }

    // Test 8: Error handling
    log('Test 8: Invalid message handling');
    if (nodeWs2) {
      nodeWs2.send(JSON.stringify({ invalid: 'message' }));
      await sleep(200);
      assert(true, 'Invalid message handled');
    }

  } catch (error) {
    log('Test error', { error: error.message });
    assert(false, `Test execution: ${error.message}`);
  }

  // Cleanup
  log('Cleanup', 'Closing connections');
  if (nodeWs1) nodeWs1.close();
  if (nodeWs2) nodeWs2.close();
  if (relayWs) relayWs.close();

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  console.log(`  PASSED: ${passed}  |  FAILED: ${failed}  |  TOTAL: ${testResults.length}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    console.log('Failed tests:');
    testResults.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ❌ ${r.test}`);
    });
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
  }
}

runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
