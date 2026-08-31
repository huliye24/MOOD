# 025 — Frozen Input Hashes (DRAFT)

**Status:** `025_TOKEN_ACTIVATION_BLOCKED_BY_024`
**Last updated:** 2026-08-30

---

## 1. Purpose

For every input that 024 froze, 025 must:

1. read the canonical source file under `docs/mood/genesis/`,
2. compute a stable content digest (sha256 over normalized UTF-8 text),
3. record it here,
4. re-verify at the moment of any production write (Phase H, K, L, M, S).

If a digest does not match at re-verification time:

```text
GENESIS_INPUT_DRIFT
→ STOP
→ return to 024
→ re-freeze
```

This file is **a template**. Real digests are filled at execution time, not now.

---

## 2. Frozen Input Inventory (per 024 Final Report §21)

| # | Input | Source file | Status at 024 close | This 025 digest |
|---|---|---|---|---|
| 1 | Token Identity (chain, mint, burn, upgrade) | `docs/mood/genesis/024_TOKENOMICS_FREEZE.md` | PARTIAL (chain FROZEN, name/symbol UNFROZEN) | _PENDING_ |
| 2 | Tokenomics (taxes, rewards, max-wallet, max-tx) | `docs/mood/genesis/024_TOKENOMICS_FREEZE.md` | FROZEN at 0 / disabled | _PENDING_ |
| 3 | Chain freeze | `docs/mood/genesis/024_CHAIN_LAUNCH_POLICY.md` | FROZEN (BSC, 56, bscscan) | _PENDING_ |
| 4 | Platform / Deployment Mechanism | `docs/mood/genesis/024_FLAP_INTEGRATION_REVIEW.md` | FROZEN (Flap) — but **mechanism details UNVERIFIED** | _PENDING_ |
| 5 | Legacy Token Policy | `docs/mood/genesis/024_LEGACY_TOKEN_POLICY.md` | FROZEN (no migration, no swap) | _PENDING_ |
| 6 | Contributor Reward Policy | `docs/mood/genesis/024_REWARD_POLICY.md` | PARTIAL — Pending Reward ≠ automatic Token claim (FROZEN); specific mapping UNFROZEN | _PENDING_ |
| 7 | Treasury Policy | `docs/mood/genesis/024_TREASURY_LIQUIDITY_POLICY.md` | FROZEN (inactive at launch) | _PENDING_ |
| 8 | Liquidity Policy | `docs/mood/genesis/024_LIQUIDITY_POLICY.md` | FROZEN (not provisioned at launch) | _PENDING_ |
| 9 | Admin Rights | `docs/mood/genesis/024_ADMIN_RIGHTS_REVIEW.md` | FROZEN (no mint / no burn / no pause / no whitelist / no LP-control); owner model UNFROZEN | _PENDING_ |
| 10 | Security Review | `docs/mood/genesis/024_SECURITY_REVIEW.md` | PENDING — P0 mitigations require live verification | _PENDING_ |
| 11 | Public Disclosure | `docs/mood/genesis/024_PUBLIC_DISCLOSURE.md` | PARTIAL | _PENDING_ |
| 12 | CA Publication Protocol | `docs/mood/genesis/024_CA_PUBLICATION_PROTOCOL.md` | FROZEN (8 steps) | _PENDING_ |
| 13 | Launch Checklist | `docs/mood/genesis/024_LAUNCH_CHECKLIST.md` | PARTIAL (L0–L12 mostly UNFROZEN) | _PENDING_ |
| 14 | Dry Run Plan | `docs/mood/genesis/024_DRY_RUN_PLAN.md` | FROZEN plan (not executed) | _PENDING_ |
| 15 | Contract Deployment Plan | `docs/mood/genesis/024_CONTRACT_DEPLOYMENT_PLAN.md` | FROZEN plan (not executed) | _PENDING_ |
| 16 | Tokenomics Template | `docs/mood/genesis/024_TOKENOMICS_TEMPLATE.md` | FROZEN schema (values UNFROZEN) | _PENDING_ |
| 17 | Git Safety | `docs/mood/genesis/024_GIT_SAFETY.md` | FROZEN (no --hard, no force, no clean) | _PENDING_ |
| 18 | Handoff | `docs/mood/genesis/024_HANDOFF_025.md` | FROZEN (this is the handoff) | _PENDING_ |

**Reminder:** "FROZEN" means the **policy / constraint** is frozen. The **value** may still be UNFROZEN until Maintainer supplies it (e.g., chain policy is FROZEN as "use BSC", but token name policy is FROZEN as "Maintainer must specify").

---

## 3. Re-verification Procedure

Before every Phase H / K / L / M / S write:

```bash
# Example: re-verify tokenomics freeze
sha256sum docs/mood/genesis/024_TOKENOMICS_FREEZE.md
# Compare to digest recorded in §2 above.
# Mismatch → STOP. Do NOT proceed to write.
```

This file **never** auto-proceeds on mismatch. The human signing step (see `025_HUMAN_SIGNATURE_PLAN.md`) is where the comparison is performed and confirmed in writing.

---

## 4. Inputs That Must Be Filled Before 025 May Proceed Past Gate 0

024 Final Report §20 listed the Maintainer decisions that block 025 launch. They are reproduced here so the human reading 025 does not have to bounce back to 024 to find them:

1. Token Name / Symbol / Total Supply.
2. Distribution percentages summing to 100%.
3. Owner model (single / multisig / renounced).
4. LP seed funding plan (human-controlled).
5. Flap live verification owner and timing.
6. Maintainer explicit GO recorded.
7. 023 staging PARTIAL → either closed, or accepted with documented residual risk.

Until all seven are answered, 025 cannot exit Gate 0.
