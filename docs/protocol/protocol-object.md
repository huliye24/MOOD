# Protocol Object

**Status:** Alpha 001 — implemented ([`packages/protocol-object`](../../packages/protocol-object))

**Authority:** Downstream of [`MOOD_CANON.md`](../../MOOD_CANON.md) and
[`contribution-proof.md`](./contribution-proof.md)

A contribution proof on one machine is a private fact. A contribution
object in the network is a public one.

## Why the protocol object exists

The proof layer answered the local question: *this work happened — can we
prove it?* It left the answer sitting in `~/.mood/contributions/` on the
node that recorded it. The next question is network-shaped: **any node —
can it hold and check this contribution without trusting the node that
recorded it?**

> A MOOD Protocol Object is how a proven contribution is stored so that
> **any node can verify it without trusting the issuer.**

The mechanism is content addressing: the object's ID *is* the hash of the
object's own content. The same object is the same ID on every node, so
verification is recomputation, not trust. Before this layer, "I have a
contribution proof" meant *my computer has a file*. After it, "a
verifiable contribution object exists" means *the MOOD network can hold
it*. That is the step from application layer to protocol layer.

## Architecture

```text
  人 Human ────────┐
  AI Agent ────────┼──▶ ContributionEvent ──▶ ContributionProof ──▶ ProtocolObject ──▶ NodeStorage ──▶ NodeSync ──▶ NetworkVerification
  Organization ────┘    (what happened)       (SHA-256: it was      (content-          (~/.mood/       (next       (any node recomputes
                          who · what · when     not modified)        addressed by       objects/)       phase)      the same ID)
                          through what                                the issuer)
```

- **ContributionEvent / ContributionProof** — unchanged, owned by
  [`@mood/contribution-proof`](../../packages/contribution-proof).
- **ProtocolObject** — the proof, wrapped into a network-verifiable
  envelope and issued by a node.
- **NodeStorage** — `~/.mood/objects/`, node-local in this alpha.
- **NodeSync** — the `ObjectSyncAdapter` interface exists; the transport
  is the next phase.
- **NetworkVerification** — already real minus the transport:
  `POST /objects/verify` verifies a *foreign* object, because an ID
  recomputes identically everywhere.

## Proof vs object — the naming audit

Two layers, two different questions, zero shared logic:

| Layer | Question it answers | Package |
|---|---|---|
| ContributionProof | *Why did this contribution happen — and is the record unmodified?* | `@mood/contribution-proof` |
| ProtocolObject | *How does the network store and verify it?* | `@mood/protocol-object` |

The naming risk was duplication: a second "proof engine" would mean a
second hash routine, a second canonicalization, and eventually two
answers to the same question. The audit's outcome is a hard rule:
**all hashing and canonicalization live in the proof package.** The
object package imports `sha256OfValue` and `canonicalize`; it defines no
hash of its own. It never re-proves a contribution — it *references* a
proof (by ID and hash) and adds the envelope the network needs.

## The object

**MOOD Protocol Object v0.1** — exactly these keys, all required:

```json
{
  "id": "object:mood:e31e1b98a6db45f0a2f7c9d1",
  "type": "contribution",
  "version": "0.1",
  "createdAt": "2026-09-03T11:12:40.000Z",
  "issuer": {
    "nodeId": "mood:node:3feb3570…"
  },
  "payload": {
    "eventId": "event:mood:c2307ceaa3259a8f56aac3fd",
    "proofId": "proof:mood:8dc2002102c050adb2fb3675",
    "eventHash": "sha256:5da66d0c407652fdc73d6e46cd93609b28bc428c748ea1c20e3ab8ce48bb08df",
    "algorithm": "SHA-256"
  }
}
```

- `type` ∈ `contribution` — exactly one type in Alpha 001
- `issuer.nodeId` — the node that minted the object (`mood:node:<hex>`)
- `payload` — a *reference* to a proof: the four binding fields, nothing
  else. No proof logic, no event copy, no score, no reward fields — the
  payload schema rejects anything beyond the four keys
- **Never present:** credentials — the same guard that protects events
  and proofs runs at object creation *and* verification *and* API serving

## Content-addressed identity

The ID is derived, never assigned:

1. Take the object's content — `{type, version, createdAt, issuer,
   payload}` — *without* the `id` (nothing can hash itself into place).
2. Canonicalize it: recursively sorted keys, no whitespace — the same
   canonical form the proof layer uses.
3. Hash with SHA-256, keep the first 24 hex characters:
   `object:mood:<24 hex>`.

Determinism is the contract:

- same content (any key order, any machine) → **same ID**
- one changed character — a payload field, the issuer, the timestamp —
  → **different ID**, and the old ID no longer verifies
- any node recomputing the ID from the content gets the same answer.
  That is the whole verification model.

## Storage

```text
  ~/.mood/objects/
    contribution/object-mood-<24hex>.json   the objects — protocol truth
    index/by-type.json                      {"contribution":[ids]} — a DERIVED
                                            catalog, rebuildable from the files
    metadata/object-mood-<24hex>.json       {origin, syncStatus} — local sync
                                            state; never hashed, never part of
                                            the object
```

The files are the truth; the index is a cache; the metadata is a
scratchpad. Losing the index or the metadata loses nothing. Objects are
validated *before* they touch disk — an invalid object is never stored —
and storing the same object twice is idempotent.

This store is deliberately separate from the node runtime's
StorageManager: that manager injects bookkeeping fields into stored
records and falls back to random IDs — either would break content
addressing. Objects are immutable, addressed, and self-verifying; they
get their own store.

## Verification — two independent levels

- **Integrity** — the ID recomputes from the content
  (`validateProtocolObject`). This check is identical on every node;
  it is what the network will run.
- **Linkage** — the referenced proof is stored *here* with the same IDs
  and hash (`verifyObjectLinkage`). An absent record is a **note**, not
  a failure — other nodes hold other nodes' objects. A record that
  *contradicts* the object is a failure.

| Surface | Command / Route | Answers |
|---|---|---|
| CLI | `mood object create [--type] [--proof]` | wrap a stored proof into an object issued by this node |
| CLI | `mood object list` | the objects this node holds |
| CLI | `mood object verify [id]` | integrity + linkage; exit 1 on failure |
| API | `GET /objects` | the objects this node holds |
| API | `GET /objects/:id` | one object + its verification status |
| API | `POST /objects/verify` | ANY node's object — integrity + linkage |
| Library | `@mood/protocol-object` | `validateProtocolObject(object)` → `{valid, errors}` |
| Sync | `ObjectSyncAdapter` | `verifyRemoteObject` concrete; `syncObject` is an honest refusal |

## Synchronization — prepared, not implemented

Only the interface ships in this alpha. `syncObject()` throws
`not-implemented-in-alpha-001` — no silent no-ops — while
`verifyRemoteObject()` is already concrete, because verifying a foreign
object needs no transport at all: hand any node the object and it
recomputes the ID. The relay/propagation design is the next phase's
spec.

## What an object is not

- **Not a token.** No value, no supply, no transfer — Phase Zero is
  unchanged.
- **Not a reputation score or reward.** Objects carry references, never
  judgments. Scoring remains future policy on top of verified facts.
- **Not governance, not financial logic.** Nothing here votes or
  settles.
- **Not a second proof engine.** Hashing and canonicalization stay in
  the proof package; this layer wraps, stores, and verifies.
- **Not consensus.** The object stream never touches the genesis block,
  the identity system, or the hash algorithm.

## Alpha scope

- One object type (`contribution`); new types arrive as new payload
  schemas behind the same envelope.
- Storage is node-local; the sync transport is the next phase.
- The ID keeps 24 hex characters (96 bits) — collision-safe at alpha
  scale, to be revised with the network design.
- The issuer is *declared*, not yet *signed*: `issuer.nodeId` names the
  minting node, and node-key issuance signatures are a future alpha.
  Content addressing already guarantees *what* the object says; it does
  not yet prove *who* minted it.

## Alpha Evolution

**Alpha 001 — completed 2026-09-03.** Object creation and verification:
the content-addressed envelope, deterministic IDs, node storage, the
object API, tamper detection, and external object verification.

**Alpha 002 — planned.** Nothing below is implemented yet; the
placeholders exist as directories with READMEs, nothing more:

- **issuer signature** — a node-key signature over the object content,
  so verification proves *who* minted the object, not only *what* it
  says (`src/signature/`)
- **node identity proof** — binding the declared `issuer.nodeId` to
  the signing node's identity
- **object registry** — authoritative management of object types,
  versions, and schemas (`src/registry/`)
- **genesis object** — the first object, defining the network's
  starting state (`src/genesis/`)
- **object state transition** — how an object's lifecycle state
  changes without breaking immutability

Each item lands in its own alpha with its own spec and its own
acceptance gate. None of them may silently alter the v0.1 envelope, the
ID derivation, or the hash algorithm.

**Milestone record:**
[`docs/history/MOOD_PROTOCOL_MILESTONE_ALPHA_001.md`](../history/MOOD_PROTOCOL_MILESTONE_ALPHA_001.md)

---

*Reference: [`packages/protocol-object`](../../packages/protocol-object) ·
[`docs/protocol/contribution-proof.md`](./contribution-proof.md) ·
[`docs/protocol/node.md`](./node.md) ·
[`docs/agent/contribution-demo.md`](../agent/contribution-demo.md)*
