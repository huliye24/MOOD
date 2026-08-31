# HANDOFF — PACKAGE 022 SECURITY & TRUST LAYER

021 has left stable treasury hooks for the Security & Trust Layer.

---

## 1. Treasury Signer / Custody Risks

### Current State

- **Single-operator custody** is HONESTLY documented at `/treasury` and in `021_TREASURY_POLICY.md`.
- No multi-sig hardware wallet is configured.
- No automated key rotation.
- No signer quorum requirement.

### Risks for 022

1. **Maintainer key compromise** → full Treasury authority.
2. **No MFA enforcement** → single-factor compromise is enough.
3. **No hardware requirement** → software keys acceptable (risk).

### Recommended 022 Work

- Document Maintainer key handling SOP.
- Enforce MFA on Maintainer-class operations.
- Define multi-sig migration path (Safe / Gnosis).
- Document key rotation procedure.

---

## 2. Wallet Auth Risks

### Current State

- `/api/protocol/treasury` is fully public.
- No authentication required to view (correct — transparency is public).
- No authentication enforced on maintainer write paths (because no write paths exist yet).

### Risks for 022

- Future maintainer routes (POST) MUST be authenticated.
- Authentication for Treasury write operations is a 022 surface.

### Recommended 022 Work

- Define Maintainer auth scheme (e.g., signed request, MFA-gated session).
- Define audit log requirements for all Maintainer-class writes.
- Define rate-limit / abuse thresholds.

---

## 3. Governance Escalation Risks

### Current State

- All Treasury changes go through MIP path.
- `020_AUTHORITY_MODEL.md` defines roles.
- 020 `HANDOFF_021.md` defines Treasury governance hooks.

### Risks for 022

1. **Maintainer capture** — single-operator risk persists.
2. **MIP tampering** — MIP database integrity needs cryptographic anchoring (long-term).
3. **Emergency pause abuse** — pause is recorded but not auto-revoked.

### Recommended 022 Work

- Multi-Maintainer consensus for Emergency Pause.
- MIP database integrity verification.
- Pause auto-expiry with re-authorization requirement.

---

## 4. Network / Admin Endpoints

### Exposed Endpoints (read-only)

```text
GET /api/protocol/treasury
GET /api/protocol/treasury/status
```

Both are public and return no sensitive data.

### Future Maintainer Endpoints (NOT YET IMPLEMENTED)

```text
POST   /api/protocol/treasury/accounts
PATCH  /api/protocol/treasury/accounts/[id]
POST   /api/protocol/treasury/accounts/[id]/pause
POST   /api/protocol/treasury/executions/propose
POST   /api/protocol/treasury/executions/[id]/approve
```

### Recommended 022 Work

- Auth scheme for future maintainer routes.
- Rate-limit / abuse protection on `/api/protocol/treasury*`.
- Audit log retention policy.
- Endpoint documentation update.

---

## 5. Public Transparency Trust Claims

### What 021 Publicly Claims

- `Treasury Status: Not Activated` (when inactive).
- `MOOD is building its treasury policy and transparency layer before activating protocol-controlled funds.`
- `No real treasury balance exists.`
- `Single-operator custody` (in Risks).
- `Circulating supply methodology not yet published.`

### Trust Boundary for 022

These claims are HONEST and VERIFIABLE. 022 should:

- Verify claims remain accurate.
- Add: signing key disclosures (when active).
- Add: incident disclosure (when triggered).
- Add: third-party audit references (when scheduled).

---

## 6. Unresolved High-Risk Controls

The following are EXPLICITLY OUT OF SCOPE for 021 and require 022:

### A. Key Management

- Hardware wallet requirement.
- Key rotation policy.
- Cold storage for inactive funds.

### B. Authentication

- MFA enforcement.
- Maintainer-class auth scheme.
- Session security.

### C. Audit

- Cryptographic anchoring of MIP / Treasury decisions.
- Third-party audit scheduling.
- Incident response plan.

### D. Monitoring

- Anomaly detection on Treasury reads.
- Treasury-specific alerts (large movements, classification changes).
- Reconciliation mismatch auto-notification.

### E. Compliance

- Sanctions screening.
- KYC requirements for recipients (if applicable).
- Jurisdiction-specific reporting.

### F. Future Token Activation

- Token Launch Gate (024) integration.
- Token Activation (025) integration.
- LP / Holder Reward / Tax safety review (future packages).

---

## 7. Files / Surfaces for 022 to Audit

### Code

```text
apps/web/lib/treasury/model.ts
apps/web/app/api/protocol/treasury/route.ts
apps/web/app/api/protocol/treasury/status/route.ts
apps/web/app/treasury/page.tsx
apps/web/app/api/network/overview/route.ts (treasury sub-metrics)
apps/web/app/network/page.tsx (treasury section)
apps/web/lib/mood-treasury.ts (existing, read-only reference)
```

### Docs

```text
docs/mood/treasury/021_*.md
docs/mood/governance/020_*.md
docs/canon/CURRENT_CANON.md
```

### DB / Config

```text
apps/web/db/schema.ts (no changes by 021)
apps/web/lib/mood-treasury.ts (existing config)
```

---

## 8. Successor Package

022 Security & Trust Layer should treat 021 outputs as the canonical baseline. Any deviation (e.g., adding Maintainer write paths, integrating a valuation oracle) must:

1. Cite this HANDOFF document.
2. Update `021_FINAL_REPORT.md` if material.
3. Follow Canon Change Rule for any Canon-level changes.
4. Use MIP path for non-routine changes.

---

## 9. Final Note

021 explicitly does NOT do:

- Auto-transfer
- AI signer
- Maintainer write paths
- Token tax configuration
- Liquidity Provision
- Holder Reward distribution
- Real cron-based execution

These are all 022+ surfaces with higher safety requirements.

021 closes with:

```text
Treasury Status: Not Activated
No real protocol-controlled funds exist.
Activation requires an accepted MIP and human approval.
```

This is HONEST, VERIFIABLE, and SAFE.
