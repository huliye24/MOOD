# 024 — Git Safety

**Date:** 2026-8-30

## Branch Strategy

```text
Base:    codex/mood-nodes-019-archived
Branch:  codex/mood-genesis-024 (recommended)
Worktree: independent
```

## Touched Surfaces (024)

```text
docs/mood/genesis/    NEW
```

024 ONLY ADDS files; does NOT modify existing routes / schemas / configs.

## Forbidden Operations

- `git reset --hard`
- `git clean -fd`
- `git push --force` (any branch)
- Mass rebase onto shared branches

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
[024-genesis] <description>

- bullet
- bullet
```

## Rollback

024 only adds files; rollback is straightforward:

```bash
git revert <commit-sha>
# OR
rm -rf docs/mood/genesis
```

No data migration; no schema impact.

## Schema Impact

024 does NOT modify `apps/web/db/schema.ts`. No DB migration.

## Secrets

024 introduces NO secrets. No env vars. No API keys.

024 explicitly forbids committing:
- Token official CA before verification
- Treasury private keys
- Maintainer signing keys
- Real holder lists

## Reference

- `024_FINAL_REPORT.md`
- `024_CA_PUBLICATION_PROTOCOL.md`