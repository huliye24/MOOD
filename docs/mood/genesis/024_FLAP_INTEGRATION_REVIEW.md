# 024 — Flap Integration Review

**Date:** 2026-08-30

> ⚠️ **024 cannot execute live Flap platform verification in this sandboxed session.**
> This document records what MUST be verified before 025, and freezes the **policy** of relying on Flap, NOT the **specific mechanism details** of Flap.

## Live Verification Requirement

Per 024 TASK §G:

> 024 不允许凭旧截图或记忆冻结参数。
> 必须明确：Flap config is a launch dependency, not Canon.

024 explicitly marks:

```text
REQUIRES_LIVE_PLATFORM_VERIFICATION
```

## Verification Checklist (to be completed in 025 BEFORE launch)

### Platform Identity

- [ ] Flap domain verified (canonical URL)
- [ ] Flap documentation current as of 025 date
- [ ] Flap support contact identified (in case of incident)

### Token Creation Flow

- [ ] Token creation flow on Flap matches the expected process
- [ ] Constructor args interface documented
- [ ] Deployment fee / cost model understood
- [ ] Deployment account type required

### Chain Support

- [ ] BSC (chain ID 56) supported on Flap
- [ ] BSC explorer (bscscan) integration available
- [ ] BSC RPC strategy compatible with Flap

### Tax Support

- [ ] Buy tax configurable (or not configurable)
- [ ] Sell tax configurable (or not configurable)
- [ ] Transfer tax configurable (or not configurable)
- [ ] Tax collection destination configurable

### Holder Reward Implementation

- [ ] Holder reward mechanism implemented by Flap OR
- [ ] Manual reward distribution required (custom contract)
- [ ] Reward distribution cycle / threshold understood

### Liquidity Behavior

- [ ] Initial LP provision flow documented
- [ ] LP ownership / custody model documented
- [ ] LP lock / burn policy understood
- [ ] Liquidity withdrawal / migration path understood

### Ownership / Admin

- [ ] Flap-generated contracts renounce ownership OR
- [ ] Owner / admin can be transferred OR
- [ ] Admin can be multisig
- [ ] Admin functions documented (mint / burn / blacklist / pause)

### Contract Source

- [ ] Flap-generated contract source is publicly readable
- [ ] Contract source can be independently verified
- [ ] ABI exposed / downloadable

### Trading Activation

- [ ] Trading activation mechanism (auto or manual)
- [ ] Trading activation trigger condition understood
- [ ] Anti-bot / anti-snipe measures understood

### Fees

- [ ] Flap platform fee structure understood
- [ ] Fee deduction model understood
- [ ] Hidden fees / surprises identified

### Migration Limitations

- [ ] Migration path (if Flap contract later changes) understood
- [ ] Holder protection during migration understood

### Explorer Verification

- [ ] BscScan verification process documented
- [ ] Source code submission path identified
- [ ] Verified-badge eligibility verified

## Required Outputs Before 025 Launch

025 MUST capture:

```text
- screenshot of Flap dashboard
- canonical Flap documentation URL
- contract source from Flap
- compiled bytecode (if available)
- constructor args
- deployment cost
- deployment account
- explorer link
- verified-source link
```

## Risk If Verification Fails

If any item above cannot be verified:

```text
024_GENESIS_NOT_READY
```

025 MUST return to 024 to refreeze.

## Reference

- `024_CHAIN_LAUNCH_POLICY.md`
- `024_TOKENOMICS_FREEZE.md`
- `024_CONTRACT_DEPLOYMENT_PLAN.md`