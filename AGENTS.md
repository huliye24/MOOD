# AGENTS.md — MOOD Repository Authority

This repository is the canonical development home of **MOOD**.

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

## Safety and truth

- Never claim a contract, treasury, node, governance action, deployment, token distribution, or production service is active without verifiable evidence.
- Preserve explicit human approval gates for signing, deployment, liquidity, treasury movement, token activation, and irreversible public actions.
- Unverified or unresolved states must remain visibly unverified or unresolved.

## Change discipline

Before changing code:

1. identify the MOOD subsystem and its authority document;
2. inspect existing tests and compatibility identifiers;
3. preserve evidence, rollback paths, and reproducibility;
4. keep the repository independent from Moodify.

