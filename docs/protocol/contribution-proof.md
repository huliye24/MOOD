# Contribution Proof

**Status:** Alpha 001 — implemented ([`packages/contribution-proof`](../../packages/contribution-proof))

**Authority:** Downstream of [`MOOD_CANON.md`](../../MOOD_CANON.md) and
[`contribution.md`](./contribution.md)

MOOD recognizes value through contribution.

Future reputation comes from demonstrated creation, not only credentials.

## Why contribution proof exists

Before any reputation system, any reward, any economy, one question has
to be answered first: **this work happened — can we prove it?**

If contribution cannot be recognized, nothing downstream can be built
honestly. A reputation score over unverifiable events is fiction; a
reward over unverifiable events is arbitrary; a governance vote weighted
by unverifiable contribution is capture. So the first protocol object is
not a token — it is a proof:

> A ContributionProof attests exactly one thing: **the contribution
> event existed and was not modified after recording.**

No more, no less. It does not say the work was good, that the actor
deserves a reward, or that any score should change. It says the event
happened and still says what it said. Everything else — reputation,
rights, settlement — is future policy built *on top of* that fact, each
requiring its own rules (see [`contribution.md`](./contribution.md)).

This is the EVIDENCE and VERIFICATION rungs of the contribution
lifecycle, given a working local implementation.

## Architecture

```text
  人 Human ────────┐
  AI Agent ────────┼──▶ ContributionEvent ──▶ ContributionProof ──▶ MOOD Node ──▶ MOOD Network
  Organization ────┘    (what happened)       (SHA-256: it was      (stores)      (verifies)
                          who · what · when     not modified)
                          through what
```

- **Actors** — humans, AI Agents, and organizations act. Each gets a
  deterministic protocol ID (`human:mood:…`, `agent:mood:…`,
  `org:mood:…`); registered connector agents carry their registered
  identity, so the record says *which* Claude Code, through *which*
  connector, on *which* node.
- **ContributionEvent** — the record of one act of work.
- **ContributionProof** — the hash that binds the record to its content.
- **MOOD Node** — stores both under `~/.mood/contributions/` (node-local
  in this alpha; the protocol object stream comes later).
- **MOOD Network** — any third party holding the files recomputes the
  same hash. Verification needs no trust in the node.

## The two objects

**ContributionEvent v0.1** — exactly these keys, nothing else:

```json
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
    "node": "mood:node:3feb3570…"
  }
}
```

- `actor.type` ∈ `human | ai_agent | organization`
- `action.type` is a stable snake_case verb (`code_change`, `review`,
  `research`, …) — an open vocabulary, not an enum of merit
- `timestamp` is strictly UTC ISO 8601 (`Z`)
- **Never present:** passwords, API keys, private files, private data —
  the validator rejects credential-shaped content at creation *and* at
  verification

**ContributionProof v0.1** — exactly these keys:

```json
{
  "proofId": "proof:mood:8dc2002102c050adb2fb3675",
  "eventId": "event:mood:c2307ceaa3259a8f56aac3fd",
  "eventHash": "sha256:5da66d0c407652fdc73d6e46cd93609b28bc428c748ea1c20e3ab8ce48bb08df",
  "createdAt": "2026-09-03T11:09:08.545Z",
  "algorithm": "SHA-256",
  "verified": true
}
```

IDs are content-derived, not counters: `event:mood:…` is the SHA-256 of
the event's own content (without the id), `proof:mood:…` the SHA-256 of
`{eventId, eventHash, createdAt}`. The same content always produces the
same identity — on any node, in any order, forever.

## The algorithm

1. **Canonicalize** the event: recursively sorted keys, no whitespace,
   array order preserved.
2. **Hash** the canonical form with SHA-256 → `sha256:<64 hex>`.
3. **Bind** the hash into the proof object together with the event ID
   and creation time.

Determinism is the contract:

- same event (any key order, any machine) → **same hash**
- one changed character — a description edited, a timestamp moved, an
  actor swapped — → **different hash**
- a third party holding the two files recomputes and compares. Match:
  the event was not modified. Mismatch: it was. There is nothing else
  to trust.

## Verification surfaces

| Surface | Command / Route | Answers |
|---|---|---|
| CLI | `mood contribution verify [id]` | recompute every stored hash; exit 1 on failure |
| API | `GET /contributions` | the records this node holds |
| API | `POST /contributions/verify` | verify a submitted proof against the stored event |
| Library | `@mood/contribution-proof` | `validateProof(proof, event)` → `{valid, errors}` |

## What a proof is not

- **Not a reward.** No token, no payout — Phase Zero is unchanged.
- **Not a reputation score.** Reputation requires its own policy,
  evidence, and verification rules; a proof is only the input.
- **Not financial accounting.** Nothing here is a ledger.
- **Not consensus.** This layer never touches protocol consensus,
  snapshots, or the genesis block. Node-local today; when proofs enter
  the protocol object stream, they enter as data validated by this
  package — not by this package writing there.

## Alpha scope

- Storage is node-local (`~/.mood/contributions/`); network propagation
  is future work.
- One hash algorithm: SHA-256. More algorithms can be added behind the
  `algorithm` field; they cannot silently replace it.
- The trigger is a command (`mood contribution create`). Automatic
  session detection by AI engines is future work — and will only ever
  call the same layer shown here.

---

*Reference: [`packages/contribution-proof`](../../packages/contribution-proof) ·
[`docs/agent/contribution-demo.md`](../agent/contribution-demo.md) ·
[`docs/protocol/contribution.md`](./contribution.md) ·
[`docs/agent/connector.md`](../agent/connector.md)*
