# Alpha 002-B Implementation Record

**Status:** FROZEN
**Commit:** `0af6f83`

---

## Package Structure

### Main Package

```
@Mood/identity
Location: packages/identity/
```

---

## Components

### `identity.js`

**Purpose:** Create and manage node identity

**Key Functions:**
- `createIdentity()` — Generate new identity or adopt existing
- Returns: `{nodeId, publicKey, algorithm, createdAt}`

**Properties:**
- Never replaces existing keys
- Adopts pre-existing private keys
- One node = one stable identity

---

### `key-manager.js`

**Purpose:** Local key handling

**Key Functions:**
- Key generation
- Key storage
- Key loading

**Storage:**
- `~/.mood/identity/private.json` — Private key (node-local, 0600)
- `~/.mood/identity/public.json` — Public identity (propagatable)

**Security:**
- Private key exists ONLY in private.json
- private.json is NEVER transmitted
- private.json is NEVER included in API responses

---

### `signer.js`

**Purpose:** Object hash signing

**Key Functions:**
- `signObjectHash(digest)` — Sign canonical object digest
- Accepts only 256-bit digests
- Rejects non-digest inputs

**Algorithm:** Ed25519 (RFC 8032 deterministic)

**Input:** 32-byte canonical object digest
**Output:** 64-byte signature

---

### `verifier.js`

**Purpose:** Signature verification

**Key Functions:**
- `verifyObjectSignature(signed)` — Predicate verification
- Returns: `{verified: boolean, reason?: string}`
- Never throws exceptions

**Properties:**
- Deterministic verification
- Validates signature format
- Validates hash-signature correspondence
- Detects tampering

---

### `serializer.js`

**Purpose:** Canonical identity serialization

**Key Functions:**
- `exportPublicIdentity()` — Export public identity
- Validates nodeId ↔ publicKey correspondence
- Rejects key substitution on load

---

### `index.js`

**Purpose:** Package root exports

**Exports:** ONLY public API
- No direct private key access from root
- Private key access only via `./key-manager` sub-path

---

## CLI Commands

### `mood identity create`

**Purpose:** Create new identity

**Behavior:**
- Generates Ed25519 keypair
- Writes private.json + public.json
- Outputs public identity only

**Output:** Node ID / publicKey / algorithm / createdAt
**No private key output.**

---

### `mood identity show`

**Purpose:** Show current identity

**Behavior:**
- Reads public.json
- Displays identity information

**Options:**
- `--json` — Output protocol-shaped JSON

---

## API

### `GET /identity`

**Purpose:** Retrieve node identity

**Response:**
```json
{
  "nodeId": "mood:node:<64hex>",
  "publicKey": "<base64>",
  "algorithm": "ed25519",
  "createdAt": "<ISO-8601>",
  "organization": "<name>"
}
```

**Security:**
- Response NEVER contains private key
- Each field tested for absence of private material

---

## Security Rules (FROZEN)

Private keys **never** enter:

1. **Objects** — Signature is external to envelope
2. **Logs** — No private key in any log output
3. **API Responses** — API serves public identity only

These rules are enforced by:
- Package API design (no root private access)
- Output filtering in CLI
- Response construction in API
- Security tests

---

## Test Coverage

| Suite | Tests | Result |
|-------|-------|--------|
| Identity (`@mood/identity`) | 15/15 | PASS |
| Node API (`services/node-api`) | 11/11 | PASS |
| CLI (`apps/mood-cli`) | 19/20 | PASS (1 unrelated) |

---

## Dependencies

- Node.js native `crypto` module (Ed25519)
- Zero external cryptographic libraries

---

## Future Compatibility

Alpha 002-B's signature format is designed for:

- Alpha 002-C: Signed Protocol Objects
- Alpha 003: P2P identity propagation
- Alpha 004: Attribution in state machine

The Ed25519 signature scheme is the **stable reference** for all future identity operations.

---

*Implementation record preserved as protocol history.*
