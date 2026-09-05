/**
 * Daemon schedule resolution (Node Deployment Alpha 001).
 *
 * Every daemon cycle is configurable so the same binary serves production
 * cadence and compressed simulation runs:
 *
 *   heartbeat    default 60s    MOOD_HEARTBEAT_INTERVAL_MS
 *   maintenance  default 5min   MOOD_MAINTENANCE_INTERVAL_MS
 *   report       default 1h     MOOD_REPORT_INTERVAL_MS
 *   relayRetry   default 60s    MOOD_RELAY_RETRY_INTERVAL_MS
 *   stopPoll     fixed 1s       (never scaled — stop latency is real-time)
 *
 * MOOD_TIME_SCALE=N divides the four configurable intervals: scale 60
 * turns 1 real minute into 1 simulated hour (24 simulated hours run in
 * 24 real minutes). MOOD_SIMULATION=1 marks the run as simulation in
 * state/logs/reports even at normal cadence.
 *
 * Invalid values never crash the node: they fall back to defaults, and the
 * daemon logs the resolved schedule at boot so misconfiguration is visible.
 */

export const DEFAULT_SCHEDULE = {
  heartbeatMs: 60_000,
  maintenanceMs: 300_000,
  reportMs: 3_600_000,
  relayRetryMs: 60_000,
  stopPollMs: 1_000,
};

const MIN_INTERVAL_MS = 100;

function intFromEnv(raw, fallback) {
  if (raw === undefined || raw === null || raw === '') return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function scaleFromEnv(raw) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function scaled(ms, scale) {
  return Math.max(MIN_INTERVAL_MS, Math.round(ms / scale));
}

/**
 * Resolve the daemon schedule from environment. Pure — the daemon logs
 * the result; this function never reads or writes anything else.
 */
export function resolveSchedule(env = process.env) {
  const scale = scaleFromEnv(env.MOOD_TIME_SCALE);
  const schedule = {
    heartbeatMs: scaled(intFromEnv(env.MOOD_HEARTBEAT_INTERVAL_MS, DEFAULT_SCHEDULE.heartbeatMs), scale),
    maintenanceMs: scaled(intFromEnv(env.MOOD_MAINTENANCE_INTERVAL_MS, DEFAULT_SCHEDULE.maintenanceMs), scale),
    reportMs: scaled(intFromEnv(env.MOOD_REPORT_INTERVAL_MS, DEFAULT_SCHEDULE.reportMs), scale),
    relayRetryMs: scaled(intFromEnv(env.MOOD_RELAY_RETRY_INTERVAL_MS, DEFAULT_SCHEDULE.relayRetryMs), scale),
    stopPollMs: DEFAULT_SCHEDULE.stopPollMs,
    timeScale: scale,
    simulation: env.MOOD_SIMULATION === '1' || scale !== 1,
  };
  return schedule;
}
