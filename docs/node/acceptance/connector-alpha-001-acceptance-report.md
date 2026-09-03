# MOOD Connector Alpha 001 — Acceptance Report

**Acceptance object:** commit `7657dc2` (`feat(connector): introduce AI Agent
contribution connector layer alpha 001`, atop `1100324` `feat(api): introduce
MOOD AI Agent Layer Alpha 001`)
**CLI under test:** `@mood/cli` (npm-linked global `mood`) — command surface
includes `mood api start/status/stop` and
`mood connector detect/init/register/status`
**Date:** 2026-09-03
**Method:** live execution of the 14-part acceptance blueprint, fresh
connector state (reset before Part 7), four-layer security scan, live API
probes.

> Related: [Alpha 002 acceptance](alpha-002-acceptance-report.md) ·
> [engineering-log entry](../engineering-log/2026-09-03-codebase-technical-audit.md)

---

## Environment

| Item | Value |
| --- | --- |
| OS | Windows 10 Enterprise 19045 (win32) |
| Node | v22.22.2 |
| npm | 10.9.7 |
| CLI | `@mood/cli` @ HEAD `7657dc2` (api + connector present) |
| Install | repo-root `npm install` + `npm link` under `apps/mood-cli` |
| Node identity | pre-existing (`mood:node:7554ccdf…`) — retained |
| Connector state | reset to fresh for this acceptance, then re-initialized |

## Startup Experience — PASS

`mood` renders the full identity screen (6-line logo, fact panel, tagline,
`Try:` guidance, `>` prompt) with no errors. Honest status reporting: shows
`Stopped` before start, `Running` after — the blueprint's "Status: Ready" is
reached by `mood start` (a fresh user who has not started the node sees the
truthful `Stopped`, which is correct UX).

## Node Status — PASS

`mood start` → daemon PID 23276 (tasklist-verified `node.exe`, ~51 MB);
`mood status` → all fields present: Running / Epoch 001 /
`sha256:95621e6c…` / **Agreement: Verified**. `mood stop` → Exit: clean.

## API Status — PASS

`mood api start` → Endpoint `http://127.0.0.1:8788`, **"Ready for AI
Agents"** only after a real `/health` probe succeeded (PID 2028). Verified
live:
- `GET /health` → `{"status":"ok","service":"mood-api"}`
- `GET /node/status` → `{"nodeId":…,"network":…,"protocol":"v0.1","status":"running","epoch":"001"}` — public fields only
- `GET /connector/status` → `{"connector":"active","agents":[…]}` — valid JSON, parsed successfully, deterministic order, no private info
- unknown path → 404
- `mood api stop` → Exit: clean; port 8788 released

## AI Detection — PASS

`mood connector detect` (this machine): Claude Code `installed (command,
config)`, Codex `installed (config)`, Cursor `installed (command,
install-path)` → "Ready for connection." Detection is existence-only (sources
are path/config presence); nothing was launched, no credentials accessed.
`--json` mode emits the same result deterministically.

## Connector Identity — PASS

Fresh path verified end-to-end (connector data reset first, since an earlier
implementation session had left a record):
- `mood connector init` → `connector:mood:b4913cf2ffcbe7cd6a1e2b62389a0e59`; storage `~/.mood/connector/` contains exactly `connector-id` + `agent-record.json` — no secrets. Idempotent re-run reports "already initialized" cleanly.
- `mood connector register` → three agents registered with contribution
  identities `agent:mood:46fb8d33…`, `agent:mood:a7af214c…`,
  `agent:mood:1ecbcb6d…`; metadata only (IDs, names, timestamps).
- `mood connector status` → Connector: active / Agents: Claude Code, Codex,
  Cursor / Network: Ready.

## Security — PASS

Four-layer scan across 14 objects (all command outputs incl. `--json`, API
responses, `api.log`/`node.log`, `api-state.json`, `state.json`,
`config/node.json`, `identity/node.json`, connector files):

1. Actual node private key value (88-char, read from `private.json`), full-text match → **0/14**
2. Sensitive field patterns (secretKey/privateKey/seed/mnemonic/passphrase/credential/api_key/password) → **0 hits**
3. E-mail address patterns → **0 hits**
4. AI-provider credential signatures (`sk-ant-`, `sk-proj-`, long `sk-`,
   `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) → **0 hits**

`~/.mood/connector/` stores no keys by construction; API key defaults to
`disabled` (loopback-bound local-only mode — appropriate for alpha; a key
must be enabled before any non-local exposure).

## Complete Workflow — PASS

> "Can a human turn on MOOD first, then let AI work inside a connected
> contribution network?" — **PASS**

Human path verified as a live sequence: `mood` → `mood start` → `mood api
start` → `mood connector detect/init/register/status` → API answers
`/connector/status` and `/node/status` for AI agents. The demo script
[`docs/demo/mood-ai-workflow-demo.md`](../demo/mood-ai-workflow-demo.md)
captures the 5-command ~90-second version of this arc.

## Remaining Issues

| # | Issue | Severity | Status |
| --- | --- | --- | --- |
| 1 | `mood --version` still falls back to the home screen (KI-001, alpha-003 backlog) — unchanged by this layer | Low (connector scope) | OPEN |
| 2 | Main screen shows full-length Node ID (KI-002) — widens layout | Low | OPEN |
| 3 | `mood start` relay hint still repo-developer wording `npm run dev:relay` (KI-003) | Low | OPEN |
| 4 | API auth is local-only by default; enable key + document bearer flow before any non-loopback deployment | Medium (deployment gate) | OPEN |
| 5 | Untracked `.codex-worktrees/` and in-progress edits from the implementation session remain in the working tree | Hygiene | OPEN (not part of this acceptance) |

## Machine End-State

- `mood api stop` — Exit: clean; `mood stop` — Exit: clean; port 8788
  released and verified closed.
- Identity (`~/.mood/identity/`), snapshots, and the fresh connector record
  (`~/.mood/connector/`) retained.
- Scan temp files under `/tmp/moodsec` removed; global `mood` link retained.
