# 025 — Post-Launch Monitoring Plan (TEMPLATE)

**Status:** `025_TOKEN_ACTIVATION_BLOCKED_BY_024`
**Last updated:** 2026-08-30

---

## Window

```text
T+0    : immediately after Official CA published
T+15m  : 15 minutes after
T+1h   : 1 hour after
T+6h   : 6 hours after
T+24h  : 24 hours after
```

024 / Maintainer may extend with more checkpoints, but the minimum is the five above.

---

## What to Read at Each Checkpoint

| Item | How | Expected | Anomaly Action |
|---|---|---|---|
| Contract source verified on bscscan | bscscan UI | YES | if NO → INCIDENT |
| `name()` / `symbol()` / `decimals()` | bscscan read | match 024 frozen | MISMATCH → INCIDENT |
| `totalSupply()` | bscscan read | match 024 frozen | MISMATCH → INCIDENT |
| `owner()` | bscscan read | match 024 frozen | unexpected change → INCIDENT |
| Tax config (if Flap exposes) | Flap config read | 0 / disabled | non-zero → INCIDENT |
| Holder count | bscscan | growing organically | sudden coordinated spike → review for wash |
| Top-10 holders | bscscan | distributed | >50% in one address → review |
| LP existence (if any) | DEX UI + bscscan | matches LP plan | less than declared → INCIDENT |
| Trading availability | venue UI | matches plan | not active when planned → INCIDENT |
| Public website CA matches | curl portal | YES | mismatch → INCIDENT |
| Public CA on socials matches | manual | YES | mismatch → INCIDENT |
| Error logs on portal | log aggregator | no 5xx spike | spike → INCIDENT |
| Network health | node RPC | healthy | degraded → 022 escalation |

---

## What is Recorded at Each Checkpoint

```text
T+_____ checkpoint
timestamp UTC            : ____________
reviewer                 : ____________
contract verification    : PASS / FAIL
name / symbol / decimals : values
totalSupply              : value
owner                    : value
tax config               : values
LP state                 : value
trading state            : value
public CA cross-check    : PASS / FAIL
anomalies                : none / list
incident opened          : YES (id) / NO
notes                    : ____________
```

Store recordings outside the repo.

---

## Who Runs the Monitoring

- Maintainer (mandatory for T+0, T+15m, T+1h).
- Maintainer + assistant for T+6h, T+24h.
- Independent observer welcome at T+24h.

---

## Out-of-Scope Monitoring

- Off-chain sentiment / price oracle.
- Speculative trading metrics.
- Holder composition analysis (privacy boundary per 022).
- Insider behavior speculation.

These are not part of the launch health check. They are governance / treasury concerns handled under separate policies.
