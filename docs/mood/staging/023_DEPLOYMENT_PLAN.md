# 023 — Deployment Plan

**Date:** 2026-08-30

## Deployment Target Selection

### Available Targets (per audit)

| Target | Status | Notes |
|---|---|---|
| Vercel | Possible | Next.js native; minimal infra change |
| Cloudflare Pages | Possible | Static + Workers; may need adapter |
| Existing VPS / Docker | Existing | Production infrastructure present; minimal disruption |

**Selected:** Existing infrastructure (no cloud migration for 023).

Rationale: 022 explicitly says "do NOT change cloud architecture for 023". Use existing web deployment script.

### Region / Runtime

- Existing: VPS-based (LA + Hangzhou)
- Staging mirrors one of these regions with a separate DB and env flag

### Database

- Staging DB: separate SQLite file (`staging.db`) OR separate D1 binding
- No production DB writes
- Schema migrations applied identically (no destructive changes)

### Public URL

Recommended staging subdomains:

```text
staging.<existing-domain>
test.<existing-domain>
```

Existing canonical domain (per `apps/web/app/globals.css` and brand docs):

- rongjingmusic.com (Product)
- rongjingwenchuan.com (Company)
- .xyz (transition)

Staging should use a sub-domain that is NOT the canonical production domain.

### Secrets Source

- All secrets via env vars
- Staging env file is SEPARATE from production env file
- No real production secrets in staging

### Migration Strategy

- Staging runs schema migrations identical to production
- Migrations are additive only (no destructive changes for 023)
- Migration ID recorded in deployment log

### Rollback Strategy

- Previous known-good commit recorded in deployment log
- Rollback command documented in `023_ROLLBACK_PLAN.md`
- DB migration compatibility verified before deploy

---

## Deployment Sequence (recommended)

```text
1. Verify Gate 0 status from 022
2. Maintainer accepts CONDITIONAL or mandates closure of SG5/SG6/SG7
3. git tag staging-candidate-<sha>
4. Build with staging env vars
5. Apply migrations to staging DB
6. Deploy to staging URL
7. Run smoke tests
8. Run E2E journeys
9. Run failure cases
10. Run token regression scan
11. Record public evidence
12. Mark 023_PUBLIC_STAGING_PASS / PARTIAL / BLOCKED
```

---

## Build Configuration

```bash
# Install
npm install

# Build with staging env
MOOD_ENV=staging \
MOOD_LAUNCH_STATE=staging \
npm run build

# Output
.next/
```

---

## Smoke Test Command

```bash
# After deploy, run
curl -sI https://staging.<domain>/ | head -5
curl -s https://staging.<domain>/api/security/status | jq .
curl -s https://staging.<domain>/api/protocol/treasury/status | jq .
curl -s https://staging.<domain>/api/network/overview | jq .
```

Expected:
- HTTP 200
- staging environment marker
- no production data leakage

---

## Reference

- `023_ENVIRONMENT.md`
- `023_E2E_JOURNEYS.md`
- `023_ROLLBACK_PLAN.md`