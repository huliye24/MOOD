# 022 — Responsible Disclosure Policy

**Date:** 2026-08-30

## Status

This is the v1 policy. 022 does NOT establish a dedicated security email; reporting channels are explicitly acknowledged as "pending" until Maintainer provisions one.

## Reporting Channels

- **Public form / email:** Not yet provisioned. If absent, use the project's public GitHub issue tracker with label `security` (NOT for sensitive disclosures).
- **For sensitive disclosures:** Maintainer contact via canonical public channels (see project README). Do NOT post sensitive details publicly.

022 explicitly does NOT fabricate a security email address.

## What to Report

- Vulnerability in MOOD code or deployed infrastructure
- Trust Claim that lacks Evidence
- Configuration that exposes secret material
- Logic that bypasses authority (e.g., self-acceptance, auto-execution)

## What NOT to Do (Reporter)

- Do NOT exploit beyond proof-of-concept.
- Do NOT exfiltrate user data.
- Do NOT perform DoS testing against production without prior coordination.
- Do NOT publicly disclose before Maintainer has had a reasonable opportunity to respond.
- Do NOT use scanner tooling that generates excessive noise.

## Expected Response Process

1. **Acknowledge:** within 72 hours.
2. **Triage:** within 7 days.
3. **Resolution plan:** within 30 days for P1, sooner for P0.

022 makes no SLA commitment beyond the above; Maintainer can adjust.

## Safe Harbor

Moodify will not pursue legal action against reporters who:

- Follow this policy in good faith.
- Do not exceed proof-of-concept scope.
- Do not access or exfiltrate user data.
- Do not publicly disclose before coordinated disclosure.

This is a CONSERVATIVE safe-harbor; Maintainer may expand.

## Recognition

022 does NOT promise a bounty program. Recognition is at Maintainer's discretion.

---

## Reference

- `022_INCIDENT_RESPONSE.md`
- `022_PUBLIC_TRUST_CLAIMS.md`
- `/security` page
