# MOOD CLI ALPHA 002 — Acceptance Test & First Run Verification Report

**Status:** Passed (10/10 sections) · **Result:** Ship-ready for demo, remaining issues tracked separately
**CLI under test:** `mood-cli` 0.2.0-alpha.2 (`@mood/cli`)
**Acceptance object:** workspace @ commit `09c7095` — verified: the 7 suspected-modified files show zero content diff vs HEAD (all CRLF phantom markers)
**Date:** 2026-09-03

> Companion document: [known issues & alpha-003 backlog](alpha-002-known-issues.md)

---

## 1. Environment

| Item | Value |
|------|-------|
| OS | Windows 10 Enterprise 19045 (win32) |
| Node | v24.14.0 |
| npm | 11.9.0 |
| CLI | mood-cli/0.2.0-alpha.2 |
| Acceptance object | workspace @ commit `09c7095` (7 suspected-modified files verified zero content diff vs HEAD — CRLF phantom markers only) |
| Install method | `npm install` at repo root + `npm link` under `apps/mood-cli` → global `mood` on PATH. `npm link` preferred over `npm install -g apps/mood-cli`: does not pollute the repo; workspace deps resolve from root `node_modules` |
| First-run condition | `~/.mood` absent (genuine first run) |

---

## 2. First Launch — PASS

- Startup time: **0.495s**.
- Logo: all 6 lines rendered, alignment consistent (uniform 8-space indent), zero errors.
- Screen narrative complete: logo → `~ MOOD ~` → `Contribution Network` → Protocol/Network/Node/Status fact panel → tagline *"Contribution creates consensus."* → `Try` guidance → `>` prompt.
- Uninitialized state tells the user the next step explicitly: `Node: (not initialized — run \`mood init\`)`.

---

## 3. Logo Display — PASS (no change needed)

- ANSI Shadow-style block letters — same aesthetic family as the Docker CLI; the four letters of "MOOD" are clearly legible.
- Box-drawing / block characters render correctly under Windows console UTF-8 (verified in this capture).
- Hierarchy sits closest to a Docker + Claude Code hybrid (among Claude Code / Git / Docker / Bitcoin Core): brand memory point (logo + tagline) plus information density (fact panel).
- Tagline *"Contribution creates consensus."* is a quotable one-liner.
- Color is TTY-only (code review: `useColor = isTTY && !NO_COLOR`); this capture exercised the non-TTY plain path. Real terminal recording will show color — noted in the demo script.
- **Conclusion: keep as-is.** The logo is frozen at the protocol layer (changing it would require a protocol version bump); not touching it is also the correct protocol decision.

---

## 4. Commands

| Command | Result | Observations |
|---------|--------|--------------|
| `mood` | PASS | 0.495s, identity screen, honest status (Stopped/Running reflected live) |
| `mood init` | PASS | Node ID `mood:node:7554ccdf…` (64-hex format correct); `~/.mood/` created with `identity/ config/ snapshots/ logs/` + `state.json`; private key persisted to disk (88-char base64) but **never printed** |
| `mood start` | PASS | Daemon PID 15276 alive (verified via tasklist, ~50MB); logs on disk; epoch-0001 snapshot generated immediately (`sha256:95621e6c…`); graceful local-mode degradation when relay unreachable (*"node continues in local mode, retrying in 60s"*), no crash |
| `mood status` | PASS | All seven fields: Node ID / Network / Protocol / Running / Epoch 001 / digest / Agreement: Verified |
| `mood status --json` | PASS | Single-line valid JSON, envelope `{ok:true,…}`, exit 0; actually parsed successfully with `node -e` (agent-readable proof) |

Additional verification: `mood identity show` (prints public info only + *"Private key never leaves this machine."*), `mood stop` (Exit: clean, identity data retained), stop→start restart cycle normal.

---

## 5. Security Check — PASS

Three-layer scan. **Objects:** all 9 command terminal outputs + `node.log` + `state.json` + `config/node.json` + `identity/node.json` + `snapshots/` — 15 files total:

1. Actual private-key value: full-match search of the `privateKey` value read from `identity/private.json` → **0/15 hits**
2. Sensitive field patterns (`secretKey`/`privateKey`/`seed`/`mnemonic`/`passphrase`/`password`/`credential` + long values) → **0 hits**
3. E-mail address patterns → **0 hits** (`--email <addr>` placeholder not counted)

`mood init` terminal output contains only Node ID / Network / Home. The **Never display: private key** constraint holds on the real first-run path.

---

## 6. User Experience Score — 8 / 10

**Credits:** zero dependencies; sub-second startup; next-step guidance on every screen ("Try: …"); four commands complete the full arc from nameless identity to Verified digest; dual audience from one source (screen + JSON envelope); honest degradation (no relay → no pretending).

**Deductions:** see Remaining Issues below.

---

## 7. Remaining Issues

| # | Issue | Priority | Target |
|---|-------|----------|--------|
| 1 | `mood --version` unimplemented — falls back to the main screen instead of printing the version. First instinct of a new user after installing a CLI is to check the version; version info currently lives only in `mood protocol`'s `clientVersion`. Add a `--version` / `-v` short-circuit in alpha-003 | High | alpha-003 |
| 2 | Full 70-char Node ID widens the main screen — README example is truncated; actual output is full length. Keep full length in `status`/`identity show` (copyable); truncate on the main screen | Medium | alpha-003 |
| 3 | `mood start` hint text (`npm run dev:relay`) is repo-developer perspective — real terminal users have no repo context. Acceptable within alpha scope; replace with neutral user-facing wording before public release | Low | pre-public |
| 4 | WARN noise in logs when relay missing (a `sync error` every 5s) — CLI screen itself stays clean (good); log backoff strategy can be improved | Low | alpha-003 |
| 5 | Color path verified by code review only, not captured on a real TTY — naturally covered during demo recording | Low | demo |
| 6 | First-run "new network" feeling stops at 0 peers (honest but lonely) — a deployment issue, not a design issue; the demo script already designs an optional relay scenario to compensate | Low | deployment |

---

## Artifacts

- `docs/node/demo-script.md` — 6-scene ~90-second demo script (scenes / commands / expected output / narration beats / production notes / safety red lines). **Not committed** (no commit instruction received).
- Machine end-state: node `mood stop` (Exit: clean); `~/.mood/` identity and snapshot data retained; scan temp directory cleaned up; global `mood` link retained.

---

## The ultimate question

> Will a person who freshly installs MOOD feel "I have entered a new network"?

**Yes — and it arrives on time, at the fourth command.** The arc is complete: `mood` (who are you? no one) → `mood init` (you now have cryptographic identity; the private key never leaves this machine) → `mood start` (your machine begins computing the network's first consensus) → `mood status` (Epoch 001 / digest / Agreement: Verified). A 0.5s startup, next-step guidance on every screen, and a single-source dual audience (screen + JSON) take the user through this arc frictionlessly in under two minutes.

What is genuinely missing is not experience design — it is that no one else is on the network yet: *"Peers: 0 connected"* is the most honest and loneliest line. The moment a second real node connects to the relay and both machines agree on the same digest, "I have entered a new network" stops being a metaphor and becomes a fact. Alpha 002 built the door; what remains belongs to deployment and distribution.
