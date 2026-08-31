# 025 — Incident / Pause Plan (TEMPLATE)

**Status:** `025_TOKEN_ACTIVATION_BLOCKED_BY_024`
**Last updated:** 2026-08-30

---

## Purpose

Codify what happens if post-launch monitoring or independent observation reveals a launch-critical anomaly. Goal: stop the harm at minimum blast radius, preserve evidence, publish incident status, return to 022 / 024 / governance for review.

---

## Triggers

`025_TOKEN_ACTIVATION_INCIDENT` is opened if any of the following is observed:

- Wrong contract deployed (wrong address, wrong chain).
- Wrong name / symbol / decimals / supply vs 024 frozen.
- Unexpected tax (non-zero when 024 froze 0).
- Unexpected mint event.
- Unexpected ownership change.
- Owner / admin performing actions outside 024 frozen admin rights.
- LP mismatch (claimed locked but not locked; claimed size but smaller; etc.).
- Fake CA propagated publicly (typo-squat address, phishing site).
- Critical exploit disclosed.
- Coordinated wash-trading evidence.
- Treasury compromise.

---

## Immediate Actions (Maintainer, in order)

1. **Pause public CTA**: flip `token-active → token-warning` on the portal. Render a banner with incident ID and short description.
2. **Stop further funding**: no new BNB / Token movements to the LP / treasury accounts.
3. **Pause configurable subsystem if authorized**: e.g., if owner still has pause authority on Flap mechanism (verify), exercise it. If pause is unavailable, go to step 4 — there is no shame in being unable to pause.
4. **Preserve evidence**: snapshot the chain state at the block height of detection. Save Flap config URL, bscscan tx links, screenshots, timestamps. Do **not** delete any data.
5. **Publish incident status**: write `025_INCIDENT_<id>.md` with ID, time, trigger, evidence, scope, current state. Publish to portal incident page.
6. **Return to review**: file under 022 (security) and 020 (governance). 024 may need to be re-opened.

---

## What is Forbidden During an Incident

- "Let it recover on its own" — incident must be actively managed.
- Concealing evidence.
- Trading into the incident to "average down" or "support price".
- Coordinating public messaging that misrepresents the cause or scope.
- Renouncing ownership to "fix" the problem — that destroys accountability.

---

## Resolution Path

```text
Incident detected
  → pause public CTA
  → preserve evidence
  → publish incident status
  → 022 / 020 review
  → if recoverable: corrective tx + new signature sheet + new SHA + 024 partial re-freeze
  → if not recoverable: governance decision; potential 025 termination → future MIP
```

---

## Communication Discipline

- One voice per channel: Maintainer (or delegate).
- Avoid "we are investigating" without an ID — assign IDs and reference them.
- Do not include private keys, seed phrases, or recovery data in any communication.
- Updates happen on a known cadence (e.g., every 30 min for active incidents).

---

## Resume Condition

Activation may resume only after:

- Root cause documented.
- Corrective tx signed and confirmed (if applicable).
- 024 re-frozen with delta documented.
- New `025_FROZEN_INPUT_HASHES.md` computed.
- Maintainer explicit GO recorded.

If resume is **not** possible, the package transitions to `025_TOKEN_ACTIVATION_INCIDENT` final state (see `025_FINAL_REPORT.md`).
