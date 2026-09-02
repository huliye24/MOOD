# Reputation Rules v0.1

## Overview

Reputation levels represent a contributor's standing in the MOOD Network based on their verified contributions.

## Level Definitions

### Genesis (0-49 points)

**Early contributors and newcomers**

The starting level for all contributors. Represents initial participation and learning.

Requirements:
- 0-49 total reputation points
- At least 1 verified contribution

Benefits:
- Basic network access
- Can submit contributions
- Can view public data

### Builder (50-199 points)

**Active builders of the network**

Contributors who have made consistent, valuable contributions.

Requirements:
- 50-199 total reputation points
- Multiple verified contributions

Benefits:
- All Genesis benefits
- Enhanced visibility
- Priority support

### Core Contributor (200-999 points)

**Key contributors to network development**

Trusted members who have demonstrated significant value to the network.

Requirements:
- 200-999 total reputation points
- Contributions across multiple types

Benefits:
- All Builder benefits
- Recognition as core member
- Influence in discussions

### Guardian (1000+ points)

**Long-term maintainers and leaders**

The most trusted members who have sustained contributions over time.

Requirements:
- 1000+ total reputation points
- Consistent contribution history
- Verified proofs for most contributions

Benefits:
- All Core Contributor benefits
- Guardian recognition
- Network ambassador status

## Level Calculation

```typescript
function calculateLevel(score: number): string {
  if (score >= 1000) return 'Guardian';
  if (score >= 200) return 'Core Contributor';
  if (score >= 50) return 'Builder';
  return 'Genesis';
}
```

## Level Thresholds

| Level | Min Score | Max Score | % of Contributors (est.) |
|-------|-----------|-----------|--------------------------|
| Genesis | 0 | 49 | 60% |
| Builder | 50 | 199 | 25% |
| Core Contributor | 200 | 999 | 12% |
| Guardian | 1000+ | ∞ | 3% |

## Important Notes

### v0.1 Limitations

**Levels are identity only, not governance rights.**

This means:
- ❌ Levels do NOT grant voting power
- ❌ Levels do NOT grant token allocation
- ❌ Levels do NOT grant admin privileges
- ❌ Levels do NOT grant treasury access

### Future Governance

Future versions may integrate levels with:
- Governance voting weight
- Committee membership
- Proposal rights
- Resource allocation

## Reputation Decay (Future)

v0.1 has no decay. Future versions may implement:
- Gradual decay for inactive contributors
- Boost for sustained contributions
- Special events for network milestones
