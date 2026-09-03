# Security Review — Protocol Object Alpha 001

**Review date:** 2026-09-03
**Scope:** the data directories the protocol writes (`objects/`,
`contributions/`, `logs/`) and the Alpha 001 source that writes them.
**Question:** does any private key, seed, mnemonic, API key, or
password exist where it must not?

## Method

1. Pattern scan (`private key`, `seed`, `mnemonic`, `api key`,
   `password`, `secret`, `sk-ant-…`, `BEGIN … PRIVATE KEY`) over the
   node home's `objects/`, `contributions/`, and `logs/`, and over the
   Alpha 001 source (`packages/protocol-object`,
   `packages/contribution-proof`, the `mood object` command, the
   `/objects` routes).
2. Leak cross-check: the node's actual private key value was extracted
   from `~/.mood/identity/private.json` and searched for inside every
   log file.
3. Inventory of where secret-shaped data legitimately lives.

## Findings

### `~/.mood/objects/` — CLEAN (empty)

No protocol objects exist on this node. All Alpha 001 testing ran in
ephemeral, isolated `MOOD_HOME` sandboxes that were removed after each
run; one polluted directory created by the `objectPaths()` bug fixed
during the phase was verified to contain only test artifacts and
deleted.

### `~/.mood/contributions/` — CLEAN (empty)

No contribution records exist on this node. Same sandbox discipline.

### `~/.mood/logs/` — CLEAN

`api.log` and `node.log` scanned: **zero** pattern matches. The
private-key leak cross-check **PASS** — the node's private key value
appears nowhere in either log.

### Repository source — CLEAN

Every pattern hit in the Alpha 001 source is one of three legitimate
kinds:

- **the defense itself** — the `containsSecret` detector patterns in
  `packages/contribution-proof/src/schema.js` and the security
  invariant comments beside them
- **negative test vectors** — strings explicitly marked
  `FAKE-KEY-MUST-NEVER-LEAK` / `password=hunter2-login`, used only to
  assert that the guard *rejects* them
- **hash preimage variables** — local `seed` variables in
  `event.js`/`proof.js` naming the deterministic input to SHA-256 ID
  derivation; they contain no key material

No `.env`, `.pem`, or `.key` files exist in either protocol package.

### Where secret-shaped data legitimately lives

| Location | Content | In protocol data? |
|---|---|---|
| `~/.mood/identity/private.json` | the node's ed25519 private key — by design, never referenced by objects, contributions, or logs | No |
| `~/.mood/identity/node.json` | public identity only (`nodeId`, `publicKey`, algorithm, versions) — no private field | No |
| `~/.mood/api-state.json` | `status`, `pid`, `port`, `bind`, `stoppedAt` — no key material | No |

## Defense in depth (unchanged from the phase report)

- The credential guard (`containsSecret`) runs at object **creation**,
  at **verification**, and at **API serving** — a planted secret makes
  an object invalid, and the API refuses to echo it.
- Objects are schema-bound: exact envelope and payload key sets,
  pattern-checked fields, recomputed ID — nothing can ride along
  inside one.
- Invalid objects never touch disk; storage validates first.
- The payload references a proof by ID and hash; it never copies event
  content, actor details, or anything a contributor might consider
  private.

## Conclusion

**PASS.** No private key, seed, mnemonic, API key, or password exists
in `objects/`, `contributions/`, or `logs/`, and the Alpha 001 source
introduces none. Private material is confined to `~/.mood/identity/`,
which is the documented, intended location.
