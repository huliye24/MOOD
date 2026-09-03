/**
 * Contribution Proof Alpha 001 — ContributionEvent creation.
 *
 * A ContributionEvent is a minimal factual record:
 *
 *   "This actor performed this action at this time, captured through
 *    this connector on this node."
 *
 * The event ID is derived from the event's own content (minus the id
 * field itself), so the same contribution recorded with the same
 * timestamp always carries the same ID — no counters, no randomness,
 * no central allocator.
 *
 * What this layer deliberately does NOT record: value, quality, rank,
 * reward. Judging a contribution is a later layer; recording it is this one.
 */

import {
  EVENT_TYPE,
  ACTOR_TYPES,
} from './schema.js';
import { sha256OfValue } from './hash.js';
import { validateEventContent, validateEvent } from './validator.js';

/**
 * Derive a stable actor ID when no registered identity exists.
 *
 *   ai_agent + 'claude-code'     → agent:mood:<16-hex>
 *   human + 'yu@example.org'     → human:mood:<16-hex>
 *   organization + 'mood-labs'   → org:mood:<16-hex>
 *
 * Same actor reference → same ID, on every machine, forever. This is a
 * derivation, not a registration — the connector layer remains the place
 * where agent identities are formally established.
 */
export function deriveActorId(actorType, reference) {
  if (!ACTOR_TYPES.includes(actorType)) {
    throw new Error(`actorType must be one of: ${ACTOR_TYPES.join(', ')}`);
  }
  if (typeof reference !== 'string' || reference.trim().length === 0) {
    throw new Error('reference must be a non-empty string');
  }
  const prefix = actorType === 'human' ? 'human:mood:' : actorType === 'organization' ? 'org:mood:' : 'agent:mood:';
  const seed = `${actorType}:${reference.trim().toLowerCase()}`;
  return prefix + sha256OfValue(seed).slice(0, 16);
}

/**
 * Create a ContributionEvent v0.1.
 *
 * @param {object} input
 *   actor      {id, type, name?}   — required; type is human|ai_agent|organization
 *   action     {type, description} — required; type is snake_case
 *   timestamp  string              — required; UTC ISO 8601 (e.g. new Date().toISOString())
 *   source     {connector, node}   — required; may be empty strings
 *
 * Throws Error with code INVALID_CONTRIBUTION_EVENT when the content does
 * not validate — invalid events never reach storage.
 */
export function createContributionEvent({ actor, action, timestamp, source }) {
  const content = {
    actor: normalizeActor(actor),
    action: normalizeAction(action),
    timestamp,
    source: normalizeSource(source),
  };
  const check = validateEventContent(content);
  if (!check.valid) {
    const error = new Error(`invalid contribution event: ${check.errors.join('; ')}`);
    error.code = 'INVALID_CONTRIBUTION_EVENT';
    error.errors = check.errors;
    throw error;
  }
  // ID derives from the content (without the id) — content-addressed, so
  // no two different contributions can share an ID, and no counter or
  // random source can influence one.
  const id = 'event:mood:' + sha256OfValue(content).slice(0, 24);
  const event = { id, type: EVENT_TYPE, ...content };
  const finalCheck = validateEvent(event);
  if (!finalCheck.valid) {
    // Defensive: content passed, so a failure here means a constructor bug.
    const error = new Error(`internal error: constructed event failed its own validation: ${finalCheck.errors.join('; ')}`);
    error.code = 'INVALID_CONTRIBUTION_EVENT';
    throw error;
  }
  return event;
}

function normalizeActor(actor) {
  if (!actor || typeof actor !== 'object') {
    throw new Error('actor must be an object {id, type, name?}');
  }
  const normalized = { id: actor.id, type: actor.type };
  if (typeof actor.name === 'string' && actor.name.length > 0) {
    normalized.name = actor.name;
  }
  return normalized;
}

function normalizeAction(action) {
  if (!action || typeof action !== 'object') {
    throw new Error('action must be an object {type, description}');
  }
  return { type: action.type, description: typeof action.description === 'string' ? action.description : '' };
}

function normalizeSource(source) {
  if (!source || typeof source !== 'object') {
    throw new Error('source must be an object {connector, node}');
  }
  return {
    connector: typeof source.connector === 'string' ? source.connector : '',
    node: typeof source.node === 'string' ? source.node : '',
  };
}
