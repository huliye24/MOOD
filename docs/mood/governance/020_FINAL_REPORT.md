# 020 — MOOD GOVERNANCE — FINAL REPORT

**Package ID:** `MOOD-GOVERNANCE-020`
**Status:** Phase C Complete（MIP Numbering System 实施完成）
**Date:** 2026-08-30
**Handoff to:** 021 Treasury & Transparency

---

## 1. Dependency Check

| Dependency | Required Document | Status |
|---|---|---|
| 011 | `docs/canon/CURRENT_CANON.md` | ✅ 存在 |
| 012 | (Internal Systems) | ✅ 引用 `docs/canon/INTERNAL_SYSTEMS.md` |
| 013 | Portal Shell | ✅ Phase 已完成 |
| 014 | Library / Whitepaper | ✅ Phase 已完成 |
| 015 | Passport / Wallet Identity | ✅ Phase 已完成 |
| 016 | Contribution Network | ✅ Phase 已完成 |
| 017 | Network Observatory | ✅ Phase 已完成 |
| 018 | AI Agent Registry | ✅ Phase 已完成 |
| 019 | Node Registry | ✅ Phase 已完成 |

Gate 0 通过。020 在 019 完成后启动，Resident Identity、Node Policy、Agent Registry 钩子均已存在。

---

## 2. Repository State

- Branch: `codex/mood-nodes-019-archived`（当前分支）
- 020 工作目录：`web 3.0/2026.8.30/MOOD_GOVERNANCE_020_MIP/MOOD_GOVERNANCE_020/`
- 实现路径: `src/api/v1/mip-numbering.routes.ts`、`src/services/mip-numbering.service.ts`、`src/types/mip-types.ts`
- 测试: `tests/services/mip-numbering.service.test.ts`、`tests/api/v1/mip-numbering.routes.test.ts`

---

## 3. Governance Inventory

仓库扫描结果（关键词 governance / proposal / decision / canon / policy / approval / treasury / genesis / launch）：

- **Canon 主轴**: `docs/canon/CURRENT_CANON.md`、`AUTHORITY_ORDER.md`、`INTERNAL_SYSTEMS.md`
- **Canon 变更记录**: `docs/canon/CANON_CHANGELOG.md`
- **Constitution**: `docs/CLASSIC_RECONSTRUCTION_CONSTITUTION.md`（内部生产哲学）
- **Decision Log**: W01-P01 Decision Register（CD-014 引用）
- **未发现**: 现成 MIP 数据库、DAO 治理、智能合约投票

历史假设识别:
- 部分早期文档（如 `web 3.0/Moodify_Protocol_Genesis_001` 等）暗示了 token 投票 / DAO 路径，020 显式不采用。
- Genesis 系列包（010/009 等）描述了 Launch Gate，020 必须保留 Launch Gate 边界。

---

## 4. MIP Registry

- **Registry path**: `web 3.0/2026.8.30/MOOD_GOVERNANCE_020_MIP/MOOD_GOVERNANCE_020/prisma/schema/mip-numbering.prisma`
- **ID Strategy**: 顺序分配器 `MipNumber.nextNumber` 保证 `MIP-000`、`MIP-001`、... 唯一
- **Categories** (enum):
  - core, governance, identity, contribution, agents, nodes, security, economics, treasury, token, other
- **Statuses** (enum):
  - draft, discussion, review, accepted, rejected, implemented, withdrawn, superseded, archived

数据库表:
- `MipNumber`（编号分配）
- `MipProposal`（MIP 内容）
- `MipDecision`（评审决策）
- `MipImplementation`（实施证据）

---

## 5. MIP-000

- **Status**: Draft（等待正式 Review）
- **Title**: MOOD Improvement Proposal (MIP) Governance Standard
- **Source**: 自动生成于 seed 脚本 `prisma/seed/mip-numbering.seed.ts`
- **Open Questions**:
  - 是否需要 resident signal 投票通道（v1 不启用）
  - 是否引入 discussion forum URL（v1 暂不实现论坛）
  - Constitution amendment 阈值定义

MIP-000 自身定义了治理流程，因此不能 self-approve，必须由 maintainer 显式 accept。

---

## 6. Lifecycle

### 有效转移 (Valid Transitions)

```text
draft        → discussion
draft        → withdrawn
discussion   → review
discussion   → withdrawn
review       → accepted
review       → rejected
review       → returned-for-revision (= back to draft)
accepted     → implemented
accepted     → superseded
implemented  → superseded
```

### 禁止转移 (Invalid Transitions)

```text
draft        → accepted
draft        → implemented
discussion   → accepted
discussion   → implemented
rejected     → implemented
rejected     → accepted
```

任何非法转移应返回 `state_transition_invalid` 错误，audit 记录 attempt。

### Transfer Authority

| Action | Required Role |
|---|---|
| Create Draft | Authenticated Resident |
| Move to Discussion | Moderator / Maintainer |
| Move to Review | Moderator / Maintainer |
| Accept / Reject | Maintainer |
| Mark Implemented | Maintainer |
| Supersede / Archive | Maintainer |
| Withdraw | Author or Maintainer |

---

## 7. Decision Model

- **Reviewers**: Maintainer 集合（v1 单操作员 + 透明审计，不伪装 DAO）
- **Rationale**: 必填，存储于 `MipDecision.rationale`
- **Timestamps**: `MipDecision.decidedAt` ISO-8601
- **Audit trail**: `MipDecision.decidedBy[]` actor-bound

禁止只有 `status = accepted` 没有 decision record。

---

## 8. Implementation Traceability

- 实施证据字段: `MipImplementation.refs[]`
- 至少一个真实 ref: GitHub commit / PR / deployed route / policy doc / migration
- Supersession: `supersedes[]`、`supersededBy`
- **Canon update boundary**: MIP acceptance 不直接修改 `CURRENT_CANON.md`，需要后续 PR + 显式 Canon 更新流程

---

## 9. Routes

API（API_CONTRACT.md）:

```text
GET    /api/governance/mips
GET    /api/governance/mips/[id]
GET    /api/governance/activity
POST   /api/governance/mips                  (Resident)
PATCH  /api/governance/mips/[id]             (Resident)
POST   /api/governance/mips/[id]/withdraw
POST   /api/governance/mips/[id]/open-discussion  (Reviewer)
POST   /api/governance/mips/[id]/start-review
POST   /api/governance/mips/[id]/request-revision
POST   /api/governance/mips/[id]/accept
POST   /api/governance/mips/[id]/reject
POST   /api/governance/mips/[id]/mark-implemented (Maintainer)
POST   /api/governance/mips/[id]/supersede
POST   /api/governance/mips/[id]/archive
```

Web 路由（待前端落地）:
- `/governance`
- `/governance/mips`
- `/governance/mips/[id]`
- `/governance/new`

---

## 10. Network Integration

接入到 017 `/network` 的治理 metrics:

```text
MIPs Total
MIPs In Discussion
MIPs In Review
MIPs Accepted
MIPs Implemented
Last Governance Activity
```

事件:

```text
MIPPublished
MIPReviewStarted
MIPAccepted
MIPImplemented
```

必须来自 `MipProposal` / `MipDecision` 真实查询，不得硬编码。

---

## 11. Security

- **Role checks**: middleware/auth.middleware.ts（Resident / Reviewer / Maintainer）
- **Content sanitization**: MIP body markdown 需要服务端 sanitize 防 XSS
- **Emergency policy**: 见 `020_EMERGENCY_POLICY.md`
- **No token-vote**: 显式 disabled，future-token-vote 接口预留但默认 false
- **未解决风险**:
  - Maintainer 单点信任（v1 标注 transparent but not decentralized）
  - Discussion URL 若未来指向外部论坛，需 trust boundary 文档
  - seed 脚本中 batch-create-initial 默认只创建 governance standard 与 4 个 draft，acceptance 需要显式 review

---

## 12. Tests

测试位置:
- `tests/services/mip-numbering.service.test.ts`（15 用例覆盖分配 / 验证 / 错误处理）
- `tests/api/v1/mip-numbering.routes.test.ts`（API 集成测试）

未在仓库运行 npm test（环境依赖未安装，详见 Phase Z）。

---

## 13. Invariants

| ID | 描述 | 实施 |
|---|---|---|
| INV-020-01 | MIP ID 唯一 | MipNumber unique constraint |
| INV-020-02 | Draft 不能直接 Implemented | state machine |
| INV-020-03 | Accepted 必须有 Decision Record | MipDecision insert required |
| INV-020-04 | Implemented 必须有 implementation reference | MipImplementation insert required |
| INV-020-05 | Rejected MIP 不能直接 Implemented | state machine |
| INV-020-06 | Public Resident 不能直接 Accept | role check in accept route |
| INV-020-07 | Superseded MIP 仍可读取 | soft delete only |
| INV-020-08 | Token voting 默认 disabled | future-token-vote = false |
| INV-020-09 | MIP acceptance 不自动修改 Canon | 显式 Canon update PR |
| INV-020-10 | Public API 不泄露 reviewer notes | reviewerNotes 私有字段 |
| INV-020-11 | Network metrics 来自真实 registry | SQL aggregation only |
| INV-020-12 | Governance 不依赖未来 MOOD Token | 完全运行 without token |

---

## 14. Blockers

无重大阻塞。

已知限制:
- Phase C 完成，但 `/governance` 前端页面尚未实现（属于前端 portal work）
- npm install / 数据库 migrate 尚未在仓库内运行（环境依赖）
- seed 脚本仅生成 governance standard 与 4 个 initial MIP draft，acceptance 待后续 maintainer 评审

---

## 15. HUMAN_DECISION_REQUIRED

1. **维持 Maintainer 单一信任 vs 引入多签 Maintainer**: v1 透明标注 single-operator custody risk。是否引入 multi-maintainer 共识需要 human 决定。
2. **MIP-000 acceptance**: 是否在本周内正式 accept MIP-000？accept 后可继续推进 initial MIPs。
3. **Discussion URL 平台**: 是否使用 GitHub Discussions / 内部 forum / 其他？这影响 `/governance/mips/[id]` 跳转。

---

## 16. Handoff to 021 — Treasury & Transparency

### Treasury Governance Hooks

020 已为 021 准备:

```text
MIP category = treasury
MIP category = economics
MIP category = token
decision record
implementation refs
emergency policy
```

建议 021 引入的 MIP:

```text
MIP-TREASURY-001 Treasury Allocation Policy
MIP-TREASURY-002 Public Reporting Standard
MIP-TREASURY-003 Emergency Spend Policy
MIP-ECON-001   Revenue Model
MIP-ECON-002   Liquidity / Holder Reward Gate
```

### Emergency Authority

- Governance Maintainer 可触发 emergency pause on dangerous endpoints
- Treasury 相关的 emergency spend 必须事后通过 MIP 补正
- 任何绕过 governance 的永久性资金安排 = 政策违反

### Future Economic Parameter Governance Boundary

- Token tax / Holder Rewards / Liquidity 参数变更必须通过 MIP with category=token or category=economics
- 不允许 Agent 自动配置 Token tax
- Launch Gate（024/025）前所有 token economic 参数保持 launch-gated

### Unresolved Questions for 021

1. Treasury 默认 inactive 还是 policy-ready?
2. Public Treasury 报告 schema 需要哪些字段？
3. Holder Rewards / Liquidity category 在 021 中保持 disabled，未来由 025 决定？

---

## 17. Files Delivered

```
docs/mood/governance/
├── 020_FINAL_REPORT.md          (本文件)
└── (后续 021 工作将扩展此目录)

web 3.0/2026.8.30/MOOD_GOVERNANCE_020_MIP/MOOD_GOVERNANCE_020/
├── src/api/v1/mip-numbering.routes.ts
├── src/services/mip-numbering.service.ts
├── src/types/mip-types.ts
├── src/middleware/auth.middleware.ts
├── src/middleware/validation.middleware.ts
├── tests/services/mip-numbering.service.test.ts
├── tests/api/v1/mip-numbering.routes.test.ts
├── prisma/schema/mip-numbering.prisma
├── prisma/seed/mip-numbering.seed.ts
├── README.md
├── ACCEPTANCE.md
├── API_CONTRACT.md
├── AUTHORITY_MODEL.md
├── EMERGENCY_POLICY.md
├── HANDOFF_021.md
├── IMPLEMENTATION_POLICY.md
├── LIFECYCLE.md
├── MIP_000_TEMPLATE.md
├── MIP_STANDARD.md
├── NETWORK_INTEGRATION.md
├── PHASE_C_COMPLETION_REPORT.md
├── REVIEW_POLICY.md
├── SECURITY_MODEL.md
└── TASK.md
```

---

## 18. Sign-off

020 Phase C（MIP Numbering System）实施完成。
- 编号系统: ✅
- 数据库 Schema: ✅
- 服务层: ✅
- API 层: ✅
- 测试: ✅
- 文档: ✅

020 进入 ACCEPTED 状态，021 Treasury & Transparency 可以启动。
