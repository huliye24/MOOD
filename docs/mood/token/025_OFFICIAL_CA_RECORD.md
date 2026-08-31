# 025 — Official CA Record (PLACEHOLDER)

**Status:** `025_TOKEN_ACTIVATION_BLOCKED_BY_024`
**Last updated:** 2026-08-30

---

## Initial State

```text
Official MOOD Contract : NOT_YET_PUBLISHED
Candidate CA           : NONE
State                  : token-ready
```

Until a Human Signature Sheet of type "Official CA Approval" is signed, **no CA is Official**. Any CA published prematurely is a Canon violation.

---

## Candidate CA — to be filled at execution time

```text
candidate CA          : ________________________________________
chain                 : BNB Smart Chain (chain ID 56)
deployment tx         : ________________________________________
block                 : ________________________________________
deployer              : ________________________________________
timestamp UTC         : ________________________________________
source / config URL   : ________________________________________
Flap creation ID      : ________________________________________
state                 : CANDIDATE_CA  (not yet Official)
```

---

## Verification Trail

| Step | Method | Result | Evidence | Reviewer / Timestamp |
|---|---|---|---|---|
| Source verify | bscscan | _PASS/FAIL_ | _link_ | _name / time_ |
| name() | bscscan read | _value_ | _link_ | _name / time_ |
| symbol() | bscscan read | _value_ | _link_ | _name / time_ |
| decimals() | bscscan read | _value_ | _link_ | _name / time_ |
| totalSupply() | bscscan read | _value_ | _link_ | _name / time_ |
| owner() | bscscan read | _value_ | _link_ | _name / time_ |
| taxes 0 | Flap config + source | _PASS/FAIL_ | _link_ | _name / time_ |
| rewards 0 | Flap config + source | _PASS/FAIL_ | _link_ | _name / time_ |
| auto-LP 0 | Flap config + source | _PASS/FAIL_ | _link_ | _name / time_ |
| independent 2nd check | _method_ | _PASS/FAIL_ | _evidence_ | _name / time_ |

---

## Admin Finalization Trail

| Action | Pre-state | Post-state | Tx | Timestamp |
|---|---|---|---|---|
| Ownership set at deploy | _address_ | _address_ | _hash_ | _time_ |
| Multi-sig transfer (if any) | _address_ | _address_ | _hash_ | _time_ |
| Renounce (if any) | _address_ | _address(0)_ | _hash_ | _time_ |

---

## Promotion to Official CA

Preconditions (all must be YES):

- [ ] Deployment tx confirmed
- [ ] Source verified
- [ ] All on-chain reads match 024 frozen inputs
- [ ] Independent second check PASS
- [ ] Admin policy finalized
- [ ] Liquidity state known (per 024: not provisioned at launch)
- [ ] Legacy policy ready (per 024: no migration)
- [ ] Public disclosure ready
- [ ] HUMAN_GO_OFFICIAL_CA signed

If all YES, fill:

```text
OFFICIAL_CA           : ________________________________________
Canon updated         : YES  (file: docs/mood/CURRENT_CANON.md)
Canon update commit   : ________________________________________
Portal updated        : YES
Portal update commit  : ________________________________________
Activation timestamp  : ________________________________________
HUMAN_GO_OFFICIAL_CA  : ________________________________________  (signed sheet hash)
```

If any NO → STOP. Do NOT promote.

---

## Post-Promotion Audit

After Official CA is written into Canon, this file becomes the **authoritative pointer** for the Official CA. Any change to the Official CA requires a new 024 re-freeze.
