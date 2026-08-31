# 021 — Treasury Inventory

**Date:** 2026-08-30
**Status:** Phase B Audit Complete

扫描关键词:
```
treasury, wallet, multisig, safe, finance, fund, revenue,
reward, distribution, airdrop, genesis, liquidity, tax, holder, payment
```

---

## Inventory Table

| Asset / Account | Classification | Public? | Status | Action |
|---|---|---|---|---|
| `lib/mood-treasury.ts:TREASURY_CONFIG.accounts` | Future Protocol Treasury Registry | n/a | empty | Keep empty until human approval |
| `lib/mood-treasury.ts:TREASURY_CONFIG.distributorAddresses` | Genesis Distributor (future) | n/a | empty | Package 005 deployment pending |
| `lib/mood-treasury.ts:TREASURY_CONFIG.circulatingSupply` | Methodology Status | yes | not_published | Keep not_published until approved |
| MOOD Token contract (`0x1BB3115D43E397f7bb586F090831B02cA639e73E`) | Public Token | yes | deployed | Read-only via RPC |
| `lib/mood-token.ts:MOOD_TOKEN.totalSupply` | Token config | yes | 33,000,000 | Read-only |
| Genesis distributor (contract) | Genesis airdrop distributor | planned | not_deployed | Package 005 scope |
| Founder / Team Personal Wallet | **Personal** (not Treasury) | no | unknown | NEVER mark as Treasury |
| Operations Wallet | **Operations** (not Treasury) | no | unknown | NEVER mark as Treasury |
| Test Wallet | **Test** | no | unknown | NEVER mark as Treasury |
| Legacy Token Wallet (if any) | **Legacy** | no | unknown | Audit individually; do NOT auto-promote |
| Third-party Custody | **Third-party** | depends | depends | Requires explicit classification |

---

## Classification Categories (canonical)

- **Founder / Personal Wallet** — Individual; never Treasury.
- **Operations Wallet** — Pays vendors, salaries, infra. Distinct from Treasury.
- **Test Wallet** — Sepolia / testnet / fixtures. Not Treasury.
- **Legacy Token Wallet** — Pre-Moodify governance. Audit individually.
- **Future Protocol Treasury** — Will be activated through MIP + Human approval only.
- **Third-party Custody** — CEX / custodian. Requires explicit classification per account.

---

## Honest Findings

1. **No active Protocol Treasury.** `TREASURY_CONFIG.accounts` is empty by design.
2. **No genesis distributor deployed.** `distributorAddresses: []`.
3. **No circulating supply methodology approved.** `status: "not_published"`.
4. **MOOD token contract exists on BSC** but is separate from Treasury.
5. **/transparency page exists** at `apps/web/app/transparency/page.tsx` and reads from the empty treasury config — this is the safe empty-state.
6. **021 will NOT promote any existing address to Treasury.** Only addresses explicitly classified via MIP + Human approval may be added.

---

## Required 021 Action

- Build `/treasury` as a separate route from `/transparency`.
- Honor empty / inactive state honestly.
- Do not invent balances.
- Connect real status to `/network`.
