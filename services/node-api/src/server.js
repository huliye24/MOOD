/**
 * MOOD Node API — the AI Agent entry to a MOOD node.
 *
 *   Human  → mood CLI   → MOOD Node
 *   Agent  → MOOD API   → MOOD Node   (this file)
 *
 * The API is a thin, deterministic read/control surface over the same
 * node the CLI drives. It contains no protocol logic of its own:
 *
 *   reads      → ~/.mood/ files (the documented on-disk contract)
 *   verify     → @mood/node-runtime (digest verification)
 *   proofs     → @mood/contribution-proof (contribution verification)
 *   objects    → @mood/protocol-object (protocol object verification)
 *   lifecycle  → the canonical `mood start` / `mood stop` commands
 *
 * Security posture:
 *   - binds 127.0.0.1 by default (local-only; MOOD_API_BIND overrides)
 *   - optional API key (MOOD_API_KEY), constant-time checked
 *   - Host-header validation (DNS-rebinding defense)
 *   - NEVER reads identity/private.json — the private key never enters
 *     this process
 *
 * Standalone entry:  node src/server.js
 * Programmatic:      import { createApp } from '@mood/node-api'
 */

import express from 'express';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { moodPaths } from './state.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { fail } from './errors.js';
import nodeRoutes from './routes/node.js';
import identityRoutes from './routes/identity.js';
import peersRoutes from './routes/peers.js';
import snapshotRoutes from './routes/snapshot.js';
import connectorRoutes from './routes/connector.js';
import contributionsRoutes from './routes/contributions.js';
import objectsRoutes from './routes/objects.js';

const DEFAULT_PORT = 8788;
const DEFAULT_BIND = '127.0.0.1';
const STOP_POLL_INTERVAL_MS = 1_000;

// Hostnames a local request may legitimately carry. Anything else (e.g. a
// DNS-rebinded domain) is refused — a browser-based attacker must not be
// able to reach this port through their own domain resolving to loopback.
const ALLOWED_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]']);

function hostAllowed(hostHeader) {
  if (!hostHeader) return false;
  const bare = hostHeader.replace(/:\d+$/, ''); // strip :port
  return ALLOWED_HOSTS.has(bare);
}

/**
 * Build the Express app. `options.apiKey` enables Bearer auth when set.
 */
export function createApp({ apiKey } = {}) {
  const app = express();
  app.disable('x-powered-by');

  // DNS-rebinding defense: applies to every route, /health included.
  app.use((req, res, next) => {
    if (!hostAllowed(req.get('host'))) {
      fail(res, 403, 'FORBIDDEN_HOST', 'Requests must target 127.0.0.1 or localhost');
      return;
    }
    next();
  });

  // Liveness probe — intentionally before auth and intentionally minimal:
  // it says only that the service is up. No node data, no key required.
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'mood-api' });
  });

  // Everything below requires the API key when one is configured.
  app.use(createAuthMiddleware({ apiKey }));

  // JSON body parsing — mounted AFTER auth so an unauthorized request
  // never triggers a parse. Bodies are tiny (a ContributionProof is a
  // few hundred bytes); the limit reflects that.
  app.use(express.json({ limit: '64kb' }));

  app.use('/node', nodeRoutes);
  app.use('/identity', identityRoutes);
  app.use('/peers', peersRoutes);
  app.use('/snapshot', snapshotRoutes);
  app.use('/connector', connectorRoutes);
  app.use('/contributions', contributionsRoutes);
  app.use('/objects', objectsRoutes);

  // Unknown endpoint — stable machine envelope, same as every other error.
  app.use((req, res) => {
    fail(res, 404, 'NOT_FOUND', `Unknown endpoint: ${req.method} ${req.path}`);
  });

  // Malformed JSON in a request body: a stable 400 envelope, not a
  // fall-through 500.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err && err.type === 'entity.parse.failed') {
      fail(res, 400, 'INVALID_REQUEST', 'Request body is not valid JSON');
      return;
    }
    next(err);
  });

  // Last-resort handler for unexpected route errors.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    fail(res, err.status || 500, err.code || 'INTERNAL', err.message || 'Internal error');
  });

  return app;
}

// ── Standalone entry ─────────────────────────────────────────────────────────

function ts() {
  return new Date().toISOString();
}

function createLogger(logFile) {
  const log = (level, msg) => {
    try {
      appendFileSync(logFile, `[${ts()}] [${level}] ${msg}\n`);
    } catch {
      // logging must never crash the server
    }
  };
  return {
    info: (msg) => log('INFO', msg),
    warn: (msg) => log('WARN', msg),
    error: (msg) => log('ERROR', msg),
  };
}

function isMain() {
  return import.meta.url === pathToFileURL(process.argv[1] || '').href;
}

async function main() {
  const port = Number(process.env.MOOD_API_PORT) || DEFAULT_PORT;
  const bind = process.env.MOOD_API_BIND || DEFAULT_BIND;
  const apiKey = process.env.MOOD_API_KEY || null;

  const paths = moodPaths();
  mkdirSync(paths.root, { recursive: true });
  mkdirSync(join(paths.root, 'logs'), { recursive: true });
  const logger = createLogger(join(paths.root, 'logs', 'api.log'));

  const app = createApp({ apiKey });
  const server = app.listen(port, bind);

  server.on('error', (err) => {
    logger.error(`failed to listen on ${bind}:${port} — ${err.code || err.message}`);
    process.exit(1);
  });

  server.on('listening', () => {
    // The API writes its own state file, exactly like the node daemon
    // does. `mood api status` / `mood api stop` read this file.
    writeFileSync(paths.apiStateFile, JSON.stringify({
      status: 'Running',
      pid: process.pid,
      port,
      bind,
      startedAt: ts(),
      key: apiKey ? 'enabled' : 'disabled',
    }, null, 2));
    logger.info(`mood-api listening on ${bind}:${port} (key ${apiKey ? 'enabled' : 'disabled'})`);
    if (bind !== '127.0.0.1' && bind !== 'localhost' && bind !== '::1') {
      logger.warn(`binding to ${bind} exposes the API beyond this machine — intended only for explicit operator override`);
    }
  });

  // ── Shutdown (mirrors the node daemon's cooperative pattern) ────────────

  const stopFlagFile = join(paths.root, 'api-stop');

  let shuttingDown = false;
  let stopPollTimer = null;
  let keepAlive = null;

  function shutdown(reason) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`api shutting down (${reason})`);

    if (stopPollTimer) clearInterval(stopPollTimer);
    if (keepAlive) clearInterval(keepAlive);

    try {
      if (existsSync(stopFlagFile)) rmSync(stopFlagFile);
    } catch {
      // best effort
    }

    try {
      writeFileSync(paths.apiStateFile, JSON.stringify({
        status: 'Stopped',
        pid: null,
        port,
        bind,
        stoppedAt: ts(),
      }, null, 2));
    } catch {
      // best effort
    }

    try {
      server.close(() => process.exit(0));
      // Fallback if sockets linger.
      setTimeout(() => process.exit(0), 2_000).unref?.();
    } catch {
      process.exit(0);
    }
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.error(`uncaught exception: ${err?.stack || err}`);
    shutdown('uncaught exception');
  });

  // Cross-platform cooperative stop: `mood api stop` writes a flag file and
  // also signals the pid; whichever arrives first wins.
  stopPollTimer = setInterval(() => {
    if (existsSync(stopFlagFile)) {
      shutdown('stop flag');
    }
  }, STOP_POLL_INTERVAL_MS);

  // Keep the event loop alive: every other timer is unref'd so a clean
  // process.exit(0) in shutdown is the only exit path.
  keepAlive = setInterval(() => {}, 1 << 30);
}

if (isMain()) {
  main();
}
