# Alpha 002-B Implementation Plan

**Date:** 2026-09-04
**Task:** MOOD Protocol Alpha 002-B — Cryptographic Identity Implementation
**Role:** MOOD Protocol Core Engineer
**Predecessors:** Alpha 001 FROZEN (ADR-001) · Alpha 002 Identity Specification ACCEPTED (`b49c56c`, WorkBuddy 15/15) · Alpha 002-A Cryptographic Design ACCEPTED (`c66b87e`, WorkBuddy 18/18 — "Implementation may begin after design acceptance.")

---

## Constraint Confirmation

Understood and binding for this task:

- **Forbidden to modify:** Alpha 001 object schema, object hash algorithm, contribution proof logic — i.e. no edits inside `packages/protocol-object/` or `packages/contribution-proof/`.
- **Allowed to modify:** `packages/identity/` (new), `apps/mood-cli/`, `services/node-api/`, `docs/`.
- If any forbidden path is touched: stop and report.

---

## Current Architecture (audit findings)

### What already exists — a live Ed25519 identity system

The repository is not greenfield. An application-layer node identity already
runs in production paths:

| Layer | Location | What it does |
|---|---|---|
| Key engine | `packages/node-runtime/src/identity/` | tweetnacl Ed25519 keypairs; `nodeId = mood:node:<64hex>` = `sha256('1\|networkId\|publicKey')` |
| Node setup | `apps/mood-cli/src/state.js` `initIdentity()` | `mood init` → writes `~/.mood/identity/node.json` (public) + `~/.mood/identity/private.json` (private, chmod 0600) |
| CLI | `apps/mood-cli/src/commands/identity.js` | `mood identity show` (the only subcommand today) |
| API | `services/node-api/src/routes/identity.js` | `GET /identity` → `{nodeId, publicKey, organization}`; 409 when uninitialized |
| Private-key consumers | `apps/mood-cli/src/commands/invite.js`, `apps/mood-cli/src/daemon.js` | read `private.json` via `readPrivateIdentity()`; the key signs invitations and feeds the sync runtime |

Security invariants already in place: the private key never enters the API
process (`services/node-api/src/state.js` documents it never opens
`private.json`); `private.json` is written mode 0600 where the filesystem
supports it.

This machine already carries a live identity at `~/.mood/identity/`
(`node.json` + `private.json`, legacy format).

### What is missing — the protocol layer

None of the above can answer the Alpha 002 question at the protocol level:

- no package owns **protocol identity** as a reusable, spec-aligned module;
- no function signs a **256-bit canonical object digest** (node-runtime signs
  arbitrary strings for envelopes, not object hashes);
- no two-mode verification (unsigned Alpha 001 objects / signed new objects);
- the accepted specifications (`identity-layer.md`,
  `identity-cryptography.md`) resolve *Recommendation Pending* — no algorithm
  decision is recorded in an ADR.

### Frozen surface (verified clean)

`packages/protocol-object/` and `packages/contribution-proof/` have no
uncommitted content changes. The only pre-existing working-tree code change on
a relevant path is `backend/services/contribution/index.js` (18 lines, outside
every path this task touches — untouched). `apps/mood-cli/bin/mood.js` shows
as modified with zero content diff (line endings only).

---

## Implementation Scope

### New package: `packages/identity` (`@mood/identity`)

The protocol-layer cryptographic identity runtime. It sits **above** the
object layer and **beside** (not inside) node-runtime.

```
packages/identity/
  src/
    identity.js      createIdentity (adopt-or-generate), loadPublicIdentity,
                     exportPublicIdentity → {nodeId, publicKey, algorithm, createdAt}
    key-manager.js   key generation, local storage abstraction,
                     identityPaths(env) (~/.mood/identity/{public.json, private.json})
    signer.js        signObjectHash(objectHash, privateKey) → signature
    verifier.js      verifyObjectSignature(objectHash, signature, publicKey) → boolean
    serializer.js    canonical identity serialization, format validation,
                     object-hash normalization ('sha256:<64hex>' | 64-hex)
    index.js         public API surface
    tests/           7 test areas (repo convention: src/tests/, node --test)
  README.md
  package.json       ESM · engines node>=18 · deps: @mood/contribution-proof
                     (hash-engine reuse — no duplicate hashing) ·
                     devDeps: @mood/protocol-object (Alpha 001 compat test only)
```

### Key design decisions (to be recorded in ADR-004)

1. **Algorithm: Ed25519.** Selected over secp256k1 and BLS — full reasoning
   recorded in ADR-004, not hidden.
2. **Implementation: Node native `crypto`** (`generateKeyPairSync('ed25519')`,
   `sign`/`verify` with `null` hash). Zero new cryptographic dependencies.
   RFC 8032 deterministic — signatures are byte-identical to any conformant
   Ed25519 library, so the existing tweetnacl-based node-runtime can verify
   protocol signatures and vice versa (proven by test).
3. **Key encoding — deployed-format compatible.** `publicKey` = base64 raw
   32-byte key; stored `privateKey` = base64 64-byte `seed‖publicKey`
   (tweetnacl shape). The new `private.json` keeps the exact field shape the
   existing CLI writes, so `invite.js` / `daemon.js` keep working unmodified.
4. **Node ID — reconciliation, not reinvention.** `nodeId =
   mood:node:<64hex> = sha256('1|' + networkId + '|' + publicKey)`, computed
   with the shared hash engine from `@mood/contribution-proof`. A node that
   already ran `mood init` gets the **same** nodeId in its protocol identity.
   This resolves identity-cryptography.md's open question 2 (deployed
   `mood:node:<hex>` vs spec example) in favor of the deployed format.
5. **Adoption rule — one node, one key.** `createIdentity()`:
   - `public.json` already exists → refuse (no silent rekey);
   - legacy `private.json` exists (from `mood init`) → **adopt that keypair**,
     write only `public.json` — identity continuity, nothing destroyed;
   - nothing exists → generate fresh, write both files.
6. **Signature target — the 256-bit content digest.**
   `signObjectHash` accepts only `'sha256:<64hex>'` or a bare 64-hex digest,
   and signs the 32 digest bytes. It refuses anything else — an arbitrary
   string or a database record cannot be signed by this API. Never the
   truncated 24-hex object ID.
7. **`public.json`** (propagatable): `{nodeId, publicKey, algorithm,
   networkId, createdAt, identityVersion: 'alpha-002'}`.
   `exportPublicIdentity()` returns the strict four-field projection
   `{nodeId, publicKey, algorithm, createdAt}`.

### Files to change

| Path | Change |
|---|---|
| `packages/identity/**` | new package (above) |
| `apps/mood-cli/src/commands/identity.js` | add `mood identity create` (prints public identity only); `show` prefers `public.json`, falls back to `node.json` |
| `apps/mood-cli/src/state.js` | `initIdentity` writes `public.json` too (protocol activation of the same key); adopts an existing key when `private.json` exists without `node.json` — closes the clobber path `identity create → init` |
| `apps/mood-cli/package.json` | dep `@mood/identity` |
| `services/node-api/src/routes/identity.js` | `GET /identity` serves the protocol public identity (fallback to legacy shape), never the private key |
| `services/node-api/package.json` | dep `@mood/identity` |
| `docs/protocol/identity-runtime.md` | new — implementation architecture, key storage, signing flow, verification flow, security boundary |
| `docs/decisions/ADR-004-identity-algorithm-selection.md` | new |
| `docs/README.md` | timeline: Alpha 002-B implemented |
| root `package-lock.json` + `node_modules/@mood/identity` | mechanical workspace registration via `npm install` (root `package.json` workspaces glob already covers `packages/*`; the lockfile entry is unavoidable when adding a workspace — flagged here and in the final audit) |

Explicitly **not** changed: `packages/protocol-object/`,
`packages/contribution-proof/`, `packages/node-runtime/` (not in the allowed
list — integration happens only through `apps/mood-cli` and
`services/node-api`), `backend/**`.

### Alpha 001 compatibility

- Old objects stay valid with no signature requirement — unsigned-mode
  verification is unchanged code; proven by the existing protocol-object test
  suite staying green plus a cross-package test that builds a v0.1 object,
  validates it, signs its digest, and asserts the object itself is
  byte-identical before/after (signature attaches outside, per the accepted
  extended-object design).

---

## Security Considerations

1. **Private key locality.** The private key exists only in
   `~/.mood/identity/private.json` (0600 where supported). It is never
   returned by `createIdentity`, never printed by the CLI, never present in
   any API response, never written into a protocol object, never logged.
2. **Public/private separation proven by test**, not by intention: a leakage
   scan asserts no private-key bytes appear in `public.json`, in
   `exportPublicIdentity()` output, in signature output, or in CLI/API
   outputs.
3. **Signing surface is narrow.** `signObjectHash` accepts a 256-bit digest
   only — the API cannot be repurposed to sign arbitrary documents or
   database records.
4. **No rekey, ever, by accident.** Adoption rule + refusal when
   `public.json` exists + the `init` clobber fix in `state.js`.
5. **Hash engine stays singular.** All SHA-256 computation imports
   `@mood/contribution-proof` — no second hashing implementation enters the
   protocol.
6. **Repo-wide secret scan** (PART 9): PRIVATE KEY / SEED / MNEMONIC / API
   KEY / PASSWORD patterns across `packages/`, objects, logs, identity
   package — private material must appear only inside local identity storage.

---

## Execution Order

PART 2 structure → PART 3 ADR-004 → PART 4–6 package implementation →
PART 7–9 compatibility + tests + security audit → PART 10–11 CLI/API →
PART 12 docs → PART 13 full test run → PART 14 diff audit → PART 15 commit
`feat(identity): implement alpha 002 cryptographic identity runtime` →
PART 16 final report.

> Do not modify the foundation. Add identity above the object layer.
> Alpha 001 remains history. Alpha 002 adds trust.
