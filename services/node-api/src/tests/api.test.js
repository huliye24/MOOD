/**
 * MOOD Agent Layer API test suite.
 *
 * End-to-end: every case spawns the REAL server (src/server.js) as a
 * subprocess with an isolated MOOD_HOME, and every HTTP request is a real
 * HTTP request — exactly what an AI Agent will do. Covered per the
 * Alpha 001 spec:
 *
 *   1. Health          — documented body (deployment-extended), open auth
 *   2. Node status     — shape, values, determinism (byte-identical)
 *   3. Identity        — public fields only; PRIVATE KEY NEVER APPEARS;
 *                       protocol record, legacy fallback, tamper → 500
 *   4. Snapshot        — verified digest; tamper → unverified; none → 404
 *   5. Authentication  — Bearer key: 401 / 401 / 200; /health stays open
 *   6. Host validation — DNS-rebinding Host → 403
 *   7. Lifecycle       — POST /node/start, /node/stop (real daemon, idempotent)
 *   8. Not initialized — 409 envelope on every data endpoint
 *   9. Unknown route   — 404 envelope
 *  10. Connector       — /connector/status independent of node identity
 *  11. Contributions   — GET /contributions, POST /contributions/verify;
 *                       tampering detected; secrets never served
 *  12. Objects         — GET /objects, GET /objects/:id, POST /objects/verify;
 *                       a foreign object verifies; tampering detected
 *  13. Deployment      — dashboard: /status, /metrics, /events,
 *                       /contribution (reputation honestly not_implemented),
 *                       /node alias, MOOD_API_ALLOWED_HOSTS
 *
 * Run: npm test   (from services/node-api)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import http from 'node:http';
import net from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSnapshot } from '@mood/node-runtime/snapshot';

const __filename = fileURLToPath(import.meta.url);
const SERVER = resolve(__filename, '..', '..', 'server.js');
const MOOD_BIN = resolve(__filename, '..', '..', '..', '..', '..', 'apps', 'mood-cli', 'bin', 'mood.js');

const NODE_ID_RE = /^mood:node:[0-9a-f]{64}$/;

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function rmRetry(target) {
  // Windows can hold files briefly after process death — retry a few times.
  for (let i = 0; i < 5; i++) {
    try {
      rmSync(target, { recursive: true, force: true });
      return;
    } catch {
      // retry
    }
  }
  try {
    rmSync(target, { recursive: true, force: true });
  } catch {
    // leaked sandbox is cleaned by the OS tmp cleaner — never fail a test on it
  }
}

/** Fresh sandbox: isolated MOOD_HOME that may or may not be initialized. */
function sandbox() {
  const root = mkdtempSync(join(tmpdir(), 'mood-api-test-'));
  const home = join(root, 'home');
  mkdirSync(home);
  return {
    home,
    root,
    cleanup() {
      // Kill a daemon the API may have started, then remove the tree.
      try {
        const st = JSON.parse(readFileSync(join(home, 'state.json'), 'utf8'));
        if (st.pid) {
          try {
            process.kill(st.pid);
          } catch {
            // already gone
          }
        }
      } catch {
        // no state file — nothing to kill
      }
      rmRetry(root);
    },
  };
}

/** Run the real CLI in a sandbox home. */
function mood(box, args) {
  return spawnSync(process.execPath, [MOOD_BIN, ...args], {
    encoding: 'utf8',
    env: { ...process.env, MOOD_HOME: box.home },
  });
}

/** Reserve a free TCP port. */
function freePort() {
  return new Promise((res, rej) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => res(port));
    });
    srv.on('error', rej);
  });
}

/** Spawn the real API server and wait until /health answers. */
async function startApiServer({ home, port, key, extraEnv }) {
  const env = {
    ...process.env,
    MOOD_HOME: home,
    MOOD_API_PORT: String(port),
    MOOD_API_BIND: '127.0.0.1',
  };
  if (key) env.MOOD_API_KEY = key;
  if (extraEnv) Object.assign(env, extraEnv);

  const child = spawn(process.execPath, [SERVER], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/health`, {
        signal: AbortSignal.timeout(500),
      });
      if (r.ok) return child;
    } catch {
      // not up yet
    }
    if (child.exitCode !== null) {
      throw new Error(`API server exited early (code ${child.exitCode})`);
    }
    await sleep(100);
  }
  child.kill();
  throw new Error('API server did not become healthy');
}

/** Stop an API server started by startApiServer. */
function stopApiServer(child) {
  if (child && child.exitCode === null) {
    child.kill();
  }
}

/** Run `mood init` in a sandbox home and assert it succeeded. */
function moodInitOk(box) {
  const r = mood(box, ['init']);
  assert.equal(r.status, 0, `mood init failed:\n${r.stderr}\n${r.stdout}`);
}

async function getJson(port, path, headers = {}) {
  const res = await fetch(`http://127.0.0.1:${port}${path}`, { headers });
  const text = await res.text();
  return { status: res.status, text, body: safeJson(text) };
}

async function postJson(port, path, headers = {}) {
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: 'POST',
    headers,
  });
  const text = await res.text();
  return { status: res.status, text, body: safeJson(text) };
}

/** POST with a JSON body (object, or raw string for malformed payloads). */
async function postJsonBody(port, path, body, headers = {}) {
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, text, body: safeJson(text) };
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Raw HTTP request with a custom Host header (fetch forbids nothing here,
 * but node:http makes forbidden-header handling explicit). */
function requestWithHost(port, path, host) {
  return new Promise((res, rej) => {
    const req = http.request(
      { host: '127.0.0.1', port, path, headers: { Host: host } },
      (r) => {
        let data = '';
        r.on('data', (d) => { data += d; });
        r.on('end', () => res({ status: r.statusCode, text: data, body: safeJson(data) }));
      },
    );
    req.on('error', rej);
    req.end();
  });
}

/** Write a real snapshot into a sandbox home the way the daemon does. */
function writeSnapshotFixture(home, { epochNumber = 1, tamper = false } = {}) {
  const snapshot = createSnapshot({
    epochNumber,
    contributions: [],
    networkId: 'mood-testnet-001',
    protocolVersion: '0.1',
    policyVersion: 'alpha-002',
    memberCount: 1,
    issuerNodeId: 'mood:node:fixture',
  });
  if (tamper) {
    // Corrupt the data AFTER the digest was computed — a tampered file on disk.
    snapshot.contributions.push({
      contributionId: 'fake:injected',
      contentFingerprint: 'sha256:deadbeef',
      status: 'Accepted',
    });
  }
  const snapshotsDir = join(home, 'snapshots');
  mkdirSync(snapshotsDir, { recursive: true });
  const snapshotFile = `${snapshot.snapshotId}.json`;
  writeFileSync(join(snapshotsDir, snapshotFile), JSON.stringify(snapshot, null, 2));
  writeFileSync(join(snapshotsDir, 'latest.json'), JSON.stringify({
    snapshotId: snapshot.snapshotId,
    snapshotFile,
    epochId: snapshot.epochId,
    epochNumber: snapshot.epochNumber,
    digest: snapshot.digest.replace(/^sha256:/, ''),
    agreement: 'Verified',
    attestationCount: 0,
    updatedAt: new Date().toISOString(),
  }, null, 2));
  return snapshot;
}

// ── 1. Health + unknown route + uninitialized envelopes ─────────────────────

test('health: documented body, no auth required, honest when uninitialized', async () => {
  const box = sandbox();
  let child;
  let keyedChild;
  try {
    const port = await freePort();
    child = await startApiServer({ home: box.home, port });

    const r = await getJson(port, '/health');
    assert.equal(r.status, 200);
    assert.deepEqual(Object.keys(r.body).sort(), [
      'lastHeartbeat', 'nodeId', 'service', 'status', 'uptimeSeconds', 'version',
    ]);
    assert.equal(r.body.status, 'ok');
    assert.equal(r.body.service, 'mood-api');
    assert.equal(r.body.nodeId, null, 'uninitialized node → null, not an error');
    assert.equal(r.body.lastHeartbeat, null);
    assert.equal(typeof r.body.uptimeSeconds, 'number');
    assert.equal(typeof r.body.version, 'string');

    // Liveness stays open even when a key is configured.
    const keyPort = await freePort();
    keyedChild = await startApiServer({ home: box.home, port: keyPort, key: 'k' });
    const open = await getJson(keyPort, '/health');
    assert.equal(open.status, 200);
    assert.equal(open.body.status, 'ok');
  } finally {
    stopApiServer(child);
    stopApiServer(keyedChild);
    box.cleanup();
  }
});

test('not initialized: every data endpoint answers the 409 envelope', async () => {
  const box = sandbox();
  let child;
  try {
    const port = await freePort();
    child = await startApiServer({ home: box.home, port });

    for (const path of ['/node', '/node/status', '/identity', '/peers', '/snapshot', '/status', '/metrics']) {
      const r = await getJson(port, path);
      assert.equal(r.status, 409, `${path} → 409`);
      assert.equal(r.body.ok, false, `${path} → ok:false`);
      assert.equal(r.body.error.code, 'NOT_INITIALIZED', `${path} → NOT_INITIALIZED`);
    }
  } finally {
    stopApiServer(child);
    box.cleanup();
  }
});

test('unknown route: stable 404 envelope', async () => {
  const box = sandbox();
  let child;
  try {
    const port = await freePort();
    child = await startApiServer({ home: box.home, port });

    const r = await getJson(port, '/definitely/not/an/endpoint');
    assert.equal(r.status, 404);
    assert.equal(r.body.ok, false);
    assert.equal(r.body.error.code, 'NOT_FOUND');
  } finally {
    stopApiServer(child);
    box.cleanup();
  }
});

// ── 2 + 3. Initialized node: status shape, identity security ────────────────

test('node status + identity + peers on an initialized (stopped) node', async () => {
  const box = sandbox();
  let child;
  try {
    moodInitOk(box);
    const identity = JSON.parse(readFileSync(join(box.home, 'identity', 'node.json'), 'utf8'));

    const port = await freePort();
    child = await startApiServer({ home: box.home, port });

    // /node/status — the documented shape, exactly these keys.
    const r = await getJson(port, '/node/status');
    assert.equal(r.status, 200);
    assert.deepEqual(Object.keys(r.body).sort(),
      ['epoch', 'network', 'nodeId', 'protocol', 'status']);
    assert.equal(r.body.nodeId, identity.nodeId);
    assert.match(r.body.nodeId, NODE_ID_RE);
    assert.equal(r.body.network, 'MOOD Alpha Testnet');
    assert.equal(r.body.protocol, 'v0.1');
    assert.equal(r.body.status, 'stopped');
    assert.equal(r.body.epoch, '001');

    // Determinism: two reads are byte-identical — agents can diff.
    const r2 = await getJson(port, '/node/status');
    assert.equal(r.text, r2.text, 'response is deterministic');

    // /identity — public side only: the Alpha 002 protocol record
    // (identity/public.json), which `mood init` now activates.
    const id = await getJson(port, '/identity');
    assert.equal(id.status, 200);
    assert.deepEqual(id.body, {
      nodeId: identity.nodeId,
      publicKey: identity.publicKey,
      algorithm: 'ed25519',
      networkId: 'mood-testnet-001',
      createdAt: identity.createdAt,
      identityVersion: 'alpha-002',
      organization: null,
    });

    // Legacy fallback: without public.json the node still answers from
    // identity/node.json (same key, no identityVersion field).
    const publicFile = join(box.home, 'identity', 'public.json');
    rmSync(publicFile);
    const legacy = await getJson(port, '/identity');
    assert.equal(legacy.status, 200);
    assert.deepEqual(legacy.body, {
      nodeId: identity.nodeId,
      publicKey: identity.publicKey,
      algorithm: 'ed25519',
      networkId: 'mood-testnet-001',
      createdAt: identity.createdAt,
      organization: null,
    });

    // A tampered public.json (key swapped, node ID kept) is rejected,
    // never served.
    writeFileSync(publicFile, JSON.stringify({
      ...identity,
      publicKey: Buffer.alloc(32, 7).toString('base64'),
      networkId: 'mood-testnet-001',
      identityVersion: 'alpha-002',
    }, null, 2));
    const tampered = await getJson(port, '/identity');
    assert.equal(tampered.status, 500);
    assert.equal(tampered.body.error.code, 'IDENTITY_INVALID');
    rmSync(publicFile);

    // SECURITY: the private key never appears — not as a key, not as a
    // value substring, in any response of this server.
    const priv = JSON.parse(readFileSync(join(box.home, 'identity', 'private.json'), 'utf8'));
    assert.ok(priv.privateKey, 'fixture has a private key to scan for');
    const seen = [r.text, id.text];
    for (const body of seen) {
      assert.ok(!body.includes('privateKey'), 'no privateKey field');
      assert.ok(!body.includes('"private"'), 'no private field');
      assert.ok(!body.includes(priv.privateKey), 'private key VALUE never appears');
    }

    // /peers — documented shape, empty is honest.
    const peers = await getJson(port, '/peers');
    assert.equal(peers.status, 200);
    assert.deepEqual(peers.body, { peers: [] });

    // /snapshot — node has no snapshot yet → 404 envelope, not a lie.
    const snap = await getJson(port, '/snapshot');
    assert.equal(snap.status, 404);
    assert.equal(snap.body.error.code, 'NO_SNAPSHOT');
  } finally {
    stopApiServer(child);
    box.cleanup();
  }
});

// ── 4. Snapshot verification ────────────────────────────────────────────────

test('snapshot: verified digest; tampered file → unverified', async () => {
  const box = sandbox();
  let child;
  try {
    moodInitOk(box);
    const good = writeSnapshotFixture(box.home, { epochNumber: 1 });

    const port = await freePort();
    child = await startApiServer({ home: box.home, port });

    const ok = await getJson(port, '/snapshot');
    assert.equal(ok.status, 200);
    assert.deepEqual(ok.body, {
      epoch: '001',
      digest: good.digest,
      agreement: 'verified',
    });
    assert.match(ok.body.digest, /^sha256:[0-9a-f]{64}$/);

    // Tamper with the snapshot on disk (after the digest was computed).
    writeSnapshotFixture(box.home, { epochNumber: 2, tamper: true });

    const bad = await getJson(port, '/snapshot');
    assert.equal(bad.status, 200);
    assert.equal(bad.body.agreement, 'unverified', 'tampered snapshot is detected');
    assert.equal(bad.body.epoch, '002');
  } finally {
    stopApiServer(child);
    box.cleanup();
  }
});

// ── 5. Authentication ────────────────────────────────────────────────────────

test('api key: 401 without/with wrong key, 200 with right key, /health open', async () => {
  const box = sandbox();
  let child;
  try {
    moodInitOk(box);
    const port = await freePort();
    child = await startApiServer({ home: box.home, port, key: 'test-agent-key-42' });

    const noKey = await getJson(port, '/node/status');
    assert.equal(noKey.status, 401);
    assert.equal(noKey.body.error.code, 'UNAUTHORIZED');

    const wrongKey = await getJson(port, '/node/status', {
      Authorization: 'Bearer not-the-key',
    });
    assert.equal(wrongKey.status, 401);
    assert.equal(wrongKey.body.error.code, 'UNAUTHORIZED');

    const rightKey = await getJson(port, '/node/status', {
      Authorization: 'Bearer test-agent-key-42',
    });
    assert.equal(rightKey.status, 200);
    assert.equal(rightKey.body.nodeId.length > 0, true);

    // Wrong scheme is also rejected.
    const wrongScheme = await getJson(port, '/node/status', {
      Authorization: 'Basic test-agent-key-42',
    });
    assert.equal(wrongScheme.status, 401);

    // /health stays open for liveness probes.
    const health = await getJson(port, '/health');
    assert.equal(health.status, 200);

    // The key never lands on disk — only "enabled".
    const apiState = JSON.parse(readFileSync(join(box.home, 'api-state.json'), 'utf8'));
    assert.equal(apiState.key, 'enabled');
    const log = readFileSync(join(box.home, 'logs', 'api.log'), 'utf8');
    assert.ok(!log.includes('test-agent-key-42'), 'key never appears in the log');
  } finally {
    stopApiServer(child);
    box.cleanup();
  }
});

// ── 6. Host validation (DNS rebinding defense) ──────────────────────────────

test('host header: rebinding-style Host → 403, local Host → 200', async () => {
  const box = sandbox();
  let child;
  try {
    moodInitOk(box);
    const port = await freePort();
    child = await startApiServer({ home: box.home, port });

    const evil = await requestWithHost(port, '/node/status', 'evil-rebind.example.com');
    assert.equal(evil.status, 403);
    assert.equal(evil.body.error.code, 'FORBIDDEN_HOST');

    const local = await requestWithHost(port, '/node/status', `127.0.0.1:${port}`);
    assert.equal(local.status, 200);

    const localhost = await requestWithHost(port, '/health', 'localhost');
    assert.equal(localhost.status, 200);
  } finally {
    stopApiServer(child);
    box.cleanup();
  }
});

// ── 7. Lifecycle (real daemon through the API) ──────────────────────────────

test('lifecycle: POST /node/start → running, POST /node/stop → stopped (idempotent)', async () => {
  const box = sandbox();
  let child;
  try {
    moodInitOk(box);

    const port = await freePort();
    child = await startApiServer({ home: box.home, port });

    // Start via the API — the same `mood start` a human would run.
    const start = await postJson(port, '/node/start');
    assert.equal(start.status, 200);
    assert.deepEqual(start.body, { status: 'running' });

    // Wait for the daemon to report Running.
    let running = false;
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      const r = await getJson(port, '/node/status');
      if (r.body.status === 'running') { running = true; break; }
      await sleep(200);
    }
    assert.equal(running, true, 'daemon reports running after POST /node/start');

    // Idempotent: a second start succeeds too.
    const start2 = await postJson(port, '/node/start');
    assert.equal(start2.status, 200);
    assert.deepEqual(start2.body, { status: 'running' });

    // Stop via the API.
    const stop = await postJson(port, '/node/stop');
    assert.equal(stop.status, 200);
    assert.deepEqual(stop.body, { status: 'stopped' });

    const after = await getJson(port, '/node/status');
    assert.equal(after.body.status, 'stopped');

    // Idempotent stop.
    const stop2 = await postJson(port, '/node/stop');
    assert.equal(stop2.status, 200);
    assert.deepEqual(stop2.body, { status: 'stopped' });

    // SECURITY: after a full lifecycle, the private key still never
    // appeared in anything the API wrote or served.
    const priv = JSON.parse(readFileSync(join(box.home, 'identity', 'private.json'), 'utf8'));
    const log = readFileSync(join(box.home, 'logs', 'api.log'), 'utf8');
    assert.ok(!log.includes(priv.privateKey), 'private key never in api.log');
    const apiState = readFileSync(join(box.home, 'api-state.json'), 'utf8');
    assert.ok(!apiState.includes(priv.privateKey), 'private key never in api-state.json');
    assert.ok(existsSync(join(box.home, 'identity', 'private.json')), 'private key file untouched');
  } finally {
    stopApiServer(child);
    box.cleanup();
  }
});

// ── 10. Connector (AI Agent contribution layer) ─────────────────────────────

test('connector: /connector/status works without node identity; activates via CLI', async () => {
  const box = sandbox();
  let child;
  try {
    // NOTE: no `mood init` here. The connector layer is independent of
    // node identity — it must answer before a node exists.
    assert.equal(existsSync(join(box.home, 'identity', 'node.json')), false);

    const port = await freePort();
    child = await startApiServer({ home: box.home, port });

    // Before init: the documented inactive shape.
    const before = await getJson(port, '/connector/status');
    assert.equal(before.status, 200);
    assert.deepEqual(before.body, { connector: 'inactive', agents: [] });

    // A human (or agent) runs the connector commands through the CLI.
    const rInit = mood(box, ['connector', 'init', '--json']);
    assert.equal(rInit.status, 0, `connector init failed:\n${rInit.stderr}`);
    const rReg = mood(box, ['connector', 'register', '--agent', 'claude-code,codex', '--json']);
    assert.equal(rReg.status, 0, `connector register failed:\n${rReg.stderr}`);

    // After registration: exactly the documented shape — name and type
    // only. No IDs beyond what the record holds, no paths, no secrets.
    const after = await getJson(port, '/connector/status');
    assert.equal(after.status, 200);
    assert.deepEqual(after.body, {
      connector: 'active',
      agents: [
        { name: 'Claude Code', type: 'coding-agent' },
        { name: 'Codex', type: 'coding-agent' },
      ],
    });

    // SECURITY: no credential-shaped string is served or written.
    const recordFile = readFileSync(join(box.home, 'connector', 'agent-record.json'), 'utf8');
    assert.ok(!recordFile.includes('sk-ant'), 'no API keys in the agent record');
    assert.ok(!recordFile.includes('apiKey'), 'no key fields in the agent record');
  } finally {
    stopApiServer(child);
    box.cleanup();
  }
});

// ── 11. Contributions (contribution proof layer) ────────────────────────────

test('contributions: list → create via CLI → POST verify; tampering detected; secrets never served', async () => {
  const box = sandbox();
  let child;
  try {
    // NOTE: no `mood init` here. The contribution layer is independent of
    // node identity — it must answer before a node exists.
    assert.equal(existsSync(join(box.home, 'identity', 'node.json')), false);

    const port = await freePort();
    child = await startApiServer({ home: box.home, port });

    // Empty list is honest.
    const empty = await getJson(port, '/contributions');
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body, { contributions: [] });

    // A human (or agent) records a contribution through the CLI.
    const r = mood(box, ['contribution', 'create', '--actor', 'claude-code',
      '--type', 'code_change', '--description', 'Updated node API', '--json']);
    assert.equal(r.status, 0, `contribution create failed:\n${r.stderr}\n${r.stdout}`);
    const created = JSON.parse(r.stdout);

    // GET shows exactly what was recorded — the full public record.
    const list = await getJson(port, '/contributions');
    assert.equal(list.status, 200);
    assert.equal(list.body.contributions.length, 1);
    assert.deepEqual(list.body.contributions[0], {
      event: created.event,
      proof: created.proof,
    });

    // SECURITY: nothing credential-shaped in any response body.
    for (const body of [empty.text, list.text]) {
      assert.ok(!body.includes('sk-'), 'no api-key-shaped string served');
      assert.ok(!body.includes('password'), 'no password-shaped string served');
      assert.ok(!body.includes('PRIVATE KEY'), 'no private key material served');
    }

    // POST the proof back → verified: the event existed, unmodified.
    const ok = await postJsonBody(port, '/contributions/verify', created.proof);
    assert.equal(ok.status, 200);
    assert.deepEqual(ok.body, { verified: true });

    // A tampered proof (hash altered) → verified:false, with the reason.
    const tampered = { ...created.proof, eventHash: 'sha256:' + '0'.repeat(64) };
    const bad = await postJsonBody(port, '/contributions/verify', tampered);
    assert.equal(bad.status, 200, 'a failed verification is a result, not an API error');
    assert.equal(bad.body.verified, false);
    assert.ok(Array.isArray(bad.body.errors) && bad.body.errors.length > 0);
    assert.ok(bad.body.errors.some((e) => String(e).includes('hash mismatch')),
      `errors explain the mismatch, got: ${JSON.stringify(bad.body.errors)}`);

    // A proof naming an event this node never stored → verified:false.
    const stranger = { ...created.proof, eventId: 'event:mood:ffffffffffffffffffffffff' };
    const unknown = await postJsonBody(port, '/contributions/verify', stranger);
    assert.equal(unknown.status, 200);
    assert.equal(unknown.body.verified, false);
    assert.ok(unknown.body.errors.some((e) => String(e).includes('no ContributionEvent stored')));

    // Malformed request bodies → the stable 400 envelope.
    const notObject = await postJsonBody(port, '/contributions/verify', 'just a string');
    assert.equal(notObject.status, 400);
    assert.equal(notObject.body.error.code, 'INVALID_REQUEST');

    const malformed = await postJsonBody(port, '/contributions/verify', '{not valid json');
    assert.equal(malformed.status, 400);
    assert.equal(malformed.body.error.code, 'INVALID_REQUEST');

    // SECURITY: a hand-planted record with credential-shaped content is
    // refused — present in the list, but none of its content is served.
    const plantedId = 'event:mood:ffff9999ffff9999ffff9999';
    const eventsDir = join(box.home, 'contributions', 'events');
    mkdirSync(eventsDir, { recursive: true });
    writeFileSync(join(eventsDir, 'event-mood-ffff9999ffff9999ffff9999.json'), JSON.stringify({
      id: plantedId,
      type: 'contribution_event',
      actor: { id: 'agent:mood:deadbeefdeadbeef', type: 'ai_agent' },
      action: { type: 'code_change', description: 'the api_key=supersecret123 was here' },
      timestamp: '2026-01-01T00:00:00.000Z',
      source: { connector: '', node: '' },
    }));

    const after = await getJson(port, '/contributions');
    assert.equal(after.status, 200);
    assert.equal(after.body.contributions.length, 2);
    const refused = after.body.contributions.find((c) => c.refused);
    assert.ok(refused, 'the planted record is listed — but refused');
    assert.equal(refused.event, null);
    assert.equal(refused.proof, null);
    assert.ok(!after.text.includes('supersecret123'), 'the secret VALUE never appears in the response');
    assert.ok(!after.text.includes('api_key'), 'the credential-shaped content is not echoed');
  } finally {
    stopApiServer(child);
    box.cleanup();
  }
});

// ── 12. Objects (protocol object layer) ─────────────────────────────────────

test('objects: list → create via CLI → GET by id → POST verify; a foreign object verifies; tampering detected', async () => {
  const box = sandbox();
  let child;
  try {
    // NOTE: no `mood init` yet. The object layer reads storage without a
    // node identity — it must answer before a node exists.
    assert.equal(existsSync(join(box.home, 'identity', 'node.json')), false);

    const port = await freePort();
    child = await startApiServer({ home: box.home, port });

    // Empty list is honest.
    const empty = await getJson(port, '/objects');
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body, { objects: [] });

    // An object is issued BY a node: init, record a contribution, wrap it.
    moodInitOk(box);
    const rc = mood(box, ['contribution', 'create', '--actor', 'claude-code',
      '--type', 'code_change', '--description', 'Protocol object test', '--json']);
    assert.equal(rc.status, 0, `contribution create failed:\n${rc.stderr}\n${rc.stdout}`);
    const ro = mood(box, ['object', 'create', '--type', 'contribution', '--json']);
    assert.equal(ro.status, 0, `object create failed:\n${ro.stderr}\n${ro.stdout}`);
    const created = JSON.parse(ro.stdout);
    assert.equal(created.object.type, 'contribution');
    assert.match(created.object.id, /^object:mood:[0-9a-f]{24}$/);
    assert.equal(created.object.payload.eventId, JSON.parse(rc.stdout).event.id);
    assert.ok(existsSync(created.objectFile), 'the object file exists on disk');

    // GET /objects — the documented summary per object.
    const list = await getJson(port, '/objects');
    assert.equal(list.status, 200);
    assert.equal(list.body.objects.length, 1);
    assert.deepEqual(list.body.objects[0], {
      id: created.object.id,
      type: 'contribution',
      verified: true,
    });

    // SECURITY: nothing credential-shaped in any response body.
    for (const body of [empty.text, list.text]) {
      assert.ok(!body.includes('sk-'), 'no api-key-shaped string served');
      assert.ok(!body.includes('password'), 'no password-shaped string served');
      assert.ok(!body.includes('PRIVATE KEY'), 'no private key material served');
    }

    // GET /objects/:id — the object plus its verification status.
    const one = await getJson(port, `/objects/${encodeURIComponent(created.object.id)}`);
    assert.equal(one.status, 200);
    assert.deepEqual(one.body, {
      id: created.object.id,
      type: 'contribution',
      verified: true,
      object: created.object,
    });

    // GET /objects/:id for an unknown object → the 404 envelope.
    const missing = await getJson(port, `/objects/${encodeURIComponent('object:mood:' + '0'.repeat(24))}`);
    assert.equal(missing.status, 404);
    assert.equal(missing.body.error.code, 'NOT_FOUND');

    // POST the object back → verified. The referenced proof is stored here
    // and agrees, so BOTH levels pass (integrity + linkage).
    const ok = await postJsonBody(port, '/objects/verify', created.object);
    assert.equal(ok.status, 200);
    assert.deepEqual(ok.body, { verified: true });

    // A tampered object (hash altered → ID no longer matches content).
    const tampered = {
      ...created.object,
      payload: { ...created.object.payload, eventHash: 'sha256:' + '0'.repeat(64) },
    };
    const bad = await postJsonBody(port, '/objects/verify', tampered);
    assert.equal(bad.status, 200, 'a failed verification is a result, not an API error');
    assert.equal(bad.body.verified, false);
    assert.ok(Array.isArray(bad.body.errors) && bad.body.errors.length > 0);
    assert.ok(bad.body.errors.some((e) => String(e).includes('id mismatch')),
      `errors explain the mismatch, got: ${JSON.stringify(bad.body.errors)}`);

    // A FOREIGN object — minted by another "node", over a contribution
    // this node never stored — still verifies on its own. This is the
    // whole point of the layer: network verification minus the transport.
    const foreignObject = {
      id: 'object:mood:' + 'f'.repeat(24),
      type: 'contribution',
      version: '0.1',
      createdAt: '2026-09-03T12:00:00.000Z',
      issuer: { nodeId: 'mood:node:' + 'ab'.repeat(32) },
      payload: {
        eventId: 'event:mood:' + 'f'.repeat(24),
        proofId: 'proof:mood:' + 'e'.repeat(24),
        eventHash: 'sha256:' + 'c'.repeat(64),
        algorithm: 'SHA-256',
      },
    };
    // Recompute the honest ID for the foreign content so the object is
    // well-formed — the test is about absence of the local record, not
    // about a broken ID.
    const { deriveObjectId } = await import('@mood/protocol-object');
    foreignObject.id = deriveObjectId({
      type: foreignObject.type,
      version: foreignObject.version,
      createdAt: foreignObject.createdAt,
      issuer: foreignObject.issuer,
      payload: foreignObject.payload,
    });

    const foreign = await postJsonBody(port, '/objects/verify', foreignObject);
    assert.equal(foreign.status, 200);
    assert.deepEqual(foreign.body, { verified: true },
      'an object this node has never seen verifies by content alone');

    // Malformed request bodies → the stable 400 envelope.
    const notObject = await postJsonBody(port, '/objects/verify', 'just a string');
    assert.equal(notObject.status, 400);
    assert.equal(notObject.body.error.code, 'INVALID_REQUEST');

    const malformed = await postJsonBody(port, '/objects/verify', '{not valid json');
    assert.equal(malformed.status, 400);
    assert.equal(malformed.body.error.code, 'INVALID_REQUEST');

    // SECURITY: a hand-planted object with credential-shaped content is
    // refused — present in the list, but none of its content is served.
    const plantedDir = join(box.home, 'objects', 'contribution');
    mkdirSync(plantedDir, { recursive: true });
    writeFileSync(join(plantedDir, 'object-mood-' + '9'.repeat(24) + '.json'), JSON.stringify({
      id: 'object:mood:' + '9'.repeat(24),
      type: 'contribution',
      version: '0.1',
      createdAt: '2026-09-03T00:00:00.000Z',
      issuer: { nodeId: 'mood:node:' + 'cd'.repeat(32) },
      payload: {
        eventId: 'event:mood:' + '9'.repeat(24),
        proofId: 'proof:mood:' + '9'.repeat(24),
        eventHash: 'sha256:the api_key=supersecret123 was here',
        algorithm: 'SHA-256',
      },
    }));

    const after = await getJson(port, '/objects');
    assert.equal(after.status, 200);
    assert.equal(after.body.objects.length, 2);
    const refused = after.body.objects.find((o) => o.refused);
    assert.ok(refused, 'the planted object is listed — but refused');
    assert.equal(refused.id, 'object:mood:' + '9'.repeat(24));
    assert.equal(refused.type, null);
    assert.ok(!after.text.includes('supersecret123'), 'the secret VALUE never appears in the response');
    assert.ok(!after.text.includes('api_key'), 'the credential-shaped content is not echoed');
  } finally {
    stopApiServer(child);
    box.cleanup();
  }
});

// ── 13. Deployment dashboard (Node Deployment Alpha 001) ────────────────────

test('dashboard: stopped initialized node — honest zeros, metrics null', async () => {
  const box = sandbox();
  let child;
  try {
    moodInitOk(box);
    const identity = JSON.parse(readFileSync(join(box.home, 'identity', 'node.json'), 'utf8'));

    const port = await freePort();
    child = await startApiServer({ home: box.home, port });

    // /status — the dashboard summary, exactly this key set.
    const status = await getJson(port, '/status');
    assert.equal(status.status, 200);
    assert.deepEqual(Object.keys(status.body).sort(), [
      'connectedPeers', 'contributions', 'epoch', 'knownObjects', 'lastHeartbeat',
      'network', 'nodeId', 'protocol', 'relay', 'simulation', 'snapshots',
      'status', 'timeScale', 'uptimeSeconds',
    ]);
    assert.equal(status.body.nodeId, identity.nodeId);
    assert.equal(status.body.status, 'stopped');
    assert.equal(status.body.uptimeSeconds, null, 'no daemon → no uptime, not zero');
    assert.equal(status.body.contributions, 0);
    assert.equal(status.body.snapshots, 0);
    assert.equal(status.body.lastHeartbeat, null);
    assert.equal(status.body.simulation, false);
    assert.equal(status.body.timeScale, 1);

    // /metrics — node null before the daemon has ever run; API block live.
    const metrics = await getJson(port, '/metrics');
    assert.equal(metrics.status, 200);
    assert.equal(metrics.body.node, null);
    assert.equal(typeof metrics.body.api.pid, 'number');
    assert.equal(typeof metrics.body.api.uptimeSeconds, 'number');
    assert.equal(typeof metrics.body.api.memoryRssBytes, 'number');
    assert.equal(typeof metrics.body.api.version, 'string');

    // /events — no daemon run yet → honest empty tail.
    const events = await getJson(port, '/events');
    assert.equal(events.status, 200);
    assert.deepEqual(events.body, { source: 'node', count: 0, events: [] });

    // /contribution — zeros and the canon-honest reputation answer.
    const contribution = await getJson(port, '/contribution');
    assert.equal(contribution.status, 200);
    assert.deepEqual(contribution.body, {
      events: 0,
      proofs: 0,
      verified: null,
      invalid: null,
      reputation: 'not_implemented',
    });

    // GET /node is the alias of GET /node/status — same body.
    const alias = await getJson(port, '/node');
    const canonical = await getJson(port, '/node/status');
    assert.deepEqual(alias.body, canonical.body);

    // /health now carries the node identity (public by design).
    const health = await getJson(port, '/health');
    assert.equal(health.body.nodeId, identity.nodeId);
    assert.equal(health.body.lastHeartbeat, null);
  } finally {
    stopApiServer(child);
    box.cleanup();
  }
});

test('dashboard: live daemon → status, metrics, events, contribution', async () => {
  const box = sandbox();
  let child;
  try {
    moodInitOk(box);
    const identity = JSON.parse(readFileSync(join(box.home, 'identity', 'node.json'), 'utf8'));

    // A contribution recorded before boot: the daemon's first maintenance
    // cycle collects it and the genesis snapshot covers it.
    const rc = mood(box, ['contribution', 'create', '--actor', 'claude-code',
      '--type', 'code_change', '--description', 'Dashboard test', '--json']);
    assert.equal(rc.status, 0, `contribution create failed:\n${rc.stderr}\n${rc.stdout}`);

    const port = await freePort();
    child = await startApiServer({ home: box.home, port });

    const start = await postJson(port, '/node/start');
    assert.equal(start.status, 200);
    assert.deepEqual(start.body, { status: 'running' });

    // Wait until the daemon reports running AND its first maintenance
    // cycle is fully persisted. The snapshot FILE lands mid-cycle, ~30ms
    // before the metrics counter reaches state.json — readiness must be
    // judged by the metrics, not by the file count.
    let ready = false;
    const deadline = Date.now() + 20_000;
    while (Date.now() < deadline) {
      const s = await getJson(port, '/status');
      const m = await getJson(port, '/metrics');
      if (s.body.status === 'running' && s.body.lastHeartbeat
        && m.body.node && m.body.node.snapshots >= 1) {
        ready = true;
        break;
      }
      await sleep(200);
    }
    assert.equal(ready, true, 'daemon reached running state with a persisted maintenance cycle');

    // /health carries identity and heartbeat age — still no auth needed.
    const health = await getJson(port, '/health');
    assert.equal(health.body.nodeId, identity.nodeId);
    assert.ok(health.body.lastHeartbeat, 'daemon heartbeat visible in /health');
    assert.ok(health.body.uptimeSeconds >= 0);

    // /status — live values.
    const status = await getJson(port, '/status');
    assert.equal(status.status, 200);
    assert.equal(status.body.nodeId, identity.nodeId);
    assert.equal(status.body.status, 'running');
    assert.ok(status.body.uptimeSeconds >= 0);
    assert.equal(status.body.contributions, 1);
    assert.ok(status.body.snapshots >= 1);
    assert.ok(status.body.lastHeartbeat);
    assert.ok(['Connected', 'Disconnected'].includes(status.body.relay),
      `relay is honestly reported (got ${status.body.relay})`);

    // /metrics — daemon counters plus the API process block.
    const metrics = await getJson(port, '/metrics');
    assert.equal(metrics.status, 200);
    assert.ok(metrics.body.node.heartbeats >= 1);
    assert.ok(metrics.body.node.snapshots >= 1);
    assert.equal(metrics.body.node.eventsCollected, 1);
    assert.equal(metrics.body.node.uptimeSeconds >= 0, true);
    assert.ok(metrics.body.node.memoryRssBytes > 0);
    assert.ok(metrics.body.api.pid > 0);

    // /events — tail of the daemon's JSON log trail.
    const events = await getJson(port, '/events');
    assert.equal(events.status, 200);
    assert.equal(events.body.source, 'node');
    assert.ok(events.body.count > 0);
    for (const record of events.body.events) {
      assert.ok(record.timestamp, 'log record has timestamp');
      assert.ok(record.event, 'log record has event');
      assert.ok(record.status, 'log record has status');
      assert.equal(record.node_id, identity.nodeId);
    }
    const eventsSeen = new Set(events.body.events.map((r) => r.event));
    for (const expected of ['node_boot', 'scheduler_started', 'maintenance_cycle', 'heartbeat']) {
      assert.ok(eventsSeen.has(expected), `log tail includes ${expected}`);
    }

    // limit is honored; sources are segregated; unknown source is a 400.
    const limited = await getJson(port, '/events?limit=2');
    assert.equal(limited.body.count, 2);
    assert.equal(limited.body.events.length, 2);

    const beats = await getJson(port, '/events?source=heartbeat');
    assert.equal(beats.body.source, 'heartbeat');
    assert.ok(beats.body.count >= 1);
    assert.ok(beats.body.events.every((r) => r.event === 'heartbeat'));

    const errors = await getJson(port, '/events?source=error');
    assert.equal(errors.status, 200);
    assert.ok(errors.body.events.every((r) => r.level === 'error'));

    const badSource = await getJson(port, '/events?source=bogus');
    assert.equal(badSource.status, 400);
    assert.equal(badSource.body.error.code, 'INVALID_REQUEST');

    // /contribution — counts plus the last maintenance verification result.
    const contribution = await getJson(port, '/contribution');
    assert.equal(contribution.status, 200);
    assert.deepEqual(contribution.body, {
      events: 1,
      proofs: 1,
      verified: 1,
      invalid: 0,
      reputation: 'not_implemented',
    });

    // Stop the daemon → the dashboard reports stopped, uptime null again,
    // and the final metrics survive.
    const stop = await postJson(port, '/node/stop');
    assert.equal(stop.status, 200);

    const after = await getJson(port, '/status');
    assert.equal(after.body.status, 'stopped');
    assert.equal(after.body.uptimeSeconds, null);

    const afterMetrics = await getJson(port, '/metrics');
    assert.ok(afterMetrics.body.node.heartbeats >= 1, 'metrics survive shutdown');
  } finally {
    stopApiServer(child);
    box.cleanup();
  }
});

test('allowed hosts: MOOD_API_ALLOWED_HOSTS extends the loopback allowlist', async () => {
  const box = sandbox();
  let child;
  let other;
  try {
    moodInitOk(box);
    const port = await freePort();
    child = await startApiServer({
      home: box.home,
      port,
      extraEnv: { MOOD_API_ALLOWED_HOSTS: 'monitor.local, ops.box' },
    });

    const allowed = await requestWithHost(port, '/node/status', 'monitor.local');
    assert.equal(allowed.status, 200, 'operator-added host is allowed');

    const withPort = await requestWithHost(port, '/health', 'ops.box:8788');
    assert.equal(withPort.status, 200, 'port suffix is stripped before matching');

    const stillEvil = await requestWithHost(port, '/node/status', 'evil-rebind.example.com');
    assert.equal(stillEvil.status, 403);
    assert.equal(stillEvil.body.error.code, 'FORBIDDEN_HOST');

    // A server WITHOUT the env keeps refusing the extra host.
    const otherPort = await freePort();
    other = await startApiServer({ home: box.home, port: otherPort });
    const refused = await requestWithHost(otherPort, '/node/status', 'monitor.local');
    assert.equal(refused.status, 403);
    assert.equal(refused.body.error.code, 'FORBIDDEN_HOST');
  } finally {
    stopApiServer(child);
    stopApiServer(other);
    box.cleanup();
  }
});
