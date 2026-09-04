# MOOD Architecture Index

**Defines the conceptual layers of MOOD.**

---

## Layer Model

```
Layer 0: Canon (Meaning)
    ↓
Layer 1: Protocol Specification (Rules)
    ↓
Layer 2: Protocol Implementation (Code)
    ↓
Layer 3: Network Runtime (Future)
    ↓
Layer 4: Economy/Governance (Future)
```

---

## Layer 0: Canon

**Purpose:** Define meaning, not mechanism.

**Documents:**
- `MOOD_CANON.md` — Highest authority
- `docs/world/` — World layer documents

**Principle:**
> "In MOOD, documentation does not describe the system after it is built. Documentation defines the world from which the system may be built."

**Rule:** No code may silently redefine the Canon.

---

## Layer 1: Protocol Specification

**Purpose:** Translate stable concepts into formal rules.

**Documents:**
- `docs/protocol/` — Protocol specifications
- `docs/decisions/` — Architecture decision records (ADRs)

**Specifications:**
- `identity-layer.md` — Who created the object
- `identity-cryptography.md` — Cryptographic design
- `contribution-proof.md` — Hash verification
- `protocol-object.md` — Object structure

**Rule:** Specification before implementation.

---

## Layer 2: Protocol Implementation

**Purpose:** Execute the defined rules.

**Packages:**
| Package | Purpose | Status | Authority |
|---------|---------|--------|-----------|
| `packages/protocol-object/` | Object envelope, serialization, validation | FROZEN | ADR-001 |
| `packages/contribution-proof/` | Hash engine, canonicalization | FROZEN | ADR-001 |
| `packages/identity/` | Key management, signing, verification | **FROZEN** | **ADR-005** |

**Identity Runtime Layer (Alpha 002-B):**
The identity runtime is the second implementation layer added to MOOD.
It provides:
- Identity derivation (`hash(public key)` → Node ID)
- Key lifecycle management
- Ed25519 signing
- Signature verification

Frozen as immutable protocol history (ADR-005). Future identity concerns (key rotation, recovery, multi-device) must be designed as new alpha versions, not modifications.

**Rule:** Code has no automatic authority over specification.

---

## Layer 3: Network Runtime (Future)

**Purpose:** Multiple nodes communicating.

**Alpha:** 003 — Synchronization

**Status:** Not designed

**Components:**
- P2P networking
- Object propagation
- State synchronization

---

## Layer 4: Economy/Governance (Future)

**Purpose:** Incentives, rewards, collective decisions.

**Alpha:** Beyond 004

**Status:** Not designed

**Topics:**
- Token design
- Staking
- Treasury
- Governance voting

---

## Directory Structure Mapping

```
MOOD/
├── .ai/                    # AI Navigation Layer (this layer)
├── MOOD_CANON.md           # Layer 0: Canon
├── docs/
│   ├── decisions/          # Layer 1: Specifications
│   ├── protocol/           # Layer 1: Specifications
│   └── history/            # Layer 1: Historical specs
├── packages/
│   ├── protocol-object/    # Layer 2: Implementation
│   ├── contribution-proof/ # Layer 2: Implementation
│   └── identity/          # Layer 2: Implementation
└── services/               # Layer 3: Runtime (partial)
```

---

## Layer Transition Rules

### Rule 1: Downstream Only

Higher layers define meaning. Lower layers implement mechanism.

```
Canon → Specification → Implementation → Network
```

No lower layer may redefine a higher layer.

### Rule 2: Specification First

Before implementation:
1. Define in specification
2. Get ADR approval if significant
3. Then implement

### Rule 3: Frozen Surface

Once frozen, a layer's surface cannot change without ADR.

---

## Cross-Layer Concerns

### Key Management
- Layer 0: Define need for identity
- Layer 1: Define key model
- Layer 2: Implement key operations
- Layer 3: Handle key distribution

### Verification
- Layer 0: Define what verification means
- Layer 1: Define verification rules
- Layer 2: Implement verification code
- Layer 3: Network verification protocol

---

## Important Distinctions

### Protocol vs Application
- **Protocol:** Layer 1-2, shared rules
- **Application:** Layer 3-4, specific implementations

### Spec vs Implementation
- **Specification:** Authoritative definition
- **Implementation:** Executable approximation

### Active vs Legacy
- **Active:** Currently part of the protocol
- **Legacy:** Historical, not current authority

---

## Legacy Architecture (Not Current)

The following are **LEGACY** — do not confuse with current protocol:

| Directory | Legacy Purpose |
|-----------|---------------|
| `proof-engine/` | Tier-B simulated verifier |
| `reputation-engine/` | v0.1 reputation |
| `contracts/` | Historical/migration |

These exist as historical context but are **not authoritative**.
