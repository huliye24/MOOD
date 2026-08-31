# CANON_ALIGNMENT_AUDIT — MOOD 中文白皮书 v0.1 vs Current Canon

**Auditor:** Codex (in Agent Mode)
**Date:** 2026-08-30
**Scope:**
1. MOOD / Moodify / Protocol / Token 层级对齐
2. 白皮书 WORLD 六空间与现有 IA / 014+ 包映射
3. 域名 / 站点角色对齐（crestwavecoin.com）
4. 公共语言 / 风险披露 / 安全原则合规
**Authority order used:** `AGENTS.md` → `docs/canon/*` → `docs/brand/public/PUBLIC_BRAND_CONSTITUTION.md` → verified runtime evidence → `docs/mood/*` (this folder) → whitepaper (subject of audit)
**Canon version under review:** v1.1 (2026-08-19)
**Whitepaper version under review:** v0.1 (2026.08)
**Outcome:** 4 项必须解决（CONFLICT），6 项可补（GAP），3 项一致（ALIGN）

---

## TL;DR

白皮书 v0.1 的**精神**与 Canon v1.1 高度一致（不承诺收益、身份≠钱包、贡献先于奖励、真实数据先于虚构、AI Agent 最小权限、密钥不存前端）。但有 4 处**结构性冲突**必须先解决，否则白皮书不能作为"公共权威文本"使用：

| 等级 | 问题 | 位置 | 影响 |
|---|---|---|---|
| 🔴 C-01 | 域名 `crestwavecoin.com` 不在 Canon 站点表 | 白皮书 §00/03；013 IA_BLUEPRINT.md | Canon §3.7 与白皮书互相否定 |
| 🔴 C-02 | MOOD 作为"对外产品身份" 与 Canon "Moodify 是对外产品" 层级错位 | 白皮书 §00/02/12；CURRENT_CANON §1 | 公共叙事会有两个"第一身份" |
| 🟠 C-03 | "Moodify 作为第一个 Genesis Application" 把 Moodify 从产品降级为子应用 | 白皮书 §00/02/12；CURRENT_CANON §1；PUBLIC_BRAND_CONSTITUTION §7 | 与"产品五层结构"冲突 |
| 🟠 C-04 | 白皮书未引用 Canon / 未声明 Canon 关系 | 全文档 | 它想当权威文本，但没进入权威顺序 |

**建议路径**：白皮书 v0.1 作为**白皮书文档**独立发布没问题，但要进入"权威体系"必须先做 `CANON_CHANGE = YES`——把 4 项冲突解决，并在 CANON_CHANGELOG 留痕。

---

## 1. MOOD / Moodify / Protocol / Token 层级对照

### 1.1 Canon 当前层级（截至 2026-08-19）

```
层级       内容                              来源
─────────────────────────────────────────────────────────
公共身份    Moodify Music / Moodify Player    CURRENT_CANON.md §1, PRODUCT_BOUNDARY.md
内部系统    Moodify Ear / Auditory Intelligence  INTERNAL_SYSTEMS.md §1, PUBLIC_BRAND §3 Layer 4
产品原则    Listen. Then Play.                PUBLIC_BRAND §3 Layer 2
用户动作    Play.                              PUBLIC_BRAND §3 Layer 3
品牌信念    Every voice deserves to be heard.  PUBLIC_BRAND §1, CURRENT_CANON §1
研究原点    Can machines learn to hear?        PUBLIC_BRAND §3 Layer 5
Token       不在公开品牌第一叙事              PUBLIC_BRAND §9 Tier D
站点        rongjingmusic / rongjingwenchuan / .xyz  CURRENT_CANON §3.7
```

### 1.2 白皮书 v0.1 呈现的层级

```
层级       内容                              位置
─────────────────────────────────────────────────────────
世界        MOOD = Web3 数字世界 / 协议网络     §00 Executive Summary
门户角色    crestwavecoin.com = WORLD + PROTOCOL + PORTAL  §03 Architecture
产品应用    Moodify = 第一个 Genesis Application  §00, §02, §12
协议        Moodify Protocol                   §00, §05
Token      价值结算、激励、质押、治理媒介     §09
```

### 1.3 🔴 C-02 — 公共身份错位

**Canon v1.1：** Moodify Music / Player 是对外产品身份。
**白皮书 v0.1：** MOOD 是"对外产品"（一个 Web3 数字世界），Moodify 只是其中一个 Genesis Application。

**影响：**
- 公共叙事同时存在两个"第一身份"：Moodify（Canon）vs MOOD（白皮书）
- SEO/OG/Site Title 会撞车——白皮书 §03 写 `crestwavecoin.com` = `WORLD + PROTOCOL + PORTAL`，但 Canon 写 `rongjingmusic.com` = `Product Home`
- PUBLIC_BRAND_CONSTITUTION §13 Test A（Identity）"它是否让 Moodify 更像一个明确的聆听产品，还是再次把 Moodify 分裂成多个身份"——白皮书让它分裂了

**Canon 规则引用：**
- CURRENT_CANON §3.1 "一个对外产品身份：Moodify Music / Player。Ear 不成为第二个公开产品面。"
- AGENTS.md "不创建第二个公开产品身份"

**白皮书触线条款：** 它没创造第二个产品身份，但它**降低**了 Moodify 的位置（从产品 → 子应用）。这是 Canon 的另一种"分裂"。

### 1.4 🟠 C-03 — Moodify 降级为 Genesis Application

**白皮书原文 (§00)：**
> "项目 / 定义 / MOOD：开放的 Web3 数字世界 / 协议网络。"
> "Moodify：第一个建立在协议之上的真实应用，也是网络的 Genesis Application。"

**Canon 原文 (CURRENT_CANON §1)：**
> "External Product: Moodify Music / Moodify Player"

**PUBLIC_BRAND_CONSTITUTION §7：**
> 三个站点分别是 Moodify / 荣景文川 / 过渡 Web Player。"Moodify 是公司主要公开作品"——这里 "Moodify" 指**产品**。

**冲突本质：** 白皮书把 Moodify 从"产品"降级为"应用"，并把 MOOD 升格为"产品"。这与品牌宪法的"Moodify = 主要公开作品"不一致。

**可能解决路径（3 选 1，**待 Maintainer 决策**）：**
- **A. 以白皮书为准**：升 MOOD、降 Moodify，需要 Canon 修改 §1 / §3.7 / PUBLIC_BRAND §7。这是 `CANON_CHANGE = YES`。
- **B. 以 Canon 为准**：白皮书改为"Moodify 是产品；MOOD 是社区/世界/网络的总称；Moodify 作为第一个落地应用"，白皮书仅作描述性文档而非权威。
- **C. 二者并存但分层**：MOOD = 网络层（白皮书），Moodify = 产品层（Canon），并明确"Moodify 是 MOOD 网络的第一个 Genesis Application，也是目前唯一的对外产品面"。这需要在 Canon 增补一段说明二者关系，避免读者误以为两个第一身份。

---

## 2. WORLD 六空间与现有 IA / 包映射

### 2.1 白皮书 §04 列出的六空间

| 白皮书空间 | 白皮书定义 | 与 014+ 包路径对应 | 与 013 IA_BLUEPRINT.md 对应 |
|---|---|---|---|
| Library / 图书馆 | Whitepaper、研究、协议、Tokenomics、历史版本与审计材料 | 014 LIBRARY | `/library` ✅ |
| Protocol Hall / 协议大厅 | 协议架构、Proof、MIP、治理、版本、网络规则 | 020 GOVERNANCE / 015 / 016 / 017 / 022 | `/protocol` 内部分散 |
| Builder Workshop / 建设工坊 | 开发任务、SDK、GitHub、贡献证明、开发者入口 | 016 CONTRIBUTION | `/protocol/contribution` 间接 |
| Agent Lab / Agent 实验室 | AI Agents 状态、能力、任务、贡献 | 018 AGENTS_REGISTRY | `/agents` ✅ |
| Node Station / 节点站 | 计算、验证、存储节点运行入口与状态 | 019 NODES_REGISTRY | `/nodes` ✅ |
| Moodify Gate / Moodify 入口 | 第一个协议应用 | （不在 014-021 包） | `/` (Genesis Application) |

### 2.2 013 IA_BLUEPRINT.md 已经按 `crestwavecoin.com` 设计路由

```text
crestwavecoin.com
├── /
│   ├── Hero
│   ├── World preview
│   ├── Protocol preview
│   ├── Portal preview
│   └── Moodify Genesis Application
├── /world
│   ├── Manifesto
│   ├── World Map
│   ├── Listening
│   ├── Creation
│   └── Community
├── /protocol
│   ├── Architecture
│   ├── Identity
│   ├── Contribution
│   ├── Reputation
│   ├── Agents
│   ├── Nodes
│   ├── Governance
│   ├── Security
│   └── Economics
├── /portal
│   ├── Wallet
│   ├── Resident Seed
│   ├── Contributions
│   ├── Reputation
│   └── Future Passport
├── /library      → 014
├── /network      → 017
├── /agents       → 018
├── /nodes        → 019
├── /governance   → 020
└── /treasury     → 021
```

**观察：** 013 IA 已经把 crestwavecoin.com 作为 IA 锚点，并采用了与白皮书 §03 一致的"WORLD / PROTOCOL / PORTAL"三层。这说明：
- 013 和白皮书**互相对齐**——它们是同一组人在同一时间段产出的
- 但**它们都没经过 Canon 变更流程**——Canon §3.7 仍然是 rongjingmusic / rongjingwenchuan / .xyz
- 这就形成了一个**文档内部的共识**和**Canon 表层**的不一致

### 2.3 跨包映射缺口

| 白皮书空间 | 包映射状态 | 缺口 |
|---|---|---|
| Library | ✅ 014 | — |
| Protocol Hall | ⚠️ 跨 015-020 多包拼成 | 无统一"协议大厅"入口；013 IA 把协议拆到 `/protocol/*` 是对的 |
| Builder Workshop | ⚠️ 016 CONTRIBUTION 主 | 没有专门的 SDK / GitHub 入口；Moodify 仓库 `huliye24/moodify-ai` 仍是 154 commits 未整理状态（见 CANON_CHANGELOG W01-P01 CD-X） |
| Agent Lab | ✅ 018 | — |
| Node Station | ✅ 019 | — |
| Moodify Gate | ❌ 无对应包 | "Moodify 入口"是 Moodify Music 产品本身，但作为"MOOD 网络第一个 Genesis Application"，它没有被任何包正式化为"入口路由" |

### 2.4 G-01 — Moodify Gate 没有 IA 锚点

013 IA_BLUEPRINT.md 没有 `Moodify Gate` 路由。`/` 上有一个"Moodify Genesis Application"卡片，但不是路由。

**建议：** 在 013 IA 或后续 Portal 演化中加一条：

```text
/moodify → Moodify Genesis Application（独立产品入口）
```

并明确它与 `/portal` / `/world` 的关系（独立产品 vs 网络参与面）。

### 2.5 G-02 — Builder Workshop 与 GitHub 真实状态脱节

白皮书 §04 写 "GitHub、贡献证明与开发者入口"，但 CANON_CHANGELOG W01-P01 §HUMAN_DECISION_REQUIRED 第 4 条明说：

> "GitHub main 合并策略（未合并分支 154 commits 的去向）"

这条至今未决。Builder Workshop 作为"白皮书空间"是**承诺性叙述**，但实际 GitHub 状态是**未整理**。Canon 规则 R6/R10：

> "不得声称云端能力可用，除非 ... 已验证"

白皮书没撒谎，但它许了一个承诺。如果 GitHub 整理完成之前上线 Builder Workshop 路由，会触发"未验证即宣传"风险。

### 2.6 G-03 — Protocol Hall 没有"白皮书自己的位置"

白皮书 §11 写：
> "FOUNDATION / PROTOCOL / RESEARCH & SECURITY"
> "每份关键文档至少提供 Read Online / PDF / GitHub"

但**白皮书自己**还没进入 Library。014 LIBRARY 包还没执行。Library 是白皮书的"家"，家还没建好。这是合理的"先发布后归位"——但要留痕，避免遗忘。

---

## 3. 域名 / 站点角色对齐

### 3.1 🔴 C-01 — `crestwavecoin.com` 不在 Canon

**Canon v1.1 §3.7（当前）：**
| 域名 | 角色 |
|---|---|
| rongjingmusic.com | Product Home |
| rongjingwenchuan.com | Company Home |
| rongjinwenchuan.xyz | 过渡 Web Player / 历史入口 |

**白皮书 v0.1 全文 + 013 IA_BLUEPRINT.md（事实状态）：**
- `crestwavecoin.com` 作为 Network Interface（WORLD + PROTOCOL + PORTAL）

**PUBLIC_BRAND §7 + SITE_ROLES_AND_ROUTING.md：**
- 没有 crestwavecoin.com

**事实：** 013 IA 已经按 crestwavecoin.com 设计；015-021 一些 API 路由已经在引用 crestwavecoin.com（见 `apps/web/app/`）。

**Canon 风险：**
1. **两个"Product Home"**：rongjingmusic.com（Canon）和 crestwavecoin.com（白皮书 + 013 IA）。
2. **不一致的 Title / OG**：Canon §SEO/OG §7 写"Moodify - Listen. Then Play."对应 rongjingmusic.com；白皮书 §00/03 写"Mood Network Interface"对应 crestwavecoin.com。
3. **PUBLIC_BRAND_TEST §13 Test B（10 秒理解）**：用户访问不同站点会得到不同"Moodify 是什么"的答案。

**这是 `CANON_CHANGE = YES`**——因为改变 §3.7 站点表。

### 3.2 解决路径（待 Maintainer 决策）

**A. 接受 crestwavecoin.com 为正式站点之一**
- Canon §3.7 增补一栏：`crestwavecoin.com = MOOD Network Interface (WORLD + PROTOCOL + PORTAL)`
- 修改 `PRODUCT_MAINLINE_INCLUSION_20260820.md` 加入相应路径
- 修改 PUBLIC_BRAND §7 三站表为四站表
- 修改 SITE_ROLES_AND_ROUTING.md
- CANON_CHANGELOG 记录

**B. 拒绝 crestwavecoin.com 作为 Canon 站点**
- 白皮书需要改为"以 rongjingmusic.com 为根的子路径"或"网络界面占位域名（非最终官方）"
- 013 IA_BLUEPRINT.md 改为 rongjingmusic.com 锚点
- 015-021 引用 crestwavecoin.com 的代码需要改
- CANON_CHANGELOG 记录决定

**C. 双层并存**
- 维持 rongjingmusic.com = Moodify Product Home（音乐聆听第一入口）
- 新增 crestwavecoin.com = MOOD Network Interface（Web3 网络界面第一入口）
- 明确二者单向导航关系：crestwavecoin.com → rongjingmusic.com 进入 Play；rongjingmusic.com → crestwavecoin.com 进入 Network
- 这是 `CANON_CHANGE = YES` 且更复杂，因为它需要新增 §3.7.4 + 跨站导航规则

---

## 4. 公共语言 / 风险披露 / 安全原则合规

### 4.1 ✅ 公共语言 — ALIGN

白皮书 §00 声明："本文件为协议设计与产品架构白皮书，不构成投资建议、收益承诺或任何形式的证券发行文件。" —— 与 Canon §4 / 024 §15 一致。

白皮书 §09："Token 是价值层，不是整个世界；MOOD Token 不等同于 MOOD 世界本身" —— 与 PUBLIC_BRAND §2.2 "Token 不成为公共第一叙事" 一致。

白皮书 §14 列出 7 类风险并明确"非投资建议" —— 与 Canon §4 + 024 §15 一致。

### 4.2 ✅ 安全原则 — ALIGN

白皮书 §11：
- "不在前端、仓库或自动化系统中保存私钥与助记词" — 与 025 README Rule #2、022 TRUST_BOUNDARIES 一致
- "关键合约部署、资金迁移与权限变更保留人工签名门控" — 与 025 README Rule #3 (HUMAN_SIGNATURE_REQUIRED) 一致
- "AI Agent 的权限遵循最小权限原则" — 与 PUBLIC_BRAND §6 + 022 风险模型一致

### 4.3 ✅ 身份 ≠ 钱包 — ALIGN

白皮书 §07：
> "钱包地址是坐标，Passport 才是一个人在 MOOD 世界里留下的历史。"
> "不以'持币越多身份越高'为唯一逻辑。"

—— 与 CURRENT_CANON §1 不直接相关（Canon's PLAY 优先不涉及身份模型），但与 PUBLIC_BRAND 退出"Token = 身份"原则一致。

### 4.4 G-04 — "AI Agent" 的对外可见度

白皮书 §00 把 "AI Agents" 作为公共层级之一（与 MOOD / Moodify / Token 并列）。Canon 中没有显式公共层级描述 AI Agent。

PUBLIC_BRAND §3 Layer 4 把 "Listen / Represent / Judge / Intervene / Verify / Learn" 列为内部能力，且 §9 Tier D 退出公共主叙事。AI Agent 与此**部分对齐**（Agent 是网络执行者，不是用户产品），但白皮书把 Agent 放在公共层级之一，这比 PUBLIC_BRAND 退出公共叙事的方向**更靠前**。

**建议：** 白皮书 §00 的"项目"清单里，"AI Agents"那行可以保留，但要说明"作为网络执行者，不是用户产品"，与 PUBLIC_BRAND §9 Tier C 一致。

### 4.5 G-05 — "Token Holder" 在 Network Metrics 中作为公开指标

白皮书 §13 Network Metrics 把 "Token Holders" 列为公开指标。

Canon 没有禁止公开这个数字，但有规则要求**口径明确**。白皮书 §13 自己写了"链上持币地址数，需说明统计链与快照时间"——这是合规的。

**没有冲突**，但建议在 `/network` 路由落实时附"统计快照时间 + 排除内部地址 / 锁定地址"等口径说明，避免被误读。

---

## 5. 白皮书作为权威文本的归属

### 5.1 🟠 C-04 — 白皮书没声明它在 Canon 顺序中的位置

白皮书 v0.1 是 PDF 文件，没引用 `docs/canon/CURRENT_CANON.md` / `docs/brand/public/PUBLIC_BRAND_CONSTITUTION.md`，也没声明自己是第几级权威。

按 AUTHORITY_ORDER.md：
- 公共 Brand 在第 3 级 Canon 之后进入 `docs/brand/public/`
- `PUBLIC_BRAND_CONSTITUTION.md` 是最高 Public Brand 主题权威
- 历史文档不能反向覆盖 Canon

**白皮书目前的权威位置：**
- 不在 docs/canon/ → 不是 Canon
- 不在 docs/brand/public/ → 不是 Public Brand 主题权威
- 不在 docs/mood/ → 不是该 audit 包文档
- 是仓库外的 PDF 文件

→ **它当前是"第 8 级以下"，即历史 / 外部文档**，不能反向覆盖 Canon。

**若希望白皮书作为公共权威文本：**
- 选项 A：纳入 `docs/brand/public/` 或 `docs/mood/library/`，标注权威等级
- 选项 B：作为 Canon 引用的"参考文本"，Canon 修改时显式 cite

---

## 6. Gap 列表（白皮书补全项）

| # | Gap | 严重度 | 建议动作 |
|---|---|---|---|
| G-01 | Moodify Gate 没有 IA 路由 | 中 | 013 IA 或后续 Portal 包加 `/moodify` |
| G-02 | Builder Workshop 与 GitHub 154 commits 未整理状态脱节 | 高 | W01-PI GitHub 整理先于白皮书引用 |
| G-03 | Library / 白皮书自身的归位 | 低 | 014 LIBRARY 执行时把白皮书纳入 |
| G-04 | AI Agent 公共可见度需要 Tier 说明 | 低 | 白皮书 v0.2 加一行 |
| G-05 | Token Holders 指标口径要落地 | 中 | /network 路由落实时附口径 |
| G-06 | 白皮书没引用 Canon / 没声明 Canon 关系 | 高 | v0.2 加一节"与 Canon 的关系" |

---

## 7. Conflict 列表（必须解决）

| # | Conflict | 解决路径 | Canon 变更等级 |
|---|---|---|---|
| 🔴 C-01 | crestwavecoin.com 不在 Canon §3.7 | A. 接受为正式站点 / B. 拒绝并迁移 / C. 双层并存 | `CANON_CHANGE = YES` |
| 🔴 C-02 | MOOD vs Moodify 公共身份错位 | A. 以白皮书为准 / B. 以 Canon 为准 / C. 二者并存分层 | `CANON_CHANGE = YES` |
| 🟠 C-03 | Moodify 降级为 Genesis Application | 同 C-02，三选一 | 与 C-02 同一变更 |
| 🟠 C-04 | 白皮书权威归属 | 纳入 `docs/mood/library/` 或 `docs/brand/public/` | `CANON_CHANGE = NO`（归属决策，非 Canon 内容变更） |

---

## 8. Maintainer 决策清单（HUMAN_DECISION_REQUIRED）

1. **C-01 路径选择**：A / B / C
2. **C-02 + C-03 路径选择**：A / B / C
3. **C-04 归属决策**：Library / Brand Public / Other
4. **G-01 to G-06 的处理优先级**：哪个先做？
5. **是否立刻发布白皮书 v0.1**？还是在解决 C-01/C-02 后再发布 v0.2？
6. **是否在 Canon 修改之前**，把白皮书文本从"权威文本"降级为"设计参考"？

---

## 9. 建议的下一步（不直接动 Canon）

1. 本审计文档落地到 `docs/mood/audit/CANON_ALIGNMENT_AUDIT_MOOD_WP_v0.1.md`（**已完成**）
2. 等待 Maintainer 对 §8 决策清单的回复
3. 若 Maintainer 选 C-01 / C-02 的具体路径：
   - 起草 `CANON_CHANGELOG.md` 条目草案（草稿，不直接 commit）
   - 起草 `CURRENT_CANON.md` §1 / §3.7 修改 diff 草案
   - 起草 `PRODUCT_MAINLINE_INCLUSION_20260820.md` 修改 diff 草案
   - 草案 PRE_PUBLIC_CHANGE.md 公告文案（如选 A / C 路径需要）
4. 若 Maintainer 选"先不改 Canon，先整理 GitHub"：先做 W01-PI GitHub 整理（G-02 依赖项），再回到此审计
5. 若 Maintainer 选"白皮书降级为参考文本，不进入权威"：本审计归档；Library / 013 IA 自行调整
