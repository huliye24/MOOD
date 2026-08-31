# 020 — MIP LIFECYCLE

来源: `web 3.0/2026.8.30/MOOD_GOVERNANCE_020_MIP/MOOD_GOVERNANCE_020/LIFECYCLE.md`

## State Machine

```text
draft
 ↓
discussion
 ↓
review
 ├── accepted
 │     ↓
 │ implemented
 │
 └── rejected

draft → withdrawn
accepted → superseded
implemented → superseded
any historical → archived
```

## Transition Authority

### Resident

- create draft
- update own draft
- withdraw own draft

### Governance Reviewer

- open discussion
- start review
- request revision
- accept/reject

### Maintainer / Implementation Authority

- mark implemented with real evidence
- mark superseded
- archive

## Forbidden Transitions

```text
draft        → accepted
draft        → implemented
discussion   → accepted
discussion   → implemented
rejected     → accepted
rejected     → implemented
```

No client-side-only status transitions. All transitions audited.
