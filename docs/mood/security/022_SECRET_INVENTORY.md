# 022 — Secret Inventory

**Date:** 2026-08-30

> ⚠️ This document inventories the TYPES of secrets. It MUST NOT contain real secret values.
> If a real secret is detected in commit history or public bundles, treat as `SECURITY_BLOCKER`.

## Secret Categories

| Type | Used By | Storage Location | Rotation | Exposure Risk |
|---|---|---|---|---|
| DB connection string | Application API | env (`DATABASE_URL`) | Manual; quarterly | High if leaked |
| Session secret | Auth layer | env (`SESSION_SECRET`) | Manual; quarterly | High if leaked |
| SIWE / signature domain | Auth layer | config (code) | n/a (compile-time) | Low |
| API keys (RPC providers) | External RPC | env (`BSC_RPC_KEY`) | Per provider policy | Medium |
| AI provider keys | AI Agent tools | env (`OPENAI_API_KEY`, etc.) | Manual; quarterly | High if leaked |
| Webhook secrets | (future) integrations | env | Per provider | Medium |
| Signing secrets | Treasury execution (future) | env (HSM-backed) | Hardware ceremony | Critical |
| Admin bootstrap credentials | Maintainer | env + offline | Per Maintainer | Critical |
| Maintainer signing key | Maintainer / Treasury | Hardware wallet (future) | Hardware ceremony | Critical |
| Treasury Safe owner keys | Treasury (future) | Safe multisig | Per Safe policy | Critical |

---

## Inventory Findings (022 scan)

### Status: All Known Secrets Are Env-Backed

022 verified that the following are read from `process.env` at runtime, not hard-coded in source:

- DB credentials
- API keys (RPC, AI providers)
- Session secret
- Maintainer signing surface (none in v1; deferred)

### Status: No Hardcoded Secrets Detected in Source

Code-level scan of `apps/web/**` did not detect any hardcoded API keys, RPC secrets, or signing material.

### Status: No `process.env` References in Public API Responses

Public API routes (`/api/protocol/transparency`, `/api/protocol/treasury*`, `/api/network/*`) do not return env values.

### Status: Historical Secret Leak Check (limited)

022 was unable to perform a full git history audit in this sandboxed environment.

Recommendation for 023:

- Run `gitleaks` / `trufflehog` against the full git history.
- Document any historical leak as `SECURITY_BLOCKER` and recommend Maintainer rotation.

---

## Secret Handling Rules (Hard)

1. **NEVER commit a secret to git.**
2. **NEVER log a secret value.**
3. **NEVER echo a secret in API responses.**
4. **NEVER include a secret in client-side bundles.**
5. **Always read from env / secret manager.**
6. **Always rotate on suspected exposure.**

022 enforces rules 1–4 by static review of new code; runtime enforcement is delegated to lint + CI.

---

## Detected Historical Leaks

022 did not detect any active leaks in source code. Recommendation for 023:

- Run full git-history secret scan before staging deployment.
- If leak found: SECURITY_BLOCKER; rotation required; do NOT promote to staging.

---

## Rotation Procedures (deferred to Maintainer SOP)

For each secret type:

```text
1. Provision new secret in env / secret manager.
2. Roll out without downtime (where possible).
3. Revoke old secret.
4. Document rotation timestamp in `022_CONTROL_MATRIX.md`.
5. Add to audit log.
```

022 does NOT auto-rotate. Rotation is manual + audited.

---

## What 022 Does NOT Do

- Does NOT introduce new secrets.
- Does NOT auto-rotate existing secrets.
- Does NOT integrate with HSM / Vault / KMS.
- Does NOT provide runtime secret scanning (deferred to 023+).

These are explicit deferrals, not omissions.

---

## Reference

- `022_SYSTEM_THREAT_MODEL.md` (T12: Secret in git)
- `022_CONTROL_MATRIX.md` (control status)
- `022_INCIDENT_RESPONSE.md` (incident-time secret rotation)
