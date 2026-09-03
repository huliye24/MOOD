# MOOD Contribution Proof — Agent Demo

**How AI work becomes a verifiable protocol object.**

> Principle: **AI 创造，MOOD 记录，网络验证。**
> AI engines create. MOOD records contribution. The network verifies.

This is a real transcript. Every MOOD-side step — detection, agent
identity, event creation, proof generation, storage, verification — runs
today, exactly as shown. Exactly one step is conceptual: the automatic
trigger. Nothing here fakes external AI integration.

---

## The scenario

A developer works with Claude Code on this machine. The session ends.
The work should not vanish into a chat log — it should become a
protocol object a network can verify.

```text
  Developer + Claude Code     the engine: real work happens
        │
        ▼
  MOOD Connector              knows WHO acted (registered agent identity)
        │
        ▼
  ContributionEvent           WHAT happened, WHO did it, WHEN, through what
        │
        ▼
  ContributionProof           SHA-256: it happened, and was not modified
        │
        ▼
  MOOD Node                   stores the record; the network verifies
```

| Step | Today (alpha 001) | Future |
|---|---|---|
| Work happens in the engine | The developer (or agent) runs one command | Session hooks trigger recording automatically |
| Connector knows the agent | `mood connector register --agent claude-code` | Engines self-register on install |
| Event created | `mood contribution create --actor claude-code` | Part of the agent's normal shutdown |
| Proof generated | Always — every event is hashed at creation | Unchanged (this is the protocol core) |
| Node stores + verifies | `~/.mood/contributions/` + `mood contribution verify` | Proofs enter the protocol object stream |

The **trigger** is conceptual; the **chain** is real. That distinction is
the honest alpha: MOOD does not pretend Claude Code called it — MOOD
proves that once a contribution is recorded, the record cannot silently
change.

---

## The transcript

Setup: the connector layer gives the agent its contribution identity
(detection is existence-only; the tools are never run or controlled):

```bash
$ mood connector init
  Connector ID:  connector:mood:df699421c88fdba9b06bc250c4e35837
  Storage:       ~/.mood/connector
  Never stored here: AI API keys, user credentials, private keys.

$ mood connector register --agent claude-code
  Claude Code
    Agent ID: agent:mood:b90d6a9094bcc2be
    Identity:  created
```

The contribution — one command, event and proof minted together:

```bash
$ mood contribution create --actor claude-code --type code_change \
                           --description "Alpha contribution"

  MOOD Contribution created.

  Event:         event:mood:c2307ceaa3259a8f56aac3fd
  Agent:         Claude Code
  Type:          code_change
  Proof:         sha256:5da66d0c407652fdc73d6e46cd93609b28bc428c748ea1c20e3ab8ce48bb08df
  Verified:      true

  Stored locally. Not a reward, not a score — proof that work happened.

$ mood contribution list

  MOOD Contributions

  1. Agent:     Claude Code
     Type:      code_change
     Event:     event:mood:c2307ceaa3259a8f56aac3fd
     Proof:     Verified

$ mood contribution verify

  Proof verification

  1. PASS   event:mood:c2307ceaa3259a8f56aac3fd
     Hash: sha256:5da66d0c407652fdc73d6e46cd93609b28bc428c748ea1c20e3ab8ce48bb08df

  Summary: 1/1 verified

  A proof attests the event existed and was not modified after recording.
```

What the node stored — plain JSON, one file per object, greppable and
diffable by any tool:

```json
// ~/.mood/contributions/events/event-mood-c2307ceaa3259a8f56aac3fd.json
{
  "id": "event:mood:c2307ceaa3259a8f56aac3fd",
  "type": "contribution_event",
  "actor": {
    "id": "agent:mood:b90d6a9094bcc2be",
    "type": "ai_agent",
    "name": "Claude Code"
  },
  "action": {
    "type": "code_change",
    "description": "Alpha contribution"
  },
  "timestamp": "2026-09-03T11:09:08.545Z",
  "source": {
    "connector": "connector:mood:df699421c88fdba9b06bc250c4e35837",
    "node": "mood:node:3feb3570d7236f348998e4be7c6d56124b3ba6e9dd4d2119948b58544a35725d"
  }
}

// ~/.mood/contributions/proofs/proof-mood-8dc2002102c050adb2fb3675.json
{
  "proofId": "proof:mood:8dc2002102c050adb2fb3675",
  "eventId": "event:mood:c2307ceaa3259a8f56aac3fd",
  "eventHash": "sha256:5da66d0c407652fdc73d6e46cd93609b28bc428c748ea1c20e3ab8ce48bb08df",
  "createdAt": "2026-09-03T11:09:08.545Z",
  "algorithm": "SHA-256",
  "verified": true
}
```

Note `actor.id` — the agent ID the connector minted — and
`source.connector` — the connector that vouches for the provenance. The
record says not just "someone did this" but *which registered agent,
through which connector, on which node*.

---

## Tampering is detected

Change one character of the stored event — or submit an altered proof —
and the recomputed hash no longer matches:

```bash
$ curl -s -X POST http://127.0.0.1:8788/contributions/verify \
       -H "Content-Type: application/json" \
       -d '{"proofId":"proof:mood:8dc2...","eventId":"event:mood:c230...",
           "eventHash":"sha256:0000...","createdAt":"2026-09-03T11:09:08.545Z",
           "algorithm":"SHA-256","verified":true}'

{"verified":false,"errors":["event hash mismatch: proof records sha256:0000...,
  recomputed sha256:5da66d0c407652fdc73d6e46cd93609b28bc428c748ea1c20e3ab8ce48bb08df"]}
```

The same check runs locally with `mood contribution verify` — exit code 1
when anything failed, so a shell script can detect tampering without
parsing output. Agents speak HTTP to the same door:

```bash
$ curl http://127.0.0.1:8788/contributions          # the records
$ curl -X POST http://127.0.0.1:8788/contributions/verify \
       -H "Content-Type: application/json" -d '<a ContributionProof>'
```

---

## The result

```text
  AI Agent:      Claude Code
  Contribution:  code_change
  Proof:         Verified
  Network:       Ready
```

The core chain, complete for the first time:

```text
  AI Agent ──▶ MOOD Connector ──▶ Contribution Event ──▶ Proof ──▶ Node ──▶ Network
  (works)      (identifies)       (records)              (binds)   (stores) (verifies)
```

---

## What this is not

| A proof IS | A proof is NOT |
|---|---|
| Evidence an event happened and was not modified | A reward |
| Deterministic (same event → same hash, always) | A quality or reputation score |
| Verifiable by any third party holding the files | Token accounting |
| Local to this node (alpha) | Consensus (protocol consensus is untouched) |

Phase Zero holds: no token, no wallet, no mining, no staking, no
governance. Before any economy can exist, it must be built on the answer
to a prior question — **how is contribution recognized?** — and this
layer is that answer's first working form.

---

*Reference: [`packages/contribution-proof`](../../packages/contribution-proof) ·
[`docs/agent/connector.md`](./connector.md) ·
[`docs/protocol/contribution-proof.md`](../protocol/contribution-proof.md) ·
[`docs/agent/api-demo.md`](./api-demo.md)*
