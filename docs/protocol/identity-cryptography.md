# MOOD Protocol Alpha 002-A — Cryptographic Identity Design Specification

**Status:** SPECIFICATION ONLY — nothing in this document is implemented.
**Date:** 2026-09-04
**Predecessor:** [Identity Layer Specification Alpha 002](./identity-layer.md) — ACCEPTED
**Decision record:** [ADR-003](../decisions/ADR-003-cryptographic-identity-design.md) — Proposed
**Roadmap:** [Alpha 002-A Roadmap](../history/alpha-002-a-roadmap.md)

This document defines the cryptographic model for MOOD node identity.
It does not generate keys, choose a final algorithm, or touch the
frozen [Alpha 001](../history/alpha-001/README.md) surface.

---

## SECTION 1 — Design Objective

Alpha 001 proves:

> *"What is the object?"*

Alpha 002 proves:

> *"Who created the object?"*

This document defines the cryptographic machinery that makes the second
answer hold. Cryptographic identity provides:

- **node authenticity** — a node is what its key pair says it is
- **object authorship** — a signed object is attributable to exactly one
  node identity
- **signature verification** — any node, anywhere, can check authorship
  without permission

One boundary statement governs everything below:

> **Identity does not create trust. Identity enables verification.**

An identity carries no rank, no score, no authority. It makes claims
attributable — nothing more.

---

## SECTION 2 — Cryptographic Principles

### No Central Authority

MOOD identity must not depend on:

- a company server
- a central database
- a permission authority

There is no certificate authority, no key escrow, no account provider.
A node's identity exists because its key pair exists — and is accepted
because the mathematics verifies.

### Private Ownership

The node controls its private key. Generation, storage, and use happen
node-locally. No protocol operation ever requires transmitting a
private key or delegating its custody.

### Public Verification

Any node can verify signatures. Verification inputs — public key,
object, signature — are all public data. No verification path requires
asking the issuing node, a coordinator, or a registry.

### Backward Compatibility

Alpha 002 extends Alpha 001. Every existing object stays valid; every
existing verification path stays correct. The frozen surface — the v0.1
envelope, the ID derivation, the hash engine, the recomputation model —
is untouched.

---

## SECTION 3 — Key Pair Model

```text
Node
  |
  |  generates and holds
  v
Private Key
  |
  |  corresponds to
  v
Public Key
  |
  |  hashed and bound
  v
Node Identifier
```

**Private Key**

- local only — generated on the node, stored on the node
- never transmitted — no protocol message carries it
- never stored in objects — any object containing private key material
  is rejected

**Public Key**

- shareable — public by design
- used for verification — every signature check reads it
- publishable in an identity object, referenced by other objects

**Node ID**

- derived from public identity — the identifier is a commitment to the
  public key, not a chosen name (see SECTION 5)

This is a design model. **Do not implement.**

---

## SECTION 4 — Algorithm Evaluation

Candidate algorithms:

| Algorithm | Security | Performance | Ecosystem | Future compatibility |
|---|---|---|---|---|
| Ed25519 | 128-bit; Schnorr over Curve25519; deterministic signatures — no nonce-reuse failure class | fastest of the three in sign and verify; 32-byte keys, 64-byte signatures | excellent — TLS 1.3, SSH, libsodium, Node `crypto`, every major language | mature and stable; aggregation/multi-sig needs separate schemes (FROST); not quantum-resistant |
| secp256k1 | 128-bit; ECDSA over the Bitcoin curve; nonce reuse is catastrophic unless deterministic (RFC 6979) | good; verification slightly slower than Ed25519; ~64–72-byte signatures | the largest deployed base — Bitcoin, Ethereum, EVM tooling; recoverable signatures enable address-from-signature flows | battle-tested at global scale; not quantum-resistant |
| BLS | 128-bit on BLS12-381; pairing-based assumptions — newer and less battle-tested than curve-based schemes | slower individual verify, but signature aggregation turns N signatures into one — the advantage scales with the network | growing — Ethereum consensus validators, DVT, threshold tooling | strongest aggregation and threshold story — attractive for future multi-party verification; most complex math and library surface; not quantum-resistant |

Analysis:

- **Ed25519** is the safe default: fast, small, deterministic, and
  everywhere. For single-node object signing it fits naturally.
- **secp256k1** carries the Bitcoin/Ethereum lineage — the natural
  choice if MOOD ever wants EVM interoperability or recoverable
  signatures, at the cost of ECDSA's nonce discipline.
- **BLS** is the long-game candidate: aggregation matters when
  *networks of nodes* verify objects together — but that is Alpha 003+
  territory, and its assumptions are the youngest.

No final decision is made here.

**Output: Recommendation Pending.**

The algorithm is selected by the [Alpha 002-A
roadmap](../history/alpha-002-a-roadmap.md), step 1 (Algorithm Review),
after implementation-level benchmarks and library review.

---

## SECTION 5 — Identity Identifier Design

Derivation:

```text
Public Key
  |
  |  hash
  v
Node ID
```

The Node ID is *derived from* the public key, never chosen — so a node
cannot claim an identifier it does not hold keys for.

Open design questions:

- **identifier length** — full digest vs truncation. Alpha 001 objects
  truncate SHA-256 to 24 hex characters (96 bits); a consistent Node ID
  length keeps the system uniform, a full-length ID removes the
  birthday-bound question entirely
- **collision resistance** — at 96 bits the birthday bound is 2^48;
  harmless at alpha scale, to be re-examined with network scale
- **human readability** — a hash is not human-readable by design;
  display-layer conventions (truncation, checksums) are a UI concern,
  never an identifier concern
- **versioning** — the identifier must survive algorithm evolution; an
  ID that embeds algorithm assumptions breaks when the algorithm
  changes (see rotation, SECTION 10)

Example shape (do not fix the implementation):

```text
node:mood:xxxx
```

Note: Alpha 001's envelope already carries `issuer.nodeId` in the
`mood:node:<hex>` convention. Reconciling the final format with the
deployed convention is a step-2 (Identity Format) decision, not made
here.

---

## SECTION 6 — Object Signature Model

Alpha 001:

```text
Object
  |
  |  canonical serialization
  v
Hash
```

Alpha 002:

```text
Object
  |
  |  canonical serialization
  v
Object Hash
  |
  |  private key signature
  v
Signed Object
```

The signing pipeline:

```text
Object
  |
Hash
  |
Signature
  |
Verification
```

One rule is absolute:

> **Sign the object content. Never sign a database record.**

The signature commits to the canonical bytes — the same bytes any node
recomputes. A signature over a storage-row representation would bind
authorship to one node's private database state, which no other node
can reproduce. Content-signed, content-addressed: the signature and the
ID verify against the identical commitment.

Per the accepted [identity-layer
specification](./identity-layer.md), the signing target is the **full
256-bit content digest** — not the 24-hex object ID, which is a
96-bit addressing handle.

---

## SECTION 7 — Signed Object Extension Model

Logical view:

```text
Alpha 001 Object          Alpha 002 Signed Object

{                          {
  id,                        id,
  type,                      type,
  payload                    payload,
                             issuer,
                             signature
                           }
```

The physical constraint (from the accepted identity-layer spec): the
v0.1 envelope is frozen — six keys, closed schema, ID derived from
content. A signature inside the ID-derived content would be circular
(the ID would change with every signature). Therefore:

- **object** — the frozen v0.1 envelope, byte-identical, `issuer` and
  all
- **signature** — an attached structure alongside the object: signature
  value, algorithm, and a reference to the signer's public identity

The stored and transported unit becomes `{object, signature}` — which
reads, from the consumer's perspective, as the logical shape above:
identity-declared object plus authorship proof.

Principle:

> **Signature extends object. Signature does not replace object.**

An unsigned object is not invalid — it is historically authentic.
Alpha 001 objects stay exactly as they are.

---

## SECTION 8 — Signature Verification Flow

```text
Node receives object
  |
  v
Read issuer public key
  |
  v
Calculate object hash
  |
  v
Verify signature
  |
  v
Accept / Reject
```

Confirmed properties:

- **any node can verify** — the inputs (object, signature, public key)
  are all public; verification is pure computation
- **no issuer contact required** — the receiving node never asks the
  issuing node anything; there is no callback, no permission check, no
  online authority
- **verification is deterministic** — the same three inputs yield the
  same verdict on every node in the network

---

## SECTION 9 — Security Threat Model

### Fake Identity

Attack: create a fake issuer — claim another node's `nodeId`, or invent
an authoritative-sounding one.

Defense: **signature verification**. A forged issuer cannot produce a
valid signature under the real node's public key. The claim fails
mathematics, not policy.

### Object Modification

Attack: modify the payload — inflate a contribution, swap a proof
reference.

Defense: **hash mismatch**. The recomputed object hash no longer
matches the ID (Alpha 001 integrity), and the signature over the
original digest no longer verifies (Alpha 002 authorship). Tampering
breaks both layers at once.

### Private Key Leakage

Attack: steal the node's private key — then sign as the victim.

Defense: **node-local storage**. The key never enters a protocol
object, message, or log; the attack surface is the node host itself.
Leakage response — rotation and revocation — is designed in
SECTION 10; the full answer (including compromise dating via
timestamps) is roadmap research.

### Replay Attack

Attack: re-submit a valid old signed object as if it were new.

Defense: **timestamp / nonce / version**. Signed content carries
temporal and uniqueness commitments; identical replays are detectable
and rejectable. The exact mechanism is a step-4 (Verification Rules)
decision.

---

## SECTION 10 — Key Lifecycle Design

```text
Create → Activate → Use → Rotate → Recover → Revoke
```

Each phase with its future research direction (none implemented):

- **Create** — local key-pair generation. Research: entropy sources on
  varied node hardware; key encoding standards; validation of generated
  keys before first use.
- **Activate** — bind Node ID to public key and announce the identity.
  Research: the identity object as activation record; how the network
  first learns a `nodeId ↔ publicKey` binding without a registry.
- **Use** — routine signing. Research: operational security of the
  signing path; rate and context of signatures; audit trails that never
  leak key material.
- **Rotate** — replace the key pair while preserving the identity.
  Research: new key signed by the old key (a handover chain); the core
  tension — if Node ID = hash(public key), rotation changes the ID,
  so either IDs rotate (history rewires) or an indirection layer
  (stable ID → key history) is introduced. This is the hardest open
  problem in the lifecycle.
- **Recover** — regain identity after key loss. Research: whether
  recovery exists at all — self-sovereignty argues "no recovery,
  new identity"; social and threshold recovery argue otherwise. The
  trade-off is explicit: recoverability vs uncontrollability.
- **Revoke** — invalidate a key before or after compromise. Research:
  revocation as a signed object; revocation propagation without a
  central registry (a natural Alpha 003 synchronization problem);
  revocation vs forgery dating.

---

## SECTION 11 — Identity and Reputation Separation

> **Identity ≠ Reputation**

The relationship is one-directional and passes through contribution:

```text
Identity
  |
  |  enables attribution
  v
Contribution
  |
  |  recorded as
  v
Proof
  |
  |  accumulates into
  v
Reputation
```

An identity verifies *who acted*. Reputation measures *what the actions
were worth*. The two must never collapse into each other:

- identity age, key strength, or stake confer zero reputation
- reputation can never buy verification power — a low-reputation node's
  valid signature verifies exactly as well as a high-reputation node's

This separation exists to **avoid identity power solidification**
(身份权力固化): an identity class that accumulates unearned authority
becomes a gatekeeper — the structure MOOD exists to replace
([node.md](./node.md): *"being named as a node does not by itself
prove identity, capability, availability, contribution, reputation, or
authority"*).

---

## SECTION 12 — Alpha 002-A Boundary

**Completed (this document):**

- cryptographic model — key pair, identifier, signature architecture
- algorithm evaluation — Ed25519 / secp256k1 / BLS, decision pending
- signature architecture — content signing, attachment model,
  verification flow
- security analysis — threat model with defenses, key lifecycle design

**Not Implemented:**

- key generation
- signature library
- wallet
- identity runtime
- node authentication

Nothing in this document exists as code. Implementation begins in
Alpha 002-B, only after the [Alpha 002-A
roadmap](../history/alpha-002-a-roadmap.md) review steps complete.

---

*Predecessor: [`docs/protocol/identity-layer.md`](./identity-layer.md) ·
Decision records: [ADR-001](../decisions/ADR-001-alpha001-freeze.md),
[ADR-002](../decisions/ADR-002-identity-layer.md),
[ADR-003](../decisions/ADR-003-cryptographic-identity-design.md) ·
Roadmap: [`docs/history/alpha-002-a-roadmap.md`](../history/alpha-002-a-roadmap.md)*
