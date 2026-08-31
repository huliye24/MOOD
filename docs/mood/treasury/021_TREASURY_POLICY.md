# 021 — Treasury Policy

**Date:** 2026-08-30

## Purpose

Treasury serves the protocol's long-term operation and ecosystem health. It is NOT a personal withdrawal account, NOT an investor payout mechanism, and NOT a discretionary fund.

The Treasury exists to:

- Fund approved protocol development
- Fund security work and audits
- Fund research aligned with Moodify's mission
- Fund operations (infra, tooling, services)
- Fund grants and ecosystem support (per MIP-approved policy)

The Treasury does NOT exist to:

- Distribute founder/team discretionary cash
- Pay personal expenses
- Speculate on tokens
- Reward token holders (until launch-gated)
- Provide LP (until launch-gated)
- Auto-distribute via cron/agent

---

## Allowed Uses (each requires Policy OR MIP OR Emergency Action)

1. **Protocol Development**
   - Approved engineering work on Moodify core systems.
2. **Security**
   - Audits, bug bounties, threat-modeling, incident response.
3. **Research**
   - Moodify-aligned research (audio engineering, Ear internal systems).
4. **Operations**
   - Approved infrastructure, tooling, vendor services.
5. **Grants**
   - MIP-approved grant programs.
6. **Reserve Maintenance**
   - Asset preservation activities (no trading).

---

## Disallowed Uses (hard block)

- Unrecorded personal spending.
- Affiliate transfers without governance basis.
- Speculative trading.
- AI auto-transfer of funds.
- Hidden spending.
- Permanent funding arrangements that bypass governance.
- Token tax configuration by AI.
- Liquidity Provision by AI.
- Holder Rewards distribution before launch gate.

---

## Approval Authority

Every Treasury execution must be backed by one of:

```text
1. Policy      → Standing policy for routine expenses (infra, security retainer).
2. MIP         → Specific accepted MIP for non-routine spend.
3. Emergency   → Documented emergency action, with post-hoc MIP ratification.
```

No execution without one of the three.

---

## v1 Signer Model

```text
Proposer:    Governance Maintainer or designated Resident
Approver:    Governance Maintainer
Executor:    Governance Maintainer (single operator in v1, transparent)
Pauser:      Governance Maintainer (emergency)
Auditor:     Governance Maintainer + external audit (when scheduled)
```

Single-operator custody is HONESTLY documented as a risk. v1 does NOT pretend to be multisig.

Future Multisig (e.g., Safe) activation requires:

- Accepted MIP with category=treasury
- Human approval recorded
- Migration plan + rollback documented

---

## Activation State Transitions

```text
inactive  → observed       (Maintainer flags a candidate)
observed  → policy-ready   (Policy + controls are in place)
policy-ready → active      (MIP + Human Approval)
active    → paused         (Security incident or governance action)
paused    → active         (Restoration after review)
active    → retired        (Permanent decommission)
```

Transitions are audited; transitions to `active` MUST cite an MIP reference.

---

## What 021 Explicitly Does NOT Do

- Create auto-transfer cron jobs.
- Allow AI agents to sign transactions.
- Allow AI agents to approve allocations.
- Configure Token Tax.
- Move Treasury to a new Safe without an MIP.
- Display balances that haven't been verified on-chain.

---

## Reference

- MIP category: `treasury`, `economics`, `token`
- See `docs/mood/governance/020_AUTHORITY_MODEL.md`
- See `020_FINAL_REPORT.md` §16 Handoff to 021
