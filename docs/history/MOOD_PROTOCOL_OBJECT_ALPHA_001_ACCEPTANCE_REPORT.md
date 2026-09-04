# MOOD Protocol Object Alpha 001 Acceptance Report

**Acceptance date:** 2026-09-03
**Acceptance agent:** WorkBuddy (independent acceptance agent)
**Mode:** Audit + Test + Report only — no code changes, no fixes, no new features, no schema changes.
**Acceptance target:** commit `16d2da9` — `docs(protocol): finalize protocol object alpha 001 milestone`, branch `codex/mood-node-alpha-001`.

---

## Result

**PASS.**

All 13 acceptance parts passed. Every claim below was reproduced by
independent execution in a fresh, isolated `MOOD_HOME` sandbox — the
real `~/.mood` was verified untouched (md5 baseline diff: 0 files
altered).

---

## Core Question

> Does MOOD have a first-class protocol object?

**Answer: YES.**

MOOD now has a content-addressed, immutable, self-verifiable protocol
object that any node can store, inspect, and verify **without trusting
the issuer**. Verification is recomputation, not trust.

```text
Contribution → Proof → Protocol Object → Node Storage → Verification → API
   ✅            ✅         ✅                ✅             ✅            ✅
```

This is the same shape as Git (`file → commit object → repository`) and
Bitcoin (`transaction → block object → chain`): the contribution stopped
being application-level data and became a network-verifiable object.

---

## Environment (Part 1)

| Item | Value |
|---|---|
| OS | Windows (win32) |
| Node.js | v22.22.2 |
| npm | 10.9.7 |
| git commit | `16d2da9e78318300476beeb221b894eaf529094e` |
| branch | `codex/mood-node-alpha-001` |
| `@mood/contribution-proof` | 0.1.0-alpha.1 |
| `@mood/protocol-object` | 0.1.0-alpha.1 |
| `@mood/cli` | 0.2.0-alpha.2 |
| `@mood/node-api` | 0.1.0-alpha.1 |

Working tree had uncommitted changes unrelated to the object layer
(`apps/web/*`, `backend/*`, CI workflows, `docs/*`, plus untracked
`tmp/`, `docs/world/`, audit scripts). The `packages/protocol-object`
package itself was committed clean at `986594f` + `16d2da9`.

---

## Evidence

### 1. Repository integrity (Part 2) — PASS

`packages/protocol-object` contains all four required logics:
`schema.js` (envelope + payload schemas), `serializer.js` (ID engine),
`validator.js` (validation), `storage.js` (node-local store), plus
`object.js` (creation), `linkage.js`, `sync.js`.

`packages/contribution-proof` contains proof generation (`proof.js` →
`createProof`) and verification (`validator.js` → `validateProof`,
`validateProofShape`).

**No duplicate hash logic:** the object layer's only hashing is
`serializer.js` importing `canonicalize` / `sha256OfValue` from
`@mood/contribution-proof`. Zero `createHash` / `node:crypto` in the
object package. One-way dependency, duplication-free.

### 2. Lifecycle (Part 3) — PASS

Full chain executed fresh (isolated `MOOD_HOME`):

```text
mood init                    → node mood:node:a4f46f02… (created)
mood start                   → Status: Running, PID 472
mood contribution create     → event:mood:5118a11d…, proof sha256:ddafe1a4…
mood object create --type contribution
                             → object:mood:0eaa5ab6… (created, Verified: true)
mood object verify           → 1/1 verified, linkage cross-checked (exit 0)
```

### 3. Schema validation (Part 4) — PASS

The stored object has exactly six envelope keys and a closed payload:

```text
envelope keys: ["createdAt","id","issuer","payload","type","version"]  (6)
issuer keys:   ["nodeId"]
payload keys:  ["algorithm","eventHash","eventId","proofId"]           (4)
secret-shaped strings: NONE
```

No `private key`, `seed`, `password`, or `api key` anywhere in the object.

### 4. Content address verification (Part 5) — PASS

```text
stored id     == recomputed id   : true
change createdAt → id changes    : true
change payload   → id changes    : true
change issuer    → id changes    : true
```

The correct rule is **same complete content → same ID** (including
`createdAt`, which is part of the preimage). Same payload minted at two
different moments is correctly *two different objects*.

### 5. Tamper resistance (Part 6) — PASS

Edited `payload.eventHash` on disk, then re-verified:

```text
1. FAIL  object:mood:0eaa5ab6…
   · object id mismatch: records …0eaa5ab6…, recomputed …322a3711…
   · payload.eventHash mismatch: …0000… vs stored …ddafe1a4…
Summary: 0/1 verified — 1 FAILED   (exit code 1)
```

Restored the file → `1/1 verified` (exit 0). The error contains the
required `object id mismatch` **and** a linkage contradiction.

### 6. Persistence (Part 7) — PASS

`mood stop` → `mood start` → `mood object list`:

```text
objects after restart: 1 | verified: [ true ]
```

Objects survive node and CLI restart; verification status is preserved.

### 7. API (Part 8) — PASS

| Endpoint | Observed |
|---|---|
| `GET /objects` | `{"objects":[{"id":"object:mood:0eaa5ab6…","type":"contribution","verified":true}]}` |
| `GET /objects/:id` | full object + `verified:true` |
| `POST /objects/verify` (valid) | `200 {"verified":true}` |
| `POST /objects/verify` (tampered) | `200 {"verified":false,"errors":[…]}` — an honest result, **not** an API error |

### 8. External verification (Part 9) — PASS

A second, fresh node B (different `nodeId`, **zero** local
contribution/proof records) received a copy of the foreign object and
verified it:

```text
1. PASS  object:mood:0eaa5ab6…
   · no ContributionProof stored on this node for event:mood:5118a11d…
     — linkage not checked (the object still verifies on its own)
Summary: 1/1 verified   (exit 0)
```

Any node verifies a foreign object by content alone; a missing local
reference is a *note*, never a failure.

### 9. Security audit (Part 10) — PASS

Scanned `objects/`, `contributions/`, `logs/` for `PRIVATE KEY`,
`MNEMONIC`, `SEED`, `PASSWORD`, `BEARER TOKEN`, `API KEY`:

```text
0 matches — CLEAN
node private key confined to identity/private.json (never leaks)
```

### 10. Documentation audit (Part 11) — PASS

`docs/protocol/protocol-object.md` exists and states both layers
without confusion:

- ContributionProof → *Why did this contribution happen — and is the record unmodified?*
- ProtocolObject → *How does the network store and verify it?*

### 11. Future boundary check (Part 12) — PASS

No scope creep. Explicitly **NOT IMPLEMENTED**, each with a placeholder
README and no code:

```text
packages/protocol-object/src/signature/README.md   NOT IMPLEMENTED — Alpha 002
packages/protocol-object/src/registry/README.md    NOT IMPLEMENTED — Alpha 002
packages/protocol-object/src/genesis/README.md     NOT IMPLEMENTED — Alpha 002
sync.js: SYNC_TRANSPORT = 'not-implemented-in-alpha-001'  (no P2P, no relay, no gossip)
```

No P2P, object propagation, issuer signature, or governance state
transition exists in the object layer.

### 12. Independent test-suite confirmation

Re-ran every suite myself (not trusting the developer's claim):

| Suite | Result |
|---|---|
| `packages/protocol-object` (18 main + 4 regression lock) | **22/22** |
| `packages/contribution-proof` (regression) | **23/23** |
| `apps/mood-cli` | **20/20** |
| `services/node-api` | **11/11** |

**76/76 green.** The regression lock pins the four Alpha 001 invariants
(hash determinism, tamper detection, closed schema, external
verification) so a future alpha that breaks them is an alarm, not a bug.

---

## Limitations

These are honest boundaries, not failures. Carried into later alphas:

- **Signature (Alpha 002).** `issuer.nodeId` is *declared*, not *signed*.
  Content addressing proves *what* an object says; it does not yet prove
  *who* minted it.
- **Registry (Alpha 002).** Types/versions/schemas live as constants in
  `src/schema.js` — correct for exactly one type. A registry is needed
  before a second type or version exists.
- **Synchronization (Alpha 003).** `ObjectSyncAdapter.syncObject()` is an
  honest refusal (`not-implemented-in-alpha-001`); no transport exists.
  `verifyRemoteObject()` is concrete, because verification needs no
  transport.
- **Genesis object (Alpha 002).** No genesis object exists; the node
  runtime's existing genesis history is untouched.
- **24-hex ID (96 bits).** Collision-safe at alpha scale; revisit with the
  network design.

---

## Final Decision

# MOOD Protocol Object Alpha 001 — ACCEPTED

> **"MOOD has transitioned from application data to network-verifiable
> protocol objects."**
