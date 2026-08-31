# 025 — Deployment Runbook (TEMPLATE)

**Status:** `025_TOKEN_ACTIVATION_BLOCKED_BY_024`
**Last updated:** 2026-08-30

---

## Purpose

This is the step-by-step manual the Maintainer follows at execution time. **No step in this file is executed in this 025 package.** Each step is gated by a Human Signature Sheet (see `025_HUMAN_SIGNATURE_PLAN.md`).

The runbook does not change 024. It only **applies** what 024 froze.

---

## Pre-flight (Maintainer, offline)

- [ ] Confirm `docs/mood/genesis/024_FINAL_REPORT.md` reads `024_GENESIS_READY`.
- [ ] Confirm 023 staging status.
- [ ] Confirm Flap live platform verification completed and recorded.
- [ ] Confirm Maintainer has the seven decisions from 024 §20.
- [ ] Confirm Maintainer GO recorded (timestamp + scope).

If any of the above is **NO**, do not start.

---

## Step 0 — Worktree (Maintainer)

```bash
git fetch --all --prune
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git worktree list

git worktree add ../mood-token-025 -b codex/mood-token-activation-025
```

No `git reset --hard`, no `git clean`, no force push.

---

## Step 1 — Re-verify Frozen Inputs (Maintainer + assistant)

Run the hash check procedure from `025_FROZEN_INPUT_HASHES.md §3`. Record results.

---

## Step 2 — Flap Live Configuration Verification (Maintainer)

Walk through Flap's current token creation flow. Confirm **on Flap's actual UI**:

- [ ] Chain selector shows BSC.
- [ ] Tax toggles (buy / sell / transfer) match 024 policy `0 / disabled`.
- [ ] Holder reward toggle matches 024 policy `0 / disabled`.
- [ ] Auto-LP behavior matches 024 policy `0 / disabled`.
- [ ] Owner / admin surface matches 024 admin rights review.
- [ ] Source / contract visibility toggle acceptable (must allow explorer verification).
- [ ] Platform fees disclosed.
- [ ] Trading activation condition disclosed.

Any mismatch → `PLATFORM_CONFIG_MISMATCH` → STOP.

Capture screenshots, save outside the repo (Flap URLs, no secrets).

---

## Step 3 — Construct Unsigned Deployment Tx (Assistant)

The assistant prepares:

- Token creation payload (name / symbol / decimals / supply — from 024).
- Constructor args (owner / treasury / liquidity — from Maintainer decisions).
- Expected contract address computation (if Flap exposes pre-compute).
- Verification command (bscscan API call).
- Gas estimate.
- One-page summary the Maintainer can read in 60 seconds.

**Assistant does not sign anything.** No private key is requested, entered, or logged.

---

## Step 4 — Human Signature Sheet (Maintainer)

Print or render `025_HUMAN_SIGNATURE_PLAN.md` Section "Token Creation Signature". Maintainer fills:

- Action: Token creation via Flap
- Chain: BSC (56)
- To: Flap contract (from Step 2)
- Value: 0 (token creation does not require BNB)
- Token: (name / symbol from 024)
- Method: (Flap createToken function signature)
- Decoded Parameters: (from Step 3)
- Expected Effect: (token deployed, candidate CA returned)
- Maximum Cost: (gas estimate × 2 buffer)
- Risk: irreversible on-chain action
- Rollback: cannot roll back a token creation; only `renounce ownership + migrate community` style recovery, if any
- Frozen Input Reference: 024 §21 frozen list + hash from `025_FROZEN_INPUT_HASHES.md`

Sign only if all checkboxes match. `ABORT` button visible at all times.

---

## Step 5 — Execute Token Creation (Maintainer only)

Maintainer pastes / confirms the Flap creation transaction with their wallet (hardware wallet recommended).

Capture:

```text
deployment tx hash
block number
candidate contract address
deployer address
timestamp UTC
chain
Flap source / config URL
```

Record in `025_OFFICIAL_CA_RECORD.md` (initial state: `CANDIDATE_CA`, **not** Official).

---

## Step 6 — Contract Verification (Maintainer)

On bscscan:

- Verify source (or confirm Flap source-verified view).
- Read `name()`, `symbol()`, `decimals()`, `totalSupply()`, `owner()`, `balanceOf(owner)`.
- Compare against 024 frozen inputs.

Any mismatch → `POST_DEPLOYMENT_CONFIG_MISMATCH` → STOP.

Record in `025_OFFICIAL_CA_RECORD.md`.

---

## Step 7 — Independent Second Check (Independent reviewer)

Either:

- Different RPC provider reads,
- Independent script run by a second human,
- explorer + RPC dual confirmation.

Compare to Step 6. Record reviewer / method / timestamp / result / evidence in `025_OFFICIAL_CA_RECORD.md`.

---

## Step 8 — Admin Finalization (Maintainer)

Per 024 frozen admin rights:

- If owner model = single-operator: leave owner at deployer, with documented governance path to multi-sig via MIP.
- If owner model = multi-sig: transfer ownership to Safe / multi-sig via separate signed tx.
- If owner model = renounce: renounce **only** after explicit Maintainer signature on a separate sheet that lists what is being renounced (no silent renounce).

---

## Step 9 — Liquidity (Maintainer, if applicable)

**024 froze: liquidity not provisioned at launch.** So if 024 stays unchanged, this step is **skipped**. If Maintainer chose to add LP, it requires a new 024 re-freeze + a separate signature sheet (LP funds are real BNB).

---

## Step 10 — Trading Activation

024 froze: no auto-buy, no fake volume, no coordinated pump. Maintainer does not operate a bot. Trading is allowed by Flap's normal mechanism once liquidity exists (if any).

---

## Step 11 — Official CA Approval

Only after Steps 5–10 are PASS:

- Maintainer signs `HUMAN_GO_OFFICIAL_CA` on a fresh signature sheet.
- Assistant writes the Official CA into `025_OFFICIAL_CA_RECORD.md`.
- Assistant updates `docs/mood/CURRENT_CANON.md` with the Official CA.
- Assistant publishes to the public portal only after Canon update is committed.

---

## Step 12 — Post-Launch Monitoring

Switch to `025_POST_LAUNCH_MONITORING.md` and execute the T+0 / T+15m / T+1h / T+6h / T+24h checks.

---

## Stop Conditions (runbook)

- `SC-01` to `SC-08` from `025_LAUNCH_MANIFEST.md §7` apply here.
- Additional runbook-only stop: any step's checkbox → unchecked → STOP.
