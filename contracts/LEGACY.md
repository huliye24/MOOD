# Legacy Contract Directory

**Status:** LEGACY

**Purpose:** Historical migration input. Not current protocol authority.

---

## What This Directory Is

The `contracts/` directory contains historical smart contract artifacts from the earliest MOOD conceptual phase.

These files describe what MOOD **might have been** if implemented as a blockchain, before the protocol was redesigned around:
- Protocol Object envelope (not chain transactions)
- Contribution Proof (not contract verification)
- Local Node Runtime (not on-chain execution)

---

## What This Directory Is NOT

This directory is **NOT**:

- Current protocol authority
- An active implementation surface
- A valid integration target for new development
- A standing alternative to the frozen packages

---

## Rules

1. **Do not extend** this directory with new contracts or schemas.
2. **Do not treat** any file in this directory as active protocol code.
3. **Do not import** from this directory into the active implementation packages.
4. **Do not reference** these contracts in new specifications.
5. **Do not migrate** these contracts to the current packages without an explicit ADR.

---

## Migration Path

If a future design requires on-chain settlement (e.g., a settlement layer), it must:

1. Be designed as a new alpha version (e.g., Alpha 003-Settlement)
2. Receive an ADR documenting why settlement is needed
3. Be implemented as new packages, not as extensions of these files
4. Reference the settled `protocol-object` and `identity` packages as authority

These legacy contracts are **inspiration input**, not **architecture foundation**.

---

## Active Equivalent

The current protocol implementation lives in:

- `packages/protocol-object/` (FROZEN)
- `packages/contribution-proof/` (FROZEN)
- `packages/identity/` (FROZEN)

---

## Authority

This marker is maintained by the AI Navigation Layer (`.ai/`) and reflects the consensus position of:

- ADR-001 (Protocol Object freeze)
- ADR-005-alpha002b-freeze (Identity Runtime freeze)
- `.ai/ARCHITECTURE_INDEX.md` (current layer model)

---

*This directory is preserved for historical context only. It is not a development surface.*
