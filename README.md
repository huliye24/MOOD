# MOOD

MOOD is MOOD — an independent project with its own repository, product identity, protocol code, web application, documentation, and release history.

This repository is the new development mainline. New MOOD work must not be developed in the Moodify repository.

MOOD is an open coordination protocol and digital world for:

- Humans
- AI Agents
- Organizations
- Capital
- Network Resources

Core idea:

> Company owns resources.
>
> Protocol coordinates resources.

MOOD is a coordination protocol, not an investment platform. Capital is one protocol module, and organizations remain network nodes rather than being replaced by the protocol.

## Repository layout

- `apps/web` — MOOD web application, protocol surfaces, APIs, contracts, and tests
- `protocol` — protocol schemas, policies, examples, and validation tests
- `docs/mood` — governance, security, treasury, staging, genesis, and audit records
- `docs/protocol` — foundational protocol modules and protocol/token reference documents
- `e2e/staging` — public staging end-to-end journeys

## Local development

Requirements: Node.js 22.13 or newer.

```bash
cd apps/web
npm ci
npm test
```

For local development:

```bash
cd apps/web
npm run dev
```

## Separation from Moodify

The initial import was extracted from work previously mixed into the Moodify repository. Compatibility identifiers containing `moodify` may still exist in database schema names, environment variables, historical task records, and protocol artifacts. They do not define this project's identity and should be migrated deliberately, with compatibility and rollback considered.

Moodify music-processing code, private audio, generated output, and unrelated product assets are outside this repository's boundary.

## Status and safety

Documentation may describe proposed or staged capabilities. A proposal is not proof of deployment. Contract, treasury, node, governance, distribution, and production claims require verifiable runtime or on-chain evidence and any documented human approval.
