# HANDOFF — PACKAGE 025 TOKEN ACTIVATION

024 has prepared the Genesis Readiness Review framework. 025 Token Activation is the actual deployment + launch execution phase.

---

## 1. Readiness

- **024 status:** `024_GENESIS_NOT_READY`
- **Reason:** Gate 0 (023 PARTIAL) + multiple Launch Checklist levels UNFROZEN/PENDING
- **024 freezes:** framework + non-action policies only
- **024 unfrozen:** Tokenomics parameters, distribution, owner model, LP seed

025 may proceed ONLY when:

```text
1. 023 staging reaches PASS or Maintainer explicitly accepts PARTIAL
2. Flap live verification complete
3. All L1 Tokenomics parameters FROZEN
4. Maintainer explicit GO recorded
5. L7-L12 Launch Checklist items complete
```

---

## 2. Frozen by 024 (025 must NOT modify without returning to 024)

```text
- Chain: BSC (chain ID 56)
- Explorer: bscscan.com
- Primary platform: Flap
- mintable / burnable / upgradeable: false
- Tax (buy / sell / transfer): 0 / disabled
- Holder Reward / Liquidity % / Burn %: 0 / disabled
- Max Wallet / Max Tx: 0 / disabled
- Pending Reward ≠ automatic Token claim
- Treasury inactive
- Liquidity not provisioned
- Legacy token policy: no migration
- CA Publication Protocol: 8 steps
- Public disclosure: prepared (024_PUBLIC_DISCLOSURE.md)
- Forbidden claims documented
```

---

## 3. Unfrozen (025 must specify)

```text
- Token Name (e.g., "Moodify")
- Token Symbol (e.g., "MOOD")
- Decimals (recommend 18)
- Total Supply
- Distribution percentages (must sum to 100%)
- Vesting / lock terms (if any)
- Owner / Admin model
- LP seed source / amount
- Anti-sybil policy
- Snapshot policy (if Pending Reward mapping uses option 1 or 4)
```

---

## 4. Pre-Activation Verification Checklist

```text
[ ] 023 staging reached PASS (or PARTIAL accepted with rationale)
[ ] Flap live verification complete
   [ ] Token creation flow understood
   [ ] Contract source available
   [ ] Constructor args documented
   [ ] Deployment cost estimated
   [ ] BSC supported
   [ ] Explorer verification path identified
[ ] All L1 Tokenomics parameters FROZEN
[ ] Maintainer explicit GO recorded (timestamp + rationale)
[ ] Treasury active (with accepted MIP)
[ ] LP seed funding plan documented
[ ] Dry run complete
[ ] Source verification plan ready
```

---

## 5. Activation Steps (025)

024 documents the plan; 025 executes.

### Pre-Activation

```text
1. Verify Flap live integration
2. Maintainer explicit GO
3. All Tokenomics parameters FROZEN
4. Dry run successful
```

### Activation

```text
5. Deploy Token via Flap (chain = BSC)
6. Capture deployment_tx_hash, block_number, contract_address
7. Verify source on bscscan
8. Independent second check
9. Record deployment evidence
10. Add liquidity (if applicable; requires LP seed funding)
11. Execute CA Publication Protocol (024_CA_PUBLICATION_PROTOCOL.md)
12. Update /token, /transparency, /security pages
13. Public announcement per disclosure policy
```

### Post-Activation

```text
14. Monitor liquidity / trading
15. Incident response (per 022_INCIDENT_RESPONSE.md)
16. Future economic MIPs gated by token-launch-gated policy
```

---

## 6. Token Surfaces Still Dark

Before 025 activation, the following MUST remain hidden:

```text
- "Buy MOOD" CTA
- "Trade MOOD" CTA
- "Claim MOOD" CTA
- "Official CA" display (placeholder)
- "Live trading" indicator
- PancakeSwap / DEX live link (template URL only)
- Market cap / volume / price / holder count (no oracle)
```

Verified by 023 token regression spec `e2e/staging/05-token-regression.spec.ts`.

---

## 7. Legacy Risks

025 inherits from 022 / 023 / 024:

```text
- Single-operator custody (Treasury)
- No MFA on Maintainer
- No multi-sig on Treasury
- 023 staging PARTIAL (security gate CONDITIONAL)
- Flap platform unverified until live test
- No third-party audit
- Sandbox cannot run build/deploy
```

025 must explicitly acknowledge these risks before deployment.

---

## 8. Deployment Rollback State

```text
Previous known-good: c4893d21
Rollback: git revert <commit-sha>
DB compatibility: N/A (no schema changes)
```

025 must document its own rollback procedure before deploying.

---

## 9. Required Artifacts for 025

025 must produce and record:

```text
- deployment_tx_hash
- block_number
- deployment_timestamp
- contract_address (BEFORE publication)
- bscscan_verification_link
- source_verification_link
- constructor_args_recorded
- canonical_contract_source (Flap-generated)
- compiled_bytecode_hash
- LP tx (if applicable)
- LP lock / burn evidence (if applicable)
- Maintainer GO record
- Independent second-check record
- Public announcement record
```

---

## 10. 025 Successor (Beyond)

025 is the FINAL activation. There is NO successor package for "production" in this plan.

After 025:

```text
- Maintainer continues monitoring
- Incident response per 022
- Future governance MIPs per 020
- Future treasury actions per 021
- Future launch-gated category activation requires additional MIP
```

---

## 11. Reference

- `024_FINAL_REPORT.md`
- `024_TOKENOMICS_FREEZE.md`
- `024_CA_PUBLICATION_PROTOCOL.md`
- `docs/mood/staging/023_FINAL_REPORT.md`
- `docs/mood/security/022_FINAL_REPORT.md`
- `docs/mood/treasury/021_FINAL_REPORT.md`
- `docs/mood/governance/020_FINAL_REPORT.md`