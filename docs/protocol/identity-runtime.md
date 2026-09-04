# MOOD Protocol Alpha 002-B — Identity Runtime Implementation

**Status:** IMPLEMENTED — `packages/identity` (`@mood/identity`) is the runtime.
**Date:** 2026-09-04
**Predecessors:**
[Identity Layer Specification Alpha 002](./identity-layer.md) — ACCEPTED ·
[Cryptographic Identity Design Alpha 002-A](./identity-cryptography.md) — ACCEPTED
**Decision record:** [ADR-004](../decisions/ADR-004-identity-algorithm-selection.md) — Accepted (Ed25519)
**Implementation plan:** [ALPHA002B_IMPLEMENTATION_PLAN](../history/ALPHA002B_IMPLEMENTATION_PLAN.md)

Alpha 001 defines what the object is. Alpha 002 defines who created it.
This document describes the runtime that implements the Alpha 002-A
design — where the keys live, what a signature covers, how verification
works, and where the security boundary sits.

One rule governs the whole implementation:

> **Identity sits above the object layer. Alpha 001 remains history.**

No Alpha 001 schema, hash algorithm, or proof logic was modified. The
existing test suites pass unchanged.

---

## SECTION 1 — What Was Built

| Piece | Location | Role |
|---|---|---|
| Identity runtime | `packages/identity/src/identity.js` | adopt-or-generate node identity; refuse-to-rekey |
| Key manager | `packages/identity/src/key-manager.js` | Ed25519 keypairs (Node native crypto); the ONLY module that touches private material |
| Signer | `packages/identity/src/signer.js` | `signObjectHash` — signs 256-bit canonical object digests |
| Verifier | `packages/identity/src/verifier.js` | `verifyObjectSignature` — a predicate, never a crash |
| Serializer | `packages/identity/src/serializer.js` | formats, `nodeId` derivation, digest normalization, validation |
| CLI | `apps/mood-cli/src/commands/identity.js` | `mood identity create` / `mood identity show` |
| CLI state | `apps/mood-cli/src/state.js` | `mood init` adopts or generates one key and activates the protocol identity |
| API | `services/node-api/src/routes/identity.js` | `GET /identity` — public identity only |

The algorithm is Ed25519 via Node's native `crypto` module — zero new
cryptographic dependencies. The selection and its trade-offs are
recorded in [ADR-004](../decisions/ADR-004-identity-algorithm-selection.md).

---

## SECTION 2 — Key Storage

```
~/.mood/identity/
  public.json     propagatable — { nodeId, publicKey, algorithm, networkId, createdAt, identityVersion }
  private.json    node-local   — { nodeId, privateKey, algorithm, createdAt, warning }
  node.json       legacy runtime record (organization, client version) — public side
```

- `private.json` is written with mode `0600` where the filesystem
  supports it, carries an inline warning, and is read only by the local
  signing process (`mood init`, invitation signing, object signing).
  `MOOD_HOME` overrides the root directory, mirroring the object layer.
- `public.json` is the identity of record. It validates on load: field
  formats, and — because the record names its network — that `nodeId`
  actually derives from `publicKey`. A swapped key wearing a stolen
  node ID is rejected at load time.

### One node, one key

The repository already ran an Ed25519 identity (`mood init` + tweetnacl
in the node runtime). Alpha 002-B does not rekey those nodes — it
adopts them. `createIdentity()` resolves three situations, all toward a
single keypair:

| State | Behavior |
|---|---|
| `public.json` exists | **refuse** — rekeying is a deliberate human act, never an API side effect |
| `private.json` exists (`mood init` ran first) | **adopt** — same key, same node ID; only `public.json` is written |
| nothing exists | **generate** fresh, write both records |

The shared encodings make adoption exact: the deployed
`nodeId = sha256('1|' + networkId + '|' + publicKey)` derivation and the
64-byte `seed ‖ publicKey` secret encoding are reused unchanged, so an
adopted node keeps the node ID it already has. Signatures are
byte-identical with the deployed runtime — verified bidirectionally
against tweetnacl in the test suite.

`mood init` follows the same rule from its side: a protocol identity
created first (`mood identity create`) is adopted, never regenerated;
an already-initialized node gets its protocol identity activated over
the existing key on the next `mood init`.

---

## SECTION 3 — Signing Flow

```
object (Alpha 001, frozen schema)
   │
   ▼
objectContent(object)            ← the exact preimage the 24-hex object ID truncates
   │
   ▼
contentDigest(content)           ← 'sha256:<64hex>' — the shared hash engine
   │                                (@mood/contribution-proof; no second engine)
   ▼
signObjectHash(digest, privateKey)
   │  rejects anything that is not a 256-bit digest
   ▼
signature                        ← base64, 64 bytes, over the 32 digest bytes
```

A signature attaches **outside** the object envelope — the Alpha 001
object is byte-identical whether signed or not:

```js
const signed = { object, signature };
```

The signature target is the **full 256-bit content digest**, never the
truncated 24-hex object ID, never a database record. `signObjectHash`
refuses any input that is not a 64-hex digest (`'sha256:<64hex>'` or
bare hex) before touching the key. RFC 8032 makes the signature
deterministic: same key + same digest → identical bytes on every
machine, so third parties re-verify reproducibly.

---

## SECTION 4 — Verification Flow

```
verifyObjectSignature(objectHash, signature, publicKey)
   │
   ├─ malformed input (bad digest, bad key, bad signature) → false
   ├─ signature length ≠ 64 bytes                        → false
   ├─ Ed25519 verify over the 32 digest bytes             → true | false
   ▼
```

Verification is a **predicate**: it answers `true` or `false` and never
throws, no matter how malformed the input. Any node, anywhere, can
verify with the issuer's public identity alone — no issuer contact, no
network call, no permission.

### Two-mode verification (Alpha 001 compatibility)

Absence of a signature is not an error. Alpha 001 objects validate
exactly as they always have; a signature, when present, is verified
against the claimed issuer. Unsigned objects stay valid forever —
every existing object and every existing test passes unchanged.

---

## SECTION 5 — Security Boundary

**The private key exists in exactly one place: the node's
`~/.mood/identity/private.json`.** Everything else is public or
procedural:

- `@mood/identity`'s root export carries **no private-material
  accessors** — they live only on the `@mood/identity/key-manager`
  subpath, so a consumer of the public surface cannot even load the
  code that reads private files.
- The package never writes to stdout/stderr — it cannot log key
  material even by accident.
- `mood identity create` prints the public identity only.
- `GET /identity` serves the public identity; the API process **never
  opens `private.json`** (a standing invariant of
  `services/node-api/src/state.js`, unchanged).
- The Alpha 002-B test suite scans every public artifact — `public.json`,
  the exported identity, the signature output — for the private key,
  the seed, and their encodings; none may appear.
- Verification never needs the private key; a third party needs only
  the public identity.

### Key rotation

There is no automatic rotation. Replacing an identity is a deliberate
act: remove the records by hand, generate anew. The runtime's job is to
make accidental rekeying impossible, not to make rekeying convenient.

---

## SECTION 6 — What Comes Next

Alpha 002-C (Object Signature Integration) will wire this runtime into
the object pipeline: sign objects at creation or on demand, carry
signatures alongside objects in storage and sync, and verify on read.
The frozen formats — key encoding, node-ID derivation, signature
target, signature encoding — are recorded in
[ADR-004](../decisions/ADR-004-identity-algorithm-selection.md) so
002-C integrates against a stable target.
