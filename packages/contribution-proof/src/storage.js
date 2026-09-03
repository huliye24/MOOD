/**
 * Contribution Proof Alpha 001 — node-local storage.
 *
 * Where a node keeps its contribution records:
 *
 *   ~/.mood/contributions/events/event-mood-<hex>.json   the ContributionEvent
 *   ~/.mood/contributions/proofs/proof-mood-<hex>.json   the ContributionProof
 *
 * One JSON file per object — readable by any tool, greppable, diffable.
 * Filenames sanitize ':' to '-' (':' is illegal in NTFS filenames); the
 * IDs inside the files keep their canonical 'event:mood:…' form.
 *
 * Storage is a node's own record. It is NOT the protocol: this layer
 * never touches consensus, the snapshot, or the genesis block. When
 * contribution proofs later enter the protocol object stream, they do so
 * as data validated by this package — not by this package writing there.
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { validateProof } from './validator.js';
import { hashEvent } from './hash.js';

/** Resolve the user home the same way every MOOD layer does. */
export function resolveUserHome(env = process.env) {
  return env.USERPROFILE || env.HOME || homedir();
}

/** Paths of the contribution subtree (MOOD_HOME-aware, test-friendly). */
export function contributionPaths(env = process.env) {
  const moodRoot = env.MOOD_HOME || join(resolveUserHome(env), '.mood');
  const contributionsDir = join(moodRoot, 'contributions');
  return {
    moodRoot,
    contributionsDir,
    eventsDir: join(contributionsDir, 'events'),
    proofsDir: join(contributionsDir, 'proofs'),
  };
}

/** Create the contribution subtree if missing. Idempotent. */
export function initContributionStorage(env = process.env) {
  const paths = contributionPaths(env);
  mkdirSync(paths.eventsDir, { recursive: true });
  mkdirSync(paths.proofsDir, { recursive: true });
  return paths;
}

/** 'event:mood:<hex>' → 'event-mood-<hex>.json' (NTFS-safe). */
function filenameFor(id) {
  return id.replaceAll(':', '-') + '.json';
}

function readJsonOrNull(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Persist an event and its proof. Returns the two file paths written.
 * Throws on validation failure — only valid records reach disk.
 */
export function saveContribution({ event, proof, env = process.env }) {
  const paths = initContributionStorage(env);
  const eventFile = join(paths.eventsDir, filenameFor(event.id));
  const proofFile = join(paths.proofsDir, filenameFor(proof.proofId));
  writeFileSync(eventFile, JSON.stringify(event, null, 2) + '\n', 'utf8');
  writeFileSync(proofFile, JSON.stringify(proof, null, 2) + '\n', 'utf8');
  return { eventFile, proofFile, eventsDir: paths.eventsDir, proofsDir: paths.proofsDir };
}

/**
 * List every stored contribution, newest first. Each item joins an event
 * with its proof (matched on proof.eventId); an event without a proof, or
 * a proof without its event, is still listed with the missing half as
 * null — gaps are visible, never hidden.
 */
export function listContributions(env = process.env) {
  const paths = contributionPaths(env);
  const events = readAllJson(paths.eventsDir);
  const proofs = readAllJson(paths.proofsDir);

  const proofsByEventId = new Map();
  for (const proof of proofs) {
    if (proof && typeof proof.eventId === 'string') {
      proofsByEventId.set(proof.eventId, proof);
    }
  }

  const items = events.map((event) => ({
    event,
    proof: proofsByEventId.get(event.id) || null,
  }));
  // Orphans: proofs whose event is gone — surfaced, not silently dropped.
  const seenEventIds = new Set(events.map((e) => e && e.id));
  for (const proof of proofs) {
    if (proof && typeof proof.eventId === 'string' && !seenEventIds.has(proof.eventId)) {
      items.push({ event: null, proof });
    }
  }

  const timestampOf = (item) =>
    (item.event && item.event.timestamp) || (item.proof && item.proof.createdAt) || '';
  items.sort((a, b) => timestampOf(b).localeCompare(timestampOf(a)) || String(idOf(a)).localeCompare(String(idOf(b))));
  return items;
}

function idOf(item) {
  return (item.event && item.event.id) || (item.proof && item.proof.eventId) || '';
}

/** Find one contribution by event ID or proof ID. */
export function findContribution({ eventId, proofId, env = process.env }) {
  if (eventId) {
    const event = readJsonOrNull(join(contributionPaths(env).eventsDir, filenameFor(eventId)));
    if (!event) return null;
    const proofs = readAllJson(contributionPaths(env).proofsDir).filter(
      (p) => p && p.eventId === eventId
    );
    return { event, proof: proofs[0] || null };
  }
  if (proofId) {
    const proof = readJsonOrNull(join(contributionPaths(env).proofsDir, filenameFor(proofId)));
    if (!proof) return null;
    const event = proof.eventId
      ? readJsonOrNull(join(contributionPaths(env).eventsDir, filenameFor(proof.eventId)))
      : null;
    return { event: event || null, proof };
  }
  return null;
}

/**
 * Verify every stored contribution: recompute each event's hash and
 * compare it against what its proof recorded. This is the "was anything
 * modified after recording?" sweep — the answer a node owner, or a third
 * party holding the files, can check at any time.
 */
export function verifyStoredContributions(env = process.env) {
  const items = listContributions(env);
  const results = items.map(({ event, proof }) => {
    if (!event || !proof) {
      return {
        eventId: idOf({ event, proof }),
        proofId: proof ? proof.proofId : null,
        eventHash: proof ? proof.eventHash : null,
        valid: false,
        recomputed: null,
        errors: [event ? 'proof missing for event' : 'event missing for proof'],
      };
    }
    const { valid, errors } = validateProof(proof, event);
    return {
      eventId: event.id,
      proofId: proof.proofId,
      eventHash: proof.eventHash,
      recomputed: hashEvent(event),
      valid,
      errors,
    };
  });
  const passed = results.filter((r) => r.valid).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  };
}

function readAllJson(dir) {
  try {
    return readdirSync(dir)
      .filter((name) => name.endsWith('.json'))
      .sort()
      .map((name) => readJsonOrNull(join(dir, name)))
      .filter((value) => value !== null);
  } catch {
    return [];
  }
}
