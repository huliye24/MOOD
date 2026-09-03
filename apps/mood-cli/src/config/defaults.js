/**
 * MOOD CLI default configuration.
 *
 * Single source of truth for every constant the CLI surfaces to users.
 * The underlying node runtime keeps its own internal schema versions —
 * this file only describes what the CLI *displays* and how it connects.
 *
 * Phase Zero rule: none of these defaults may introduce tokens, wallets,
 * financial features, mining, staking, or governance.
 */

/** User-facing protocol version (MOOD Protocol v0.1, per the whitepaper). */
export const PROTOCOL_VERSION = '0.1';

/** CLI client version (MOOD CLI Node Alpha 002). */
export const CLI_VERSION = '0.2.0-alpha.2';

/** Human-readable network name. */
export const NETWORK_NAME = 'MOOD Alpha Testnet';

/** Machine network identifier (must match the runtime). */
export const NETWORK_ID = 'mood-testnet-001';

/** Consensus mode of the alpha network. */
export const CONSENSUS_MODE = 'Snapshot Agreement';

/** Deployment mode of the alpha network. */
export const NETWORK_MODE = 'Federated Alpha';

/** Default federated relay (local development only — not for production). */
export const RELAY_URL = 'ws://localhost:8080';

/** Default epoch shown before the first synchronized snapshot. */
export const INITIAL_EPOCH = 1;

/**
 * Default organization used by `mood invite create` when the node has not
 * enrolled into a specific organization. Deterministic: every node that
 * uses the default derives the same organization ID.
 */
export const DEFAULT_ORGANIZATION = {
  name: 'MOOD Alpha',
  domain: 'alpha.mood.example'
};

/**
 * Genesis bootstrap peers (from genesis/genesis-nodes.json).
 * These are the three alpha-testnet genesis contributors. They are
 * informational in the alpha: the CLI does not require them to run.
 */
export const GENESIS_PEERS = [
  {
    alias: 'Node A',
    nodeId: 'mood:node:63aa9414f8293f9f08edafb33199a037c55521b81719c8400080bf3487d7e122',
    role: 'genesis_contributor'
  },
  {
    alias: 'Node B',
    nodeId: 'mood:node:7d5d1801a2f874554ac518992e0f6ad3f91340860eb5ee5a884b462c1f238536',
    role: 'genesis_contributor'
  },
  {
    alias: 'Node C',
    nodeId: 'mood:node:e9093c2500f484903a8be3dcba2713de2609bff3391bdafd6da087132f4636d1',
    role: 'genesis_contributor'
  }
];

/** Tagline printed under the logo. */
export const TAGLINE = 'Contribution creates consensus.';
