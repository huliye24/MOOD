/**
 * JSON structured logging for the MOOD node daemon (Node Deployment Alpha 001).
 *
 * One JSON object per line, three sinks under ~/.mood/logs/:
 *
 *   node.log       every record — the full operational trail
 *   error.log      level=error records only
 *   heartbeat.log  heartbeat records only — cheap liveness evidence
 *
 * Record shape (the deployment contract):
 *
 *   { timestamp, level, node_id, event, status, ...fields }
 *
 * timestamp is ISO-8601 UTC; event is a stable snake_case identifier;
 * status is "ok" | "warn" | "error" unless a field overrides it.
 *
 * Logging must never crash the daemon: every write is best-effort.
 */

import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const LEVEL_STATUS = { info: 'ok', warn: 'warn', error: 'error' };

function appendLine(file, record) {
  try {
    appendFileSync(file, JSON.stringify(record) + '\n', 'utf8');
  } catch {
    // logging must never crash the daemon
  }
}

/**
 * Build the node logger. `logsDir` and `nodeId` come from the daemon's
 * already-resolved paths/identity — the logger owns no state reading.
 */
export function createNodeLogger({ logsDir, nodeId }) {
  mkdirSync(logsDir, { recursive: true });
  const files = {
    node: join(logsDir, 'node.log'),
    error: join(logsDir, 'error.log'),
    heartbeat: join(logsDir, 'heartbeat.log'),
  };

  const write = (level, event, fields = {}) => {
    const { status, ...rest } = fields;
    const record = {
      timestamp: new Date().toISOString(),
      level,
      node_id: nodeId,
      event,
      status: status || LEVEL_STATUS[level],
      ...rest,
    };
    appendLine(files.node, record);
    if (level === 'error') appendLine(files.error, record);
    return record;
  };

  return {
    files,
    info: (event, fields) => write('info', event, fields),
    warn: (event, fields) => write('warn', event, fields),
    error: (event, fields) => write('error', event, fields),
    /** Heartbeats go to node.log AND heartbeat.log with event="heartbeat". */
    heartbeat: (fields = {}) => {
      const { status, ...rest } = fields;
      const record = {
        timestamp: new Date().toISOString(),
        level: 'info',
        node_id: nodeId,
        event: 'heartbeat',
        status: status || 'ok',
        ...rest,
      };
      appendLine(files.node, record);
      appendLine(files.heartbeat, record);
      return record;
    },
  };
}
