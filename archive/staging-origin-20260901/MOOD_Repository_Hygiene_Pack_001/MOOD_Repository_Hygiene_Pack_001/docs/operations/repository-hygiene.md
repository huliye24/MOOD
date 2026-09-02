# MOOD Repository Hygiene Protocol

Status:
Operational Draft

Category:
Engineering Governance

Protocol:
MOOD Protocol


## Purpose

GitHub 仓库是 MOOD 的长期知识基础。

对于 AI 辅助开发时代：

仓库越干净，AI 越准确。


## Core Principles

### 1. Single Source of Truth

所有核心事实必须来自：

- Canon 文档
- 当前状态文档
- Protocol 文档


旧版本进入：

archive/


禁止多个版本同时作为事实来源。


## 2. Repository Separation

MOOD Protocol:

- protocol
- manifesto
- governance
- economics


Moodify Application:

- audio
- AI engine
- player
- creator tools


两个系统保持边界。


## 3. Daily Cleaning Cycle

检查：

git status


清理：

- node_modules
- build
- dist
- .next
- logs
- temporary files
- experimental datasets


保持提交历史干净。


## 4. Archive Policy

历史内容不删除。

移动到：

archive/

包括：

- old whitepapers
- deprecated designs
- experiments
- old code


## 5. AI Agent Rules

Codex 优先读取：

- AGENTS.md
- docs/canon/
- docs/current-status.md


避免读取：

- archive/
- deprecated/
- temporary/


## Goal

让 MOOD 成为一个：

可被人类维护，
可被 AI 理解，
可被全球贡献者参与的协议仓库。
