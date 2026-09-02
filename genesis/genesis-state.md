# MOOD Network Genesis State

## Overview

This document describes the initial state of the MOOD Network at genesis.

## Version

```
MOOD Network v0.1.0
Genesis Phase
```

## Initial Configuration

### Network Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Network ID | TBD | Assigned at deployment |
| Phase | Genesis | Initial network phase |
| Min Contribution Stake | 0 | Minimum stake for contributions |
| Reputation Decay Rate | 0 | Initial decay disabled |
| Governance Quorum | TBD | Set at phase transition |

### Contract State

All protocol contracts start in uninitialized state:

- **Contribution Registry**: Empty
- **Proof Engine**: No proofs registered
- **Reputation Engine**: No reputation scores

## Genesis Contributors

Genesis contributors are documented in `contributors.json`.

## Phase Transition

The network will transition from Genesis Phase to Network Phase upon:

1. Protocol specification completion
2. Smart contract deployment
3. Initial node activation
4. Governance establishment

## References

- Protocol: `../protocol/README.md`
- Architecture: `../docs/MOOD_NETWORK_V01_ARCHITECTURE.md`
