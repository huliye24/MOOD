# MOOD Protocol Object Alpha 001 — Acceptance Report

**验收日期:** 2026-09-03
**验收人:** WorkBuddy（AI 验收代理）
**对象:** `packages/protocol-object` + `apps/mood-cli` + `services/node-api` 的协议对象链路
**验收核心问题:** Contribution Proof 是否已升级为 MOOD Network 可以理解的 Protocol Object？

---

## 1. Environment

| 项 | 值 |
|---|---|
| OS | Windows (win32) |
| Node.js | v22.22.2 |
| npm | 10.9.7 |
| MOOD CLI | 0.2.0-alpha.2 |
| 协议版本 | v0.1 |
| 网络 | MOOD Alpha Testnet（`mood-testnet-001`） |
| 共识模式 | Snapshot Agreement（Federated Alpha） |

命令面确认可用：`mood`、`mood init`、`mood start`、`mood status`、`mood stop`、
`mood contribution create/list/verify`、`mood object create/list/verify`、
`mood api start/status/stop`、`mood protocol`。

---

## 2. Node Runtime — PASS

`mood start` 实际输出：

```text
  Protocol:    v0.1
  Network:     MOOD Alpha Testnet
  Status:      Running
  PID:         16640
```

`mood status --json` 确认节点进程存在、状态合法：

```json
{"nodeId":"mood:node:5e771f06…","network":"MOOD Alpha Testnet","protocol":"0.1",
 "status":"Running","peers":0,"epoch":1,"agreement":"Verified","pid":16640}
```

节点在 relay 不可达时降级为本地模式（本地快照 digest 正常生成）。

---

## 3. Contribution Creation — PASS

```text
  Event:    event:mood:b5ff2d3ad2b3badaa40e7d1d
  Agent:    claude-code
  Type:     code_change
  Proof:    sha256:c637e6fb581fb4315114cdc87a4cafa63ee954c605aa9b3f4da056e102b76d08
  Verified: true
```

Event 与 Proof 均已落盘（`~/.mood/contributions/events/` + `proofs/`）。

---

## 4. Proof Conversion — PASS

`mood object create --type contribution` 将最近一条 ContributionProof 包装为协议对象，
payload 为四个**引用**字段（`eventId` / `proofId` / `eventHash` / `algorithm`），
不复制事件内容、不重复哈希逻辑。

---

## 5. Object Creation — PASS

```text
  Object ID:  object:mood:6adbb4a8e10d47db7fb9737d
  Type:       contribution
  Event:      event:mood:b5ff2d3ad2b3badaa40e7d1d
  Verified:   true
```

落盘于 `~/.mood/objects/contribution/object-mood-<24hex>.json`。

---

## 6. Object Validation（Schema）— PASS

对象精确包含 6 个必需字段，无多余键，无任何密钥：

```json
{
  "id":        "object:mood:ea91d9c47c39ed161fb148c5",
  "type":      "contribution",
  "version":   "0.1",
  "createdAt": "2026-09-03T13:04:00.027Z",
  "issuer":    { "nodeId": "mood:node:5e771f06…" },
  "payload":   {
    "eventId":   "event:mood:b5ff2d3ad2b3badaa40e7d1d",
    "proofId":   "proof:mood:ecf0fcf20c1f05eed02f6311",
    "eventHash": "sha256:c637e6fb…",
    "algorithm": "SHA-256"
  }
}
```

---

## 7. Hash Determinism — PASS（含一处验收文档修正）

库层面严格验证（`@mood/protocol-object`）：

```text
[1] 相同完整内容            → 相同 ID   : true  (object:mood:c84092d5…)
[2] 相同内容、key 顺序不同   → 相同 ID   : true  (canonicalize 生效)
[3] 相同 payload、createdAt 不同 → 不同 ID : true
[4] deriveObjectId(objectContent(A)) === A.id : true
```

**验收文档 Part 7 的表述需修正：** 文档写"相同 payload → 相同 object ID"。
实际契约是"**相同完整内容**（含 `createdAt`）→ 相同 ID"。因为 `createdAt` 是内容哈希的
前像的一部分（见 `protocol-object.md`："an object is one issuance at one moment"），
用 CLI 连续两次 `object create` 包裹同一 contribution，会得到不同 ID——这是**正确**的
内容寻址行为，不是缺陷。单元测试（18/18 通过）同样覆盖了确定性契约。

---

## 8. Tamper Detection — PASS

篡改 `payload.eventHash` 后 `mood object verify` 实际输出：

```text
  1. FAIL   object:mood:ea91d9c47c39ed161fb148c5
     · object id mismatch: object records …ea91d9c4…, recomputed …4198aa3c…
     · payload.eventHash mismatch: …0000…0000 vs stored …c637e6fb…
  Summary: 0/1 verified — 1 FAILED   (exit code 1)
```

恢复文件后 `1/1 verified`（exit code 0）。**双重检出**：integrity（ID 不匹配）+
linkage（与本地存储 proof 矛盾）。

> 注：验收文档 Part 8 让篡改 `description` 字段，但 `description` 在 ContributionEvent
> 里、不在 ProtocolObject 里（对象只含 4 个引用字段）。本验收改用对象真实存在的
> `payload.eventHash` 字段，篡改结果同样被正确拒绝。

---

## 9. Object List — PASS

排序稳定、输出确定性（按 `createdAt` 降序，同刻按 ID 升序）。两条对象均 `Status: Verified`。

---

## 10. Object Verify — PASS

```text
  Summary: 2/2 verified
```

---

## 11. Node Storage & Persistence — PASS

存储结构符合预期：

```text
objects/
  contribution/object-mood-<24hex>.json   协议真相（文件即真相）
  index/by-type.json                       派生目录（可重建）
  metadata/object-mood-<24hex>.json        本地同步状态（从不参与哈希）
```

节点重启（stop→start，PID 16640→14328）后 2 条对象仍存在且 `verified:true`。
CLI 每次调用即独立进程，天然满足"重启存活"。

---

## 12. API Access — PASS

| 端点 | 结果 |
|---|---|
| `GET /objects` | `{"objects":[{"id":"object:mood:…","type":"contribution","verified":true},…]}` |
| `GET /objects/:id` | 返回完整对象 + `verified:true` |
| `POST /objects/verify`（合法对象） | `{"verified":true}`（200） |
| `POST /objects/verify`（篡改对象） | `{"verified":false,"errors":["object id mismatch",…]}`（200，诚实结果而非异常） |
| `POST /objects/verify`（外来对象） | `verified:false` + `object id mismatch`——**任意节点的对象无需信任即可重算验证** |

---

## 13. Security Review — PASS

对 `objects/`、`logs/`、`contributions/` 全量扫描私钥 / seed / mnemonic / API key /
Bearer / password / 邮箱 / `BEGIN … PRIVATE KEY`：**零命中**。
节点自身私钥（设计上存于 `identity/private.json`）**未泄漏**到对象层 / 日志 / 贡献层。

---

## 14. Network Preparation — PASS

`ObjectSyncAdapter` 接口就绪：

```text
ObjectSyncAdapter.transport          : null           (下一阶段)
verifyRemoteObject(valid)            : {"valid":true}
verifyRemoteObject(tampered)         : ["object id mismatch: …"]
syncObject()                         : 诚实拒绝 (not-implemented-in-alpha-001)，非静默 no-op
```

`verifyRemoteObject` 已实现（任意节点对象本机重算验证）；`syncObject` 为诚实占位，
无 P2P 传输（符合 Alpha 001 边界）。

---

## 15. Complete Protocol Flow — PASS

```text
mood init
  → mood start
  → mood contribution create
  → mood object create
  → mood object list
  → mood object verify
  → mood api start
  → GET /objects
```

全链路跑通，无一处断裂。

---

## 16. Documentation — PASS

`docs/protocol/protocol-object.md` 已存在，并清晰区分两层语义：

- **ContributionProof** = "Why did this contribution happen?"（`@mood/contribution-proof`）
- **ProtocolObject** = "How does the network store and verify it?"（`@mood/protocol-object`）

命名审计给出硬规则：**所有哈希与规范化逻辑都在 proof 包**；object 包只引用、包装、存储、验证。

---

## 17. Remaining Issues

1. **Issuer 仅声明、未签名**：`issuer.nodeId` 指名铸造节点，但尚无节点密钥签发签名
   （文档已明确列为未来 alpha 项）。内容寻址保证"对象说了什么"，尚未证明"谁铸造了它"。
2. **同步传输未实现**：`syncObject()` 是诚实拒绝；Node A → Relay → Node B 的传播是下一阶段 spec。
3. **验收文档两处表述偏差**（已在 Part 7、Part 8 注明）："相同 payload 即相同 ID" 与
   "篡改 description" 均与真实对象模型不完全一致，属文档措辞问题，非实现缺陷。
4. **对象 ID 截断 24 hex（96 bit）**：alpha 规模碰撞安全，待网络设计阶段复核。
5. `mood object` 缺省子命令为 `list`（验收文档 Part 1 将 `mood object` 单独列为可验证命令，
   实际它等同于 `mood object list`）。

---

## Final Question

> "Does MOOD now have a first-class network object representing contribution?"

**YES。**

```text
Contribution → Proof → Protocol Object → Node Storage → Verification → API
   ✅ 实测       ✅ 实测      ✅ 实测          ✅ 实测         ✅ 实测       ✅ 实测
```

MOOD 已从"证明存在于节点"迈入"证明成为网络对象"。对象是内容寻址的、不可变、可自校验的一等
原语——同一对象在任何节点重算得到同一 ID，验证即重算、无需信任铸造者。这与 Git 的
`文件 → Commit Object → Repository`、Bitcoin 的 `交易 → Block Object → 链` 同构。

唯一的诚实保留：**同步传输（对象如何在节点间传播）是下一阶段**；但"对象可被网络理解、
存储、核验"这一步，已经真实落地。
