/**
 * Protocol Object Alpha 001 — schema constants.
 *
 * One envelope, many payload types:
 *
 *   ProtocolObject v0.1 — "the network stores and verifies this"
 *                          (content-addressed: the ID is the hash of the
 *                           object's own content, so the same object is
 *                           the same ID on every node)
 *
 * What this layer is NOT — by design:
 *   - NOT a new proof algorithm (hashing stays in @mood/contribution-proof)
 *   - NOT consensus (it never touches snapshots or genesis)
 *   - NOT a token / reward / reputation system
 *
 * The layering this package implements:
 *
 *   ContributionProof  "why this contribution happened"   (@mood/contribution-proof)
 *   ProtocolObject     "how the network stores and        (this package)
 *                       verifies it"
 *
 * SECURITY INVARIANT: objects carry no passwords, no API keys, no private
 * keys, no private data — the same structural guard the proof layer
 * enforces, re-run here so a tampered object planted with a secret fails
 * verification even if it was never created through this package.
 */

// ── ProtocolObject v0.1 ─────────────────────────────────────────────────────

/** The whole object vocabulary of Alpha 001. One type: the contribution. */
export const OBJECT_TYPES = ['contribution'];

/** The only version this alpha speaks. New versions cannot silently replace it. */
export const OBJECT_VERSION = '0.1';

/** Exact key set of a ProtocolObject (all required). */
export const OBJECT_KEYS = ['id', 'type', 'version', 'createdAt', 'issuer', 'payload'];

/** Exact key set of the issuer block. */
export const ISSUER_KEYS = ['nodeId'];

/**
 * Who may issue: a MOOD node. The same idiom as every protocol ID —
 * `mood:node:<hex>` (64 hex chars, from the node's Ed25519 public key).
 */
export const NODE_ID_PATTERN = /^mood:node:[0-9a-f]{16,128}$/;

/**
 * Object IDs are content-derived, not counters:
 * `object:mood:<24 hex>` = SHA-256 of {type, version, createdAt, issuer,
 * payload} (canonical JSON), truncated to 24 hex chars — the same idiom as
 * event:mood:… and proof:mood:…, so the whole protocol reads one way.
 */
export const OBJECT_ID_PATTERN = /^object:mood:[0-9a-f]{24}$/;

/** Timestamps are UTC ISO 8601 — shared format with the proof layer. */
export const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

// ── Contribution payload v0.1 ───────────────────────────────────────────────

/**
 * The contribution payload references a ContributionProof — it never
 * copies the event, never re-hashes anything, never duplicates proof
 * logic. It points: which event, which proof, which hash, which algorithm.
 */
export const CONTRIBUTION_PAYLOAD_KEYS = ['eventId', 'proofId', 'eventHash', 'algorithm'];

/** Default type when a caller does not name one (Alpha 001 has exactly one). */
export const DEFAULT_OBJECT_TYPE = 'contribution';
