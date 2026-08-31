# 023 — Git Safety

**Date:** 2026-8-30

## Branch Strategy

```text
Base:    codex/mood-nodes-019-archived (current main worktree branch)
Branch:  codex/mood-staging-023 (recommended)
Worktree: independent
```

## Touched Surfaces

```text
docs/mood/staging/                NEW
e2e/staging/                      NEW
apps/web/app/api/health/          NEW (health endpoint)
```

023 ONLY ADDS files; does NOT modify existing routes / schemas / configs.

## Forbidden Operations

- `git reset --hard`
- `git clean -fd`
- `git push --force` (any branch)
- Mass rebase onto shared branches
- Cherry-picking across unrelated worktrees

## Allowed Operations

- `git fetch --all --prune`
- `git status`
- `git branch --show-current`
- `git rev-parse HEAD`
- `git worktree list`
- `git add` (specific files only)
- `git commit` (with detailed message)
- `git diff` (read-only inspection)

## Commit Convention

```text
[023-staging] <description>

- bullet
- bullet
```

## Rollback

023 only adds files; rollback is straightforward:

```bash
git revert <commit-sha>
# OR
rm -rf docs/mood/staging e2e/staging apps/web/app/api/health
```

No data migration; no schema impact.

## Schema Impact

023 does NOT modify `apps/web/db/schema.ts`.

## Secrets

023 introduces NO secrets. Health endpoint reads from env but does NOT return env values.

## Reference

- `023_DEPLOYMENT_PLAN.md`
- `023_ROLLBACK_PLAN.md`