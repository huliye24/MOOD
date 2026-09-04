# Alpha 002-A Crypto Design Start Report

**Date:** 2026-09-04
**Branch:** `codex/mood-node-alpha-001`
**HEAD at design start:** `b49c56c` — `docs(protocol): define identity layer alpha 002 specification`
**Task mode:** SPECIFICATION ONLY — no code, no packages, no apps, no services, no real keys, no signatures, no identity deployment, no Alpha 001 object modification.

## Current version

```text
Alpha 001     Protocol Object (Contribution Proof + Object + Verification)   FROZEN
Alpha 002     Identity Layer Specification                                 ACCEPTED
Alpha 002-A   Cryptographic Identity Design                                ← this task
```

## Acceptance chain

- Alpha 001 — three acceptance passes, all PASS
  ([object](MOOD_PROTOCOL_OBJECT_ALPHA_001_ACCEPTANCE_REPORT.md) `16d2da9`,
  [history](MOOD_PROTOCOL_HISTORY_ACCEPTANCE_REPORT.md) `ac2a65b`,
  [freeze](alpha-001/MOOD_ALPHA001_FREEZE_ACCEPTANCE_REPORT.md) `85894dd`)
- Alpha 002 —
  [Identity Layer Specification Acceptance](alpha-002-identity-specification-acceptance.md),
  WorkBuddy, 2026-09-04, target `b49c56c`, **PASS 15/15**:
  *"Alpha 002 is defined as a cryptographic identity layer that extends
  Alpha 001 without rewriting its frozen surface."*

## Frozen boundary (do not touch)

Per [ADR-001](../decisions/ADR-001-alpha001-freeze.md):

- the v0.1 object envelope — six keys, closed payload schema
- the ID derivation — SHA-256 over canonical content, first 24 hex
- the hash engine — all hashing and canonicalization live in
  `@mood/contribution-proof`
- the verification model — recomputation, not trust

## Task question

The accepted Identity Layer specification defines *what* Alpha 002
provides. This task defines *how cryptography makes it work*:

> *"How should cryptographic identity work?"*

Output: the cryptographic model — key pair model, algorithm evaluation,
identifier design, signature and verification architecture, threat
model, key lifecycle — with every algorithm decision held at
**Recommendation Pending** until the review milestones.

## Working tree note

Pre-existing working-tree changes (workflows, web pages, audit scripts,
`output/`, `tmp/`, `protocol/architecture/`, `docs/world/`,
`docs/mood/audit/`) are unrelated to this task and remain untouched.
Only `docs/` files are created or modified.
