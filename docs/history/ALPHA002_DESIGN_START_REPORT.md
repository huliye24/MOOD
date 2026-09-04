# Alpha 002 Design Start Report

**Date:** 2026-09-04
**Branch:** `codex/mood-node-alpha-001`
**HEAD at design start:** `85894dd` — `docs(protocol): freeze alpha 001 archive`
**Task mode:** SPECIFICATION ONLY — no code, no packages, no apps, no services, no keys, no signatures, no Alpha 001 schema changes.

## Alpha 001 status

Confirmed **ACCEPTED and FROZEN**:

- Archive: [`docs/history/alpha-001/`](alpha-001/) — Status FROZEN, Date 2026-09-03
- Freeze decision: [ADR-001](../decisions/ADR-001-alpha001-freeze.md) — Accepted 2026-09-04
- Acceptance passes, all PASS:
  - [Protocol Object Alpha 001](MOOD_PROTOCOL_OBJECT_ALPHA_001_ACCEPTANCE_REPORT.md) — target `16d2da9`
  - [Protocol History Alpha 001](MOOD_PROTOCOL_HISTORY_ACCEPTANCE_REPORT.md) — target `ac2a65b`
  - [Alpha 001 Freeze](alpha-001/MOOD_ALPHA001_FREEZE_ACCEPTANCE_REPORT.md) — target `85894dd`, 12/12 parts PASS

## Boundary confirmation

[`docs/history/alpha-001/boundary.md`](alpha-001/boundary.md) lists under
NOT IMPLEMENTED:

- issuer signature, object registry, genesis object — **Alpha 002**
- synchronization transport — Alpha 003
- network state — Alpha 004

**Identity Signature is confirmed as future Alpha 002 scope.** This task
defines that layer; it does not implement it.

## Alpha 002 question

Alpha 001 answered: *"What is the object?"* — content addressing and
verification by recomputation.

Alpha 002 answers: *"Who created the object?"* — cryptographic node
identity and issuer verification.

## Working tree note

Pre-existing working-tree changes (workflows, web pages, audit scripts,
`output/`, `tmp/`, `protocol/architecture/`) are unrelated to this
specification task and remain untouched. Only `docs/` files are created
or modified.
