/**
 * Contribution Proof Alpha 001 — the validator.
 *
 * Every check returns { valid, errors } — never throws. The rule:
 * a valid record proves "this event existed and was not modified";
 * anything else, however small, is invalid.
 *
 * validateEventContent — the pre-ID content check (used at creation)
 * validateEvent        — the full event check (schema + content + secret guard)
 * validateProofShape   — proof-only check (proof file readable without event)
 * validateProof        — proof + event together: the actual verification
 *
 * The secret guard runs in every direction, so a record that was validly
 * created but later tampered with a credential-shaped string ALSO fails —
 * verification is not a schema check, it is an integrity check.
 */

import {
  EVENT_TYPE,
  ACTOR_TYPES,
  EVENT_KEYS,
  ACTOR_REQUIRED_KEYS,
  ACTOR_OPTIONAL_KEYS,
  ACTOR_MAX_NAME_LENGTH,
  ACTION_TYPE_PATTERN,
  ACTION_MAX_DESCRIPTION_LENGTH,
  SOURCE_KEYS,
  SOURCE_MAX_LENGTH,
  ISO_TIMESTAMP_PATTERN,
  EVENT_ID_PATTERN,
  ACTOR_ID_PATTERN,
  PROOF_ALGORITHM,
  PROOF_KEYS,
  PROOF_ID_PATTERN,
  EVENT_HASH_PATTERN,
  SECRET_PATTERNS,
} from './schema.js';
import { hashEvent } from './hash.js';

const fail = (errors, message) => {
  errors.push(message);
  return errors;
};

/** True when the string matches a credential-shaped pattern. */
export function containsSecret(text) {
  if (typeof text !== 'string' || text.length === 0) return null;
  for (const { name, pattern } of SECRET_PATTERNS) {
    if (pattern.test(text)) return name;
  }
  return null;
}

/** Reject credential-shaped content wherever free text may appear. */
function guardSecrets(errors, where, text) {
  const secret = containsSecret(text);
  if (secret) {
    fail(errors, `${where} must not contain credential-shaped content (detected: ${secret})`);
  }
}

// ── ContributionEvent ───────────────────────────────────────────────────────

/**
 * Validate the content of an event *without* its `id` — the form used at
 * creation time, before the content-derived ID exists.
 */
export function validateEventContent(content) {
  const errors = [];
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return { valid: false, errors: ['event content must be an object'] };
  }

  // actor
  const { actor, action, timestamp, source } = content;
  if (!actor || typeof actor !== 'object' || Array.isArray(actor)) {
    fail(errors, 'actor must be an object');
  } else {
    const actorKeys = Object.keys(actor);
    for (const key of actorKeys) {
      if (![...ACTOR_REQUIRED_KEYS, ...ACTOR_OPTIONAL_KEYS].includes(key)) {
        fail(errors, `actor has unknown key "${key}"`);
      }
    }
    for (const key of ACTOR_REQUIRED_KEYS) {
      if (!(key in actor)) fail(errors, `actor is missing required key "${key}"`);
    }
    if ('id' in actor) {
      if (typeof actor.id !== 'string' || !ACTOR_ID_PATTERN.test(actor.id)) {
        fail(errors, 'actor.id must match ^[A-Za-z0-9:_.-]{4,256}$');
      } else {
        guardSecrets(errors, 'actor.id', actor.id);
      }
    }
    if ('type' in actor && !ACTOR_TYPES.includes(actor.type)) {
      fail(errors, `actor.type must be one of: ${ACTOR_TYPES.join(', ')}`);
    }
    if ('name' in actor) {
      if (typeof actor.name !== 'string' || actor.name.length > ACTOR_MAX_NAME_LENGTH) {
        fail(errors, `actor.name must be a string of at most ${ACTOR_MAX_NAME_LENGTH} characters`);
      } else {
        guardSecrets(errors, 'actor.name', actor.name);
      }
    }
  }

  // action
  if (!action || typeof action !== 'object' || Array.isArray(action)) {
    fail(errors, 'action must be an object');
  } else {
    const actionKeys = Object.keys(action);
    if (actionKeys.length !== 2 || !actionKeys.includes('type') || !actionKeys.includes('description')) {
      fail(errors, 'action must have exactly the keys "type" and "description"');
    }
    if ('type' in action) {
      if (typeof action.type !== 'string' || !ACTION_TYPE_PATTERN.test(action.type)) {
        fail(errors, 'action.type must match ^[a-z][a-z0-9_]{0,63}$');
      }
    }
    if ('description' in action) {
      if (typeof action.description !== 'string') {
        fail(errors, 'action.description must be a string');
      } else if (action.description.length > ACTION_MAX_DESCRIPTION_LENGTH) {
        fail(errors, `action.description must be at most ${ACTION_MAX_DESCRIPTION_LENGTH} characters`);
      } else {
        guardSecrets(errors, 'action.description', action.description);
      }
    }
  }

  // timestamp
  if (typeof timestamp !== 'string' || !ISO_TIMESTAMP_PATTERN.test(timestamp)) {
    fail(errors, 'timestamp must be UTC ISO 8601 (e.g. 2026-09-03T08:00:00.000Z)');
  }

  // source
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    fail(errors, 'source must be an object');
  } else {
    const sourceKeys = Object.keys(source);
    if (sourceKeys.length !== SOURCE_KEYS.length || !SOURCE_KEYS.every((k) => sourceKeys.includes(k))) {
      fail(errors, `source must have exactly the keys ${SOURCE_KEYS.join(' and ')}`);
    }
    for (const key of SOURCE_KEYS) {
      if (key in source) {
        if (typeof source[key] !== 'string' || source[key].length > SOURCE_MAX_LENGTH) {
          fail(errors, `source.${key} must be a string of at most ${SOURCE_MAX_LENGTH} characters`);
        } else {
          guardSecrets(errors, `source.${key}`, source[key]);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a complete ContributionEvent: exact key set, event type, ID
 * format, content, and the secret guard across every free-text field.
 */
export function validateEvent(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    return { valid: false, errors: ['event must be an object'] };
  }
  const errors = [];
  const keys = Object.keys(event);
  if (keys.length !== EVENT_KEYS.length || !EVENT_KEYS.every((k) => keys.includes(k))) {
    fail(errors, `event must have exactly the keys: ${EVENT_KEYS.join(', ')}`);
  }
  if ('type' in event && event.type !== EVENT_TYPE) {
    fail(errors, `event.type must be "${EVENT_TYPE}"`);
  }
  if ('id' in event) {
    if (typeof event.id !== 'string' || !EVENT_ID_PATTERN.test(event.id)) {
      fail(errors, 'event.id must match ^event:mood:[0-9a-f]{24}$');
    }
  }
  const content = validateEventContent(event);
  errors.push(...content.errors);
  return { valid: errors.length === 0, errors };
}

// ── ContributionProof ───────────────────────────────────────────────────────

/** Validate a proof's own shape, without the event (proof file alone). */
export function validateProofShape(proof) {
  if (!proof || typeof proof !== 'object' || Array.isArray(proof)) {
    return { valid: false, errors: ['proof must be an object'] };
  }
  const errors = [];
  const keys = Object.keys(proof);
  if (keys.length !== PROOF_KEYS.length || !PROOF_KEYS.every((k) => keys.includes(k))) {
    fail(errors, `proof must have exactly the keys: ${PROOF_KEYS.join(', ')}`);
  }
  if ('proofId' in proof && (typeof proof.proofId !== 'string' || !PROOF_ID_PATTERN.test(proof.proofId))) {
    fail(errors, 'proof.proofId must match ^proof:mood:[0-9a-f]{24}$');
  }
  if ('eventId' in proof && (typeof proof.eventId !== 'string' || !EVENT_ID_PATTERN.test(proof.eventId))) {
    fail(errors, 'proof.eventId must match ^event:mood:[0-9a-f]{24}$');
  }
  if ('eventHash' in proof && (typeof proof.eventHash !== 'string' || !EVENT_HASH_PATTERN.test(proof.eventHash))) {
    fail(errors, 'proof.eventHash must match ^sha256:[0-9a-f]{64}$');
  }
  if ('createdAt' in proof && (typeof proof.createdAt !== 'string' || !ISO_TIMESTAMP_PATTERN.test(proof.createdAt))) {
    fail(errors, 'proof.createdAt must be UTC ISO 8601');
  }
  if ('algorithm' in proof && proof.algorithm !== PROOF_ALGORITHM) {
    fail(errors, `proof.algorithm must be "${PROOF_ALGORITHM}"`);
  }
  if ('verified' in proof && typeof proof.verified !== 'boolean') {
    fail(errors, 'proof.verified must be a boolean');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * The verification itself. Given a proof and the event it claims to cover:
 *
 *   1. the event is schema-valid (and carries no secrets),
 *   2. the proof is shape-valid,
 *   3. proof.eventId names this event,
 *   4. proof.eventHash equals SHA-256 over the event's canonical JSON.
 *
 * Pass all four and the event "existed and was not modified" — as far as
 * this proof can attest. The boolean is `.valid`; callers that want the
 * spec's plain true/false read that field.
 */
export function validateProof(proof, event) {
  const errors = [];
  const eventCheck = validateEvent(event);
  if (!eventCheck.valid) {
    errors.push(...eventCheck.errors.map((e) => `event: ${e}`));
  }
  const proofCheck = validateProofShape(proof);
  if (!proofCheck.valid) {
    errors.push(...proofCheck.errors.map((e) => `proof: ${e}`));
  }
  if (eventCheck.valid && proofCheck.valid) {
    if (proof.eventId !== event.id) {
      fail(errors, `proof.eventId (${proof.eventId}) does not match event.id (${event.id})`);
    }
    const recomputed = hashEvent(event);
    if (proof.eventHash !== recomputed) {
      fail(errors, `event hash mismatch: proof records ${proof.eventHash}, recomputed ${recomputed}`);
    }
  }
  return { valid: errors.length === 0, errors };
}
