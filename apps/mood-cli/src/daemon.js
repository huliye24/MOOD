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
 *   - runs a maintenance cycle (collect events → verify proofs →
 *     update state → maintain epoch snapshots) on a configurable interval
 *   - heartbeats state.json so `mood status` reflects reality
 *   - writes an hourly runtime report to ~/.mood/reports/
 *   - exits gracefully on the stop flag written by `mood stop`,
 *     or on SIGTERM/SIGINT
 *
 * Node Deployment Alpha 001 upgrades the operational shell only:
 * JSON structured logs ({timestamp, node_id, event, status, …} in
 * logs/node.log, error.log, heartbeat.log), a configurable schedule
 * (see ./scheduler.js — MOOD_TIME_SCALE enables simulation), and runtime
 * metrics persisted into state.json for the dashboard API. The protocol
 * behavior of snapshotting, identity, and sync is unchanged.
 *
 * All logging goes to ~/.mood/logs/*.log — stdout belongs to the
 * human's terminal, not to the daemon.
 */

import {
  existsSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
} from 'fs';
import { join } from 'path';
import {
  StorageManager,
  SyncManager,
  SnapshotManager,
  createNodeManifest,
  createSnapshotAttestation,
  signSnapshot,
} from '@mood/node-runtime';
import {
  listContributions,
  verifyStoredContributions,
} from '@mood/contribution-proof';
import {
  moodPaths,
  readIdentity,
  readPrivateIdentity,
  readConfig,
  readState,
  writeState,
  writeLatestSnapshot,
  readLatestSnapshot,
  isInitialized,
} from './state.js';
import {
  NETWORK_ID,
  RELAY_URL,
  PROTOCOL_VERSION,
} from './config/defaults.js';
import { createNodeLogger } from './logging.js';
import { resolveSchedule } from './scheduler.js';

const CLI_CLIENT_VERSION = 'mood-cli/0.2.0-alpha.2';
const REPORT_KEEP_COUNT = 24;

function ts() {
  return new Date().toISOString();
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
  const identity = readIdentity();
  const privateIdentity = readPrivateIdentity();
  const config = readConfig() || {};

  // Deployment override (Node Deployment Alpha 001): MOOD_RELAY_URL wins
  // over the config file — a containerized daemon reaches the relay
  // through the compose network (ws://mood-relay:8080), not localhost.
  if (process.env.MOOD_RELAY_URL) {
    config.relayUrl = process.env.MOOD_RELAY_URL;
  }

  const networkId = config.networkId || NETWORK_ID;

  const logger = createNodeLogger({ logsDir: paths.logsDir, nodeId: identity.nodeId });
  const schedule = resolveSchedule();

  // ── Runtime metrics (persisted into state.json for the dashboard API) ────

  const startedAtMs = Date.now();
  const cpuStart = process.cpuUsage();
  const metrics = {
    heartbeats: 0,
    eventsCollected: 0,
    proofsVerified: 0,
    proofsInvalid: 0,
    errors: 0,
    snapshots: 0,
    reports: 0,
  };

  const metricsSnapshot = () => {
    const cpu = process.cpuUsage(cpuStart);
    return {
      ...metrics,
      uptimeSeconds: Math.round((Date.now() - startedAtMs) / 1000),
      memoryRssBytes: process.memoryUsage().rss,
      cpuUserMs: Math.round(cpu.user / 1000),
      cpuSystemMs: Math.round(cpu.system / 1000),
      updatedAt: ts(),
    };
  };

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
  updateState({
    ...baseState(),
    simulation: schedule.simulation,
    timeScale: schedule.timeScale,
    metrics: metricsSnapshot(),
  });

  // Boot trail: BOOT → config → identity → state → scheduler.
  logger.info('node_boot', {
    pid: process.pid,
    client_version: CLI_CLIENT_VERSION,
    protocol_version: PROTOCOL_VERSION,
  });
  logger.info('config_loaded', {
    network_id: networkId,
    relay_url: config.relayUrl || RELAY_URL,
    mood_home: paths.root,
  });
  logger.info('identity_loaded', { node_id: identity.nodeId });
  logger.info('state_updated', { status: 'Running', pid: process.pid });
  logger.info('scheduler_started', {
    heartbeat_ms: schedule.heartbeatMs,
    maintenance_ms: schedule.maintenanceMs,
    report_ms: schedule.reportMs,
    relay_retry_ms: schedule.relayRetryMs,
    time_scale: schedule.timeScale,
    simulation: schedule.simulation,
  });

  // ── Relay connection (optional at runtime, retried in background) ────────
  //
  // NOTE: SyncManager.connect() resolves only when the socket CLOSES and
  // rejects on establishment failure — it never resolves while a
  // connection is healthy. The daemon therefore never awaits it: boot
  // proceeds immediately, the 'connected' event drives the authenticated
  // state (and the manifest broadcast), and the promise settling is only
  // the cue for the daemon-level long-interval retry backstop. The
  // SyncManager's own short-interval reconnect covers transient drops.

  let relayRetryTimer = null;

  function scheduleRelayRetry() {
    if (relayRetryTimer) return;
    relayRetryTimer = setTimeout(() => {
      relayRetryTimer = null;
      tryConnect();
    }, schedule.relayRetryMs);
    relayRetryTimer.unref?.();
  }

  function tryConnect() {
    const { state } = sync.getStatus();
    if (state === 'connecting' || state === 'connected' || state === 'authenticated') {
      return; // already established or being attempted
    }
    try {
      sync.connect().then(
        () => scheduleRelayRetry(), // resolved = socket closed → backstop retry
        (err) => {
          logger.warn('relay_unreachable', {
            error: err.message,
            retry_ms: schedule.relayRetryMs,
            mode: 'local',
          });
          updateState({ relay: 'Disconnected' });
          scheduleRelayRetry();
        }
      );
    } catch (err) {
      logger.warn('relay_unreachable', {
        error: err.message,
        retry_ms: schedule.relayRetryMs,
        mode: 'local',
      });
      scheduleRelayRetry();
    }
  }

  sync.on('connected', (info) => {
    logger.info('relay_connected', { relay_url: config.relayUrl || RELAY_URL, info: info || {} });
    updateState({ relay: 'Connected' });
    try {
      sync.broadcastManifest(runtimeIdentity.manifest);
      logger.info('manifest_broadcast', { node_id: identity.nodeId });
    } catch (err) {
      logger.warn('manifest_broadcast_failed', { error: err.message });
    }
  });

  sync.on('disconnected', (info) => {
    logger.warn('relay_disconnected', { info: info || {} });
    updateState({ relay: 'Disconnected' });
  });

  sync.on('manifest', (info) => {
    try {
      const peer = info?.manifest?.nodeId || info?.nodeId;
      if (peer && peer !== identity.nodeId) {
        const peers = new Set([...(readState().connectedPeers || []), peer]);
        updateState({ connectedPeers: [...peers] });
        logger.info('peer_manifest_observed', { peer });
      }
    } catch {
      // never let a peer event crash the daemon
    }
  });

  sync.on('error', (err) => {
    logger.warn('sync_error', { error: err?.message || String(err) });
  });

  tryConnect();

  // ── Maintenance cycle ─────────────────────────────────────────────────────
  //
  // Every maintenanceMs: collect events → verify proofs → maintain
  // snapshots → update state. Proof verification is recomputation, never
  // a stored flag (S14). Snapshot protocol behavior is unchanged from the
  // pre-deployment daemon — only its cadence is configurable.

  function collectEvents() {
    try {
      const items = listContributions();
      return {
        events: items.filter((item) => item.event).length,
        proofs: items.filter((item) => item.proof).length,
      };
    } catch {
      return { events: 0, proofs: 0 };
    }
  }

  function verifyProofs() {
    try {
      const result = verifyStoredContributions();
      return { total: result.total, passed: result.passed, failed: result.failed };
    } catch (err) {
      metrics.errors += 1;
      logger.error('proof_verification_failed', { error: err.message });
      return null;
    }
  }

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
      metrics.snapshots += 1;
      logger.info('snapshot_created', {
        epoch_id: snapshot.epochId,
        epoch_number: snapshot.epochNumber,
        digest: snapshot.digest,
        contributions: contributions.length,
      });
    } catch (err) {
      metrics.errors += 1;
      logger.error('snapshot_maintenance_failed', { error: err.message });
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

  function runMaintenanceCycle() {
    const collected = collectEvents();
    metrics.eventsCollected = collected.events;

    const verification = verifyProofs();
    if (verification) {
      metrics.proofsVerified = verification.passed;
      metrics.proofsInvalid = verification.failed;
    }

    maintainSnapshots();

    updateState({
      metrics: metricsSnapshot(),
      lastMaintenanceAt: ts(),
    });
    logger.info('maintenance_cycle', {
      events: collected.events,
      proofs: collected.proofs,
      verified: verification ? verification.passed : null,
      invalid: verification ? verification.failed : null,
    });
  }

  // ── Runtime report (hourly by default, simulation-scaled) ─────────────────

  function pruneReports() {
    try {
      const files = readdirSync(paths.reportsDir)
        .filter((f) => f.startsWith('runtime-report-') && f.endsWith('.json'))
        .sort(); // report filenames are sortable timestamps
      for (const name of files.slice(0, Math.max(0, files.length - REPORT_KEEP_COUNT))) {
        rmSync(join(paths.reportsDir, name));
      }
    } catch {
      // pruning is best-effort
    }
  }

  function writeRuntimeReport() {
    try {
      mkdirSync(paths.reportsDir, { recursive: true });
      const now = ts();
      const snap = readLatestSnapshot();
      const report = {
        generatedAt: now,
        nodeId: identity.nodeId,
        networkId,
        simulation: schedule.simulation,
        timeScale: schedule.timeScale,
        metrics: metricsSnapshot(),
        relay: readState().relay || 'Disconnected',
        epoch: snap
          ? { epochId: snap.epochId, epochNumber: snap.epochNumber, digest: snap.digest }
          : null,
      };
      const fileName = `runtime-report-${now.replace(/[:.]/g, '-')}.json`;
      writeFileSync(join(paths.reportsDir, fileName), JSON.stringify(report, null, 2) + '\n');
      metrics.reports += 1;
      pruneReports();
      logger.info('runtime_report', {
        file: fileName,
        reports: metrics.reports,
        uptime_seconds: report.metrics.uptimeSeconds,
      });
      return fileName;
    } catch (err) {
      metrics.errors += 1;
      logger.error('runtime_report_failed', { error: err.message });
      return null;
    }
  }

  // ── Heartbeat ─────────────────────────────────────────────────────────────

  const heartbeat = () => {
    try {
      const status = sync.getStatus();
      metrics.heartbeats += 1;
      const snapshot = metricsSnapshot();
      updateState({
        status: 'Running',
        pid: process.pid,
        lastHeartbeat: ts(),
        connectedPeers: status.connectedPeers || [],
        knownObjects: status.knownObjects || 0,
        metrics: snapshot,
      });
      logger.heartbeat({
        heartbeat_count: metrics.heartbeats,
        connected_peers: (status.connectedPeers || []).length,
        known_objects: status.knownObjects || 0,
        uptime_seconds: snapshot.uptimeSeconds,
        memory_rss_bytes: snapshot.memoryRssBytes,
      });
    } catch (err) {
      metrics.errors += 1;
      logger.error('heartbeat_failed', { error: err.message });
    }
  };

  // ── Start the cycles ──────────────────────────────────────────────────────

  heartbeat();
  runMaintenanceCycle();

  const heartbeatTimer = setInterval(heartbeat, schedule.heartbeatMs);
  heartbeatTimer.unref?.();
  const maintenanceTimer = setInterval(runMaintenanceCycle, schedule.maintenanceMs);
  maintenanceTimer.unref?.();
  const reportTimer = setInterval(writeRuntimeReport, schedule.reportMs);
  reportTimer.unref?.();

  // ── Shutdown ──────────────────────────────────────────────────────────────

  let shuttingDown = false;
  let stopPollTimer = null;

  function shutdown(reason) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info('node_stop', { reason });

    clearInterval(heartbeatTimer);
    clearInterval(maintenanceTimer);
    clearInterval(reportTimer);
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

    const finalMetrics = metricsSnapshot();
    writeState({
      status: 'Stopped',
      pid: null,
      stoppedAt: ts(),
      connectedPeers: [],
      relay: 'Disconnected',
      metrics: finalMetrics,
    });
    logger.info('node_stopped', { reason, ...finalMetrics });

    process.exit(0);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    metrics.errors += 1;
    logger.error('uncaught_exception', { error: err?.stack || String(err) });
    shutdown('uncaught exception');
  });

  // Cross-platform cooperative stop: `mood stop` writes a flag file and
  // also signals the pid; whichever arrives first wins.
  stopPollTimer = setInterval(() => {
    if (existsSync(paths.stopFlagFile)) {
      shutdown('stop flag');
    }
  }, schedule.stopPollMs);

  // Keep the event loop alive: every other timer is unref'd so a clean
  // process.exit(0) in shutdown is the only exit path.
  const keepAlive = setInterval(() => {}, 1 << 30);
}

export function run(args, flags) {
  return runDaemon();
}

export default { run };
