# Alpha 001 Implementation Record

**Status:** frozen — this records what shipped in Alpha 001, not what
ships next.

## Packages

### `@mood/contribution-proof` — `packages/contribution-proof`

Role: proof generation and verification.

- `createProof` — proof generation
- `validateProof` / `validateProofShape` — proof validation
- `canonicalize` / `sha256OfValue` — deterministic hashing; the single
  hash engine of the protocol

### `@mood/protocol-object` — `packages/protocol-object`

Role: object creation, hashing, validation, storage.

- content-addressed envelope — `object:mood:<24 hex>`, the ID derived
  from the object's own canonical content
- `validateProtocolObject` — integrity + schema validation
- `verifyObjectLinkage` — cross-check against the referenced proof
- `~/.mood/objects/` — node-local object storage: files are the truth,
  the index a derived cache

### `apps/mood-cli` — `@mood/cli`

Role: user interaction layer.

- `mood object create` · `mood object list` · `mood object verify`

### `services/node-api` — `@mood/node-api`

Role: network access interface.

- `GET /objects` · `GET /objects/:id` · `POST /objects/verify`

## Architecture rule

The object layer does not duplicate proof hashing logic. All hashing
and canonicalization live in `@mood/contribution-proof`;
`@mood/protocol-object` imports `canonicalize` / `sha256OfValue` and
defines no hash of its own — one-way dependency, duplication-free.
