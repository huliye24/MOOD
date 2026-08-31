# 025 — Verification Checklist (TEMPLATE)

**Status:** `025_TOKEN_ACTIVATION_BLOCKED_BY_024`
**Last updated:** 2026-08-30

---

## Purpose

After deployment, verify the on-chain token matches what 024 froze. Mismatch → `POST_DEPLOYMENT_CONFIG_MISMATCH` → STOP activation.

This is a template. Real values are filled at execution time.

---

## On-chain Reads (via bscscan + RPC)

| Field | 024 Frozen Value | On-chain Value | Match? |
|---|---|---|---|
| `name()` | _from 024_ | _from bscscan_ | _YES/NO_ |
| `symbol()` | _from 024_ | _from bscscan_ | _YES/NO_ |
| `decimals()` | _from 024_ | _from bscscan_ | _YES/NO_ |
| `totalSupply()` | _from 024_ | _from bscscan_ | _YES/NO_ |
| `owner()` | _from 024_ | _from bscscan_ | _YES/NO_ |
| `balanceOf(owner)` | _N/A_ | _from bscscan_ | _N/A_ |
| Mintable? | false | _from source / bytecode_ | _YES/NO_ |
| Burnable? | false | _from source / bytecode_ | _YES/NO_ |
| Upgradeable (proxy)? | false | _from bytecode pattern check_ | _YES/NO_ |
| Buy tax | 0 | _from Flap config_ | _YES/NO_ |
| Sell tax | 0 | _from Flap config_ | _YES/NO_ |
| Transfer tax | 0 | _from Flap config_ | _YES/NO_ |
| Holder reward | 0 / disabled | _from Flap config_ | _YES/NO_ |
| Auto-LP | 0 / disabled | _from Flap config_ | _YES/NO_ |
| Blacklist | not present in v1 | _from source_ | _YES/NO_ |
| Pause | not present in v1 | _from source_ | _YES/NO_ |

Any `NO` → STOP and open an incident in `025_INCIDENT_PAUSE_PLAN.md`.

---

## Source Verification

- [ ] bscscan shows contract source (or Flap's verified-source view).
- [ ] Compiler version disclosed.
- [ ] Constructor args readable.
- [ ] No unverified proxy pattern.

---

## Independent Second Check

Maintainer chooses one of:

- [ ] Different RPC provider reads for the same fields above, results match.
- [ ] Independent script (e.g., second human + cast / web3.py) reads and compares.
- [ ] bscscan + Flap config side-by-side comparison.

Record:

```text
reviewer / method : __________________________________________
timestamp         : __________________________________________
result            : __________________________________________
evidence link     : __________________________________________
```

---

## Verification Outputs

The verified candidate CA, along with all the values above, is recorded in `025_OFFICIAL_CA_RECORD.md` with initial state `CANDIDATE_CA`. It only becomes Official after the `HUMAN_GO_OFFICIAL_CA` signature sheet is signed.
