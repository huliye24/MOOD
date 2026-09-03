# @mood/contribution-proof — MOOD Contribution Proof (Alpha 001)

> The recording layer of MOOD: how work performed by humans, AI Agents,
> and organizations becomes a verifiable protocol object.

```
Human Work ─┐
AI Work ────┼─▶ ContributionEvent ─▶ ContributionProof ─▶ MOOD Node ─▶ Network
Org Work  ──┘     "this happened"      "here is its hash"
```

This package answers one question and nothing else:

**"Did this contribution event happen, and was it modified afterwards?"**

## What it is NOT

By design, this layer is none of the following:

- ❌ a token reward system — no token is created, minted, or implied
- ❌ financial accounting — no values, balances, or denominations
- ❌ a reputation score — contributions are recorded, never ranked
- ❌ governance voting — no weights, no influence

Judging the value of a contribution is a later layer. Recording that it
happened — verifiably — is this one.

## The two objects

**ContributionEvent v0.1** — a minimal factual record:

```json
{
  "id": "event:mood:1a2b3c4d5e6f7890abcdef12",
  "type": "contribution_event",
  "actor": { "id": "agent:mood:9f8e7d6c5b4a3928", "type": "ai_agent", "name": "Claude Code" },
  "action": { "type": "code_change", "description": "Updated node API" },
  "timestamp": "2026-09-03T08:00:00.000Z",
  "source": { "connector": "connector:mood:...", "node": "mood:node:..." }
}
```

- `actor.type` is one of `human`, `ai_agent`, `organization` — the whole list
- `action.type` is free-form snake_case (`code_change`, `review`, `design`, …) —
  the protocol records actions, it does not grade them
- `source` records provenance: which connector captured it, on which node
- The event ID is content-derived (SHA-256 of the content minus the ID) —
  no counters, no randomness, no central allocator

**ContributionProof v0.1** — one small portable claim:

```json
{
  "proofId": "proof:mood:887766554433221100aabbcc",
  "eventId": "event:mood:1a2b3c4d5e6f7890abcdef12",
  "eventHash": "sha256:64-hex-characters...",
  "createdAt": "2026-09-03T08:00:00.000Z",
  "algorithm": "SHA-256",
  "verified": true
}
```

A third party holding an event and its proof recomputes the hash and knows
whether the event was modified after recording. That is the entire claim.

## The hash engine

- Canonical JSON: object keys sorted **recursively**, no whitespace
- SHA-256 over the canonical form, formatted `sha256:<64-hex>`
- Determinism contract: same event → same hash, always, everywhere;
  any byte changed → different hash

## API

```js
import {
  createContributionEvent,   // content → ContributionEvent (throws on invalid input)
  createProof,               // event + createdAt → ContributionProof
  deriveActorId,             // (actorType, reference) → stable agent:/human:/org:mood: ID
  hashEvent,                 // event → "sha256:<hex>"
  canonicalize,              // value → canonical JSON string
  validateEvent,             // → { valid, errors }
  validateProof,             // (proof, event) → { valid, errors }
  validateProofShape,        // proof alone → { valid, errors }
  containsSecret,            // text → secret-pattern name or null
  contributionPaths,         // ~/.mood/contributions/{events,proofs} (MOOD_HOME-aware)
  initContributionStorage,   // create the subtree (idempotent)
  saveContribution,          // {event, proof} → two JSON files on disk
  listContributions,         // → [{event, proof}] newest first
  findContribution,          // by eventId or proofId
  verifyStoredContributions, // recompute every stored hash → {total, passed, failed, results}
} from '@mood/contribution-proof';
```

Validation never throws — `{ valid, errors }` is the contract, the same
shape every MOOD package uses.

## Storage

```
~/.mood/contributions/
  events/event-mood-<hex>.json   one ContributionEvent per file
  proofs/proof-mood-<hex>.json   one ContributionProof per file
```

Plain JSON, readable by any tool. Filenames replace `:` with `-` (NTFS-safe);
the IDs inside keep their canonical `event:mood:…` form. `MOOD_HOME`
relocates the whole tree (used by the test suite and the Node image).

Storage is the node's own record. This package does **not** touch protocol
consensus, the snapshot, or the genesis block — when contribution proofs
later enter the protocol object stream, they arrive as data validated here.

## Security model

The guard runs structurally, in both directions:

- Creation rejects events whose text matches credential shapes —
  `sk-…` API keys, `-----BEGIN … PRIVATE KEY-----` blocks,
  `password:` / `api_key=` assignments
- Verification runs the same guard again, so a file tampered with a
  planted secret fails its proof check too
- No private files are read, no credentials are stored, and neither
  event nor proof contains anything that can authorize anything

The protocol refuses to record credentials — it does not merely promise
not to.

## Tests

```bash
npm test --prefix packages/contribution-proof
```

Covers: event creation, actor-type rejection, ID determinism, hash
determinism, hash sensitivity (modified event → different hash), proof
creation, proof validation (tamper / missing fields / wrong algorithm),
schema strictness (unknown keys rejected), the secret guard, actor ID
derivation, storage round-trip, and on-disk tamper detection.

## Phase Zero

No token. No wallet. No reward. This package records contributions —
the network's most primitive asset: proof that work happened.
