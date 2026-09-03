/**
 * Protocol Object Alpha 001 — validation.
 *
 * `validateProtocolObject(object)` answers one question: **is this a
 * well-formed ProtocolObject whose ID still matches its content?**
 *
 * Five families of checks, in order:
 *
 *   1. Shape       — an object with exactly the six v0.1 keys
 *   2. Fields      — known type, exact version, UTC timestamp,
 *                    issuer = {nodeId} with a valid node ID
 *   3. Payload     — the type's own payload schema (contribution:
 *                    four references into the proof layer)
 *   4. Integrity   — the ID recomputed from the content must equal the
 *                    recorded ID: this is what detects an object edited
 *                    after the fact, on any node, without trusting anyone
 *   5. Secrets     — the proof layer's credential guard, re-run here
 *                    (objects must never carry credentials, in either
 *                    direction: creation or verification)
 *
 * Returns {valid, errors} — it never throws. A failed verification is a
 * RESULT, not an exception.
 */

import { containsSecret } from '@mood/contribution-proof';
import {
  OBJECT_KEYS,
  OBJECT_TYPES,
  OBJECT_VERSION,
  OBJECT_ID_PATTERN,
  ISSUER_KEYS,
  NODE_ID_PATTERN,
  ISO_TIMESTAMP_PATTERN,
} from './schema.js';
import { validateContributionPayload } from './types/contribution.js';
import { deriveObjectId, objectContent } from './serializer.js';

const fail = (errors, message) => {
  errors.push(message);
  return errors;
};

/** Collect every string value in a value tree (objects and arrays). */
function collectStrings(value, into = []) {
  if (typeof value === 'string') {
    into.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, into);
  } else if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) collectStrings(value[key], into);
  }
  return into;
}

/** The credential guard, applied to every string an object carries. */
function guardSecrets(errors, object) {
  for (const text of collectStrings(object)) {
    const pattern = containsSecret(text);
    if (pattern) {
      fail(errors, `object contains credential-shaped content (${pattern}) — an object must never carry credentials`);
      return errors;
    }
  }
  return errors;
}

/** The payload validator for a type. One type in Alpha 001. */
function validatePayloadForType(type, payload) {
  if (type === 'contribution') return validateContributionPayload(payload);
  return { valid: false, errors: [`unknown object type: ${type}`] };
}

/**
 * Validate a ProtocolObject.
 *
 * @param {object} object  the candidate object
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateProtocolObject(object) {
  const errors = [];
  if (object === null || typeof object !== 'object' || Array.isArray(object)) {
    return { valid: false, errors: fail(errors, 'object must be an object') };
  }

  // 1. Shape — the exact six keys, nothing else.
  const keys = Object.keys(object).sort();
  const expected = [...OBJECT_KEYS].sort();
  if (keys.length !== expected.length || keys.some((k, i) => k !== expected[i])) {
    return {
      valid: false,
      errors: fail(
        errors,
        `object must contain exactly ${expected.join(', ')} — got ${keys.join(', ') || '(empty)'}`
      ),
    };
  }

  // 2. Fields.
  if (!OBJECT_TYPES.includes(object.type)) {
    fail(errors, `type must be one of ${OBJECT_TYPES.join(', ')} — got ${object.type}`);
  }
  if (object.version !== OBJECT_VERSION) {
    fail(errors, `version must be ${OBJECT_VERSION} — got ${object.version}`);
  }
  if (typeof object.createdAt !== 'string' || !ISO_TIMESTAMP_PATTERN.test(object.createdAt)) {
    fail(errors, `createdAt must be a UTC ISO 8601 timestamp — got ${object.createdAt}`);
  }
  const issuer = object.issuer;
  if (issuer === null || typeof issuer !== 'object' || Array.isArray(issuer)) {
    fail(errors, 'issuer must be an object');
  } else {
    const issuerKeys = Object.keys(issuer).sort();
    const issuerExpected = [...ISSUER_KEYS].sort();
    if (issuerKeys.length !== issuerExpected.length || issuerKeys.some((k, i) => k !== issuerExpected[i])) {
      fail(errors, `issuer must contain exactly ${issuerExpected.join(', ')} — got ${issuerKeys.join(', ')}`);
    } else if (typeof issuer.nodeId !== 'string' || !NODE_ID_PATTERN.test(issuer.nodeId)) {
      fail(errors, `issuer.nodeId must match mood:node:<hex> — got ${issuer.nodeId}`);
    }
  }

  // 3. Payload — the type's own schema.
  const payloadCheck = validatePayloadForType(object.type, object.payload);
  if (!payloadCheck.valid) {
    for (const e of payloadCheck.errors) fail(errors, e);
  }

  // 4. Integrity — the ID is the hash of the content; recompute and compare.
  if (typeof object.id !== 'string' || !OBJECT_ID_PATTERN.test(object.id)) {
    fail(errors, `id must match object:mood:<24 hex> — got ${object.id}`);
  } else {
    const recomputed = deriveObjectId(objectContent(object));
    if (recomputed !== object.id) {
      fail(errors, `object id mismatch: object records ${object.id}, recomputed ${recomputed}`);
    }
  }

  // 5. Secrets — the shared credential guard, both directions.
  guardSecrets(errors, object);

  return { valid: errors.length === 0, errors };
}
