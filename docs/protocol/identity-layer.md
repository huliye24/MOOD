# MOOD Protocol Identity Layer Specification Alpha 002

**Status:** SPECIFICATION ONLY — nothing in this document is implemented.
**Date:** 2026-09-04
**Predecessor:** [Protocol Object Alpha 001](../history/alpha-001/README.md) — FROZEN
**Decision record:** [ADR-002](../decisions/ADR-002-identity-layer.md) — Proposed

Alpha 002 extends Alpha 001. It does not rewrite it. The v0.1 object
envelope, the ID derivation, and the hash algorithm are frozen by
[ADR-001](../decisions/ADR-001-alpha001-freeze.md) and are not touched
here.

---

## 1. Purpose

Alpha 001 solved:

> *"What is the object?"*

Content addressing answers it: the object ID is the SHA-256 hash of the
canonical content, and verification is recomputation. Any node, anywhere,
can confirm *what* the object says — without trusting the node that
minted it.

But Alpha 001 cannot answer:

> *"Who created the object?"*

The `issuer.nodeId` field is *declared, not signed*
([protocol-object.md](./protocol-object.md), Alpha scope). A node name is
not an identity:
[node.md](./node.md) already states the principle — *"being named as a
node does not by itself prove identity."*

Alpha 002 solves:

> *"Who created the object?"*

The Identity Layer provides:

- **node identity** — a cryptographic identity for each network
  participant
- **object ownership proof** — evidence that a specific node minted a
  specific object
- **signature verification** — a network-verifiable authorship check
  that needs no central authority

```text
Alpha 001                        Alpha 002
object integrity          →      object authorship
"what does it say?"       →      "who minted it?"
```

---

## 2. Design Principles

### Decentralization

No central identity authority. There is no registrar, no certificate
bureau, no account server. Identity is established by key possession
and verified by mathematics. Any node can create an identity; the
network as a whole verifies it.

### Cryptographic Verification

Identity must be verified through cryptography, not through trust,
reputation, or naming. A claim of authorship is accepted only when a
valid signature verifies against the declared public identity. Every
other claim remains out of scope.

### Self Sovereignty

Nodes control their own identity. A node generates its own key pair,
stores its own private key, and revokes or rotates its own keys. No
third party issues, holds, or can confiscate a node identity.

### Compatibility

Alpha 002 must extend Alpha 001, not rewrite it:

- the v0.1 envelope keeps its six keys — unchanged
- the ID derivation stays SHA-256 over canonical content — unchanged
- the hash engine stays in `@mood/contribution-proof` — unchanged
- every Alpha 001 object remains valid and verifiable — unchanged

A signature is added *alongside* the object, never inside the frozen
envelope.

---

## 3. Identity Model

```text
Node
  |
  |  has one
  v
Public Identity
  |
  |  backed by
  v
Key Pair
  |
  |  exercises
  v
Signature Capability
```

A **node identity** represents a cryptographic participant in the MOOD
Network.

- **Node** — the actor: the software instance that mints and verifies
  protocol objects.
- **Public Identity** — the claim: a stable identifier (`mood:node:<hex>`)
  bound to a public key, publishable and referenceable by anyone.
- **Key Pair** — the root of the claim: a private key held only by the
  node and a public key anyone can use to verify.
- **Signature Capability** — the exercise of the claim: a signature
  produced by the private key over an object hash, verifiable by the
  public key.

An identity is not a permission. Possessing one grants no authority,
rank, or trust — it grants only the ability to make *attributable*
statements: "this object was minted by me."

---

## 4. Identity Object Model

The identity itself becomes a protocol object — an **Identity Object**:

```json
{
  "type": "identity",
  "version": "alpha-002",
  "nodeId": "",
  "publicKey": "",
  "createdAt": "",
  "algorithm": ""
}
```

- `type` — `"identity"`, a new object type alongside `"contribution"`
- `version` — `"alpha-002"`, distinct from the envelope's `"0.1"`
- `nodeId` — the identifier other objects reference in `issuer.nodeId`
- `publicKey` — the verification key, in a format fixed by the algorithm
  choice
- `createdAt` — when this identity entered the network
- `algorithm` — the signature algorithm this identity uses

This is **SPECULATION ONLY** — a design sketch of the future structure.
Do not implement. Field set, ID derivation, and canonical form are
settled by the Identity Object Specification milestone
([roadmap](../history/alpha-002-roadmap.md), milestone 1).

---

## 5. Key Model

**Private Key**

- never leaves the node
- never stored in protocol objects
- never transmitted, logged, or exported into any network structure

**Public Key**

- shareable — it is, by design, public
- carried in the Identity Object
- used for verification by every node in the network

The division of labor:

```text
sign            — private key, node-local
verify          — public key, network-wide
```

The network verifies signatures, not private information. No
verification path ever requires, receives, or reveals a private key.
An object that contains key material flagged as private is rejected.

---

## 6. Object Signature Model

Alpha 001:

```text
Object
  |
  |  SHA-256, canonical form
  v
Hash            (the object ID — 24 hex)
```

Alpha 002:

```text
Object
  |
  |  SHA-256, canonical form
  v
Hash            (full 256-bit content digest)
  |
  |  node private key
  v
Signature
```

Signing flow:

```text
Node Private Key
  |
  v
Sign Object Hash
  |
  v
Attach Signature
  |
  v
Network Verify
```

Design note on the signing target: the signature covers the **full
256-bit content digest**, not the 24-hex object ID. The ID is a
96-bit truncation — a good addressing handle, a weaker commitment.
Signing the full digest binds the signature to the entire content;
the ID remains what objects are *addressed by*. The signature
algorithm itself (Ed25519, ECDSA, or other) is an
[open question](#12-open-questions).

---

## 7. Extended Protocol Object Design

Alpha 001 does not change. Alpha 002 proposes an extension of what a
node stores and serves *around* the object:

```text
Alpha 001:                          Alpha 002:

{                                   {
  object                              object
    └─ payload                          └─ payload
}                                     signature
                                        ├─ keyRef
                                        ├─ algorithm
                                        └─ value
                                      }
```

- **object** — the frozen v0.1 envelope, byte-identical. The six keys,
  the payload schema, and the ID derivation are untouched. The
  signature must never enter the ID-derived content — the ID would
  change, and the signature would be circular.
- **signature** — an attached structure, stored and transported
  alongside the object: a reference to the signer's public identity
  (`keyRef`), the algorithm used, and the signature value over the
  object's full content digest.

**Signature is an extension, not a replacement.** An Alpha 002
consumer reads the object exactly as Alpha 001 defined it, then —
and only if a signature is present — verifies authorship on top.

---

## 8. Verification Flow

Step 1 — **Receive object** (with optional signature and referenced
public identity).

Step 2 — **Calculate object hash** — canonicalize, SHA-256, exactly as
Alpha 001 does. This alone already proves content integrity.

Step 3 — **Read issuer identity** — resolve `issuer.nodeId` /
`signature.keyRef` to a public identity object.

Step 4 — **Verify signature** — check the signature value against the
calculated digest and the public key.

Step 5 — **Accept or reject** — object + signature + identity either
form a consistent authorship proof or they do not.

```text
Object
  +
Signature
  +
Public Identity
  |
  v
Verification
```

Unsigned objects (all of Alpha 001) stop after Step 2: valid content,
unknown author. Signed objects continue through Step 5: valid content,
proven author. Neither path trusts the serving node.

---

## 9. Security Model

| Threat | Defense |
|---|---|
| fake issuer — a node claims another node's `nodeId` | cryptographic signature — a forged claim cannot produce a valid signature under the real node's public key |
| object modification — content is altered in transit or storage | immutable object hash — the recomputed digest fails to match; the signature over the digest fails with it |
| stolen private key — an attacker signs as the victim | timestamp — bounds when a signature could plausibly originate; future nonce — makes each signed statement unique |
| replay attack — a valid signed object is re-submitted as new | timestamp + future nonce — identical content re-appearing is detectable and rejectable |

Key rotation and revocation — the full answer to stolen keys — are
[open questions](#12-open-questions), deliberately not resolved by this
specification.

---

## 10. Alpha 002 Boundary

**Implemented:**

- NONE — this document is a specification.

**Planned (Alpha 002 scope):**

- identity schema
- key management
- signature format
- verification rules

**NOT INCLUDED:**

- governance
- reputation
- token
- consensus
- P2P

These belong to later alphas, exactly as
[boundary.md](../history/alpha-001/boundary.md) records.

---

## 11. Migration Strategy

**Alpha 001 objects remain valid.** Nothing about them changes: the
envelope, the ID, the storage layout, the verification path. A node
running Alpha 002 verification still accepts every Alpha 001 object by
content alone.

**Alpha 002 adds an identity proof layer.**

```text
old objects     → still verifiable        (content, unsigned)
new objects     → support identity        (content + signature)
```

Verification becomes two-mode:

- **unsigned mode** — Alpha 001 objects: hash recomputation, exactly
  as frozen
- **signed mode** — objects with an attached signature: hash
  recomputation *plus* authorship proof

The network never retrofits signatures onto old objects — that would
rewrite history. Old objects keep their historical meaning: content
verified, author declared. New objects can prove more.

---

## 12. Open Questions

Listed for research. Not answered here.

- **signature algorithm choice** — Ed25519, ECDSA over secp256k1, or
  another scheme; performance, library support, and quantum-era
  posture all weigh in
- **key rotation** — how a node replaces a key pair without losing its
  identity and its signed history
- **identity recovery** — whether and how a lost key can ever be
  recovered, and what social or cryptographic assumptions that requires
- **multi-device identity** — whether one node identity spans several
  physical devices, and how key sharing or delegation would work
- **node reputation relationship** — how identity interacts with the
  future reputation layer (Alpha 004) without identity becoming
  reputation's hostage

These questions are resolved by the Alpha 002 milestones —
each with its own spec and its own review — not by this document.

---

*Predecessor: [`docs/protocol/protocol-object.md`](./protocol-object.md) ·
Decision records: [ADR-001](../decisions/ADR-001-alpha001-freeze.md),
[ADR-002](../decisions/ADR-002-identity-layer.md) ·
Roadmap: [`docs/history/alpha-002-roadmap.md`](../history/alpha-002-roadmap.md)*
