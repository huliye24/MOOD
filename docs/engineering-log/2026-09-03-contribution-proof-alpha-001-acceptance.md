# Contribution Proof Alpha 001 Acceptance — "Can MOOD prove a contribution happened?"

- **Date:** 2026-09-03 (evening, third acceptance of the day)
- **Scope:** `@mood/contribution-proof` + `mood contribution` +
  `services/node-api` `GET /contributions`; repository head `1b1b3ff`
- **Trigger:** maintainer-supplied 14-part acceptance blueprint. The shift in
  standard: not "can MOOD start" (alpha-002) and not "can AI connect"
  (connector alpha-001) — but *"can MOOD prove that a contribution event
  existed and was not modified?"*
- **Method:** live execution in an isolated `MOOD_HOME` sandbox (real
  `~/.mood` verified unpolluted afterwards); package-level determinism test;
  on-disk tamper test; live API probes; five-layer security scan.
- **Status:** All 14 parts PASS. Report + demo script + this entry archived.

## Outcome

The proof chain executed end to end and passed: create (content-addressed
event ID → SHA-256 over canonical JSON → portable proof → storage) → list →
**tamper test** (one field changed → verify FAIL with both hashes shown) →
restore → verify PASS → API read-back of all records.

Design notes worth recording:

- Event IDs are content-addressed (`event:mood:` + sha256 of content sans
  id) — same contribution, same ID, on any machine, no randomness. Proof IDs
  derive from {eventId, eventHash, createdAt}.
- Verification is always recomputation; the stored `verified` flag is never
  trusted.
- The validator rejects credential-shaped content structurally — the
  protocol refuses to record secrets rather than promising not to.
- `mood contribution create` works without a running node; the layer carries
  no token/reward/reputation/governance semantics by design.

## Open follow-ups

1. Human actor references stored verbatim — e-mail-shaped references persist
   by design; needs an explicit identity-vs-PII policy before real-world use.
2. Proofs are node-local; network propagation awaits the protocol object
   stream (explicitly a later layer).
3. Old `proof-engine/` (Tier-B simulated verifier from the technical audit)
   coexists with this correct package — deprecate to remove duplicate naming.
4. Inherited CLI backlog KI-001..KI-003.

## Artifacts

- Acceptance report:
  [`docs/node/acceptance/contribution-proof-alpha-001-acceptance-report.md`](../node/acceptance/contribution-proof-alpha-001-acceptance-report.md)
- Demo script (tamper test as the money shot):
  [`docs/demo/contribution-proof-demo.md`](../demo/contribution-proof-demo.md)
