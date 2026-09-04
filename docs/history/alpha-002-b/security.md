# Alpha 002-B Security Boundary

**Status:** FROZEN

---

## Protected Asset

### Private Key

The **private key** is the primary security asset protected by Alpha 002-B.

**Properties:**
- Generated locally
- Stored locally (`~/.mood/identity/private.json`)
- Never transmitted
- Never stored in protocol objects
- Never exposed via API

---

## Security Rules (FROZEN)

### Rule 1: Local Only

Private keys **MUST** remain on the local node.

- No network transmission
- No replication
- No cloud storage
- No third-party custody

### Rule 2: Never Transmitted

Private keys **MUST NOT** be sent over any channel.

- No API response
- No CLI output (except by explicit local operation)
- No log entry
- No error message
- No exception detail

### Rule 3: Never Stored in Protocol Objects

Private keys **MUST NOT** appear in:
- Protocol Object envelope
- Object metadata
- Signature payload
- Object storage

Signatures are external to the envelope. Private keys are external to signatures.

---

## Verification

### Security Tests Performed

| Check | Result |
|-------|--------|
| Leakage scan (PRIVATE KEY / SEED / MNEMONIC / API KEY / PASSWORD) | ✓ Clean |
| Public export safety | ✓ Verified |
| Signature verification deterministic | ✓ Verified |
| Private key location audit | ✓ Only in `private.json` |
| API response field audit | ✓ No private fields |
| CLI output field audit | ✓ No private fields |

### Storage Validation

```
private.json:
- File mode: 0600 (Unix) / User-isolated (Windows)
- Location: ~/.mood/identity/
- Access: Local process only
```

```
public.json:
- File mode: standard
- Location: ~/.mood/identity/
- Access: Propagatable
- Contents: nodeId, publicKey, algorithm, createdAt
```

---

## Threats Considered

### Threat 1: Fake Identity

**Vector:** Attacker creates identity claiming to be another node.

**Mitigation:**
- Node ID = `hash(public key)` (ADR-003)
- Verifier checks signature with claimed public key
- Mismatch detected at verification

**Result:** ✓ Mitigated

### Threat 2: Modified Hash

**Vector:** Attacker modifies object after signing.

**Mitigation:**
- Signature is over canonical object digest
- Modified object → different digest → signature mismatch

**Result:** ✓ Mitigated

### Threat 3: Modified Signature

**Vector:** Attacker modifies signature bytes.

**Mitigation:**
- Ed25519 verification detects signature mutation
- Any change invalidates signature

**Result:** ✓ Mitigated

### Threat 4: Key Leakage

**Vector:** Private key exposed through logs, errors, or APIs.

**Mitigation:**
- Package root exports only public API
- Private access only via sub-path
- Output filtering in CLI/API
- Security scan in tests

**Result:** ✓ Mitigated

---

## Security Boundary

```
┌────────────────────────────────────────┐
│         PUBLIC DOMAIN                   │
│                                        │
│  - Node ID                              │
│  - Public Key                           │
│  - Signatures                           │
│  - Verification                         │
│                                        │
└────────────────────────────────────────┘
                    │
                    │ (no leakage)
                    │
┌────────────────────────────────────────┐
│         PRIVATE DOMAIN                  │
│                                        │
│  - Private Key (LOCAL ONLY)             │
│  - Key derivation (LOCAL ONLY)          │
│                                        │
└────────────────────────────────────────┘
```

---

## Out of Scope (Future)

These threats are NOT covered by Alpha 002-B:

| Threat | Future Milestone |
|--------|------------------|
| Key rotation | Open (Future) |
| Key recovery | Open (Future) |
| Multi-device identity | Open (Future) |
| Network-based identity attacks | Alpha 003 |
| Reputation manipulation | Alpha 004 |

---

*Security boundary preserved as protocol history.*
