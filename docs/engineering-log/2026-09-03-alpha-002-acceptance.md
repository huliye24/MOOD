# Alpha 002 Acceptance — first-run verification of the CLI-first node

- **Date:** 2026-09-03 (afternoon session; retroactively logged when the
  engineering-log series was established)
- **Scope:** `@mood/cli` 0.2.0-alpha.2 @ commit `09c7095` (repository-wide
  first-run verification)
- **Trigger:** maintainer asked for a genuine first-run acceptance of the new
  CLI-first MOOD node, focused on the real user path — does a fresh install
  feel like entering a new network?
- **Method:** clean `~/.mood` first run; live command execution
  (`mood / init / start / status [--json] / stop`); tasklist process
  verification; three-layer security scan over 15 objects.
- **Status:** 10/10 sections PASS. Report + known-issues backlog archived.

## Outcome

- First launch 0.495s; full narrative arc verified: anonymous `mood` →
  cryptographic identity (`mood init`, private key never printed) → first
  consensus (`mood start`, epoch-0001 snapshot) → `mood status` shows
  **Agreement: Verified**. Answer to the ultimate question: yes — a new user
  feels "I entered a new network" by the fourth command.
- Security scan 0/15 (private-key value, sensitive fields, e-mail patterns).
- UX scored 8/10; six remaining issues became the alpha-003 backlog
  (KI-001..KI-006), led by `mood --version` falling back to the home screen.

## Artifacts

- Acceptance report: [`docs/node/acceptance/alpha-002-acceptance-report.md`](../node/acceptance/alpha-002-acceptance-report.md)
- Known-issues backlog (KI-001..KI-006):
  [`docs/node/acceptance/alpha-002-known-issues.md`](../node/acceptance/alpha-002-known-issues.md)

## Open follow-ups

- KI-001..KI-006 remain open for alpha-003 (see backlog document).
- The demo script produced alongside (`docs/node/demo-script.md`) remains
  uncommitted pending a commit instruction.
