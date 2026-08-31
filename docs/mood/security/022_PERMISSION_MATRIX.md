# 022 — Permission Matrix

**Date:** 2026-08-30

## Roles

```text
Visitor                  — Anonymous; read public pages and APIs
Resident                 — Authenticated via wallet signature (015)
Contributor              — Resident with ≥1 contribution submission
Reviewer                 — Designated by Maintainer; can move drafts to review
Admin                    — Backend admin; scoped to specific domains
Governance Reviewer      — Specialized Reviewer for MIPs
Maintainer               — Single operator in v1; can accept MIPs / manage system
Agent Operator           — Registers / operates AI agents
Node Operator            — Registers / operates nodes
Treasury Proposer        — Maintainer; can propose execution (NOT IMPLEMENTED in 021)
Treasury Approver        — Maintainer; can approve execution (NOT IMPLEMENTED)
Treasury Executor        — Maintainer; can mark executed (manual, off-API)
Emergency Pauser         — Maintainer; can pause subsystem
Auditor                  — Read-only access to audit logs
System Agent             — Server-side automated processes
```

---

## Actions

```text
A01  View public data
A02  Edit own profile
A03  Submit contribution
A04  Review contribution
A05  Grant reputation
A06  Register agent
A07  Activate agent
A08  Register node
A09  Activate node
A10  Create MIP
A11  Accept MIP
A12  Mark implemented
A13  Create treasury account
A14  Approve treasury action
A15  Execute treasury action
A16  Pause subsystem
A17  Trigger emergency pause
A18  Read audit log
A19  Configure system
A20  Rotate secret
```

---

## Matrix

| Action | Visitor | Resident | Contributor | Reviewer | Admin | GovRev | Maintainer | AgentOp | NodeOp | T-Proposer | T-Approver | T-Executor | E-Pauser | Auditor | SysAgent |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A01 View public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| A02 Edit own profile | ❌ | ✅ | ✅ | ✅ | own | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| A03 Submit contribution | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| A04 Review contribution | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| A05 Grant reputation | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | � | ❌ | ✅ (auto) |
| A06 Register agent | ❌ | ❌ | � | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| A07 Activate agent | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| A08 Register node | ❌ | ❌ | ❌ | � | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| A09 Activate node | ❌ | � | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| A10 Create MIP | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| A11 Accept MIP | ❌ | ❌ | ❌ | ❌ | � | own-author ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| A12 Mark implemented | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | � |
| A13 Create treasury acct | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (MIP) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| A14 Approve T action | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| A15 Execute T action | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (off-API, manual) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| A16 Pause subsystem | ❌ | ❌ | ❌ | ❌ | scoped | scoped | ✅ | � | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | � |
| A17 Emergency pause | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| A18 Read audit log | ❌ | own | own | scoped | scoped | scoped | ✅ | ❌ | own | ❌ | ❌ | own | own | ✅ | ✅ |
| A19 Configure system | ❌ | ❌ | ❌ | ❌ | scoped | scoped | ✅ | ❌ | ❌ | ❌ | ❌ | � | ❌ | ❌ | ❌ |
| A20 Rotate secret | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (manual) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Default Deny

If a role / action combination is not listed, default is **DENY**.

All enforcement MUST be server-side. Client-side role checks are NOT accepted.

---

## Author / Approver Separation (Hard Rule)

- A MIP author MUST NOT accept their own MIP (A11 = ❌ for `own-author`).
- A Treasury Proposer MUST NOT also be the Executor without a separate Approver actor.
- A Maintainer MUST NOT bypass governance to spend Treasury.

This separation is enforced by recording `actorIds[]` and rejecting self-approval in the API.

---

## AI / Agent Authority (Hard Rule)

AI / System Agent roles:

- CAN: read public data, generate summaries, classify transactions, reconcile balances
- CANNOT: hold private keys, sign transactions, approve / execute Treasury actions, configure Token Tax, configure LP, distribute Holder Rewards

```text
AI ≠ signer
AI ≠ approver
AI ≠ executor
```

Verified by absence of:
- `transfer` tool
- `sign` tool
- `approve` tool
- treasury signer key

in any agent capability surface.

---

## v1 Honest Limitations

- Single-Maintainer role → single point of failure.
- Admin and Maintainer are effectively the same role in v1.
- Reviewer designation is manual; not yet an MIP process.
- Audit log is partial; full audit trail deferred to 023+.

These limitations are documented in `022_PUBLIC_TRUST_CLAIMS.md`.

---

## Reference

- `022_TRUST_BOUNDARIES.md` (cross-layer auth context)
- `022_CONTROL_MATRIX.md` (control implementation status)
- `022_INCIDENT_RESPONSE.md` (incident-time authority)
