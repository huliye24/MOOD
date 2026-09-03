# MOOD Connector — the AI Agent contribution layer

**Why the connector exists: AI engines create. MOOD records contribution.**

Claude Code, Codex, and Cursor are the engines. They write the code,
run the agents, and hold the model calls. MOOD does not compete with
any of them — MOOD is the layer underneath: the protocol that turns
"an AI Agent worked on this machine" into verifiable contribution
metadata on a network.

> Principle: **收缩边界，不造 AI 引擎。**
> Shrink the boundary. Do not build an AI engine.
> Detect → Connect → Identity → Contribution proof entry. Nothing more.

```text
  Claude Code ─┐
  Codex ───────┤                 ┌────────────────┐
  Cursor ──────┼──▶ MOOD Connector ──▶ MOOD Node ──▶ MOOD Network
  Any agent ───┘   (this layer)      (records,      (snapshot
                                     snapshots)      agreement)
```

---

## What the connector does

Exactly four things, and nothing else:

| Step | Command | What happens |
|---|---|---|
| **Detect** | `mood connector detect` | Which AI Agent tools are installed here? |
| **Connect** | `mood connector init` | Create the local connector identity |
| **Identity** | `mood connector register` | Give each agent a contribution identity (`agent:mood:…`) |
| **Entry** | Contribution Object v0.1 | Metadata an agent's work can be attached to |

Detection is **existence-only**: a command file on PATH, a known config
directory, a known install location. The connector never runs the tools
it detects, never reads their configuration contents, and never
inspects credentials. It asks "does this exist?" — that is the whole
question.

## What the connector never does

Enforced structurally, not promised rhetorically:

- **No model calls.** There is no AI runtime in MOOD — no chat, no
  completions, no embeddings. The engines stay in the engines.
- **No agent control.** The connector does not launch, configure, or
  remote-control Claude Code, Codex, or Cursor.
- **No secrets stored.** `~/.mood/connector/` holds an ID, a creation
  date, and agent names/types. Never AI API keys, never user
  credentials, never private keys.
- **No rewards, no tokens.** A Contribution Object is metadata with
  `proof: "pending"` — not reward, not token accounting, not a claim of
  quality.

## Storage

```text
~/.mood/connector/
  connector-id        # connector:mood:<hex> — the connector identity
  agent-record.json   # { connectorId, createdAt, agents: [...] }
```

An agent entry is exactly:

```json
{
  "agentId": "agent:mood:4a119129a31c1e72",
  "key": "claude-code",
  "name": "Claude Code",
  "type": "coding-agent",
  "connectorId": "connector:mood:3884d919363646fc9c19e69ac88e6767",
  "registeredAt": "2026-09-03T09:41:12.301Z"
}
```

Names, types, IDs, timestamps — that is the entire registry. Agent IDs
are deterministic (`sha256` over connector + agent), so re-registering
is idempotent and never duplicates.

Unknown agents are first-class: `mood connector register --agent "Aider"`
creates a generic-agent identity for any AI system, because MOOD's job
is to connect the network, not to enumerate it.

## Contribution Object v0.1

The connector's only output toward the network:

```json
{
  "id": "contribution:mood:80feb315bcb71198761ff2af",
  "type": "agent_contribution",
  "agent": "agent:mood:4a119129a31c1e72",
  "connector": "connector:mood:3884d919363646fc9c19e69ac88e6767",
  "timestamp": "2026-09-03T00:00:00.000Z",
  "proof": "pending"
}
```

`proof` stays `"pending"` until the MOOD network's snapshot agreement
says otherwise. The connector never signs, never scores, never pays.

## The API surface

Agents (and scripts) read the connector through the same API door as
everything else:

```bash
$ curl http://127.0.0.1:8788/connector/status
{"connector":"active","agents":[{"name":"Claude Code","type":"coding-agent"}]}
```

Uninitialized machines answer `{"connector":"inactive","agents":[]}`.
The route is independent of node identity — the connector layer answers
even before `mood init`. It exposes agent names and types only: no
credentials, no API keys, no private information, because none of those
are ever stored in the first place.

## Position

```text
  OpenAI / Anthropic / Anysphere     ← the engines (they create)
                │
        MOOD Connector               ← this layer (detect, connect, identify)
                │
        MOOD Node / Network          ← the protocol (records, verifies)
```

MOOD is not the next AI assistant. MOOD is the contribution layer for
AI-native networks — the Linux-shaped layer on top of the engines, not
a competitor application beside them.

**AI creates. MOOD remembers. The network verifies.**

---

*Reference: [`packages/mood-connector`](../../packages/mood-connector) ·
[`docs/demo/agent-connection-demo.md`](../demo/agent-connection-demo.md) ·
[`docs/agent/api-demo.md`](./api-demo.md) ·
[`docs/architecture/mood-agent-layer.md`](../architecture/mood-agent-layer.md)*
