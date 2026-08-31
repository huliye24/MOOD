# 021 — Git Safety

**Date:** 2026-08-30

## Branch Strategy

```text
Base:    codex/mood-nodes-019-archived
Branch:  codex/mood-treasury-021 (recommended)
Worktree: independent
```

## Concurrent Work Avoidance

Treasury work does NOT touch:

- `apps/web/app/network/` (017 owns)
- `apps/web/app/governance/` (020 owns)
- `apps/web/app/nodes/` (019 owns)
- `apps/web/app/transparency/` (GENESIS-007 owns — read-only reference)

Treasury work ONLY touches:

- `apps/web/app/treasury/` (NEW)
- `apps/web/app/api/protocol/treasury/` (NEW)
- `apps/web/lib/treasury/` (NEW)
- `docs/mood/treasury/` (NEW)

## Forbidden Operations

- `git reset --hard`
- `git clean -fd`
- `git push --force` (any branch)
- `git commit --amend` on shared branches
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
[021-treasury] <description>

- bullet
- bullet
```

Example:

```text
[021-treasury] Add /treasury page with inactive state

- New page at apps/web/app/treasury/page.tsx
- New API at apps/web/app/api/protocol/treasury/route.ts
- Treasury lib at apps/web/lib/treasury/model.ts
- 13 docs under docs/mood/treasury/
- Treasury defaults to inactive; no real balance
```

## Rollback

If 021 must be reverted:

```bash
git revert <commit-sha>
# OR
git checkout <previous-sha> -- apps/web/app/treasury apps/web/app/api/protocol/treasury apps/web/lib/treasury docs/mood/treasury
```

No data migration needed — 021 only ADDS files. No existing routes modified.

## Schema Impact

021 does NOT modify `apps/web/db/schema.ts`. The existing treasury config is read-only static config.

## Secrets

021 introduces NO secrets. No env vars. No private keys.
