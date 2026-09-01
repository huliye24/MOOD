<!-- pack: MOOD_Protocol_Architecture_Pack_003 | status: v0.1 conceptual | subordinate to MOOD_CANON.md -->

# MOOD Protocol Architecture v0.1

## The Operating System of the MOOD Network

MOOD Protocol defines how contribution, reputation, rights, and economic coordination operate inside the network.

MOOD is designed as a coordination protocol for AI-native innovation.

---

# 1. Protocol Overview

```
Contribution

      ↓

Proof

      ↓

Reputation

      ↓

Rights

      ↓

Settlement

      ↓

Network Growth
```

The protocol transforms human and machine activity into verifiable network value.

---

# 2. State Machine

> Detailed states are in `MOOD_STATE_MACHINE.md`.

MOOD participants move through network states:

```
Observer

   ↓

Participant

   ↓

Contributor

   ↓

Trusted Contributor

   ↓

Network Member
```

Each transition requires verifiable contribution.

> Transition conditions, evidence requirements, and on-chain hooks are
> not specified in this document.

---

# 3. Contribution Proof System

> Categories in `MOOD_CONTRIBUTION_PROOF.md`. Mechanism is planned.

Contribution Proof records valuable actions.

Possible contribution sources:

- GitHub commits
- Research outputs
- Compute execution
- Product milestones
- Community building
- Capital support

The goal is:

Not ownership first.

Contribution first.

---

# 4. Reputation Engine

> Direction in `MOOD_REPUTATION_ENGINE.md`. Formula and decay rules are
> not finalized.

Reputation represents accumulated trust.

Possible factors:

```
Reputation =

Quality

+

Consistency

+

Impact

+

Collaboration

+

Verification
```

Reputation is dynamic and evolves with continued participation.

---

# 5. Rights System

> Separation in `MOOD_RIGHTS_SYSTEM.md`. Specific grants require
> authoritative specification.

Rights are generated from reputation and contribution.

Possible rights:

- Governance participation
- Proposal creation
- Ecosystem access
- Resource priority
- Project collaboration

Rights should represent earned influence.

---

# 6. Treasury System

> Direction in `MOOD_TREASURY.md`. Activation is planned.

Treasury coordinates ecosystem resources.

Possible functions:

- Grants
- Builder incentives
- Infrastructure support
- Research funding
- Ecosystem expansion

Treasury operations should remain transparent.

> Per `MOOD_CANON.md` §12, treasury mechanics are downstream of
> meaning. No pool size, wallet address, or disbursement rule is
> asserted here.

---

# 7. Governance Process

> Lifecycle in `MOOD_GOVERNANCE_PROCESS.md`. Submission templates,
> quorum, and execution authority are planned.

Governance follows:

```
Proposal

    ↓

Discussion

    ↓

Evaluation

    ↓

Decision

    ↓

Execution

    ↓

Review
```

Governance should prioritize long-term network development.

> Per `MOOD_CANON.md` §9, AI agents and autonomous agents do not hold
> constitutional authority in MOOD governance.

---

# 8. Blockchain Relationship

Blockchain is the settlement layer.

It provides:

- Token accounting
- Transparency
- Economic coordination

Blockchain does not replace the protocol.

It supports the protocol.

> Per `MOOD_CANON.md` §12, the token is downstream of the protocol.
> No chain ID, contract address, or wallet address is asserted.
