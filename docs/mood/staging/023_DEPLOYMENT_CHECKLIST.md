# 023 — Deployment Checklist

**Date:** 2026-08-30

## Pre-Deploy

- [ ] 022 STAGING_SECURITY_GATE reviewed
- [ ] Maintainer has accepted CONDITIONAL status (or mandated closure)
- [ ] Branch: `codex/mood-staging-023` (or equivalent)
- [ ] Working tree clean
- [ ] All 011-022 deliverables present in branch
- [ ] No uncommitted secrets

## Build

- [ ] `MOOD_ENV=staging`
- [ ] `MOOD_LAUNCH_STATE=staging`
- [ ] `DATABASE_URL` points to staging DB
- [ ] `SESSION_SECRET` is staging-specific (NOT production)
- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds
- [ ] No new env vars required that are not in `.env.example`

## Database

- [ ] Staging DB is separate from production
- [ ] Schema migrations applied (additive only)
- [ ] Seed data loaded (synthetic)
- [ ] No production data imported

## Deploy

- [ ] Deploy to staging URL (NOT production)
- [ ] Verify HTTPS
- [ ] Verify environment banner present
- [ ] Verify `meta robots: noindex, nofollow`

## Smoke Tests

- [ ] `curl https://staging.<domain>/api/health` → 200
- [ ] `curl https://staging.<domain>/api/security/status` → 200
- [ ] `curl https://staging.<domain>/api/protocol/treasury/status` → 200
- [ ] `curl https://staging.<domain>/api/network/overview` → 200

## E2E

- [ ] Run `npx playwright test e2e/staging/`
- [ ] All 6 spec files pass
- [ ] Capture exit code (must be 0)

## Token Regression

- [ ] Run site-wide phrase scan
- [ ] 0 matches for forbidden phrases

## Security Headers

- [ ] Verify CSP, HSTS, X-Content-Type-Options, Referrer-Policy
- [ ] (If not yet configured: document as open finding for 023 acceptance)

## Rollback

- [ ] Previous known-good commit recorded
- [ ] Rollback command documented in `023_ROLLBACK_PLAN.md`
- [ ] DB migration compatibility verified

## Promotion Decision

- [ ] All items above checked
- [ ] Issue register reviewed
- [ ] Maintainer approves promotion
- [ ] Mark `023_PUBLIC_STAGING_PASS` / `PARTIAL` / `BLOCKED`

## Reference

- `023_DEPLOYMENT_PLAN.md`
- `023_ENVIRONMENT.md`
- `023_PUBLIC_EVIDENCE.md`
- `023_ISSUE_REGISTER.md`