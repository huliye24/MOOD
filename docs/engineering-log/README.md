# docs/engineering-log

Engineering log is the chronological memory of MOOD's engineering process —
technical audits, deep dives, refactors, and candid self-assessments of the
codebase. It exists because MOOD needs a development history beyond release
notes.

## Boundaries (what belongs here vs. elsewhere)

| Place | Records |
| --- | --- |
| `MOOD_CANON.md` | What MOOD is (highest conceptual authority) |
| `docs/chronicle/` | Canon amendment proposals and explicit decisions |
| `CHANGELOG.md` (root) | Versioned, user-facing change records |
| `docs/releases/` | Per-release release notes |
| **`docs/engineering-log/`** | **Engineering process history: audits, findings, rationale, open work** |

Engineering log entries carry **no canonical authority**. They are process
memory: they record what was found, what was decided in implementation, and
what remains open. A log entry never amends the Canon by existing.

## Naming Convention

`YYYY-MM-DD-<topic-slug>.md` — chronological, one file per entry, append-only.
Start each entry with the metadata block below so entries stay comparable over
time.

## Entry Metadata Template

```markdown
- **Date:** YYYY-MM-DD
- **Scope:** <subsystem or repository-wide>
- **Trigger:** <why this entry exists>
- **Method:** <how the finding was produced>
- **Status:** <Findings recorded / Actions pending / Actions taken>
```

## Index

| Date | Entry | Scope |
| --- | --- | --- |
| 2026-09-03 | [Alpha 002 acceptance — first-run verification](2026-09-03-alpha-002-acceptance.md) | CLI 0.2.0-alpha.2 @ `09c7095` |
| 2026-09-03 | [Codebase technical audit — ALPHA 002 era](2026-09-03-codebase-technical-audit.md) | Repository-wide |
| 2026-09-03 | [Connector Alpha 001 acceptance — human-first, AI-ready startup](2026-09-03-connector-alpha-001-acceptance.md) | api + connector layers @ `7657dc2` |
| 2026-09-03 | [Contribution Proof Alpha 001 acceptance — proving work happened](2026-09-03-contribution-proof-alpha-001-acceptance.md) | contribution proof layer @ `1b1b3ff` |
