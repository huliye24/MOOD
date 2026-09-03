/**
 * MOOD node daemon — the background runtime spawned by `mood start`.
 *
 * This mirrors the Electron client's runtime wiring exactly, using the
 * same @mood/node-runtime managers over the same ~/.mood/ root:
 *
 *   StorageManager({ dataDir: ~/.mood })
 *   SyncManager({ relayUrl, identity })
 *   SnapshotManager({ dataDir: ~/.mood, networkId })
 *
 * The daemon:
 *   - marks state.json as Running (pid, startedAt) immediately
 *   - attempts relay connection (a node runs even when the relay is
 *     unreachable — like a full node running offline)
 *   - creates epoch snapshots of the local contribution set
 *   - heartbeats state.json so `mood status` reflects reality
 *   - exits gracefully on the stop flag written by `mood stop`,
 *     or on SIGTERM/SIGINT
 *
 * All logging goes to ~/.mood/logs/node.log — stdout belongs to the
 * human's terminal, not to the daemon.
 */

import { existsSync, rmSync, appendFileSync } from 'fs';
import {
  StorageManager,
  SyncManager,
  SnapshotManager,
  createNodeManifest,
  createSnapshotAttestation,
  signSnapshot,
} from '@mood/node-runtime';
import {
  moodPaths,
  readIdentity,
  readPrivateIdentity,
  readConfig,
  readState,
  writeState,
  writeLatestSnapshot,
  isInitialized,
} from './state.js';
import {
  NETWORK_ID,
  RELAY_URL,
  PROTOCOL_VERSION,
} from './config/defaults.js';

const CLI_CLIENT_VERSION = 'mood-cli/0.2.0-alpha.2';
const HEARTBEAT_INTERVAL_MS = 30_000;
const SNAPSHOT_CHECK_INTERVAL_MS = 60_000;
const RELAY_RETRY_INTERVAL_MS = 60_000;
const STOP_POLL_INTERVAL_MS = 1_000;

function ts() {
  return new Date().toISOString();
}

function createLogger(logFile) {
  const log = (level, msg) => {
    try {
      appendFileSync(logFile, `[${ts()}] [${level}] ${msg}\n`);
    } catch {
      // logging must never crash the daemon
    }
  };
  return {
    info: (msg) => log('INFO', msg),
    warn: (msg) => log('WARN', msg),
    error: (msg) => log('ERROR', msg),
  };
}

/** Build the runtime identity view SyncManager expects. */
function buildRuntimeIdentity(identity, privateIdentity, config) {
  const manifest = createNodeManifest({
    nodeId: identity.nodeId,
    memberSubjectId: null,
    publicKey: identity.publicKey,
    networkId: identity.networkId || NETWORK_ID,
    nodeType: 'developer',
    clientVersion: CLI_CLIENT_VERSION,
    protocolVersion: '0.2.0',
    relayUrl: config?.relayUrl || RELAY_URL,
  });
  return {
    nodeId: identity.nodeId,
    publicKey: identity.publicKey,
    secretKey: privateIdentity?.privateKey || null,
    manifest,
  };
}

export async function runDaemon() {
  if (!isInitialized()) {
    process.stderr.write('mood daemon: node not initialized — run `mood init` first\n');
    process.exit(1);
  }

  const paths = moodPaths();
  const logger = createLogger(paths.logFile);
  const identity = readIdentity();
  const privateIdentity = readPrivateIdentity();
  const config = readConfig() || {};
  const networkId = config.networkId || NETWORK_ID;

  // ── Runtime managers (identical wiring to the desktop client) ────────────

  const storage = new StorageManager({
    dataDir: paths.root,
    nodeId: identity.nodeId,
  }).initialize();

  const snapshotManager = new SnapshotManager({
    dataDir: paths.root,
    networkId,
  }).initialize();

  const runtimeIdentity = buildRuntimeIdentity(identity, privateIdentity, config);

  const sync = new SyncManager({
    relayUrl: config.relayUrl || RELAY_URL,
    identity: runtimeIdentity,
  });

  // ── State helpers ─────────────────────────────────────────────────────────

  const baseState = () => ({
    ...readState(),
    status: 'Running',
    pid: process.pid,
    startedAt: readState().startedAt || ts(),
  });

  const updateState = (patch) => {
    writeState({ ...readState(), ...patch });
  };

  // Mark Running before anything that can fail — `mood start` waits for this.
  updateState(baseState());
  logger.info(`MOOD node daemon started (pid ${process.pid}, node ${identity.nodeId})`);
  logger.info(`network=${networkId} relay=${config.relayUrl || RELAY_URL} protocol=v${PROTOCOL_VERSION}`);

  // ── Relay connection (optional at runtime, retried in background) ────────

  let relayRetryTimer = null;

  async function tryConnect() {
    try {
      await sync.connect();
      logger.info('relay connection established');
      try {
        sync.broadcastManifest(runtimeIdentity.manifest);
        logger.info('manifest broadcast');
      } catch (err) {
        logger.warn(`manifest broadcast failed: ${err.message}`);
      }
    } catch (err) {
      logger.warn(`relay unreachable (${err.message}) — node continues in local mode, retrying in ${RELAY_RETRY_INTERVAL_MS / 1000}s`);
      relayRetryTimer = setTimeout(() => {
        tryConnect().catch(() => {});
      }, RELAY_RETRY_INTERVAL_MS);
      relayRetryTimer.unref?.();
    }
  }

  sync.on('connected', (info) => {
    logger.info(`relay connected: ${JSON.stringify(info)}`);
    updateState({ relay: 'Connected' });
  });

  sync.on('disconnected', (info) => {
    logger.warn(`relay disconnected: ${JSON.stringify(info || {})}`);
    updateState({ relay: 'Disconnected' });
  });

  sync.on('manifest', (info) => {
    try {
      const peer = info?.manifest?.nodeId || info?.nodeId;
      if (peer && peer !== identity.nodeId) {
        const peers = new Set([...(readState().connectedPeers || []), peer]);
        updateState({ connectedPeers: [...peers] });
        logger.info(`peer manifest observed: ${peer}`);
      }
    } catch {
      // never let a peer event crash the daemon
    }
  });

  sync.on('error', (err) => {
    logger.warn(`sync error: ${err?.message || err}`);
  });

  await tryConnect().catch(() => {});

  // ── Snapshot maintenance ──────────────────────────────────────────────────

  /**
   * Create an epoch snapshot over the current local contribution set when
   * it has grown since the last snapshot. Empty-set snapshots are valid
   * (like a genesis block over zero transactions) and are created once
   * so the node always has a verifiable digest.
   */
  function maintainSnapshots() {
    try {
      const contributions = storage.listContributions();
      const latest = snapshotManager.getAllSnapshots()
        .sort((a, b) => (b.epochNumber || 0) - (a.epochNumber || 0))[0];
      const snapshotted = latest ? latest.contributionCount || 0 : -1;

      if (contributions.length <= snapshotted && latest) {
        return; // no new contributions — epoch does not advance
      }

      const snapshot = snapshotManager.createEpochSnapshot({
        contributions,
        memberCount: 1,
        policyVersion: 'alpha-002',
        nodeId: identity.nodeId,
      });

      // Attest our own snapshot with the node key (reused runtime logic).
      const signature = signSnapshot(snapshot, privateIdentity.privateKey);
      const attestation = createSnapshotAttestation({
        snapshotId: snapshot.snapshotId,
        digest: snapshot.digest,
        epochId: snapshot.epochId,
        nodeId: identity.nodeId,
        nodeManifest: runtimeIdentity.manifest,
        signature,
      });
      snapshotManager.addAttestation(snapshot, attestation);

      // Update the CLI pointer (used by `mood status` / `mood snapshot verify`).
      writeLatestPointer(snapshot);
      logger.info(`epoch ${snapshot.epochId} snapshot created: ${snapshot.digest} (${contributions.length} contributions)`);
    } catch (err) {
      logger.error(`snapshot maintenance failed: ${err.message}`);
    }
  }

  function writeLatestPointer(snapshot) {
    writeLatestSnapshot({
      snapshotId: snapshot.snapshotId,
      snapshotFile: `${snapshot.snapshotId}.json`,
      epochId: snapshot.epochId,
      epochNumber: snapshot.epochNumber,
      digest: snapshot.digest.replace(/^sha256:/, ''),
      agreement: 'Verified',
      attestationCount: (snapshot.attestations || []).length,
      updatedAt: ts(),
    });
  }

  maintainSnapshots();

  const snapshotTimer = setInterval(maintainSnapshots, SNAPSHOT_CHECK_INTERVAL_MS);
  snapshotTimer.unref?.();

  // ── Heartbeat ─────────────────────────────────────────────────────────────

  const heartbeat = () => {
    try {
      const status = sync.getStatus();
      updateState({
        status: 'Running',
        pid: process.pid,
        lastHeartbeat: ts(),
        connectedPeers: status.connectedPeers || [],
        knownObjects: status.knownObjects || 0,
      });
    } catch (err) {
      logger.warn(`heartbeat failed: ${err.message}`);
    }
  };
  heartbeat();
  const heartbeatTimer = setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);
  heartbeatTimer.unref?.();

  // ── Shutdown ──────────────────────────────────────────────────────────────

  let shuttingDown = false;
  let stopPollTimer = null;

  function shutdown(reason) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`daemon shutting down (${reason})`);

    clearInterval(heartbeatTimer);
    clearInterval(snapshotTimer);
    if (relayRetryTimer) clearTimeout(relayRetryTimer);
    if (stopPollTimer) clearInterval(stopPollTimer);
    clearInterval(keepAlive);

    try {
      sync.disconnect();
    } catch {
      // best effort
    }

    try {
      if (existsSync(paths.stopFlagFile)) {
        rmSync(paths.stopFlagFile);
      }
    } catch {
      // best effort
    }

    writeState({
      status: 'Stopped',
      pid: null,
      stoppedAt: ts(),
      connectedPeers: [],
      relay: 'Disconnected',
    });
    logger.info('daemon stopped');

    process.exit(0);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.error(`uncaught exception: ${err?.stack || err}`);
    shutdown('uncaught exception');
  });

  // Cross-platform cooperative stop: `mood stop` writes a flag file and
  // also signals the pid; whichever arrives first wins.
  stopPollTimer = setInterval(() => {
    if (existsSync(paths.stopFlagFile)) {
      shutdown('stop flag');
    }
  }, STOP_POLL_INTERVAL_MS);

  // Keep the event loop alive: every other timer is unref'd so a clean
  // process.exit(0) in shutdown is the only exit path.
  const keepAlive = setInterval(() => {}, 1 << 30);
}

export function run(args, flags) {
  return runDaemon();
}

export default { run };
