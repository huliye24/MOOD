# 023 — E2E Journeys

**Date:** 2026-08-30

## Journey Catalog

These journeys MUST pass on staging before `023_PUBLIC_STAGING_PASS`.

---

## Journey 1 — Anonymous Browse

```text
Visitor
  ↓
Open homepage
  ↓
See WORLD section
  ↓
See PROTOCOL section
  ↓
See PORTAL link
  ↓
Visit /world
  ↓
Visit /protocol
  ↓
Visit /library (or docs landing)
  ↓
Visit /network
  ↓
Visit /security
  ↓
Visit /treasury
  ↓
Visit /transparency
Expected: All render. No wallet connection forced.
```

---

## Journey 2 — Wallet Connect & Sign In

```text
Visitor
  ↓
Click "Connect Wallet"
  ↓
Wallet extension opens
  ↓
Choose wallet (test wallet provided)
  ↓
Request nonce (POST /api/genesis/nonce)
  ↓
Sign SIWE message
  ↓
Submit signed message (POST /api/genesis/register)
  ↓
Server verifies signature, nonce, domain
  ↓
Resident created / resolved
  ↓
Open /passport (or profile)
  ↓
Edit safe profile field (e.g., displayName)
  ↓
Save
Expected: 200, persisted.
```

---

## Journey 3 — Logout & Re-login

```text
Resident
  ↓
Click Logout
  ↓
Session cleared
  ↓
Click Connect Wallet again
  ↓
Re-sign with same wallet
  ↓
Same Resident resolved (same id)
Expected: 200, same Resident id.
```

---

## Journey 4 — Contribution Submit

```text
Resident
  ↓
Visit /contribute
  ↓
Open STAGING-TASK-001
  ↓
Click Submit
  ↓
Fill summary, evidence_text
  ↓
Submit (POST /api/contribution/submissions)
  ↓
Submission created with status=submitted
Expected: 201, submission id returned.
```

---

## Journey 5 — Contribution Review

```text
Maintainer (or Reviewer)
  ↓
Visit /admin/contributions or /contribute
  ↓
Open pending submission
  ↓
Start review (PATCH /api/contribution/admin/submissions/:id/transition)
  ↓
Approve (status=approved)
  ↓
Reputation event recorded
  ↓
Pending reward recorded (status=pending, currency=MOOD)
Expected: 200, no chain side effect, no transfer.
```

---

## Journey 6 — Agent Registry

```text
Operator
  ↓
POST /api/agents (or local adapter)
  ↓
Agent created with status=draft
  ↓
Activate (status=active)
  ↓
Heartbeat / Status update
  ↓
Network integration: /network reflects
Expected: truthful status; no fake Online.
```

If no Agent runtime available, only Registry + status=registered/unavailable is verified.

---

## Journey 7 — Node Registry

```text
Operator
  ↓
POST /api/nodes
  ↓
Node created with status=draft
  ↓
Heartbeat
  ↓
Service proof
  ↓
Health: healthy / degraded
Expected: truthful status; internal hostname NOT exposed.
```

---

## Journey 8 — MIP Lifecycle

```text
Maintainer
  ↓
POST /api/governance/mips  (create MIP-STAGING-001)
  ↓
status=draft
  ↓
Move to discussion
  ↓
Move to review
  ↓
Accept (status=accepted)
  ↓
Do NOT auto-mark Implemented unless real ref exists
  ↓
Decision record recorded (actor + timestamp + rationale)
Expected: MIP lifecycle state machine respects transitions.
```

---

## Journey 9 — Treasury Read

```text
Anonymous
  ↓
Visit /treasury
  ↓
See "Not Activated"
  ↓
GET /api/protocol/treasury returns:
  - treasuryStatus: "inactive"
  - accounts: []
  - executions: []
  - future revenue: launch-gated
Expected: 200, no fake balance.
```

---

## Journey 10 — Network Observatory

```text
Anonymous
  ↓
Visit /network
  ↓
All metrics from staging registry
  - Residents: <real count>
  - Tasks: <real count>
  - Submissions: <real count>
  - Agents: <real count>
  - Nodes: <real count>
  - Treasury: status, account count
Expected: no hardcoded values; missing values show "unavailable" or "coming-soon".
```

---

## Journey 11 — Security Page

```text
Anonymous
  ↓
Visit /security
  ↓
See staging gate status
  ↓
See trust claims
  ↓
See findings
  ↓
See "Independent third-party security audit: Not completed"
Expected: honest, no marketing claims.
```

---

## Journey 12 — Health Endpoint

```text
curl https://staging.<domain>/api/health
  ↓
200 OK
  - status: "ok"
  - environment: "staging"
  - version: <commit SHA>
  - timestamp: <iso>
Expected: no DB host, no stack trace, no secrets.
```

---

## Failure Cases

### F-01 — Invalid Signature

```text
Send signed message with wrong signature
Expected: 401, no Resident created.
```

### F-02 — Expired Nonce

```text
Send nonce issued > 10 minutes ago
Expected: 401, nonce_expired.
```

### F-03 — Unauthenticated Contribution

```text
POST /api/contribution/submissions without session
Expected: 401.
```

### F-04 — Self-Review

```text
Maintainer A creates submission
Maintainer A attempts to approve own submission
Expected: 403 self_review_forbidden.
```

### F-05 — Non-Reviewer Accept

```text
Resident attempts POST /api/governance/mips/<id>/accept
Expected: 403.
```

### F-06 — MIP Author Self-Accept

```text
Maintainer A creates MIP
Maintainer A attempts to accept own MIP
Expected: 403 self_acceptance_forbidden.
```

### F-07 — Treasury Transfer Attempt

```text
POST /api/protocol/treasury/transfer
Expected: 404 (no such route).
```

### F-08 — Buy / Trade / Claim CTA

```text
Scan staging for "Buy MOOD", "Trade MOOD", "Claim MOOD"
Expected: not found in foundation/staging.
```

---

## Mobile Viewports

```text
390x844   iPhone 14
768x1024  iPad
1280x720  Desktop
```

Required pages tested at each viewport:

- Homepage
- /world
- /protocol
- /passport (or profile)
- /contribute
- /network
- /treasury
- /security

---

## Reference

- `023_TEST_PLAN.md`
- `023_DEPLOYMENT_PLAN.md`
- `023_DATA_POLICY.md`