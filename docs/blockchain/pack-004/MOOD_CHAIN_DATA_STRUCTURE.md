<!-- pack: MOOD_Blockchain_Integration_Architecture_Pack_004 | status: v0.1 conceptual | subordinate to MOOD_CANON.md -->

# MOOD Chain Data Structure

Possible blockchain records:

- token information
- treasury transactions
- reward distribution
- governance actions

Off-chain systems maintain:

- detailed contribution history
- project information
- reputation data

Hybrid architecture is preferred.

---

> **No schema, table, event signature, ABI, or storage layout is
> asserted in this Pack.** The on-chain vs off-chain split is
> described as a direction; the proof pipeline itself remains planned
> and is not yet specified.
>
> Per `MOOD_CANON.md` §Safety, any production schema or contract
> requires a specification, test plan, audit, and explicit human
> approval before deployment. Per Canon §12, on-chain records that
> drive economic distribution are downstream of meaning.

## Hybrid Direction

- Off-chain systems hold rich, mutable contribution context.
- On-chain systems hold minimal, append-only settlement facts.
- A bridge layer (planned) connects the two with verifiable proofs.
- The bridge design is not finalized here.