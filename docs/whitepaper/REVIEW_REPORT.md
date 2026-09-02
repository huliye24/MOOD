# MOOD Protocol Paper v0.1 - Internal Review Report

**Review status:** Accepted as a v0.1 draft after one revision round  
**Scope:** Argument, evidence, truth boundaries, citations, bilingual alignment, and output integrity

## Evidence map

| Claim family | Primary authority | Treatment in paper |
|---|---|---|
| MOOD identity and development order | `MOOD_CANON.md` | Normative repository authority |
| Current implementation status | `protocol/`, `proof-engine/`, `backend/` and executed tests | Reported as local prototype, not network |
| Peer validation and replicated state precedent | Bitcoin whitepaper and *Mastering Bitcoin* | Comparative precedent only |
| General replicated state machine precedent | Ethereum Yellow Paper | Comparative precedent only |
| Deterministic JSON | RFC 8785 | Candidate encoding basis |
| Digital signatures | RFC 8032 | Candidate cryptographic suite |
| Issuer-holder-verifier separation | W3C VC Data Model 2.0 | Conceptual comparison, no compatibility claim |
| Integrity proofs | W3C Data Integrity 1.0 | Security design precedent |
| Content addressing | IPFS paper | Object identification precedent, not consensus |

## Five-dimension review

| Dimension | Score | Finding |
|---|---:|---|
| Originality | 16/20 | Clear contribution-state framing; novelty remains conceptual until multi-node evidence exists. |
| Methodological rigor | 21/25 | State model and validation gates are explicit; formal consensus and privacy models remain open. |
| Evidence sufficiency | 20/25 | Primary standards and repository evidence support the design; no live-network measurements exist. |
| Argument coherence | 14/15 | Canon, protocol, verification, replication and settlement are cleanly separated. |
| Writing quality | 14/15 | Technical register is consistent and promotional claims are constrained. |
| **Total** | **85/100** | **Accept as Draft v0.1** |

## Revision performed

- Recast Proof of Contribution as an evidence-decision framework, not a consensus claim.
- Replaced an Ethereum-only settlement assertion with a chain-neutral settlement interface.
- Added an explicit current-implementation audit and network-readiness gate.
- Separated actor, agent, node, reputation, rights and token authority.
- Added security threats, limitations, data availability, ethics, CRediT, funding, conflict and AI disclosure statements.
- Used deterministic, source-backed diagrams rather than decorative concept art.

## Known limitations

The paper is an engineering design proposal, not an empirical evaluation. It does not establish Sybil resistance, permissionless Byzantine consensus, privacy-preserving proofs, economic sustainability, or a live decentralized network. These are deliberately preserved as open requirements.

## Citation audit

- In-text citations present: `[1]` through `[8]`.
- Reference entries present: `[1]` through `[8]` in both manuscripts.
- DOI-bearing sources include DOI values.
- All external citations resolve to primary papers, standards, RFCs, or the referenced open book repository.
- No fabricated empirical measurements or deployment claims were identified.

