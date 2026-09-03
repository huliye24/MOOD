# MOOD CLI — Known Issues & Alpha-003 Backlog

**Source:** ALPHA 002 acceptance test, commit `09c7095` — see [acceptance report](alpha-002-acceptance-report.md)
**Status legend:** `OPEN` / `FIXED` / `DEFERRED` · Tracked from 2026-09-03

---

## KI-001 — `mood --version` unimplemented (falls back to main screen)

| Field | Value |
|-------|-------|
| Severity | **High** (first-install friction) |
| Status | `OPEN` |
| Target | alpha-003 |
| Area | `apps/mood-cli` bin arg parsing |

**Observed:** `mood --version` is not recognized as a version flag; it falls through to the main identity screen instead of printing the version.

**Rationale:** A new user's first instinct after installing a CLI is to check the version. Today the version string is only reachable via `mood protocol`'s `clientVersion`.

**Acceptance criteria:**
- `mood --version` prints `mood <version>` (e.g. `0.2.0-alpha.3`) and exits 0.
- `mood -v` behaves identically.
- Output stays machine-readable (plain single line).
- Version remains single-sourced from `package.json` (`clientVersion` alignment in `mood protocol` must not drift).

---

## KI-002 — Full 70-char Node ID widens the main screen

| Field | Value |
|-------|-------|
| Severity | Medium (layout/polish) |
| Status | `OPEN` |
| Target | alpha-003 |
| Area | CLI main screen (`mood`), README example mismatch |

**Observed:** README example shows a truncated Node ID; actual output is full-length, widening the main screen beyond the design.

**Acceptance criteria:**
- Main screen (`mood`): truncate Node ID (keep the `mood:node:` prefix + first hex run), matching the README example.
- `mood status` and `mood identity show`: keep full length (copyable / usable as an identifier).
- Verify alignment of the fact panel after truncation.

---

## KI-003 — `mood start` hint text uses repo-developer perspective

| Field | Value |
|-------|-------|
| Severity | Low |
| Status | `OPEN` |
| Target | pre-public release (acceptable within alpha scope) |
| Area | `mood start` hint text |

**Observed:** the relay hint reads `npm run dev:relay`, which is meaningful only to someone with the repo checked out. A real terminal user has no repo context.

**Acceptance criteria:** replace with neutral, user-facing wording before any public release (e.g. a relay address or a generic pointer), without implying a local dev workflow.

---

## KI-004 — Relay-missing log WARN noise (sync error every 5s)

| Field | Value |
|-------|-------|
| Severity | Low |
| Status | `OPEN` |
| Target | alpha-003 |
| Area | daemon log / retry backoff |

**Observed:** when the relay is unreachable, logs emit a `sync error` WARN every 5s. The CLI screen itself stays clean (good); only the log stream is noisy.

**Acceptance criteria:** introduce exponential backoff (with jitter) capped at the existing 60s retry interval; surface the transition to local mode once, not repeatedly.

---

## KI-005 — Color path not captured on a real TTY

| Field | Value |
|-------|-------|
| Severity | Low (verification gap, not a code defect) |
| Status | `OPEN` |
| Target | demo recording (natural coverage) |
| Area | TTY color path (`useColor = isTTY && !NO_COLOR`) |

**Observed:** the color path was verified by code review only; the acceptance capture exercised the non-TTY plain path.

**Action:** the demo recording session (docs/node/demo-script.md) runs in a true terminal and covers this by nature. Re-check colors once recorded.

---

## KI-006 — First-run experience stops at "Peers: 0 connected"

| Field | Value |
|-------|-------|
| Severity | Low (deployment issue, not design issue) |
| Status | `DEFERRED` |
| Target | deployment / network bootstrapping |
| Area | relay availability, peer discovery |

**Observed:** the honest-but-lonely "Peers: 0 connected" line ends the first-run arc. No second real node exists on the relay yet.

**Action:** demo script already designs an optional relay scenario to compensate. Real fix = standing relay + second real node producing a matching digest; outside the CLI codebase.
