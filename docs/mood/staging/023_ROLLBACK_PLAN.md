# 023 — Rollback Plan

**Date:** 2026-08-30

## Rollback Scope

023 is staging. Rollback returns the staging URL to a previous known-good state.

## Required Records Per Deploy

```text
- previous_known_good_commit:  <sha>
- deployment_id:               <id>
- migration_compatibility:     <yes/no>
- rollback_command:            <cmd>
- rollback_verified:           <yes/no>
```

## Rollback Procedure

```bash
# 1. Stop staging instance
pm stop staging-app

# 2. Revert to previous known-good commit
git checkout <previous_known_good_commit>

# 3. Re-install dependencies (if package.json changed)
npm install

# 4. Rebuild
MOOD_ENV=staging MOOD_LAUNCH_STATE=staging npm run build

# 5. Restart staging
pm start staging-app

# 6. Verify health
curl -s https://staging.<domain>/api/security/status | jq .
```

## DB Migration Compatibility

023 must NOT include destructive migrations.

If a migration is irreversible, the rollback plan MUST include a manual DB restoration step (NOT automatic).

For 023: schema-only; no data migration; rollback is commit-based.

## What 023 Does NOT Allow

- Single-shot migrations without rollback path.
- Schema changes that require production data cleanup.
- Configuration changes that bypass the staging guard.

## Reference

- `023_DEPLOYMENT_PLAN.md`
- `023_ENVIRONMENT.md`