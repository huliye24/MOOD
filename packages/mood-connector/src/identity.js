/**
 * Connector identity and agent registration.
 *
 * The connector is MOOD's local bridge to AI Agent environments. Its
 * identity is deliberately lightweight: an ID string, a creation date,
 * and a list of registered agents. There is no keypair here.
 *
 * SECURITY INVARIANT: the connector stores NO AI API keys, NO user
 * credentials, NO private keys, and NO file contents read from agent
 * configurations. It records names, types, IDs, and timestamps — that
 * is the entire registry.
 *
 * Storage (inside the standard MOOD home, MOOD_HOME-aware):
 *   ~/.mood/connector/connector-id        # the connector ID (plain text)
 *   ~/.mood/connector/agent-record.json   # { connectorId, createdAt, agents }
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { createHash, randomBytes } from 'crypto';
import { resolveUserHome } from './detector.js';
import { resolveAdapter } from './adapters/index.js';

const CONNECTOR_ID_PREFIX = 'connector:mood:';
const AGENT_ID_PREFIX = 'agent:mood:';

/** Connector paths inside the MOOD home (MOOD_HOME-aware). */
export function connectorPaths({ env = process.env } = {}) {
  const moodRoot = env.MOOD_HOME || join(resolveUserHome(env), '.mood');
  const connectorDir = join(moodRoot, 'connector');
  return {
    moodRoot,
    connectorDir,
    connectorIdFile: join(connectorDir, 'connector-id'),
    agentRecordFile: join(connectorDir, 'agent-record.json'),
  };
}

function readJsonOrNull(file) {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Create the local connector identity. Idempotent — a second call keeps
 * the existing ID (same contract as `mood init`).
 */
export function initConnector({ env = process.env } = {}) {
  const p = connectorPaths({ env });
  mkdirSync(p.connectorDir, { recursive: true });

  const existingId = existsSync(p.connectorIdFile)
    ? readFileSync(p.connectorIdFile, 'utf8').trim()
    : null;

  if (existingId) {
    // Heal a missing record file, but never regenerate the ID.
    if (!readJsonOrNull(p.agentRecordFile)) {
      writeFileSync(p.agentRecordFile, JSON.stringify({
        connectorId: existingId,
        createdAt: new Date().toISOString(),
        agents: [],
      }, null, 2));
    }
    return {
      created: false,
      connectorId: existingId,
      dir: p.connectorDir,
      agentRecordFile: p.agentRecordFile,
    };
  }

  const connectorId = CONNECTOR_ID_PREFIX + randomBytes(16).toString('hex');
  writeFileSync(p.connectorIdFile, `${connectorId}\n`);
  writeFileSync(p.agentRecordFile, JSON.stringify({
    connectorId,
    createdAt: new Date().toISOString(),
    agents: [],
  }, null, 2));
  return {
    created: true,
    connectorId,
    dir: p.connectorDir,
    agentRecordFile: p.agentRecordFile,
  };
}

/**
 * The agent record, or null when the connector is not initialized.
 * Shape: { connectorId, createdAt, agents: [...] }
 */
export function readConnectorRecord({ env = process.env } = {}) {
  const p = connectorPaths({ env });
  const record = readJsonOrNull(p.agentRecordFile);
  if (record && record.connectorId) return record;
  // Legacy/edge: ID file exists but record missing.
  if (existsSync(p.connectorIdFile)) {
    return {
      connectorId: readFileSync(p.connectorIdFile, 'utf8').trim(),
      createdAt: null,
      agents: [],
    };
  }
  return null;
}

/** Is the connector initialized on this machine? */
export function isConnectorInitialized(options) {
  return readConnectorRecord(options) !== null;
}

/**
 * Deterministic agent ID for (connector, agent) — re-registering the
 * same agent always yields the same ID, so registration is idempotent.
 */
function agentIdFor(connectorId, agentKey) {
  const digest = createHash('sha256')
    .update(`${connectorId}:${agentKey}`)
    .digest('hex');
  return AGENT_ID_PREFIX + digest.slice(0, 16);
}

/**
 * Register one AI Agent with this connector.
 *
 * `agent` may be an adapter key ('claude-code'), a display name
 * ('Claude Code'), or a full adapter descriptor. Unknown names register
 * through the generic adapter — other AI systems are first-class.
 *
 * Requires `mood connector init` first (throws NOT_INITIALIZED).
 * Returns { agentId, name, type, registered } — `registered` is false
 * when the agent was already on the record (same ID, no duplicate).
 */
export function registerAgent({ agent, env = process.env } = {}) {
  const descriptor = typeof agent === 'string'
    ? resolveAdapter(agent)
    : agent;
  if (!descriptor || !descriptor.key || !descriptor.name) {
    throw new Error('unknown agent — pass an adapter key, a name, or a descriptor');
  }

  const record = readConnectorRecord({ env });
  if (!record) {
    const err = new Error('connector not initialized — run `mood connector init` first');
    err.code = 'NOT_INITIALIZED';
    throw err;
  }

  const agentId = agentIdFor(record.connectorId, descriptor.key);
  const existing = (record.agents || []).find(
    (a) => a.agentId === agentId || a.key === descriptor.key,
  );
  if (existing) {
    return {
      agentId: existing.agentId,
      name: existing.name,
      type: existing.type,
      registered: false,
    };
  }

  const entry = {
    agentId,
    key: descriptor.key,
    name: descriptor.name,
    type: descriptor.type,
    connectorId: record.connectorId,
    registeredAt: new Date().toISOString(),
  };
  record.agents = [...(record.agents || []), entry];

  const p = connectorPaths({ env });
  writeFileSync(p.agentRecordFile, JSON.stringify(record, null, 2));

  return {
    agentId,
    name: descriptor.name,
    type: descriptor.type,
    registered: true,
  };
}

/**
 * Register many agents at once. Returns the registerAgent result per
 * agent, in input order.
 */
export function registerAgents({ agents, env = process.env } = {}) {
  return (agents || []).map((agent) => registerAgent({ agent, env }));
}
