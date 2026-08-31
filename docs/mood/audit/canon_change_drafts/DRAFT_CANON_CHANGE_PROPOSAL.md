# CANON CHANGE PROPOSAL — DRAFT (NOT COMMITTED)

**Proposed by:** Codex (in Agent Mode)
**Proposed at:** 2026-08-30
**Status:** `DRAFT — AWAITING MAINTAINER GO`
**CANON_CHANGE:** YES

> ⚠️ 本目录所有文件为 **DRAFT**。**未写** `docs/canon/CURRENT_CANON.md` / `docs/canon/PRODUCT_BOUNDARY.md` / `docs/canon/PRODUCT_MAINLINE_INCLUSION_20260820.md` / `docs/brand/public/*` 任何文件。
> Maintainer 给出明确 GO 之前，本目录不应被视作 Canon 变更。

---

## Why（变更理由）

1. **MOOD 中文白皮书 v0.1** 已由 Maintainer 撰写完成（PDF，16 页），其内容与 Canon v1.1 精神高度一致，但**触及** Canon §3.7（站点表）、§1（对外产品身份）、PUBLIC_BRAND §7（三站表）、§9（公共语言层级）。
2. **013 IA_BLUEPRINT.md**（2026-08-30 早些时候执行）已经按 `crestwavecoin.com` 设计 IA。如果不把 `crestwavecoin.com` 写入 Canon，013 包事实上已经**预先承诺**了一个 Canon 之外的站点。
3. **代码现状**（`apps/web/app/` 多处引用 `crestwavecoin.com`）已经隐含以 `crestwavecoin.com` 为对外站点之一。
4. 不解决这些冲突，公共叙事会同时存在"两个第一身份"——违反 Canon §3.1 "一个对外产品身份"。

## Evidence（依据）

- `docs/mood/audit/CANON_ALIGNMENT_AUDIT_MOOD_WP_v0.1.md` — 完整 4 项 Conflict + 6 项 Gap 审查
- `MOOD_中文白皮书_v0.1.pdf`（16 页）— 完整阅读并对照 Canon
- `docs/canon/CURRENT_CANON.md` v1.1（2026-08-19）
- `docs/canon/PRODUCT_BOUNDARY.md` v1.1
- `docs/canon/PRODUCT_MAINLINE_INCLUSION_20260820.md`
- `docs/brand/public/PUBLIC_BRAND_CONSTITUTION.md` v0.1
- `docs/brand/public/SITE_ROLES_AND_ROUTING.md`
- `web 3.0/2026.8.30/MOOD_PORTAL_013_WORLD_PROTOCOL_PORTAL_SHELL/MOOD_PORTAL_013_SHELL/IA_BLUEPRINT.md`

## Maintainer Decisions Captured

| Decision | Choice | Date |
|---|---|---|
| C-01 `crestwavecoin.com` 角色 | **A. 接受为 Canon 正式站点** | 2026-08-30 |
| C-02 / C-03 MOOD/Moodify 层级 | **C. 二者并存分层** | 2026-08-30 |
| C-04 白皮书归属 | **Brand Public（最高品牌权威）** | 2026-08-30 |

## Affected Authority Files

| 文件 | 变更类型 | 草案路径 |
|---|---|---|
| `docs/canon/CANON_CHANGELOG.md` | append | `DRAFT_CANON_CHANGELOG_ENTRY.md` |
| `docs/canon/CURRENT_CANON.md` | modify §1 / §3.7 | `DRAFT_CURRENT_CANON_DIFF.md` |
| `docs/canon/PRODUCT_BOUNDARY.md` | modify Public Brand section | `DRAFT_PRODUCT_BOUNDARY_DIFF.md` |
| `docs/canon/PRODUCT_MAINLINE_INCLUSION_20260820.md` | modify include table | `DRAFT_PRODUCT_MAINLINE_DIFF.md` |
| `docs/brand/public/PUBLIC_BRAND_CONSTITUTION.md` | modify §2 / §7 / §9 | `DRAFT_PUBLIC_BRAND_CONSTITUTION_DIFF.md` |
| `docs/brand/public/SITE_ROLES_AND_ROUTING.md` | add §9 (MOOD Network Interface) | `DRAFT_SITE_ROLES_DIFF.md` |
| `docs/brand/public/MOOD_WHITEPAPER_v0.1.md` | new file | `DRAFT_MOOD_WHITEPAPER_v0.1.md` |
| `docs/brand/public/brand_authority.yaml` | modify machine-readable mirror | `DRAFT_BRAND_AUTHORITY_YAML_DIFF.md` |
| `docs/brand/public/README.md` | modify authority set | `DRAFT_BRAND_README_DIFF.md` |

**Total affected files: 9 (8 modify + 1 new)**

## Migration

- 步骤 1：Maintainer 审阅 9 个草案
- 步骤 2：Maintainer 签字 OK
- 步骤 3：Codex 按 diff apply 到真实文件
- 步骤 4：Canon guard (`scripts/canon_guard.py`) 跑一遍
- 步骤 5：在 `docs/brand/public/` 提交并附 `CANON_CHANGE` tag
- 步骤 6：013 IA_BLUEPRINT.md（已是 `crestwavecoin.com`）无需回溯改动——它"提前对齐了"
- 步骤 7：`apps/web/app/` 中引用 crestwavecoin.com 的代码无需回溯改动——它已经是正确域名
- 步骤 8：通知相关包（014 LIBRARY、017 NETWORK、018 AGENTS、019 NODES、020 GOVERNANCE、021 TREASURY）按新 Canon 执行

## Rollback

- 回退路径：将本 CANON_CHANGE 作为一个单元 revert（即 9 个文件 revert + CANON_CHANGELOG 删除本条）
- 由于本次变更仅修改文档权威结构，**未触及运行时**——所以不需要生产回滚步骤
- 如果白皮书 v0.1 在 apply 后已对外发布，需在公共站发布撤销说明（仍由 Maintainer 决定是否执行）

---

## Stop Conditions

- Maintainer 未给出明确 GO → **STOP**，本目录仅作草案
- Maintainer 给出"先只 apply 一部分"指令 → **PARTIAL**，只 apply 指定子集
- Maintainer 给出"撤回决策"指令 → 本目录归档为历史，不再 apply

---

## 文件清单（本目录下）

```text
DRAFT_CANON_CHANGE_PROPOSAL.md  ← (this file)
DRAFT_CANON_CHANGELOG_ENTRY.md
DRAFT_CURRENT_CANON_DIFF.md
DRAFT_PRODUCT_BOUNDARY_DIFF.md
DRAFT_PRODUCT_MAINLINE_DIFF.md
DRAFT_PUBLIC_BRAND_CONSTITUTION_DIFF.md
DRAFT_SITE_ROLES_DIFF.md
DRAFT_BRAND_README_DIFF.md
DRAFT_BRAND_AUTHORITY_YAML_DIFF.md
DRAFT_MOOD_WHITEPAPER_v0.1.md
```

每个文件以 `--- BEGIN DRAFT ---` 开头，`--- END DRAFT ---` 结尾。Maintainer 可以按顺序阅读。
