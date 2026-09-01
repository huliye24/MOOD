# MOOD Repository Cleanup Checklist

**Status:** Operational Draft
**Source:** [`archive/staging-origin-20260901/MOOD_Repository_Hygiene_Pack_001/`](../../../archive/staging-origin-20260901/MOOD_Repository_Hygiene_Pack_001/MOOD_Repository_Hygiene_Pack_001/cleanup/checklist.md)
**Authority:** Per [`repository-hygiene.md`](./repository-hygiene.md)
**Version:** 0.1

---

Use this checklist before and after coding sessions, and during weekly audits.

---

## Before Coding

- [ ] Run `git status` — confirm clean working state before starting
- [ ] Read current Canon (`MOOD_CANON.md`, relevant sections)
- [ ] Confirm task scope against `AGENTS.md` authority rules
- [ ] Identify whether the task requires a canonical document or is purely operational

---

## After Coding

- [ ] Remove temporary files (`*.tmp`, `*.log`, `*.bak`)
- [ ] Check for large files (`> 5 MB`) not tracked in `.gitignore`
- [ ] Update documentation if the task changed behavior
- [ ] Run `git status` — verify only intended files are changed
- [ ] Commit with a descriptive message following the convention in
      [`docs/mood/staging/023_GIT_SAFETY.md`](..//mood/staging/023_GIT_SAFETY.md):
      `[<staging-id>] <description>` with bullet points

---

## Weekly Audit

Review the repository for:

- [ ] **Duplicated documents** — multiple files describing the same concept
- [ ] **Outdated architecture** — references to features or systems that no longer exist
- [ ] **Unused assets** — images, data files, or configs not referenced anywhere
- [ ] **Unnecessary dependencies** — packages in `package.json` not imported by any module
- [ ] **Orphaned branches** — branches with no open PR and no recent activity
- [ ] **Archive eligibility** — completed staging docs, old experiments, or
        deprecated designs that should move to `archive/`

---

## Notes

- Archive, do not delete. Historical content is a record.
- If in doubt about whether something belongs in the repository, check
  [`repository-hygiene.md`](./repository-hygiene.md) §1 (Single Source of Truth).
- AI agents should run `git status` at the start of every session and
  confirm the working state before making changes.
