# MOOD Protocol — Pack 003

> **Pack:** MOOD_Protocol_Architecture_Pack_003
> **Status:** Worldbuilding document, v0.1, conceptual
> **Authority:** Subordinate to `MOOD_CANON.md` (§6.4 Protocol layer)
> **Scope:** Detailed protocol-layer description: participant state
> machine, contribution proof categories, reputation engine direction,
> rights separation, governance process, and treasury direction.
> **Safety:** No fake governance, voting, or token mechanics asserted.
> No on-chain, wallet, treasury balance, or distribution schedule
> claimed. All mechanism descriptions remain at the design-spec level.

---

## Files

| File | Purpose |
|---|---|
| `MOOD_PROTOCOL_ARCHITECTURE.md` | Overall protocol architecture (8 sections) |
| `MOOD_STATE_MACHINE.md` | Participant lifecycle states |
| `MOOD_CONTRIBUTION_PROOF.md` | Contribution proof categories |
| `MOOD_REPUTATION_ENGINE.md` | Reputation engine direction |
| `MOOD_RIGHTS_SYSTEM.md` | Ownership vs participation rights |
| `MOOD_GOVERNANCE_PROCESS.md` | Governance lifecycle |
| `MOOD_TREASURY.md` | Treasury pool direction |

## Relationship to `docs/architecture/`

This Pack 003 refines the protocol-layer portion of the Network
Architecture Pack 001 (`docs/architecture/02_protocol-architecture.md`
and friends). Pack 001 frames the network; Pack 003 zooms into the
protocol subsystem. Both remain subordinate to the Canon and to
`docs/constitution/`.

## Relationship to `docs/protocol/`

The existing `docs/protocol/` directory contains prior documentation
drafted at the file-root level. Pack 003 is placed here as a clearly
bounded subdirectory to:

- preserve prior protocol-layer files unchanged;
- make the Pack 003 source set explicit and reviewable as a unit;
- enable diff and audit traceability per `MOOD_CANON.md` §5.

## Status Discipline

- No live governance is asserted.
- No voting power, quorum, or proposal rules are claimed.
- No blockchain address, treasury balance, or distribution schedule
  is asserted.
- All mechanism descriptions remain at the design specification level
  pending authoritative specification with verifiable evidence.
