# MOOD Network v0.1 Architecture

## System Flow

```
User
  ↓
Contribution
  ↓
Proof
  ↓
Reputation
  ↓
Settlement
  ↓
Network State
```

## Layer Descriptions

### User Layer
Entry point for participants. Users submit contributions and interact with the network.

### Contribution Layer
Records and registers contributions from users, AI agents, and nodes.

- **Location**: `contracts/registry/`
- **Purpose**: Track all network contributions

### Proof Layer
Verifies and validates contributions against defined schemas.

- **Location**: `proof-engine/`
- **Components**: Verifier, Schemas, Tests

### Reputation Layer
Calculates reputation scores based on verified contributions.

- **Location**: `reputation-engine/`
- **Components**: Scoring, Rules, Tests

### Settlement Layer
Executes value transfer and reputation updates.

- **Location**: `contracts/`
- **Components**: Proof contracts, Reputation contracts

### Network State
The aggregate state of all participants, reputation, and contributions.

- **Location**: `genesis/`
- **Components**: Genesis state, Contributors, Initial configuration

## Component Architecture

```
protocol/
├── architecture/      # System design
├── specification/     # Protocol rules
├── state-machine/     # State transitions
└── economics/         # Economic model

contracts/
├── registry/         # Contribution storage
├── proof/            # Proof verification
└── reputation/       # Reputation management

backend/
├── api/              # REST/GraphQL endpoints
├── database/         # Data persistence
└── services/         # Business logic

frontend/
├── explorer/         # Network explorer
└── portal/          # User dashboard

proof-engine/
├── verifier/         # Verification logic
├── schemas/          # Proof formats
└── tests/           # Verification tests

reputation-engine/
├── scoring/          # Score calculation
├── rules/            # Scoring rules
└── tests/           # Reputation tests

genesis/
├── genesis.json      # Initial state
├── contributors.json # Genesis participants
└── genesis-state.md  # State documentation
```

## Version

```
MOOD Network v0.1.0
Genesis Phase
Pack 001
```

## Status

Repository architecture initialized. Protocol specification in progress.
