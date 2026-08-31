# 020 — AUTHORITY MODEL

来源: `web 3.0/2026.8.30/MOD_GOVERNANCE_020_MIP/MOOD_GOVERNANCE_020/AUTHORITY_MODEL.md`

## Roles

### Resident

- Authenticated contributor (via 015 Passport)
- Can submit MIP drafts
- Can signal support/oppose (informational, not binding)

### Governance Reviewer

- Designated by Maintainer
- Can move MIPs from draft → discussion → review
- Can request revision
- Cannot accept/reject own-authored MIP

### Maintainer

- Single or multi-maintainer (v1 transparent single-operator)
- Can accept/reject MIPs
- Can mark implemented (with real evidence)
- Can supersede/archive
- Can trigger emergency pause

## Governance Honesty

v1 明确标注:

> MOOD Governance v1 is process-transparent but not yet fully decentralized.

不要伪装成 DAO。

## Boundary with Canon

- MIP acceptance ≠ 自动修改 `CURRENT_CANON.md`
- Canon 变更需要单独 PR + 显式 Canon update
- Constitution amendment 走 category=governance/core，高门槛

## Token Independence

- NO token voting
- NO on-chain voting
- NO staking-to-vote
- NO balance-based authority
- future-token-vote 接口预留，默认 disabled
