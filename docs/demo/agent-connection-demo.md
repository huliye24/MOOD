# Agent Connection Demo — 5 steps

**Connecting real AI Agent tools to the MOOD contribution layer.**

> Expected result: **"AI Agents detected. MOOD contribution layer ready."**

This is a real transcript from a machine that actually has Claude Code,
Codex, and Cursor installed. MOOD never runs them, never reads their
configs, and never stores their credentials — it only connects them.

---

## Step 1 — Install an AI Agent tool

The engine comes first. Claude Code, Codex, Cursor — any of them, or
all of them, or something else entirely:

```bash
npm install -g @anthropic-ai/claude-code   # Claude Code
npm install -g @openai/codex               # Codex
```

MOOD does not care which. MOOD does not control them.

## Step 2 — Install MOOD

```bash
npm install -g mood
mood init
```

A MOOD node identity is not required for the connector — but a node is
what contributions eventually flow into.

## Step 3 — Detect

```bash
$ mood connector detect

AI Agent Detection

  Claude Code    installed (command, config)
  Codex          installed (config)
  Cursor         installed (command, install-path)

  Ready for connection.

  Detection only. Do not call these tools. Do not control these tools.
```

Existence-only: PATH commands, config directories, install locations.
Nothing was executed. Nothing was read.

## Step 4 — Connect + identity

```bash
$ mood connector init

MOOD Connector initialized.

  Connector ID:  connector:mood:3884d919363646fc9c19e69ac88e6767
  Storage:       ~/.mood/connector
  Never stored here: AI API keys, user credentials, private keys.
  Next: `mood connector register`

$ mood connector register

Register AI Agent

  Claude Code
    Agent ID: agent:mood:4a119129a31c1e72
    Identity:  created

  Codex
    Agent ID: agent:mood:ed4800a558450f32
    Identity:  created

  Cursor
    Agent ID: agent:mood:58e71a9a6dfacda0
    Identity:  created

  A contribution identity is metadata — not a reward, not token accounting.
```

Every detected agent now has a contribution identity. Registering
anything else (Aider, a custom internal agent, …) takes one flag:
`mood connector register --agent "<name>"`.

## Step 5 — Status

```bash
$ mood connector status

MOOD Connector

  Connector:     active
  Connector ID:  connector:mood:3884d919363646fc9c19e69ac88e6767
  Agents:        Claude Code, Codex, Cursor
  Network:       Ready
  AI engines create. MOOD records contribution. The network verifies.
```

**AI Agents detected. MOOD contribution layer ready.**

---

## Bonus — the agent door

An AI Agent (or a script) reads the same state over the API:

```bash
$ mood api start
$ curl http://127.0.0.1:8788/connector/status

{"connector":"active","agents":[{"name":"Claude Code","type":"coding-agent"},{"name":"Codex","type":"coding-agent"},{"name":"Cursor","type":"coding-agent"}]}
```

---

## What just did NOT happen

| Did not happen | Why |
|---|---|
| No AI tool was executed | Detection is `statSync`/`existsSync` only |
| No config file was read | Existence is the question, never contents |
| No API key was stored | The registry holds names, types, IDs, timestamps |
| No model call was made | MOOD has no AI runtime — it is the protocol layer |
| No reward was issued | Contribution Objects carry `proof: "pending"` |

The engines kept creating. MOOD started remembering. The network will
verify.

---

*Reference: [`docs/agent/connector.md`](../agent/connector.md) ·
[`packages/mood-connector`](../../packages/mood-connector)*
