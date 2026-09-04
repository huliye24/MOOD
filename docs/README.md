# MOOD Documentation

MOOD documentation defines the world from which the protocol may be built. `MOOD_CANON.md` remains the repository's highest conceptual authority. Drafts are proposals and do not silently amend the Canon or prove that a system is deployed.

## Manifesto

MOOD Manifesto 描述协议背后的社会结构理念：

- [MOODISM Manifesto 001 — 思想版本谱系](manifesto/MOODISM_MANIFESTO_HISTORY.md)
- [MOODISM Manifesto 001 v0.1 — 中文](manifesto/MOODISM_MANIFESTO_001_ZH.md) — *Preserved Genesis Draft*
- [MOODISM Manifesto 001 v0.1 — English](manifesto/MOODISM_MANIFESTO_001_EN.md) — *Preserved Genesis Draft*
- [MOODISM Manifesto 001 v0.2 — 中文](manifesto/MOODISM_MANIFESTO_001_V0.2_ZH.md) — *Preserved Genesis Draft*
- [MOODISM Manifesto 001 v0.2 — English](manifesto/MOODISM_MANIFESTO_001_V0.2_EN.md) — *Preserved Genesis Draft*
- [MOODISM Manifesto 001 v0.3 — 中文](manifesto/MOODISM_MANIFESTO_001_V0.3_ZH.md) — *Current Genesis Draft III*
- [MOODISM Manifesto 001 v0.3 — English](manifesto/MOODISM_MANIFESTO_001_V0.3_EN.md) — *Current Genesis Draft III*
- [Permissionless Generation](manifesto/permissionless-generation.md)
- [Anti-Gatekeeper Economy](manifesto/anti-gatekeeper-economy.md)
- [Contribution Over Status](manifesto/contribution-over-status.md)
- [From Gatekeeper to Protocol](manifesto/gatekeeper-to-protocol.md)
- [Protocol Empire Theory](manifesto/protocol-empire-theory.md)
- [MOOD Is Not Moodify](manifesto/mood-not-moodify.md)
- [Protocol vs. Application](manifesto/protocol-vs-application.md)
- [Genesis Application](manifesto/genesis-application.md)
- [Digital Society](manifesto/digital-society.md)
- [From Company to Network](manifesto/from-company-to-network.md)
- [Human AI Coexistence](manifesto/human-ai-coexistence.md)
- [Protocol vs. Platform](manifesto/protocol-vs-platform.md)

## Lexicon

MOOD 的中英文核心词义与不可混淆边界位于 [`docs/lexicon/`](lexicon/README.md)：

- [中文核心词典](lexicon/LEXICON_ZH.md)
- [English Core Lexicon](lexicon/LEXICON_EN.md)

## Protocol

协议层文档位于 [`docs/protocol/`](protocol/README.md)，描述 MOOD 如何运行。所有技术机制均从 Canon 与 Manifesto 的意义边界向下展开。

## Protocol Evolution Timeline

协议演进记录位于 [`docs/history/`](history/)。每个 Alpha 是一个历史节点：完成后固化，不回写。

```text
2026-09-03    Alpha 001    Contribution Proof → Protocol Object
                           (application layer → protocol layer)
                           Milestone: docs/history/MOOD_PROTOCOL_MILESTONE_ALPHA_001.md

In specification:
2026-09-04    Alpha 002    Identity Layer
                           (Protocol Object → Identity Signature)
                           Spec: docs/protocol/identity-layer.md

Future:
              Alpha 003    Object Synchronization
```

- [Protocol Object Alpha 001 — Repository Audit](history/protocol-object-alpha-001-audit.md)
- [MOOD Protocol Milestone Alpha 001](history/MOOD_PROTOCOL_MILESTONE_ALPHA_001.md)
- [MOOD Protocol Identity Layer Specification Alpha 002](protocol/identity-layer.md) — *specification only, not implemented*
- [Alpha 002 Roadmap](history/alpha-002-roadmap.md) — milestones toward implementation
- [ADR-002: Introduce Identity Layer in Alpha 002](decisions/ADR-002-identity-layer.md) — *Proposed*

Alpha 002+ 的规划接口见
[`docs/protocol/protocol-object.md`](protocol/protocol-object.md) 的
Alpha Evolution 章节。

## Protocol History

协议历史与未来演进路线图：

- [MOOD Protocol History](history/MOOD_PROTOCOL_HISTORY.md) — Origin 与已固化的协议里程碑
- [MOOD Protocol Roadmap](history/MOOD_PROTOCOL_ROADMAP.md) — Alpha 002 → Alpha 004 演进方向

## Protocol Archives

已冻结的协议版本归档位于 [`docs/history/alpha-001/`](history/alpha-001/)：

- [Alpha 001 Archive](history/alpha-001/README.md) — FROZEN 2026-09-03
- [Alpha 001 Acceptance](history/alpha-001/acceptance.md)
- [Alpha 001 Decisions](decisions/ADR-001-alpha001-freeze.md)

## Website

The website is the presentation layer. It renders Canon; it does not author Canon.

- [Website Principles](website/website-principles.md) — what the website may and may not do
- [Content Mapping](website/content-mapping.md) — GitHub documents → website routes

Website routes mirror the canonical public hierarchy:

```text
MOOD → WORLD → MANIFESTO → CANON → LIBRARY → PROTOCOL
```

Each route's authoritative source document is recorded in
[`docs/website/content-mapping.md`](website/content-mapping.md).

Portal architecture planning (Phase Zero, no live surface):

- [Portal Architecture — Pack 005](website/pack-005/README.md)
- [Information Architecture](website/pack-005/information-architecture.md)
- [Portal Architecture](website/pack-005/portal-architecture.md)
- [Future Portal Surface](website/pack-005/future-portal-surface.md)

## Operational Records

治理、安全、财库、预发布、Genesis 与审计记录位于 [`docs/mood/`](mood/)。这些记录必须区分提案、测试、阶段状态与已验证事实。

经济层的当前边界见 [`docs/economy/`](economy/README.md)。现有代币或市场事实不自动证明 MOOD Protocol 经济已经启用。

## Chronicle — Canon Amendment Proposals

存放在 [`docs/chronicle/`](chronicle/) 的文档是 **Canon 修正提案**，仅在草案状态。它们不修改 [`MOOD_CANON.md`](../MOOD_CANON.md)，也不证明任何系统已部署。

当前批次（Phase Zero — Batch A）：

- [MOODISM Identity Proposal](chronicle/proposals/PROPOSAL_MOODISM_IDENTITY.md) — *Accepted in Canon v0.2*
- [Decision 001: MOODISM Identity](chronicle/decisions/DECISION_001_MOODISM_IDENTITY.md) — *Accepted*
- [Foundation Node Proposal](chronicle/PROPOSAL_FOUNDATION_NODE.md) — *Draft*
- [Community Node Proposal](chronicle/PROPOSAL_COMMUNITY_NODE.md) — *Draft*
- [Contributor Lifecycle Proposal](chronicle/PROPOSAL_CONTRIBUTOR_LIFECYCLE.md) — *Draft*

## Engineering Operations

跨切工程规范位于 [`docs/operations/`](operations/)。这些是**维护性文档**，不授权 canonical 概念。

- [Repository Hygiene Protocol](operations/repository-hygiene.md) — repository governance for AI-assisted development
- [Cleanup Checklist](operations/cleanup-checklist.md) — before / after / weekly audit checklist

`docs/mood/` 的numbered staging 文档（如 023、024）与 `docs/operations/` 的跨切规范互补：前者是部署专有，后者是全局规范。

## Compatibility

历史 Moodify 标识的保留范围与迁移纪律见 [MOOD / Moodify Compatibility Boundary](MOODIFY_COMPATIBILITY_BOUNDARY.md)。
