# 025 — Human Signature Plan (TEMPLATE)

**Status:** `025_TOKEN_ACTIVATION_BLOCKED_BY_024`
**Last updated:** 2026-08-30

---

## Purpose

Every production-chain write must be preceded by a Human Signature Sheet. The Maintainer reads it, checks it, and signs only if every field is consistent with 024 frozen inputs.

This file is the **template** for those sheets. The actual sheets are produced at execution time.

---

## Non-Negotiable Rules

1. **No AI custody of private keys.** Not in prompts, not in logs, not in files, not in screenshots.
2. **One sheet per on-chain action.** Each sheet is for one transaction.
3. **All fields must be filled or marked N/A with reason.** Blank = invalid.
4. **ABORT is always available.** If anything looks wrong, abort. No sunk-cost reasoning.
5. **Two-person rule where possible.** Single-operator custody is the **residual risk** documented in 024, not a sign-off.
6. **Never sign a transaction whose parameters differ from the sheet.** If they differ, regenerate the sheet, re-verify hashes.

---

## Template — Token Creation Signature

```text
============================================================
MOOD TOKEN 025 — HUMAN SIGNATURE SHEET — TOKEN CREATION
============================================================

Action            : Token creation via Flap
Chain             : BNB Smart Chain (chain ID 56)
To (Flap contract): __________________________________________
Value (BNB)       : 0  (token creation does not require BNB)
Token Name        : __________________________________________
Token Symbol      : __________________________________________
Decimals          : __________________________________________
Total Supply      : __________________________________________
Owner (post-deploy): ________________________________________
Method            : Flap createToken(...)
Decoded Parameters:
  name        = __________________________________________
  symbol      = __________________________________________
  decimals    = __________________________________________
  totalSupply = __________________________________________
  owner       = __________________________________________
  taxes       = 0 / disabled  (verify on Flap)
  rewards     = 0 / disabled  (verify on Flap)
  auto-LP     = 0 / disabled  (verify on Flap)

Expected Effect  : Token deployed at candidate CA; deployer is owner.
Maximum Cost     : gas estimate ____ Gwei × _____ = ____ BNB  (× 2 buffer)
Risk             : irreversible on-chain action
Rollback         : cannot reverse a token creation; only community migration if owner model allows
Frozen Input Ref : docs/mood/genesis/024_TOKENOMICS_FREEZE.md
                   sha256:  __________________________________________
                 : docs/mood/genesis/024_CHAIN_LAUNCH_POLICY.md
                   sha256:  __________________________________________
                 : docs/mood/genesis/024_ADMIN_RIGHTS_REVIEW.md
                   sha256:  __________________________________________

CHECKS
[ ] name == 024 frozen
[ ] symbol == 024 frozen
[ ] decimals == 024 frozen
[ ] totalSupply == 024 frozen
[ ] taxes == 0 / disabled
[ ] rewards == 0 / disabled
[ ] auto-LP == 0 / disabled
[ ] owner address verified
[ ] sha256 hashes match 025_FROZEN_INPUT_HASHES.md
[ ] ABORT path understood

ABORT button available : YES

Signatures
Maintainer : ______________________  Date / Time UTC : ______________
Witness    : ______________________  Date / Time UTC : ______________  (optional, recommended)

Notes:
____________________________________________________________
____________________________________________________________
============================================================
```

---

## Template — Owner / Admin Action Signature

Used for: ownership transfer, admin update, multi-sig assignment, renounce.

```text
============================================================
MOOD TOKEN 025 — HUMAN SIGNATURE SHEET — ADMIN ACTION
============================================================

Action            : ______________________________________
Chain             : BNB Smart Chain (chain ID 56)
To (Token CA)     : ______________________________________
Value (BNB)       : 0
Method            : ______________________________________
Decoded Parameters: ______________________________________
Expected Effect   : ______________________________________
Maximum Cost      : ______________________________________
Risk              : ______________________________________
Rollback          : ______________________________________
Frozen Input Ref  : 024_ADMIN_RIGHTS_REVIEW.md
                   sha256: ______________________________________

CHECKS
[ ] action matches 024 frozen admin policy
[ ] Maintainer explicitly authorized THIS action (not blanket)
[ ] target address verified independently
[ ] sha256 matches
[ ] ABORT path understood

ABORT button available : YES

Signatures
Maintainer : ______________________  Date / Time UTC : ______________
Witness    : ______________________  Date / Time UTC : ______________

Notes:
____________________________________________________________
============================================================
```

---

## Template — Liquidity Action Signature

**024 froze: liquidity not provisioned at launch.** This template is included only in case Maintainer chooses to override that freeze via a 024 re-freeze. Until then, **this sheet is not used.**

```text
============================================================
MOOD TOKEN 025 — HUMAN SIGNATURE SHEET — LIQUIDITY
============================================================

Action            : Add liquidity on PancakeSwap / 4-inch / etc.
Chain             : BNB Smart Chain (chain ID 56)
To (Router)       : ______________________________________
Value (BNB)       : ______________________________________
Token amount      : ______________________________________
Pair              : ______________________________________
LP recipient      : ______________________________________
LP lock / custody : ______________________________________
Method            : ______________________________________
Decoded Parameters: ______________________________________
Expected Effect   : LP tokens minted to recipient
Maximum Cost      : ______________________________________
Risk              : real BNB moved; irreversible if LP not locked
Rollback          : remove liquidity (slippage / tax loss)
Frozen Input Ref  : 024_LIQUIDITY_POLICY.md
                   sha256: ______________________________________

CHECKS
[ ] LP source is human-controlled (not AI / not cron)
[ ] LP recipient is multi-sig or documented custody plan
[ ] LP lock / custody is real and disclosed
[ ] No wash-trade pairing plan
[ ] sha256 matches
[ ] ABORT path understood

ABORT button available : YES

Signatures
Maintainer : ______________________  Date / Time UTC : ______________
Witness    : ______________________  Date / Time UTC : ______________

Notes:
____________________________________________________________
============================================================
```

---

## Template — Official CA Approval Signature

```text
============================================================
MOOD TOKEN 025 — HUMAN SIGNATURE SHEET — OFFICIAL CA APPROVAL
============================================================

Candidate CA       : ______________________________________
Chain              : BNB Smart Chain (chain ID 56)
Deployment tx      : ______________________________________
Block              : ______________________________________
Deployer           : ______________________________________
Source / config URL: ______________________________________
Verification link  : ______________________________________
Independent 2nd check:
  reviewer / method : ______________________________________
  timestamp         : ______________________________________
  result            : ______________________________________
  evidence          : ______________________________________

PRECONDITIONS
[ ] deployment tx confirmed
[ ] source verified (bscscan)
[ ] config matches 024 frozen inputs (name / symbol / decimals / supply / owner / taxes 0 / rewards 0 / auto-LP 0)
[ ] independent second check PASS
[ ] admin policy finalized (owner / multi-sig / renounce as decided in 024)
[ ] liquidity state known (not provisioned at launch per 024)
[ ] legacy policy ready (no migration per 024)
[ ] public disclosure ready
[ ] sha256 of all referenced 024 docs match 025_FROZEN_INPUT_HASHES.md

DECISION
HUMAN_GO_OFFICIAL_CA : YES / NO  (circle one)

If NO → STOP. Do NOT write Official CA into Canon.

Maintainer : ______________________  Date / Time UTC : ______________
Witness    : ______________________  Date / Time UTC : ______________

Notes:
____________________________________________________________
============================================================
```

---

## Audit Trail

Every signed sheet is:

- stored outside the repository (e.g., a signed PDF in the Maintainer's archive),
- referenced (not stored) in `025_FINAL_REPORT.md` by hash + timestamp + witness,
- never committed to a public repo unless explicitly redacted of any field that could leak operational detail.

---

## Stop Conditions

If a sheet is missing any field, the on-chain action is unauthorized. AI assistant **must not** advise proceeding.
