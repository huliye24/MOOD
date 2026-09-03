# MOOD Protocol Milestone Alpha 001

**Date:** 2026-09-03
**Record:** Historical — this milestone is closed.

On 2026-09-03, the MOOD Network created its first native protocol
object.

## Before and after

**Before:** a contribution existed as application-level data. A node
could record work and prove it locally — but "I have a contribution
proof" meant *my computer has a file*. No other node could hold it,
check it, or even name it.

**After:** a contribution became a network-verifiable immutable
object. The object's ID is the hash of its own content, so the same
object is the same ID on every node. "A verifiable contribution object
exists" now means *the MOOD network can hold it*.

## The chain that closed

```text
Contribution Event
        |
        v
Contribution Proof
        |
        v
Protocol Object
        |
        v
Network Verification
```

Each layer answers one question and delegates the rest:

- **Contribution Event** — what happened: who, what, when, through what.
- **Contribution Proof** — the record was not modified after recording
  (SHA-256, content-derived IDs).
- **Protocol Object** — the proof, wrapped in a content-addressed
  envelope issued by a node.
- **Network Verification** — any node recomputes the ID from the
  content and reaches the same answer, without trusting the issuer.

## Alpha 001 completed

- **Content-addressed object** — `object:mood:<24 hex>` is the SHA-256
  of the object's own canonical content; the ID is derived, never
  assigned.
- **Deterministic verification** — same content (any key order, any
  machine) → same ID; one changed character → different ID, and the
  old ID no longer verifies.
- **Object storage** — `~/.mood/objects/`: object files are the truth,
  the index a derived cache, metadata local sync state.
- **Object API** — `GET /objects`, `GET /objects/:id`,
  `POST /objects/verify`.
- **Tamper detection** — edited objects fail verification with exit
  code 1; invalid objects never touch disk.
- **External object verification** — `POST /objects/verify` verifies a
  foreign object, because an ID recomputes identically everywhere.

## What this milestone represents

This milestone marks the transition:

```text
Application Layer
        ↓
Protocol Layer
```

Contribution stopped being something an application *records* and
became something the network *stores and verifies*. The verification
model changed from trust to recomputation.

## What Alpha 001 deliberately is not

No token, no reward, no reputation score, no governance, no financial
logic. The genesis history, the identity system, and the hash
algorithm are untouched. Phase Zero stands.

## Forward

The next alphas are prepared as interfaces, not implementations —
see the Alpha Evolution section in
[`docs/protocol/protocol-object.md`](../protocol/protocol-object.md):

- **Alpha 002** — identity signatures, node identity proof, object
  registry, genesis object, object state transitions.
- **Alpha 003** — object synchronization across nodes.

---

*Implementation: commit `986594f` · package
[`packages/protocol-object`](../../packages/protocol-object) ·
audit: [`protocol-object-alpha-001-audit.md`](./protocol-object-alpha-001-audit.md)*
