# MOOD Genesis verification record

This directory is the public, independently reproducible record of MOOD's first
Genesis state verification.

- Genesis ID: `MOOD_GENESIS_73EB762BAB1243BA`
- SHA-256: `73eb762bab1243ba58c3cf38580a6b56a94cbfc010541ec1bc7f75245b35919d`
- Recorded: `2026-09-02T14:07:50.613Z`
- Scope: five canonical JSON records listed in `genesis-hash.txt`

Verify from the repository root:

```bash
node genesis/scripts/verify-genesis.js
```

The verifier normalizes JSON files to the CRLF line endings used when the first
record was generated, while retaining the original LF-delimited file separator.
This makes the historical hash reproducible across operating systems.

This verification proves that the published files reproduce the recorded hash.
It is an off-chain integrity record, not a claim of blockchain anchoring,
third-party notarization, token activation, or production protocol deployment.
