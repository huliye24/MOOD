# 021 — Account Classification

**Date:** 2026-08-30

## Classification Model

```ts
type TreasuryAccountType =
  | "protocol"      // Core protocol-controlled funds
  | "operations"    // Day-to-day operational expenses (infra, vendors, salaries)
  | "grants"        // Grants / ecosystem support
  | "liquidity"     // DEX LP positions (launch-gated)
  | "rewards"       // Holder rewards (launch-gated)
  | "reserve"       // Long-term strategic reserve
  | "legacy";       // Pre-governance wallets, audited individually

type TreasuryAccountStatus =
  | "inactive"      // Not yet activated
  | "observed"      // Candidate; not yet authorized
  | "policy-ready"  // Policy & controls in place; awaiting human activation
  | "active"        // Authorized Treasury
  | "paused"        // Temporarily suspended
  | "retired";      // Permanently decommissioned

type ControlModel = "EOA" | "Safe" | "Multisig" | "Contract" | "Unknown";

interface TreasuryAccount {
  id: string;
  name: string;
  type: TreasuryAccountType;
  chain?: string;
  address?: string;
  status: TreasuryAccountStatus;
  public: boolean;
  controlModel?: ControlModel;
  authorityPolicy?: string;   // MIP reference
  createdAt: string;
  updatedAt: string;
}
```

---

## Default Status

```text
inactive
```

Until a Governance Maintainer explicitly activates an account via accepted MIP + human approval, the account MUST remain `inactive` or `observed` (if a candidate address is being monitored).

---

## Classification Decision Tree

```text
Is the address already used in production?
├── Yes → Is it Founder/Personal?
│        ├── Yes → NEVER mark as Treasury. Label "personal".
│        └── No  → Is it Operations?
│                 ├── Yes → Operations (separate from Treasury).
│                 └── No  → Is it Test?
│                          ├── Yes → Test (separate).
│                          └── No  → Audit; classify carefully.
│                                  ├── Pre-governance → legacy
│                                  └── Third-party custody → third-party
└── No  → Is there an explicit MIP + Human approval?
         ├── Yes → Activate per MIP scope.
         └── No  → status = "observed" (candidate).
                  NOT "active" until approval.
```

---

## Hard Rules

- No personal wallet may be promoted to Treasury.
- No test address may be promoted to Treasury.
- No legacy address may be auto-promoted.
- No address may be classified based on chat / informal context.
- Any activation must cite an MIP or human approval record.

---

## Display in Public

| Status | Display |
|---|---|
| `inactive` | Hidden from public |
| `observed` | Shown with "Candidate (not active Treasury)" warning |
| `policy-ready` | Shown with "Awaiting activation" |
| `active` | Fully displayed with chain, address, explorer link |
| `paused` | Shown with reason |
| `retired` | Shown with retirement timestamp |
