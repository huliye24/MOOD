# AGENTS.md — MOOD Repository AI Rules

---

## Project Identity

MOOD is an open protocol for contribution verification, reputation formation and decentralized coordination.

---

## Directory Rules

```
protocol/
├── architecture/      # System design and architecture specs
├── specification/     # Protocol rule specifications
├── state-machine/     # State transition definitions
└── economics/         # Economic model definitions

contracts/
├── registry/         # Contribution registry contracts
├── proof/            # Proof verification contracts
└── reputation/       # Reputation contracts

backend/
├── api/              # API endpoints
├── database/         # Database schemas and migrations
└── services/         # Backend services

frontend/
├── explorer/         # Network explorer interface
└── portal/          # User portal interface

proof-engine/
├── verifier/         # Contribution verification logic
├── schemas/          # Proof schemas
└── tests/           # Verification tests

reputation-engine/
├── scoring/          # Reputation scoring logic
├── rules/            # Scoring rules
└── tests/           # Reputation tests

genesis/
├── genesis.json      # Initial network state
├── contributors.json # Genesis contributors
└── genesis-state.md  # Genesis state documentation

docs/
├── whitepaper/       # Technical whitepaper
├── manifesto/       # MOODISM philosophy
└── research/        # Research documents
```

---

## Development Principle

- Do not create features without protocol definition.
- Do not modify protocol rules without documentation.
- Every major change requires:
  1. Specification update
  2. Implementation update
  3. Test update

---

## AI Agent Behavior

Before coding:

1. Read `MOOD_CANON.md` — the authority
2. Read `MOOD_AI_COGNITIVE_MAP.md` — settled / open / forbidden snapshot
3. Read `protocol/` directory
4. Read `docs/` directory
5. Understand architecture

Rules:

- Do not create duplicate systems.
- Do not rename core concepts without approval.
- Do not re-derive a settled conclusion; check `AI_COGNITIVE_MAP.md` first.
- When a milestone is accepted/frozen/archived, update `AI_COGNITIVE_MAP.md` in the same change.

---

# Legacy Authority (see MOOD_CANON.md)

This repository is the canonical development home of **MOOD**.

## Canon authority

**`MOOD_CANON.md` at the repository root is the highest conceptual authority in this repository.** Any document, route, page, schema, code path, agent instruction, or generated artifact must defer to it.

Before changing any code, documentation, route, page, schema, contract, deployment configuration, or agent instruction in this repository, every contributor (human or AI) must:

1. Read `MOOD_CANON.md` first.
2. Identify the MOOD layer or subsystem affected.
3. Verify that the change is consistent with the Canon.
4. If the change conflicts with the Canon, return the disagreement to the Canon. The Canon is amended first; the system follows.
5. If no canonical basis exists for the change, treat the gap as a conceptual gap. Do not invent permanent architecture by default.

The Canon defines what MOOD is. The Canon does not describe code that already exists. Existing implementations have no automatic authority.

## Product identity

- Product and project name: **MOOD**
- Repository: `https://github.com/huliye24/MOOD`
- MOOD is an independent project. It is not Moodify Music, Moodify Player, or an internal Moodify subsystem.
- Do not rename MOOD to Moodify or treat the Moodify repository as the development mainline.

## Development authority

- New MOOD development happens in this repository.
- Historical `Moodify`, `moodify-*`, or `MOOD-GENESIS-*` identifiers may remain where changing them would break stored data, schemas, contracts, or compatibility. They are migration inputs, not the public product identity.
- New public copy, package names, documentation, routes, and APIs must use **MOOD** unless a compatibility boundary is explicitly documented.
- Do not copy music-processing code, private audio, secrets, generated build output, or unrelated Moodify product assets into this repository.

## Phase Zero — Worldbuilding

The current foundational phase of MOOD is **Phase Zero — Worldbuilding**.

The priority order is:

```text
WORLD
  ↓
CANON
  ↓
CULTURE
  ↓
PROTOCOL
  ↓
SOFTWARE
```

Software is replaceable. The Canon is not. During Phase Zero, code should be treated as secondary and provisional. The primary output of this phase is conceptual clarity, not production features.

Do **not** expand scope into token dashboards, staking, treasury automation, airdrops, node sale mechanics, governance automation, wallet features, or unrelated protocol features that the Canon does not authorize.

## The website is an entrance, not the world

The MOOD website must be treated as an entrance into the world, not the world itself. The current public hierarchy should move toward:

```text
MOOD
  ↓
WORLD
  ↓
MANIFESTO
  ↓
CANON
  ↓
LIBRARY
  ↓
PROTOCOL
```

The website renders Markdown. It does not invent canonical concepts. The Canon feeds the website; the website does not silently rewrite the Canon.

## Safety and truth

- Never claim a contract, treasury, node, governance action, deployment, token distribution, or production service is active without verifiable evidence.
- Preserve explicit human approval gates for signing, deployment, liquidity, treasury movement, token activation, and irreversible public actions.
- Unverified or unresolved states must remain visibly unverified or unresolved.

## Change discipline

Before changing code:

1. identify the MOOD subsystem and its authority document;
2. inspect existing tests and compatibility identifiers;
3. preserve evidence, rollback paths, and reproducibility;
4. keep the repository independent from Moodify;
5. keep the change consistent with `MOOD_CANON.md`.
