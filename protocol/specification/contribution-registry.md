# MOOD Contribution Registry Specification v0.1

## Overview

The Contribution Registry is the foundational state layer of the MOOD Network. It records and manages contributions from all participants.

## Core Purpose

> "Who contributed what?"

## Contribution Object

```json
{
  "id": "string (unique identifier)",
  "contributor": "string (wallet address or identifier)",
  "type": "ContributionType",
  "title": "string (brief title)",
  "description": "string (detailed description)",
  "evidence": ["string array (proof references)"],
  "timestamp": "ISO8601 datetime",
  "status": "ContributionStatus"
}
```

## Contribution Types

### code
Code contributions to the MOOD protocol, applications, or infrastructure.
- Examples: bug fixes, feature implementations, refactoring

### research
Research contributions including papers, analysis, and studies.
- Examples: protocol analysis, economic modeling, security audits

### documentation
Documentation contributions including guides, specs, and translations.
- Examples: API documentation, protocol specs, tutorials

### community
Community contributions including organizing, mentoring, and support.
- Examples: meetups, discussions, helping others

### infrastructure
Infrastructure contributions including nodes, tooling, and DevOps.
- Examples: node operation, CI/CD pipelines, monitoring

## Contribution Status

### created
Initial state when contribution is submitted.

### pending
Contribution is awaiting verification.

### verified
Contribution has been verified by the Proof Engine.

### recorded
Contribution is permanently recorded in the registry.

### rewarded
Contribution has been rewarded (future phase).

## State Machine

```
Created → Pending → Verified → Recorded → Rewarded
  ↑          ↓
  └──────────┘ (rejected)
```

v0.1 implements: `Created → Pending → Verified`

## API Endpoints

### POST /api/contributions
Create a new contribution record.

**Request:**
```json
{
  "type": "code",
  "title": "Created Proof Engine",
  "description": "Implemented proof verification module",
  "evidence": ["github_commit_hash"]
}
```

**Response:**
```json
{
  "id": "contribution_001",
  "status": "created"
}
```

### GET /api/contributions/:id
Retrieve a contribution by ID.

**Response:**
```json
{
  "id": "contribution_001",
  "contributor": "0x123...",
  "type": "code",
  "title": "Created Proof Engine",
  "description": "Implemented proof verification module",
  "evidence": ["github_commit_hash"],
  "timestamp": "2026-09-02T12:00:00Z",
  "status": "pending"
}
```

### GET /api/contributors/:address
Retrieve contributor profile and contribution history.

**Response:**
```json
{
  "id": "contributor_001",
  "wallet_address": "0x123...",
  "name": "Anonymous",
  "total_contributions": 5,
  "reputation_score": 100
}
```

### GET /api/contributions
List all contributions with optional filters.

**Query Parameters:**
- `type`: Filter by contribution type
- `status`: Filter by status
- `limit`: Results limit
- `offset`: Results offset

## Validation Rules

1. `type` must be one of: code, research, documentation, community, infrastructure
2. `title` is required, max 200 characters
3. `description` is optional, max 2000 characters
4. `evidence` is optional array of proof references

## Version

```
MOOD Contribution Registry v0.1.0
Genesis Phase
```
