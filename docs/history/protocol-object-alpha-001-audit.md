# Protocol Object Alpha 001 — Repository Audit

**Audit date:** 2026-09-03
**Auditor:** MOOD Protocol engineering maintenance agent
**Scope:** the Protocol Object Alpha 001 phase, closed the same day it opened.

## Repository state at audit time

| Item | Value |
|---|---|
| Branch | `codex/mood-node-alpha-001` |
| Contribution Proof Alpha 001 | commit `1b1b3ff` (2026-09-03 19:14) — `feat(protocol): introduce contribution proof alpha 001` |
| Protocol Object Alpha 001 | commit `986594f` (2026-09-03 20:54) — `feat(protocol): introduce protocol object alpha 001` |

Both alphas are present and verified:

- `packages/contribution-proof` — the evidence layer (events, proofs,
  SHA-256 hashing, canonicalization, credential guard, node-local
  storage under `~/.mood/contributions/`).
- `packages/protocol-object` — the storage layer (content-addressed
  protocol objects, validation, node storage under `~/.mood/objects/`,
  sync adapter interface).

## Package structure

```text
packages/protocol-object/
  package.json                     @mood/protocol-object 0.1.0-alpha.1
  src/
    schema.js                      v0.1 envelope + payload schemas, ID patterns
    object.js                      createProtocolObject — validate, mint, re-validate
    serializer.js                  deriveObjectId, canonicalObject (hash logic
                                   imported from @mood/contribution-proof)
    validator.js                   validateProtocolObject → {valid, errors}
    linkage.js                     verifyObjectLinkage — local proof cross-check
    storage.js                     ~/.mood/objects/ store (MOOD_HOME-aware)
    sync.js                        ObjectSyncAdapter (interface only)
    types/contribution.js          buildContributionPayload
    tests/protocol-object.test.js  18 tests
```

Dependency direction is one-way and duplication-free:
`protocol-object → contribution-proof` (hashing, canonicalization,
`containsSecret`, contribution lookup). The object layer contains zero
hash logic of its own.

Consumers: `apps/mood-cli` (dependency + `object` command),
`services/node-api` (dependency + `/objects` routes).

## CLI commands

```text
mood object create [--type <t>] [--proof <proofId|eventId|eventHash>]
mood object list
mood object verify [object-id]
```

Creation requires a node identity (`mood init`); default type
`contribution`; default proof: the latest stored one. Verification
exits 1 on failure.

## API endpoints

| Route | Returns |
|---|---|
| `GET /objects` | `{objects:[{id,type,verified}]}` — this node's objects |
| `GET /objects/:id` | `{id,type,verified,object}` — 404 when unknown |
| `POST /objects/verify` | `{verified:true}` / `{verified:false,errors}` — accepts ANY node's object |

`POST /objects/verify` verifying a foreign object is the milestone's
key property: network verification minus the transport, because an
object's ID recomputes identically everywhere.

## Acceptance results (2026-09-03, isolated MOOD_HOME)

Full demo chain — `mood start` → `contribution create` → `object
create` → `object list` → `object verify` → `mood stop`:

| Gate | Result |
|---|---|
| Contribution created | PASS — `event:mood:43f4acde92d32433cbf95314` |
| Proof verified | PASS — `Verified: true` |
| Protocol object created | PASS — `object:mood:8e6828832d039845dfee8963` |
| Object verification | PASS — `1/1 verified`, linkage cross-checked |

Test suites, all green:

| Suite | Result |
|---|---|
| `npm run test:object` (protocol-object) | 18/18 |
| `npm run test:cli` (mood-cli, incl. 3 new object tests) | 20/20 |
| `npm run test:api` (node-api, incl. /objects section) | 11/11 |
| `npm run test:contribution` (regression) | 23/23 |

One real defect was found and fixed during the phase: `objectPaths()`
ignored `MOOD_HOME` and resolved against the real user home, leaking
test objects outside sandboxes. Fixed, covered by a regression
assertion, and the polluted directory was removed.

## Known limitations

1. **Synchronization is interface-only.** `ObjectSyncAdapter.syncObject()`
   throws honestly (`not-implemented-in-alpha-001`); no transport
   exists. `verifyRemoteObject()` is concrete because verification
   needs no transport.
2. **The issuer is declared, not signed.** `issuer.nodeId` names the
   minting node; content addressing proves *what* the object says, not
   yet *who* minted it. Issuance signatures are Alpha 002 work.
3. **24-hex ID (96 bits).** Collision-safe at alpha scale; revisit with
   the network design.
4. **One type, one algorithm.** `contribution` only; SHA-256 only.
   New types and algorithms must arrive as explicit schema/version
   upgrades, never as silent replacements.

## Conclusion

Contribution Proof Alpha 001 and Protocol Object Alpha 001 both exist,
are tested, and are documented. The phase is complete; this audit, the
milestone record, and the Alpha Evolution section in
[`docs/protocol/protocol-object.md`](../protocol/protocol-object.md)
close it as a historical node.
