# @mood/identity

MOOD Protocol Identity Alpha 002-B — the cryptographic identity runtime.

**Alpha 001 defines what the object is. Alpha 002 defines who created it.**

`@mood/identity` gives a MOOD node its own cryptographic identity: an
Ed25519 keypair with a node-local private key, a propagatable public
identity, and a signature engine that signs **256-bit canonical object
digests** — the same digest an Alpha 001 object ID is derived from.

It sits above the frozen object layer (`@mood/protocol-object`) and adds
no hash engine of its own: canonicalization and SHA-256 come from
`@mood/contribution-proof`, so the protocol keeps exactly one hash
engine.

## Surface

```js
import {
  createIdentity,        // adopt-or-generate this node's identity
  loadPublicIdentity,    // read ~/.mood/identity/public.json
  exportPublicIdentity,  // { nodeId, publicKey, algorithm, createdAt }
  signObjectHash,        // sign a 256-bit object digest
  verifyObjectSignature, // verify such a signature (predicate)
  contentDigest,         // 'sha256:<64hex>' — the shared hash engine
  deriveNodeId,          // the deployed mood:node:<64hex> formula
} from '@mood/identity';
```

## Usage

```js
// One node, one key. Never rekeys by accident:
//  - public.json exists            → refuses
//  - private.json exists (mood init) → adopts the same key, same node ID
//  - nothing exists                → generates fresh, writes both records
const { status, identity } = createIdentity();          // 'created' | 'adopted'

const exported = exportPublicIdentity(identity);
// { nodeId, publicKey, algorithm, createdAt } — safe to propagate

// Sign an object's content digest (all 64 hex chars — never the
// truncated 24-hex object ID, never a database record):
const digest = contentDigest(objectContent(someObject));
const signature = signObjectHash(digest, privateKeyFromLocalStorage);

// Any node verifies with the public identity alone — no issuer contact:
verifyObjectSignature(digest, signature, identity.publicKey); // true
```

## Storage

```
~/.mood/identity/
  public.json    propagatable — { nodeId, publicKey, algorithm, networkId, createdAt, identityVersion }
  private.json   node-local   — mode 0600 where supported; read by the local
                                signing process only; never returned by any API
```

`MOOD_HOME` overrides the root directory, mirroring the object layer.

## Formats

| Value | Format |
|---|---|
| algorithm | `ed25519` (Node native crypto, RFC 8032, deterministic) |
| publicKey | base64, raw 32 bytes |
| privateKey | base64, 64 bytes: seed ‖ publicKey (compatible with every MOOD client since alpha) |
| nodeId | `mood:node:<64 hex>` = `sha256('1\|' + networkId + '\|' + publicKey)` — the deployed derivation, so adoption preserves node IDs |
| signature | base64, 64 bytes, over the 32 digest bytes |
| object hash | `'sha256:<64hex>'` or bare 64-hex; anything else is rejected before signing |

The algorithm decision and its trade-offs are recorded in
[ADR-004](../../docs/decisions/ADR-004-identity-algorithm-selection.md).

## Security model

- The private key exists only in `~/.mood/identity/private.json`.
  It never appears in a protocol object, an API response, a CLI
  output, or a log.
- `signObjectHash` accepts a 256-bit digest only — the API cannot be
  repurposed to sign arbitrary data.
- Verification is a predicate: malformed input is `false`, never a
  throw, never a crash.
- Absence of a signature is not an error — unsigned Alpha 001 objects
  stay valid forever (two-mode verification).

## Tests

```bash
npm test
```

License: AGPL-3.0 — MOOD Project.
