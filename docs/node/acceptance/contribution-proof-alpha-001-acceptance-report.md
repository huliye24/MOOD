# MOOD Contribution Proof Alpha 001 — Acceptance Report

**Acceptance object:** commit `1b1b3ff` (`feat(protocol): introduce
contribution proof alpha 001`; atop connector `7657dc2` / api `1100324`)
**Package under test:** `@mood/contribution-proof` via `mood contribution`
create / list / verify + `services/node-api` `GET /contributions`
**Date:** 2026-09-03 (evening)
**Method:** live execution of the 14-part acceptance blueprint in an isolated
`MOOD_HOME` sandbox (real `~/.mood` untouched — verified empty afterwards);
content-addressing determinism test at package level; tamper test on a stored
event; live API probes; five-layer security scan over all outputs and storage.

> Related: [Connector Alpha 001 acceptance](connector-alpha-001-acceptance-report.md)
> · [engineering-log index](../engineering-log/README.md)

---

## Environment

| Item | Value |
| --- | --- |
| OS | Windows 10 Enterprise 19045 (win32) |
| Node | v22.22.2 |
| npm | 10.9.7 |
| CLI | `@mood/cli` @ HEAD `1b1b3ff` |
| Isolation | `MOOD_HOME=C:\…\Temp\mood-contrib-accept` (fresh; removed after) |
| Real data | `~/.mood/contributions/` verified empty after acceptance (unpolluted) |

## Contribution Creation — PASS

`mood contribution create --actor claude-code --type code_change` → Event
`event:mood:3b793117…`, Proof `sha256:432ce50e…`, `Verified: true`. Events and
proofs persist as one JSON file each under
`<MOOD_HOME>/contributions/{events,proofs}/`. Actor resolution: registered
connector agent → registered identity; otherwise deterministic derived ID
(`agent:mood:`/`human:mood:`/`org:mood:` + 16 hex). No registration required,
same reference → same ID.

## Proof Generation — PASS

Proof object complete and portable: `{proofId, eventId, eventHash,
createdAt, algorithm: "SHA-256", verified}`. `proofId` derives from
{eventId, eventHash, createdAt} — regenerating the same proof anywhere yields
the same proof. Event ID is content-addressed (`sha256` over content sans
id) — no counters, no randomness, no central allocator.

## Hash Verification — PASS

Full-sweep and per-ID `mood contribution verify` recompute every stored hash.
End state: 4/4 verified across the sandbox run (AI, human, and second AI
actors), exit 0 on pass. This is a genuine SHA-256 over canonical JSON
(recursive key sort, no whitespace) — every field including the event ID is
covered; `hashEvent` semantics: any byte changed → hash changed.

## Tamper Detection — PASS

Modified one field (`action.description` → "Modified contribution") in the
stored event file: `verify` reported **FAIL**, exit 1, showing both the
recorded hash `sha256:432ce50e…` and the recomputed `sha256:44fb230a…`.
Restored the file: **PASS** again. Detection is by recomputation, never by
trusting the stored `verified` flag.

## Determinism (blueprint Part 5) — PASS

Content addressing verified at package level: two events built from
identical input (same timestamp) produce the same event ID, the same proof
hash, and the same proof ID; changing one description field changes all
three. Note: two CLI `create` calls necessarily differ because each event
carries its own `timestamp` — different event, different hash, by design.

## CLI Experience — PASS

`create` (AI and human actors, incl. `--actor-type human`), `list` (newest
first, Agent/Type/Status: Verified), `verify` (all or by ID). No runtime
errors observed across the entire run.

## API Integration — PASS

`mood api start` → 127.0.0.1:8788 "Ready for AI Agents" (MOOD_HOME-aware).
`GET /contributions` → valid JSON, `{"contributions":[…]}` with 4 entries
matching local storage; each entry is the full `{event, proof}` pair with
`proof.verified: true`, `algorithm: SHA-256`. Deterministic, no secret-shaped
content.

## Security Review — PASS (one observation)

Five-layer scan across every command output, the API response, node/api
logs, state, and all stored event/proof files:

1. Node private-key value (both sandbox and real identity) → **0 hits**
2. Sensitive field patterns (secretKey/privateKey/seed/mnemonic/passphrase/
   password/credential) → **0 hits**
3. E-mail patterns → **3 hits, all the test actor reference
   `yu@mood.example`** (.example is an RFC-reserved test domain — not real PII)
4. AI-provider credential signatures (`sk-ant-`, `sk-proj-`, `sk-…`,
   ANTHROPIC/OPENAI keys) → **0 hits**
5. API-key shaped values → **0 hits**

The validator rejects credential-shaped content structurally
(SECRET_PATTERNS) — the protocol refuses to record secrets rather than
promising not to. Observation: a human actor's `--actor` reference is stored
verbatim in the event; an e-mail-shaped reference therefore persists by
design. Acceptable in alpha (references are public contribution identity),
but the e-mail-as-actor-reference policy should be a conscious decision
before wider use.

## Complete Workflow — PASS

> "Can MOOD record AI-generated work as a verifiable contribution?" — **PASS**

The proof chain was exercised end to end on this machine: create (hash →
proof → storage) → list → tamper → verify → API read-back. Notably,
`mood contribution create` works without a running node (local file
storage); with `mood init` + `mood start` the same records coexist with a
running node under one MOOD_HOME. The layer is intentionally free of token,
reward, reputation, and governance semantics.

## Remaining Issues

| # | Issue | Severity | Status |
| --- | --- | --- | --- |
| 1 | Human actor references stored verbatim — e-mail-shaped references persist by design; needs an explicit policy (public identity vs. PII) before real-world use | Medium (policy) | OPEN |
| 2 | No network propagation yet — proofs live on the recording node only; "network can verify" awaits the protocol object stream (per package comment, a later layer) | Medium (roadmap) | OPEN |
| 3 | Old `proof-engine/` (Tier-B simulated verifier with decorative "SHA256-like" hash, from the technical audit) still coexists with this correct `@mood/contribution-proof` — duplicate naming risk; recommend deprecating/removing the old engine | Medium (hygiene) | OPEN |
| 4 | Inherited CLI backlog KI-001..KI-003 unchanged | Low | OPEN |

## Machine End-State

- Sandbox `MOOD_HOME` removed; scan temp files removed; real `~/.mood/`
  verified unpolluted (no contributions directory contents).
- API and node stopped clean (Exit: clean) inside the sandbox before removal.
- Artifacts below written to the repository, uncommitted.

## Artifacts

- Demo script: [`docs/demo/contribution-proof-demo.md`](../demo/contribution-proof-demo.md)
- This report: `docs/node/acceptance/contribution-proof-alpha-001-acceptance-report.md`
- Engineering-log entry: [`docs/engineering-log/2026-09-03-contribution-proof-alpha-001-acceptance.md`](../engineering-log/2026-09-03-contribution-proof-alpha-001-acceptance.md)
