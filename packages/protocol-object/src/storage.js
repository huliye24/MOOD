/**
 * Protocol Object Alpha 001 — node-local storage.
 *
 * Layout under ~/.mood/objects/ (MOOD_HOME-aware, same contract style as
 * the proof layer's ~/.mood/contributions/):
 *
 *   objects/<type>/object-mood-<24 hex>.json   the objects — protocol truth,
 *                                               one JSON file per object,
 *                                               content-addressed by name
 *   objects/index/by-type.json                 {"contribution":[objectIds]}
 *                                               a DERIVED catalog — what a
 *                                               future sync handshake will
 *                                               advertise; rebuildable from
 *                                               the files at any time
 *   objects/metadata/object-mood-<24 hex>.json {origin,syncStatus} — local,
 *                                               non-protocol state for the
 *                                               sync adapter. NEVER part of
 *                                               the object, NEVER hashed.
 *
 * The files are the truth; the index is a cache; the metadata is a
 * scratchpad. Losing the index or the metadata loses nothing.
 *
 * Why not @mood/node-runtime's StorageManager: it injects _storedAt /
 * _collection into stored records and falls back to random IDs — both
 * break content addressing. Objects are immutable, addressed, and
 * validated before they touch disk; they get their own store.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { resolveUserHome } from '@mood/contribution-proof';
import { OBJECT_TYPES } from './schema.js';
import { validateProtocolObject } from './validator.js';

/** Resolve ~/.mood (or MOOD_HOME) — shared with the proof layer. */
export { resolveUserHome };

/** `object:mood:<hex>` → its on-disk filename (NTFS cannot hold `:`). */
export function filenameFor(id) {
  return id.replaceAll(':', '-') + '.json';
}

/** The storage paths for one home. Pure — creates nothing. */
export function objectPaths(env = process.env) {
  const moodRoot = env.MOOD_HOME || join(resolveUserHome(env), '.mood');
  const root = join(moodRoot, 'objects');
  return {
    root,
    types: Object.fromEntries(OBJECT_TYPES.map((t) => [t, join(root, t)])),
    indexDir: join(root, 'index'),
    metadataDir: join(root, 'metadata'),
  };
}

/** Create the objects tree. Idempotent. Returns the paths. */
export function initObjectStorage(env = process.env) {
  const paths = objectPaths(env);
  for (const dir of [...Object.values(paths.types), paths.indexDir, paths.metadataDir]) {
    mkdirSync(dir, { recursive: true });
  }
  return paths;
}

/** Read + parse every .json file in a dir. A bad file is skipped, not fatal. */
function readAllJson(dir) {
  if (!existsSync(dir)) return [];
  const items = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith('.json')) continue;
    try {
      items.push(JSON.parse(readFileSync(join(dir, name), 'utf8')));
    } catch {
      // unreadable/corrupt file — surfaced as absence, never a crash
    }
  }
  return items;
}

/**
 * Store a ProtocolObject. Validates FIRST — an invalid object never
 * touches disk — then writes the object file, refreshes the derived
 * index, and lays down the sync metadata. Idempotent: storing the same
 * object again succeeds and reports created: false.
 *
 * @returns {{objectFile: string, indexFile: string, metadataFile: string, created: boolean}}
 * @throws {Error} code INVALID_PROTOCOL_OBJECT when the object fails validation
 */
export function storeObject(object, { env = process.env } = {}) {
  const check = validateProtocolObject(object);
  if (!check.valid) {
    const err = new Error(`refusing to store an invalid object: ${check.errors.join('; ')}`);
    err.code = 'INVALID_PROTOCOL_OBJECT';
    err.errors = check.errors;
    throw err;
  }

  const paths = initObjectStorage(env);
  const objectFile = join(paths.types[object.type], filenameFor(object.id));
  const created = !existsSync(objectFile);
  writeFileSync(objectFile, JSON.stringify(object, null, 2) + '\n', 'utf8');

  const indexFile = rebuildIndex(env);

  const metadataFile = join(paths.metadataDir, filenameFor(object.id));
  if (!existsSync(metadataFile)) {
    writeFileSync(
      metadataFile,
      JSON.stringify(
        { id: object.id, type: object.type, origin: 'local', syncStatus: 'unsynchronized' },
        null,
        2
      ) + '\n',
      'utf8'
    );
  }

  return { objectFile, indexFile, metadataFile, created };
}

/**
 * Rebuild the by-type index from the object files (the files are the
 * truth). Returns the index file path.
 */
export function rebuildIndex(env = process.env) {
  const paths = initObjectStorage(env);
  const index = Object.fromEntries(OBJECT_TYPES.map((t) => [t, []]));
  for (const type of OBJECT_TYPES) {
    for (const object of readAllJson(paths.types[type])) {
      if (object && typeof object === 'object' && typeof object.id === 'string') {
        index[type].push(object.id);
      }
    }
    index[type].sort();
  }
  const indexFile = join(paths.indexDir, 'by-type.json');
  writeFileSync(indexFile, JSON.stringify(index, null, 2) + '\n', 'utf8');
  return indexFile;
}

/**
 * List the stored objects, newest first. Returns the raw objects —
 * callers compute verification themselves (the files are the truth;
 * a corrupted file surfaces as itself, not as silence).
 */
export function listObjects(env = process.env) {
  const paths = objectPaths(env);
  const objects = [];
  for (const type of OBJECT_TYPES) {
    objects.push(...readAllJson(paths.types[type]));
  }
  return objects
    .filter((o) => o && typeof o === 'object')
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) || String(a.id).localeCompare(String(b.id)));
}

/**
 * Find one stored object by ID. Malformed or absent → null.
 *
 * The type is part of the storage layout, not of the ID — so every type
 * dir is probed for the object's file.
 */
export function findObject({ id, env = process.env } = {}) {
  if (typeof id !== 'string' || !id.startsWith('object:')) return null;
  const paths = objectPaths(env);
  for (const type of OBJECT_TYPES) {
    const file = join(paths.types[type], filenameFor(id));
    if (existsSync(file)) {
      try {
        return JSON.parse(readFileSync(file, 'utf8'));
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** The sync status recorded for an object, or the default for unstored ones. */
export function readObjectMetadata({ id, env = process.env } = {}) {
  const file = join(objectPaths(env).metadataDir, filenameFor(id));
  if (!existsSync(file)) return { id, origin: null, syncStatus: 'unsynchronized' };
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return { id, origin: null, syncStatus: 'unsynchronized' };
  }
}

/**
 * Sweep every stored object through validateProtocolObject.
 * Result shape mirrors the proof layer's verifyStoredContributions.
 */
export function verifyStoredObjects(env = process.env) {
  const results = [];
  for (const object of listObjects(env)) {
    const check = validateProtocolObject(object);
    results.push({
      id: object && typeof object.id === 'string' ? object.id : '(unreadable id)',
      type: object && typeof object.type === 'string' ? object.type : '(unknown)',
      valid: check.valid,
      errors: check.errors,
    });
  }
  return {
    total: results.length,
    passed: results.filter((r) => r.valid).length,
    failed: results.filter((r) => !r.valid).length,
    results,
  };
}
