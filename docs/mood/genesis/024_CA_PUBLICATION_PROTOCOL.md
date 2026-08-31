# 024 — CA Publication Protocol

**Date:** 2026-08-30

## Sequence

```text
1. Deploy via Flap
   ↓
2. Verify source on bscscan
   ↓
3. Independent second check (NOT same person who deployed)
   ↓
4. Record deployment tx (hash, block, timestamp)
   ↓
5. Maintainer approval (recorded)
   ↓
6. Update Canon
   ↓
7. Publish CA on public surfaces
   ↓
8. Update /token, /transparency, /security
```

Before this sequence completes:

```text
NO OFFICIAL FUTURE CA
NO CLAIMED CONTRACT ADDRESS
NO LIVE TRADING CTA
```

## Verification Steps

### Step 1: Deploy via Flap

```text
- Execute per 024_CONTRACT_DEPLOYMENT_PLAN.md
- Capture: deployment_tx_hash, block_number, deployment_account, timestamp
```

### Step 2: Source Verification on bscscan

```text
- Submit Flap-generated source code
- Match against deployed bytecode
- Obtain verified-source badge
- Capture: bscscan_verification_link
```

### Step 3: Independent Second Check

```text
- Maintainer A deploys
- Maintainer B (or external auditor) verifies
- Both sign off
- If A == B (single operator), document single-operator check explicitly
```

### Step 4: Record Deployment

```text
- Add entry to docs/mood/genesis/deployments/YYYY-MM-DD.json
- Include: contract_address, deployment_tx_hash, block_number, source_hash
- Optional: truncated/hashed deployer address
```

### Step 5: Maintainer Approval

```text
- Maintainer explicitly approves "publish Official CA"
- Recorded in maintainer-decision-log
- Timestamp + rationale
```

### Step 6: Update Canon

```text
- Update docs/canon/CURRENT_CANON.md (or analogous)
- Record tokenomics freeze
- Add entry to docs/canon/CANON_CHANGELOG.md
```

### Step 7: Publish CA

```text
- Update apps/web/lib/mood-token.ts with verified contract_address
- Update apps/web/lib/treasury/model.ts distributorAddresses[]
- Update explorer URLs
- Update any external docs
```

### Step 8: Update Portal

```text
- /token page: populate "Official Contract" section
- /transparency page: show tokenomics
- /security page: update launch status
- Staging banner: removed (per 023 framework)
```

## Pre-Publication Discipline

024 freezes:

```text
NO publication of CA before Step 5.
NO marketing copy referencing CA before Step 7.
NO API responses with CA before Step 7.
```

024 forbids:

```text
- Publishing CA before verification
- Speculating CA in commits / config / docs
- Showing placeholder addresses as "Official"
- Social media announcements before publication protocol completes
```

## What If Verification Fails

If bscscan verification fails:

```text
1. Do NOT publish CA.
2. Do NOT claim contract is live.
3. Document the failure.
4. Return to 024 for refreeze.
5. If contract bug found: emergency pause (per 022_INCIDENT_RESPONSE.md).
```

## Reference

- `024_CONTRACT_DEPLOYMENT_PLAN.md`
- `024_FLAP_INTEGRATION_REVIEW.md`
- `024_PUBLIC_DISCLOSURE.md`