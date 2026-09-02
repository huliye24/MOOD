# MOOD Proof Engine

## Overview

The Proof Engine is the verification layer of the MOOD Network. It validates that contributions are genuine and creates cryptographic proofs.

## Core Philosophy

MOOD uses **Proof of Contribution** — value comes from verifiable contributions, not from stake or authority.

## Architecture

```
Contribution
      ↓
Evidence Collection
      ↓
Verification Engine
      ↓
Proof Object
      ↓
Reputation (next phase)
```

## Components

### Schemas (`schemas/`)
- `proof.schema.json` — Proof object structure
- `evidence.schema.json` — Evidence object structure

### Verifiers (`verifier/`)
- `github-verifier.ts` — GitHub commit verification
- `hash-verifier.ts` — File hash verification
- `timestamp-verifier.ts` — Timestamp verification

### Generator (`generator/`)
- `proof-generator.ts` — Creates proof objects from verified evidence

## Verification Methods

### 1. GitHub Commit
Verifies code contributions via GitHub commit hash.

### 2. File Hash
Verifies file integrity via SHA256 hash.

### 3. Timestamp
Records immutable timestamps for contributions.

## Proof Status

```
pending → verified → recorded
         ↓
       rejected
```

## API Endpoints

```
POST /api/proofs          - Create proof
GET  /api/proofs/:id     - Get proof
GET  /api/proofs          - List proofs
```

## Version

```
MOOD Proof Engine v0.1.0
Genesis Phase
```
