# MOOD Reputation Engine

## Overview

The Reputation Engine is the value evaluation layer of the MOOD Network. It calculates and tracks the reputation of contributors based on their verified contributions.

## Core Philosophy

> A participant's standing in the network comes from long-term verifiable contributions.

## Architecture

```
Contribution Registry
        ↓
Proof Engine
        ↓
Reputation Engine
        ↓
Reputation Score
        ↓
Network Identity
```

## Score Calculation

```
Contribution Value = Type Weight × Proof Quality × Impact Factor
```

## Contribution Weights

| Type | Weight | Examples |
|------|--------|----------|
| Protocol | 10 | Architecture, Specification, Core Design |
| Code | 8 | Smart Contract, Backend, AI Module |
| Infrastructure | 7 | Node, Deployment, Hosting |
| Research | 6 | Paper, Algorithm, Analysis |
| Community | 4 | Event, Community, Education |
| Documentation | 3 | Translation, Tutorial, Explanation |

## Proof Quality

| Verification | Quality |
|--------------|---------|
| Core Protocol Verification | 1.0 |
| Manual Review | 0.9 |
| GitHub Commit | 0.8 |
| Auto Verification | 0.7 |
| Self-Claimed | 0.5 |

## Reputation Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| Genesis | 0-49 | Early contributors |
| Builder | 50-199 | Active builders |
| Core Contributor | 200-999 | Core contributors |
| Guardian | 1000+ | Long-term maintainers |

**Note:** v0.1 levels are identity only, not governance rights.

## Components

### Scoring (`scoring/`)
- `score-calculator.ts` - Score calculation logic
- `weights.ts` - Contribution weights configuration

### Rules (`rules/`)
- `reputation-rules.md` - Reputation level definitions
- `contribution-weight.md` - Contribution weight rules

### Models (`models/`)
- `reputation.schema.json` - Reputation data model

### API (`api/`)
- `reputation-api.ts` - Reputation REST API

## API Endpoints

```
GET /api/reputation/:address   - Get reputation
POST /api/reputation/update    - Update reputation
GET /api/reputation/leaderboard - Get top contributors
```

## Version

```
MOOD Reputation Engine v0.1.0
Genesis Phase
```
