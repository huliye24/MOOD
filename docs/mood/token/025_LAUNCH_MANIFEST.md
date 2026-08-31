# 025 — Launch Manifest (DRAFT / SCAFFOLD)

**Status:** `025_TOKEN_ACTIVATION_BLOCKED_BY_024`
**Last updated:** 2026-08-30
**Scope of this file:** Template / placeholder. No value here is canonical until 024 reaches READY and Maintainer signs each section.

---

## 0. Gate-0 Read

This file is created under 025 but **025 is BLOCKED at Gate 0**:

```text
024 Final State : 024_GENESIS_NOT_READY
Gate 0 rule     : "024 ≠ READY → STOP → BLOCKED_BY_MOOD_GENESIS_024"
This file       : SCAFFOLD ONLY (no field may be filled without 024 → READY + Maintainer GO)
```

Anything written here is **a placeholder for the human who will actually execute the launch**, not an authorization.

---

## 1. Target (to be filled by Maintainer at execution time)

| Field | Value | Source | Status |
|---|---|---|---|
| Chain | BNB Smart Chain | 024_FROZEN | FROZEN |
| Chain ID | 56 | 024_FROZEN | FROZEN |
| RPC endpoint | _PENDING_ | Maintainer | UNFROZEN |
| Explorer | bscscan.com | 024_FROZEN | FROZEN |
| Primary platform | Flap | 024_FROZEN | FROZEN |
| Secondary venue (if any) | _PENDING_ | Maintainer | UNFROZEN |
| Deployer account type | _PENDING_ (EOA / multisig) | Maintainer | UNFROZEN |
| Treasury account | _PENDING_ | 024 policy | UNFROZEN |
| Liquidity account | _PENDING_ | 024 policy | UNFROZEN |
| Public domain | _PENDING_ | Maintainer | UNFROZEN |
| Current commit SHA | _PENDING_ | this repo | UNFROZEN |

---

## 2. Token Identity (BLOCKED on 024 UNFROZEN parameters)

| Field | Value | Source | Status |
|---|---|---|---|
| Name | _PENDING_ | 024 | **UNFROZEN** |
| Symbol | _PENDING_ | 024 | **UNFROZEN** |
| Decimals | _PENDING_ | 024 | **UNFROZEN** |
| Total supply | _PENDING_ | 024 | **UNFROZEN** |
| Mintable | false | 024_FROZEN | FROZEN |
| Burnable | false | 024_FROZEN | FROZEN |
| Upgradeable | false | 024_FROZEN | FROZEN |

Per 024:
> Name / Symbol / Decimals / Total Supply are **UNFROZEN pending 025**.
> 025 is forbidden to silently freeze them.
> **These require Maintainer explicit decision recorded in 024.**

---

## 3. Economics (all FROZEN at 0 per 024)

| Parameter | Value | Status |
|---|---|---|
| Buy Tax | 0 / disabled | FROZEN |
| Sell Tax | 0 / disabled | FROZEN |
| Transfer Tax | 0 / disabled | FROZEN |
| Holder Reward | 0 / disabled | FROZEN |
| Liquidity % | 0 / disabled | FROZEN |
| Burn % | 0 / disabled | FROZEN |
| Max Wallet | 0 / disabled | FROZEN |
| Max Tx | 0 / disabled | FROZEN |

This means the Flap configuration we will use **must not impose any tax / reward / auto-LP behavior** that contradicts the frozen "0 / disabled" policy. If Flap's default mechanism forces any of these, we **must not use that mode** — Maintainer selects "vanilla" Flap path.

---

## 4. Distribution (BLOCKED on 024)

| Bucket | % | Lock / Vesting | Status |
|---|---|---|---|
| Total | _PENDING_ | — | UNFROZEN |

024 Final Report requires:
> **Distribution percentages (must sum to 100%)** be specified before 025 launch.

This file does **not** fill that. The bucket rows above exist only so the human execution step has a place to write the answer.

---

## 5. Owner / Admin (BLOCKED on 024)

| Field | Decision | Status |
|---|---|---|
| Owner model | _PENDING_ (single / multisig / renounced) | UNFROZEN |
| Mint authority | n/a (mint = false) | FROZEN |
| Burn authority | n/a (burn = false) | FROZEN |
| Tax update | n/a (tax = 0) | FROZEN |
| Blacklist | n/a (no whitelist in v1) | FROZEN |
| Pause | n/a (no pause in v1) | FROZEN |
| Ownership transfer policy | _PENDING_ | UNFROZEN |

024 acknowledges:
> **Single-operator custody acknowledged; no MFA on Maintainer; no multi-sig.**
> 024 lists this under "Legacy Risks" — it is not a sign-off, it is a disclosure.

---

## 6. Execution Phases (mapping to 025 TASK.md)

| 025 Phase | This scaffold | Real execution |
|---|---|---|
| Phase A Repository Preflight | not done | Maintainer |
| Phase B Launch Manifest | this file (template) | fill at execution |
| Phase C Launch State | stays `token-ready` | unchanged until Phase T |
| Phase D Production Env | not done | Maintainer |
| Phase E Platform Final Verification | not done | Maintainer + live Flap access |
| Phase F Tx Preparation | see `025_HUMAN_SIGNATURE_PLAN.md` | Maintainer + AI assistant |
| Phase G Human Signature Sheet | template in `025_HUMAN_SIGNATURE_PLAN.md` | Maintainer signs |
| Phase H Token Deployment | BLOCKED at Gate 0 | Maintainer executes on Flap |
| Phase I Verification | BLOCKED | Maintainer |
| Phase J Independent Second Check | BLOCKED | independent reviewer |
| Phase K Admin Finalization | BLOCKED | Maintainer |
| Phase L Treasury Activation | BLOCKED | Maintainer |
| Phase M Liquidity Setup | BLOCKED | Maintainer |
| Phase N Trading Activation | BLOCKED | Maintainer |
| Phase O Legacy Token Activation | BLOCKED | Maintainer |
| Phase P Contributor Snapshot | BLOCKED | Maintainer |
| Phase Q Distribution | BLOCKED | Maintainer |
| Phase R Official CA Approval | BLOCKED | Maintainer |
| Phase S Canon Update | BLOCKED | Maintainer |
| Phase T Portal Activation | BLOCKED | Maintainer |
| Phase U Public UI Rules | documented in `025_PUBLIC_UI_RULES.md` (template) | applies at activation |
| Phase V Wallet / Passport Boundary | documented in `025_WALLET_PASSPORT_BOUNDARY.md` (template) | applies at activation |
| Phase W Reward Activation | BLOCKED | Maintainer |
| Phase X Governance Boundary | n/a (020 stays in force) | no action |
| Phase Y Post-Launch Monitoring | template in `025_POST_LAUNCH_MONITORING.md` | Maintainer runs |
| Phase Z Incident / Pause | template in `025_INCIDENT_PAUSE_PLAN.md` | Maintainer owns |
| Phase AA Public Activation Report | template in `025_PUBLIC_ACTIVATION_REPORT_TEMPLATE.md` | Maintainer fills at T+24h |
| Phase AB Final Verification | BLOCKED | depends on all above |

---

## 7. Stop Conditions

025 must **STOP** if any of the following becomes true:

```text
SC-01: 024 still NOT_READY                  → BLOCKED_BY_MOOD_GENESIS_024
SC-02: Frozen input drift vs 024            → GENESIS_INPUT_DRIFT
SC-03: Live platform config ≠ 024 policy   → PLATFORM_CONFIG_MISMATCH
SC-04: Post-deployment config mismatch      → POST_DEPLOYMENT_CONFIG_MISMATCH
SC-05: Critical security finding            → 025_TOKEN_ACTIVATION_INCIDENT
SC-06: Human signature gate skipped        → ABORT
SC-07: Private key enters AI / log / repo   → ABORT + incident disclosure
SC-08: Wash trading / fake volume plan emerges → ABORT + governance escalation
```

---

## 8. HUMAN_DECISION_REQUIRED

1. Resolve 024 to READY (or accept PARTIAL with documented rationale).
2. Provide the Name / Symbol / Decimals / Total Supply.
3. Provide the Distribution table summing to 100%.
4. Choose owner model (single / multisig / renounced).
5. Schedule and perform Flap live platform verification (Phase E).
6. Provide deployer / treasury / liquidity accounts.
7. Provide LP seed source and amount.
8. Sign the Human Signature Sheet for every production write.
