# Codebase Technical Audit — ALPHA 002 Era

- **Date:** 2026-09-03
- **Scope:** Repository-wide (git-tracked sources only)
- **Trigger:** Maintainer challenge — "Is MOOD's technical accumulation thin?
  Is there real engineering underneath, or mostly surface?" The audit was
  commissioned as an honest self-assessment, not a defense.
- **Method:** Inventory via `git ls-files` (node_modules, dist, archives and
  other untracked artifacts excluded); source-level reading of core modules
  (identity, fingerprinting, duplicate-guard, proof-engine, reputation-engine,
  relay); live test execution with `node --test`.
- **Status:** Findings recorded. Remediation (B-layer) proposed, not yet acted on.

> This entry follows the ALPHA 002 acceptance run (commit `09c7095`,
> `@mood/cli@0.2.0-alpha.2`) and the archive of
> [`docs/node/acceptance/`](../node/acceptance/). It is process memory and
> carries no canonical authority.

---

## 1. Inventory (what the numbers say)

Git-tracked totals: **808 files** = 339 Markdown + 264 code files
(ts/tsx/js) + 97 JSON + assets/scripts.

- Non-empty code lines: **41,182** (ts/tsx/js)
- Markdown lines: **37,056** — documentation is roughly co-equal with code

Code distribution is the first signal:

| Area | Non-empty lines | Share |
| --- | --- | --- |
| `apps/web` (Next.js site, API routes, admin UI, Foundry scaffold) | 22,177 | 54% |
| `protocol/` + engines + `services/` + `packages/` + `backend/` | 19,005 | 46% |

Directory counts (git-tracked): `apps/` 301 (web 276, mood-cli 20,
mood-desktop 5), `docs/` 222, `protocol/` 115, `services/` 17, `packages/` 11,
`proof-engine/` 11, `reputation-engine/` 12, `genesis/` 13, `backend/` 9,
`contracts/` **0**, `e2e/` 6.

Structural gaps visible from the top:

- `contracts/` contains **no tracked files**. The architecture tree
  (`contracts/registry`, `contracts/reputation`) exists on paper only.
- The only business Solidity contract in the repo is
  `apps/web/contracts/protocol/MoodGenesisDistributor.sol`; the other 8 `.sol`
  files are Foundry scaffolding (`Counter.sol` etc.).
- Live test runs (green): `apps/mood-cli/tests/cli.test.js` **12/12**,
  `packages/node-runtime/src/tests/node-runtime.test.js` **8/8**,
  `protocol/contribution/tests/suite.test.js` **1/1**.

## 2. Tier A — Real implementations (cryptography correct, runnable, tested)

The genuinely sound core is small but real:

- **`packages/node-runtime/src/identity/index.js`** — tweetnacl **Ed25519**
  signing/verification (`sign`/`verify`), deterministic node IDs
  (`mood:node:<sha256>`), signed envelopes with canonical payload, and
  zero-fill-before-delete key erasure. The cleanest crypto in the repo.
- **`protocol/contribution/src/fingerprint.js`** — true Node `crypto` SHA-256,
  canonical normalization, recursive key sorting, format validation
  `^sha256:[0-9a-f]{64}$`.
- **`protocol/contribution/src/duplicate-guard.js`** — three-way index
  (by-id, by contributor+category, by fingerprint) for O(1) duplicate checks;
  T1 exact-duplicate rejection vs. T2 cross-contributor flag-for-review;
  serializable. Engineering quality noticeably above its neighborhood.
- **`services/relay/src/relay.js`** — typed WebSocket message protocol with an
  explicit security boundary header (does not hold keys, does not sign, does
  not judge validity).
- **`apps/mood-cli`** — zero-dependency, sub-second startup, JSON envelope
  mode, honest degradation (local mode when relay unreachable).

**Lesson:** the assets are these five modules — not the directory names.

## 3. Tier B — Simulation dressed as engine (the source of the "thin" feeling)

Three modules carry engine-grade names but contain placeholder behavior. In a
protocol whose entire thesis is *verification*, this is the most damaging
layer.

- **`proof-engine/verifier/github-verifier.ts`** — header comment says
  "Verifies GitHub commit contributions"; implementation is two mock entries
  plus `"For v0.1, we simulate verification"`. Any commit id matching
  `/^[a-f0-9]{40}$/i` **or even `/^[a-f0-9]{7,}$/i`** returns
  `verified: true`. There is no GitHub API call.
- **`proof-engine/verifier/github-verifier.ts::generateEvidenceHash`** and
  **`proof-engine/generator/proof-generator.ts::generateEvidenceHash`** —
  comment claims "Generate SHA256-like hash"; implementation is a 32-bit
  integer rolling hash (`hash = (hash << 5) - hash + char`) padded to 64 hex
  chars. **Not SHA-256.** Collision-prone, cryptographically meaningless,
  purely decorative.
- **`proof-engine/generator/proof-generator.ts`** — proofs stored in an
  in-memory `Map` (no persistence); IDs from `Date.now()` + `Math.random()`.
- **`packages/node-runtime/src/identity/index.js::exportEncryptedBackup`** —
  private-key backup "encrypted" with **XOR against a SHA-256 key stream**.
  The code comment itself concedes: "Simple XOR encryption for alpha — should
  use proper encryption in production". A private key encrypted with a
  homemade scheme is worse than none.
- **`reputation-engine/scoring/`** — static lookup multiplication
  (`type_weight × proof_quality × IMPACT_FACTOR`, where the impact factor is a
  constant 1.0). No Sybil resistance, no time decay, no diversity modeling.
  Acceptable as a v0.1 config table; overstated as an "engine".

## 4. Tier C — Engineering hygiene cracks

- **CJS/ESM mixing in TypeScript:** `github-verifier.ts` ends with
  `module.exports = new GitHubVerifier()` (CommonJS) while its caller
  `proof-generator.ts` uses `import githubVerifier from ...` (ESM). A build
  hazard the test harness currently masks.
- **Test harness not assembled:** `proof-engine/tests/package.json` and
  `reputation-engine/tests/package.json` declare jest/ts-jest as isolated
  dependencies that are not installed in the main environment — their suites
  could not be executed during this audit.
- **Empty architecture directories** (`contracts/`) and Foundry scaffold
  files inflate the perceived surface of the repo relative to tracked
  business code.

## 5. Judgment

Measured with the ruler of "network/protocol product," the maintainer's
concern is **valid**: the codebase is 54% website, the flagship engines
contain simulated verification and decorative hashing, and the perceived
depth (directory architecture) exceeds actual depth. This is exactly the
mechanism that produces the "looks thin" impression.

Measured with MOOD's own Phase Zero ruler
(WORLD → CANON → CULTURE → PROTOCOL → SOFTWARE; "Software is replaceable…
code should be treated as secondary and provisional"), the ratio of 37k
documentation lines to 41k code lines is **consistent with the phase**: the
concept layer (contribution state machine, schemas, fixtures) is genuinely
more mature than the engine layer, and that is by design.

Both statements are true at once. The codebase is not failing Phase Zero —
but the simulation layer should not be allowed to keep wearing the uniform
of production code.

## 6. Recommended remediation (priority order — not yet executed)

1. **Tier B stop-the-bleed:** for `proof-engine`, either implement real
   verification (GitHub API client, real crypto) or mark every simulated path
   explicitly `SIMULATED` in code, schemas, and README. A fake verifier that
   presents as real is more dangerous than an honest stub.
2. **Replace the XOR backup** with AES-256-GCM (or tweetnacl secretbox —
   dependency already present).
3. **Reputation: from lookup table to model** — at minimum a written v0.2
   design for decay / Sybil resistance / diversity before more code.
4. **Consolidate the test harness** (jest/ts-jest into package
   devDependencies; CI entry point).
5. **Honest disclosure** in README/release docs of exactly what is real and
   what is simulated. Candor is itself part of the protocol's claim.

## 7. Open follow-ups

- Alpha-003 backlog (KI-001..KI-006) — see
  [`docs/node/acceptance/alpha-002-known-issues.md`](../node/acceptance/alpha-002-known-issues.md).
- No decision yet on Tier B remediation scope (simulate-label vs.
  implement-for-real). Maintainer gate required.
