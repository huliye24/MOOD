---
title: "MOOD 协议：一个基于贡献证明的人机协作网络"
author: "MOOD Project Contributors"
version: "0.1 Draft"
date: "2026-09-02"
lang: zh-CN
---

# 摘要

数字网络能够精确记录通信、交易和注意力，却仍缺少一种通用协议，将异构的人类与机器贡献转化为可验证、可持续的协调状态。代码托管平台保存提交历史，劳动制度以报酬交换时间，社交平台排序可见性，但这些记录通常依赖特定平台，难以形成可携带的证明、长期信誉或可由第三方复验的决定。自主 AI Agent 的出现进一步放大了这一问题：行动、证据、归属和责任不再天然对应单一的人类账户。

本文提出 MOOD Protocol，一种面向人机协作的贡献状态协议。MOOD 将贡献建模为签名声明，并使其与证据、政策、验证决定和派生信誉快照相连接。协议区分语义权威、规则、验证、网络复制与可选经济结算；Token 余额不能自动证明贡献、信誉、身份或治理权。当前参考实现已经包含本地贡献、信誉、节点注册和只读 API 模块，但尚不构成生产级 P2P 网络，也未形成最终共识机制。本文给出最小数据模型、确定性状态转换、安全边界与分阶段实现路径，并主张贡献网络的第一种原生资产应当是可复验、携带证据的状态转换，而不是投机性经济工具。

**关键词：** 贡献证明；人机协作；可验证状态；信誉；协议网络；去中心化协调

# 1. 引言

Web 从文档发布系统演化为交互式应用和大规模社会协作设施。越来越多的人可以生产信息，但主流系统仍以应用为中心。代码平台识别 Commit，科研平台索引论文，任务平台记录交付；这些事件离开原平台后，往往失去上下文、政策依据或可访问性，无法自然成为可携带的网络状态。

AI Agent 使问题更加突出。机器主体可以生成代码、审核证据、运行基础设施或跨系统协作，由此产生一系列传统账户模型无法回答的问题：谁授权了行动？使用了哪些输入？结果由什么证据支持？其他验证者能否复现决定？修正如何影响历史信誉？累积贡献是否以及如何产生权利？

Bitcoin 证明了独立节点可以依据明确规则验证交易并收敛到共享货币状态 [1]，《Mastering Bitcoin》则系统解释了密钥、交易、节点发现和本地验证如何组合成运行网络 [2]。Ethereum 进一步将复制状态机扩展为可编程账本 [3]。MOOD 处理的是另一类问题：如何把异构贡献声明转化为可验证的协议对象，同时避免把社会判断简化为 Token 所有权，也不假装所有贡献都能由单一密码学测试确定。

![图 1：从平台所有的活动记录走向可携带的贡献状态。](figures/mood-vs-web2.png)

MOOD 遵循 Canon 优先的权威层级：意义先于机制，协议规则先于实现。验证者只有在贡献类型、可接受证据、适用政策和决定权限均被定义后，才可能评估贡献。因此，MOOD 将 Canon 与可替换的软件分离，并将未解决概念明确保留为缺口。

本文提出四项成果：最小贡献状态管线；证据验证、社会评价、信誉派生、复制与经济结算之间的边界；适合独立验证的确定性记录和快照；以及从本地参考实现走向独立节点网络所需的验证条件。

# 2. 贡献问题

现有制度用互不兼容的抽象确认工作：雇佣系统记录合同劳动与薪酬，社交平台优化注意力信号，版本控制系统保存变更和作者元数据，学术系统发表论证和引文，算力市场计量资源。它们各自有效，却都没有提供从贡献到独立可验证协调状态的通用转换。

缺失的关系并非简单的“贡献产生价值”。贡献最初只是声明，其证据强度取决于来源、完整性、归属、相关性和评价政策。贡献的效力还可能随时间变化：代码可被回滚，数据集可被撤回，验证决定可被申诉，身份关联可被攻破。因此，协议必须保存从声明到决定的完整路径，而不能只发布一个分数。

MOOD 将基本链条表示为：

\[
C \rightarrow E \rightarrow V \rightarrow D \rightarrow R
\]

其中 \(C\) 为贡献声明，\(E\) 为证据集合，\(V\) 为验证观察序列，\(D\) 为绑定政策的决定，\(R\) 为派生信誉状态。每条边只有在引用不可变输入和明确政策版本时才可审计。

由此必须坚持三项区别：附加在声明上的材料不自动成为 Proof；一个服务返回成功不等于 Consensus；信誉可以数值化，但不因此成为可转让财产。这些区别防止本地实现结果被错误宣传为网络事实。

# 3. MOOD 协议架构

MOOD 包含六个权威与执行层。Canon 定义概念和边界；Specification 定义规范对象和转换；Contribution Registry 接受并索引声明；Proof Layer 按版本化政策评价证据；Reputation Layer 生成不可转让的历史摘要；Network Layer 复制签名对象和快照。可选 Settlement Interface 只能锚定摘要或执行经过独立授权的经济操作。

![图 2：MOOD 协议架构与信任边界。](figures/mood-network-architecture.png)

时间 \(t\) 的逻辑状态定义为

\[
S_t=(I_t,C_t,E_t,D_t,R_t,N_t,P_t),
\]

其中 \(I\) 表示身份与密钥，\(C\) 表示贡献，\(E\) 表示证据描述，\(D\) 表示验证决定，\(R\) 表示信誉快照，\(N\) 表示节点清单和观察，\(P\) 表示政策版本。事件 \(x_t\) 只有通过 Schema、签名、授权、重放防护、引用对象可用性及状态前置条件验证后，才能产生

\[
S_{t+1}=\delta(S_t,x_t,P_t).
\]

节点必须对相同字节执行签名和指纹计算，因此需要确定性序列化。JSON Canonicalization Scheme 提供了标准化 JSON 编码方法 [4]。Ed25519 具有公开标准和广泛实现，可作为候选签名算法 [5]；最终密码套件仍需单独的安全规范授权。

并非每个节点都必须保存私密证据。公开对象可以只包含证据承诺和披露政策。验证者通过独立通道读取受保护材料，再发布引用相应承诺的签名决定。这样可保留决定路径的可审计性，同时避免把 Hash 错误描述为隐私保护机制。

# 4. 贡献证明系统

“Proof of Contribution”在本文中指证据与决定框架，并非 Proof of Work 的替代共识。Bitcoin PoW 通过计算成本约束历史选择 [1]；MOOD 面对的贡献包括代码、研究、数据、算力、文档、基础设施和社区工作，无法由单一客观谓词判断其价值。

![图 3：贡献声明、证据、验证与决定流程。](figures/contribution-proof-flow.png)

最小贡献记录包含 Schema 版本、由内容摘要派生的 Contribution ID、主体、类别、声明正文、证据引用、政策版本、时间、Nonce 和签名。Evidence Descriptor 记录证据类型、内容摘要、来源、采集时间、披露等级与验证要求，但本身不承诺真实性。Verification Decision 引用贡献和证据指纹、验证者身份、政策版本、结果、原因代码、有效时间及签名。

该结构与 W3C Verifiable Credentials 的 Issuer-Holder-Verifier 分离具有相似性 [6]，但本文不宣称自动兼容。W3C Data Integrity 也表明，Proof 参数、验证方法和受保护数据必须保持绑定 [7]。

提议生命周期为 `draft -> submitted -> under_review -> verified | rejected -> finalized`。`disputed`、`superseded` 与 `revoked` 应表示新的后续事件，而不是修改或删除历史对象。Finalized 表示记录和决定不可变，不表示未来证据不能改变其持续相关性。

贡献只有在至少一条可接受验证路径达到政策规定的 Final 状态后，才能进入信誉计算。更严格的政策可以要求多个独立验证者、挑战期或特定类别的 Quorum。这些规则尚未成为 MOOD 的 Canonical Consensus，不能从现有代码中自行推断。

# 5. 信誉作为派生状态

信誉是对已接受历史证据的可复现摘要，不是对人格价值的普遍度量。它必须由领域、政策、时间和置信度限定。单一排行榜会丢失这些维度并诱发博弈，因此 MOOD 使用信誉向量，并公开其派生输入。

![图 4：携带证据的贡献形成版本化信誉快照。](figures/reputation-engine.png)

参与者 \(a\) 在 Epoch \(t\) 和领域 \(k\) 的临时分量可表示为：

\[
r_{a,k,t}=\sum_{c\in C_{a,t}}w_{k,\tau(c)}q(c)i_k(c)d(t,t_c).
\]

其中 \(w\) 是贡献类型政策权重，\(q\) 是 Proof Confidence，\(i\) 是有界影响评价，\(d\) 是明确声明的持续性或衰减函数。该公式仅用于说明结构，不是最终经济模型。快照必须包含准确政策版本、贡献指纹、验证者集合、缺失数据标记和置信等级；相同输入必须得到相同输出。

信誉不能自动授予治理权。技术贡献可能与某一领域的评审权相关，却不能自动产生 Treasury 托管权或 Canon 修正权。权利必须由独立政策映射，并定义利益冲突、委托、暂停和申诉规则。

# 6. 人类与 AI Agent

MOOD 将 AI Agent 视为具有边界的潜在行动者，而不是隐藏在人类账号后的工具。Agent 身份需要关联 Operator、Deployment Context、能力声明、密钥和撤销方法。人类授权或控制部署时，自主输出不能消除人的责任。

![图 5：人类、Agent 与节点之间的责任关系。](figures/ai-agent-network.png)

Agent 贡献应记录模型或 Runtime 类型、工具权限、任务授权、相关输入承诺、执行回执和必要的监督者。私有 Prompt 或闭源模型权重不必公开，但信息缺失会缩小第三方可以复现的声明范围。协议必须区分 Reproducibility、Independent Corroboration 与 Attestation，因为三者具有不同证据强度。

Agent Reputation 与 Operator Reputation 必须分离，否则操作者可以通过更换 Agent 逃避负面历史，或在没有证明控制权时继承信誉。关联和解除关联事件应被签名、限定时间并保留历史；受损 Agent 可以撤销，但其过去证据不能被删除。

# 7. 网络复制与最终性

本地模块集合不是网络。MOOD 网络要求由独立主体管理的节点能够发现 Peer、认证消息、交换 Content-addressed Object、本地验证状态转换，并对声明的 Snapshot 收敛。IPFS 等系统展示了内容寻址如何让不可变对象脱离存储位置被识别 [8]，但内容寻址本身不能解决授权、可用性、排序或最终性。

提议节点协议包含四类消息：`announce` 发布签名 Node Manifest；`inventory` 交换对象 ID 和 Snapshot Head；`fetch` 请求对象；`attest` 发布验证决定与快照签名。每个 Envelope 包含协议版本、发送者 Key ID、时间、Nonce、Payload Digest 和 Signature。节点拒绝无效 Schema、超过政策容差的时间、重复 Nonce、未知的强制版本，以及 ID 与规范化摘要不匹配的对象。

MOOD v0.1 不宣称已经设计出 Permissionless Byzantine Consensus。第一阶段宜采用透明的 Federated Snapshot：每个节点从相同 Finalized Event Set 独立计算快照并发布 Digest。当预先声明数量的 Genesis Node 对同一 Epoch Digest 签名时，系统观测到一致。它是 Bootstrap Mechanism，不代表完整去中心化。Signer Set 变更、网络分区和 Equivocation 恢复仍需后续规范。

# 8. 可选区块链结算

Blockchain Settlement 位于贡献状态之后。它可以给 Snapshot Digest 提供时间锚、托管经授权的 Grant，或执行独立治理批准的转账；不能将 Token Ownership 转换为贡献证据，也不能让智能合约静默成为 MOOD 的宪法权威。

![图 6：协议状态与可选结算 Adapter 之间的边界。](figures/blockchain-settlement.png)

结算接口只接受 Finalized 且符合政策的 Intent。Adapter 必须声明 Chain、Contract、Network、Signer Policy、Replay Domain、Finality Rule 和 Rollback Procedure。密钥签名、合约部署、Liquidity、Treasury Movement 和不可逆公开激活始终需要人类批准。

仓库当前保存了一组历史 BNB Smart Chain Token Facts，但其中仍有未解决证据字段。本文既不独立验证这些事实，也不将该资产指定为 MOOD 的原生宪法或经济中心。Ethereum、BSC 或其他账本只能作为可替换的 Settlement Adapter，除非 Canon 经过正式修正作出进一步授权。

# 9. Genesis 与实现状态

Genesis 是不同实现能够推导出同一初始结果的最小显式状态。它应包含协议版本、Canon 文档摘要、初始政策集合、Genesis Node Key、时间规则、空或明确声明的初始对象集，以及完整 Genesis Manifest 的摘要。

![图 7：提议 Genesis 状态与第一次可验证转换。](figures/genesis-state.png)

MOOD 仓库当前已经存在若干参考资产：Contribution Schema 与 Lifecycle Logic；本地 Proof Verifier 原型；Reputation Profile 与确定性 Snapshot；包含身份、能力、Health 和 Discovery 的 Node Registry；以及只读 Protocol API。在本次审计环境中，Protocol API 测试可以成功执行，其他测试仍存在依赖缺失或实现错误。Node Registry 使用离线文件存储，GitHub Verifier 包含 Mock Data。因此，当前实现应被准确描述为 **Local Protocol Prototype**。

要升级为 Network Claim，至少需要：Normative Wire Specification、密码学 Test Vector、持久化存储、三个独立 Node Process、跨节点对象交换、确定性 Snapshot Convergence、重启恢复、畸形消息与 Replay Test、Key Rotation/Revocation Test，以及绑定 Source Commit 的公开执行证据。满足这些条件前，不应使用 Production、Mainnet、Decentralized 或 Trustless 等标签。

# 10. 安全、治理与局限

主要威胁包括虚假归属、重复声明、验证者串谋、密钥泄露、Sybil Identity、Replay、证据消失、政策操纵、隐私泄露、信誉博弈和治理捕获。Content Hash 可以发现改变，但不能证明作者或真实性；Signature 可以证明密钥控制，不能证明行动合法；多份 Attestation 只有在验证者真正独立时才提高证据多样性。

治理必须区分 Canon Amendment、Policy Publication、Operational Validation 与 Economic Execution 四种权威。任何单一 Reputation Score 或 Token Balance 都不应自动控制全部权威。每次规范改变必须包含版本化 Proposal、Review Record、生效 Epoch、Compatibility Statement 与 Migration Plan。

本文存在五项局限。第一，Canon 中的贡献语义仍不完整；第二，信誉公式仅为说明；第三，尚未定义 Permissionless Consensus 和 Sybil Resistance；第四，Privacy-preserving Verification 尚未实现；第五，现有证据来自仓库本地，不能证明多运营者网络已经运行。这些局限构成 Phase One 的研究议程，而不是应被宣传语言掩盖的问题。

# 11. 结论

MOOD 提出一种协调协议：贡献声明只有经过明确证据、政策绑定验证、确定性状态转换和可由独立节点复现的快照，才成为持久网络状态。它将 Reputation 与 Identity 分离，将 Rights 与 Reputation 分离，将 Settlement 与宪法权威分离，使软件、存储和区块链 Adapter 能够被替换，而不会静默改写协议服务的世界。

下一项可信里程碑不是 Dashboard 或 Token Launch，而是一个三节点参考网络：各节点交换同一批签名贡献对象，依据同一政策进行验证，并发布同一 Snapshot Digest。当独立运营者可以复现该结果时，MOOD 才具备称为网络的最低证据。

# 声明

**数据可得性。** 本文没有创建新的实证数据集。实现状态评估所使用的材料位于 MOOD 仓库，外部标准和论文列于参考文献。

**伦理声明。** 本文不涉及人类受试者或个人数据采集。未来处理真实参与者数据前，必须制定隐私、同意、申诉和自动化决定保障。

**作者贡献（CRediT）。** MOOD Project Contributors：Conceptualization、Methodology、Software、Validation、Visualization、Writing - original draft、Writing - review and editing。个人署名由项目维护者最终确认。

**利益冲突。** 当前未声明利益冲突。与 MOOD 相关的任何经济工具均不在本文证据范围内。

**资金声明。** 本文制作过程未核验到外部资助来源。

**AI 使用披露。** 生成式 AI 被用于仓库分析、文献组织、草稿撰写、翻译、图表构建与排版。概念权威仍属于 `MOOD_CANON.md`，所有公开声明均需人类审核。

# 参考文献

[1] S. Nakamoto, “Bitcoin: A Peer-to-Peer Electronic Cash System,” 2008. https://bitcoin.org/bitcoin.pdf

[2] A. M. Antonopoulos and D. A. Harding, *Mastering Bitcoin: Programming the Open Blockchain*, 3rd ed. O'Reilly Media, 2023. https://github.com/bitcoinbook/bitcoinbook

[3] G. Wood 与 Ethereum Yellow Paper Contributors, “Ethereum: A Secure Decentralised Generalised Transaction Ledger,” 2025. https://ethereum.github.io/yellowpaper/paper.pdf

[4] A. Rundgren, B. Jordan, S. Erdtman, “JSON Canonicalization Scheme,” RFC 8785, 2020. doi:10.17487/RFC8785.

[5] S. Josefsson, I. Liusvaara, “Edwards-Curve Digital Signature Algorithm (EdDSA),” RFC 8032, 2017. doi:10.17487/RFC8032.

[6] World Wide Web Consortium, “Verifiable Credentials Data Model v2.0,” 2025. https://www.w3.org/TR/vc-data-model/

[7] World Wide Web Consortium, “Verifiable Credential Data Integrity 1.0,” 2025. https://www.w3.org/TR/vc-data-integrity/

[8] J. Benet, “IPFS - Content Addressed, Versioned, P2P File System,” arXiv:1407.3561, 2014. doi:10.48550/arXiv.1407.3561.

