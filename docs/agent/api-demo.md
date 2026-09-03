# MOOD Agent Layer — API Demo

**How a human delegates their MOOD node to an AI Agent.**

> Principle: **CLI 是人类入口，API 是 AI 入口。**
> The CLI is the human entry; the API is the AI entry.

This is a real transcript. The human never opens a terminal for the node
itself — they say one sentence, the agent speaks HTTP, the node answers.

---

## Setup (once, by the human)

```bash
$ mood init
  MOOD identity created.

$ mood start
  Starting MOOD Node...

  Protocol      v0.1
  Network       MOOD Alpha Testnet
  Status        Running

$ mood api start
  Starting MOOD API...

  Endpoint: http://127.0.0.1:8788
  Status:   Ready for AI Agents
  PID:      10460
  Key:      disabled (local-only default)
  Log:      ~/.mood/logs/api.log

  The API is the AI Agent entry. Try: curl http://127.0.0.1:8788/node/status
```

The node runs. The agent door is open — local-only, on loopback. From
here on, the human talks in plain language; the agent does the rest.

---

## The conversation

```text
Human:  Ask my AI agent to inspect my MOOD node.

        ┌──────────────────────────────────────────────┐
        │  AI Agent                                    │
        │  tool call: GET http://127.0.0.1:8788/node/status
        └──────────────────────────────────────────────┘

        {"nodeId":"mood:node:7554ccdf2cec12acbb3099ce48687437f12fab7e19a3ae1f0e1dc6f1362fa22e",
         "network":"MOOD Alpha Testnet",
         "protocol":"v0.1",
         "status":"running",
         "epoch":"001"}

        ┌──────────────────────────────────────────────┐
        │  AI Agent                                    │
        │  tool call: GET http://127.0.0.1:8788/snapshot
        └──────────────────────────────────────────────┘

        {"epoch":"001",
         "digest":"sha256:95621e6c18c6208e17da10ccc701def488cfaec1ee52a535acf789e5b5428fc1",
         "agreement":"verified"}

Agent:  Your MOOD node is online. Epoch 001 verified.
```

Two calls, one sentence back. The agent did not shell out, did not read
`~/.mood/` directly, and never touched the private key — the API served
exactly the public, machine-readable facts.

---

## The same calls, by hand

An agent is just an HTTP client. Verify everything yourself with curl:

```bash
$ curl http://127.0.0.1:8788/health
{"status":"ok","service":"mood-api"}

$ curl http://127.0.0.1:8788/node/status
{"nodeId":"mood:node:7554ccdf...","network":"MOOD Alpha Testnet","protocol":"v0.1","status":"running","epoch":"001"}

$ curl http://127.0.0.1:8788/identity
{"nodeId":"mood:node:7554ccdf...","publicKey":"w6iEGOa7...","organization":null}

$ curl http://127.0.0.1:8788/peers
{"peers":[]}

$ curl http://127.0.0.1:8788/snapshot
{"epoch":"001","digest":"sha256:95621e6c...","agreement":"verified"}
```

With an API key enabled (`mood api start --key <secret>`), the agent adds
one header — `Authorization: Bearer <secret>` — and `/health` stays open
for liveness probes.

---

## What the agent may and may not do

| The API allows | The API never does |
|---|---|
| Read node status | Expose the private key |
| Inspect public identity | Expose secrets or credentials |
| Inspect peers | Create tokens |
| Verify snapshots | Perform financial operations |
| Start / stop the node | Bypass protocol rules |

Phase Zero holds at the API layer exactly as it holds everywhere else:
no token, no wallet, no financial operations, no mining, no staking, no
governance.

---

## Why this matters

A MOOD node is designed to be operated by **whoever (or whatever) is
best suited**: humans use the CLI, AI Agents use the API, and both reach
the same node through the same runtime.

```text
  人 Human ──────▶ mood CLI ─────────────┐
                                         ├──▶ MOOD Node Runtime ──▶ MOOD Network
  AI Agent ──────▶ MOOD API (HTTP) ──────┘
```

The human entry and the agent entry are two doors into one house.

---

*Reference: [`services/node-api`](../../services/node-api) ·
[`docs/architecture/mood-agent-layer.md`](../architecture/mood-agent-layer.md) ·
[`docs/node/CLI.md`](../node/CLI.md)*
