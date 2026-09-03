/**
 * Contribution Proof Alpha 001 — schema constants.
 *
 * Two objects, nothing else:
 *
 *   ContributionEvent  v0.1  — "this actor did this action at this time,
 *                               recorded through this connector on this node"
 *   ContributionProof  v0.1  — "the event looked like this when recorded"
 *                               (SHA-256 over the event's canonical JSON)
 *
 * What this layer is NOT — by design:
 *   - NOT a token reward system
 *   - NOT financial accounting
 *   - NOT a reputation score
 *   - NOT governance voting
 *
 * It only creates: proof that a contribution event happened and was not
 * modified afterwards.
 *
 * SECURITY INVARIANT: events and proofs carry no passwords, no API keys,
 * no private keys, no private data. The validator rejects secret-shaped
 * content structurally (see SECRET_PATTERNS below) — the protocol refuses
 * to record credentials, rather than merely promising not to.
 */

// ── ContributionEvent v0.1 ──────────────────────────────────────────────────

export const EVENT_TYPE = 'contribution_event';

/** Who can act. The whole list — v0.1 knows no other actors. */
export const ACTOR_TYPES = ['human', 'ai_agent', 'organization'];

/** Exact key set of a ContributionEvent (all required). */
export const EVENT_KEYS = ['id', 'type', 'actor', 'action', 'timestamp', 'source'];

/** Required actor keys; `name` is the one optional display field. */
export const ACTOR_REQUIRED_KEYS = ['id', 'type'];
export const ACTOR_OPTIONAL_KEYS = ['name'];
export const ACTOR_MAX_NAME_LENGTH = 128;

/** Action shape: snake_case type + free-text description. */
export const ACTION_TYPE_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;
export const ACTION_MAX_DESCRIPTION_LENGTH = 2000;

/** Source shape: connector and node provenance (may be empty strings). */
export const SOURCE_KEYS = ['connector', 'node'];
export const SOURCE_MAX_LENGTH = 256;

/** Timestamps are UTC ISO 8601 — one format, deterministic everywhere. */
export const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/** ID formats (same idiom as agent:mood:… / connector:mood:…). */
export const EVENT_ID_PATTERN = /^event:mood:[0-9a-f]{24}$/;
export const ACTOR_ID_PATTERN = /^[A-Za-z0-9:_.-]{4,256}$/;

// ── ContributionProof v0.1 ──────────────────────────────────────────────────

export const PROOF_ALGORITHM = 'SHA-256';

/** Exact key set of a ContributionProof (all required). */
export const PROOF_KEYS = ['proofId', 'eventId', 'eventHash', 'createdAt', 'algorithm', 'verified'];

export const PROOF_ID_PATTERN = /^proof:mood:[0-9a-f]{24}$/;
export const EVENT_HASH_PATTERN = /^sha256:[0-9a-f]{64}$/;

// ── Secret guard ────────────────────────────────────────────────────────────

/**
 * Credential-shaped patterns. A contribution record that matches any of
 * these is rejected at creation AND at validation — the guard runs both
 * directions, so a tampered file planted with a secret also fails proof
 * verification.
 */
export const SECRET_PATTERNS = [
  {
    name: 'api key',
    pattern: /\bsk-[A-Za-z0-9][A-Za-z0-9_-]{15,}\b/,
  },
  {
    name: 'private key block',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  },
  {
    name: 'credential assignment',
    pattern: /\b(password|passwd|secret|api[\s_-]?key|apikey|access[\s_-]?token|auth[\s_-]?token|private[\s_-]?key)\b\s*[:=]\s*\S+/i,
  },
];
