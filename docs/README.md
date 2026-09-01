# MOOD Documentation

MOOD documentation defines the world from which the protocol may be built. `MOOD_CANON.md` remains the repository's highest conceptual authority. Drafts are proposals and do not silently amend the Canon or prove that a system is deployed.

## Manifesto

MOOD Manifesto 描述协议背后的社会结构理念：

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

## Protocol

协议层文档位于 [`docs/protocol/`](protocol/README.md)，描述 MOOD 如何运行。所有技术机制均从 Canon 与 Manifesto 的意义边界向下展开。

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

## Chronicle — Canon Amendment Proposals

存放在 [`docs/chronicle/`](chronicle/) 的文档是 **Canon 修正提案**，仅在草案状态。它们不修改 [`MOOD_CANON.md`](../MOOD_CANON.md)，也不证明任何系统已部署。

当前批次（Phase Zero — Batch A）：

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
