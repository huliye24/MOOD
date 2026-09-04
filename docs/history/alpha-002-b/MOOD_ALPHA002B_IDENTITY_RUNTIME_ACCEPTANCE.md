# MOOD Protocol Alpha 002-B Identity Runtime Acceptance Report

**Acceptance date:** 2026-09-04
**Acceptance agent:** WorkBuddy (independent acceptance agent)
**Mode:** Audit + Verification + Report only — no code changes, no fixes, no new features.
**Acceptance target:** commit `0af6f83` — `feat(identity): implement alpha 002 cryptographic identity runtime`, branch `codex/mood-node-alpha-001`.

---

## Result

**PASS** — the identity runtime is correct and complete. One pre-existing,
identity-unrelated test failure is flagged in Finding 1 (not a blocker for
identity acceptance, but a repo-health item to track separately).

---

## Core Question

> Can a MOOD node create identity and prove authorship securely?

**Answer: YES.**

A node can create (or adopt) its own Ed25519 identity, keep the private key
node-local, export only the public side, and sign / verify object hashes —
all without modifying the frozen Alpha 001 object or proof layers.

---

## Verified

- [x] Identity generation — `mood identity create` → nodeId / publicKey / algorithm / createdAt
- [x] Key separation — private.json node-local (0600, "KEEP LOCAL"); public.json propagatable
- [x] Public identity export — `show` / `GET /identity` never expose private material
- [x] Signature creation — `signObjectHash` signs a 256-bit digest, rejects non-digest
- [x] Signature verification — `verifyObjectSignature` predicate, deterministic
- [x] Tamper detection — hash / signature / key mutation all rejected
- [x] Alpha 001 compatibility — old objects stay valid; signature attaches outside the envelope
- [x] Security isolation — leakage scan clean; private key exists only in private.json

---

## Part-by-Part Evidence

| # | Part | Result | Evidence |
|---|---|---|---|
| 1 | Commit | PASS | `0af6f83` `feat(identity): implement alpha 002 cryptographic identity runtime` (HEAD, 12:25) |
| 2 | Package structure | PASS | `packages/identity/src/{identity,key-manager,signer,verifier,serializer,index}.js` + README + tests (note: tests live under `src/tests/`, not top-level `tests/`) |
| 3 | Alpha 001 boundary | PASS | `packages/protocol-object` & `packages/contribution-proof` NOT in the 23-file commit |
| 4 | Identity creation | PASS | live: `create --json` → nodeId/publicKey/algorithm/createdAt, no privateKey |
| 5 | Storage | PASS | `public.json` (6 fields) + `private.json` (node-local, warning) verified on disk |
| 6 | Private-key protection | PASS | leakage scan test passes; key only in `identity/private.json` |
| 7 | Public export | PASS | live: `show --json` → public fields only, no privateKey |
| 8 | Algorithm | PASS | ADR-004 = Ed25519 (Node native crypto); impl uses `generateKeyPairSync('ed25519')` |
| 9 | Signature creation | PASS | test "signs a 256-bit digest…refuses anything that is not a digest" |
| 10 | Signature verification | PASS | test "genuine signature verifies with the public key alone" |
| 11 | Tamper detection | PASS | tests "tampered hash/signature rejection" |
| 12 | Serialization | PASS | tests "formats: validators reject wrong shapes" + deterministic digest |
| 13 | Alpha 001 compat | PASS | test "Alpha 001 compatibility: objects stay valid, signature attaches outside" |
| 14 | CLI | PASS | live `mood identity create/show` correct + secure |
| 15 | API | PASS | `GET /identity` serves public only; route never opens private.json |
| 16 | Test suite | **PASS w/ finding** | identity 15/15 · node-api 11/11 · CLI 19/20 (see Finding 1) |
| 17 | Security review | PASS | leakage scan: 0 private/seed/mnemonic/password matches |
| 18 | Docs | PASS | `identity-runtime.md` (arch/key/signing/verification/security) + docs/README.md entry |
| 19 | Code scope | PASS | commit touches `packages/identity`, `apps/mood-cli`, `services/node-api`, `docs` only |

**Test totals (Part 16):** identity **15/15** · node-api **11/11** · mood-cli
**19/20**.

---

## Finding 1 — Pre-existing, identity-unrelated test failure

**Item:** `apps/mood-cli` test `lifecycle: start → snapshot verified → stop`
fails reproducibly (`mood snapshot verify --json` exits 1: "No snapshot
available yet").

**Evidence (not an identity regression):**

- The failing test (`tests/cli.test.js`) is **not** in this commit.
- The production path it exercises — `apps/mood-cli/src/daemon.js`, the
  `@mood/node-runtime` `SyncManager`/`SnapshotManager`/`signSnapshot`, and
  `state.js` `readIdentity`/`readPrivateIdentity` — are **all unchanged** by
  this commit. The identity commit only touched `initIdentity`,
  `readLocalPrivateRecord`, and `activateProtocolIdentity`.
- Fresh-init private.json is byte-identical to the pre-commit format (same
  `generateKeypair()` → `secretKey`).
- Manual reproduction: the daemon starts and its log shows the relay
  `connected` event, but never logs `relay connection established` — i.e.
  `SyncManager.connect()` fires `connected` yet its promise never resolves,
  so `maintainSnapshots()` (the line that produces the first epoch snapshot)
  is never reached. That is a daemon/sync-lifecycle defect in unchanged code.

**Reproduction steps:** `mood init` → `mood start` → wait → `mood snapshot
verify --json` returns `{ok:false, "No snapshot available yet"}` even after
6s; `snapshots/` stays empty.

**Impact on this acceptance:** none for identity. The identity runtime is
fully correct; this is a separate node-lifecycle/epoching defect that predates
Alpha 002-B and should be tracked independently (recommend a dedicated issue).

---

## Final Decision

# MOOD Protocol Alpha 002-B Identity Runtime — ACCEPTED

> "Alpha 001 defines what the object is.
> Alpha 002 defines who created it.
> Alpha 002-B makes cryptographic identity executable."

*With one tracked, pre-existing, identity-unrelated test failure (Finding 1)
recorded for separate follow-up.*
