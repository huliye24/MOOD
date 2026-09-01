# MOOD Operations

**Status:** Operational Draft
**Authority:** Per [`MOOD_CANON.md`](../../MOOD_CANON.md) and [`AGENTS.md`](../../AGENTS.md)
**Version:** 0.1

---

## About This Directory

`docs/operations/` contains **repository governance and engineering norms** for the MOOD
project. These are **operational documents**, not canonical content.

Canonical content lives in:

- [`MOOD_CANON.md`](../../MOOD_CANON.md) — highest conceptual authority
- [`docs/manifesto/`](../manifesto/) — cultural foundation
- [`docs/protocol/`](../protocol/) — protocol rules
- [`docs/chronicle/`](../chronicle/) — canon amendment proposals

Operational documents (this directory) describe **how** the repository is maintained.
They do not author canonical concepts.

---

## Documents

| File | Status | Role |
|------|--------|------|
| [`repository-hygiene.md`](./repository-hygiene.md) | Operational Draft | Repository governance principles and AI agent rules |
| [`cleanup-checklist.md`](./cleanup-checklist.md) | Operational Draft | Before / After / Weekly audit checklist |

---

## Relationship To Staging Docs

[`docs/mood/staging/`](..//mood/staging/) contains numbered staging release
documents (023, 024, etc.). Those are **deployment-specific**.

`docs/operations/` contains **cross-cutting norms** that apply to every
release and every contributor. They do not replace `023_GIT_SAFETY.md`; they
complement it.

---

## Priority Order (Per AGENTS.md)

```
Current Canon > Current Implementation > Historical Records
```

This priority applies to all AI agents and contributors working in this
repository.

- **Read:** `AGENTS.md`, `docs/canon/`, `docs/current-status.md` (if exists)
- **Avoid as active context:** `archive/`, `deprecated/`, `experiments/`
- **Do not invent** permanent architecture without a canonical basis
