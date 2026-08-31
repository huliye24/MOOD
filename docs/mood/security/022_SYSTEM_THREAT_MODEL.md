# 022 — System Threat Model

**Date:** 2026-08-30

## Scope

This threat model covers the canonical Moodify system surface built by packages 011–021:

- Identity / Passport (015)
- Contribution Network (016)
- Network Observatory (017)
- AI Agent Registry (018)
- Node Registry (019)
- Governance / MIP (020)
- Treasury & Transparency (021)
- Public APIs (cross-cutting)
- Admin / Reviewer / Operator roles
- Launch Gate (cross-cutting)

Out of scope (deferred):

- Token Launch (024) and Activation (025)
- LP / Holder Reward / Tax execution paths
- Real on-chain signing
- Third-party custodian integration
- Mobile / Android-specific threat models

---

## Threat Actors

| Actor | Capability | Motivation |
|---|---|---|
| **Anonymous Visitor** | Read public pages; call public APIs | Recon, scraping |
| **Malicious Resident** | Authenticated identity; can submit contributions | Reputation farming, prompt injection, XSS |
| **Compromised Resident** | Stolen session / signature | Funds loss, identity theft |
| **Reviewer (compromised or rogue)** | Can approve / reject submissions | Reputation inflation, abuse |
| **Maintainer** | Full authority over maintainer-class ops | Single point of failure |
| **Agent Operator** | Registers / operates agents | Prompt injection, tool abuse |
| **Node Operator** | Registers / operates nodes | Impersonation, fake metrics |
| **External Attacker** | Internet-scale; phishing; recon | Funds, secrets |
| **Insider (governance capture)** | MIP author + Maintainer | Self-approval, Canon hijack |

---

## STRIDE Categories (mapped to system)

### Spoofing

- Wallet signature impersonation (nonce replay, signature reuse)
- Resident impersonation (session theft)
- Agent / Node identity spoofing (publicKey collision)
- Maintainer impersonation (auth bypass)

### Tampering

- Contribution evidence tampering (URL injection, payload manipulation)
- MIP body injection (XSS via Markdown)
- Treasury config tampering
- Node metrics / heartbeat forgery
- Agent prompt injection

### Repudiation

- Missing audit trail on maintainer actions
- Reviewer action without recorded rationale
- Treasury execution without `actorIds[]`
- Anonymous action claims

### Information Disclosure

- Private key / seed / mnemonic leak (must NOT happen)
- Maintainer notes leakage
- Internal hostname / SSH exposure via Node public API
- Reconciliation mismatch exposure (acceptable; required)
- Stack trace leakage from API errors

### Denial of Service

- Public API flooding
- Markdown / payload expensive parsing
- Image / upload abuse
- Heartbeat flood (Node Registry)

### Elevation of Privilege

- Resident self-promotion to Reviewer / Maintainer
- Agent acquiring Treasury signer authority
- Node acquiring job execution authority
- MIP author self-accepting own proposal
- Maintainer bypassing governance to spend Treasury

---

## Threat Catalog (top 20)

| ID | Threat | STRIDE | Affected Package | Severity |
|---|---|---|---|---|
| T01 | Resident signature replay across domains | Spoofing | 015 | P0 |
| T02 | Session hijacking via missing cookie flags | Spoofing / Disclosure | 015 | P1 |
| T03 | Maintainer key compromise (single operator) | Spoofing / Elevation | 020, 021 | P0 |
| T04 | Treasury signer becomes AI-controlled | Elevation | 018, 021 | P0 |
| T05 | Node public API leaks internal hostname / SSH | Disclosure | 019 | P1 |
| T06 | MIP author self-accepts own proposal | Elevation | 020 | P0 |
| T07 | Treasury candidate wallet auto-activated | Elevation | 021 | P0 |
| T08 | Public API exposes stack trace / secret in error | Disclosure | cross | P1 |
| T09 | Contribution evidence URL = SSRF / XSS | Tampering | 016 | P1 |
| T10 | Agent tool injection → arbitrary shell / SSRF | Tampering | 018 | P0 |
| T11 | Node heartbeat forgery | Spoofing / Tampering | 019 | P1 |
| T12 | Secret committed to git | Disclosure | cross | P0 |
| T13 | Public mutation endpoint without auth | Elevation | cross | P0 |
| T14 | Rate-limit absent on public mutation | DoS | cross | P1 |
| T15 | Treasury auto-payout cron | Elevation | 021 | P0 (forbidden by design) |
| T16 | Token Tax / Holder Rewards auto-distribute | Elevation | 018/021 | P0 (launch-gated) |
| T17 | Canon rewrite via accepted MIP | Elevation | 020 | P1 |
| T18 | Public Trust Claim without evidence | Repudiation | 022 | P2 |
| T19 | CSP absent → XSS in user content | Tampering | cross | P1 |
| T20 | Markdown HTML rendering (raw) | Tampering | cross | P1 |

---

## Severity Model

```text
P0  Critical  — funds loss / auth bypass / key leak / RCE / admin takeover
P1  High      — privilege escalation / impersonation / false Treasury execution
P2  Medium    — privacy / disclosure / DoS / weak control
P3  Low       — hardening gap / observability gap
Info          — informational / observation
```

**Gate rule**: any open P0 OR internet-exploitable P1 → `023_PUBLIC_STAGING_BLOCKED`.

---

## Out-of-Scope Threats (deferred)

- Token Launch (024) and Activation (025) signer compromise
- Real multi-sig key ceremony
- Hardware wallet loss
- Custodian insolvency
- Cross-chain bridge compromise
- MEV / sandwich attacks on Treasury
- Quantum-resistant signature migration

These are documented in `022_TRUST_BOUNDARIES.md` and `022_STAGING_SECURITY_GATE.md` as future concerns.

---

## Cross-References

- `022_TRUST_BOUNDARIES.md`
- `022_PERMISSION_MATRIX.md`
- `022_CONTROL_MATRIX.md`
- `022_INCIDENT_RESPONSE.md`
- `022_STAGING_SECURITY_GATE.md`
