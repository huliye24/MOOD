# MOOD Protocol v0.1

## Overview

MOOD Protocol is a contribution-driven network protocol for decentralized coordination.

## Core Components

### 1. Contribution Registry

Records and manages contributions from participants.

- Location: `contracts/registry/`
- Purpose: Track contributions across the network
- State: Design specification

### 2. Proof Engine

Verifies and validates contributions.

- Location: `proof-engine/`
- Components:
  - `verifier/` - Verification logic
  - `schemas/` - Proof schemas
  - `tests/` - Verification tests

### 3. Reputation Engine

Calculates and manages participant reputation.

- Location: `reputation-engine/`
- Components:
  - `scoring/` - Scoring algorithms
  - `rules/` - Scoring rules
  - `tests/` - Reputation tests

### 4. Settlement Layer

Handles value transfer and settlement.

- Location: `contracts/`
- Components:
  - `proof/` - Proof contracts
  - `reputation/` - Reputation contracts

### 5. Governance Layer

Protocol governance and upgrades.

- Location: `protocol/`
- Components:
  - `architecture/` - System design
  - `specification/` - Rule specifications
  - `state-machine/` - State transitions
  - `economics/` - Economic models

## Version

```
MOOD Protocol v0.1.0
Genesis Phase
```

## Status

Protocol specification phase. Implementation pending.

## References

- Protocol specs: `./specification/`
- Architecture docs: `./architecture/`
- State machine: `./state-machine/`
- Economics: `./economics/`
