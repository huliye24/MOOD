/**
 * @mood/connector — the AI Agent contribution connector layer.
 *
 * MOOD does not compete with Claude Code, Codex, or Cursor. Those tools
 * are the engines — they create. The connector is the bridge: it detects
 * which agent environments exist on this machine, holds a lightweight
 * connector identity, registers agents as contributors, and produces
 * Contribution Objects for the MOOD network.
 *
 * Boundary (enforced structurally, not just promised):
 *   - detection is existence-only: no spawning, no config reading
 *   - identity stores no API keys, no credentials, no private keys
 *   - contributions are metadata, not rewards or token accounting
 *
 * "AI creates. MOOD remembers. The network verifies."
 */

export {
  resolveUserHome,
  detectAgents,
  detectedAgents,
} from './detector.js';

export {
  connectorPaths,
  initConnector,
  readConnectorRecord,
  isConnectorInitialized,
  registerAgent,
  registerAgents,
} from './identity.js';

export {
  CONTRIBUTION_TYPE,
  PROOF_PENDING,
  createContributionRecord,
  validateContributionRecord,
} from './contribution.js';

export {
  DETECTABLE_ADAPTERS,
  ADAPTERS_BY_KEY,
  resolveAdapter,
  genericAdapterFor,
  GENERIC_AGENT_TYPE,
} from './adapters/index.js';
