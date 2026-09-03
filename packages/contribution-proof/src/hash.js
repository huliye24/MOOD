/**
 * Contribution Proof Alpha 001 — the hash engine.
 *
 * One rule, no exceptions:
 *
 *   same event  → same hash
 *   any byte changed → different hash
 *
 * The serialization is canonical JSON: object keys sorted recursively,
 * no whitespace, standard JSON escaping. Any node on any machine that
 * holds the same event derives the same hash — that is what makes a
 * proof verifiable by a third party.
 */

import { createHash } from 'crypto';

/**
 * Canonical JSON serialization of any JSON value.
 * Objects are key-sorted at every depth; arrays keep their order (order
 * is meaning); primitives use standard JSON encoding.
 */
export function canonicalize(value) {
  if (value === null) return 'null';
  switch (typeof value) {
    case 'number':
    case 'boolean':
      return JSON.stringify(value);
    case 'string':
      return JSON.stringify(value);
    default:
      break;
  }
  if (Array.isArray(value)) {
    return '[' + value.map((v) => canonicalize(v)).join(',') + ']';
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalize(value[k])).join(',') + '}';
  }
  throw new TypeError(`cannot canonicalize value of type ${typeof value}`);
}

/** SHA-256 hex digest of a string. */
export function sha256Hex(input) {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/** SHA-256 hex digest of a value's canonical JSON form. */
export function sha256OfValue(value) {
  return sha256Hex(canonicalize(value));
}

/**
 * The event hash: "sha256:<64-hex>" over the event's canonical JSON —
 * every field included, the event ID included. Change anything and the
 * hash changes; that is the tamper evidence.
 */
export function hashEvent(event) {
  return 'sha256:' + sha256OfValue(event);
}
