# 022 — Git Safety

**Date:** 2026-8-30

## Branch Strategy

```text
Base:    codex/mood-nodes-019-archived
Branch:  codex/mood-security-022 (recommended)
Worktree: independent
```

## Touched Surfaces (022)

```text
apps/web/app/security/                          NEW
apps/web/app/api/security/                      NEW
docs/mood/security/                             NEW
apps/web/lib/treasury/model.ts                  NO CHANGE
apps/web/app/network/page.tsx                   NO CHANGE (treasury section was 021)
```

022 only ADDS files. No existing routes / configs / schemas modified.

## Forbidden Operations

- `git reset --hard`
- `git clean -fd`
- `git push --force`
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
[022-security] <description>

- bullet
- bullet
```

## Rollback

022 only adds files; rollback is straightforward:

```bash
git revert <commit-sha>
# OR
rm -rf apps/web/app/security apps/web/app/api/security docs/mood/security
```

No data migration; no schema impact.

## Schema Impact

022 does NOT modify `apps/web/db/schema.ts`. No DB migration.

## Secrets

022 introduces NO secrets. No env vars. No API keys.

022 explicitly inventories existing secrets; does NOT rotate.
