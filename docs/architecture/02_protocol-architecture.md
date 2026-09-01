<!-- pack: MOOD_Network_Architecture_Pack_001 | status: v0.1 conceptual | subordinate to MOOD_CANON.md -->

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

> Detailed states are defined in `03_state-machine.md`.

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

---

# 3. Contribution Proof System

> See `04_contribution-policy.md` and `05_contribution-proof.md`.

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

> See `06_reputation-engine.md`.

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

> See `07_rights-system.md`.

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

> See `10_treasury.md`.

Treasury coordinates ecosystem resources.

Possible functions:

- Grants
- Builder incentives
- Infrastructure support
- Research funding
- Ecosystem expansion

Treasury operations should remain transparent.

> Treasury deployment is planned. No wallet addresses are asserted.

---

# 7. Governance Process

> See `08_governance-model.md` and `09_governance-process.md`.

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
> No chain data is asserted here. See `docs/blockchain/bsc-integration.md`.
