# 021 — Security Model

**Date:** 2026-08-30

## Threat Categories (must address)

1. **Private key compromise**
   - Mitigation: 021 stores NO private keys. Reads only.
2. **Signer compromise**
   - Mitigation: Single-operator custody is HONESTLY documented; multi-sig requires MIP.
3. **Wrong destination**
   - Mitigation: All transfers require MIP approval; manual verification.
4. **Address poisoning**
   - Mitigation: Public page shows explorer links; user can verify.
5. **Phishing**
   - Mitigation: Treasury routes use canonical domain; no email-driven flows.
6. **Fake token**
   - Mitigation: Only canonical MOOD token address shown; verified via config.
7. **Malicious approval**
   - Mitigation: 021 does NOT request token approvals; reads only.
8. **Unlimited allowance**
   - Mitigation: Not applicable; no allowances granted by 021.
9. **Treasury impersonation**
   - Mitigation: Accounts labeled `public: true` only after Maintainer classification.
10. **Fake transaction hash**
    - Mitigation: Public pages link to BscScan; user can verify.
11. **Price oracle manipulation**
    - Mitigation: No price-based decisions in 021; valuations are informational.
12. **Accounting mismatch**
    - Mitigation: Reconciliation policy explicitly displays discrepancies.
13. **Unauthorized role escalation**
    - Mitigation: 021 has no role hierarchy; role checks deferred to MIP.
14. **AI autonomous spend**
    - Mitigation: Hard rule — AI = observer only; no transfer authority.
15. **Emergency pause abuse**
    - Mitigation: Pauses are recorded with reason and post-hoc MIP ratification.

---

## AI Boundary (hard rule)

```text
AI Agent MAY:
  - Generate financial summaries
  - Categorize transactions
  - Reconcile balances
  - Detect anomalies
  - Generate report drafts
  - Flag missing governance references

AI Agent MUST NOT:
  - Hold private keys
  - Sign transactions
  - Auto-approve transfers
  - Auto-transfer
  - Auto-configure Token Tax
  - Auto-migrate Treasury
  - Auto-LP
```

```text
AI = observer / analyst / assistant
AI ≠ signer
```

---

## Secret Handling

- 021 does NOT store any secret in code or env.
- 021 does NOT request mnemonics, seeds, or private keys.
- 021 does NOT expose `process.env.SECRET_*` in public API.
- 021 routes do NOT log wallet addresses with sensitive context.
- All API responses are JSON; no binary blobs with embedded keys.

---

## Public API Exposure

`/api/protocol/treasury` returns ONLY:

- Account label
- Account address (if `public: true`)
- Category
- Status
- Verification state
- Last sync timestamp
- Source

It MUST NOT return:

- Internal IDs (when sensitive)
- Maintainer notes
- Pending execution drafts
- Private signer addresses
- Configuration file contents

---

## Emergency Pause

Any maintainer can trigger pause. Pause:

- Records actor + reason + timestamp.
- Disables any pending execution.
- Does NOT auto-move funds.
- Requires post-hoc MIP ratification.

Pause is recorded as an audit event.

---

## Reconciliation Mismatch Protocol

1. Display both values.
2. Mark `Mismatch` in UI.
3. Notify maintainer.
4. Do NOT auto-correct.
5. Resolution requires maintainer action + rationale record.

---

## What 021 Does NOT Enforce

- Multi-sig hardware wallet requirements.
- KYC of recipients.
- Sanctions screening of addresses.

These are deferred to 022 Security & Trust Layer.
