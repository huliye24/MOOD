# @mood/connector

AI Agent contribution connector layer for the MOOD network.

MOOD does **not** compete with Claude Code, Codex, or Cursor. Those tools
are the engines — they create. `@mood/connector` is the bridge that turns
an AI Agent environment into a verifiable contributor on the MOOD
network:

```
AI Agent (Claude Code / Codex / Cursor / any)
        │
        ▼
   @mood/connector        detect → connect → identity → contribution entry
        │
        ▼
     MOOD Node             records, snapshots, network verification
```

## What it does

| Capability | Function | Command |
|---|---|---|
| Detect installed agent environments | `detectAgents()` | `mood connector detect` |
| Create the local connector identity | `initConnector()` | `mood connector init` |
| Register agents as contributors | `registerAgent()` | `mood connector register` |
| Report connector status | `readConnectorRecord()` | `mood connector status` |
| Build a Contribution Object v0.1 | `createContributionRecord()` | — |

## What it never does

Enforced structurally, not just promised:

- **No AI calls.** Detection is existence-only (`statSync` / `existsSync`).
  The connector never spawns `claude`, `codex`, or any other tool.
- **No secrets stored.** The connector directory holds an ID, a creation
  date, and agent names/types — never API keys, credentials, or private
  keys. Config files are checked for existence only; contents are never
  read.
- **No rewards, no tokens.** A Contribution Object v0.1 is metadata with
  `proof: "pending"`. It is not reward and not token accounting.
- **No replacement of agent tools.** The connector does not chat, does
  not write code, and does not control the agents it detects.

## Storage

```
~/.mood/connector/connector-id        # connector:mood:<hex>
~/.mood/connector/agent-record.json   # { connectorId, createdAt, agents: [...] }
```

Both paths honor `MOOD_HOME`.

## Adapters

One file per recognized agent environment under `src/adapters/` —
`claude.js`, `codex.js`, `cursor.js`, and `generic.js`. An adapter is a
pure description: who the agent is and how to recognize a local
installation. Unknown agents register through the generic adapter, so
any AI system can become a MOOD contributor.

## Usage

```js
import { detectAgents, initConnector, registerAgent } from '@mood/connector';

const detected = detectAgents();                    // [{ key, name, type, detected, sources }]
const identity = initConnector();                   // { created, connectorId, ... }
const agent = registerAgent({ agent: 'claude-code' }); // { agentId: 'agent:mood:...', ... }
```

License: AGPL-3.0
