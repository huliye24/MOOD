# 022 — Incident Response

**Date:** 2026-08-30

## Scope

This document defines the minimum incident response process for Moodify.

022 does NOT establish a 24/7 SOC. It establishes the BASIC flow that any maintainer can execute.

---

## Incident Lifecycle

```text
Detect
  ↓
Triage
  ↓
Contain
  ↓
Preserve Evidence
  ↓
Recover
  ↓
Communicate
  ↓
Postmortem
  ↓
MIP / Policy Update (if needed)
```

---

## Roles

| Role | Default Owner |
|---|---|
| Incident Commander | Maintainer |
| Containment Lead | Maintainer |
| Communications Owner | Maintainer |
| Evidence Custodian | Maintainer |
| Postmortem Author | Maintainer |
| Emergency Pauser | Maintainer |

022 does NOT designate multiple owners. v1 single-operator model applies.

---

## Severity Levels

| Severity | Definition | Examples | Response Time |
|---|---|---|---|
| **P0** | Funds loss / key leak / RCE / admin takeover | Maintainer key compromise | Immediate |
| **P1** | Privilege escalation / impersonation / false execution | Self-acceptance of MIP bypass | Within 24h |
| **P2** | Disclosure / DoS / weak control | Public API stack trace leak | Within 7 days |
| **P3** | Hardening gap | CSP not set | Within 30 days |
| **Info** | Observation | Anomalous read pattern | Logged |

---

## Detection Sources

- Application logs (error spikes)
- Treasury reconciliation mismatch alerts (future)
- Public reports (responsible disclosure)
- Internal observation

022 does NOT require automated detection. Manual review is acceptable for v1.

---

## Triage

Within 1 hour of detection, Incident Commander must:

1. Confirm the incident (vs false positive).
2. Assign severity.
3. Document initial timeline.

---

## Containment

| Severity | Containment Action |
|---|---|
| P0 | Pause affected subsystem immediately. Notify via public Trust page. |
| P1 | Disable affected route / API. Investigate root cause. |
| P2 | Patch and deploy. |
| P3 | Add to backlog. |

022 contains via:

- Emergency Pauser authority (Maintainer).
- Route disable via env flag (TBD in 023).
- Treasury pause via static config (already in 021).

---

## Evidence Preservation

For P0 / P1:

- Capture full application logs around the incident.
- Capture any on-chain state (tx hash, block number).
- Do NOT modify the system beyond what is required for containment.
- Store evidence offline (not in same DB as production).

022 does NOT mandate a SIEM. Evidence is maintained manually.

---

## Recovery

After containment:

1. Identify root cause.
2. Implement fix.
3. Verify fix in staging (if available).
4. Roll out to production.
5. Document recovery timestamp.

---

## Communication

| Severity | Communication |
|---|---|
| P0 | Public postmortem within 14 days. |
| P1 | Internal-only communication unless user-impact. |
| P2 | Internal only. |
| P3 | Internal backlog. |

Public communication uses the Trust Claims page (TC-###) and `/security` page.

022 does NOT include social-media templates. Maintainer drafts per incident.

---

## Postmortem Template

```text
# Incident: <TITLE>

## Severity
## Detection
## Containment
## Recovery
## Root Cause
## Evidence
## Impact (users / funds / data)
## Follow-up Actions
## MIP / Policy Updates (if any)
## Status: Open / Closed
```

022 stores postmortems under `docs/mood/security/incidents/YYYY-MM-DD-<slug>.md`.

---

## What 022 Does NOT Establish

- 24/7 SOC
- Automated detection / alerting
- On-call rotation
- External IR retainer
- Formal postmortem tooling

These are deferred to post-launch or to a Maintainer-team expansion.

---

## Reference

- `022_SYSTEM_THREAT_MODEL.md`
- `022_DISCLOSURE_POLICY.md`
- `022_FINDINGS.md`
