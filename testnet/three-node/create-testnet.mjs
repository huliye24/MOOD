/**
 * MOOD Testnet Creation Script
 *
 * Creates a local three-node testnet with proper configurations.
 * This script sets up the necessary directories and configurations.
 *
 * @module create-testnet
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NETWORK_ID = 'mood-testnet-001';

/**
 * Create testnet configuration
 */
function createTestnetConfig() {
  return {
    networkId: NETWORK_ID,
    networkName: 'MOOD Three-Node Testnet',
    networkDescription: 'Local federated testnet for three-node verification',
    protocolVersion: '0.2.0',
    clientVersion: '0.1.0-alpha.1',
    networkType: 'federated_testnet',
    nodes: {
      required: 3,
      // Note: This is a technical test, not a decentralized network
      note: 'All three nodes are from the same organization in this alpha'
    },
    finality: {
      observed: '2-of-3',
      full: '3-of-3'
    },
    relay: {
      url: 'ws://localhost:8080',
      // NOT for production deployment
      deploymentStatus: 'local_development_only'
    },
    identities: {
      // Test emails only - never use real emails
      emailPattern: '*@example.invalid',
      nodeA: { email: 'node-a@example.invalid', role: 'admin' },
      nodeB: { email: 'node-b@example.invalid', role: 'member' },
      nodeC: { email: 'node-c@example.invalid', role: 'member' }
    },
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: 'create-testnet.mjs',
      alphaEnrollment: true,
      noFinancialRewards: true,
      noGovernanceAuthority: true
    }
  };
}

/**
 * Create README for the testnet
 */
function createTestnetReadme() {
  return `# MOOD Three-Node Testnet

This testnet creates a local federated three-node network for technical verification.

## ⚠️ Disclaimer

This is an **Alpha Federation Testnet**:
- No financial rewards
- No governance rights
- No token distribution
- Three nodes from a single organization = NOT decentralized

## Configuration

- **Network ID**: mood-testnet-001
- **Protocol**: v0.2
- **Client**: v0.1.0-alpha.1
- **Nodes**: 3 (same organization)
- **Finality**: 2-of-3 observed, 3-of-3 full

## Setup

\`\`\`bash
# Start local relay
npm run dev:relay

# Create testnet configuration
npm run testnet:create

# Run three-node test
npm run test:three-node
\`\`\`

## Test Identity

| Node | Test Identity (example.invalid) |
|------|--------------------------------|
| A | node-a@example.invalid |
| B | node-b@example.invalid |
| C | node-c@example.invalid |

## What's Verified

1. All three nodes compute identical snapshot digests
2. Network synchronization via WebSocket relay
3. Object propagation across nodes
4. Epoch 0001 snapshot verification

## What's Not Verified (By Design)

1. Cross-organization independence (would need second organization)
2. Token/financial operations (not in alpha)
3. Production-grade security (alpha only)
4. On-chain settlement (not implemented)
`;
}

/**
 * Main function
 */
async function main() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  MOOD Testnet Configuration Creator');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Create output directory
  const outputDir = join(__dirname, 'fixtures');

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Save configuration
  const config = createTestnetConfig();
  const configPath = join(outputDir, 'testnet-config.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`✅ Testnet configuration created: ${configPath}`);
  console.log(`   Network ID: ${config.networkId}`);
  console.log(`   Nodes: ${config.nodes.required}`);

  // Save README
  const readmePath = join(outputDir, 'README.md');
  writeFileSync(readmePath, createTestnetReadme());
  console.log(`✅ Testnet README created: ${readmePath}`);

  // Create expected output fixture
  const expectedOutput = {
    testnet: NETWORK_ID,
    epoch: 1,
    expectedDigestPattern: 'sha256:[a-f0-9]{64}',
    expectedNodeIdentities: 3,
    expectedSyncStatus: 'synchronized',
    expectedConsistency: true,
    note: 'Digests will be different on each run but should match between nodes'
  };
  writeFileSync(join(outputDir, 'expected-output.json'), JSON.stringify(expectedOutput, null, 2));

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Testnet setup complete!');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(error => {
  console.error('Failed to create testnet:', error);
  process.exit(1);
});
